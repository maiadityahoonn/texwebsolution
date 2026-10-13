"use client";

import React from "react";
import {
  Camera,
  CheckCircle2,
  Upload,
  Trash2,
  User,
  Lock,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import { ROLE_LABELS, profileDepartmentLabel } from "@/components/crm/shared/crmConstants";

export default function SettingsView({
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
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Identity & Avatar Card */}
        <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-6 bg-transparent dark:bg-transparent flex flex-col items-center text-center shadow-none">
          <div className="relative group mb-4">
            <div className="w-24 h-24 rounded-2xl bg-gray-900 text-white font-bold text-3xl flex items-center justify-center overflow-hidden shadow-md border-2 border-white dark:border-slate-800">
              {profileEditForm.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profileEditForm.avatar_url}
                  alt={userProfile?.full_name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                (userProfile?.full_name || sessionUser?.email || "U")[0]?.toUpperCase()
              )}
            </div>
            <label
              className="absolute -bottom-2 -right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md cursor-pointer transition flex items-center justify-center group-hover:scale-105"
              title="Upload / Change Photo (Auto-WebP)"
            >
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileSelect}
                disabled={avatarUploading}
              />
            </label>
          </div>

          {avatarUploading && (
            <p className="text-xs text-red-600 font-semibold mb-2 animate-pulse">
              {avatarProcessingMsg || "Processing WebP photo..."}
            </p>
          )}
          {avatarStats && !avatarUploading && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20 mb-2">
              WebP {avatarStats.newKb} KB ({avatarStats.savingsPercent}% saved)
            </span>
          )}

          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {userProfile?.full_name || "Workspace User"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{sessionUser?.email}</p>

          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
              {ROLE_LABELS[currentRole] || currentRole}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
              {profileDepartmentLabel(userProfile)}
            </span>
          </div>

          <div className="w-full mt-6 pt-4 border-t border-gray-200 dark:border-slate-800 text-left text-xs space-y-2.5 text-gray-500 dark:text-slate-400">
            <div className="flex justify-between">
              <span className="font-medium">Account Status:</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Account ID:</span>
              <span className="font-mono text-[11px] text-gray-400">{sessionUser?.id?.slice(0, 8)}...</span>
            </div>
            {userProfile?.created_at && (
              <div className="flex justify-between">
                <span className="font-medium">Joined Workspace:</span>
                <span className="text-gray-700 dark:text-slate-300">
                  {new Date(userProfile.created_at).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Columns 2 & 3: Personal Information & Password Updates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Personal Details */}
          <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-6 bg-transparent dark:bg-transparent shadow-none">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100 dark:border-slate-800">
              <User className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Personal Information</h4>
                <p className="text-xs text-gray-400">Update your name, contact phone number, and profile picture</p>
              </div>
            </div>

            <form onSubmit={handleSaveOwnProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileEditForm.full_name}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, full_name: e.target.value })}
                    placeholder="Your Full Name"
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-xs focus:bg-white/60 dark:focus:bg-transparent focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-slate-300">Phone Number</label>
                  <input
                    type="tel"
                    value={profileEditForm.phone}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-xs focus:bg-white/60 dark:focus:bg-transparent focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-slate-300">Work Email (Verified)</label>
                <input
                  type="email"
                  disabled
                  value={sessionUser?.email || ""}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-100/70 dark:bg-slate-950 text-gray-400 text-xs cursor-not-allowed"
                />
              </div>

              {/* Direct Photo Submit with Automatic Resize & WebP Conversion */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-slate-300">
                  Profile Photo
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-dashed border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gray-900 text-white font-bold text-base flex items-center justify-center overflow-hidden shrink-0 border border-gray-200 dark:border-slate-700 shadow-2xs">
                      {profileEditForm.avatar_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={profileEditForm.avatar_url}
                          alt={userProfile?.full_name || "Profile"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (userProfile?.full_name || sessionUser?.email || "U")[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {profileEditForm.avatar_url ? "Custom Photo Uploaded" : "Default Avatar"}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">
                        ⚡ Auto-resizes to 400×400 & converts to lightweight WebP
                      </p>
                      {avatarStats && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>WebP: {avatarStats.originalKb} KB → {avatarStats.newKb} KB ({avatarStats.savingsPercent}% saved)</span>
                        </p>
                      )}
                      {avatarProcessingMsg && (
                        <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-0.5 animate-pulse">
                          {avatarProcessingMsg}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <label
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition shadow-xs cursor-pointer ${
                        avatarUploading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{avatarUploading ? "Processing..." : profileEditForm.avatar_url ? "Change Photo" : "Upload Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarFileSelect}
                        disabled={avatarUploading}
                      />
                    </label>
                    {profileEditForm.avatar_url && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={avatarUploading}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition border border-red-200 dark:border-red-500/20 cursor-pointer"
                        title="Remove profile photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer text-xs flex items-center gap-2"
                >
                  {savingProfile ? "Saving..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Change Password */}
          <div className="rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-6 bg-transparent dark:bg-transparent shadow-none">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100 dark:border-slate-800">
              <Lock className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Change Password</h4>
                <p className="text-xs text-gray-400">Keep your account secure by setting a new password</p>
              </div>
            </div>

            <form onSubmit={handleChangeOwnPassword} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-slate-300">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={changePasswordForm.password}
                      onChange={(e) => setChangePasswordForm({ ...changePasswordForm, password: e.target.value })}
                      placeholder="Min 8 characters"
                      className="w-full p-2.5 pr-10 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-xs focus:bg-white/60 dark:focus:bg-transparent focus:outline-none focus:border-red-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-slate-300">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={changePasswordForm.confirm}
                    onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirm: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-transparent text-xs focus:bg-white/60 dark:focus:bg-transparent focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-slate-200 rounded-xl font-bold transition shadow-xs cursor-pointer text-xs flex items-center gap-2"
                >
                  {updatingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>

          {/* Card 3: Account Actions */}
          <div className="rounded-2xl border border-red-100 dark:border-red-500/20 p-6 bg-transparent dark:bg-transparent shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <LogOut className="w-5 h-5 text-red-600" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Account Session</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Logout from this workspace account.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer text-xs flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
