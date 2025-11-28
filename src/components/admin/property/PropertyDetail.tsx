"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Star, MapPin, Building, User, Calendar, DollarSign, Package, Tag, FileText, Edit, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProperty, getAnnualRates } from "@/lib/api";
import { Property } from "./types";
import { PropertyRateHistoryModal } from "./PropertyRateHistoryModal";
import { EditPropertyModal } from "./EditPropertyModal";

interface PropertyDetailProps {
  propertyId: number;
  property?: Property | null;
  onBack: () => void;
  onRateClick?: (property: Property) => void;
  onRateSuccess?: () => void;
  onEdit?: (property: Property) => void;
  onApproveRate?: (propertyId: number, rateId: number) => Promise<void>;
  onRejectRate?: (propertyId: number, rateId: number) => Promise<void>;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({
  propertyId,
  property: propProperty,
  onBack,
  onRateClick,
  onRateSuccess,
  onEdit,
  onApproveRate,
  onRejectRate,
}) => {
  const [property, setProperty] = useState<Property | null>(propProperty || null);
  const [loading, setLoading] = useState(!propProperty);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [annualRates, setAnnualRates] = useState<any[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchPropertyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProperty(propertyId);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const responseData = response.data as any;
        // Handle different response structures
        if (responseData.data) {
          setProperty(responseData.data);
        } else if (responseData.id) {
          setProperty(responseData);
        } else {
          setError("Талбай олдсонгүй");
        }
      } else {
        setError("Талбай олдсонгүй");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnualRates = async () => {
    setLoadingRates(true);
    try {
      // Use getAnnualRates with property_id parameter to fetch only this property's rates
      const response = await getAnnualRates(propertyId, null);
      // Handle 404 (not found) gracefully - just show empty list
      if (response.status === 404) {
        setAnnualRates([]);
        return;
      }
      
      if (response.error) {
        // Only show toast for non-404 errors
        if (response.status !== 404) {
          toast.error(`Үнэлгээний мэдээлэл татахад алдаа гарлаа: ${response.error}`);
        }
        setAnnualRates([]);
      } else if (response.data) {
        const responseData = response.data as any;
        const ratesArray = responseData.data || (Array.isArray(responseData) ? responseData : []);
        
        // Filter to ensure only rates for this specific property are shown
        const propertyRates = Array.isArray(ratesArray) 
          ? ratesArray.filter((rate: any) => rate.property_id === propertyId)
          : [];
        
        // Sort by year descending (newest first)
        const sortedRates = propertyRates.sort((a: any, b: any) => (b.year || 0) - (a.year || 0));
        setAnnualRates(sortedRates);
      } else {
        setAnnualRates([]);
      }
    } catch (err) {
      // Only show toast if it's not a 404 error
      const error = err as any;
      if (error?.status !== 404) {
        const errorMsg = err instanceof Error ? err.message : "Үнэлгээний мэдээлэл татахад алдаа гарлаа";
        toast.error(errorMsg);
      }
      setAnnualRates([]);
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    // If property is passed as prop, use it
    if (propProperty) {
      setProperty(propProperty);
      setLoading(false);
    } else {
      // Otherwise, fetch from API
      fetchPropertyData();
    }
    // Fetch annual rates
    fetchAnnualRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, propProperty, refreshKey]);

  // Force refresh when propProperty changes (after rate update or property update)
  useEffect(() => {
    if (propProperty) {
      setProperty(propProperty);
      setLoading(false);
      setError(null);
    }
  }, [propProperty]);

  // Refresh property data when refreshKey changes
  useEffect(() => {
    if (propProperty && refreshKey > 0) {
      fetchPropertyData();
      fetchAnnualRates();
    }
  }, [refreshKey]);

  // Refresh rates when property changes (after rate update)
  useEffect(() => {
    if (property) {
      fetchAnnualRates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property?.rate?.id]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-slate-500">Мэдээлэл татаж байна...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-600">{error || "Талбай олдсонгүй"}</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Буцах
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Буцах
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Талбайн дэлгэрэнгүй мэдээлэл - #{property?.number || property?.id || propertyId}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {property && (
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Засах
            </Button>
          )}
          {/* {onRateClick && property && (
            <Button variant="outline" onClick={() => onRateClick(property)}>
              <Star className="h-4 w-4 mr-2" />
              Үнэлгээний хүсэлт илгээх
            </Button>
          )} */}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Үндсэн мэдээлэл
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Талбайн дугаар</label>
                <p className="text-sm text-slate-900 mt-1">{property?.number || "-"}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Нэр</label>
                <p className="text-sm text-slate-900 mt-1">{property.name || "-"}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Тайлбар</label>
                <p className="text-sm text-slate-600 mt-1">{property.description || "-"}</p>
              </div>
            </div>
          </div>

          {/* Location & Dimensions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Байршил ба хэмжээс
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">X координат</label>
                <p className="text-sm text-slate-900 mt-1">{property.x ?? "-"}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Y координат</label>
                <p className="text-sm text-slate-900 mt-1">{property.y ?? "-"}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Урт</label>
                <p className="text-sm text-slate-900 mt-1">{property.length ? `${property.length}м` : "-"}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Өргөн</label>
                <p className="text-sm text-slate-900 mt-1">{property.width ? `${property.width}м` : "-"}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Талбайн хэмжээ</label>
                <p className="text-sm text-slate-900 mt-1">
                  {property.area_size ? `${property.area_size}м²` : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Block Information */}
        {property.block && (
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Building className="h-5 w-5" />
              Блокийн мэдээлэл
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Блокийн нэр</label>
                <p className="text-sm text-slate-900 mt-1">{property.block.name || "-"}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Блокийн урт</label>
                <p className="text-sm text-slate-900 mt-1">
                  {property.block.length ? `${property.block.length}м` : "-"}
                </p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Блокийн өргөн</label>
                <p className="text-sm text-slate-900 mt-1">
                  {property.block.width ? `${property.block.width}м` : "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tenant Information */}
        {property.tenant && (
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <User className="h-5 w-5" />
              Түрээслэгчийн мэдээлэл
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Төрөл</label>
                <p className="text-sm text-slate-900 mt-1">{property.tenant.type || "-"}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Нэр</label>
                <p className="text-sm text-slate-900 mt-1">{property.tenant.name || "-"}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Регистр</label>
                <p className="text-sm text-slate-900 mt-1">{property.tenant.rd || "-"}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Имэйл</label>
                <p className="text-sm text-slate-900 mt-1">{property.tenant.email || "-"}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Утас</label>
                <p className="text-sm text-slate-900 mt-1">{property.tenant.phone || "-"}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Хаяг</label>
                <p className="text-sm text-slate-900 mt-1">{property.tenant.address || "-"}</p>
              </div>
              
              {property.tenant.address_description && (
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase">Хаягийн дэлгэрэнгүй</label>
                  <p className="text-sm text-slate-600 mt-1">{property.tenant.address_description}</p>
                </div>
              )}
              
              {property.tenant.website && (
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Вебсайт</label>
                  <p className="text-sm text-blue-600 mt-1">
                    <a href={property.tenant.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {property.tenant.website}
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Social Media */}
            {(property.tenant.facebook || property.tenant.twitter || property.tenant.instagram || 
              property.tenant.youtube || property.tenant.wechat) && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <label className="text-xs font-medium text-slate-500 uppercase mb-2 block">Олон нийтийн сүлжээ</label>
                <div className="flex flex-wrap gap-2">
                  {property.tenant.facebook && (
                    <span className="text-xs text-blue-600">Facebook</span>
                  )}
                  {property.tenant.twitter && (
                    <span className="text-xs text-blue-400">Twitter</span>
                  )}
                  {property.tenant.instagram && (
                    <span className="text-xs text-pink-600">Instagram</span>
                  )}
                  {property.tenant.youtube && (
                    <span className="text-xs text-red-600">YouTube</span>
                  )}
                  {property.tenant.wechat && (
                    <span className="text-xs text-green-600">WeChat</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Type & Category */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5" />
            Төрөл ба ангилал
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.type && (
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Талбайн төрөл</label>
                <p className="text-sm text-slate-900 mt-1">{property.type.name || "-"}</p>
                {property.type.description && (
                  <p className="text-xs text-slate-600 mt-1">{property.type.description}</p>
                )}
              </div>
            )}
            
            {property.product_type && (
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Барааны төрөл</label>
                <p className="text-sm text-slate-900 mt-1">{property.product_type.name || "-"}</p>
                {property.product_type.description && (
                  <p className="text-xs text-slate-600 mt-1">{property.product_type.description}</p>
                )}
                {property.product_type.management_fee_rate && (
                  <p className="text-xs text-slate-600 mt-1">
                    Удирдлагын хувь: {property.product_type.management_fee_rate}%
                  </p>
                )}
              </div>
            )}
            
            {property.status && (
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Төлөв</label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                    property.status.style || "bg-slate-100 text-slate-800"
                  }`}
                >
                  {property.status.description || property.status.name || "-"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rate Information */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Үнэлгээний мэдээлэл
            </h3>
            <div className="flex items-center gap-2">
              {annualRates.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  Түүх харах
                </Button>
              )}
              {/* {onRateClick && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRateClick(property)}
                >
                  {property.rate ? "Үнэлгээ засах" : "Үнэлгээ өгөх"}
                </Button>
              )} */}
            </div>
          </div>
          
          {loadingRates ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-sm text-slate-500">Үнэлгээний мэдээлэл татаж байна...</p>
            </div>
          ) : annualRates.length > 0 ? (
            <div className="space-y-4">
              {annualRates.map((rate, index) => (
                <div
                  key={rate.id || index}
                  className={`border rounded-lg p-4 ${
                    index === 0 ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-slate-900">
                      {rate.year || "-"} он
                    </h4>
                    {index === 0 && (
                      <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                        Сүүлийн үнэлгээ
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase">Үнэ</label>
                      <p className="text-sm text-slate-900 mt-1">{formatCurrency(rate.rate)}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase">Төлбөр</label>
                      <p className="text-sm text-slate-900 mt-1">{formatCurrency(rate.fee)}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase">Эхлэх огноо</label>
                      <p className="text-sm text-slate-900 mt-1">{formatDate(rate.start_date)}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase">Дуусах огноо</label>
                      <p className="text-sm text-slate-900 mt-1">{formatDate(rate.end_date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">Үнэлгээний мэдээлэл оруулаагүй байна</p>
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5" />
            Бүртгэлийн мэдээлэл
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Үүсгэсэн огноо</label>
              <p className="text-sm text-slate-900 mt-1">{formatDate(property.created_at)}</p>
            </div>
            
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Шинэчлэгдсэн огноо</label>
              <p className="text-sm text-slate-900 mt-1">{formatDate(property.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rate History Modal */}
      {isHistoryModalOpen && (
        <PropertyRateHistoryModal
          property={property}
          onClose={() => setIsHistoryModalOpen(false)}
          onApprove={onApproveRate}
          onReject={onRejectRate}
        />
      )}

      {/* Edit Property Modal */}
      {isEditModalOpen && property && (
        <EditPropertyModal
          property={property}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setRefreshKey((prev) => prev + 1);
            if (onEdit) {
              onEdit(property);
            }
          }}
        />
      )}
    </div>
  );
};

