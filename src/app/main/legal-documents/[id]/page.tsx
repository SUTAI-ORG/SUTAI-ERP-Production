"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import LegalDocumentDetail from "@/components/admin/other/LegalDocumentDetail";
import type { LegalDocument } from "@/components/admin/other/LegalDocuments";
import { getLegalDocument, updateLegalDocumentContent } from "@/lib/api";
import { useMainLayout } from "@/contexts/MainLayoutContext";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function LegalDocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { setActiveComponent } = useMainLayout();
  const legalDocumentId = params?.id ? Number(params.id) : NaN;

  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [contentInput, setContentInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setActiveComponent("legal-documents");
  }, [setActiveComponent]);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!legalDocumentId || Number.isNaN(legalDocumentId)) {
        setError("ID буруу байна");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await getLegalDocument(legalDocumentId);
        if (res.error) {
          setError(res.error);
        }
        if (res.data) {
          const payload: any = res.data;
          const data = payload.data || payload;
          setDocument(data as LegalDocument);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [legalDocumentId]);

  const handleBackToList = () => {
    router.push("/main?view=legal-documents");
  };

  const openEdit = () => {
    if (document?.content) {
      if (typeof document.content === "object") {
        setContentInput(JSON.stringify(document.content, null, 2));
      } else {
        setContentInput(String(document.content));
      }
    } else {
      setContentInput("");
    }
    setIsEditing(true);
  };

  const handleSaveContent = async () => {
    if (!legalDocumentId || Number.isNaN(legalDocumentId)) return;
    let payload: any = contentInput;
    try {
      payload = JSON.parse(contentInput);
    } catch {
      payload = contentInput;
    }

    setSaving(true);
    try {
      const res = await updateLegalDocumentContent(legalDocumentId, payload);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Контент шинэчлэгдлээ");
      if (res.data) {
        const data: any = (res.data as any).data || res.data;
        setDocument(data as LegalDocument);
      } else {
        setDocument((prev) => (prev ? { ...prev, content: payload } : prev));
      }
      setIsEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Шинэчлэхэд алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  if (!legalDocumentId || Number.isNaN(legalDocumentId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <p className="text-sm text-red-600">Үйлчилгээний нөхцлийн ID буруу байна</p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="back" onClick={() => router.back()}>
              Буцах
            </Button>
            <Button onClick={handleBackToList}>Жагсаалт руу</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
        <div className="flex items-center gap-2">
          <Button variant="back" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Буцах
          </Button>
          <h1 className="text-2xl font-bold text-slate-800">{document?.admin_name || document?.title || "Үйлчилгээний нөхцөл"}</h1>
        </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                Болих
              </Button>
              <Button onClick={handleSaveContent} disabled={saving || !contentInput.trim()}>
                {saving ? "Хадгалж байна..." : "Хадгалах"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={openEdit} disabled={loading || !document}>
              Контент засах
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isEditing && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">PATCH: /v1/legal-documents/{legalDocumentId}/content</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">Контент засах</p>
            </div>
          </div>
          <textarea
            rows={12}
            value={contentInput}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContentInput(e.target.value)}
            placeholder="JSON эсвэл текст контент"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          />
          <p className="text-xs text-slate-500">
            JSON хэлбэр байвал автоматаар parse хийж илгээнэ, эс бөгөөс текстээр явуулна.
          </p>
        </div>
      )}

      <LegalDocumentDetail document={document} loading={loading} variant="page" />
    </div>
  );
}

