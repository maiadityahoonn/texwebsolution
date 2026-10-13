import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const raw = line.slice(index + 1).trim();
        const value = raw.replace(/^['"]|['"]$/g, "");
        return [key, value];
      })
  );
}

const env = { ...readEnvFile(envPath), ...process.env };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const restUrl = `${supabaseUrl.replace(/\/$/, "")}/rest/v1`;

async function restRequest(table, { method = "GET", query = "", body = null, prefer = "" } = {}) {
  const response = await fetch(`${restUrl}/${table}${query ? `?${query}` : ""}`, {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${method} ${table} failed: ${data?.message || data?.error || response.statusText}`);
  }
  return data;
}

function isCrmReminderNotification(item) {
  const metadata = item?.metadata || {};
  const sourceType = metadata.source_type || metadata.sourceType || "";
  const linkUrl = String(item?.link_url || "");
  return Boolean(
    metadata.reminder === true ||
      metadata.requires_ack === true ||
      ["sales_followup", "sales_meeting"].includes(sourceType) ||
      linkUrl.includes("sales_followups") ||
      linkUrl.includes("sales_meetings") ||
      linkUrl.includes("/crm/followups") ||
      linkUrl.includes("/crm/meetings")
  );
}

function chunk(values, size = 100) {
  const groups = [];
  for (let i = 0; i < values.length; i += size) groups.push(values.slice(i, i + size));
  return groups;
}

function formatDateTime(value) {
  if (!value) return "soon";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

async function fetchByIds(table, ids) {
  const records = [];
  for (const group of chunk([...new Set(ids.filter(Boolean))], 100)) {
    const params = new URLSearchParams();
    params.set("select", "*");
    params.set("id", `in.(${group.join(",")})`);
    records.push(...(await restRequest(table, { query: params.toString() })));
  }
  return new Map(records.map((item) => [item.id, item]));
}

async function main() {
  const params = new URLSearchParams();
  params.set("select", "id,title,message,type,link_url,metadata,created_at");
  params.set("order", "created_at.desc");
  params.set("limit", "10000");
  const notifications = await restRequest("notifications", { query: params.toString() });

  const all = notifications || [];
  const keep = all.filter(isCrmReminderNotification);
  const remove = all.filter((item) => !isCrmReminderNotification(item));

  const followUpIds = keep
    .filter((item) => item.metadata?.source_type === "sales_followup")
    .map((item) => item.metadata?.source_id);
  const meetingIds = keep
    .filter((item) => item.metadata?.source_type === "sales_meeting")
    .map((item) => item.metadata?.source_id);

  const followUps = await fetchByIds("sales_followups", followUpIds);
  const meetings = await fetchByIds("sales_meetings", meetingIds);

  let synced = 0;
  for (const notification of keep) {
    const metadata = notification.metadata || {};
    const sourceType = metadata.source_type;
    const sourceId = metadata.source_id;
    let patch = null;

    if (sourceType === "sales_followup" && followUps.has(sourceId)) {
      const item = followUps.get(sourceId);
      patch = {
        title: "Follow-up reminder",
        message: `${item.title || "Sales follow-up"} is due at ${formatDateTime(item.due_at)}. Call or WhatsApp the client.`,
        type: "lead",
        link_url: "/workspace?section=sales_followups",
        metadata: {
          ...metadata,
          reminder: true,
          requires_ack: true,
          source_type: "sales_followup",
          source_id: item.id,
          scheduled_for: item.due_at,
          reminder_before_minutes: item.reminder_before_minutes ?? 10,
        },
      };
    }

    if (sourceType === "sales_meeting" && meetings.has(sourceId)) {
      const item = meetings.get(sourceId);
      patch = {
        title: "Client meeting reminder",
        message: `${item.title || "Sales meeting"} starts at ${formatDateTime(item.scheduled_at)}. Send WhatsApp or call the client now.`,
        type: "meeting",
        link_url: "/workspace?section=sales_meetings",
        metadata: {
          ...metadata,
          reminder: true,
          requires_ack: true,
          source_type: "sales_meeting",
          source_id: item.id,
          scheduled_for: item.scheduled_at,
          reminder_before_minutes: item.reminder_before_minutes ?? 10,
        },
      };
    }

    if (patch) {
      const updateParams = new URLSearchParams();
      updateParams.set("id", `eq.${notification.id}`);
      await restRequest("notifications", {
        method: "PATCH",
        query: updateParams.toString(),
        body: patch,
        prefer: "return=minimal",
      });
      synced += 1;
    }
  }

  let queueDeleted = 0;
  let notificationsDeleted = 0;
  const removeIds = remove.map((item) => item.id);
  for (const group of chunk(removeIds, 100)) {
    const queueParams = new URLSearchParams();
    queueParams.set("notification_id", `in.(${group.join(",")})`);
    queueParams.set("select", "id");
    const queueRows = await restRequest("notification_queue", {
      method: "DELETE",
      query: queueParams.toString(),
      prefer: "return=representation",
    });
    queueDeleted += queueRows?.length || 0;

    const deleteParams = new URLSearchParams();
    deleteParams.set("id", `in.(${group.join(",")})`);
    deleteParams.set("select", "id");
    const deletedRows = await restRequest("notifications", {
      method: "DELETE",
      query: deleteParams.toString(),
      prefer: "return=representation",
    });
    notificationsDeleted += deletedRows?.length || 0;
  }

  console.log(JSON.stringify({
    ok: true,
    checked: all.length,
    kept_crm_reminders: keep.length,
    synced_crm_reminders: synced,
    deleted_non_crm_notifications: notificationsDeleted,
    deleted_queue_rows: queueDeleted,
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
