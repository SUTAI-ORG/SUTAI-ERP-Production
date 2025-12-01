/**
 * API utility functions for making HTTP requests
 * Supports GET, POST, PATCH, PUT, DELETE methods
 */

// Helper function to normalize URL (remove duplicate protocols)
const normalizeBaseUrl = (url: string): string => {
  if (!url) return "";
  // Remove any existing protocol
  url = url.replace(/^https?:\/\//, "");
  // Ensure it starts with https://
  return `https://${url}`;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL)
  : (process.env.NEXT_PUBLIC_BASE_URL_TEST ? normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL_TEST) : "");

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
}

/**
 * Build URL with query parameters
 */
const buildUrl = (endpoint: string, params?: Record<string, string | number | boolean>, includeApiKeyInQuery?: boolean): string => {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${normalizedEndpoint}`;
  
  const searchParams = new URLSearchParams();
  
  // Add API key to query params if needed
  if (includeApiKeyInQuery && API_KEY) {
    searchParams.append("api-key", API_KEY);
  }
  
  // Add other params
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      // Skip null, undefined, and empty string values
      if (value !== null && value !== undefined && value !== "") {
        searchParams.append(key, String(value));
      }
    });
  }

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

/**
 * Get default headers
 */
const getDefaultHeaders = (customHeaders?: Record<string, string>, includeApiKeyInHeader: boolean = true): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  // Add API key if available (send in headers)
  if (includeApiKeyInHeader && API_KEY) {
    headers["api-key"] = API_KEY;
  }

  // Add auth token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Handle API response
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const status = response.status;
  const contentType = response.headers.get("content-type");


  if (!response.ok) {
    let error = "Алдаа гарлаа";
    let errorData: any = null;
    
    try {
      const text = await response.text();
      if (text) {
        // Check if response is HTML (usually means server error page)
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<!doctype') || text.trim().startsWith('<html')) {
          // Try to extract error message from HTML
          // Look for ParseError, Error, or exception messages in HTML comments or text
          const errorMatch = text.match(/<!--\s*([\s\S]+?)\s*-->/) || 
                            text.match(/ParseError[^<]+/) || 
                            text.match(/Error[^<]+/) ||
                            text.match(/exception[^<]+/i) ||
                            text.match(/Fatal error[^<]+/i);
          
          if (errorMatch) {
            let errorText = (errorMatch[1] || errorMatch[0]).trim();
            // Clean up HTML entities
            errorText = errorText.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
            // Extract the main error message (first line or key part)
            const lines = errorText.split('\n');
            const mainError = lines[0] || errorText;
            error = `Серверийн алдаа: ${mainError.substring(0, 300)}`;
          } else {
            error = `Серверийн алдаа (HTTP ${status}). HTML response ирсэн. Backend дээр алдаа гарсан байна.`;
          }
          return { 
            error, 
            status,
            message: error,
          };
        }
        
        try {
          errorData = JSON.parse(text);
        } catch (parseError) {
          // If JSON parse fails, use text as error
          error = text || response.statusText || `HTTP ${status} алдаа`;
          return { 
            error, 
            status,
            message: error,
          };
        }
        
        // Handle validation errors
        if (errorData.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => {
              const msgs = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgs.join(", ")}`;
            })
            .join("\n");
          error = validationErrors || errorData.message || errorData.error || errorData.msg || error;
        } else {
          error = errorData.message || errorData.error || errorData.msg || errorData.exception || error;
        }
      } else {
        // No response body, use status text
        error = response.statusText || `HTTP ${status} алдаа`;
      }
    } catch (err) {
      error = response.statusText || `HTTP ${status} алдаа`;
      if (process.env.NODE_ENV === 'development') {
        console.error('Error parsing response:', err);
      }
    }
    
    return { 
      error, 
      status,
      message: errorData?.message || error,
    };
  }

  try {
    const text = await response.text();
    let data: T;
    
    // Check if response is HTML (usually means server error page)
    if (text && (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<!doctype') || text.trim().startsWith('<html'))) {
      // Try to extract error message from HTML
      const errorMatch = text.match(/<!--\s*([\s\S]+?)\s*-->/) || 
                        text.match(/ParseError[^<]+/) || 
                        text.match(/Error[^<]+/) ||
                        text.match(/exception[^<]+/i) ||
                        text.match(/Fatal error[^<]+/i);
      
      if (errorMatch) {
        let errorText = (errorMatch[1] || errorMatch[0]).trim();
        // Clean up HTML entities
        errorText = errorText.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        // Extract the main error message (first line or key part)
        const lines = errorText.split('\n');
        const mainError = lines[0] || errorText;
        const errorMessage = `Серверийн алдаа: ${mainError.substring(0, 300)}`;
        return {
          error: errorMessage,
          status: response.status,
          message: errorMessage,
        };
      } else {
        return {
          error: `Серверийн алдаа (HTTP ${response.status}). HTML response ирсэн. Backend дээр алдаа гарсан байна.`,
          status: response.status,
          message: `Серверийн алдаа (HTTP ${response.status}). HTML response ирсэн.`,
        };
      }
    }
    
    if (contentType?.includes("application/json") && text) {
      try {
        data = JSON.parse(text) as T;
      } catch (parseError: any) {
        // Handle trailing data error - try to find valid JSON and ignore trailing data
        if (parseError?.message?.includes('trailing') || parseError?.message?.includes('Trailing')) {
          // Try to find the first valid JSON object/array
          const jsonMatch = text.match(/^[\s\S]*?(\{[\s\S]*\}|\[[\s\S]*\])/);
          if (jsonMatch) {
            try {
              data = JSON.parse(jsonMatch[1]) as T;
            } catch {
              // If still fails, try to extract JSON more carefully
              const firstBrace = text.indexOf('{');
              const firstBracket = text.indexOf('[');
              const startIndex = firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket) ? firstBrace : firstBracket;
              
              if (startIndex !== -1) {
                // Find matching closing brace/bracket
                let depth = 0;
                let endIndex = startIndex;
                const openChar = text[startIndex];
                const closeChar = openChar === '{' ? '}' : ']';
                
                for (let i = startIndex; i < text.length; i++) {
                  if (text[i] === openChar) depth++;
                  if (text[i] === closeChar) depth--;
                  if (depth === 0) {
                    endIndex = i + 1;
                    break;
                  }
                }
                
                if (endIndex > startIndex) {
                  try {
                    data = JSON.parse(text.substring(startIndex, endIndex)) as T;
                  } catch {
                    data = text as T;
                  }
                } else {
                  data = text as T;
                }
              } else {
                data = text as T;
              }
            }
          } else {
            data = text as T;
          }
        } else {
          // If JSON parse fails for other reasons, try to extract JSON from string if it's wrapped
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              data = JSON.parse(jsonMatch[0]) as T;
            } catch {
              data = text as T;
            }
          } else {
            data = text as T;
          }
        }
      }
    } else if (text) {
      // Try to parse as JSON even if content-type doesn't say so
      try {
        data = JSON.parse(text) as T;
      } catch (parseError: any) {
        // Handle trailing data error
        if (parseError?.message?.includes('trailing') || parseError?.message?.includes('Trailing')) {
          const jsonMatch = text.match(/^[\s\S]*?(\{[\s\S]*\}|\[[\s\S]*\])/);
          if (jsonMatch) {
            try {
              data = JSON.parse(jsonMatch[1]) as T;
            } catch {
              data = text as T;
            }
          } else {
            data = text as T;
          }
        } else {
          data = text as T;
        }
      }
    } else {
      data = {} as T;
    }
    
    return { data, status };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      status,
    };
  }
};

/**
 * GET request
 */
export const get = async <T = any>(
  endpoint: string,
  options?: RequestOptions
): Promise<ApiResponse<T>> => {
  try {
    const url = buildUrl(endpoint, options?.params);
    const headers = getDefaultHeaders(options?.headers);

    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: options?.signal,
    });

    return handleResponse<T>(response);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
      status: 0,
    };
  }
};

/**
 * POST request
 */
export const post = async <T = any>(
  endpoint: string,
  body?: any,
  options?: RequestOptions & { apiKeyInQuery?: boolean; apiKeyInHeader?: boolean }
): Promise<ApiResponse<T>> => {
  try {
    const apiKeyInQuery = options?.apiKeyInQuery ?? false;
    const apiKeyInHeader = options?.apiKeyInHeader ?? true;
    
    const url = buildUrl(endpoint, options?.params, apiKeyInQuery);
    const headers = getDefaultHeaders(options?.headers, apiKeyInHeader);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal,
      mode: "cors",
      credentials: "same-origin", // Try same-origin first
      cache: "no-cache",
    });

    return handleResponse<T>(response);
  } catch (error) {
    // Better error handling for network errors
    let errorMessage = "Сүлжээний алдаа";
    
    if (error instanceof TypeError && error.message.includes("fetch")) {
      errorMessage = "Сервертэй холбогдох боломжгүй. CORS эсвэл сүлжээний асуудал байж магадгүй.";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      error: errorMessage,
      status: 0,
    };
  }
};

/**
 * PATCH request
 */
export const patch = async <T = any>(
  endpoint: string,
  body?: any,
  options?: RequestOptions
): Promise<ApiResponse<T>> => {
  try {
    const url = buildUrl(endpoint, options?.params);
    const headers = getDefaultHeaders(options?.headers);

    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });

    return handleResponse<T>(response);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
      status: 0,
    };
  }
};

/**
 * PUT request
 */
export const put = async <T = any>(
  endpoint: string,
  body?: any,
  options?: RequestOptions
): Promise<ApiResponse<T>> => {
  try {
    const url = buildUrl(endpoint, options?.params);
    const headers = getDefaultHeaders(options?.headers);

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });

    return handleResponse<T>(response);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
      status: 0,
    };
  }
};

/**
 * DELETE request
 */
export const del = async <T = any>(
  endpoint: string,
  options?: RequestOptions
): Promise<ApiResponse<T>> => {
  try {
    const url = buildUrl(endpoint, options?.params);
    const headers = getDefaultHeaders(options?.headers);

    const response = await fetch(url, {
      method: "DELETE",
      headers,
      signal: options?.signal,
    });

    return handleResponse<T>(response);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
      status: 0,
    };
  }
};

/**
 * Login API function
 */
export const login = async (
  email: string, 
  password: string,
  options?: { apiKeyInQuery?: boolean; apiKeyInHeader?: boolean }
): Promise<ApiResponse<any>> => {
  return post("/login", { email, password }, options);
};

/**
 * Get roles API function
 */
export const getRoles = async (): Promise<ApiResponse<{ data: Array<{ id: number; title: string; permissions: Array<{ id: number; title: string; pivot?: { role_id: number; permission_id: number } }> }> }>> => {
  return get("/v1/roles");
};

/**
 * Get users API function
 */
export const getUsers = async (): Promise<ApiResponse<{ data: Array<{ id: number; name: string; email: string; phone?: string; roles?: Array<{ id: number; title: string; pivot?: { user_id: number; role_id: number } }> }> }>> => {
  return get("/v1/users");
};

/**
 * Create user API function
 */
export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roles: number[];
}): Promise<ApiResponse<any>> => {
  return post("/v1/users", userData);
};

/**
 * Get permissions API function
 */
export const getPermissions = async (): Promise<ApiResponse<{ data: Array<{ id: number; title: string }> }>> => {
  return get("/v1/permissions");
};

/**
 * Create role API function
 */
export const createRole = async (roleData: {
  title: string;
  permission_ids: number[];
}): Promise<ApiResponse<any>> => {
  // API expects 'permissions' field instead of 'permission_ids'
  const requestData = {
    title: roleData.title,
    permissions: roleData.permission_ids,
  };
  return post("/v1/roles", requestData);
};

/**
 * Update role API function
 */
export const updateRole = async (
  roleId: number,
  roleData: {
    title: string;
    permission_ids: number[];
  }
): Promise<ApiResponse<any>> => {
  // API expects 'permissions' field instead of 'permission_ids'
  const requestData = {
    title: roleData.title,
    permissions: roleData.permission_ids,
  };
  return put(`/v1/roles/${roleId}`, requestData);
};

/**
 * Delete role API function
 */
export const deleteRole = async (roleId: number): Promise<ApiResponse<any>> => {
  return del(`/v1/roles/${roleId}`);
};

/**
 * Create permission API function
 */
export const createPermission = async (permissionData: {
  title: string;
}): Promise<ApiResponse<any>> => {
  return post("/v1/permissions", permissionData);
};

/**
 * Update permission API function
 */
export const updatePermission = async (
  permissionId: number,
  permissionData: {
    title: string;
  }
): Promise<ApiResponse<any>> => {
  return put(`/v1/permissions/${permissionId}`, permissionData);
};

/**
 * Delete permission API function
 */
export const deletePermission = async (permissionId: number): Promise<ApiResponse<any>> => {
  return del(`/v1/permissions/${permissionId}`);
};

/**
 * Get lease requests API function
 */
export const getLeaseRequests = async (
  page: number = 1,
  perPage: number = 20
): Promise<ApiResponse<{ data: any[] }>> => {
  return get("/v1/lease-requests", {
    params: {
      page,
      per_page: perPage,
    },
  });
};

/**
 * Get lease request by ID API function
 */
export const getLeaseRequestById = async (id: number): Promise<ApiResponse<any>> => {
  return get(`/v1/lease-requests/${id}`);
};

/**
 * Get approved lease request by ID API function
 * Uses /v1/lease-requests/checking/requests/:id endpoint
 */
export const getApprovedLeaseRequestById = async (id: number): Promise<ApiResponse<any>> => {
  return get(`/v1/lease-requests/checking/requests/${id}`);
};

/**
 * Update approved lease request attachments with approve/reject status
 * Uses /v1/lease-requests/checking/requests/:id endpoint
 * @param requestId - The lease request ID
 * @param attachments - Array of attachments with id, name, status (approved/rejected)
 * @param notes - Optional object mapping attachment IDs to notes (for rejected attachments)
 */
export const updateApprovedLeaseRequestAttachments = async (
  requestId: number,
  attachments: Array<{
    name: string;
    status: "approved" | "rejected";
    note?: string;
  }>
): Promise<ApiResponse<any>> => {
  // Build request body - only include note if status is rejected
  const attachmentsForAPI = attachments.map((att) => {
    const result: any = {
      name: att.name,
      status: att.status,
    };

    // Only add note if status is rejected and note exists
    if (att.status === "rejected" && att.note) {
      result.note = att.note;
    }

    return result;
  });

  // Validate that all attachments have required fields
  const invalidAttachments = attachmentsForAPI.filter(att =>
    !att.name || !att.status
  );

  if (invalidAttachments.length > 0) {
    return {
      status: 400,
      error: `Invalid attachments in API request: ${JSON.stringify(invalidAttachments)}`
    };
  }

  // If only one attachment is being sent, send it directly as the body
  // Otherwise, send the attachments array wrapped in an object
  const requestBody = attachmentsForAPI.length === 1 ? attachmentsForAPI[0] : { attachments: attachmentsForAPI };

  return put(`/v1/lease-requests/checking/requests/${requestId}`, requestBody);
};

/**
 * Update lease request status API function
 */
export const updateLeaseRequestStatus = async (
  id: number,
  status: string
): Promise<ApiResponse<any>> => {
  return put(`/v1/lease-requests/${id}/approve`, { status });
};

/**
 * Approve lease request API function
 * Uses /v1/lease-requests/:id/approve endpoint
 */
export const approveLeaseRequest = async (id: number): Promise<ApiResponse<any>> => {
  // Use PUT method to approve lease request
  // Send undefined instead of {} to avoid sending empty body
  return put(`/v1/lease-requests/${id}/approve`, undefined);
};

/**
 * Reject lease request API function
 * Uses /v1/lease-requests/:id/reject endpoint
 */
export const rejectLeaseRequest = async (id: number): Promise<ApiResponse<any>> => {
  // Use PUT method to reject lease request
  // Send undefined instead of {} to avoid sending empty body
  return put(`/v1/lease-requests/${id}/reject`, undefined);
};

/**
 * Get product types API function
 */
export const getProductTypes = async (): Promise<ApiResponse<{ data: any[] }>> => {
  return get("/v1/product-types");
};

/**
 * Get properties API function
 */
export const getProperties = async (
  page: number = 1,
  perPage: number = 32,
  typeId?: number | null,
  productTypeId?: number | null,
  search?: string | null,
  orderby?: string | null,
  order?: string | null,
  relationship?: string | null,
  relationshipId?: number | null
): Promise<ApiResponse<{ data: any[] }>> => {
  const params: Record<string, string | number> = {
    page,
    per_page: perPage,
  };
  
  // Add orderby parameter (default: created_at)
  if (orderby !== null && orderby !== undefined && orderby.trim() !== "") {
    params.orderby = orderby.trim();
  } else {
    params.orderby = "created_at";
  }
  
  // Add order parameter (default: desc)
  if (order !== null && order !== undefined && order.trim() !== "") {
    params.order = order.trim();
  } else {
    params.order = "desc";
  }
  
  // Add relationship parameter
  if (relationship !== null && relationship !== undefined && relationship.trim() !== "") {
    params.relationship = relationship.trim();
  }
  
  // Add relationship_id parameter
  if (relationshipId !== null && relationshipId !== undefined && relationshipId !== 0) {
    params.relationship_id = relationshipId;
  }
  
  // Add search query parameter (using 'q' instead of 'search')
  if (search !== null && search !== undefined && search.trim() !== "") {
    params.q = search.trim();
  }
  
  if (typeId !== null && typeId !== undefined && typeId !== 0) {
    params.type_id = typeId;
  }
  
  // Fix: Ensure product_type_id is added when productTypeId is provided
  if (productTypeId !== null && productTypeId !== undefined && productTypeId !== 0) {
    params.product_type_id = productTypeId;
  }
  
  return get("/v1/properties", {
    params,
  });
};

/**
 * Get single property by ID API function
 */
export const getProperty = async (propertyId: number): Promise<ApiResponse<any>> => {
  return get(`/v1/properties/${propertyId}`);
};

/**
 * Get property annual rates by property ID API function
 */
export const getPropertyAnnualRates = async (propertyId: number): Promise<ApiResponse<any>> => {
  return get(`/v1/properties/${propertyId}/annual-rates`);
};

/**
 * Get property types API function
 */
export const getPropertyTypes = async (): Promise<ApiResponse<{ data: any[] }>> => {
  return get("/v1/property-types");
};

/**
 * Get service categories API function
 */
export const getServiceCategories = async (): Promise<ApiResponse<{ data: any[] }>> => {
  return get("/v1/service-categories");
};

/**
 * Get blocks API function
 */
export const getBlocks = async (): Promise<ApiResponse<{ data: any[] }>> => {
  return get("/v1/properties/blocks");
};

/**
 * Update property rate API function
 */
export const updatePropertyRate = async (
  propertyId: number,
  rateData: {
    year: number;
    rate: number;
    fee: number;
    start_date: string;
    end_date: string;
  },
  productTypeId?: number | null
): Promise<ApiResponse<any>> => {
  const requestBody: any = {
    property_id: propertyId,
    year: rateData.year,
    rate: rateData.rate,
    fee: rateData.fee,
    start_date: rateData.start_date,
    end_date: rateData.end_date,
  };
  
  // Add product_type_id if provided
  if (productTypeId !== null && productTypeId !== undefined && productTypeId !== 0) {
    requestBody.product_type_id = productTypeId;
  }
  
  const response = await put(`/v1/properties/${propertyId}/rate`, requestBody);
  
  return response;
};

/**
 * Get annual rates API function
 */
export const getAnnualRates = async (
  propertyId?: number | null,
  year?: number | null,
  page?: number | null,
  perPage?: number | null
): Promise<ApiResponse<{ data: any[] }>> => {
  const params: Record<string, string | number> = {};
  
  if (propertyId !== null && propertyId !== undefined && propertyId !== 0) {
    params.property_id = propertyId;
  }
  
  if (year !== null && year !== undefined && year !== 0) {
    params.year = year;
  }
  
  if (page !== null && page !== undefined && page > 0) {
    params.page = page;
  }
  
  if (perPage !== null && perPage !== undefined && perPage > 0) {
    params.per_page = perPage;
  }
  
  return get("/v1/annual-rates", {
    params,
  });
};

/**
 * Create annual rate API function (creates a rate request)
 */
export const createAnnualRate = async (
  rateData: {
    property_id: number;
    year: number;
    rate: number;
    fee: number;
    start_date: string;
    end_date: string;
    product_type_id?: number | null;
  }
): Promise<ApiResponse<any>> => {
  const requestBody: any = {
    property_id: rateData.property_id,
    year: rateData.year,
    rate: rateData.rate,
    fee: rateData.fee,
    start_date: rateData.start_date,
    end_date: rateData.end_date,
  };
  
  if (rateData.product_type_id !== null && rateData.product_type_id !== undefined && rateData.product_type_id !== 0) {
    requestBody.product_type_id = rateData.product_type_id;
  }
  
  return post("/v1/annual-rates", requestBody);
};

/**
 * Approve annual rate request API function
 * Uses /v1/annual-rates/:id/approve endpoint
 */
export const approveAnnualRate = async (propertyId: number, rateId: number): Promise<ApiResponse<any>> => {
  // Use PUT method to approve annual rate
  // Send undefined instead of {} to avoid sending empty body
  return put(`/v1/annual-rates/${rateId}/approve`, undefined);
};

/**
 * Reject annual rate request API function
 * Note: Reject endpoint is not available, this function is kept for compatibility
 */
export const rejectAnnualRate = async (propertyId: number, rateId: number): Promise<ApiResponse<any>> => {
  // Reject endpoint doesn't exist, return error
  return {
    error: "Reject функц одоогоор дэмжигдэхгүй байна",
    status: 404,
  };
};

/**
 * Create property API function
 */
export const createProperty = async (
  propertyData: {
    number?: string;
    name?: string;
    description?: string | null;
    x?: number | null;
    y?: number | null;
    length?: number | null;
    width?: number | null;
    area_size?: number | null;
    block_id?: number | null;
    tenant_id?: number | null;
    type_id?: number | null;
    product_type_id?: number | null;
    status_id?: number | null;
  }
): Promise<ApiResponse<any>> => {
  const response = await post(`/v1/properties`, propertyData);
  
  return response;
};

/**
 * Update property API function
 */
export const updateProperty = async (
  propertyId: number,
  propertyData: {
    number?: string;
    name?: string;
    description?: string | null;
    x?: number | null;
    y?: number | null;
    length?: number | null;
    width?: number | null;
    area_size?: number | null;
    block_id?: number | null;
    tenant_id?: number | null;
    type_id?: number | null;
    product_type_id?: number | null;
    status_id?: number | null;
  }
): Promise<ApiResponse<any>> => {
  const response = await put(`/v1/properties/${propertyId}`, propertyData);
  
  return response;
};

