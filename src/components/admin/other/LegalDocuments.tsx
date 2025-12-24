"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Pagination } from "../../ui/pagination";
import { getLegalDocuments } from "@/lib/api";
import CreateLegalDocumentDialog from "./CreateLegalDocumentDialog";

export type LegalDocument = {
  id?: number;
  admin_name?: string;
  key?: string;
  kind?: string;
  client?: string;
  locale?: string;
  is_active?: boolean;
  content?: any;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
};

const PER_PAGE = 32;

const LegalDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const router = useRouter();

  const fetchDocuments = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLegalDocuments(page, PER_PAGE, "admin_name", "asc");

      if (response.error) {
        setError(response.error);
        return;
      }

      const payload = response.data;
      let dataArray: any[] = [];
      let paginationInfo: any = {};

      if (payload?.data && Array.isArray(payload.data)) {
        dataArray = payload.data;
        paginationInfo = payload;
      } else if (Array.isArray(payload)) {
        dataArray = payload;
      }

      setDocuments(dataArray);

      if (paginationInfo.last_page !== undefined) {
        setTotalPages(paginationInfo.last_page);
      } else if (paginationInfo.total_pages !== undefined) {
        setTotalPages(paginationInfo.total_pages);
      } else {
        setTotalPages(1);
      }

      if (paginationInfo.current_page !== undefined) {
        setCurrentPage(paginationInfo.current_page);
      } else {
        setCurrentPage(page);
      }

      if (paginationInfo.total !== undefined) {
        setTotalItems(paginationInfo.total);
      } else {
        setTotalItems(dataArray.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchDocuments(page);
  };

  const handleRowClick = (doc: LegalDocument) => {
    if (!doc.id) return;
    router.push(`/main/legal-documents/${doc.id}`);
  };

  return (
    <>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Үйлчилгээний нөхцөл</h1>
        </div>
        <CreateLegalDocumentDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onCreated={() => fetchDocuments(1)}
          trigger={
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Нэмэх
            </Button>
          }
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">
              Нийт {totalItems} бичлэг · Хуудас {currentPage}/{totalPages}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => fetchDocuments(currentPage)} disabled={loading}>
            Шинэчлэх
          </Button>
        </div>

        {error && (
          <div className="px-6 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Нэр</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Төрөл</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Клиент</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Хэл</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Контент</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Огноо</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Ачааллаж байна...
                    </div>
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Мэдээлэл олдсонгүй
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const name = doc.admin_name || doc.title || doc.name || "-";
                  const status = doc.status || "-";
                  const kind = doc.kind || "-";
                  const client = doc.client || "-";
                  const locale = doc.locale || "-";
                  let contentPreview = "-";
                  if (doc.content) {
                    if (typeof doc.content === "string") {
                      contentPreview =
                        doc.content.length > 120 ? `${doc.content.slice(0, 120)}...` : doc.content;
                    } else if (typeof doc.content === "object") {
                      contentPreview =
                        doc.content.head_title ||
                        doc.content.title ||
                        (Array.isArray(doc.content.body) && doc.content.body[0]?.title) ||
                        "[object]";
                    } else {
                      contentPreview = String(doc.content);
                    }
                  }
                  const dateValue = doc.updated_at || doc.created_at || "-";

                  return (
                    <tr
                      key={doc.id || name}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(doc)}
                    >
                      <td className="px-6 py-4 text-sm text-slate-900">#{doc.id ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{name}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{status}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{kind}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{client}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{locale}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-[320px]">
                        <span className="line-clamp-2">{contentPreview}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{dateValue}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} loading={loading} />
        )}
      </div>
      </div>
    </>
  );
};

export default LegalDocuments;

