"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createProperty } from "@/lib/api";
import { CreatePropertyForm } from "./CreatePropertyForm";

interface CreatePropertyModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePropertyModal: React.FC<CreatePropertyModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    number: "",
    x: null as number | null,
    y: null as number | null,
    length: null as number | null,
    width: null as number | null,
    block_id: null as number | null,
    type_id: null as number | null,
    product_type_id: null as number | null,
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormDataChange = (data: {
    number?: string;
    x?: number | null;
    y?: number | null;
    length?: number | null;
    width?: number | null;
    block_id?: number | null;
    type_id?: number | null;
    product_type_id?: number | null;
  }) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleSubmit = async () => {
    // Validate that number is provided
    if (!formData.number?.trim()) {
      setError("Талбайн дугаарыг оруулна уу");
      return;
    }

    setError(null);
    setCreating(true);
    try {
      const propertyData: {
        number?: string;
        x?: number | null;
        y?: number | null;
        length?: number | null;
        width?: number | null;
        block_id?: number | null;
        type_id?: number | null;
        product_type_id?: number | null;
      } = {};

      if (formData.number?.trim()) {
        propertyData.number = formData.number.trim();
      }
      if (formData.x !== null && formData.x !== undefined) {
        propertyData.x = formData.x;
      } else {
        propertyData.x = null;
      }
      if (formData.y !== null && formData.y !== undefined) {
        propertyData.y = formData.y;
      } else {
        propertyData.y = null;
      }
      if (formData.length !== null && formData.length !== undefined) {
        propertyData.length = formData.length;
      } else {
        propertyData.length = null;
      }
      if (formData.width !== null && formData.width !== undefined) {
        propertyData.width = formData.width;
      } else {
        propertyData.width = null;
      }
      if (formData.block_id !== null && formData.block_id !== undefined) {
        propertyData.block_id = formData.block_id;
      } else {
        propertyData.block_id = null;
      }
      if (formData.type_id !== null && formData.type_id !== undefined) {
        propertyData.type_id = formData.type_id;
      } else {
        propertyData.type_id = null;
      }
      if (formData.product_type_id !== null && formData.product_type_id !== undefined) {
        propertyData.product_type_id = formData.product_type_id;
      } else {
        propertyData.product_type_id = null;
      }

      const response = await createProperty(propertyData);
      if (response.error) {
        setError(response.error || response.message || "Алдаа гарлаа");
        toast.error(response.error || response.message || "Алдаа гарлаа");
      } else {
        toast.success("Талбай амжилттай үүсгэгдлээ");
        onSuccess();
        onClose();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Алдаа гарлаа";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const isFormValid = formData.number?.trim();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] w-full max-w-4xl mx-4 bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Шинэ талбай нэмэх</h2>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <CreatePropertyForm formData={formData} onFormDataChange={handleFormDataChange} />
        
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={creating}>
            Цуцлах
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={creating || !isFormValid}
          >
            {creating ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </div>
    </div>
  );
};

