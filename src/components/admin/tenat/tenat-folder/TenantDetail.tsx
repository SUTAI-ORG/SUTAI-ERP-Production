"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "../../../ui/button";
import { getLeaseRequestById, getProductTypes, getProperties } from "@/lib/api";

interface TenantDetailProps {
  tenantId: number;
  onBack: () => void;
}

type LeaseRequest = Record<string, any>;

const TenantDetail = ({ tenantId, onBack }: TenantDetailProps) => {
  const [tenant, setTenant] = useState<LeaseRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [productTypes, setProductTypes] = useState<Record<number, string>>({});
  const [properties, setProperties] = useState<Record<number, string>>({});

  useEffect(() => {
    const loadLookup = async () => {
      try {
        const [typesRes, propsRes] = await Promise.all([
          getProductTypes(),
          getProperties(1, 200, null, null, null, "created_at", "asc"),
        ]);

        if (typesRes.data?.data) {
          const map: Record<number, string> = {};
          typesRes.data.data.forEach((t: any) => {
            if (t.id) {
              map[t.id] = t.name || t.title || t.label || `Төрөл #${t.id}`;
            }
          });
          setProductTypes(map);
        }

        if (propsRes.data?.data) {
          const map: Record<number, string> = {};
          propsRes.data.data.forEach((p: any) => {
            if (p.id) {
              map[p.id] = p.name || p.number || p.title || `Талбай #${p.id}`;
            }
          });
          setProperties(map);
        }
      } catch {
        // optional lookups; ignore failures
      }
    };

    loadLookup();
  }, []);

  useEffect(() => {
    const loadTenant = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getLeaseRequestById(tenantId);
        const raw = res.data?.data ?? res.data ?? null;
        setTenant(raw);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Түрээслэгчийн мэдээлэл татахад алдаа гарлаа."
        );
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      loadTenant();
    }
  }, [tenantId]);

  const formatted = useMemo(() => {
    if (!tenant) return null;

    const safe = (value: any, fallback: string = "-") =>
      value === null || value === undefined || value === "" ? fallback : value;

    const name =
      tenant.contact_name ||
      tenant.customer_name ||
      tenant.customerName ||
      tenant.name ||
      "-";

    const phone =
      tenant.contact_phone || tenant.phone || tenant.contact || "-";
    const email = tenant.contact_email || tenant.email || "-";
    const address = tenant.address || tenant.contact_address || "-";

    const category =
      tenant.category_name ||
      tenant.service_category?.name ||
      tenant.category?.name ||
      tenant.service_category ||
      tenant.category ||
      "-";

    const productTypeId = tenant.product_type_id;
    const productType =
      tenant.product_type_name ||
      (productTypeId && productTypes[productTypeId]) ||
      tenant.product_type?.name ||
      tenant.business_type?.name ||
      tenant.businessType?.name ||
      tenant.businessType ||
      tenant.business_type ||
      "-";

    const propertyId = tenant.property_id;
    const property =
      tenant.property?.name ||
      tenant.property?.number ||
      (propertyId && properties[propertyId]) ||
      tenant.property_number ||
      tenant.propertyName ||
      tenant.propertyNumber ||
      "-";

    const description = tenant.notes || tenant.description || tenant.comment || "-";
    const status = tenant.status || "-";
    const createdAt = tenant.created_at || tenant.request_date || null;

    return {
      name: safe(name),
      phone: safe(phone),
      email: safe(email),
      address: safe(address),
      category: safe(category),
      productType: safe(productType),
      property: safe(property),
      description: safe(description),
      status: safe(status),
      createdAt,
      id: tenant.id,
    };
  }, [tenant, productTypes, properties]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Идэвхтэй":
      case "approved":
        return "bg-green-100 text-green-800";
      case "Түр хаасан":
      case "pending":
      case "property_selected":
      case "under_review":
      case "checking":
        return "bg-yellow-100 text-yellow-800";
      case "Дууссан":
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusDisplay = (status: string) => {
    const map: Record<string, string> = {
      approved: "Зөвшөөрсөн",
      pending: "Шинээр түрээслэх",
      property_selected: "Түрээс сунгах",
      checking: "Шалгагдаж байна",
      under_review: "Дахин шалгагдаж байна",
      in_contract_process: "Гэрээ байгуулах",
      incomplete: "Дутуу",
      rejected: "Татгалзсан",
      cancelled: "Цуцлагдсан",
    };
    return map[status] || status || "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="back"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Буцах
          </Button>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {formatted?.name || "Түрээслэгч"}
              </h1>
              <p className="text-sm text-slate-500">{formatted?.email || "-"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Засах
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Устгах
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : formatted ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-sm text-slate-500">ID</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">#{formatted.id}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Төлөв</p>
              <span
                className={`mt-1 inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                  formatted.status
                )}`}
              >
                {getStatusDisplay(formatted.status)}
              </span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Огноо</p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {formatted.createdAt
                  ? new Date(formatted.createdAt).toLocaleString("mn-MN")
                  : "-"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Хүсэлтийн мэдээлэл</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Ангилал</p>
                <p className="text-sm font-medium text-slate-900">{formatted.category}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Үйл ажиллагааны төрөл</p>
                <p className="text-sm font-medium text-slate-900">{formatted.productType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Талбай / Лангуу</p>
                <p className="text-sm font-medium text-slate-900">{formatted.property}</p>
              </div>
              <div className="space-y-1 md:col-span-2 lg:col-span-3">
                <p className="text-sm text-slate-500">Тайлбар</p>
                <p className="text-sm font-medium text-slate-900">{formatted.description}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Холбоо барих мэдээлэл</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Утас</p>
                  <p className="text-sm font-medium text-slate-900">{formatted.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Имэйл</p>
                  <p className="text-sm font-medium text-slate-900">{formatted.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Хаяг</p>
                  <p className="text-sm font-medium text-slate-900">{formatted.address}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          Түрээслэгчийн мэдээлэл олдсонгүй.
        </div>
      )}
    </div>
  );
};

export default TenantDetail;

