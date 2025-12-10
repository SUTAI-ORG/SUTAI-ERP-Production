"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NavItem } from "@/utils/sidebarSections";

type NavItemType = NavItem;

interface MainLayoutContextType {
  activeComponent: string | null;
  setActiveComponent: (component: string | null) => void;
  activeItemId: string | null;
  handleSidebarSelect: (item: NavItemType) => void;
}

const MainLayoutContext = createContext<MainLayoutContextType | undefined>(
  undefined
);

export function MainLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [activeComponent, setActiveComponent] = useState<string | null>(
    "merchant-list"
  );

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/sign-in");
    }
  }, [router]);

  const handleSidebarSelect = (item: NavItemType) => {
    if (item.href) {
      router.push(item.href);
    } else if (item.componentKey) {
      setActiveComponent(item.componentKey);
    }
  };

  // Get active item ID based on activeComponent
  const getActiveItemId = () => {
    if (!activeComponent) return null;
    switch (activeComponent) {
      case "user-management":
        return "management-users";
      case "permission-management":
        return "management-permissions";
      case "merchant-list":
        return "merchant-list";
      case "tenant-list":
        return "agreement-layout";
      case "approved-tenant-list":
        return "layout";
      case "product-insurance":
        return "product-insurance";
      case "liability-insurance":
        return "liability-insurance";
      case "contract-process":
        return "utilities";
      case "insurance-management":
        return "components";
      default:
        return null;
    }
  };

  return (
    <MainLayoutContext.Provider
      value={{
        activeComponent,
        setActiveComponent,
        activeItemId: getActiveItemId(),
        handleSidebarSelect,
      }}
    >
      {children}
    </MainLayoutContext.Provider>
  );
}

export function useMainLayout() {
  const context = useContext(MainLayoutContext);
  if (context === undefined) {
    throw new Error("useMainLayout must be used within a MainLayoutProvider");
  }
  return context;
}

