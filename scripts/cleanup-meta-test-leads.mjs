import fs from "fs";

const raw = fs.readFileSync(".env.local", "utf8");

function env(key) {
  const line = raw.split(/\r?\n/).find((item) => item.startsWith(`${key}=`));
  if (!line) return "";
  let value = line.slice(key.length + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return value;
}

const supabaseUrl = env("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

const select = "id,name,email,phone,service,budget_range,city,state,source,notes,raw_metadata";
const res = await fetch(`${supabaseUrl}/rest/v1/leads?select=${select}`, { headers });
const leads = await res.json().catch(() => []);
if (!res.ok) throw new Error(`Fetch leads failed: ${JSON.stringify(leads)}`);

function containsTestLead(value) {
  return String(value || "").toLowerCase().includes("<test lead:");
}

const testLeads = leads.filter((lead) => {
  const raw = JSON.stringify(lead.raw_metadata || {}).toLowerCase();
  return [
    lead.name,
    lead.email,
    lead.phone,
    lead.service,
    lead.budget_range,
    lead.city,
    lead.state,
    lead.notes,
  ].some(containsTestLead)
    || raw.includes("<test lead:")
    || String(lead.email || "").toLowerCase() === "test@meta.com"
    || String(lead.name || "").toLowerCase() === "meta lead";
});

console.log(JSON.stringify({
  matched: testLeads.length,
  leads: testLeads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
  })),
}, null, 2));

if (!process.argv.includes("--delete")) process.exit(0);
if (!testLeads.length) process.exit(0);

const ids = testLeads.map((lead) => lead.id);
const encodedIds = `(${ids.map((id) => `"${id}"`).join(",")})`;

for (const table of ["sales_followups", "sales_meetings", "deals"]) {
  const childRes = await fetch(`${supabaseUrl}/rest/v1/${table}?lead_id=in.${encodeURIComponent(encodedIds)}`, {
    method: "DELETE",
    headers,
  });
  if (!childRes.ok) {
    const body = await childRes.text();
    throw new Error(`Delete ${table} failed: ${body}`);
  }
}

const deleteRes = await fetch(`${supabaseUrl}/rest/v1/leads?id=in.${encodeURIComponent(encodedIds)}`, {
  method: "DELETE",
  headers,
});
if (!deleteRes.ok) {
  const body = await deleteRes.text();
  throw new Error(`Delete leads failed: ${body}`);
}

console.log(JSON.stringify({ deleted: ids.length, ids }, null, 2));
