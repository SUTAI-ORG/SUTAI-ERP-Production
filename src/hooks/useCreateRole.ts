import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getPermissions, createRole } from "@/lib/api";
import { PermissionOption } from "@/components/admin/permission-management/CreateRoleModal";

export const useCreateRole = (showModal: boolean, onSuccess: () => void) => {
  const [availablePermissions, setAvailablePermissions] = useState<PermissionOption[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    permission_ids: [] as number[],
  });

  useEffect(() => {
    if (showModal) {
      setLoadingPermissions(true);
      getPermissions()
        .then((response) => {
          if (response.data?.data) {
            setAvailablePermissions(response.data.data);
          }
        })
        .catch(() => {
          // Handle error
        })
        .finally(() => {
          setLoadingPermissions(false);
        });
    }
  }, [showModal]);

  const handleCreateRole = async () => {
    if (!formData.title.trim()) {
      toast.error("Эрхийн нэрийг оруулна уу");
      return;
    }
    if (formData.permission_ids.length === 0) {
      toast.error("Хамгийн багадаа нэг зөвшөөрөл сонгоно уу");
      return;
    }
    setCreating(true);
    try {
      const response = await createRole({
        title: formData.title,
        permission_ids: formData.permission_ids,
      });
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Эрх амжилттай үүсгэгдлээ");
        setFormData({ title: "", permission_ids: [] });
        onSuccess();
      }
    } catch (err) {
      toast.error("Алдаа гарлаа");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", permission_ids: [] });
  };

  return {
    availablePermissions,
    loadingPermissions,
    creating,
    formData,
    setFormData,
    handleCreateRole,
    resetForm,
  };
};

