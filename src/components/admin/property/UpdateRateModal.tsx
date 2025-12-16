"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Property } from "./types";
import { approveAnnualRate } from "@/lib/api";

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
  const [approving, setApproving] = useState(false);

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
    } finally {
      setUpdating(false);
    }
  };

  const handleApprove = async () => {
    if (!property?.rate?.id) {
      toast.error("Үнэлгээний ID олдсонгүй");
      return;
    }

    setApproving(true);
    try {
      const response = await approveAnnualRate(property.id, property.rate.id);
      if (response.error) {
        toast.error(response.error || "Баталгаажуулахад алдаа гарлаа");
      } else {
        toast.success("Үнэлгээ амжилттай баталгаажлаа");
        onSuccess();
        setTimeout(() => {
          onClose();
        }, 100);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Баталгаажуулахад алдаа гарлаа";
      toast.error(errorMsg);
    } finally {
      setApproving(false);
    }
  };

  const getStatusCode = (statusId?: number | string | null) => {
    if (statusId === null || statusId === undefined) return null;
    return typeof statusId === "string" ? parseInt(statusId, 10) : statusId;
  };

  const getStatusKey = (status?: any) => {
    const rawKey = (status?.key || "").toString().toLowerCase();
    if (rawKey) return rawKey;
    const text = (status?.label || status?.name || status?.description || "").toString().toLowerCase();
    if (text.includes("ноорог")) return "draft";
    if (text.includes("хүлээгдэж")) return "pending";
    if (text.includes("батлагдсан")) return "approved";
    if (text.includes("ашиглагдаж")) return "active";
    if (text.includes("дууссан")) return "expired";
    if (text.includes("цуцлагд")) return "cancelled";
    return "";
  };

  const isApproved = (statusId?: number | string | null, status?: any) => {
    const code = getStatusCode(statusId);
    if (code === 29) return true;
    const key = getStatusKey(status);
    return key === "approved" || key === "active";
  };
  // Check if rate is pending (not approved)
  // Button should only show for pending rates (status_id !== 29)
  // Approved rates (status_id === 29) should not show the approve button
  const isRatePending = (() =>
    !isApproved(property?.rate?.status_id, (property as any)?.rate?.status)
  )();

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
                Менежментийн төлбөр (₮)
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
              disabled={updating || approving}
            >
              Цуцлах
            </Button>
            {isRatePending && property.rate?.id && (
              <Button
                type="button"
                variant="outline"
                onClick={handleApprove}
                disabled={updating || approving}
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {approving ? "Баталгаажуулж байна..." : "Баталгаажуулах"}
              </Button>
            )}
            <Button type="submit" disabled={updating || approving}>
              {updating ? "Илгээж байна..." : "Хүсэлт илгээх"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

