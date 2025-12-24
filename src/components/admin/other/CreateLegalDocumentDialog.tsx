"use client";

import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { createLegalDocument } from "@/lib/api";
import { toast } from "sonner";

interface CreateLegalDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  trigger: React.ReactNode;
}

const CreateLegalDocumentDialog: React.FC<CreateLegalDocumentDialogProps> = ({
  open,
  onOpenChange,
  onCreated,
  trigger,
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [form, setForm] = useState({
    admin_name: "",
    kind: "terms",
    client: "web",
    locale: "mn",
    is_active: true,
  });

  const isCreateDisabled = useMemo(() => {
    return !form.admin_name.trim() || !form.kind || !form.client || !form.locale;
  }, [form.admin_name, form.kind, form.client, form.locale]);

  const resetForm = () => {
    setForm({
      admin_name: "",
      kind: "terms",
      client: "web",
      locale: "mn",

      is_active: true,
    });
  };

  const handleCreate = async () => {
    if (isCreateDisabled) {
      toast.error("Админ нэр, key, төрөл/клиент/хэл-ийг бөглөнө үү.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        admin_name: form.admin_name.trim(),
        kind: form.kind,
        client: form.client,
        locale: form.locale,
        is_active: form.is_active,
      };

      const response = await createLegalDocument(payload);
      if (response.error) {
        toast.error(response.error || "Үүсгэж чадсангүй");
        return;
      }

      toast.success("Амжилттай үүслээ");
      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Үүсгэж чадсангүй");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Үйлчилгээний нөхцөл нэмэх</DialogTitle>
          <DialogDescription>admin_name болон контент талбарыг заавал бөглөнө.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Админ нэр *</label>
            <Input
              placeholder="нэрээ оруулна уу"
              value={form.admin_name}
              onChange={(e) => setForm((prev) => ({ ...prev, admin_name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Төрөл *</label>
              <select
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none"
                value={form.kind}
                onChange={(e) => setForm((prev) => ({ ...prev, kind: e.target.value }))}
              >
                <option value="terms">terms</option>
                <option value="privacy">privacy</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Клиент *</label>
              <select
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none"
                value={form.client}
                onChange={(e) => setForm((prev) => ({ ...prev, client: e.target.value }))}
              >
                <option value="web">web</option>
                <option value="app">app</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Хэл *</label>
              <select
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none"
                value={form.locale}
                onChange={(e) => setForm((prev) => ({ ...prev, locale: e.target.value }))}
              >
                <option value="mn">mn</option>
                <option value="en">en</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Идэвхтэй</label>
              <select
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none"
                value={form.is_active ? "true" : "false"}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_active: e.target.value === "true" }))
                }
              >
                <option value="true">Тийм</option>
                <option value="false">Үгүй</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Болих
          </Button>
          <Button onClick={handleCreate} disabled={isCreateDisabled || submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Хадгалах
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLegalDocumentDialog;

