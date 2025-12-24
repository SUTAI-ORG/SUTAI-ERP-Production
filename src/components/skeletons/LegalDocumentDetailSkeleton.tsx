"use client";

import React from "react";

const LegalDocumentDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-slate-200" />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="space-y-2 rounded-lg px-3 py-2">
          <div className="h-4 w-5/6 rounded bg-slate-200" />
          <div className="h-4 w-4/6 rounded bg-slate-200" />
          <div className="h-4 w-3/6 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

export default LegalDocumentDetailSkeleton;

