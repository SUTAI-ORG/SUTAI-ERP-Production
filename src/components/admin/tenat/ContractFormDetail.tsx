"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  Building2,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Step1, Step2, Step3, Step4, Step5 } from "./steps";
import { getLeaseRequestById } from "@/lib/api";

interface ContractFormDetailProps {
  tenantId: number;
  onBack: () => void;
}

const ContractFormDetail = ({ tenantId, onBack }: ContractFormDetailProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tenantName, setTenantName] = useState(`Tenant ${tenantId}`);
  const [formData, setFormData] = useState({
    // Step 1: Талбай түрээслэх хүсэлт зурагаар
    leaseRequestImage: "",
    // Step 2: Санхүүгийн барьцаалбар
    hasCollateralDifference: false,
    collateralDifferenceAmount: "",
    // Step 3: Захиралын үнэмлэхний лавалгаа зургаар
    directorIdImage: "",
    // Step 4: Байгуулгийн гэрчилгээний хуулбар зурагаар (organization only)
    organizationCertificateImage: "",
    // Step 5: Аж ахуйн нэгжийн дүрэм зурагаар (organization only)
    businessRegulationsImage: "",
  });
  // Step approval status: null = not checked, true = approved (зөв), false = rejected (буруу)
  const [stepApprovals, setStepApprovals] = useState<Record<number, boolean | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
  });

  // Fetch lease request data by ID
  useEffect(() => {
    const fetchLeaseRequest = async () => {
      setLoading(true);
      try {
        const response = await getLeaseRequestById(tenantId);
        if (response.data) {
          const data = response.data.data || response.data;
          
          // Set tenant name
          if (data.contact_name) {
            setTenantName(data.contact_name);
          } else if (data.customer_name) {
            setTenantName(data.customer_name);
          } else if (data.name) {
            setTenantName(data.name);
          }

          // Map API data to formData
          setFormData({
            // Step 1: Талбай түрээслэх хүсэлт зурагаар
            leaseRequestImage: data.lease_request_image || data.leaseRequestImage || "",
            // Step 2: Санхүүгийн барьцаалбар
            hasCollateralDifference: data.has_collateral_difference || data.hasCollateralDifference || false,
            collateralDifferenceAmount: data.collateral_difference_amount?.toString() || data.collateralDifferenceAmount?.toString() || "",
            // Step 3: Захиралын үнэмлэхний лавалгаа зургаар
            directorIdImage: data.director_id_image || data.directorIdImage || "",
            // Step 4: Байгуулгийн гэрчилгээний хуулбар зурагаар (organization only)
            organizationCertificateImage: data.organization_certificate_image || data.organizationCertificateImage || "",
            // Step 5: Аж ахуйн нэгжийн дүрэм зурагаар (organization only)
            businessRegulationsImage: data.business_regulations_image || data.businessRegulationsImage || "",
          });

          // Check if form is already submitted
          if (data.is_submitted || data.isSubmitted || data.submitted_at || data.submittedAt) {
            setIsSubmitted(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch lease request:", error);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchLeaseRequest();
    }
  }, [tenantId]);

  // Steps for organization (5 steps)
  const steps = [
    { id: 1, label: "Талбай түрээслэх хүсэлт", icon: FileText },
    { id: 2, label: "Санхүүгийн барьцаалбар", icon: DollarSign },
    { id: 3, label: "Захиралын үнэмлэх", icon: User },
    { id: 4, label: "Байгуулгийн гэрчилгээ", icon: Building2 },
    { id: 5, label: "Аж ахуйн нэгжийн дүрэм", icon: FileText },
  ];

  const handleImageChange = (field: string, file: File | null) => {
    if (file) {
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, [field]: imageUrl }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCollateralChange = (hasDifference: boolean, amount?: string) => {
    setFormData((prev) => ({
      ...prev,
      hasCollateralDifference: hasDifference,
      collateralDifferenceAmount: amount || "",
    }));
  };

  const handleStepApproval = (stepId: number, approved: boolean) => {
    setStepApprovals((prev) => ({
      ...prev,
      [stepId]: approved,
    }));
  };

  const handleSubmit = async () => {
    // TODO: Implement submit API call
    setIsSubmitted(true);
    toast.success("Бүрдүүлбэр амжилттай илгээгдлээ");
  };

  const renderStepContent = () => {
    // Organization: 5 steps
    switch (currentStep) {
      case 1:
        return (
          <Step1
            imageUrl={formData.leaseRequestImage}
            onImageChange={(file) => handleImageChange("leaseRequestImage", file)}
            readOnly={true}
            approvalStatus={stepApprovals[1]}
            onApprovalChange={(approved) => handleStepApproval(1, approved)}
          />
        );
      case 2:
        return (
          <Step2
            hasDifference={formData.hasCollateralDifference}
            differenceAmount={formData.collateralDifferenceAmount}
            onDifferenceChange={handleCollateralChange}
            readOnly={true}
            approvalStatus={stepApprovals[2]}
            onApprovalChange={(approved) => handleStepApproval(2, approved)}
          />
        );
      case 3:
        return (
          <Step3
            imageUrl={formData.directorIdImage}
            onImageChange={(file) => handleImageChange("directorIdImage", file)}
            readOnly={true}
            approvalStatus={stepApprovals[3]}
            onApprovalChange={(approved) => handleStepApproval(3, approved)}
          />
        );
      case 4:
        return (
          <Step4
            imageUrl={formData.organizationCertificateImage}
            onImageChange={(file) => handleImageChange("organizationCertificateImage", file)}
            readOnly={true}
            approvalStatus={stepApprovals[4]}
            onApprovalChange={(approved) => handleStepApproval(4, approved)}
          />
        );
      case 5:
        return (
          <Step5
            imageUrl={formData.businessRegulationsImage}
            onImageChange={(file) => handleImageChange("businessRegulationsImage", file)}
            readOnly={true}
            approvalStatus={stepApprovals[5]}
            onApprovalChange={(approved) => handleStepApproval(5, approved)}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-sm text-slate-500">Мэдээлэл татаж байна...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Буцах
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
              {tenantName.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{tenantName}</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Засах
          </Button>
          <Button variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
            Устгах
          </Button>
        </div>
      </div>

      {/* Step Process */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Гэрээний бүрдүүлбэр</h2>
          <div className="flex items-center gap-3">
            {!isSubmitted && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-full">
                <Clock className="h-4 w-4" />
                Бүрдүүлбэр илгээгүй
              </span>
            )}
            {isSubmitted && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-full">
                <CheckCircle className="h-4 w-4" />
                Бүрдүүлбэр илгээгдсэн
              </span>
            )}
          </div>
        </div>
        
        {/* Step Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const approvalStatus = stepApprovals[step.id];
              const isApproved = approvalStatus === true;
              const isRejected = approvalStatus === false;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex flex-col items-center gap-2 transition-all ${
                        isActive ? "scale-110" : ""
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          isRejected
                            ? "bg-red-500 border-red-500 text-white"
                            : isApproved
                            ? "bg-green-500 border-green-500 text-white"
                            : isActive
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-white border-slate-300 text-slate-400"
                        }`}
                      >
                        {isRejected ? (
                          <XCircle className="h-6 w-6" />
                        ) : isApproved ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <StepIcon className="h-6 w-6" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium mt-1 ${
                          isRejected
                            ? "text-red-600"
                            : isApproved
                            ? "text-green-600"
                            : isActive
                            ? "text-blue-600"
                            : "text-slate-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </button>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        stepApprovals[step.id] === true ? "bg-green-500" : "bg-slate-300"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="border-t border-slate-200 pt-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Өмнөх
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-500">
              {currentStep} / {steps.length}
            </div>
            {currentStep === steps.length && !isSubmitted && (
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                Илгээх
              </Button>
            )}
          </div>
          {currentStep < steps.length && (
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            >
              Дараах
            </Button>
          )}
          {currentStep === steps.length && (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractFormDetail;

