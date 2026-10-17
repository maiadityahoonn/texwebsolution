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

function buildPrompt({ documentType, deal, lead, client, notes, messages = [], attachments = [], mode = "full" }) {
  const recentMessages = messages.slice(-12).map((m) => `${m.role}: ${m.content}`).join("\n");
  const isAgreement = documentType === "agreement";
  return [
    "You are TexWeb Solution's expert commercial proposal & agreement creator.",
    "TexWeb Solution provides complete digital solutions: Web development, Mobile Apps, CRM, AI Automation, Digital Marketing, SEO, and Cloud Systems.",
    "",
    `Document type requested: ${isAgreement ? "Service Agreement Contract" : "Commercial Quotation Proposal"}`,
    `Mode: ${mode}`,
    `Client: ${client?.name || client?.company_name || lead?.name || deal?.client_name || "Client"}`,
    `Deal / Service: ${deal?.title || deal?.service || "Custom Software Implementation"}`,
    `Commercial Value: Rs. ${Number(deal?.deal_value || deal?.value || 75000).toLocaleString("en-IN")}`,
    `User requirements / Voice notes: ${notes || ""}`,
    "",
    "Carefully inspect any attached images, photos of handwritten requirements, receipts, screenshots, voice audio recordings, or attached documents.",
    "Generate comprehensive, highly professional, realistic content specifically matching the client's requirements, features, pricing, and timelines.",
    "",
    "Return ONLY a valid JSON object with the following schema:",
    "{",
    '  "title": "Document Title",',
    '  "scope_of_work": "Executive summary and scope of work",',
    '  "deliverables": "Detailed deliverables and specifications list",',
    '  "commercial_terms": "Payment schedule terms, advance percentage, and validity",',
    '  "pricingItems": [',
    '    { "item": "Module name", "description": "Features covered", "qty": 1, "rate": 45000, "amount": 45000 }',
    "  ],",
    '  "milestones": [',
    '    { "milestone": "Project Kickoff", "percentage": 40, "amount": 32000, "dueDate": "Upon Contract Signing" },',
    '    { "milestone": "Beta Review & Approval", "percentage": 30, "amount": 24000, "dueDate": "Week 3" },',
    '    { "milestone": "Final Launch & Handover", "percentage": 30, "amount": 24000, "dueDate": "Before Production Deploy" }',
    "  ],",
    '  "blocks": [',
    '    { "type": "heading", "heading": "PROJECT SUMMARY & SCOPE" },',
    '    { "type": "text", "body": "Executive summary..." },',
    '    { "type": "divider" },',
    '    { "type": "heading", "heading": "DELIVERABLES & MODULES" },',
    '    { "type": "text", "body": "Deliverable details..." },',
    '    { "type": "pricing", "heading": "Investment Breakdown", "pricingItems": [] },',
    '    { "type": "payment", "heading": "Milestone Schedule", "milestones": [] },',
    '    { "type": "box", "heading": "Terms & Acceptance", "body": "Validity and terms..." }',
    "  ],",
    '  "notes": "Brief explanation of generated draft"',
    "}",
  ].join("\n");
}

function parseDraftText(text, fallback) {
  try {
    let clean = (text || "").trim();
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```/, "").replace(/```$/, "").trim();
    }
    const parsed = JSON.parse(clean);
    return {
      title: parsed.title || fallback.title,
      scope_of_work: parsed.scope_of_work || fallback.scope_of_work,
      deliverables: parsed.deliverables || fallback.deliverables,
      commercial_terms: parsed.commercial_terms || fallback.commercial_terms,
      pricingItems: Array.isArray(parsed.pricingItems) ? parsed.pricingItems : [],
      milestones: Array.isArray(parsed.milestones) ? parsed.milestones : [],
      blocks: Array.isArray(parsed.blocks) && parsed.blocks.length > 0 ? parsed.blocks : null,
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
    const geminiKey = body.geminiApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const openAiKey = body.openAiApiKey || process.env.OPENAI_API_KEY;

    // Test API key connection action
    if (body.action === "test-connection") {
      const provider = body.provider || (openAiKey ? "openai" : "gemini");
      if (provider === "openai") {
        const key = body.apiKey || openAiKey;
        if (!key) return NextResponse.json({ success: false, message: "No OpenAI API key provided." });
        const testRes = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${key}` },
        });
        const testData = await testRes.json();
        if (testRes.ok) {
          return NextResponse.json({
            success: true,
            message: "✓ OpenAI Connected: GPT-4o, Whisper-1 (Speech), TTS-1 (Audio) & text-embedding-3-small active!",
          });
        }
        return NextResponse.json({ success: false, message: testData.error?.message || `HTTP ${testRes.status}` });
      } else {
        const key = body.apiKey || geminiKey;
        if (!key) return NextResponse.json({ success: false, message: "No Gemini API key provided." });
        const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const testData = await testRes.json();
        if (testRes.ok) {
          return NextResponse.json({ success: true, message: "✓ Google Gemini API Key authenticated successfully!" });
        }
        return NextResponse.json({ success: false, message: testData.error?.message || `HTTP ${testRes.status}` });
      }
    }

    // Action: Text-to-Speech (TTS) using OpenAI tts-1
    if (body.action === "tts") {
      const key = body.openAiApiKey || process.env.OPENAI_API_KEY;
      if (!key) {
        return NextResponse.json({ error: "OpenAI API key required for Text-to-Speech narration." }, { status: 400 });
      }
      const text = (body.text || body.prompt || "").trim().slice(0, 4000);
      if (!text) {
        return NextResponse.json({ error: "Text is required for TTS." }, { status: 400 });
      }

      const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: body.model || "tts-1",
          input: text,
          voice: body.voice || "alloy",
        }),
      });

      if (!ttsRes.ok) {
        const errData = await ttsRes.json().catch(() => ({}));
        return NextResponse.json(
          { error: errData.error?.message || `TTS failed with HTTP ${ttsRes.status}` },
          { status: ttsRes.status }
        );
      }

      const buffer = await ttsRes.arrayBuffer();
      const base64Audio = Buffer.from(buffer).toString("base64");
      return NextResponse.json({
        audioUrl: `data:audio/mp3;base64,${base64Audio}`,
        model: "tts-1",
        voice: body.voice || "alloy",
      });
    }

    // Action: Vector Embeddings using OpenAI text-embedding-3-small
    if (body.action === "embed") {
      const key = body.openAiApiKey || process.env.OPENAI_API_KEY;
      if (!key) {
        return NextResponse.json({ error: "OpenAI API key required for vector embeddings." }, { status: 400 });
      }
      const input = body.input || body.text || "";
      if (!input) {
        return NextResponse.json({ error: "Input text required for embeddings." }, { status: 400 });
      }

      const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: body.model || "text-embedding-3-small",
          input,
        }),
      });

      const embedData = await embedRes.json();
      if (!embedRes.ok) {
        return NextResponse.json(
          { error: embedData.error?.message || `Embedding failed with HTTP ${embedRes.status}` },
          { status: embedRes.status }
        );
      }

      return NextResponse.json({
        embedding: embedData.data?.[0]?.embedding || [],
        dimensions: embedData.data?.[0]?.embedding?.length || 1536,
        model: "text-embedding-3-small",
      });
    }

    const fallback = fallbackDraft(body);
    const preferredProvider = body.provider || (openAiKey ? "openai" : "gemini");

    // Helper: Transcribe audio voice notes using OpenAI Whisper-1
    async function transcribeAudioWithWhisper(attachment) {
      if (!attachment?.dataUrl || !openAiKey) return null;
      try {
        const commaIdx = attachment.dataUrl.indexOf(",");
        if (commaIdx === -1) return null;
        const header = attachment.dataUrl.slice(0, commaIdx);
        const base64Data = attachment.dataUrl.slice(commaIdx + 1);
        const buffer = Buffer.from(base64Data, "base64");

        let ext = "webm";
        let mimeType = "audio/webm";
        if (header.includes("audio/mp3") || header.includes("audio/mpeg")) {
          ext = "mp3";
          mimeType = "audio/mpeg";
        } else if (header.includes("audio/wav")) {
          ext = "wav";
          mimeType = "audio/wav";
        } else if (header.includes("audio/m4a")) {
          ext = "m4a";
          mimeType = "audio/m4a";
        }

        const blob = new Blob([buffer], { type: mimeType });
        const formData = new FormData();
        formData.append("file", blob, `voice_recording.${ext}`);
        formData.append("model", "whisper-1");
        formData.append("prompt", "TexWeb Solution quotation, service contract, technical scope, commercial terms.");

        const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${openAiKey}` },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          return data.text || null;
        }
      } catch (whisperErr) {
        console.warn("OpenAI Whisper STT error:", whisperErr?.message || whisperErr);
      }
      return null;
    }

    // Runner 1: OpenAI (ChatGPT GPT-4o / GPT-4o-mini + Whisper-1)
    async function runOpenAi() {
      if (!openAiKey) return null;
      try {
        // Transcribe any attached voice notes using Whisper-1
        const audioTranscripts = [];
        for (const att of body.attachments || []) {
          if (String(att?.type || "").startsWith("audio/") || String(att?.name || "").endsWith(".webm")) {
            const transcript = await transcribeAudioWithWhisper(att);
            if (transcript) audioTranscripts.push(transcript);
          }
        }
        if (audioTranscripts.length > 0) {
          body.notes = [
            body.notes,
            `[Spoken Voice Note Transcribed by Whisper-1]:\n${audioTranscripts.join("\n")}`,
          ]
            .filter(Boolean)
            .join("\n\n");
        }

        const userContent = [{ type: "text", text: buildPrompt(body) }];
        for (const attachment of body.attachments || []) {
          if (!attachment?.dataUrl) continue;
          if (String(attachment.type || "").startsWith("image/")) {
            userContent.push({
              type: "image_url",
              image_url: { url: attachment.dataUrl },
            });
          } else if (
            String(attachment.type || "").startsWith("text/") ||
            String(attachment.name || "").endsWith(".txt") ||
            String(attachment.name || "").endsWith(".csv") ||
            String(attachment.name || "").endsWith(".md") ||
            String(attachment.name || "").endsWith(".json")
          ) {
            const commaIdx = attachment.dataUrl.indexOf(",");
            if (commaIdx !== -1) {
              const base64Data = attachment.dataUrl.slice(commaIdx + 1);
              try {
                const decoded = Buffer.from(base64Data, "base64").toString("utf-8");
                userContent.push({
                  type: "text",
                  text: `Attached File (${attachment.name || "document"}):\n${decoded.slice(0, 15000)}`,
                });
              } catch {
                // Ignore decoding error
              }
            }
          }
        }

        const candidateModels = [
          process.env.OPENAI_DOCUMENT_MODEL,
          "gpt-4o-mini",
          "gpt-4o",
        ].filter(Boolean);

        for (const model of candidateModels) {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openAiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: userContent }],
              response_format: { type: "json_object" },
              temperature: 0.2,
            }),
          });

          const result = await response.json();
          if (response.ok && result.choices?.[0]?.message?.content) {
            const text = result.choices[0].message.content;
            const draft = parseDraftText(text, fallback);
            return {
              draft,
              assistantMessage: `✓ Content created using ChatGPT (${model})${
                audioTranscripts.length ? " + Whisper-1 audio transcription" : ""
              }.`,
              mode: "openai",
            };
          } else {
            fallback.openAiError = result?.error?.message || `HTTP ${response.status}`;
          }
        }
      } catch (err) {
        console.warn("OpenAI API error:", err.message);
        fallback.openAiError = err.message;
      }
      return null;
    }

    // Runner 2: Google Gemini Multimodal
    async function runGemini() {
      if (!geminiKey) return null;
      try {
        const parts = [{ text: buildPrompt(body) }];
        for (const attachment of body.attachments || []) {
          if (!attachment?.dataUrl) continue;
          const commaIdx = attachment.dataUrl.indexOf(",");
          if (commaIdx !== -1) {
            const header = attachment.dataUrl.slice(0, commaIdx);
            const base64Data = attachment.dataUrl.slice(commaIdx + 1);
            let mimeType = attachment.type || "application/octet-stream";
            if (header.includes("data:")) {
              mimeType = header.split(";")[0].replace("data:", "");
            }

            if (
              mimeType.startsWith("image/") ||
              mimeType.startsWith("audio/") ||
              mimeType === "application/pdf"
            ) {
              parts.push({
                inlineData: { mimeType, data: base64Data },
              });
            } else {
              try {
                const decoded = Buffer.from(base64Data, "base64").toString("utf-8");
                parts.push({
                  text: `Attached File (${attachment.name || "document"}):\n${decoded}`,
                });
              } catch {
                // Ignore decoding error
              }
            }
          }
        }

        const candidateModels = [
          process.env.GEMINI_MODEL,
          "gemini-3.8-flash",
          "gemini-flash-latest",
          "gemini-2.5-pro",
        ].filter(Boolean);

        for (const model of candidateModels) {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                  responseMimeType: "application/json",
                  temperature: 0.2,
                },
              }),
            }
          );

          const geminiData = await geminiRes.json();
          if (geminiRes.ok && geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
            const text = geminiData.candidates[0].content.parts[0].text;
            const draft = parseDraftText(text, fallback);
            return {
              draft,
              assistantMessage: `✓ Content created using Google Gemini Multimodal AI (${model}).`,
              mode: "gemini",
            };
          } else {
            fallback.geminiError = geminiData?.error?.message || `HTTP ${geminiRes.status}`;
            if (geminiRes.status !== 404) break;
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API error:", geminiErr.message);
        fallback.geminiError = geminiErr.message;
      }
      return null;
    }

    // Execute in priority order
    if (preferredProvider === "openai") {
      const openAiRes = await runOpenAi();
      if (openAiRes) return NextResponse.json(openAiRes);
      const geminiRes = await runGemini();
      if (geminiRes) return NextResponse.json(geminiRes);
    } else {
      const geminiRes = await runGemini();
      if (geminiRes) return NextResponse.json(geminiRes);
      const openAiRes = await runOpenAi();
      if (openAiRes) return NextResponse.json(openAiRes);
    }

    // 3. Fallback: Intelligent structured TexWeb quotation/agreement template
    const notice = fallback.openAiError || fallback.geminiError;
    const assistantMessage = notice
      ? `⚠️ AI Notice: ${notice}. Generated draft using structured TexWeb template.`
      : "Structured TexWeb draft generated from client requirement, service, and deal context.";

    return NextResponse.json({
      draft: fallback,
      assistantMessage,
      mode: "template",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "AI document draft failed." }, { status: 500 });
  }
}
