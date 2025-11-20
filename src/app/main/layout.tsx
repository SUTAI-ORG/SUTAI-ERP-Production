"use client";

import React from "react";
import { Sidebar } from "@/components/core-components/Sidebar";
import Header from "@/components/core-components/header";
import Footer from "@/components/core-components/footer";
import { MainLayoutProvider, useMainLayout } from "@/contexts/MainLayoutContext";

function MainLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeItemId, handleSidebarSelect } = useMainLayout();

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeItemId={activeItemId}
          onSelect={handleSidebarSelect}
          className="h-full"
        />
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              <div className="max-w-7xl mx-auto space-y-8">
                {children}
              </div>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayoutProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </MainLayoutProvider>
  );
}

