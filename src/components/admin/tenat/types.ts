export interface Tenant {
  id: number;
  category: string;
  businessType: string;
  customerName: string;
  phone: string;
  email: string;
  description: string;
  isNewTenant: boolean;
  isRenewal: boolean;
  propertyId?: number | null;
  propertyNumber?: string | null;
  propertyName?: string | null;
  status?: string;
}

export type FilterType = "pending" | "property_selected" | "checking" | "under_review" | "incomplete" | "rejected" | "cancelled" | "approved" | "in_contract_process" | "all";