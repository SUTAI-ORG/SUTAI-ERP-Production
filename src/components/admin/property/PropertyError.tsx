"use client";

import React from "react";

interface PropertyErrorProps {
  error: string;
}

export const PropertyError: React.FC<PropertyErrorProps> = ({ error }) => {
  return (
    <div className="flex items-center justify-center  rounded-lg  p-4">
      <p className="text-xl text-gray-400">{error}</p>
    </div>
  );
};

