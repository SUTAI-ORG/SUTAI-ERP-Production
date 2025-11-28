"use client";

import React from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "../../../ui/button";

interface ContractFormHeaderProps {
  tenantName: string;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ContractFormHeader: React.FC<ContractFormHeaderProps> = ({
  tenantName,
  onBack,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Буцах
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
            {tenantName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{tenantName}</h1>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onEdit && (
          <Button variant="outline" className="flex items-center gap-2" onClick={onEdit}>
            <Edit className="h-4 w-4" />
            Засах
          </Button>
        )}
        {onDelete && (
          <Button variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            Устгах
          </Button>
        )}
      </div>
    </div>
  );
};

