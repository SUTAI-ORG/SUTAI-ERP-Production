"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateLeaseRequestStatus } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, XCircle, FileCheck } from "lucide-react";

interface CheckingStatusActionsProps {
  requestId: number;
  onStatusUpdate?: () => void;
}

export const CheckingStatusActions: React.FC<CheckingStatusActionsProps> = ({
  requestId,
  onStatusUpdate,
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: "incomplete" | "in_contract_process") => {
    setLoading(newStatus);
    try {
      const response = await updateLeaseRequestStatus(requestId, newStatus);
      
      if (response.status === 200 || response.status === 201) {
        const statusName = newStatus === "incomplete" ? "Дутуу" : "Гэрээ байгуулах";
        toast.success(`Төлөв '${statusName}' болгож шинэчлэгдлээ`);
        onStatusUpdate?.();
      } else {
        const errorMessage = response.error || response.message || "Төлөв шинэчлэхэд алдаа гарлаа";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      const errorMessage = error?.message || error?.error || "Төлөв шинэчлэхэд алдаа гарлаа";
      toast.error(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Төлөв өөрчлөх
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Хүсэлтийн төлөвийг өөрчлөх
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => handleStatusChange("incomplete")}
          disabled={loading !== null}
          className="flex items-center gap-2"
        >
          {loading === "incomplete" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          Дутуу болгох
        </Button>
        <Button
          variant="default"
          onClick={() => handleStatusChange("in_contract_process")}
          disabled={loading !== null}
          className="flex items-center gap-2"
        >
          {loading === "in_contract_process" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileCheck className="h-4 w-4" />
          )}
          Гэрээ байгуулах
        </Button>
      </div>
    </div>
  );
};

