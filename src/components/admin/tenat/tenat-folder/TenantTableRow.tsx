"use client";

import React from "react";
import { Phone, Mail, Check, X } from "lucide-react";
import { Button } from "../../../ui/button";
import { Tenant } from "../types";

interface TenantTableRowProps {
  tenant: Tenant;
  statusOptions: { [key: string]: string | { name?: string; style?: string; description?: string } };
  onTenantClick?: (tenantId: number) => void;
  onApprove?: (tenantId: number) => void;
  onReject?: (tenantId: number) => void;
  isProcessing?: boolean;
  showActions?: boolean; // Show approve/reject buttons, default true
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "submitted":
      return "bg-blue-100 text-blue-800";
    case "dept_approved":
      return "bg-green-100 text-green-800";
    case "director_approved":
      return "bg-emerald-100 text-emerald-800";
    case "deposit_invoiced":
      return "bg-purple-100 text-purple-800";
    case "deposit_paid":
      return "bg-indigo-100 text-indigo-800";
    case "ready_for_agreement":
      return "bg-teal-100 text-teal-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
    case "director_rejected":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    case "draft":
      return "bg-slate-100 text-slate-800";
    case "needs_director":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const getStatusLabelMn = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: "Хүлээгдэж буй",
    property_selected: "Талбай сонгогдсон",
    approved: "Зөвшөөрсөн",
    checking: "Шалгагдаж байна",
    under_review: "Дахин шалгагдаж байна",
    incomplete: "Дутуу",
    in_contract_process: "Гэрээ байгуулах",
    rejected: "Татгалзсан",
    cancelled: "Цуцлагдсан",
    submitted: "Илгээсэн",
    dept_approved: "Хэлтэс зөвшөөрсөн",
    director_approved: "Захирал зөвшөөрсөн",
    deposit_invoiced: "Хадгаламжийн нэхэмжлэх",
    deposit_paid: "Хадгаламж төлсөн",
    ready_for_agreement: "Гэрээ байгуулахад бэлэн",
    draft: "Ноорог",
    needs_director: "Захирлын шийдвэр шаардлагатай",
    director_rejected: "Захирал татгалзсан",
    reject: "Татгалзсан",
    cancel: "Цуцлагдсан",
  };
  
  return statusMap[status] || status || "Тодорхойгүй";
};

export const TenantTableRow: React.FC<TenantTableRowProps> = ({ tenant, statusOptions, onTenantClick, onApprove, onReject, isProcessing = false, showActions = true }) => {
  // Handle statusOptions that might be an object with {name, style, description} or a simple string
  const getStatusLabel = () => {
    if (!tenant.status) return "-";
    
    const statusValue = statusOptions[tenant.status];
    if (!statusValue) {
      // If no statusOptions, use Mongolian translation
      return getStatusLabelMn(tenant.status);
    }
    
    // If statusValue is an object with a 'name' property, use that
    if (typeof statusValue === 'object' && statusValue !== null && 'name' in statusValue) {
      return (statusValue as any).name;
    }
    
    // If statusValue is a string, use it directly
    if (typeof statusValue === 'string') {
      return statusValue;
    }
    
    // Fallback to Mongolian translation
    return getStatusLabelMn(tenant.status);
  };
  
  const statusLabel = getStatusLabel();
  const hasPropertyId = tenant.propertyId !== null && tenant.propertyId !== undefined;
  const canShowActions = showActions && tenant.status !== "incomplete";
  
  return (
    <tr
      key={tenant.id}
      className="hover:bg-slate-50 transition-colors cursor-pointer"
      onClick={() => onTenantClick?.(tenant.id)}
    >
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-slate-900">#{tenant.id}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-slate-900">
          {tenant.isRenewal 
            ? (tenant.propertyNumber || "-")
            : tenant.businessType}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-medium text-slate-900">{tenant.customerName}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600">{tenant.phone}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-slate-600 line-clamp-2">{tenant.description}</span>
      </td>
      <td className="px-6 py-4">
        {tenant.status && !(hasPropertyId && tenant.status === "submitted") && (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant.status)}`}>
            {statusLabel}
          </span>
        )}
      </td>
      {showActions && (
        <td className="px-6 py-4">
          {canShowActions ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                className="h-8 w-8 p-0 text-green-600 border-green-600 hover:bg-green-50 hover:border-green-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onApprove?.(tenant.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                className="h-8 w-8 p-0 text-red-600 border-red-600 hover:bg-red-50 hover:border-red-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onReject?.(tenant.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Үйлдэлгүй</span>
          )}
        </td>
      )}
    </tr>
  );
};

