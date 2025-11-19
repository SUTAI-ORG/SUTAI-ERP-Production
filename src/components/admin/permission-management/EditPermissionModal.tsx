"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updatePermission } from "@/lib/api";

interface EditPermissionModalProps {
  permission: { id: number; title: string };
  onClose: () => void;
  onSuccess: () => void;
}

export const EditPermissionModal: React.FC<EditPermissionModalProps> = ({
  permission,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState(permission.title);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setTitle(permission.title);
  }, [permission]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Зөвшөөрлийн нэрийг оруулна уу");
      return;
    }
    setUpdating(true);
    try {
      await updatePermission(permission.id, { title });
      toast.success("Зөвшөөрөл амжилттай шинэчлэгдлээ");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] w-full max-w-md mx-4 bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Зөвшөөрөл засах</h2>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="edit-permission-title" className="block text-sm font-medium text-slate-700 mb-2">
              Зөвшөөрлийн нэр <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-permission-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Жишээ: Хэрэглэгч үзэх, Гэрээ нэмэх..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={updating}>
            Цуцлах
          </Button>
          <Button onClick={handleSubmit} disabled={updating || !title.trim()}>
            {updating ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </div>
    </div>
  );
};

