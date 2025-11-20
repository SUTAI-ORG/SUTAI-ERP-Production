import React from "react";

const UserManagementStatisticsSkeleton = () => {
  return (
    <div className="flex flex-row justify-between items-center gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-8 w-12 bg-slate-200 rounded animate-pulse mt-2" />
        </div>
      ))}
    </div>
  );
};

export default UserManagementStatisticsSkeleton;








