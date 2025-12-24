"use client";

import React from "react";
import type { LegalDocument } from "./LegalDocuments";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Info } from "lucide-react";

const InfoRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col gap-1 rounded-lg border border-slate-200 px-3 py-2">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
    <span className="text-sm text-slate-800">{value ?? "-"}</span>
  </div>
);

export const LegalDocumentInfoGrid: React.FC<{ document: LegalDocument }> = ({ document }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
    <InfoRow label="ID" value={document.id ? `#${document.id}` : "-"} />
    <InfoRow label="Түлхүүр" value={document.key} />
    <InfoRow label="Төрөл" value={document.kind} />
    <InfoRow label="Клиент" value={document.client} />
    <InfoRow label="Хэл" value={document.locale} />
    <InfoRow label="Статус" value={document.status ?? (document.is_active ? "идэвхтэй" : "идэвхгүй")} />
    <InfoRow label="Үүссэн" value={document.created_at ? new Date(document.created_at).toLocaleDateString() : "-"} />
    <InfoRow label="Шинэчлэгдсэн" value={document.updated_at} />
  </div>
);

type InfoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: LegalDocument | null;
};

export const LegalDocumentInfoModal: React.FC<InfoModalProps> = ({ open, onOpenChange, document }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-black">
          {document?.admin_name || document?.title || "Мэдээлэл"}
        </DialogTitle>
      </DialogHeader>
      {document ? <LegalDocumentInfoGrid document={document} /> : <div className="text-sm text-slate-600">Мэдээлэл байхгүй</div>}
    </DialogContent>
  </Dialog>
);

type InfoButtonProps = {
  document: LegalDocument | null;
  onOpen: () => void;
  className?: string;
};

export const LegalDocumentInfoButton: React.FC<InfoButtonProps> = ({ document, onOpen, className }) => (
  <Button variant="outline" onClick={onOpen} className={className}>
    <Info className="h-4 w-4" />
    {document ? "Мэдээлэл харах" : "Мэдээлэл байхгүй"}
  </Button>
);


