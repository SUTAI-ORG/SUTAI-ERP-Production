"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useMainLayout } from "@/contexts/MainLayoutContext";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import UserManagement from "@/components/admin/user-management/UserManagement";
import PermissionManagement from "@/components/admin/permission-management/PermissionManagement";
import MerchantList from "@/components/admin/merchant/MerchantList";
import MerchantDetail from "@/components/admin/merchant/MerchantDetail";
import TenantList from "@/components/admin/tenat/TenantList";
import TenantDetail from "@/components/admin/tenat/TenantDetail";
import { ContractFormDetail } from "@/components/admin/tenat/contract-tenant";
import ApprovedTenantList from "@/components/admin/tenat/ApprovedTenantList";
import ContractProcess from "@/components/admin/tenat/contract-process";
import InsuranceManagement from "@/components/admin/tenat/insurance-management";
import PropertyManagement from "@/components/admin/property/PropertyManagement";
import { PropertyRateHistory } from "@/components/admin/property/PropertyRateHistory";

const MainPageContent = () => {
  const { activeComponent } = useMainLayout();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tenantIdParam = searchParams.get("tenantId");
  const merchantIdParam = searchParams.get("merchantId");
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [selectedMerchantId, setSelectedMerchantId] = useState<number | null>(null);

  // When switching main menu, reset detail selections and strip query params so list is default
  useEffect(() => {
    // When switching main menu, reset selections ONLY when leaving current context
    // Avoid reacting to searchParams changes (tenantId/merchantId) to prevent auto-clearing detail view
    const params = new URLSearchParams(searchParams.toString());

    const isTenantContext =
      activeComponent === "tenant-list" ||
      activeComponent === "approved-tenant-list" ||
      activeComponent === "contract-process";
    const isMerchantContext = activeComponent === "merchant-list";

    // If staying in tenant or merchant contexts, keep selections/params
    if (isTenantContext || isMerchantContext) {
      return;
    }

    let changed = false;
    if (params.has("tenantId")) {
      params.delete("tenantId");
      changed = true;
    }
    if (params.has("merchantId")) {
      params.delete("merchantId");
      changed = true;
    }
    if (changed) {
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
    setSelectedTenantId(null);
    setSelectedMerchantId(null);
  }, [activeComponent, pathname, router, searchParams]);

  // Sync tenantId from URL only when in tenant-related screens
  useEffect(() => {
    const isTenantScreen =
      activeComponent === "tenant-list" ||
      activeComponent === "approved-tenant-list" ||
      activeComponent === "contract-process";
    if (!isTenantScreen) {
      setSelectedTenantId(null);
      return;
    }

    if (tenantIdParam) {
      const num = Number(tenantIdParam);
      if (!Number.isNaN(num)) {
        setSelectedTenantId(num);
        return;
      }
    }
    setSelectedTenantId(null);
  }, [tenantIdParam, activeComponent]);

  // Reset selected tenant when switching away from tenant/contract contexts
  useEffect(() => {
    const isTenantContext =
      activeComponent === "tenant-list" ||
      activeComponent === "approved-tenant-list" ||
      activeComponent === "contract-process";
    if (!isTenantContext) {
      setSelectedTenantId(null);
    }
  }, [activeComponent]);

  // Sync merchantId from URL
  useEffect(() => {
    if (merchantIdParam) {
      const num = Number(merchantIdParam);
      if (!Number.isNaN(num)) {
        setSelectedMerchantId(num);
        return;
      }
    }
    setSelectedMerchantId(null);
  }, [merchantIdParam]);

  // Reset selected merchant when switching away from merchant-list
  useEffect(() => {
    if (activeComponent !== "merchant-list") {
      setSelectedMerchantId(null);
      const params = new URLSearchParams(searchParams.toString());
      if (params.has("merchantId")) {
        params.delete("merchantId");
        const next = params.toString();
        router.replace(next ? `${pathname}?${next}` : pathname);
      }
    }
  }, [activeComponent, pathname, router, searchParams]);

  const handleTenantClick = (tenantId: number) => {
    setSelectedTenantId(tenantId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tenantId", String(tenantId));
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  };

  const handleBackToList = () => {
    setSelectedTenantId(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tenantId");
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  };

  const handleMerchantClick = (merchantId: number) => {
    setSelectedMerchantId(merchantId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("merchantId", String(merchantId));
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  };

  const handleBackToMerchantList = () => {
    setSelectedMerchantId(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("merchantId");
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  };

  const renderComponent = () => {
    // If merchant is selected, show detail view
    if (selectedMerchantId !== null && activeComponent === "merchant-list") {
      return <MerchantDetail merchantId={selectedMerchantId} onBack={handleBackToMerchantList} />;
    }

    // If tenant is selected, show detail view
    if (selectedTenantId !== null) {
      if (activeComponent === "tenant-list") {
        return <TenantDetail tenantId={selectedTenantId} onBack={handleBackToList} />;
      }
      if (activeComponent === "approved-tenant-list") {
        return <ContractFormDetail tenantId={selectedTenantId} onBack={handleBackToList} />;
      }
      if (activeComponent === "contract-process") {
        return (
          <ContractFormDetail
            tenantId={selectedTenantId}
            onBack={handleBackToList}
            useApprovedEndpoint={false}
          />
        );
      }
    }

    switch (activeComponent) {
      case "user-management":
        return <UserManagement />;
      case "permission-management":
        return <PermissionManagement />;
      case "merchant-list":
        return <MerchantList onMerchantClick={handleMerchantClick} />;
      case "tenant-list":
        return <TenantList onTenantClick={handleTenantClick} />;
      case "approved-tenant-list":
        return <ApprovedTenantList onTenantClick={handleTenantClick} />;
      case "contract-process":
        return <ContractProcess onTenantClick={handleTenantClick} />;
      case "insurance-management":
        return <InsuranceManagement />;
      case "property-management":
        return <PropertyManagement />;
      case "property-rate-history":
        return <PropertyRateHistory />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {renderComponent()}
    </div>
  );
};

const MainPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-4 text-sm text-slate-600">Ачаалж байна...</div>}>
      <MainPageContent />
    </Suspense>
  );
};

export default MainPage;
