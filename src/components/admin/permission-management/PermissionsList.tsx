"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { Key, Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { CreatePermissionModal } from "./CreatePermissionModal";
import { EditPermissionModal } from "./EditPermissionModal";

export const PermissionsList: React.FC = () => {
  const { permissions, loading, error, fetchPermissions, deletePermission } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState<{ id: number; title: string } | null>(null);

  const filteredPermissions = useMemo(() => {
    return permissions.filter((perm) =>
      perm.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [permissions, searchQuery]);

  const handleDelete = async (id: number) => {
    if (confirm("Энэ зөвшөөрлийг устгахдаа итгэлтэй байна уу?")) {
      try {
        await deletePermission(id);
        toast.success("Зөвшөөрөл амжилттай устгагдлаа");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Алдаа гарлаа");
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-16 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-800 font-medium">Алдаа: {error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchPermissions}>
          Дахин оролдох
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Зөвшөөрлүүд</h2>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Шинэ зөвшөөрөл нэмэх
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-sm transition-all">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Зөвшөөрөл хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredPermissions.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            Зөвшөөрөл олдсонгүй
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredPermissions.map((permission) => (
              <div
                key={permission.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{permission.title}</div>
                    <div className="text-xs text-slate-500">ID: {permission.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setEditingPermission(permission)}
                    title="Засварлах"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDelete(permission.id)}
                    title="Устгах"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreatePermissionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchPermissions();
          }}
        />
      )}

      {editingPermission && (
        <EditPermissionModal
          permission={editingPermission}
          onClose={() => setEditingPermission(null)}
          onSuccess={() => {
            setEditingPermission(null);
            fetchPermissions();
          }}
        />
      )}
    </div>
  );
};

