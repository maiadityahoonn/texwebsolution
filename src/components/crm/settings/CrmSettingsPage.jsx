"use client";

import SettingsView from "@/components/crm/settings/SettingsView";
import { useCrmShell } from "@/components/crm/shell/CrmShellContext";

export default function CrmSettingsPage() {
  const {
    profileEditForm,
    setProfileEditForm,
    userProfile,
    sessionUser,
    currentRole,
    handleAvatarFileSelect,
    avatarUploading,
    avatarProcessingMsg,
    avatarStats,
    handleRemoveAvatar,
    handleSaveOwnProfile,
    savingProfile,
    changePasswordForm,
    setChangePasswordForm,
    showNewPassword,
    setShowNewPassword,
    handleChangeOwnPassword,
    updatingPassword,
    handleSignOut,
  } = useCrmShell();

  return (
    <SettingsView
      profileEditForm={profileEditForm}
      setProfileEditForm={setProfileEditForm}
      userProfile={userProfile}
      sessionUser={sessionUser}
      currentRole={currentRole}
      handleAvatarFileSelect={handleAvatarFileSelect}
      avatarUploading={avatarUploading}
      avatarProcessingMsg={avatarProcessingMsg}
      avatarStats={avatarStats}
      handleRemoveAvatar={handleRemoveAvatar}
      handleSaveOwnProfile={handleSaveOwnProfile}
      savingProfile={savingProfile}
      changePasswordForm={changePasswordForm}
      setChangePasswordForm={setChangePasswordForm}
      showNewPassword={showNewPassword}
      setShowNewPassword={setShowNewPassword}
      handleChangeOwnPassword={handleChangeOwnPassword}
      updatingPassword={updatingPassword}
      handleSignOut={handleSignOut}
    />
  );
}
