import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { getPermissions, updateRole } from "@/lib/api";
import { PermissionOption } from "@/components/admin/permission-management/CreateRoleModal";

export const useUpdateRole = (
  showModal: boolean,
  roleId: number | null,
  initialData: { title: string; permission_ids: number[] } | null,
  onSuccess: () => void
) => {
  const [availablePermissions, setAvailablePermissions] = useState<PermissionOption[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    permission_ids: [] as number[],
  });
  const prevRoleIdRef = useRef<number | null>(null);
  const initialDataRef = useRef<{ title: string; permission_ids: number[] } | null>(null);

  useEffect(() => {
    if (showModal && initialData && roleId !== null && roleId !== prevRoleIdRef.current) {
      prevRoleIdRef.current = roleId;
      initialDataRef.current = initialData;
      setFormData({
        title: initialData.title,
        permission_ids: [...initialData.permission_ids],
      });
    }
    if (!showModal) {
      prevRoleIdRef.current = null;
      initialDataRef.current = null;
      setFormData({ title: "", permission_ids: [] });
    }
  }, [showModal, roleId]);

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

  const handleUpdateRole = async () => {
    if (!roleId) return;
    if (!formData.title.trim()) {
      toast.error("Эрхийн нэрийг оруулна уу");
      return;
    }
    if (formData.permission_ids.length === 0) {
      toast.error("Хамгийн багадаа нэг зөвшөөрөл сонгоно уу");
      return;
    }
    setUpdating(true);
    try {
      const response = await updateRole(roleId, {
        title: formData.title,
        permission_ids: formData.permission_ids,
      });
      if (response.error) {
        // Show detailed error message
        const errorMessage = response.error || response.message || "Эрх шинэчлэхэд алдаа гарлаа";
        toast.error(errorMessage);
        console.error("Update role error:", response);
      } else {
        toast.success("Эрх амжилттай шинэчлэгдлээ");
        onSuccess();
      }
    } catch (err: any) {
      const errorMessage = err?.message || err?.error || "Эрх шинэчлэхэд алдаа гарлаа";
      toast.error(errorMessage);
      console.error("Update role exception:", err);
    } finally {
      setUpdating(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", permission_ids: [] });
  };

  return {
    availablePermissions,
    loadingPermissions,
    updating,
    formData,
    setFormData,
    handleUpdateRole,
    resetForm,
  };
};

