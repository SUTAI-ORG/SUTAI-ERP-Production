"use client";

import React from "react";
import { Button } from "../../../ui/button";

interface TenantErrorProps {
  error: string;
  onRetry: () => void;
}

export const TenantError: React.FC<TenantErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <p className="text-red-800 font-medium">Алдаа: {error}</p>
      <Button variant="outline" className="mt-4" onClick={onRetry}>
        Дахин оролдох
      </Button>
    </div>
  );
};

