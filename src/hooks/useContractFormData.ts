import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getApprovedLeaseRequestById } from "@/lib/api";
import {
  extractAttachments,
  buildAttachmentMap,
  buildAttachmentUrlsMap,
  getStepApprovalStatus,
} from "@/components/admin/tenat/contract-tenant/utils/attachmentUtils";

interface UseContractFormDataProps {
  tenantId: number;
}

export const useContractFormData = ({ tenantId }: UseContractFormDataProps) => {
  const [loading, setLoading] = useState(true);
  const [tenantName, setTenantName] = useState(`Tenant ${tenantId}`);
  const [requestData, setRequestData] = useState<any>(null);
  const [attachmentMap, setAttachmentMap] = useState<Record<string, any[]>>({});
  const [attachmentList, setAttachmentList] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<{
    [key: string]: any;
  }>({});
  const [stepApprovals, setStepApprovals] = useState<Record<number, boolean | null>>({});

  useEffect(() => {
    const fetchLeaseRequest = async () => {
      setLoading(true);
      try {
        const response = await getApprovedLeaseRequestById(tenantId);
        
        if (response.data) {
          const responseData = response.data;
          
          const data = responseData.data || responseData;
          
          // Extract attachments using utility function
          const attachments = extractAttachments(responseData, data);
          
          const attachmentListData = responseData.attachment_list || data.attachment_list || {};
          setAttachmentList(attachmentListData);
          
          // Store request data for display
          setRequestData(data);
          
          // Set tenant name
          if (data.contact_name) {
            setTenantName(data.contact_name);
          } else if (data.customer_name) {
            setTenantName(data.customer_name);
          } else if (data.name) {
            setTenantName(data.name);
          } else if (data.merchant?.name) {
            setTenantName(data.merchant.name);
          }

          // Build attachment map
          const newAttachmentMap = buildAttachmentMap(attachments);
          setAttachmentMap(newAttachmentMap);

          // Build attachment URLs map
          const attachmentUrlsMap = buildAttachmentUrlsMap(newAttachmentMap);

          // Build formData dynamically based on attachment types
          const newFormData: any = {
            hasCollateralDifference: (newAttachmentMap["deposit_receipt"] || []).length > 0,
            collateralDifferenceAmount: data.deposit_amount?.toString() || "",
          };
          
          // Add image arrays for each attachment type
          Object.keys(attachmentUrlsMap).forEach((name) => {
            // Convert snake_case to camelCase for field names
            const camelCaseName = name.split('_').map((word, index) => 
              index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
            ).join('') + 'Images';
            newFormData[camelCaseName] = attachmentUrlsMap[name];
          });
          
          // Keep backward compatibility with old field names
          if (attachmentUrlsMap["request"]) {
            newFormData.leaseRequestImages = attachmentUrlsMap["request"];
          }
          if (attachmentUrlsMap["deposit_receipt"]) {
            newFormData.depositReceiptImages = attachmentUrlsMap["deposit_receipt"];
          }
          if (attachmentUrlsMap["id_doc"]) {
            newFormData.directorIdImages = attachmentUrlsMap["id_doc"];
          }
          if (attachmentUrlsMap["organization_certificate"]) {
            newFormData.organizationCertificateImages = attachmentUrlsMap["organization_certificate"];
          }
          if (attachmentUrlsMap["business_regulations"]) {
            newFormData.businessRegulationsImages = attachmentUrlsMap["business_regulations"];
          }
          
          setFormData(newFormData);

          // Build stepApprovals dynamically based on attachment types
          const newStepApprovals: Record<number, boolean | null> = {};
          Object.keys(newAttachmentMap).forEach((name, index) => {
            const attachments = newAttachmentMap[name] || [];
            newStepApprovals[index + 1] = getStepApprovalStatus(attachments);
          });
          
          setStepApprovals(newStepApprovals);
        }
      } catch (error) {
        toast.error("Мэдээлэл татахад алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchLeaseRequest();
    }
  }, [tenantId]);

  const refreshData = async () => {
    try {
      const response = await getApprovedLeaseRequestById(tenantId);
      if (response.data) {
        const responseData = response.data;
        const data = responseData.data || responseData;
        const attachments = extractAttachments(responseData, data);
        
        const newAttachmentMap = buildAttachmentMap(attachments);
        setAttachmentMap(newAttachmentMap);
        
        const attachmentUrlsMap = buildAttachmentUrlsMap(newAttachmentMap);
        
        const newFormData: any = {
          hasCollateralDifference: (newAttachmentMap["deposit_receipt"] || []).length > 0,
          collateralDifferenceAmount: data.deposit_amount?.toString() || "",
        };
        
        Object.keys(attachmentUrlsMap).forEach((name) => {
          const camelCaseName = name.split('_').map((word, index) => 
            index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
          ).join('') + 'Images';
          newFormData[camelCaseName] = attachmentUrlsMap[name];
        });
        
        if (attachmentUrlsMap["request"]) {
          newFormData.leaseRequestImages = attachmentUrlsMap["request"];
        }
        if (attachmentUrlsMap["deposit_receipt"]) {
          newFormData.depositReceiptImages = attachmentUrlsMap["deposit_receipt"];
        }
        if (attachmentUrlsMap["id_doc"]) {
          newFormData.directorIdImages = attachmentUrlsMap["id_doc"];
        }
        if (attachmentUrlsMap["organization_certificate"]) {
          newFormData.organizationCertificateImages = attachmentUrlsMap["organization_certificate"];
        }
        if (attachmentUrlsMap["business_regulations"]) {
          newFormData.businessRegulationsImages = attachmentUrlsMap["business_regulations"];
        }
        
        setFormData(newFormData);
        
        const newStepApprovals: Record<number, boolean | null> = {};
        Object.keys(newAttachmentMap).forEach((name, index) => {
          const attachments = newAttachmentMap[name] || [];
          newStepApprovals[index + 1] = getStepApprovalStatus(attachments);
        });
        
        setStepApprovals(newStepApprovals);
        setRequestData(data);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  return {
    loading,
    tenantName,
    requestData,
    attachmentMap,
    attachmentList,
    formData,
    stepApprovals,
    setAttachmentMap,
    setStepApprovals,
    setFormData,
    refreshData,
  };
};

