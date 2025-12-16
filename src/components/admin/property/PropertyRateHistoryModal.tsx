"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Calendar, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAnnualRates } from "@/lib/api";
import { Property } from "./types";

interface PropertyRateHistoryModalProps {
  property: Property | null;
  onClose: () => void;
  onApprove?: (propertyId: number, rateId: number) => Promise<void>;
  onReject?: (propertyId: number, rateId: number) => Promise<void>;
}

interface RateHistoryItem {
  id: number;
  year?: number;
  rate?: number;
  fee?: number;
  start_date?: string;
  end_date?: string;
  status_id?: number;
  status?: {
    id?: number | string;
    name?: string;
    description?: string;
    style?: string;
  } | null;
  created_at?: string;
  updated_at?: string;
  approved_by_id?: number;
}

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

export const PropertyRateHistoryModal: React.FC<PropertyRateHistoryModalProps> = ({
  property,
  onClose,
  onApprove,
  onReject,
}) => {
  const [rates, setRates] = useState<RateHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (property?.id) {
      fetchRateHistory();
    }
  }, [property?.id]);

  const fetchRateHistory = async () => {
    if (!property?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await getAnnualRates(property.id, null);
      
      if (response.status === 404) {
        setRates([]);
        return;
      }
      
      if (response.error) {
        if (response.status !== 404) {
          setError(response.error);
        }
        setRates([]);
      } else if (response.data) {
        const responseData = response.data as any;
        const ratesArray = responseData.data || (Array.isArray(responseData) ? responseData : []);
        
        // Filter to ensure only rates for this specific property are shown
        const propertyRates = Array.isArray(ratesArray) 
          ? ratesArray.filter((rate: any) => rate.property_id === property.id)
          : [];
        
        // Sort by year descending (newest first), then by created_at
        const sortedRates = propertyRates.sort((a: any, b: any) => {
              const yearDiff = (b.year || 0) - (a.year || 0);
              if (yearDiff !== 0) return yearDiff;
              const dateA = new Date(a.created_at || 0).getTime();
              const dateB = new Date(b.created_at || 0).getTime();
              return dateB - dateA;
        });
        
        setRates(sortedRates);
      } else {
        setRates([]);
      }
    } catch (err) {
      const error = err as any;
      if (error?.status !== 404) {
        setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      }
      setRates([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("mn-MN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (!amount && amount !== 0) return "-";
    return `${amount.toLocaleString()}₮`;
  };

  const getStatusBadge = (statusId?: number) => {
    if (!statusId) return null;
    
    // Status 29 is approved
    if (statusId === 29) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
          <CheckCircle className="h-3 w-3" />
          Баталгаажсан
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
        <Clock className="h-3 w-3" />
        Хүлээгдэж буй
      </span>
    );
  };

  const handleApprove = async (rateId: number) => {
    if (!property?.id || !rateId || rateId === 0) {
      toast.error("Үнэлгээний ID олдсонгүй");
      return;
    }

    if (processingIds.has(rateId)) return;
    
    setProcessingIds((prev) => new Set(prev).add(rateId));
    
    try {
      if (onApprove) {
        await onApprove(property.id, rateId);
        toast.success("Үнэлгээ амжилттай баталгаажлаа");
      }
      // Refresh rates after approval
      await fetchRateHistory();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Баталгаажуулахад алдаа гарлаа";
      toast.error(errorMsg);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(rateId);
        return newSet;
      });
    }
  };

  const handleReject = async (rateId: number) => {
    if (!property?.id || !rateId || rateId === 0) {
      toast.error("Үнэлгээний ID олдсонгүй");
      return;
    }

    if (processingIds.has(rateId)) return;
    
    // Confirm rejection
    const confirmed = window.confirm("Та энэ үнэлгээг татгалзахдаа итгэлтэй байна уу?");
    if (!confirmed) return;
    
    setProcessingIds((prev) => new Set(prev).add(rateId));
    
    try {
      if (onReject) {
        await onReject(property.id, rateId);
        toast.success("Үнэлгээ амжилттай татгалзлаа");
      }
      // Refresh rates after rejection
      await fetchRateHistory();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Татгалзахад алдаа гарлаа";
      toast.error(errorMsg);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(rateId);
        return newSet;
      });
    }
  };

  if (!property) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Үнэлгээний түүх - Талбай #{property.number || property.id}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {property.name || "Талбайн үнэлгээний бүх түүх"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Хаах"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="flex items-center justify-center h-[100%] rounded-lg  p-4 mb-4">
              <p className="text-xl text-gray-400">{error}</p>
            </div>
          )}


          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-sm text-slate-500">Үнэлгээний түүх татаж байна...</p>
              </div>
            </div>
          ) : rates.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-sm text-slate-500">Үнэлгээний түүх олдсонгүй</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rates.map((rate, index) => (
                <div
                  key={rate.id || index}
                  className={`border rounded-lg p-5 transition-all hover:shadow-md ${
                    index === 0 ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-blue-100' : 'bg-slate-100'
                      }`}>
                        <Calendar className={`h-6 w-6 ${
                          index === 0 ? 'text-blue-600' : 'text-slate-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {rate.year || "-"} он
                        </h3>
                        {index === 0 && (
                          <p className="text-xs text-blue-600 mt-1">Сүүлийн үнэлгээ</p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(rate.status_id)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase block mb-1">
                        Үнэ
                      </label>
                      <p className="text-base font-semibold text-slate-900">
                        {formatCurrency(rate.rate)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase block mb-1">
                        Төлбөр
                      </label>
                      <p className="text-base font-semibold text-green-600">
                        {formatCurrency(rate.fee)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase block mb-1">
                        Эхлэх огноо
                      </label>
                      <p className="text-sm text-slate-900">
                        {formatDate(rate.start_date)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase block mb-1">
                        Дуусах огноо
                      </label>
                      <p className="text-sm text-slate-900">
                        {formatDate(rate.end_date)}
                      </p>
                    </div>
                  </div>

                  {(rate.created_at || rate.updated_at) && (
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        {rate.created_at && (
                          <div>
                            <span className="font-medium">Үүсгэсэн:</span> {formatDate(rate.created_at)}
                          </div>
                        )}
                        {rate.updated_at && rate.updated_at !== rate.created_at && (
                          <div>
                            <span className="font-medium">Шинэчлэгдсэн:</span> {formatDate(rate.updated_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action buttons for pending rates */}
                  {(() => {
                    const rawCode = rate.status_id ?? rate.status?.id;
                    const code = typeof rawCode === "string" ? parseInt(rawCode, 10) : rawCode;
                    const key = getStatusKey(rate.status);
                    const approved = code === 29 || key === "approved" || key === "active";
                    const terminal = key === "expired" || key === "cancelled";
                    return !approved && !terminal && onApprove && onReject;
                  })() && (
                    <div className="pt-4 border-t border-slate-200 mt-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          onClick={() => handleApprove(rate.id)}
                          disabled={processingIds.has(rate.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Баталгаажуулах
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          onClick={() => handleReject(rate.id)}
                          disabled={processingIds.has(rate.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Татгалзах
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-end">
          <Button variant="outline" onClick={onClose}>
            Хаах
          </Button>
        </div>
      </div>
    </div>
  );
};

