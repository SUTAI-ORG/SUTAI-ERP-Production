import { useState, useEffect } from "react";
import { getLeaseRequests } from "@/lib/api";

export interface LeaseRequest {
  id: number;
  [key: string]: any; // API response structure may vary
}

export interface StatusOptions {
  [key: string]: string;
}

export const useLeaseRequests = () => {
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusOptions, setStatusOptions] = useState<StatusOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchLeaseRequests = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLeaseRequests(page, 20);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Handle different response structures
        let dataArray: any[] = [];
        let paginationInfo: any = {};
        
        // Check if response.data has nested data structure
        if (response.data.data && Array.isArray(response.data.data)) {
          // Structure: { data: { data: [...], last_page: X } }
          dataArray = response.data.data;
          paginationInfo = response.data;
        } else if (Array.isArray(response.data)) {
          // Structure: { data: [...] } - no pagination
          dataArray = response.data;
        }
        
        setLeaseRequests(dataArray);
        
        // Set pagination info
        if (paginationInfo.last_page !== undefined) {
          setTotalPages(paginationInfo.last_page);
        } else if (paginationInfo.total_pages !== undefined) {
          setTotalPages(paginationInfo.total_pages);
        } else if (paginationInfo.current_page !== undefined && paginationInfo.per_page !== undefined) {
          // Calculate total pages from current_page and per_page if total is available
          const total = paginationInfo.total || dataArray.length;
          setTotalPages(Math.ceil(total / (paginationInfo.per_page || 20)));
        } else {
          // If no pagination info, assume single page
          setTotalPages(1);
        }
        
        if (paginationInfo.total !== undefined) {
          setTotalItems(paginationInfo.total);
        } else {
          setTotalItems(dataArray.length);
        }
        
        // Store status options if available
        if (paginationInfo.status_options) {
          setStatusOptions(paginationInfo.status_options);
        } else if ((response.data as any)?.status_options) {
          setStatusOptions((response.data as any).status_options);
        }
      } else {
        setError("Түрээсийн гэрээний мэдээлэл олдсонгүй");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLeaseRequests(page);
  };

  useEffect(() => {
    fetchLeaseRequests(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    leaseRequests,
    loading,
    error,
    statusOptions,
    currentPage,
    totalPages,
    totalItems,
    fetchLeaseRequests,
    handlePageChange,
  };
};

