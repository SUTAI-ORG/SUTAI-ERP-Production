"use client";

import React, { useMemo, useState } from "react";
import { useLeaseRequests } from "@/hooks/useLeaseRequests";
import { useTenantData } from "@/hooks/useTenantData";
import { FilterType } from "../types";
import { TenantError } from "../TenantError";
import { TenantStatistics } from "../TenantStatistics";
import { TenantFilterTabs } from "../TenantFilterTabs";
import { TenantTable } from "../TenantTable";
import { Pagination } from "../../../ui/pagination";
import { 
  FileText, 
  Search,
  Filter
} from "lucide-react";
import { Input } from "../../../ui/input";

interface ContractProcessProps {
  onTenantClick?: (tenantId: number) => void;
}

type ProcessStatus = "pending" | "in_progress" | "approved" | "rejected" | "completed";

const ContractProcess: React.FC<ContractProcessProps> = ({ onTenantClick }) => {
  const [filterType, setFilterType] = useState<FilterType>("renewal");
  const [statusFilter, setStatusFilter] = useState<ProcessStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  
  const { 
    leaseRequests, 
    loading, 
    error, 
    statusOptions, 
    currentPage, 
    totalPages, 
    fetchLeaseRequests, 
    handlePageChange 
  } = useLeaseRequests();
  
  const tenants = useTenantData(leaseRequests);

  // Filter tenants by process status
  const filteredByStatus = useMemo(() => {
    if (statusFilter === "all") return tenants;
    
    return tenants.filter((tenant) => {
      const originalRequest = leaseRequests.find((req: any) => req.id === tenant.id);
      if (!originalRequest) return false;
      
      const status = originalRequest.status?.toLowerCase();
      switch (statusFilter) {
        case "pending":
          return status === "pending" || status === "new";
        case "in_progress":
          return status === "in_progress" || status === "processing";
        case "approved":
          return status === "approved";
        case "rejected":
          return status === "rejected" || status === "declined";
        case "completed":
          return status === "completed" || status === "finished";
        default:
          return true;
      }
    });
  }, [tenants, leaseRequests, statusFilter]);

  // Apply filter type (new or renewal)
  const filteredByType = useMemo(() => {
    if (filterType === "new") {
      return filteredByStatus.filter((tenant) => tenant.isNewTenant);
    } else if (filterType === "renewal") {
      return filteredByStatus.filter((tenant) => tenant.isRenewal);
    }
    return filteredByStatus;
  }, [filteredByStatus, filterType]);

  // Apply search filter
  const filteredTenants = useMemo(() => {
    if (!searchQuery.trim()) return filteredByType;
    
    const query = searchQuery.toLowerCase();
    return filteredByType.filter((tenant) => {
      return (
        tenant.customerName?.toLowerCase().includes(query) ||
        tenant.phone?.toLowerCase().includes(query) ||
        tenant.email?.toLowerCase().includes(query) ||
        tenant.businessType?.toLowerCase().includes(query)
      );
    });
  }, [filteredByType, searchQuery]);

  const handleStatusChange = async (tenantId: number, newStatus: string) => {
    // TODO: Implement status update API call
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Гэрээний процесс</h1>
          <p className="text-sm text-slate-500 mt-1">Гэрээний процесс-ийн хяналт ба удирдлага</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Нэр, утас, имэйл эсвэл бизнесийн төрлөөр хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProcessStatus | "all")}
            className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Бүх статус</option>
            <option value="pending">Хүлээгдэж буй</option>
            <option value="in_progress">Боловсруулж байна</option>
            <option value="approved">Баталгаажсан</option>
            <option value="rejected">Татгалзсан</option>
            <option value="completed">Дууссан</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && !loading && <TenantError error={error} onRetry={fetchLeaseRequests} />}

      {/* Statistics */}
      {!error && <TenantStatistics tenants={filteredTenants} loading={loading} />}

      {/* Filter Tabs */}
      <TenantFilterTabs 
        filterType={filterType} 
        onFilterChange={setFilterType} 
        tenants={filteredTenants} 
        showRejected={true} 
      />

      {/* Table */}
      {!error && (
        <>
          <TenantTable
            tenants={filteredTenants}
            loading={loading}
            statusOptions={statusOptions}
            onTenantClick={onTenantClick}
            onStatusChange={handleStatusChange}
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

      {/* Empty State */}
      {!loading && !error && filteredTenants.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">Гэрээний процесс олдсонгүй</h3>
          <p className="text-sm text-slate-500">
            {searchQuery || statusFilter !== "all"
              ? "Хайлтын үр дүн хоосон байна. Өөр хайлт хийж үзнэ үү."
              : "Одоогоор гэрээний процесс байхгүй байна."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContractProcess;

