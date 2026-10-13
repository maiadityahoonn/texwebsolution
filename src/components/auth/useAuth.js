"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { processImageToWebp } from "@/lib/imageProcessor";
import { uploadAvatarImage } from "@/services/internal/tasksService";
import { updateUserProfile } from "@/services/supabaseService";
import { enforcePrimaryCrmProfile, isPrimaryCrmUser, PRIMARY_CRM_USER } from "@/lib/crmAccess";

export function useAuth({ setToast, onAuthSuccess, setProfiles } = {}) {
  const router = useRouter();

  // Session & user
  const [sessionUser, setSessionUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign in / forgot password
  const [authMode, setAuthMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [authMessage, setAuthMessage] = useState({ type: "", text: "" });

  // Profile Edit
  const [profileEditForm, setProfileEditForm] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProcessingMsg, setAvatarProcessingMsg] = useState("");
  const [avatarStats, setAvatarStats] = useState(null);

  // Change Password
  const [changePasswordForm, setChangePasswordForm] = useState({
    password: "",
    confirm: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Sync profile to edit form
  useEffect(() => {
    if (userProfile) {
      setProfileEditForm({
        full_name: userProfile.full_name || "",
        phone: userProfile.phone || "",
        avatar_url: userProfile.avatar_url || "",
      });
    }
  }, [userProfile]);

  async function fetchProfile(userId, userEmail, userMetadata = null) {
    if (!userId) return;
    try {
      // 1. Optimistic recovery from localStorage cache
      let cachedProfile = null;
      if (typeof window !== "undefined") {
        try {
          const rawLocal = localStorage.getItem("texweb_profile_" + userId);
          if (rawLocal) cachedProfile = JSON.parse(rawLocal);
          if (!cachedProfile) {
            const cachedList = JSON.parse(localStorage.getItem("texweb_cached_profiles") || "[]");
            cachedProfile = cachedList.find((p) => p.id === userId) || null;
          }
        } catch {}
      }

      // If we don't have userProfile yet, apply cached profile immediately
      if (cachedProfile && !userProfile) {
        setUserProfile(cachedProfile);
      }

      // 2. Fetch with 6-second timeout to prevent browser hanging on network latency
      let data = null;
      let error = null;
      try {
        const fetchPromise = supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Profile query timeout")), 6000)
        );
        const res = await Promise.race([fetchPromise, timeoutPromise]);
        data = res?.data;
        error = res?.error;
      } catch {
        data = cachedProfile;
      }

      if (error) {
        console.warn("Profile fetch warning:", error.message);
        data = data || cachedProfile;
      }

      // 3. User metadata
      let metaRole = userMetadata?.role;
      let metaDomain = userMetadata?.domain;
      let metaFullName = userMetadata?.full_name;

      if (!metaRole && !metaDomain) {
        try {
          const { data: authUserData } = await supabase.auth.getUser();
          metaRole = authUserData?.user?.user_metadata?.role;
          metaDomain = authUserData?.user?.user_metadata?.domain;
          metaFullName = authUserData?.user?.user_metadata?.full_name;
        } catch {}
      }

      if (!isPrimaryCrmUser(data || cachedProfile || {}, { id: userId, email: userEmail })) {
        try {
          await supabase.auth.signOut();
        } catch {}
        setSessionUser(null);
        setUserProfile(null);
        setAuthMessage({
          type: "error",
          text: "CRM access abhi sirf Sales Head Priyank Patel ke liye enabled hai.",
        });
        return;
      }

      let effectiveRole = data?.role;
      if (!effectiveRole || effectiveRole === "intern") {
        if (data?.designation === "Sales Head" || (data?.domain === "sales" && data?.designation?.toLowerCase().includes("head"))) {
          effectiveRole = "sales_head";
        } else if (data?.designation === "Sales Executive") {
          effectiveRole = "sales_executive";
        } else if (data?.designation === "Telecaller") {
          effectiveRole = "telecaller";
        } else if (data?.designation === "Tech Lead") {
          effectiveRole = "tech_lead";
        } else if (data?.designation === "Project Manager" || data?.designation === "PM") {
          effectiveRole = "pm";
        } else if (data?.designation === "SMM Head") {
          effectiveRole = "smm_head";
        } else if (data?.designation === "Finance Head") {
          effectiveRole = "finance_head";
        } else if (data?.designation === "Support Head") {
          effectiveRole = "support_head";
        } else if (metaRole) {
          effectiveRole = metaRole;
        } else if (userEmail?.toLowerCase().includes("admin")) {
          effectiveRole = "super_admin";
        } else {
          effectiveRole = data?.role || "intern";
        }
      }
      const effectiveDomain = (data?.domain && data.domain !== "web_dev")
        ? data.domain
        : (metaDomain || data?.domain || (effectiveRole.startsWith("sales") || effectiveRole === "telecaller" ? "sales" : "web_dev"));

      const profile = enforcePrimaryCrmProfile({
        ...(data || cachedProfile || {}),
        id: userId,
        full_name: data?.full_name || cachedProfile?.full_name || metaFullName || userEmail?.split("@")[0] || "User",
        email: userEmail,
        role: effectiveRole,
        domain: effectiveDomain,
      }) || {
        id: PRIMARY_CRM_USER.id,
        full_name: PRIMARY_CRM_USER.name,
        email: PRIMARY_CRM_USER.email,
        role: PRIMARY_CRM_USER.role,
        designation: PRIMARY_CRM_USER.designation,
        domain: PRIMARY_CRM_USER.domain,
        status: "active",
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("texweb_profile_" + userId, JSON.stringify(profile));
        } catch {}
      }

      if (["suspended", "paused"].includes(profile.status)) {
        try {
          await supabase.auth.signOut();
        } catch {}
        setSessionUser(null);
        setUserProfile(null);
        setAuthMessage({
          type: "error",
          text: profile.status === "suspended" ? "Your account is suspended." : "Your account is paused.",
        });
        return;
      }
      setUserProfile(profile);
      if (onAuthSuccess) {
        await onAuthSuccess(profile, { id: userId, email: userEmail });
      }
    } catch (err) {
      console.warn("fetchProfile network error:", err?.message || err);
    }
  }

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();
          if (error || !user) {
            await supabase.auth.signOut({ scope: "local" });
            setSessionUser(null);
            setUserProfile(null);
            setAuthMessage({
              type: "error",
              text: "Session expire ho gaya hai. Please login again.",
            });
            return;
          }
          setSessionUser(user);
          await fetchProfile(user.id, user.email, user.user_metadata);
        }
      } catch (err) {
        console.warn("Auth check network error:", err?.message || err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (!isMounted) return;
        if (event === "PASSWORD_RECOVERY") {
          setAuthMode("reset");
          setAuthMessage({ type: "success", text: "Set a new password to complete secure account setup." });
        }
        if (event === "INITIAL_SESSION") {
          return;
        }
        if (session?.user) {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();
          if (error || !user) {
            await supabase.auth.signOut({ scope: "local" });
            setSessionUser(null);
            setUserProfile(null);
            setAuthMessage({
              type: "error",
              text: "Session expire ho gaya hai. Please login again.",
            });
            return;
          }
          setSessionUser(user);
          await fetchProfile(user.id, user.email, user.user_metadata);
        } else if (event === "SIGNED_OUT") {
          setSessionUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.warn("Auth state change error:", err?.message || err);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSignIn(e) {
    e.preventDefault();
    setLoading(true);
    setAuthMessage({ type: "", text: "" });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setAuthMessage({
          type: "error",
          text: error.message.includes("Invalid login credentials")
            ? "Invalid email or password. Please use your secure setup link or Forgot password."
            : error.message,
        });
      } else if (data?.user) {
        setSessionUser(data.user);
        await fetchProfile(data.user.id, data.user.email);
        setAuthMessage({ type: "success", text: "Signed in successfully. Opening dashboard..." });
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const redirectTarget = params.get("redirect") || params.get("section");
          const crmSectionRedirects = {
            overview: "/crm/dashboard",
            dashboard: "/crm/dashboard",
            crm: "/crm/leads",
            leads: "/crm/leads",
            pipeline: "/crm/pipeline",
            followups: "/crm/followups",
            sales_followups: "/crm/followups",
            meetings: "/crm/meetings",
            sales_meetings: "/crm/meetings",
            quotation: "/crm/quotation",
            sales_commercials: "/crm/quotation",
            agreements: "/crm/agreements",
            invoices: "/crm/invoices",
            payments: "/crm/payments",
            clients: "/crm/clients",
            reports: "/crm/reports",
            sales_reports: "/crm/reports",
            chat: "/crm/chat",
            alerts: "/crm/alerts",
            settings: "/crm/settings",
          };
          if (redirectTarget) {
            router.replace(
              redirectTarget.startsWith("/")
                ? redirectTarget
                : crmSectionRedirects[redirectTarget] || "/crm/dashboard"
            );
          } else {
            router.replace("/crm/dashboard");
          }
        }
      }
    } catch {
      setAuthMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    if (!email.trim()) {
      setAuthMessage({ type: "error", text: "Please enter your corporate email." });
      return;
    }
    setLoading(true);
    setAuthMessage({ type: "", text: "" });
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : "https://texwebsolution.in/login";
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      setAuthMessage(
        error
          ? { type: "error", text: error.message }
          : { type: "success", text: "Password reset link sent to your email. Please check your inbox." }
      );
    } catch {
      setAuthMessage({ type: "error", text: "Error sending reset email. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateOwnPassword(e) {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.trim().length < 8) {
      setAuthMessage({ type: "error", text: "Password must be at least 8 characters long." });
      setToast?.("Password must be at least 8 characters long.");
      return;
    }
    setLoading(true);
    setAuthMessage({ type: "", text: "" });
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword.trim() });
      if (error) {
        setAuthMessage({ type: "error", text: error.message });
        setToast?.(error.message);
        return;
      }
      setNewPassword("");
      setAuthMode("signin");
      setToast?.("Password updated securely!");
      setAuthMessage({ type: "success", text: "Password updated successfully. Please sign in with your new password." });
    } catch {
      setAuthMessage({ type: "error", text: "Error updating password. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      if (sessionUser?.id && typeof window !== "undefined") {
        try {
          localStorage.removeItem("texweb_profile_" + sessionUser.id);
        } catch {}
      }
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out warning:", err?.message || err);
    }
    setSessionUser(null);
    setUserProfile(null);
    setEmail("");
    setPassword("");
    setNewPassword("");
    setAuthMessage({ type: "", text: "" });
    if (typeof window !== "undefined") {
      router.push("/login");
    }
  }

  async function handleSaveOwnProfile(e) {
    e.preventDefault();
    if (!sessionUser?.id) return;
    setSavingProfile(true);
    try {
      const updates = {
        full_name: profileEditForm.full_name.trim(),
        phone: profileEditForm.phone.trim(),
        avatar_url: profileEditForm.avatar_url.trim(),
      };
      const updated = await updateUserProfile(sessionUser.id, updates);
      if (updated) {
        setUserProfile((prev) => ({ ...prev, ...updates }));
        if (setProfiles) {
          setProfiles((prev) => prev.map((p) => (p.id === sessionUser.id ? { ...p, ...updates } : p)));
        }
        setToast?.("Profile updated successfully!");
      } else {
        setUserProfile((prev) => ({ ...prev, ...updates }));
        setToast?.("Profile saved.");
      }
    } catch (err) {
      setToast?.(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvatarFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file || !sessionUser?.id) return;

    if (!file.type.startsWith("image/")) {
      setToast?.("Please select a valid image file.");
      return;
    }

    setAvatarUploading(true);
    setAvatarProcessingMsg("Processing image...");
    try {
      const processed = await processImageToWebp(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
        format: "webp",
      });

      setAvatarProcessingMsg("Uploading avatar...");
      const publicUrl = await uploadAvatarImage(sessionUser.id, processed.blob, "avatar.webp");
      if (publicUrl) {
        setProfileEditForm((prev) => ({ ...prev, avatar_url: publicUrl }));
        await updateUserProfile(sessionUser.id, { avatar_url: publicUrl });
        setUserProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
        if (setProfiles) {
          setProfiles((prev) => prev.map((p) => (p.id === sessionUser.id ? { ...p, avatar_url: publicUrl } : p)));
        }
        setToast?.("Avatar updated successfully!");
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setToast?.("Failed to upload avatar: " + (err.message || "Unknown error"));
    } finally {
      setAvatarUploading(false);
      setAvatarProcessingMsg("");
      e.target.value = "";
    }
  }

  async function handleRemoveAvatar() {
    if (!sessionUser?.id) return;
    try {
      setProfileEditForm((prev) => ({ ...prev, avatar_url: "" }));
      await updateUserProfile(sessionUser.id, { avatar_url: "" });
      setUserProfile((prev) => ({ ...prev, avatar_url: "" }));
      if (setProfiles) {
        setProfiles((prev) => prev.map((p) => (p.id === sessionUser.id ? { ...p, avatar_url: "" } : p)));
      }
      setToast?.("Avatar removed.");
    } catch (err) {
      setToast?.("Failed to remove avatar.");
    }
  }

  async function handleChangeOwnPassword(e) {
    e.preventDefault();
    if (!changePasswordForm.password.trim()) {
      setToast?.("Please enter a new password.");
      return;
    }
    if (changePasswordForm.password.trim().length < 8) {
      setToast?.("Password must be at least 8 characters long.");
      return;
    }
    if (changePasswordForm.password !== changePasswordForm.confirm) {
      setToast?.("Passwords do not match.");
      return;
    }
    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: changePasswordForm.password.trim() });
      if (error) throw error;
      setChangePasswordForm({ password: "", confirm: "" });
      setToast?.("Password updated successfully!");
    } catch (err) {
      setToast?.(err.message || "Failed to update password.");
    } finally {
      setUpdatingPassword(false);
    }
  }

  return {
    // Session state
    sessionUser,
    setSessionUser,
    userProfile,
    setUserProfile,
    loading,
    setLoading,

    // Sign in / reset state
    authMode,
    setAuthMode,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    newPassword,
    setNewPassword,
    showNewPassword,
    setShowNewPassword,
    authMessage,
    setAuthMessage,

    // Profile state
    profileEditForm,
    setProfileEditForm,
    savingProfile,
    avatarUploading,
    avatarProcessingMsg,
    avatarStats,

    // Password change state
    changePasswordForm,
    setChangePasswordForm,
    updatingPassword,

    // Handlers
    fetchProfile,
    handleSignIn,
    handleForgotPassword,
    handleUpdateOwnPassword,
    handleSignOut,
    handleSaveOwnProfile,
    handleAvatarFileSelect,
    handleRemoveAvatar,
    handleChangeOwnPassword,
  };
}
