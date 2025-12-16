"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMerchant } from "@/lib/api";

interface CreateMerchantModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateMerchantModal: React.FC<CreateMerchantModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    type: "individual" as "individual" | "organization",
    family_name: "",
    last_name: "",
    first_name: "",
    gender: "",
    rd: "",
    email: "",
    phone: "",
    address: "",
    address_description: "",
    // Organization fields
    company_rd: "",
    company_name: "",
    company_email: "",
    company_phone: "",
    company_address: "",
    company_address_description: "",
  });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    if (formData.type === "individual") {
      if (!formData.family_name.trim() || !formData.last_name.trim() || !formData.first_name.trim()) {
        toast.error("Овог, Эцэг/эхийн нэр, Өөрийн нэрийг оруулна уу");
        return;
      }
    } else {
      if (!formData.company_name.trim()) {
        toast.error("Компанийн нэрийг оруулна уу");
        return;
      }
    }

    setCreating(true);
    try {
      const merchantData: any = {
        type: formData.type,
      };

      if (formData.type === "individual") {
        merchantData.family_name = formData.family_name.trim();
        merchantData.last_name = formData.last_name.trim();
        merchantData.first_name = formData.first_name.trim();
        
        if (formData.gender) {
          merchantData.gender = formData.gender;
        }
        if (formData.rd.trim()) {
          merchantData.rd = formData.rd.trim();
        }
        if (formData.email.trim()) {
          merchantData.email = formData.email.trim();
        }
        if (formData.phone.trim()) {
          merchantData.phone = formData.phone.trim();
        }
        if (formData.address.trim()) {
          merchantData.address = formData.address.trim();
        }
        if (formData.address_description.trim()) {
          merchantData.address_description = formData.address_description.trim();
        }
      } else {
        merchantData.company_name = formData.company_name.trim();
        
        if (formData.company_rd.trim()) {
          merchantData.company_rd = formData.company_rd.trim();
        }
        if (formData.company_email.trim()) {
          merchantData.company_email = formData.company_email.trim();
        }
        if (formData.company_phone.trim()) {
          merchantData.company_phone = formData.company_phone.trim();
        }
        if (formData.company_address.trim()) {
          merchantData.company_address = formData.company_address.trim();
        }
        if (formData.company_address_description.trim()) {
          merchantData.company_address_description = formData.company_address_description.trim();
        }
      }
      
      const response = await createMerchant(merchantData);
      if (response.error) {
        toast.error(response.error || "Алдаа гарлаа");
      } else {
        toast.success("Мерчант амжилттай үүсгэгдлээ");
        onSuccess();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] w-full max-w-2xl mx-4 bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Шинэ мерчант нэмэх</h2>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Төрөл <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.type}
              onValueChange={(value: "individual" | "organization") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Төрөл сонгох" />
              </SelectTrigger>
              <SelectContent className="z-[200] bg-white">
                <SelectItem value="individual">Хувь хүн</SelectItem>
                <SelectItem value="organization">Байгууллага</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === "individual" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="family-name" className="block text-sm font-medium text-slate-700 mb-2">
                    Овог <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="family-name"
                    type="text"
                    value={formData.family_name}
                    onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
                    placeholder="Овог"
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-sm font-medium text-slate-700 mb-2">
                    Эцэг/эхийн нэр <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="last-name"
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Эцэг/эхийн нэр"
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium text-slate-700 mb-2">
                    Өөрийн нэр <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="first-name"
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Өөрийн нэр"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Хүйс
                  </label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Хүйс сонгох" />
                    </SelectTrigger>
                    <SelectContent className="z-[200] bg-white">
                      <SelectItem value="male">Эрэгтэй</SelectItem>
                      <SelectItem value="female">Эмэгтэй</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="rd" className="block text-sm font-medium text-slate-700 mb-2">
                    Бүртгэлийн дугаар
                  </label>
                  <Input
                    id="rd"
                    type="text"
                    value={formData.rd}
                    onChange={(e) => setFormData({ ...formData, rd: e.target.value })}
                    placeholder="АБ12345678"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Имэйл
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                  Утасны дугаар
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="99112233"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                  Хаяг
                </label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Улаанбаатар"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="address-description" className="block text-sm font-medium text-slate-700 mb-2">
                  Хаягийн дэлгэрэнгүй
                </label>
                <Input
                  id="address-description"
                  type="text"
                  value={formData.address_description}
                  onChange={(e) => setFormData({ ...formData, address_description: e.target.value })}
                  placeholder="Баянзүрх дүүрэг 5-р хороо"
                  className="w-full"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-slate-700 mb-2">
                  Компанийн нэр <span className="text-red-500">*</span>
                </label>
                <Input
                  id="company-name"
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Сутайн Буянт ХХК"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="company-rd" className="block text-sm font-medium text-slate-700 mb-2">
                  Компанийн РД
                </label>
                <Input
                  id="company-rd"
                  type="text"
                  value={formData.company_rd}
                  onChange={(e) => setFormData({ ...formData, company_rd: e.target.value })}
                  placeholder="1234567"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="company-email" className="block text-sm font-medium text-slate-700 mb-2">
                  Компанийн имэйл
                </label>
                <Input
                  id="company-email"
                  type="email"
                  value={formData.company_email}
                  onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                  placeholder="company@example.com"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="company-phone" className="block text-sm font-medium text-slate-700 mb-2">
                  Компанийн утас
                </label>
                <Input
                  id="company-phone"
                  type="tel"
                  value={formData.company_phone}
                  onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                  placeholder="77669999"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="company-address" className="block text-sm font-medium text-slate-700 mb-2">
                  Компанийн хаяг
                </label>
                <Input
                  id="company-address"
                  type="text"
                  value={formData.company_address}
                  onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                  placeholder="Улаанбаатар хот, СБД"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="company-address-description" className="block text-sm font-medium text-slate-700 mb-2">
                  Компанийн хаягийн дэлгэрэнгүй
                </label>
                <Input
                  id="company-address-description"
                  type="text"
                  value={formData.company_address_description}
                  onChange={(e) => setFormData({ ...formData, company_address_description: e.target.value })}
                  placeholder="28-р хороо, оффисын байр 3 давхарт"
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={creating}>
            Цуцлах
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              creating ||
              (formData.type === "individual"
                ? !formData.family_name.trim() || !formData.last_name.trim() || !formData.first_name.trim()
                : !formData.company_name.trim())
            }
          >
            {creating ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </div>
    </div>
  );
};
