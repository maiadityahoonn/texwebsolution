import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

async function getRequester(admin, request) {
  if (!admin) return null;
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

function fallbackDraft({ documentType, deal, notes, attachments = [] }) {
  const isAgreement = documentType === "agreement";
  const title = `${deal?.title || "Client Project"} ${isAgreement ? "Agreement" : "Quotation"}`;
  const service = deal?.service || "Technology Services";
  const amount = Number(deal?.deal_value || deal?.value || 0);
  const attachmentLine = attachments.length
    ? `Reference reviewed: ${attachments.map((item) => item.name).join(", ")}.`
    : "No external reference document attached.";
  const summary = [
    `Client requirement for ${service}.`,
    notes || deal?.notes || "Requirement details to be confirmed by sales team.",
    attachmentLine,
  ].filter(Boolean).join("\n");

  if (isAgreement) {
    return {
      title,
      scope_of_work: `TexWeb Solution will execute ${service} for the client as discussed in the linked sales deal.\n\nRequirement Summary:\n${summary}`,
      deliverables: "Approved project scope, UI/UX or technical planning as applicable, implementation, testing, deployment support, and handover documentation.",
      commercial_terms: `Commercial value: Rs. ${amount.toLocaleString("en-IN")}. Payment terms: 40% advance, 30% milestone, 30% final before handover. Final terms must be reviewed by Sales Head before sending.`,
      notes: "AI-assisted agreement draft. Review legal/commercial terms before sending.",
    };
  }

  return {
    title,
    scope_of_work: `Project Summary:\n${summary}\n\nScope includes discovery, planning, implementation, testing, deployment support, and handover for ${service}.`,
    deliverables: "1. Requirement clarification\n2. UI/UX or technical architecture as applicable\n3. Development and integrations\n4. QA and bug fixes\n5. Deployment and handover\n6. Limited post-delivery support",
    commercial_terms: `Quoted value: Rs. ${amount.toLocaleString("en-IN")}. Suggested payment plan: 40% advance, 30% milestone, 30% final before handover. Quotation validity: 10 days.`,
    notes: "AI-assisted quotation draft. Edit pricing, exclusions, and timeline before sending.",
  };
}

function buildPrompt({ documentType, deal, lead, client, notes, messages = [], attachments = [] }) {
  const recentMessages = messages.slice(-12).map((m) => `${m.role}: ${m.content}`).join("\n");
  return [
    "You are TexWeb Solution's internal sales document assistant.",
    "Create professional, practical content for CRM quotation/agreement drafts.",
    "Never mix data from another client. Use only the current deal/client context, current thread messages, notes, and attachments listed here.",
    "Return ONLY valid JSON with keys: title, scope_of_work, deliverables, commercial_terms, notes.",
    "",
    `Document type: ${documentType}`,
    `Deal: ${JSON.stringify(deal || {})}`,
    `Lead: ${JSON.stringify(lead || {})}`,
    `Client: ${JSON.stringify(client || {})}`,
    `User notes: ${notes || ""}`,
    `Attachments: ${attachments.map((item) => `${item.name} (${item.type})`).join(", ") || "none"}`,
    "",
    "Recent thread:",
    recentMessages || "No prior messages.",
  ].join("\n");
}

function parseDraftText(text, fallback) {
  try {
    const parsed = JSON.parse(text);
    return {
      title: parsed.title || fallback.title,
      scope_of_work: parsed.scope_of_work || fallback.scope_of_work,
      deliverables: parsed.deliverables || fallback.deliverables,
      commercial_terms: parsed.commercial_terms || fallback.commercial_terms,
      notes: parsed.notes || fallback.notes,
    };
  } catch {
    return {
      ...fallback,
      notes: [fallback.notes, text].filter(Boolean).join("\n\nAI Response:\n"),
    };
  }
}

export async function POST(request) {
  try {
    const admin = getAdminClient();
    const requester = await getRequester(admin, request);
    if (admin && !requester) {
      return NextResponse.json({ error: "Unauthorized AI document access." }, { status: 401 });
    }

    const body = await request.json();
    const fallback = fallbackDraft(body);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        draft: fallback,
        assistantMessage: "OpenAI key not configured, so a structured TexWeb template draft was generated.",
        mode: "template",
      });
    }

    const inputContent = [{ type: "input_text", text: buildPrompt(body) }];
    for (const attachment of body.attachments || []) {
      if (!attachment?.dataUrl) continue;
      if (String(attachment.type || "").startsWith("image/")) {
        inputContent.push({ type: "input_image", image_url: attachment.dataUrl, detail: "auto" });
      } else if (attachment.name && attachment.dataUrl) {
        inputContent.push({
          type: "input_file",
          filename: attachment.name,
          file_data: attachment.dataUrl,
        });
      }
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_DOCUMENT_MODEL || "gpt-4.1-mini",
        input: [{ role: "user", content: inputContent }],
        temperature: 0.2,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      return NextResponse.json({
        draft: fallback,
        assistantMessage: `OpenAI request failed: ${result?.error?.message || "Unknown error"}. Template fallback generated.`,
        mode: "template",
      });
    }

    const text = result.output_text || result.output?.flatMap((item) => item.content || []).map((part) => part.text || "").join("\n") || "";
    const draft = parseDraftText(text, fallback);
    return NextResponse.json({
      draft,
      assistantMessage: "Draft generated from current deal context and this client's AI thread only.",
      mode: "openai",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "AI document draft failed." }, { status: 500 });
  }
}
