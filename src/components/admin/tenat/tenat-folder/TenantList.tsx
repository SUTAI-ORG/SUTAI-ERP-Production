"use client";

import React, { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useLeaseRequests } from "@/hooks/useLeaseRequests";
import { useTenantData } from "@/hooks/useTenantData";
import { approveLeaseRequest, rejectLeaseRequest } from "@/lib/api";
import { FilterType } from "../types";
import { TenantHeader } from "./TenantHeader";
import { TenantError } from "./TenantError";
// import { TenantStatistics } from "./TenantStatistics";
import { TenantFilterTabs } from "./TenantFilterTabs";
import { TenantTable } from "./TenantTable";
import { Pagination } from "../../../ui/pagination";

interface TenantListProps {
  onTenantClick?: (tenantId: number) => void;
}

const TenantList: React.FC<TenantListProps> = ({ onTenantClick }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const validFilters = useMemo<Set<string>>(
    () =>
      new Set<FilterType>([
        "pending",
        "property_selected",
        "checking",
        "under_review",
        "incomplete",
        "rejected",
        "cancelled",
        "approved",
        "in_contract_process",
        "all",
      ]),
    []
  );
  const [filterType, setFilterType] = useState<FilterType>(() => {
    const status = searchParams.get("tenantStatus");
    if (status && validFilters.has(status)) {
      return status as FilterType;
    }
    return "all";
  });
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const { leaseRequests, loading, error, statusOptions, currentPage, totalPages, fetchLeaseRequests, handlePageChange } = useLeaseRequests();
  const tenants = useTenantData(leaseRequests);

  // Exclude "submitted" status only for tenants with propertyId (renewal), exclude rejected/cancelled statuses
  const tenantsWithoutSubmitted = useMemo(() => {
    return tenants.filter((tenant) => {
      const originalRequest = leaseRequests.find((req: any) => req.id === tenant.id);
      if (!originalRequest) return true;
      
      // Exclude rejected and cancelled statuses (they should only appear in "rejected" tab)
      const rejectedStatuses = ["rejected", "cancelled", "reject", "cancel", "director_rejected"];
      if (rejectedStatuses.includes(originalRequest.status)) {
        return false;
      }
      
      // If tenant has propertyId and status is "submitted", exclude it
      if (tenant.propertyId !== null && tenant.propertyId !== undefined && originalRequest.status === "submitted") {
        return false;
      }
      return true;
    });
  }, [tenants, leaseRequests]);

  const filteredTenants = useMemo(() => {
    // If "all" is selected, return all tenants without submitted
    if (filterType === "all") {
      return tenantsWithoutSubmitted;
    }
    
    // Filter by specific status
    return tenants.filter((tenant) => {
      const originalRequest = leaseRequests.find((req: any) => req.id === tenant.id);
      if (!originalRequest) return false;
      
      // Match the selected status
      return originalRequest.status === filterType;
    });
  }, [tenants, filterType, leaseRequests, tenantsWithoutSubmitted]);

  // Keep filterType in sync with URL tenantStatus
  useEffect(() => {
    const status = searchParams.get("tenantStatus");
    if (status && validFilters.has(status) && status !== filterType) {
      setFilterType(status as FilterType);
    }
    if (!status && filterType !== "all") {
      setFilterType("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateFilterInUrl = (type: FilterType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "all") {
      params.delete("tenantStatus");
    } else {
      params.set("tenantStatus", type);
    }
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const handleStatusChange = async (tenantId: number, newStatus: string) => {
    // TODO: Implement status update API call
    // After successful update, refresh the list
    // fetchLeaseRequests();
  };

  const handleApprove = async (tenantId: number) => {
    setProcessingIds((prev) => new Set(prev).add(tenantId));
    try {
      const response = await approveLeaseRequest(tenantId);
      if (response.error) {
        console.error("Алдаа:", response.error);
        toast.error(`Алдаа гарлаа: ${response.error}`);
      } else {
        toast.success("Түрээсийн хүсэлт амжилттай батлагдлаа");
        // Refresh the list after successful approval
        await fetchLeaseRequests();
      }
    } catch (err) {
      console.error("Алдаа:", err);
      toast.error("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tenantId);
        return newSet;
      });
    }
  };

  const handleReject = async (tenantId: number) => {
    if (!confirm("Та энэ хүсэлтийг татгалцахдаа итгэлтэй байна уу?")) {
      return;
    }
    
    setProcessingIds((prev) => new Set(prev).add(tenantId));
    try {
      const response = await rejectLeaseRequest(tenantId);
      if (response.error) {
        console.error("Алдаа:", response.error);
        toast.error(`Алдаа гарлаа: ${response.error}`);
      } else {
        toast.success("Түрээсийн хүсэлт амжилттай татгалзлаа");
        // Refresh the list after successful rejection
        await fetchLeaseRequests();
      }
    } catch (err) {
      console.error("Алдаа:", err);
      toast.error("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tenantId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-6">
      <TenantHeader />
      {error && !loading && <TenantError error={error} onRetry={fetchLeaseRequests} />}
      <TenantFilterTabs 
        filterType={filterType} 
        onFilterChange={(type) => {
          setFilterType(type);
          updateFilterInUrl(type);
        }} 
        tenants={tenantsWithoutSubmitted} 
        leaseRequests={leaseRequests}
        allowedStatuses={["pending", "property_selected"]}
        showAllTab={true}
      />
      {!error && (
        <>
          <TenantTable
            tenants={filteredTenants}
            loading={loading}
            statusOptions={statusOptions}
            onTenantClick={onTenantClick}
            onStatusChange={handleStatusChange}
            onApprove={handleApprove}
            onReject={handleReject}
            filterType={filterType}
            processingIds={processingIds}
            showActions={filterType === "property_selected"}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              loading={loading}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TenantList;
