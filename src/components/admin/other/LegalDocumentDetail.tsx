"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import type { LegalDocument } from "./LegalDocuments";
import { LegalDocumentDetailSkeleton } from "@/components/skeletons";
import { LegalDocumentInfoButton, LegalDocumentInfoModal } from "./LegalDocumentInfo";

type LegalDocumentDetailProps = {
  document: LegalDocument | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  loading?: boolean;
  variant?: "dialog" | "page";
};

const renderContent = (content: any) => {
  if (!content) return <span>-</span>;

  if (typeof content === "string" || typeof content === "number" || typeof content === "boolean") {
    return <p className="whitespace-pre-wrap text-sm text-slate-800">{String(content)}</p>;
  }

  const keyLabelMap: Record<string, string> = {
    title: "Гарчиг",
    head_title: "Гарчиг",
    headTitle: "Гарчиг",
    subtitle: "Дэд гарчиг",
    sub_title: "Дэд гарчиг",
    description: "Тайлбар",
    intro: "Оршил",
    paragraph: "Өгүүлбэр",
    content: "Агуулга",
  };

  const renderKeyValueList = (obj: Record<string, any>) => (
    <div className="grid gap-3">
      {Object.entries(obj).map(([key, value]) => {
        if (["body", "sections", "parent", "child", "children"].includes(key)) return null;
        if (keyLabelMap[key]) return null; // skip titles/paragraph labels shown elsewhere
        const label = keyLabelMap[key] || key;
        const display =
          typeof value === "string" || typeof value === "number" || typeof value === "boolean"
            ? String(value)
            : Array.isArray(value)
            ? value.map((v) => String(v)).join(", ")
            : "[object]";
        return (
          <div key={key} className="rounded-lg px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{display || "-"}</p>
          </div>
        );
      })}
    </div>
  );

  const renderParagraph = (text?: string) =>
    text ? <p className="text-sm text-slate-800 whitespace-pre-wrap">{text}</p> : null;

  const renderSectionTree = (section: any, level: number = 0, index: number = 0, parentNumber: string = "") => {
    const hasChildren =
      Array.isArray(section?.parent) ||
      Array.isArray(section?.child) ||
      Array.isArray(section?.children);

    const currentNumber = parentNumber ? `${parentNumber}.${index + 1}` : `${index + 1}`;

    return (
      <div
        className={`space-y-2 rounded-lg px-3 py-2 ${level === 0 && index > 0 ? "border-t border-slate-200 pt-4" : ""}`}
        style={{ marginLeft: level ? level * 12 : 0 }}
      >
        {section?.title && (
          <p className="text-sm font-semibold text-slate-900">
            {currentNumber} {section.title}
          </p>
        )}
        {renderParagraph(section?.subtitle)}
        {renderParagraph(section?.paragraph || section?.content)}

        {/* Render arbitrary key/values inside a section except nested arrays */}
        {section && typeof section === "object" && renderKeyValueList(section)}

        {/* Render nested levels */}
        {Array.isArray(section?.parent) &&
          section.parent.map((sub: any, idx: number) => (
            <div key={`parent-${idx}`} className="pl-3">
              {renderSectionTree(sub, level + 1, idx, currentNumber)}
            </div>
          ))}
        {Array.isArray(section?.child) &&
          section.child.map((sub: any, idx: number) => (
            <div key={`child-${idx}`} className="pl-3">
              {renderSectionTree(sub, level + 1, idx, currentNumber)}
            </div>
          ))}
        {Array.isArray(section?.children) &&
          section.children.map((sub: any, idx: number) => (
            <div key={`children-${idx}`} className="pl-3">
              {renderSectionTree(sub, level + 1, idx, currentNumber)}
            </div>
          ))}

        {!hasChildren && !section?.paragraph && !section?.content && typeof section === "string" && (
          <p className="text-sm text-slate-800 whitespace-pre-wrap">{section}</p>
        )}
      </div>
    );
  };

  const bodySections =
    (content && Array.isArray(content.body) && content.body) ||
    (Array.isArray(content.sections) && content.sections) ||
    (Array.isArray(content) ? content : null);

  const headerTitle = content?.head_title || content?.headTitle || null;
  const title = content?.title || null;
  const description =
    content?.description || content?.sub_title || content?.subtitle || content?.intro || null;

  return (
    <div className="space-y-3">
      {(headerTitle || title || description) && (
        <div className="space-y-1">
          {headerTitle && <p className="text-xl uppercase tracking-wide font-semibold text-black">{headerTitle}</p>}
          {title && <p className="text-base font-semibold text-slate-900">{title}</p>}
          {description && <p className="text-sm text-slate-700 whitespace-pre-wrap">{description}</p>}
        </div>
      )}

      {bodySections ? (
        <div className="space-y-1">
          {bodySections.map((section: any, idx: number) => (
            <React.Fragment key={idx}>{renderSectionTree(section, 0, idx)}</React.Fragment>
          ))}
        </div>
      ) : (
        renderKeyValueList(content)
      )}
    </div>
  );
};

const DetailBody: React.FC<{
  document: LegalDocument | null;
  loading?: boolean;
  onOpenInfo: () => void;
}> = ({ document, loading, onOpenInfo }) => {
  if (loading) {
    return <LegalDocumentDetailSkeleton />;
  }

  if (!document) {
    return <div className="text-sm text-slate-600">Харах мэдээлэл сонгогдоогүй байна.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="whitespace-pre-wrap rounded-lg px-3 py-2 text-sm text-slate-900">
          {renderContent(document.content)}
        </div>
      </div>

    </div>
  );
};

const LegalDocumentDetail: React.FC<LegalDocumentDetailProps> = ({
  document,
  open = false,
  onOpenChange,
  loading,
  variant = "dialog",
}) => {
  const [infoOpen, setInfoOpen] = useState(false);

  if (variant === "page") {
    return (
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
        <div className="space-y-1 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <p className="text-sm text-slate-500">#{document?.id ?? "ID байхгүй"}</p>
            <h2 className="text-xl font-semibold tex-black">{document?.admin_name || document?.title || "Үйлчилгээний нөхцөл"}</h2>
         </div>
          <LegalDocumentInfoButton document={document} onOpen={() => setInfoOpen(true)} className="w-full md:w-auto" />
        </div>
        <DetailBody document={document} loading={loading} onOpenInfo={() => setInfoOpen(true)} />
        <LegalDocumentInfoModal open={infoOpen} onOpenChange={setInfoOpen} document={document} />
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-black">{document?.admin_name || document?.title || "Үйлчилгээний нөхцөл"}</DialogTitle>
          <DialogDescription>#{document?.id ?? "ID байхгүй"}</DialogDescription>
        </DialogHeader>

        <DetailBody document={document} loading={loading} onOpenInfo={() => setInfoOpen(true)} />
      </DialogContent>
      <LegalDocumentInfoModal open={infoOpen} onOpenChange={setInfoOpen} document={document} />
    </Dialog>
  );
};

export default LegalDocumentDetail;

