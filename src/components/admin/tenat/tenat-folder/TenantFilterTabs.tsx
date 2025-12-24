"use client";

import React from "react";
import { FilterType, Tenant } from "../types";

interface TenantFilterTabsProps {
  filterType: FilterType;
  onFilterChange: (type: FilterType) => void;
  tenants: Tenant[];
  leaseRequests?: any[];
  showRejected?: boolean;
  allowedStatuses?: string[]; // If provided, only show these statuses
  showAllTab?: boolean; // Show "Бүгд" tab, default true
}

export const TenantFilterTabs: React.FC<TenantFilterTabsProps> = ({
  filterType,
  onFilterChange,
  leaseRequests = [],
  showRejected = true,
  allowedStatuses,
  showAllTab = true,
}) => {
  // Status definitions with names (merge checking + under_review)
  const statusConfig: Record<string, { name: string; count: number }> = {
    property_selected: { name: "Түрээс сунгах", count: 0 },
    pending: { name: "Шинээр түрээслэх", count: 0 },
    incomplete: { name: "Дутуу", count: 0 },
    checking: { name: "Шалгагдаж байна", count: 0 }, // includes under_review
    approved: { name: "Зөвшөөрсөн", count: 0 },
    in_contract_process: { name: "Гэрээ байгуулах", count: 0 },
    rejected: { name: "Татгалзсан", count: 0 },
    cancelled: { name: "Цуцлагдсан", count: 0 },
  };

  // Count requests by status
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    if (!leaseRequests || leaseRequests.length === 0) {
      Object.keys(statusConfig).forEach(status => {
        counts[status] = 0;
      });
      return counts;
    }

    leaseRequests.forEach((req: any) => {
      const status = req.status;
      if (!status) return;

      // Merge under_review into checking
      const normalizedStatus = status === "under_review" ? "checking" : status;

      if (statusConfig[normalizedStatus]) {
        counts[normalizedStatus] = (counts[normalizedStatus] || 0) + 1;
      }
    });

    // Initialize all statuses with 0 if not present
    Object.keys(statusConfig).forEach(status => {
      if (counts[status] === undefined) {
        counts[status] = 0;
      }
    });

    return counts;
  }, [leaseRequests, statusConfig]);

  // Get statuses to display
  let statuses = Object.keys(statusConfig);
  
  // If allowedStatuses is provided, filter to only show those statuses
  if (allowedStatuses && allowedStatuses.length > 0) {
    statuses = statuses.filter(status => allowedStatuses.includes(status));
  } else {
    // Skip rejected and cancelled if showRejected is false
    if (!showRejected) {
      statuses = statuses.filter(status => status !== "rejected" && status !== "cancelled");
    }
  }

  return (
    <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
      {showAllTab && (
        <button
          onClick={() => onFilterChange("all" as FilterType)}
          className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            filterType === "all"
              ? "text-black border-b-2 border-gray-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Бүгд ({leaseRequests?.length || 0})
        </button>
      )}
      {statuses.map((status) => {
        const config = statusConfig[status];
        const count = statusCounts[status] || 0;

        return (
          <button
            key={status}
            onClick={() => onFilterChange(status as FilterType)}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filterType === status
                ? "text-black border-b-2 border-gray-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {config.name} ({count})
          </button>
        );
      })}
    </div>
  );
};

