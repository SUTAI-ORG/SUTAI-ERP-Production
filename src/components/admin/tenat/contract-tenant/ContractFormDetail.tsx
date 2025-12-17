"use client";

import React from "react";
import Image from "next/image";
import {
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ContractFormHeader } from "./ContractFormHeader";
import { ContractFormRequestInfo } from "./ContractFormRequestInfo";
import { ContractFormLoading } from "./ContractFormLoading";
import { CheckingStatusActions } from "./CheckingStatusActions";
import { RecheckingStatusActions } from "./RecheckingStatusActions";
import { ContractFileUploader } from "./ContractFileUploader";

import { useContractFormData } from "@/hooks/useContractFormData";
import { getAllUrls } from "./utils/attachmentUtils";
import { updateApprovedLeaseRequestAttachments } from "@/lib/api";

interface ContractFormDetailProps {
  tenantId: number;
  onBack: () => void;
  useApprovedEndpoint?: boolean;
}

const isImageUrl = (url: string) =>
  /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

const ContractFormDetail: React.FC<ContractFormDetailProps> = ({
  tenantId,
  onBack,
  useApprovedEndpoint = true,
}) => {
  const {
    loading,
    tenantName,
    requestData,
    attachmentMap,
    refreshData,
    getAttachmentLabelMn,
  } = useContractFormData({ tenantId, useApprovedEndpoint });

  const [failedImages, setFailedImages] = React.useState<Set<string>>(new Set());
  const [openInfo, setOpenInfo] = React.useState(false);
  const [processingAttachments, setProcessingAttachments] =
    React.useState<Set<string>>(new Set());

  const handlePreview = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleApproveAttachment = async (attachmentName: string) => {
    if (!requestData?.id) return;

    setProcessingAttachments((p) => new Set(p).add(attachmentName));
    try {
      await updateApprovedLeaseRequestAttachments(requestData.id, [
        { name: attachmentName, status: "approved" },
      ]);
      toast.success("Хавсралт зөвшөөрлөө");
      refreshData?.();
    } catch {
      toast.error("Алдаа гарлаа");
    } finally {
      setProcessingAttachments((p) => {
        const n = new Set(p);
        n.delete(attachmentName);
        return n;
      });
    }
  };

  const handleRejectAttachment = async (attachmentName: string) => {
    if (!requestData?.id) return;
    const note = prompt("Татгалзсан шалтгаан оруулна уу:");
    if (note === null) return;

    setProcessingAttachments((p) => new Set(p).add(attachmentName));
    try {
      await updateApprovedLeaseRequestAttachments(requestData.id, [
        { name: attachmentName, status: "rejected", note },
      ]);
      toast.success("Хавсралт татгалзлаа");
      refreshData?.();
    } catch {
      toast.error("Алдаа гарлаа");
    } finally {
      setProcessingAttachments((p) => {
        const n = new Set(p);
        n.delete(attachmentName);
        return n;
      });
    }
  };

  const attachmentGroups = React.useMemo(() => {
    return Object.entries(attachmentMap).map(([name, atts]) => ({
      name,
      label: getAttachmentLabelMn?.(name) ?? name,
      urls: atts.flatMap(getAllUrls),
      status: atts?.[0]?.status,
      note: atts?.[0]?.note,
    }));
  }, [attachmentMap, getAttachmentLabelMn]);

  if (loading) {
    return (
      <div className="space-y-6">
        <ContractFormHeader tenantName="..." onBack={onBack} />
        <ContractFormLoading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6">
        <ContractFormHeader tenantName={tenantName} onBack={onBack} />

        <div className="flex items-center justify-between my-6">
          <h2 className="text-lg font-semibold">Хавсралтууд</h2>

          {requestData && (
            <Dialog open={openInfo} onOpenChange={setOpenInfo}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Info className="h-4 w-4" />
                  Хүсэлтийн мэдээлэл
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Хүсэлтийн мэдээлэл</DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-auto">
                  <ContractFormRequestInfo requestData={requestData} />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!useApprovedEndpoint && <ContractFileUploader />}

        <div className="space-y-6">
          {attachmentGroups.map((group) => (
            <div key={group.name} className="border-b border-slate-200 pb-6">
              <h3 className="font-semibold mb-4">{group.label}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.urls.map((url, i) => (
                  <div
                    key={i}
                    className="border border-slate-200 rounded-lg p-4 bg-white"
                  >
                    {/* ✅ ЖИЖИГ THUMBNAIL */}
                    <div className="relative h-32 w-full bg-slate-100 rounded mb-3 overflow-hidden">
                      {isImageUrl(url) && !failedImages.has(url) ? (
                        <Image
                          src={url}
                          alt=""
                          fill
                          className="object-cover"
                          onError={() =>
                            setFailedImages((p) => new Set(p).add(url))
                          }
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <FileText className="h-10 w-10 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => handlePreview(url)}
                    >
                      <Eye className="h-4 w-4" />
                      Харах
                    </Button>
                  </div>
                ))}
              </div>

              {group.status !== "approved" &&
                group.status !== "rejected" && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 bg-white-50 text-green-700 border-green-200 hover:bg-green-100 disabled:opacity-50"
                      onClick={() =>
                        handleApproveAttachment(group.name)
                      }
                      
                      disabled={processingAttachments.has(group.name)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1 " />
                      Зөвшөөрөх
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 bg-white text-red-700 border-red-200 hover:bg-red-100 disabled:opacity-50"

                      onClick={() =>
                        handleRejectAttachment(group.name)
                      }
                      disabled={processingAttachments.has(group.name)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Татгалзах
                    </Button>
                  </div>
                )}

              {group.note && (
                <p className="text-sm text-slate-600 mt-3">
                  <b>Тэмдэглэл:</b> {group.note}
                </p>
              )}
            </div>
          ))}
        </div>

        {requestData?.status === "checking" && (
          <CheckingStatusActions
            requestId={requestData.id}
            onStatusUpdate={refreshData}
          />
        )}
        {requestData?.status === "under_review" && (
          <RecheckingStatusActions
            requestId={requestData.id}
            onStatusUpdate={refreshData}
          />
        )}
      </div>
    </div>
  );
};

export default ContractFormDetail;
