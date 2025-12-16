"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pagination } from "../../ui/pagination";
import PropertyHeader from "./PropertyHeader";
import PropertyStatistics from "./PropertyStatistics";
import PropertySearchAndFilter from "./PropertySearchAndFilter";
import PropertyTable from "./PropertyTable";
import { UpdateRateModal } from "./UpdateRateModal";
import { CreatePropertyModal } from "./CreatePropertyModal";
import { PropertyLoading } from "./PropertyLoading";
import { PropertyError } from "./PropertyError";
import { Property } from "./types";
import { usePropertyManagement } from "@/hooks/usePropertyManagement";

const PropertyManagement: React.FC = () => {
  const router = useRouter();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isCreatePropertyModalOpen, setIsCreatePropertyModalOpen] = useState(false);

  const {
    properties,
    productTypes,
    blocks,
    loading,
    error,
    selectedTypeId,
    selectedProductTypeId,
    selectedRelationship,
    selectedRelationshipId,
    searchQuery,
    currentPage,
    totalPages,
    totalItems,
    filteredProperties,
    setSelectedTypeId,
    setSelectedProductTypeId,
    setSelectedRelationship,
    setSelectedRelationshipId,
    setSearchQuery,
    fetchProperties,
    handlePageChange,
    handleClearFilter,
    handleUpdateRate,
    handleExportExcel,
    getPropertyTypeName,
  } = usePropertyManagement();


  const handleRateClick = (property: Property) => {
    setSelectedProperty(property);
    setIsRateModalOpen(true);
  };

  const handleAdd = () => {
    setIsCreatePropertyModalOpen(true);
  };

  const handleCreatePropertySuccess = async () => {
    await fetchProperties(currentPage, selectedTypeId, selectedProductTypeId, searchQuery);
  };

  const handleDetailClick = (property: Property) => {
    router.push(`/main/properties/${property.id}`);
  };

  const handleRateSuccess = async () => {
    try {
      await fetchProperties(currentPage, selectedTypeId, selectedProductTypeId, searchQuery);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Мэдээлэл дахин татахад алдаа гарлаа";
      toast.error(errorMsg);
    }
  };


  if (loading) {
    return <PropertyLoading />;
  }

  if (error) {
    return <PropertyError error={error} />;
  }

  return (
    <div className="space-y-6">
      <PropertyHeader 
        onExportExcel={handleExportExcel}
        onAddClick={handleAdd}
      />
      <>
          <PropertyStatistics
            totalItems={totalItems || properties.length}
            currentPageItems={filteredProperties.length}
            propertyTypesCount={0}
          />

          <PropertySearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        blocks={blocks}
        selectedBlockId={selectedRelationship === "block" ? selectedRelationshipId : null}
        onBlockChange={(blockId) => {
          if (blockId === null) {
            setSelectedRelationship(null);
            setSelectedRelationshipId(null);
          } else {
            setSelectedRelationship("block");
            setSelectedRelationshipId(blockId);
          }
        }}
        selectedTypeId={selectedTypeId}
        onTypeChange={setSelectedTypeId}
        selectedProductTypeId={selectedProductTypeId}
        onProductTypeChange={setSelectedProductTypeId}
        productTypes={productTypes}
      />

      <PropertyTable
        properties={filteredProperties}
        productTypes={productTypes}
        getPropertyTypeName={getPropertyTypeName}
        selectedTypeId={selectedTypeId}
        selectedProductTypeId={selectedProductTypeId}
        searchQuery={searchQuery}
        onClearFilter={handleClearFilter}
        onRateClick={handleRateClick}
        onDetailClick={handleDetailClick}
      />

      {/* Pagination */}
      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          loading={loading}
        />
      )}

          {/* Rate Update Modal */}
          {isRateModalOpen && (
            <UpdateRateModal
              property={selectedProperty}
              onClose={() => {
                setIsRateModalOpen(false);
                setSelectedProperty(null);
              }}
              onSuccess={handleRateSuccess}
              onUpdateRate={handleUpdateRate}
            />
          )}

          {/* Create Property Modal */}
          {isCreatePropertyModalOpen && (
            <CreatePropertyModal
              onClose={() => setIsCreatePropertyModalOpen(false)}
              onSuccess={handleCreatePropertySuccess}
            />
          )}
        </>

    </div>
  );
};

export default PropertyManagement;

