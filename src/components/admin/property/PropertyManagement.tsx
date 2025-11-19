"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getProperties, getProperty, getPropertyTypes, getProductTypes, getServiceCategories, getBlocks, updatePropertyRate, createAnnualRate, approveAnnualRate, rejectAnnualRate, getAnnualRates } from "@/lib/api";
import { Pagination } from "../../ui/pagination";
import PropertyHeader from "./PropertyHeader";
import PropertyStatistics from "./PropertyStatistics";
import PropertySearchAndFilter from "./PropertySearchAndFilter";
import PropertyTable from "./PropertyTable";
import { UpdateRateModal } from "./UpdateRateModal";
import { CreatePropertyModal } from "./CreatePropertyModal";
import { Property, PropertyType, ProductType, ServiceCategory, Block } from "./types";
import { exportPropertiesToExcel } from "@/utils/excelExport";

const PropertyManagement: React.FC = () => {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<number | null>(null);
  const [selectedServiceCategoryId, setSelectedServiceCategoryId] = useState<number | null>(null);
  const isInitialMount = useRef(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isCreatePropertyModalOpen, setIsCreatePropertyModalOpen] = useState(false);

  const fetchProperties = async (page: number, typeId?: number | null, productTypeId?: number | null, search?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      // Use typeId if provided, otherwise use selectedTypeId from state
      const filterTypeId = typeId !== undefined ? typeId : selectedTypeId;
      const filterProductTypeId = productTypeId !== undefined ? productTypeId : selectedProductTypeId;
      const filterSearch = search !== undefined ? search : debouncedSearchQuery;
      const propertiesResponse = await getProperties(page, 32, filterTypeId, filterProductTypeId, filterSearch);

      if (propertiesResponse.error) {
        setError(propertiesResponse.error);
      } else if (propertiesResponse.data) {
        // Handle different response structures
        let propertiesData: Property[] = [];
        let paginationInfo: any = {};
        
        // Check response structure
        const responseData = propertiesResponse.data as any;
        
        if (responseData.data && Array.isArray(responseData.data)) {
          // Structure: { data: [...], meta: {...} }
          propertiesData = responseData.data;
          paginationInfo = responseData.meta || {};
        } else if (Array.isArray(responseData)) {
          // Structure: { data: [...] } - no pagination
          propertiesData = responseData;
        }
        
        // Fetch approved rates for all properties and attach the latest approved rate
        // If no approved rate, use the current active rate from property
        try {
          // Fetch approved rates with pagination limit to avoid too many requests
          let allApprovedRates: any[] = [];
          let currentPage = 1;
          let hasMorePages = true;
          const perPage = 50; // Fetch 50 per page as per API specification
          const maxPages = 5; // Limit to maximum 5 pages to avoid rate limiting
          
          while (hasMorePages && currentPage <= maxPages) {
            const ratesResponse = await getAnnualRates(null, null, currentPage, perPage);
            
            // Handle rate limiting errors
            if (ratesResponse.status === 429 || (ratesResponse.error && ratesResponse.error.includes("Too Many Attempts"))) {
              console.warn("Rate limit reached, stopping rate fetch");
              break;
            }
            
            if (ratesResponse.error && ratesResponse.status !== 404) {
              console.warn("Error fetching rates:", ratesResponse.error);
              break;
            }
            
            if (ratesResponse.data) {
              const responseData = ratesResponse.data as any;
              const ratesArray = responseData.data || (Array.isArray(responseData) ? responseData : []);
              
              // Filter only approved rates (status_id === 29 or status.id === 29)
              const pageApprovedRates = Array.isArray(ratesArray) 
                ? ratesArray.filter((rate: any) => 
                    rate.status_id === 29 || 
                    rate.status?.id === 29 ||
                    rate.status?.name === "active"
                  )
                : [];
              
              allApprovedRates = [...allApprovedRates, ...pageApprovedRates];
              
              // Check pagination info
              const paginationInfo = responseData.meta || {};
              const totalPages = paginationInfo.last_page || paginationInfo.total_pages || 
                (paginationInfo.total && paginationInfo.per_page 
                  ? Math.ceil(paginationInfo.total / paginationInfo.per_page) 
                  : 1);
              
              if (currentPage >= totalPages || ratesArray.length < perPage) {
                hasMorePages = false;
              } else {
                currentPage++;
              }
            } else {
              hasMorePages = false;
            }
          }
          
          // Debug log: total approved rates found
          if (process.env.NODE_ENV === 'development') {
            console.log(`Total approved rates found: ${allApprovedRates.length}`, {
              sampleRates: allApprovedRates.slice(0, 5).map((r: any) => ({
                id: r.id,
                property_id: r.property_id,
                rate: r.rate,
                status_id: r.status_id,
              })),
            });
          }
          
          // Map approved rates to properties - find the latest approved rate for each property
          const propertiesWithApprovedRates = propertiesData.map((prop: Property) => {
            // Find all approved rates for this property
            const propertyApprovedRates = allApprovedRates.filter((rate: any) => rate.property_id === prop.id);
            
            if (propertyApprovedRates.length > 0) {
              // Sort by created_at descending to get the latest approved rate
              const sortedRates = propertyApprovedRates.sort((a: any, b: any) => {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
              });
              
              const latestApprovedRate = sortedRates[0];
              
              // Debug log
              if (process.env.NODE_ENV === 'development') {
                console.log(`Property ${prop.id} (${prop.number}): Found approved rate`, {
                  rateId: latestApprovedRate.id,
                  rate: latestApprovedRate.rate,
                  statusId: latestApprovedRate.status_id,
                  year: latestApprovedRate.year,
                });
              }
              
              // Use approved rate
              return {
                ...prop,
                rate: latestApprovedRate,
              };
            }
            
            // Debug log for properties without approved rates
            if (process.env.NODE_ENV === 'development') {
              console.log(`Property ${prop.id} (${prop.number}): No approved rate found, using property.rate:`, prop.rate);
            }
            
            // If no approved rate, use the current active rate from property (if exists)
            // This is the fallback to show active rate when no approved rate exists
            return prop;
          });
          
          propertiesData = propertiesWithApprovedRates;
        } catch (ratesError) {
          // If fetching rates fails, just use properties without rates
          console.error("Failed to fetch approved rates:", ratesError);
        }
        
        setProperties(propertiesData);
        
        // Set pagination info - prioritize API response values
        if (paginationInfo.last_page !== undefined && paginationInfo.last_page !== null) {
          // Use last_page from API if available
          setTotalPages(paginationInfo.last_page);
        } else if (paginationInfo.total_pages !== undefined && paginationInfo.total_pages !== null) {
          // Use total_pages from API if available
          setTotalPages(paginationInfo.total_pages);
        } else if (paginationInfo.total !== undefined && paginationInfo.total !== null && paginationInfo.per_page !== undefined) {
          // Calculate total pages from total and per_page
          const total = paginationInfo.total;
          const perPage = paginationInfo.per_page || 32;
          setTotalPages(Math.ceil(total / perPage));
        } else {
          // If no pagination info, assume single page
          setTotalPages(1);
        }
        
        // Set total items
        if (paginationInfo.total !== undefined && paginationInfo.total !== null) {
          setTotalItems(paginationInfo.total);
        } else {
          // Fallback to current page items count
          setTotalItems(propertiesData.length);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyTypes = async () => {
    try {
      const typesResponse = await getPropertyTypes();
      if (typesResponse.error) {
        console.error("Failed to fetch property types:", typesResponse.error);
      } else if (typesResponse.data) {
        const typesData = typesResponse.data.data || typesResponse.data;
        setPropertyTypes(Array.isArray(typesData) ? typesData : []);
      }
    } catch (err) {
      console.error("Failed to fetch property types:", err);
    }
  };

  const fetchProductTypes = async () => {
    try {
      const typesResponse = await getProductTypes();
      if (typesResponse.error) {
        console.error("Failed to fetch product types:", typesResponse.error);
      } else if (typesResponse.data) {
        const typesData = typesResponse.data.data || typesResponse.data;
        setProductTypes(Array.isArray(typesData) ? typesData : []);
      }
    } catch (err) {
      console.error("Failed to fetch product types:", err);
    }
  };

  const fetchServiceCategories = async () => {
    try {
      const categoriesResponse = await getServiceCategories();
      if (categoriesResponse.error) {
        console.error("Failed to fetch service categories:", categoriesResponse.error);
      } else if (categoriesResponse.data) {
        const categoriesData = categoriesResponse.data.data || categoriesResponse.data;
        setServiceCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
    } catch (err) {
      console.error("Failed to fetch service categories:", err);
    }
  };

  const fetchBlocks = async () => {
    try {
      const blocksResponse = await getBlocks();
      if (blocksResponse.error) {
        console.error("Failed to fetch blocks:", blocksResponse.error);
      } else if (blocksResponse.data) {
        const blocksData = blocksResponse.data.data || blocksResponse.data;
        setBlocks(Array.isArray(blocksData) ? blocksData : []);
      }
    } catch (err) {
      console.error("Failed to fetch blocks:", err);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchPropertyTypes();
    fetchProductTypes();
    fetchServiceCategories();
    fetchBlocks();
    // Initial fetch with no filter
    fetchProperties(1, null, null, null);
    isInitialMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProperties(page, selectedTypeId, selectedProductTypeId, debouncedSearchQuery);
  };

  // Reset pagination when filter changes
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      return;
    }
    
    const fetchWithFilter = async () => {
      setCurrentPage(1);
      setLoading(true);
      setError(null);
      try {
        const propertiesResponse = await getProperties(1, 32, selectedTypeId, selectedProductTypeId, debouncedSearchQuery);
        
        if (propertiesResponse.error) {
          setError(propertiesResponse.error);
        } else if (propertiesResponse.data) {
          // Handle different response structures
          let propertiesData: Property[] = [];
          let paginationInfo: any = {};
          
          // Check response structure
          const responseData = propertiesResponse.data as any;
          
          if (responseData.data && Array.isArray(responseData.data)) {
            // Structure: { data: [...], meta: {...} }
            propertiesData = responseData.data;
            paginationInfo = responseData.meta || {};
          } else if (Array.isArray(responseData)) {
            // Structure: { data: [...] } - no pagination
            propertiesData = responseData;
          }
          
          setProperties(propertiesData);
          
          // Set pagination info - prioritize API response values
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTypeId, selectedProductTypeId, debouncedSearchQuery]);

  // Filter properties by filters (client-side filtering for filters that aren't supported server-side)
  // Note: Search query is now handled server-side via API
  // Filter product types based on selected service category
  const filteredProductTypes = useMemo(() => {
    if (!selectedServiceCategoryId) {
      return productTypes;
    }
    return productTypes.filter((productType) => productType.category_id === selectedServiceCategoryId);
  }, [productTypes, selectedServiceCategoryId]);

  const filteredProperties = useMemo(() => {
    let filtered = properties;

    // Filter by type (if server-side filtering didn't work, apply client-side)
    if (selectedTypeId !== null) {
      filtered = filtered.filter((property) => property.type_id === selectedTypeId);
    }

    // Filter by product type (if server-side filtering didn't work, apply client-side)
    if (selectedProductTypeId !== null) {
      filtered = filtered.filter((property) => property.product_type_id === selectedProductTypeId);
    }

    // Filter by service category (if property has category_id that matches service category)
    if (selectedServiceCategoryId !== null) {
      filtered = filtered.filter((property) => {
        // Check if product_type has category_id matching selectedServiceCategoryId
        return property.product_type?.category_id === selectedServiceCategoryId;
      });
    }

    return filtered;
  }, [properties, selectedTypeId, selectedProductTypeId, selectedServiceCategoryId]);

  const getPropertyTypeName = (property: Property): string => {
    if (property.type?.name) {
      return property.type.name;
    }
    if (property.type_id) {
      const type = propertyTypes.find((t) => t.id === property.type_id);
      return type?.name || `Төрөл #${property.type_id}`;
    }
    return "-";
  };

  const handleClearFilter = (filterType: 'type' | 'productType' | 'serviceCategory' | 'search') => {
    switch (filterType) {
      case 'type':
        setSelectedTypeId(null);
        break;
      case 'productType':
        setSelectedProductTypeId(null);
        break;
      case 'serviceCategory':
        setSelectedServiceCategoryId(null);
        break;
      case 'search':
        setSearchQuery("");
        break;
    }
  };

  const handleRateClick = (property: Property) => {
    setSelectedProperty(property);
    setIsRateModalOpen(true);
  };

  const handleEdit = (property: Property) => {
    // TODO: Implement edit functionality
    console.log("Edit property:", property);
    toast.info("Засах функц хэрэгжүүлэгдээгүй байна");
  };

  const handleAdd = () => {
    setIsCreatePropertyModalOpen(true);
  };

  const handleCreatePropertySuccess = async () => {
    // Refresh properties after successful creation
    await fetchProperties(currentPage, selectedTypeId, selectedProductTypeId, debouncedSearchQuery);
  };

  const handleApproveRate = async (propertyId: number, rateId: number) => {
    if (!rateId || rateId === 0) {
      console.error("Invalid rateId:", rateId);
      throw new Error("Үнэлгээний ID буруу байна");
    }
    
    try {
      const response = await approveAnnualRate(propertyId, rateId);
      if (response.error) {
        throw new Error(response.error || "Баталгаажуулахад алдаа гарлаа");
      }
      // Refresh properties after approval
      await fetchProperties(currentPage, selectedTypeId, selectedProductTypeId, debouncedSearchQuery);
    } catch (error) {
      console.error("Failed to approve rate:", error);
      throw error;
    }
  };

  const handleRejectRate = async (propertyId: number, rateId: number) => {
    try {
      const response = await rejectAnnualRate(propertyId, rateId);
      if (response.error) {
        throw new Error(response.error || "Татгалзахад алдаа гарлаа");
      }
      // Refresh properties after rejection
      await fetchProperties(currentPage, selectedTypeId, selectedProductTypeId, debouncedSearchQuery);
    } catch (error) {
      console.error("Failed to reject rate:", error);
      throw error;
    }
  };

  const handleDetailClick = (property: Property) => {
    // Navigate to property detail page
    router.push(`/main/properties/${property.id}`);
  };


  const handleUpdateRate = async (propertyId: number, rateData: {
    year: number;
    rate: number;
    fee: number;
    start_date: string;
    end_date: string;
  }) => {
    // Find the property to get product_type_id
    const property = properties.find((p) => p.id === propertyId);
    const productTypeId = property?.product_type_id ?? property?.product_type?.id ?? null;
    
    // Validate that property exists
    if (!property) {
      throw new Error("Талбай олдсонгүй");
    }
    
    // Create rate request instead of directly updating
    const response = await createAnnualRate({
      property_id: propertyId,
      year: rateData.year,
      rate: rateData.rate,
      fee: rateData.fee,
      start_date: rateData.start_date,
      end_date: rateData.end_date,
      product_type_id: productTypeId,
    });
    
    // Log full response for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log("Rate request creation response:", response);
    }
    
    if (response.error || !response.data) {
      // Show detailed error message
      const errorMessage = response.message || response.error || `Алдаа гарлаа (Status: ${response.status || 'unknown'})`;
      
      // Safely serialize response for logging
      let serializedResponse: any = {};
      try {
        // Try to serialize the response, handling undefined values
        serializedResponse = {
          error: response.error ?? null,
          message: response.message ?? null,
          status: response.status ?? null,
          data: response.data ?? null,
        };
        
        // If response has additional properties, try to include them
        if (response && typeof response === 'object') {
          Object.keys(response).forEach(key => {
            if (!serializedResponse.hasOwnProperty(key)) {
              try {
                serializedResponse[key] = response[key as keyof typeof response];
              } catch (e) {
                serializedResponse[key] = '[Unable to serialize]';
              }
            }
          });
        }
      } catch (serializeError) {
        serializedResponse = { error: 'Failed to serialize response', originalError: String(serializeError) };
      }
      
      console.error("Rate request creation error details:", {
        propertyId,
        productTypeId,
        rateData,
        requestBody: {
          property_id: propertyId,
          year: rateData.year,
          rate: rateData.rate,
          fee: rateData.fee,
          start_date: rateData.start_date,
          end_date: rateData.end_date,
          product_type_id: productTypeId,
        },
        response: serializedResponse,
        responseError: response.error,
        responseMessage: response.message,
        responseStatus: response.status,
        responseData: response.data,
      });
      throw new Error(errorMessage);
    }
  };

  const handleRateSuccess = async () => {
    try {
      // Refresh properties after successful rate update
      await fetchProperties(currentPage, selectedTypeId, selectedProductTypeId, debouncedSearchQuery);
      console.log('Properties refreshed after rate update');
    } catch (error) {
      console.error('Error refreshing properties:', error);
    }
  };


  const handleExportExcel = async () => {
    // Ask for confirmation
    const confirmed = window.confirm("Талбайн мэдээллийг Excel файл болгон татахад итгэлтэй байна уу?");
    if (!confirmed) {
      return;
    }

    try {
      let allProperties: Property[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      const perPage = 100; // Fetch 100 per page

      // Fetch all pages
      while (hasMorePages) {
        const response = await getProperties(currentPage, perPage, selectedTypeId, selectedProductTypeId, debouncedSearchQuery);
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
          
          // Check if there are more pages
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
      
      exportPropertiesToExcel(allProperties, 'Талбайн_мэдээлэл');
      toast.success("Excel файл амжилттай татагдлаа");
    } catch (err) {
      toast.error(`Excel татахад алдаа гарлаа: ${err instanceof Error ? err.message : "Алдаа гарлаа"}`);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-slate-500">Мэдээлэл татаж байна...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PropertyHeader 
        onExportExcel={handleExportExcel}
        onAddClick={handleAdd}
      />

      <>
          <PropertyStatistics
            totalItems={totalItems || properties.length}
            currentPageItems={filteredProperties.length}
            propertyTypesCount={propertyTypes.length}
          />

          <PropertySearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTypeId={selectedTypeId}
        onTypeChange={setSelectedTypeId}
        selectedProductTypeId={selectedProductTypeId}
        onProductTypeChange={setSelectedProductTypeId}
        selectedServiceCategoryId={selectedServiceCategoryId}
        onServiceCategoryChange={(categoryId) => {
          setSelectedServiceCategoryId(categoryId);
          // Reset product type selection when service category changes
          setSelectedProductTypeId(null);
        }}
        propertyTypes={propertyTypes}
        productTypes={filteredProductTypes}
        serviceCategories={serviceCategories}
      />

      <PropertyTable
        properties={filteredProperties}
        propertyTypes={propertyTypes}
        productTypes={productTypes}
        serviceCategories={serviceCategories}
        getPropertyTypeName={getPropertyTypeName}
        selectedTypeId={selectedTypeId}
        selectedProductTypeId={selectedProductTypeId}
        selectedServiceCategoryId={selectedServiceCategoryId}
        searchQuery={searchQuery}
        onClearFilter={handleClearFilter}
        onRateClick={handleRateClick}
        onDetailClick={handleDetailClick}
      />

      {/* Pagination */}
      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          loading={loading}
        />
      )}

          {/* Rate Update Modal */}
          {isRateModalOpen && (
            <UpdateRateModal
              property={selectedProperty}
              onClose={() => {
                setIsRateModalOpen(false);
                setSelectedProperty(null);
              }}
              onSuccess={handleRateSuccess}
              onUpdateRate={handleUpdateRate}
            />
          )}

          {/* Create Property Modal */}
          {isCreatePropertyModalOpen && (
            <CreatePropertyModal
              onClose={() => setIsCreatePropertyModalOpen(false)}
              onSuccess={handleCreatePropertySuccess}
            />
          )}
        </>

    </div>
  );
};

export default PropertyManagement;

