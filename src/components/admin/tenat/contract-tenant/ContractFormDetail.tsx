"use client";

import React from "react";
import { ContractFormHeader } from "./ContractFormHeader";
import { ContractFormRequestInfo } from "./ContractFormRequestInfo";
import { ContractFormLoading } from "./ContractFormLoading";
import { useContractFormData } from "@/hooks/useContractFormData";
import { getAllUrls } from "./utils/attachmentUtils";
import { FileText, Download, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContractFormDetailProps {
  tenantId: number;
  onBack: () => void;
}

const ContractFormDetail: React.FC<ContractFormDetailProps> = ({
  tenantId,
  onBack,
}) => {
  const {
    loading,
    tenantName,
    requestData,
    attachmentMap,
  } = useContractFormData({ tenantId });
  
  const [failedImages, setFailedImages] = React.useState<Set<string>>(new Set());

  if (loading) {
    return (
      <div className="space-y-6">
        <ContractFormHeader tenantName="..." onBack={onBack} />
        <ContractFormLoading />
      </div>
    );
  }

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "approved":
        return "Зөвшөөрсөн";
      case "rejected":
        return "Татгалзсан";
      default:
        return "Хүлээгдэж буй";
    }
  };

  return (
    <div className="space-y-6">
      <ContractFormHeader tenantName={tenantName} onBack={onBack} />
      
      {requestData && <ContractFormRequestInfo requestData={requestData} />}

      {/* Attachments Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">
          Хавсралтууд
        </h2>

        {Object.keys(attachmentMap).length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Хавсралт олдсонгүй
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(attachmentMap).map(([attachmentName, attachments]) => {
              const allUrls: string[] = [];
              attachments.forEach((att) => {
                allUrls.push(...getAllUrls(att));
              });

              return (
                <div key={attachmentName} className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-slate-600" />
                      <h3 className="text-base font-semibold text-slate-800 capitalize">
                        {attachmentName.replace(/_/g, " ")}
                      </h3>
                    </div>
                    {attachments[0]?.status && (
                      <div className="flex items-center gap-2">
                        {getStatusIcon(attachments[0].status)}
                        <span className="text-sm text-slate-600">
                          {getStatusText(attachments[0].status)}
                        </span>
                      </div>
                    )}
                  </div>

                  {allUrls.length === 0 ? (
                    <p className="text-sm text-slate-500">Хавсралт олдсонгүй</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allUrls.map((url, index) => (
                        <div
                          key={index}
                          className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="aspect-video bg-slate-100 rounded-lg mb-3 overflow-hidden">
                            {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && !failedImages.has(url) ? (
                              <img
                                src={url}
                                alt={`${attachmentName} ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={() => {
                                  setFailedImages((prev) => new Set(prev).add(url));
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText className="h-12 w-12 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600 truncate flex-1">
                              {url.split("/").pop() || `Хавсралт ${index + 1}`}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(url, `${attachmentName}_${index + 1}`)}
                              className="ml-2"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {attachments[0]?.note && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <span className="font-semibold">Тэмдэглэл:</span> {attachments[0].note}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractFormDetail;