"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Property } from "./types";

interface UpdateRateModalProps {
  property: Property | null;
  onClose: () => void;
  onSuccess: () => void;
  onUpdateRate: (propertyId: number, rateData: RateData) => Promise<void>;
}

interface RateData {
  year: number;
  rate: number;
  fee: number;
  start_date: string;
  end_date: string;
}

export const UpdateRateModal: React.FC<UpdateRateModalProps> = ({
  property,
  onClose,
  onSuccess,
  onUpdateRate,
}) => {
  const [formData, setFormData] = useState<RateData>({
    year: new Date().getFullYear(),
    rate: 0,
    fee: 0,
    start_date: "",
    end_date: "",
  });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (property?.rate) {
      setFormData({
        year: property.rate.year || new Date().getFullYear(),
        rate: property.rate.rate || 0,
        fee: property.rate.fee || 0,
        start_date: property.rate.start_date
          ? property.rate.start_date.split(" ")[0]
          : "",
        end_date: property.rate.end_date
          ? property.rate.end_date.split(" ")[0]
          : "",
      });
    } else {
      // Default values for new rate
      const currentYear = new Date().getFullYear();
      setFormData({
        year: currentYear,
        rate: 0,
        fee: 0,
        start_date: `${currentYear}-01-01`,
        end_date: `${currentYear}-12-31`,
      });
    }
  }, [property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!property) return;

    if (!formData.rate || formData.rate <= 0) {
      setError("Үнэ оруулна уу");
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      setError("Эхлэх болон дуусах огноо оруулна уу");
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError("Эхлэх огноо дуусах огнооноос хойш байх ёсгүй");
      return;
    }

    setUpdating(true);
    try {
      // Ensure all required fields are properly formatted
      const rateDataToSend = {
        year: formData.year,
        rate: Number(formData.rate),
        fee: Number(formData.fee),
        start_date: formData.start_date,
        end_date: formData.end_date,
      };
      
      await onUpdateRate(property.id, rateDataToSend);
      toast.success("Үнэлгээ амжилттай шинэчлэгдлээ");
      // Call onSuccess before closing to ensure data is refreshed
      onSuccess();
      // Small delay to ensure the refresh happens before closing
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Алдаа гарлаа";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Rate request creation error:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (!property) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            Үнэлгээний хүсэлт илгээх - Талбай #{property.number || property.id}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Хаах"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Он
              </label>
              <Input
                type="number"
                value={formData.year || ""}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) || 0 })
                }
                className="w-full"
                placeholder="Жишээ: 2025"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Үнэ (₮)
              </label>
              <Input
                type="number"
                value={formData.rate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rate: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full"
                placeholder="Жишээ: 600000"
                required
                min="0"
                step="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Төлбөр (₮)
              </label>
              <Input
                type="number"
                value={formData.fee || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fee: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full"
                placeholder="Жишээ: 120000"
                required
                min="0"
                step="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Эхлэх огноо
              </label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Дуусах огноо
              </label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className="w-full"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updating}
            >
              Цуцлах
            </Button>
            <Button type="submit" disabled={updating}>
              {updating ? "Илгээж байна..." : "Хүсэлт илгээх"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

