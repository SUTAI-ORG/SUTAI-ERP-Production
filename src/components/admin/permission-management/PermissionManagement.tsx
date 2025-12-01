"use client";

import React, { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { usePermissionManagement } from "@/hooks/usePermissionManagement";
import { useCreateRole } from "@/hooks/useCreateRole";
import { useUpdateRole } from "@/hooks/useUpdateRole";
import { deleteRole } from "@/lib/api";
import { PermissionHeader } from "./PermissionHeader";
import { PermissionStatistics } from "./PermissionStatistics";
import { PermissionsTable } from "./PermissionsTable";
import { PermissionError } from "./PermissionError";
import { PermissionsModal } from "./PermissionsModal";
import { CreateRoleModal } from "./CreateRoleModal";
import { EditRoleModal } from "./EditRoleModal";
import { PermissionTabs } from "./PermissionTabs";
import { PermissionsList } from "./PermissionsList";

const PermissionManagement = () => {
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");
  const { permissions, loading, error, fetchPermissions } = usePermissionManagement();
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  
  const {
    availablePermissions,
    loadingPermissions,
    creating,
    formData,
    setFormData,
    handleCreateRole,
    resetForm,
  } = useCreateRole(showCreateModal, () => {
    setShowCreateModal(false);
    fetchPermissions();
  });

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const selectedRole = useMemo(
    () => (editingRoleId ? permissions.find((p) => p.id === editingRoleId) : null),
    [permissions, editingRoleId]
  );

  const initialEditData = useMemo(() => {
    if (!selectedRole) return null;
    return {
      title: selectedRole.name,
      permission_ids: selectedRole.permissionIds || [],
    };
  }, [selectedRole?.id, selectedRole?.name, JSON.stringify(selectedRole?.permissionIds)]);

  const handleEditSuccess = useCallback(() => {
    setShowEditModal(false);
    setEditingRoleId(null);
    fetchPermissions();
  }, []);

  const {
    availablePermissions: editPermissions,
    loadingPermissions: loadingEditPermissions,
    updating,
    formData: editFormData,
    setFormData: setEditFormData,
    handleUpdateRole,
    resetForm: resetEditForm,
  } = useUpdateRole(showEditModal, editingRoleId, initialEditData, handleEditSuccess);

  const handleEditClick = (roleId: number) => {
    setEditingRoleId(roleId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingRoleId(null);
    resetEditForm();
  };

  const handleDeleteRole = useCallback(async (roleId: number) => {
    const roleName = permissions.find((p) => p.id === roleId)?.name || "Энэ эрх";
    if (confirm(`${roleName} эрхийг устгахдаа итгэлтэй байна уу?`)) {
      try {
        const response = await deleteRole(roleId);
        if (response.error) {
          const errorMessage = response.error || response.message || "Эрх устгахад алдаа гарлаа";
          toast.error(errorMessage);
          console.error("Delete role error:", response);
        } else {
          toast.success("Эрх амжилттай устгагдлаа");
          fetchPermissions();
        }
      } catch (err: any) {
        const errorMessage = err?.message || err?.error || "Эрх устгахад алдаа гарлаа";
        toast.error(errorMessage);
        console.error("Delete role exception:", err);
      }
    }
  }, [permissions, fetchPermissions]);

  return (
    <div className="space-y-6">
      <PermissionHeader onAddClick={() => setShowCreateModal(true)} showAddButton={activeTab === "roles"} />
      <PermissionTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === "roles" ? (
        <>
          <PermissionStatistics permissions={permissions} loading={loading} />
          {error && !loading && <PermissionError error={error} onRetry={fetchPermissions} />}
          {!error && (
            <PermissionsTable
              permissions={permissions}
              loading={loading}
              onViewPermissions={setSelectedRoleId}
              onEditPermissions={handleEditClick}
              onDeleteRole={handleDeleteRole}
            />
          )}
        </>
      ) : (
        <PermissionsList />
      )}
      {selectedRoleId !== null && (
        <PermissionsModal
          roleId={selectedRoleId}
          roleName={permissions.find((p) => p.id === selectedRoleId)?.name || ""}
          permissions={permissions.find((p) => p.id === selectedRoleId)?.permissions || []}
          onClose={() => setSelectedRoleId(null)}
        />
      )}
      {showCreateModal && (
        <CreateRoleModal
          availablePermissions={availablePermissions}
          loadingPermissions={loadingPermissions}
          creating={creating}
          formData={formData}
          onFormDataChange={setFormData}
          onClose={handleCloseCreateModal}
          onSubmit={handleCreateRole}
        />
      )}
      {showEditModal && editingRoleId && selectedRole && (
        <EditRoleModal
          roleId={editingRoleId}
          roleName={selectedRole.name}
          availablePermissions={editPermissions}
          loadingPermissions={loadingEditPermissions}
          updating={updating}
          formData={editFormData}
          onFormDataChange={setEditFormData}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdateRole}
        />
      )}
    </div>
  );
};

export default PermissionManagement;

