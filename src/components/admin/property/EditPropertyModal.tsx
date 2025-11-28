"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateProperty } from "@/lib/api";
import { CreatePropertyForm } from "./CreatePropertyForm";
import { Property } from "./types";

interface EditPropertyModalProps {
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  property,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    number: property.number || "",
    x: property.x ?? null,
    y: property.y ?? null,
    length: property.length ?? null,
    width: property.width ?? null,
    block_id: property.block_id ?? null,
    type_id: property.type_id ?? null,
    product_type_id: property.product_type_id ?? null,
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Update form data when property changes
    setFormData({
      number: property.number || "",
      x: property.x ?? null,
      y: property.y ?? null,
      length: property.length ?? null,
      width: property.width ?? null,
      block_id: property.block_id ?? null,
      type_id: property.type_id ?? null,
      product_type_id: property.product_type_id ?? null,
    });
  }, [property]);

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
      toast.error("Талбайн дугаарыг оруулна уу");
      return;
    }

    setUpdating(true);
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

      const response = await updateProperty(property.id, propertyData);
      if (response.error) {
        toast.error(response.error || response.message || "Алдаа гарлаа");
      } else {
        toast.success("Талбай амжилттай шинэчлэгдлээ");
        onSuccess();
        onClose();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Алдаа гарлаа";
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const isFormValid = formData.number?.trim();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] w-full max-w-4xl mx-4 bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Талбай засах</h2>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <CreatePropertyForm formData={formData} onFormDataChange={handleFormDataChange} />
        
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={updating}>
            Цуцлах
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updating || !isFormValid}
          >
            {updating ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </div>
    </div>
  );
};

