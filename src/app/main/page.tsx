"use client";

import React, { useState, useEffect } from "react";
import { useMainLayout } from "@/contexts/MainLayoutContext";
import UserManagement from "@/components/admin/user-management/UserManagement";
import PermissionManagement from "@/components/admin/permission-management/PermissionManagement";
import MerchantList from "@/components/admin/merchant/MerchantList";
import TenantList from "@/components/admin/tenat/TenantList";
import TenantDetail from "@/components/admin/tenat/TenantDetail";
import { ContractFormDetail } from "@/components/admin/tenat/contract-tenant";
import ApprovedTenantList from "@/components/admin/tenat/ApprovedTenantList";
import ContractProcess from "@/components/admin/tenat/contract-process";
import InsuranceManagement from "@/components/admin/tenat/insurance-management";
import PropertyManagement from "@/components/admin/property/PropertyManagement";
import { PropertyRateHistory } from "@/components/admin/property/PropertyRateHistory";

const MainPage = () => {
  const { activeComponent } = useMainLayout();
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);

  // Reset selected tenant when switching away from tenant-list or approved-tenant-list
  useEffect(() => {
    if (activeComponent !== "tenant-list" && activeComponent !== "approved-tenant-list") {
      setSelectedTenantId(null);
    }
  }, [activeComponent]);

  const handleTenantClick = (tenantId: number) => {
    setSelectedTenantId(tenantId);
  };

  const handleBackToList = () => {
    setSelectedTenantId(null);
  };

  const renderComponent = () => {
    // If tenant is selected, show detail view
    if (selectedTenantId !== null) {
      if (activeComponent === "tenant-list") {
        return <TenantDetail tenantId={selectedTenantId} onBack={handleBackToList} />;
      }
      if (activeComponent === "approved-tenant-list") {
        return <ContractFormDetail tenantId={selectedTenantId} onBack={handleBackToList} />;
      }
    }

    switch (activeComponent) {
      case "user-management":
        return <UserManagement />;
      case "permission-management":
        return <PermissionManagement />;
      case "merchant-list":
        return <MerchantList />;
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

  return <>{renderComponent()}</>;
};

export default MainPage;
