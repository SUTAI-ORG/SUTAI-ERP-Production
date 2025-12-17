"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PropertyDetail } from "@/components/admin/property/PropertyDetail";
import { approveAnnualRate, rejectAnnualRate, getProperty } from "@/lib/api";
import { Property } from "@/components/admin/property/types";
import { UpdateRateModal } from "@/components/admin/property/UpdateRateModal";
import { createAnnualRate } from "@/lib/api";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id ? parseInt(params.id as string) : null;
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleBack = () => {
    router.push("/main");
  };

  const handleApproveRate = async (propertyId: number, rateId: number) => {
    if (!rateId || rateId === 0) {
      throw new Error("Үнэлгээний ID буруу байна");
    }
    
    const response = await approveAnnualRate(propertyId, rateId);
    if (response.error) {
      throw new Error(response.error || "Баталгаажуулахад алдаа гарлаа");
    }
    // Refresh property data after approval
    if (propertyId) {
      const propertyResponse = await getProperty(propertyId);
      if (propertyResponse.data) {
        const responseData = propertyResponse.data as any;
        const updatedProperty = responseData.data || responseData;
        if (updatedProperty) {
          setSelectedProperty(updatedProperty);
        }
      }
    }
    setLoading(false);
  };

  const handleRejectRate = async (propertyId: number, rateId: number) => {
    const response = await rejectAnnualRate(propertyId, rateId);
    if (response.error) {
      throw new Error(response.error || "Татгалзахад алдаа гарлаа");
    }
    // Refresh property data after rejection
    if (propertyId) {
      const propertyResponse = await getProperty(propertyId);
      if (propertyResponse.data) {
        const responseData = propertyResponse.data as any;
        const updatedProperty = responseData.data || responseData;
        if (updatedProperty) {
          setSelectedProperty(updatedProperty);
        }
      }
    }
  };

  const handleRateClick = (property: Property) => {
    setSelectedProperty(property);
    setIsRateModalOpen(true);
  };

  const handleUpdateRate = async (propertyId: number, rateData: {
    year: number;
    rate: number;
    fee: number;
    start_date: string;
    end_date: string;
  }) => {
    const property = selectedProperty;
    const productTypeId = property?.product_type_id ?? property?.product_type?.id ?? null;
    
    if (!property) {
      throw new Error("Талбай олдсонгүй");
    }
    
    const response = await createAnnualRate({
      property_id: propertyId,
      year: rateData.year,
      rate: rateData.rate,
      fee: rateData.fee,
      start_date: rateData.start_date,
      end_date: rateData.end_date,
      product_type_id: productTypeId,
    });
    
    if (response.error || !response.data) {
      const errorMessage = response.message || response.error || `Алдаа гарлаа (Status: ${response.status || 'unknown'})`;
      throw new Error(errorMessage);
    }
  };

  const handleRateSuccess = async () => {
    // Refresh property data after successful rate update
    if (propertyId) {
      const propertyResponse = await getProperty(propertyId);
      if (propertyResponse.data) {
        const responseData = propertyResponse.data as any;
        const updatedProperty = responseData.data || responseData;
        if (updatedProperty) {
          setSelectedProperty(updatedProperty);
        }
      }
    }
  };

  if (!propertyId || isNaN(propertyId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-sm text-red-600">Талбайн ID буруу байна</p>
          <button
            onClick={handleBack}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Буцах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-slate-200 rounded-lg" />
            <div className="h-64 bg-slate-200 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-24 bg-slate-200 rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <PropertyDetail
            propertyId={propertyId}
            property={selectedProperty}
            onBack={handleBack}
            onRateClick={handleRateClick}
            onRateSuccess={handleRateSuccess}
            onApproveRate={handleApproveRate}
            onRejectRate={handleRejectRate}
          />
        )}
      </div>
      
      {/* Rate Update Modal */}
      {isRateModalOpen && selectedProperty && (
        <UpdateRateModal
          property={selectedProperty}
          onClose={() => {
            setIsRateModalOpen(false);
            setSelectedProperty(null);
          }}
          onSuccess={handleRateSuccess}
          onUpdateRate={handleUpdateRate}
        />
      )}
    </div>
  );
}

