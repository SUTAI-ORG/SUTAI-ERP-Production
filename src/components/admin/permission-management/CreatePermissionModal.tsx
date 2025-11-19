"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPermission } from "@/lib/api";

interface CreatePermissionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePermissionModal: React.FC<CreatePermissionModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Зөвшөөрлийн нэрийг оруулна уу");
      return;
    }
    setCreating(true);
    try {
      await createPermission({ title });
      toast.success("Зөвшөөрөл амжилттай үүсгэгдлээ");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] w-full max-w-md mx-4 bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Шинэ зөвшөөрөл нэмэх</h2>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="permission-title" className="block text-sm font-medium text-slate-700 mb-2">
              Зөвшөөрлийн нэр <span className="text-red-500">*</span>
            </label>
            <input
              id="permission-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Жишээ: Хэрэглэгч үзэх, Гэрээ нэмэх..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={creating}>
            Цуцлах
          </Button>
          <Button onClick={handleSubmit} disabled={creating || !title.trim()}>
            {creating ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </div>
    </div>
  );
};

