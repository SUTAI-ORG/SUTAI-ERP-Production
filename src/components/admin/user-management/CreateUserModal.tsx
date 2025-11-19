"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createUser } from "@/lib/api";
import { CreateUserForm } from "./CreateUserForm";

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role_ids: [] as number[],
  });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Нэрийг оруулна уу");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Имэйл оруулна уу");
      return;
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      toast.error("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
      return;
    }
    if (formData.role_ids.length === 0) {
      toast.error("Хамгийн багадаа нэг эрх сонгоно уу");
      return;
    }
    setCreating(true);
    try {
      const userData: {
        name: string;
        email: string;
        password: string;
        phone?: string;
        roles: number[];
      } = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        roles: formData.role_ids,
      };
      
      if (formData.phone.trim()) {
        userData.phone = formData.phone.trim();
      }
      
      const response = await createUser(userData);
      if (response.error) {
        toast.error(response.error || "Алдаа гарлаа");
      } else {
        toast.success("Хэрэглэгч амжилттай үүсгэгдлээ");
        onSuccess();
      }
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
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Шинэ хэрэглэгч нэмэх</h2>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <CreateUserForm formData={formData} onFormDataChange={setFormData} />
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={creating}>
            Цуцлах
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={creating || !formData.name.trim() || !formData.email.trim() || !formData.password.trim() || formData.role_ids.length === 0}
          >
            {creating ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </div>
    </div>
  );
};

