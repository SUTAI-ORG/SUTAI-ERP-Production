"use client";

import React from "react";
import { Tenant, FilterType } from "../types";
import { TenantTableRow } from "./TenantTableRow";

interface TenantTableProps {
  tenants: Tenant[];
  loading: boolean;
  statusOptions: { [key: string]: string | { name?: string; style?: string; description?: string } };
  onTenantClick?: (tenantId: number) => void;
  onStatusChange?: (tenantId: number, newStatus: string) => void;
  onApprove?: (tenantId: number) => void;
  onReject?: (tenantId: number) => void;
  filterType?: FilterType;
  processingIds?: Set<number>;
  showActions?: boolean; // Show approve/reject buttons, default true
}

export const TenantTable: React.FC<TenantTableProps> = ({ tenants, loading, statusOptions, onTenantClick, onStatusChange, onApprove, onReject, filterType, processingIds, showActions = true }) => {
  // Determine if we should show "Лангуу" based on whether tenants have propertyId
  // If all tenants have propertyId, show "Лангуу", otherwise show "Үйл ажиллагааны төрөл"
  const isRenewal = tenants.length > 0 && tenants.every((tenant) => tenant.propertyId !== null && tenant.propertyId !== undefined);
  const colSpan = showActions ? 7 : 6;
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                {isRenewal ? "Лангуу" : "Үйл ажиллагааны төрөл"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Харилцагчийн нэр</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Утасны дугаар</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Тайлбар</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Төлөв</th>
              {showActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Үйлдэл</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-12 text-center">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-slate-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ) : tenants.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-12 text-center text-slate-500">
                  Түрээслэх хүсэлт олдсонгүй
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <TenantTableRow
                  key={tenant.id}
                  tenant={tenant}
                  statusOptions={statusOptions}
                  onTenantClick={onTenantClick}
                  onApprove={onApprove}
                  onReject={onReject}
                  isProcessing={processingIds?.has(tenant.id) || false}
                  showActions={showActions}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

