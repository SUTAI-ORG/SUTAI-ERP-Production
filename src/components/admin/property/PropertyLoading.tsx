"use client";

import React from "react";

export const PropertyLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-sm text-slate-500">Мэдээлэл татаж байна...</p>
      </div>
    </div>
  );
};

