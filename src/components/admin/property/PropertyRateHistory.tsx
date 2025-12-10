"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { DollarSign, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getAnnualRates, approveAnnualRate,  } from "@/lib/api";
import { Property } from "./types";
import { getProperties } from "@/lib/api";

interface RateHistoryItem {
  id: number;
  property_id: number;
  property?: Property | null;
  year?: number;
  rate?: number;
  fee?: number;
  start_date?: string;
  end_date?: string;
  status_id?: number;
  status?: {
    id: number;
    name?: string;
    style?: string;
    description?: string;
  } | null;
  created_at?: string;
  updated_at?: string;
  approved_by_id?: number | null;
  approved_by?: any;
}

export const PropertyRateHistory: React.FC = () => {
  const [rates, setRates] = useState<RateHistoryItem[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const perPage = 50; // Match backend default per_page

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all properties
      const propertiesResponse = await getProperties(1, 1000, null, null, null, "created_at", "asc");
      if (propertiesResponse.error) {
        throw new Error(propertiesResponse.error);
      }
      
      let propertiesData: Property[] = [];
      if (propertiesResponse.data) {
        const responseData = propertiesResponse.data as any;
        if (responseData.data && Array.isArray(responseData.data)) {
          propertiesData = responseData.data;
        } else if (Array.isArray(responseData)) {
          propertiesData = responseData;
        }
      }
      setProperties(propertiesData);

      // Fetch annual rates with pagination
      const ratesResponse = await getAnnualRates(null, null, currentPage, perPage);
      if (ratesResponse.error && ratesResponse.status !== 404) {
        throw new Error(ratesResponse.error);
      }
      
      let ratesData: RateHistoryItem[] = [];
      let paginationInfo: any = {};
      
      if (ratesResponse.data) {
        const responseData = ratesResponse.data as any;
        
        
        // Check response structure - backend returns { data: [...], meta: {...} }
        if (responseData.data && Array.isArray(responseData.data)) {
          // Structure: { data: [...], meta: {...} }
          ratesData = responseData.data;
          paginationInfo = responseData.meta || {};
        } else if (Array.isArray(responseData)) {
          // Structure: { data: [...] } - no pagination
          ratesData = responseData;
        }
      }

      // Map properties to rates - use property from API response if available
      const ratesWithProperties = ratesData.map((rate: any) => {
        // Use property from API response if available, otherwise find from propertiesData
        const property = rate.property || propertiesData.find((p) => p.id === rate.property_id);
        return {
          ...rate,
          property,
        };
      });

      // Backend already sorts the data, but we can sort by created_at descending as fallback
      const sortedRates = ratesWithProperties.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      setRates(sortedRates);
      
      // Set pagination info from meta
      if (paginationInfo.last_page !== undefined && paginationInfo.last_page !== null) {
        setTotalPages(paginationInfo.last_page);
      } else if (paginationInfo.total_pages !== undefined && paginationInfo.total_pages !== null) {
        setTotalPages(paginationInfo.total_pages);
      } else if (paginationInfo.total !== undefined && paginationInfo.total !== null && paginationInfo.per_page !== undefined) {
        const total = paginationInfo.total;
        const perPageValue = paginationInfo.per_page || perPage;
        setTotalPages(Math.ceil(total / perPageValue));
      } else {
        // If no pagination info, assume single page
        setTotalPages(1);
      }
      
      // Set total items
      if (paginationInfo.total !== undefined && paginationInfo.total !== null) {
        setTotalItems(paginationInfo.total);
      } else {
        setTotalItems(sortedRates.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRate = async (propertyId: number, rateId: number) => {
    if (!rateId || rateId === 0) {
      toast.error("Үнэлгээний ID буруу байна");
      return;
    }
    
    if (processingIds.has(rateId)) return;
    
    setProcessingIds((prev) => new Set(prev).add(rateId));
    
    try {
      const response = await approveAnnualRate(propertyId, rateId);
      if (response.error) {
        throw new Error(response.error || "Баталгаажуулахад алдаа гарлаа");
      }
      // Refresh data after approval
      await fetchData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Баталгаажуулахад алдаа гарлаа";
      toast.error(errorMsg);
      throw err;
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(rateId);
        return newSet;
      });
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (!amount && amount !== 0) return "-";
    return `${amount.toLocaleString()}₮`;
  };

  const getStatusBadge = (statusId?: number, status?: any) => {
    // Use status object from API if available
    if (status && status.description) {
      const statusStyle = status.style || '';
      // Parse style classes from backend (e.g., "bg-success text-white")
      let bgColor = 'bg-slate-100';
      let textColor = 'text-slate-700';
      
      if (statusStyle.includes('bg-success')) {
        bgColor = 'bg-green-100';
        textColor = 'text-green-700';
      } else if (statusStyle.includes('bg-warning')) {
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-700';
      }
      
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${bgColor} ${textColor} rounded-full`}>
          {statusId === 29 ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {status.description}
        </span>
      );
    }
    
    // Fallback to status_id check
    if (!statusId) return null;
    
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

  // No filtering, just show all rates (already paginated from API)
  const filteredRates = rates;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-sm text-slate-500">Үнэлгээний түүх татаж байна...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[100%] rounded-lg  p-4">
        <p className="text-xl text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Үнэлгээний түүх</h1>
        </div>
      </div>


      {/* Rates List */}
      {filteredRates.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-sm text-slate-500">Үнэлгээний түүх олдсонгүй</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl  border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                    Талбай
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                    Он
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                    Үнэ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                    Төлбөр
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                    Төлөв
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm font-medium text-slate-900">
                          {rate.property?.number || `Талбай #${rate.property_id}`}
                        </span>
                        {rate.property?.name && (
                          <p className="text-xs text-slate-500">{rate.property.name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{rate.year || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(rate.rate)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(rate.fee)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(rate.status_id, rate.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {rate.status_id && rate.status_id !== 29 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 text-xs"
                            onClick={() => handleApproveRate(rate.property_id, rate.id)}
                            disabled={processingIds.has(rate.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Баталгаажуулах
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              loading={loading}
            />
          )}
        </div>
      )}

    </div>
  );
};
