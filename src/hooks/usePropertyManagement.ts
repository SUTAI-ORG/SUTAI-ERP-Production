import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { getProperties,  getProductTypes, getBlocks, updatePropertyRate } from "@/lib/api";
import { Property, ProductType, Block } from "@/components/admin/property/types";

export const usePropertyManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<number | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<string | null>(null);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<number | null>(null);
  const isInitialMount = useRef(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchProperties = async (page: number, typeId?: number | null, productTypeId?: number | null, search?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const filterTypeId = typeId !== undefined ? typeId : selectedTypeId;
      const filterProductTypeId = productTypeId !== undefined ? productTypeId : selectedProductTypeId;
      const filterSearch = search !== undefined ? search : debouncedSearchQuery;
      const propertiesResponse = await getProperties(page, 32, filterTypeId, filterProductTypeId, filterSearch, "created_at", "desc", selectedRelationship, selectedRelationshipId);

      if (propertiesResponse.error) {
        setError(propertiesResponse.error);
      } else if (propertiesResponse.data) {
        let propertiesData: Property[] = [];
        let paginationInfo: any = {};
        
        const responseData = propertiesResponse.data as any;
        
        if (responseData.data && Array.isArray(responseData.data)) {
          propertiesData = responseData.data;
          paginationInfo = responseData.meta || {};
        } else if (Array.isArray(responseData)) {
          propertiesData = responseData;
        }
        
        setProperties(propertiesData);
        
        if (paginationInfo.last_page !== undefined && paginationInfo.last_page !== null) {
          setTotalPages(paginationInfo.last_page);
        } else if (paginationInfo.total_pages !== undefined && paginationInfo.total_pages !== null) {
          setTotalPages(paginationInfo.total_pages);
        } else if (paginationInfo.total !== undefined && paginationInfo.total !== null && paginationInfo.per_page !== undefined) {
          const total = paginationInfo.total;
          const perPage = paginationInfo.per_page || 32;
          setTotalPages(Math.ceil(total / perPage));
        } else {
          setTotalPages(1);
        }
        
        if (paginationInfo.total !== undefined && paginationInfo.total !== null) {
          setTotalItems(paginationInfo.total);
        } else {
          setTotalItems(propertiesData.length);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductTypes = async () => {
    try {
      const typesResponse = await getProductTypes();
      if (typesResponse.error) {
        // Don't show error toast for 404 - endpoint might not exist
        if (typesResponse.status !== 404) {
          toast.error(`Бүтээгдэхүүний төрөл татахад алдаа гарлаа: ${typesResponse.error}`);
        }
        setProductTypes([]);
      } else if (typesResponse.data) {
        const typesData = typesResponse.data.data || typesResponse.data;
        setProductTypes(Array.isArray(typesData) ? typesData : []);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Бүтээгдэхүүний төрөл татахад алдаа гарлаа";
      // Only show toast for non-404 errors
      if (!errorMsg.includes('404')) {
        toast.error(errorMsg);
      }
      setProductTypes([]);
    }
  };

  const fetchBlocks = async () => {
    try {
      const blocksResponse = await getBlocks();
      if (blocksResponse.error) {
        toast.error(`Блок татахад алдаа гарлаа: ${blocksResponse.error}`);
      } else if (blocksResponse.data) {
        const blocksData = blocksResponse.data.data || blocksResponse.data;
        setBlocks(Array.isArray(blocksData) ? blocksData : []);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Блок татахад алдаа гарлаа";
      toast.error(errorMsg);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchProductTypes();
    fetchBlocks();
    fetchProperties(1, null, null, null);
    isInitialMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset pagination when filter changes
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    
    const fetchWithFilter = async () => {
      setCurrentPage(1);
      setLoading(true);
      setError(null);
      try {
        const propertiesResponse = await getProperties(1, 32, selectedTypeId, selectedProductTypeId, debouncedSearchQuery, "created_at", "desc", selectedRelationship, selectedRelationshipId);
        
        if (propertiesResponse.error) {
          setError(propertiesResponse.error);
        } else if (propertiesResponse.data) {
          let propertiesData: Property[] = [];
          let paginationInfo: any = {};
          
          const responseData = propertiesResponse.data as any;
          
          if (responseData.data && Array.isArray(responseData.data)) {
            propertiesData = responseData.data;
            paginationInfo = responseData.meta || {};
          } else if (Array.isArray(responseData)) {
            propertiesData = responseData;
          }
          
          setProperties(propertiesData);
          
          if (paginationInfo.last_page !== undefined && paginationInfo.last_page !== null) {
            setTotalPages(paginationInfo.last_page);
          } else if (paginationInfo.total_pages !== undefined && paginationInfo.total_pages !== null) {
            setTotalPages(paginationInfo.total_pages);
          } else if (paginationInfo.total !== undefined && paginationInfo.total !== null && paginationInfo.per_page !== undefined) {
            const total = paginationInfo.total;
            const perPage = paginationInfo.per_page || 32;
            setTotalPages(Math.ceil(total / perPage));
          } else {
            setTotalPages(1);
          }
          
          if (paginationInfo.total !== undefined && paginationInfo.total !== null) {
            setTotalItems(paginationInfo.total);
          } else {
            setTotalItems(propertiesData.length);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };
    
    fetchWithFilter();
  }, [selectedTypeId, selectedProductTypeId, debouncedSearchQuery, selectedRelationship, selectedRelationshipId]);

  // Filter properties by filters (client-side filtering for filters that aren't supported server-side)
  const filteredProperties = useMemo(() => {
    let filtered = properties;

    if (selectedTypeId !== null) {
      filtered = filtered.filter((property) => property.type_id === selectedTypeId);
    }

    if (selectedProductTypeId !== null) {
      filtered = filtered.filter((property) => property.product_type_id === selectedProductTypeId);
    }

    return filtered;
  }, [properties, selectedTypeId, selectedProductTypeId]);

  const getPropertyTypeName = (property: Property): string => {
    if (property.type?.name) {
      return property.type.name;
    }
    if (property.type_id) {
      return `Төрөл #${property.type_id}`;
    }
    return "-";
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProperties(page, selectedTypeId, selectedProductTypeId, debouncedSearchQuery);
  };

  const handleClearFilter = (filterType: 'type' | 'productType' | 'search') => {
    switch (filterType) {
      case 'type':
        setSelectedTypeId(null);
        break;
      case 'productType':
        setSelectedProductTypeId(null);
        break;
      case 'search':
        setSearchQuery("");
        break;
    }
  };

  const handleUpdateRate = async (propertyId: number, rateData: {
    rate: number;
    fee: number;
  }) => {
    const property = properties.find((p) => p.id === propertyId);
    const productTypeId = property?.product_type_id ?? property?.product_type?.id ?? null;
    
    if (!property) {
      throw new Error("Талбай олдсонгүй");
    }
    
    const response = await updatePropertyRate(propertyId, {
      year: new Date().getFullYear(),
      rate: rateData.rate,
      fee: rateData.fee,
      start_date: "",
      end_date: "",
    }, productTypeId);
      
    if (response.error || !response.data) {
      const errorMessage = response.message || response.error || `Алдаа гарлаа (Status: ${response.status || 'unknown'})`;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleExportExcel = async () => {
    const confirmed = window.confirm("Талбайн мэдээллийг Excel файл болгон татахад итгэлтэй байна уу?");
    if (!confirmed) {
      return;
    }

    try {
      let allProperties: Property[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      const perPage = 100;

      while (hasMorePages) {
        const response = await getProperties(currentPage, perPage, selectedTypeId, selectedProductTypeId, debouncedSearchQuery, "created_at", "desc", selectedRelationship, selectedRelationshipId);
        if (response.error) {
          toast.error(`Excel татахад алдаа гарлаа: ${response.error}`);
          return;
        }
        
        if (response.data) {
          const responseData = response.data as any;
          let pageProperties: Property[] = [];
          let paginationInfo: any = {};
          
          if (responseData.data && Array.isArray(responseData.data)) {
            pageProperties = responseData.data;
            paginationInfo = responseData.meta || {};
          } else if (Array.isArray(responseData)) {
            pageProperties = responseData;
          }
          
          allProperties = [...allProperties, ...pageProperties];
          
          const totalPages = paginationInfo.last_page || paginationInfo.total_pages || 
            (paginationInfo.total && paginationInfo.per_page 
              ? Math.ceil(paginationInfo.total / paginationInfo.per_page) 
              : 1);
          
          if (currentPage >= totalPages || pageProperties.length < perPage) {
            hasMorePages = false;
          } else {
            currentPage++;
          }
        } else {
          hasMorePages = false;
        }
      }
      
      if (allProperties.length === 0) {
        toast.warning("Татаж болох мэдээлэл байхгүй байна");
        return;
      }
      
      const { exportPropertiesToExcel } = await import("@/utils/excelExport");
      exportPropertiesToExcel(allProperties, 'Талбайн_мэдээлэл');
      toast.success("Excel файл амжилттай татагдлаа");
    } catch (err) {
      toast.error(`Excel татахад алдаа гарлаа: ${err instanceof Error ? err.message : "Алдаа гарлаа"}`);
    }
  };

  return {
    // State
    properties,
    productTypes,
    blocks,
    loading,
    error,
    selectedTypeId,
    selectedProductTypeId,
    selectedRelationship,
    selectedRelationshipId,
    searchQuery,
    currentPage,
    totalPages,
    totalItems,
    filteredProperties,
    
    // Setters
    setSelectedTypeId,
    setSelectedProductTypeId,
    setSelectedRelationship,
    setSelectedRelationshipId,
    setSearchQuery,
    
    // Functions
    fetchProperties,
    handlePageChange,
    handleClearFilter,
    handleUpdateRate,
    handleExportExcel,
    getPropertyTypeName,
  };
};

