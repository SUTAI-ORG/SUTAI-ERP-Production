export interface Property {
  id: number;
  number?: string;
  name?: string;
  description?: string | null;
  x?: number | null;
  y?: number | null;
  length?: number | null;
  width?: number | null;
  area_size?: number | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  block_id?: number;
  tenant_id?: number;
  type_id?: number;
  product_type_id?: number;
  status_id?: number;
  block?: {
    id: number;
    name?: string;
    length?: number | null;
    width?: number | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    main_area_id?: number;
  };
  tenant?: {
    id: number;
    type?: string;
    name?: string;
    rd?: string;
    email?: string;
    phone?: string;
    address?: string;
    address_description?: string | null;
    website?: string | null;
    facebook?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    youtube?: string | null;
    wechat?: string | null;
    latitude?: number;
    longitude?: number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    owner_id?: number;
    status_id?: number | null;
  };
  type?: {
    id: number;
    name?: string;
    description?: string | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  product_type?: {
    id: number;
    name?: string;
    description?: string | null;
    management_fee_rate?: number | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    category_id?: number;
  };
  status?: {
    id: number;
    model?: string;
    name?: string;
    style?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  rate?: {
    id: number;
    year?: number;
    rate?: number;
    fee?: number;
    start_date?: string;
    end_date?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    property_id?: number;
    approved_by_id?: number;
    status_id?: number;
    status?: {
      id?: number;
      name?: string;
      description?: string;
      style?: string;
    };
  };
}

export interface PropertyType {
  id: number;
  name?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ProductType {
  id: number;
  name?: string;
  description?: string | null;
  management_fee_rate?: number | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  category_id?: number;
}

export interface ServiceCategory {
  id: number;
  name?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Block {
  id: number;
  name?: string;
  length?: number | null;
  width?: number | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  main_area_id?: number;
}
