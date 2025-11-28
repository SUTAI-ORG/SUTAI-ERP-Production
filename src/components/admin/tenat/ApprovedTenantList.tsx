"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLeaseRequests } from "@/hooks/useLeaseRequests";
import { useTenantData } from "@/hooks/useTenantData";
import { approveLeaseRequest, rejectLeaseRequest } from "@/lib/api";
import { FilterType } from "./types";
import { TenantError } from "./TenantError";
import { TenantStatistics } from "./TenantStatistics";
import { TenantFilterTabs } from "./TenantFilterTabs";
import { TenantTable } from "./TenantTable";
import { Pagination } from "../../ui/pagination";

interface ApprovedTenantListProps {
  onTenantClick?: (tenantId: number) => void;
}

const ApprovedTenantList: React.FC<ApprovedTenantListProps> = ({ onTenantClick }) => {
  const [filterType, setFilterType] = React.useState<FilterType>("approved");
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const { leaseRequests, loading, error, statusOptions, currentPage, totalPages, fetchLeaseRequests, handlePageChange } = useLeaseRequests();
  const tenants = useTenantData(leaseRequests);

  // Filter tenants with statuses that should appear in "Гэрээний бүрдүүлбэр" section
  // These include: approved, checking, incomplete, under_review
  const approvedTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      // Find the original request to check status
      const originalRequest = leaseRequests.find((req: any) => req.id === tenant.id);
      if (!originalRequest) return false;
      
      // Show tenants with these statuses: approved, checking, incomplete, under_review
      const allowedStatuses = ["approved", "checking", "incomplete", "under_review"];
      return allowedStatuses.includes(originalRequest.status);
    });
  }, [tenants, leaseRequests]);

  // Apply filter by status
  const filteredTenants = useMemo(() => {
    // If "all" is selected, return all approved tenants
    if (filterType === "all") {
      return approvedTenants;
    }
    
    // Filter by specific status
    return approvedTenants.filter((tenant) => {
      const originalRequest = leaseRequests.find((req: any) => req.id === tenant.id);
      if (!originalRequest) return false;
      
      // Match the selected status
      return originalRequest.status === filterType;
    });
  }, [approvedTenants, filterType, leaseRequests]);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Гэрээний бүрдүүлбэр</h1>
          <p className="text-sm text-slate-500 mt-1">Баталгаажсан хүсэлтүүд</p>
        </div>
      </div>
      {error && !loading && <TenantError error={error} onRetry={fetchLeaseRequests} />}
      {!error && <TenantStatistics tenants={approvedTenants} loading={loading} />}
      <TenantFilterTabs 
        filterType={filterType} 
        onFilterChange={setFilterType} 
        tenants={approvedTenants} 
        leaseRequests={leaseRequests} 
        showRejected={false}
        allowedStatuses={["approved", "checking",  "incomplete", "under_review",]}
        showAllTab={false}
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
            showActions={false}
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

export default ApprovedTenantList;

