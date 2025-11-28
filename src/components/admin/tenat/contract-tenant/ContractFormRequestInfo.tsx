"use client";

import React from "react";

interface ContractFormRequestInfoProps {
  requestData: any;
}

export const ContractFormRequestInfo: React.FC<ContractFormRequestInfoProps> = ({
  requestData,
}) => {
  if (!requestData) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Хүсэлтийн мэдээлэл</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-600">Холбоо барих нэр</label>
          <p className="text-sm text-slate-800 mt-1">{requestData.contact_name || "-"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Утас</label>
          <p className="text-sm text-slate-800 mt-1">{requestData.contact_phone || "-"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Имэйл</label>
          <p className="text-sm text-slate-800 mt-1">{requestData.contact_email || "-"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Төлөв</label>
          <p className="text-sm text-slate-800 mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              requestData.status === "checking" ? "bg-primary text-white" :
              requestData.status === "approved" ? "bg-success text-white" :
              requestData.status === "rejected" ? "bg-danger text-white" :
              requestData.status === "pending" ? "bg-warning text-white" :
              "bg-slate-200 text-slate-800"
            }`}>
              {requestData.status === "checking" ? "Шалгагдаж байна" :
               requestData.status === "approved" ? "Зөвшөөрсөн" :
               requestData.status === "rejected" ? "Татгалзсан" :
               requestData.status === "pending" ? "Хүлээгдэж буй" :
               requestData.status}
            </span>
          </p>
        </div>
        {requestData.property && (
          <div>
            <label className="text-sm font-medium text-slate-600">Талбай</label>
            <p className="text-sm text-slate-800 mt-1">{requestData.property.number || "-"}</p>
          </div>
        )}
        {requestData.deposit_amount && (
          <div>
            <label className="text-sm font-medium text-slate-600">Барьцааны дүн</label>
            <p className="text-sm text-slate-800 mt-1">{parseInt(requestData.deposit_amount).toLocaleString()} ₮</p>
          </div>
        )}
        {requestData.merchant && (
          <>
            <div>
              <label className="text-sm font-medium text-slate-600">Байгууллагын нэр</label>
              <p className="text-sm text-slate-800 mt-1">{requestData.merchant.name || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Байгууллагын имэйл</label>
              <p className="text-sm text-slate-800 mt-1">{requestData.merchant.email || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Байгууллагын утас</label>
              <p className="text-sm text-slate-800 mt-1">{requestData.merchant.phone || "-"}</p>
            </div>
          </>
        )}
        {requestData.notes && (
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-600">Тэмдэглэл</label>
            <p className="text-sm text-slate-800 mt-1">{requestData.notes}</p>
          </div>
        )}
        {requestData.created_at && (
          <div>
            <label className="text-sm font-medium text-slate-600">Үүсгэсэн огноо</label>
            <p className="text-sm text-slate-800 mt-1">{new Date(requestData.created_at).toLocaleString('mn-MN')}</p>
          </div>
        )}
        {requestData.updated_at && (
          <div>
            <label className="text-sm font-medium text-slate-600">Шинэчлэгдсэн огноо</label>
            <p className="text-sm text-slate-800 mt-1">{new Date(requestData.updated_at).toLocaleString('mn-MN')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

