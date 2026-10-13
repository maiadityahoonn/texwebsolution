"use client";

import { useState, useEffect } from "react";
import {
  createAiMessage,
  createAiThread,
  generateAiDocumentDraft,
  getAiMessages,
  getAiThread,
} from "@/services/crm/chatService";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useCrmAiDocDrafting({
  showCommercialModal = false,
  commercialType = "proposal",
  commercialForm = {},
  setCommercialForm = () => {},
  deals = [],
  leads = [],
  clients = [],
}) {
  const [aiDocThread, setAiDocThread] = useState(null);
  const [aiDocMessages, setAiDocMessages] = useState([]);
  const [aiDocInput, setAiDocInput] = useState("");
  const [aiDocAttachments, setAiDocAttachments] = useState([]);
  const [aiDocDraft, setAiDocDraft] = useState(null);
  const [aiDocLoading, setAiDocLoading] = useState(false);
  const [aiDocListening, setAiDocListening] = useState(false);
  const [aiDocTracking, setAiDocTracking] = useState({
    status: "draft",
    sent_at: "",
    channel: "",
  });

  const aiDocumentType = commercialType === "agreement" ? "agreement" : "quotation";

  useEffect(() => {
    let cancelled = false;
    async function loadAiThread() {
      if (!showCommercialModal || !commercialForm.deal_id) return;
      const linkedDeal = deals.find((item) => item.id === commercialForm.deal_id);
      const threadTitle = `${linkedDeal?.title || commercialForm.title || "Client Document"} ${aiDocumentType}`;
      let thread = await getAiThread({ deal_id: commercialForm.deal_id, document_type: aiDocumentType });
      if (!thread) {
        thread = await createAiThread({
          deal_id: commercialForm.deal_id,
          lead_id: linkedDeal?.lead_id || null,
          client_id: linkedDeal?.client_id || null,
          document_type: aiDocumentType,
          title: threadTitle,
        });
      }
      const messages = await getAiMessages(thread?.id);
      if (cancelled) return;
      setAiDocThread(thread);
      setAiDocMessages(messages || []);
    }
    loadAiThread();
    return () => {
      cancelled = true;
    };
  }, [aiDocumentType, commercialForm.deal_id, commercialForm.title, deals, showCommercialModal]);

  async function handleAiAttachmentChange(files) {
    const selected = Array.from(files || []).slice(0, 4);
    const mapped = await Promise.all(
      selected.map(async (file) => ({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: await readFileAsDataUrl(file),
      }))
    );
    setAiDocAttachments((prev) => [...prev, ...mapped].slice(0, 6));
  }

  function startAiVoiceInput() {
    if (typeof window === "undefined") return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      alert("Voice typing is not supported in this browser. Please type notes or upload an audio/text brief.");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setAiDocListening(true);
    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || "";
      if (text) setAiDocInput((prev) => [prev, text].filter(Boolean).join(" "));
    };
    recognition.onerror = () => setAiDocListening(false);
    recognition.onend = () => setAiDocListening(false);
    recognition.start();
  }

  function applyAiDraftToCommercialForm(draft = aiDocDraft) {
    if (!draft) return;
    setCommercialForm((prev) => ({
      ...prev,
      title: draft.title || prev.title,
      scope_of_work: draft.scope_of_work || prev.scope_of_work,
      deliverables: draft.deliverables || prev.deliverables,
      commercial_terms: draft.commercial_terms || prev.commercial_terms,
      notes: [prev.notes, draft.notes].filter(Boolean).join("\n\n"),
    }));
  }

  async function handleGenerateAiDocumentDraft() {
    if (!commercialForm.deal_id || aiDocLoading) return;
    const linkedDeal = deals.find((item) => item.id === commercialForm.deal_id);
    const linkedLead = leads.find((item) => item.id === linkedDeal?.lead_id);
    const linkedClient = clients.find((item) => item.id === linkedDeal?.client_id);
    setAiDocLoading(true);
    try {
      const userMessage = {
        thread_id: aiDocThread?.id,
        role: "user",
        content: aiDocInput || `Generate ${aiDocumentType} draft from current deal context.`,
        attachments: aiDocAttachments.map(({ dataUrl, ...rest }) => rest),
      };
      const savedUserMessage = aiDocThread?.id ? await createAiMessage(userMessage) : userMessage;
      const history = [...aiDocMessages, savedUserMessage].filter(Boolean);
      setAiDocMessages(history);

      const result = await generateAiDocumentDraft({
        documentType: aiDocumentType,
        deal: linkedDeal,
        lead: linkedLead,
        client: linkedClient,
        notes: aiDocInput,
        messages: history,
        attachments: aiDocAttachments,
      });
      const draft = result?.draft || null;
      setAiDocDraft(draft);
      if (draft) applyAiDraftToCommercialForm(draft);
      const assistantContent = [
        result?.assistantMessage || "AI draft generated.",
        draft?.title ? `Title: ${draft.title}` : null,
      ]
        .filter(Boolean)
        .join("\n\n");
      const assistantMessage = {
        thread_id: aiDocThread?.id,
        role: "assistant",
        content: assistantContent,
        metadata: { draft, status: "draft_generated" },
      };
      const savedAssistant = aiDocThread?.id ? await createAiMessage(assistantMessage) : assistantMessage;
      setAiDocMessages((prev) => [...prev, savedAssistant]);
      setAiDocTracking({ status: "draft_generated", sent_at: "", channel: "ai" });
    } catch (err) {
      console.error("AI drafting failed:", err);
    } finally {
      setAiDocLoading(false);
    }
  }

  return {
    aiDocThread,
    aiDocMessages,
    aiDocInput,
    setAiDocInput,
    aiDocAttachments,
    setAiDocAttachments,
    aiDocDraft,
    setAiDocDraft,
    aiDocLoading,
    aiDocListening,
    aiDocTracking,
    setAiDocTracking,
    handleAiAttachmentChange,
    startAiVoiceInput,
    applyAiDraftToCommercialForm,
    handleGenerateAiDocumentDraft,
  };
}
