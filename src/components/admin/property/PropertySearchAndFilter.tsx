"use client";

import React from "react";
import { Input } from "../../ui/input";
import { Search, Filter } from "lucide-react";
import { Block, ProductType } from "./types";

interface PropertySearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  blocks: Block[];
  selectedBlockId: number | null;
  onBlockChange: (blockId: number | null) => void;
  selectedTypeId: number | null;
  onTypeChange: (typeId: number | null) => void;
  selectedProductTypeId: number | null;
  onProductTypeChange: (productTypeId: number | null) => void;
  productTypes: ProductType[];
}

const PropertySearchAndFilter: React.FC<PropertySearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  blocks,
  selectedBlockId,
  onBlockChange,
  selectedProductTypeId,
  onProductTypeChange,
  productTypes,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Талбай хайх..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {/* Block Filter */}
        <div className="md:w-56">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={selectedBlockId === null ? "" : String(selectedBlockId)}
              onChange={(e) => {
                const value = e.target.value;
                onBlockChange(value === "" ? null : parseInt(value, 10));
              }}
              className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Бүх блок</option>
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.name || `Блок #${block.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Type Filter */}
        <div className="md:w-56">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={selectedProductTypeId === null ? "" : String(selectedProductTypeId)}
              onChange={(e) => {
                const value = e.target.value;
                onProductTypeChange(value === "" ? null : parseInt(value, 10));
              }}
              className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Бүх барааны төрөл</option>
              {productTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name || `Барааны төрөл #${type.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PropertySearchAndFilter;

