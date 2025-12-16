"use client";

import React, { useState, useEffect } from "react";
import { Hash, MapPin, Ruler } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProductTypes, getBlocks } from "@/lib/api";
import { ProductType, Block } from "./types";

interface CreatePropertyFormProps {
  formData: {
    number?: string;
    x?: number | null;
    y?: number | null;
    length?: number | null;
    width?: number | null;
    block_id?: number | null;
    product_type_id?: number | null;
  };
  onFormDataChange: (data: {
    number?: string;
    x?: number | null;
    y?: number | null;
    length?: number | null;
    width?: number | null;
    block_id?: number | null;
    product_type_id?: number | null;
  }) => void;
}

export const CreatePropertyForm: React.FC<CreatePropertyFormProps> = ({
  formData,
  onFormDataChange,
}) => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  useEffect(() => {
    setLoadingTypes(true);
    Promise.all([
      getProductTypes(),
      getBlocks(),
    ])
      .then(([productTypesResponse, blocksResponse]) => {
        if (productTypesResponse.data) {
          const productTypesData = productTypesResponse.data.data || productTypesResponse.data;
          setProductTypes(Array.isArray(productTypesData) ? productTypesData : []);
        }
        if (blocksResponse.data) {
          const blocksData = blocksResponse.data.data || blocksResponse.data;
          setBlocks(Array.isArray(blocksData) ? blocksData : []);
        }
      })
      .catch(() => {
        // Handle error
      })
      .finally(() => {
        setLoadingTypes(false);
      });
  }, []);

  const handleNumberChange = (value: string) => {
    onFormDataChange({ ...formData, number: value });
  };

  const handleNumberInputChange = (field: 'x' | 'y' | 'length' | 'width', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    onFormDataChange({ ...formData, [field]: isNaN(numValue as number) ? null : numValue });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div>
        <label htmlFor="property-number" className="block text-sm font-medium text-slate-700 mb-2">
          Талбайн дугаар <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="property-number"
            type="text"
            value={formData.number || ''}
            onChange={(e) => handleNumberChange(e.target.value)}
            placeholder="Талбайн дугаар"
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="property-x" className="block text-sm font-medium text-slate-700 mb-2">
            X координат
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="property-x"
              type="number"
              step="any"
              value={formData.x ?? ''}
              onChange={(e) => handleNumberInputChange('x', e.target.value)}
              placeholder="X координат"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="property-y" className="block text-sm font-medium text-slate-700 mb-2">
            Y координат
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="property-y"
              type="number"
              step="any"
              value={formData.y ?? ''}
              onChange={(e) => handleNumberInputChange('y', e.target.value)}
              placeholder="Y координат"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="property-length" className="block text-sm font-medium text-slate-700 mb-2">
            Урт
          </label>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="property-length"
              type="number"
              step="any"
              value={formData.length ?? ''}
              onChange={(e) => handleNumberInputChange('length', e.target.value)}
              placeholder="Урт"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="property-width" className="block text-sm font-medium text-slate-700 mb-2">
            Өргөн
          </label>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="property-width"
              type="number"
              step="any"
              value={formData.width ?? ''}
              onChange={(e) => handleNumberInputChange('width', e.target.value)}
              placeholder="Өргөн"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Блок
          </label>
          {loadingTypes ? (
            <div className="flex items-center justify-center py-8 border border-slate-300 rounded-lg">
              <div className="animate-pulse text-slate-500">Уншиж байна...</div>
            </div>
          ) : (
            <Select
              value={formData.block_id?.toString() || undefined}
              onValueChange={(value) =>
                onFormDataChange({
                  ...formData,
                  block_id: value ? parseInt(value) : null,
                })
              }
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Блок сонгох" />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white">
                {blocks.map((block) => (
                  <SelectItem key={block.id} value={block.id.toString()}>
                    {block.name || `Блок #${block.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Бүтээгдэхүүний төрөл
          </label>
          {loadingTypes ? (
            <div className="flex items-center justify-center py-8 border border-slate-300 rounded-lg">
              <div className="animate-pulse text-slate-500">Уншиж байна...</div>
            </div>
          ) : (
            <Select
              value={formData.product_type_id?.toString() || undefined}
              onValueChange={(value) =>
                onFormDataChange({
                  ...formData,
                  product_type_id: value ? parseInt(value) : null,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Бүтээгдэхүүний төрөл сонгох" />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white">
                {productTypes.map((productType) => (
                  <SelectItem key={productType.id} value={productType.id.toString()}>
                    {productType.name || `Бүтээгдэхүүн #${productType.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
};

