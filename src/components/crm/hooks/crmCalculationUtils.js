export function normalizeLeadPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length < 8) return "";
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function normalizeLeadEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function flattenLeadValues(value, output = []) {
  if (value == null) return output;
  if (Array.isArray(value)) {
    value.forEach((item) => flattenLeadValues(item, output));
    return output;
  }
  if (typeof value === "object") {
    Object.values(value).forEach((item) => flattenLeadValues(item, output));
    return output;
  }
  output.push(String(value));
  return output;
}

export function getLeadSearchBlob(lead) {
  return [
    lead?.name,
    lead?.full_name,
    lead?.phone,
    lead?.mobile,
    lead?.email,
    lead?.city,
    lead?.state,
    lead?.service,
    lead?.budget_range,
    lead?.notes,
    ...flattenLeadValues(lead?.raw_metadata),
    ...flattenLeadValues(lead?.form_answers),
  ].filter(Boolean).join(" ");
}

export function extractFirstEmail(value) {
  const match = String(value || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? normalizeLeadEmail(match[0]) : "";
}

export function extractFirstPhone(value) {
  const candidates = String(value || "").match(/(?:\+?\d[\d\s().-]{7,}\d)/g) || [];
  for (const candidate of candidates) {
    const phone = normalizeLeadPhone(candidate);
    if (phone) return phone;
  }
  return "";
}

export function normalizeLeadName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f]+/gi, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function getLeadMetaId(lead) {
  const raw =
    lead?.meta_lead_id ||
    lead?.leadgen_id ||
    lead?.lead_id ||
    lead?.raw_metadata?.meta_lead_id ||
    lead?.raw_metadata?.leadgen_id ||
    lead?.raw_metadata?.lead_id ||
    "";
  const digits = String(raw).replace(/\D/g, "");
  return digits.length >= 10 ? digits : "";
}

export function getLeadDuplicateKey(lead) {
  const metaId = getLeadMetaId(lead);
  if (metaId) return `meta:${metaId}`;
  const blob = getLeadSearchBlob(lead);
  const phone = normalizeLeadPhone(lead?.phone || lead?.mobile) || extractFirstPhone(blob);
  if (phone) return `phone:${phone}`;
  const email = normalizeLeadEmail(lead?.email) || extractFirstEmail(blob);
  if (email) return `email:${email}`;
  const name = normalizeLeadName(
    lead?.name ||
      lead?.full_name ||
      lead?.raw_metadata?.name ||
      lead?.raw_metadata?.["à¤ªà¥‚à¤°à¤¾_à¤¨à¤¾à¤®"]
  );
  const city = normalizeLeadName(lead?.city || lead?.raw_metadata?.city);
  const state = normalizeLeadName(lead?.state || lead?.raw_metadata?.state);
  const service = normalizeLeadName(lead?.service || lead?.raw_metadata?.service);
  if (name && (city || state || service)) return `profile:${name}:${city}:${state}:${service}`;
  return `row:${lead?.id || Math.random()}`;
}
