export const PRIMARY_CRM_USER = {
  id: "accdb4bc-c806-405f-95cd-721b78804d77",
  email: "priyank@texwebsolution.in",
  name: "Priyank Patel",
  role: "sales_head",
  designation: "Sales Head",
  domain: "sales",
};

export function isPrimaryCrmUser(profile = {}, user = {}) {
  const id = profile?.id || user?.id || "";
  const email = String(profile?.email || user?.email || "").toLowerCase();
  return id === PRIMARY_CRM_USER.id || email === PRIMARY_CRM_USER.email;
}

export function enforcePrimaryCrmProfile(profile = {}) {
  if (!isPrimaryCrmUser(profile)) return null;
  return {
    ...profile,
    id: PRIMARY_CRM_USER.id,
    email: profile.email || PRIMARY_CRM_USER.email,
    full_name: profile.full_name || PRIMARY_CRM_USER.name,
    role: PRIMARY_CRM_USER.role,
    designation: profile.designation || PRIMARY_CRM_USER.designation,
    domain: PRIMARY_CRM_USER.domain,
    status: profile.status || "active",
  };
}
