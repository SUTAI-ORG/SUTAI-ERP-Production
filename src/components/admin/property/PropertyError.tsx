"use client";

import React from "react";

interface PropertyErrorProps {
  error: string;
}

export const PropertyError: React.FC<PropertyErrorProps> = ({ error }) => {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );
};

