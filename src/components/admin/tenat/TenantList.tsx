"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLeaseRequests } from "@/hooks/useLeaseRequests";
import { useTenantData } from "@/hooks/useTenantData";
import { approveLeaseRequest, rejectLeaseRequest } from "@/lib/api";
import { FilterType } from "./types";
import { TenantHeader } from "./TenantHeader";
import { TenantError } from "./TenantError";
import { TenantStatistics } from "./TenantStatistics";
import { TenantFilterTabs } from "./TenantFilterTabs";
import { TenantTable } from "./TenantTable";
import { Pagination } from "../../ui/pagination";

interface TenantListProps {
  onTenantClick?: (tenantId: number) => void;
}

const TenantList: React.FC<TenantListProps> = ({ onTenantClick }) => {
  const [filterType, setFilterType] = React.useState<FilterType>("renewal");
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const { leaseRequests, loading, error, statusOptions, currentPage, totalPages, fetchLeaseRequests, handlePageChange } = useLeaseRequests();
  const tenants = useTenantData(leaseRequests);

  // Exclude "submitted" status only for tenants with propertyId (renewal), exclude "approved", "rejected", and "cancelled" statuses
  const tenantsWithoutSubmitted = useMemo(() => {
    return tenants.filter((tenant) => {
      const originalRequest = leaseRequests.find((req: any) => req.id === tenant.id);
      if (!originalRequest) return true;
      
      // Exclude approved status
      if (originalRequest.status === "approved") {
        return false;
      }
      
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
    if (filterType === "new") {
      return tenantsWithoutSubmitted.filter((tenant) => {
        // Exclude tenants with propertyId (talbar sonogdson)
        if (tenant.propertyId !== null && tenant.propertyId !== undefined) {
          return false;
        }
        return tenant.isNewTenant;
      });
    } else if (filterType === "renewal") {
      return tenantsWithoutSubmitted.filter((tenant) => {
        return tenant.isRenewal;
      });
    } else if (filterType === "rejected") {
      // For rejected tab, show rejected/cancelled statuses from all tenants (not filtered by tenantsWithoutSubmitted)
      return tenants.filter((tenant) => {
        const originalRequest = leaseRequests.find((req: any) => req.id === tenant.id);
        if (!originalRequest) return false;
        const rejectedStatuses = ["rejected", "cancelled", "reject", "cancel", "director_rejected"];
        return rejectedStatuses.includes(originalRequest.status);
      });
    }
    return tenantsWithoutSubmitted;
  }, [tenantsWithoutSubmitted, filterType, leaseRequests]);

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
      {!error && <TenantStatistics tenants={tenantsWithoutSubmitted} loading={loading} />}
      <TenantFilterTabs filterType={filterType} onFilterChange={setFilterType} tenants={tenantsWithoutSubmitted} leaseRequests={leaseRequests} />
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
