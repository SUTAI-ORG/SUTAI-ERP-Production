import { useMemo, useState, useEffect } from "react";
import { getProductTypes, getProperties, getServiceCategories } from "@/lib/api";
import { Tenant } from "@/components/admin/tenat/types";

export const useTenantData = (leaseRequests: any[]) => {
  const [productTypes, setProductTypes] = useState<Record<number, string>>({});
  const [properties, setProperties] = useState<Record<number, string>>({});
  const [serviceCategories, setServiceCategories] = useState<Record<number, string>>({});

  useEffect(() => {
    getProductTypes()
      .then((response) => {
        if (response.data?.data) {
          const typesMap: Record<number, string> = {};
          response.data.data.forEach((type: any) => {
            if (type.id) {
              typesMap[type.id] = type.name || type.title || type.label || `Төрөл #${type.id}`;
            }
          });
          setProductTypes(typesMap);
        }
      })
      .catch(() => {
        // Silently fail - will show ID if types not available
      });

    getProperties(1, 100, null, null, null, "created_at", "asc")
      .then((response) => {
        if (response.data?.data) {
          const propertiesMap: Record<number, string> = {};
          response.data.data.forEach((property: any) => {
            if (property.id) {
              propertiesMap[property.id] = property.name || property.number || property.title || `Талбай #${property.id}`;
            }
          });
          setProperties(propertiesMap);
        }
      })
      .catch(() => {
        // Silently fail - will show ID if properties not available
      });

    getServiceCategories()
      .then((response) => {
        if (response.data?.data) {
          const categoriesMap: Record<number, string> = {};
          response.data.data.forEach((category: any) => {
            if (category.id) {
              categoriesMap[category.id] = category.name || category.title || category.label || `Ангилал #${category.id}`;
            }
          });
          setServiceCategories(categoriesMap);
        }
      })
      .catch(() => {
        // Silently fail - will show ID if categories not available
      });
  }, []);

  const tenants: Tenant[] = useMemo(() => {
    if (!leaseRequests || leaseRequests.length === 0) return [];

    return leaseRequests.map((request: any) => {
      const isNewTenant = request.property_id === null || request.property_id === undefined;
      const isRenewal = !isNewTenant;

      let categoryValue = "-";
      // First priority: category_name from API response
      if (request.category_name) {
        categoryValue = request.category_name;
      } else if (request.service_category && typeof request.service_category === "object" && request.service_category !== null) {
        const categoryId = request.service_category.id || request.service_category_id;
        if (categoryId && serviceCategories[categoryId]) {
          categoryValue = serviceCategories[categoryId];
        } else {
          categoryValue = request.service_category.name || request.service_category.title || request.service_category.label || "-";
        }
      } else if (request.service_category_id !== null && request.service_category_id !== undefined) {
        // Try to get category from service_category_id
        if (serviceCategories[request.service_category_id]) {
          categoryValue = serviceCategories[request.service_category_id];
        } else {
          categoryValue = `Ангилал #${request.service_category_id}`;
        }
      } else if (request.category_id !== null && request.category_id !== undefined) {
        // Try to get category from category_id
        if (serviceCategories[request.category_id]) {
          categoryValue = serviceCategories[request.category_id];
        } else {
          categoryValue = `Ангилал #${request.category_id}`;
        }
      } else if (request.service_category && typeof request.service_category === "string") {
        // Handle service_category as string
        categoryValue = request.service_category;
      } else if (request.category) {
        // Handle category object or string
        if (typeof request.category === "string") {
          categoryValue = request.category;
        } else if (typeof request.category === "object" && request.category !== null) {
          const categoryId = request.category.id || request.category_id;
          if (categoryId && serviceCategories[categoryId]) {
            categoryValue = serviceCategories[categoryId];
          } else {
            categoryValue = request.category.name || request.category.title || request.category.label || "-";
          }
        }
      }

      let businessTypeValue = "-";
      // First priority: product_type_name from API response
      if (request.product_type_name) {
        businessTypeValue = request.product_type_name;
      } else if (request.product_type_id !== null && request.product_type_id !== undefined) {
        if (productTypes[request.product_type_id]) {
          businessTypeValue = productTypes[request.product_type_id];
        } else if (request.product_type) {
          if (typeof request.product_type === "string") {
            businessTypeValue = request.product_type;
          } else if (typeof request.product_type === "object" && request.product_type !== null) {
            businessTypeValue = request.product_type.name || request.product_type.title || request.product_type.label || `Төрөл #${request.product_type_id}`;
          }
        } else {
          businessTypeValue = `Төрөл #${request.product_type_id}`;
        }
      } else if (request.product_type) {
        if (typeof request.product_type === "string") {
          businessTypeValue = request.product_type;
        } else if (typeof request.product_type === "object" && request.product_type !== null) {
          businessTypeValue = request.product_type.name || request.product_type.title || request.product_type.label || "-";
        }
      } else if (request.business_type) {
        if (typeof request.business_type === "string") {
          businessTypeValue = request.business_type;
        } else if (typeof request.business_type === "object" && request.business_type !== null) {
          businessTypeValue = request.business_type.name || request.business_type.title || request.business_type.label || "-";
        }
      } else if (request.businessType) {
        if (typeof request.businessType === "string") {
          businessTypeValue = request.businessType;
        } else if (typeof request.businessType === "object" && request.businessType !== null) {
          businessTypeValue = request.businessType.name || request.businessType.title || request.businessType.label || "-";
        }
      }

      let customerNameValue = "-";
      if (request.contact_name) {
        customerNameValue = request.contact_name;
      } else if (request.customer_name) {
        customerNameValue = request.customer_name;
      } else if (request.customerName) {
        customerNameValue = request.customerName;
      } else if (request.name) {
        customerNameValue = request.name;
      }

      let phoneValue = "-";
      if (request.contact_phone) {
        phoneValue = request.contact_phone;
      } else if (request.phone) {
        phoneValue = request.phone;
      } else if (request.contact) {
        phoneValue = request.contact;
      }

      let emailValue = "-";
      if (request.contact_email) {
        emailValue = request.contact_email;
      } else if (request.email) {
        emailValue = request.email;
      }

      let descriptionValue = "-";
      if (request.notes) {
        descriptionValue = request.notes;
      } else if (request.description) {
        descriptionValue = request.description;
      } else if (request.comment) {
        descriptionValue = request.comment;
      }

      // Get property name from properties map
      let propertyNameValue = null;
      if (request.property_id !== null && request.property_id !== undefined) {
        if (properties[request.property_id]) {
          propertyNameValue = properties[request.property_id];
        } else if (request.property && typeof request.property === "object" && request.property !== null) {
          propertyNameValue = request.property.name || request.property.number || request.property.title || null;
        }
      }

      return {
        id: request.id || 0,
        category: categoryValue,
        businessType: businessTypeValue,
        customerName: customerNameValue,
        phone: phoneValue,
        email: emailValue,
        description: descriptionValue,
        isNewTenant,
        isRenewal,
        propertyId: request.property_id || null,
        propertyNumber: request.property_number || null,
        propertyName: propertyNameValue,
        status: request.status || null,
      };
    });
  }, [leaseRequests, productTypes, properties, serviceCategories]);

  return tenants;
};

