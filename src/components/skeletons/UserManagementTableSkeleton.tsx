import React from "react";

const UserManagementTableSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Хэрэглэгч
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Имэйл
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Утас
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Эрх
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                Үйлдэл
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
                    <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementTableSkeleton;








