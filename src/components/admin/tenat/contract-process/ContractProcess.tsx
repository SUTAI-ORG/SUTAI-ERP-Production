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
  Search
} from "lucide-react";
import { Input } from "../../../ui/input";

interface ContractProcessProps {
  onTenantClick?: (tenantId: number) => void;
}

const ContractProcess: React.FC<ContractProcessProps> = ({ onTenantClick }) => {
  const [filterType, setFilterType] = useState<FilterType>("in_contract_process");
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

  // Filter tenants by status (filterType)
  const filteredByType = useMemo(() => {
    return tenants.filter((tenant) => {
      const originalRequest = leaseRequests.find((req: any) => req.id === tenant.id);
      if (!originalRequest) return false;
      
      // Match the selected status
      return originalRequest.status === filterType;
    });
  }, [tenants, leaseRequests, filterType]);

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

      {/* Search Bar */}
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
        leaseRequests={leaseRequests}
        allowedStatuses={["in_contract_process","cancelled", "rejected"]}
        showAllTab={false}
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
            {searchQuery
              ? "Хайлтын үр дүн хоосон байна. Өөр хайлт хийж үзнэ үү."
              : "Одоогоор гэрээний процесс байхгүй байна."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContractProcess;

