"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Check,
  FileText,
  Key,
  Mic,
  MicOff,
  Paperclip,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { generateAiDocumentDraft } from "@/services/crm/chatService";
import { getDocumentClient, getDocumentKind, getDocumentTitle } from "./documentUtils";
import DocumentAiKeyModal from "./DocumentAiKeyModal";

const GEMINI_STORAGE_KEY = "texweb_gemini_api_key";
const OPENAI_STORAGE_KEY = "texweb_openai_api_key";

export default function DocumentAiBuilderPanel({
  doc,
  deals = [],
  clients = [],
  leads = [],
  onApply,
  onClose,
}) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(GEMINI_STORAGE_KEY) || "";
    }
    return "";
  });
  const [openAiKeyInput, setOpenAiKeyInput] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(OPENAI_STORAGE_KEY) || "";
    }
    return "";
  });
  const [provider, setProvider] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("texweb_ai_provider") || "openai";
    }
    return "openai";
  });
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const contact = useMemo(() => getDocumentClient(doc, deals, clients, leads), [clients, deals, doc, leads]);
  const kind = getDocumentKind(doc);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-IN"; // Supports English and common Hindi-English speech

      rec.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setPrompt((prev) => (prev ? `${prev.trim()} ${transcript.trim()}` : transcript.trim()));
        }
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  async function toggleVoiceRecording() {
    if (isListening) {
      // Stop speech recognition
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);

      // Stop media recorder if active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    } else {
      // Start speech recognition
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }

      // Also record raw voice audio via MediaRecorder to attach as audio file
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const reader = new FileReader();
          reader.onload = (ev) => {
            setAttachments((prev) => [
              ...prev,
              {
                name: `Voice_Note_${Date.now()}.webm`,
                type: "audio/webm",
                size: audioBlob.size,
                dataUrl: ev.target?.result,
              },
            ]);
          };
          reader.readAsDataURL(audioBlob);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
      } catch {
        // Microphone access denied or not available; fallback to speech recognition only
      }
    }
  }

  // Convert uploaded files to persistent Base64 DataURLs
  function handleFiles(files) {
    const list = Array.from(files || []);
    list.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: e.target?.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }

  function handleSaveKey() {
    if (typeof window !== "undefined") {
      localStorage.setItem(GEMINI_STORAGE_KEY, geminiKeyInput.trim());
      localStorage.setItem(OPENAI_STORAGE_KEY, openAiKeyInput.trim());
    }
    setShowKeyModal(false);
  }

  async function handleTestKey(targetProvider, key) {
    if (!key) {
      setTestResult({ success: false, message: "Please enter a key to test." });
      return;
    }
    setTestingKey(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/ai/document-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test-connection",
          provider: targetProvider,
          apiKey: key,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      setTestResult({ success: false, message: e.message || "Failed to reach server." });
    } finally {
      setTestingKey(false);
    }
  }

  async function handleGenerate(mode = "replace") {
    const text = prompt.trim();
    if ((!text && attachments.length === 0) || loading) return;

    setLoading(true);
    const userMsg = text || `Analyzed ${attachments.length} attachment(s)`;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    const geminiKey =
      (typeof window !== "undefined" && localStorage.getItem(GEMINI_STORAGE_KEY)) ||
      geminiKeyInput.trim();
    const openAiKey =
      (typeof window !== "undefined" && localStorage.getItem(OPENAI_STORAGE_KEY)) ||
      openAiKeyInput.trim();

    const result = await generateAiDocumentDraft({
      documentType: kind,
      notes: text,
      deal: contact.deal,
      lead: contact.lead,
      client: contact.client,
      messages,
      attachments,
      provider,
      geminiApiKey: geminiKey,
      openAiApiKey: openAiKey,
      mode,
    });

    const draft = result?.draft || {};
    const reply =
      result?.assistantMessage ||
      `✓ Prepared ${kind === "agreement" ? "agreement" : "quotation"} for ${contact.name}.`;
    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

    onApply?.(draft, mode);
    setPrompt("");
    setAttachments([]);
    setLoading(false);
  }

  return (
    <aside className="w-full lg:w-[380px] bg-white dark:bg-[#18150f] border-l border-gray-200 dark:border-[#3a3020] flex flex-col print:hidden h-full">
      {/* Top Header */}
      <div className="h-14 px-3 border-b border-gray-100 dark:border-[#3a3020] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-xl text-white flex items-center justify-center shadow-xs ${
            provider === "openai" ? "bg-gradient-to-tr from-emerald-600 to-teal-500" : "bg-gradient-to-tr from-orange-500 to-amber-500"
          }`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-black text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>{provider === "openai" ? "ChatGPT (Tareeqa 1)" : "Google Gemini"}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                provider === "openai" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60" : "bg-orange-100 text-orange-700 dark:bg-orange-950/60"
              }`}>
                {provider === "openai" ? "GPT-4o" : "Multimodal"}
              </span>
            </div>
            <div className="text-[10px] text-gray-400">Photo · Voice · Text · Document</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Engine Switcher */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
            <button
              type="button"
              onClick={() => {
                setProvider("openai");
                if (typeof window !== "undefined") localStorage.setItem("texweb_ai_provider", "openai");
              }}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                provider === "openai" ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs font-black" : "text-gray-500 hover:text-gray-900"
              }`}
              title="Use Tareeqa 1: ChatGPT (OpenAI GPT-4o)"
            >
              ChatGPT
            </button>
            <button
              type="button"
              onClick={() => {
                setProvider("gemini");
                if (typeof window !== "undefined") localStorage.setItem("texweb_ai_provider", "gemini");
              }}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                provider === "gemini" ? "bg-white dark:bg-slate-900 text-orange-600 shadow-2xs font-black" : "text-gray-500 hover:text-gray-900"
              }`}
              title="Use Google Gemini 3.8 Flash"
            >
              Gemini
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setTestResult(null);
              setShowKeyModal(true);
            }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Configure AI API Keys"
          >
            <Key className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Document & Client Context Pill */}
      <div className="px-4 py-2 bg-gray-50/80 dark:bg-[#1c1712] border-b border-gray-100 dark:border-[#3a3020] flex items-center justify-between text-xs shrink-0">
        <span className="font-bold text-gray-700 dark:text-neutral-300 truncate max-w-[200px]">
          {getDocumentTitle(doc)}
        </span>
        <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md">
          {contact.name || "Client"}
        </span>
      </div>

      {/* Chat Messages Flow */}
      <div className="flex-1 overflow-y-auto crm-modal-scroll p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-[#241c14] dark:to-[#1f1710] border border-orange-100 dark:border-orange-900/30 text-xs text-gray-700 dark:text-neutral-200 leading-relaxed">
              <div className="font-black text-orange-800 dark:text-orange-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                Prompt with Voice, Photo or Text
              </div>
              <p className="text-[11px] text-gray-600 dark:text-neutral-400">
                Aap photo (handwritten requirement), voice recording, PDF ya text notes dekar quotation ya agreement generate kar sakte hain. Bada content hone par automatically Page 2 aur 3 par shift hoga.
              </p>
            </div>

            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
              Quick Suggestions:
            </div>
            <div className="space-y-1.5">
              {[
                "Web development quotation with 40k budget & 3 milestones",
                "Mobile app service agreement with 50% advance & IP terms",
                "E-commerce website quotation with payment gateway & 3 weeks delivery",
              ].map((sugg, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(sugg)}
                  className="w-full text-left p-2 rounded-xl border border-gray-200 dark:border-[#3a3020] hover:border-orange-400 hover:bg-orange-50/40 dark:hover:bg-slate-800 text-[11px] text-gray-600 dark:text-neutral-300 font-medium transition cursor-pointer"
                >
                  {sugg}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                message.role === "user"
                  ? "bg-orange-600 text-white ml-6 rounded-tr-xs"
                  : "bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-neutral-200 mr-6 rounded-tl-xs border border-gray-200 dark:border-slate-800"
              }`}
            >
              {message.content}
            </div>
          ))
        )}

        {loading && (
          <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 text-orange-700 dark:text-orange-300 text-xs flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin text-orange-600" />
            <span>Gemini AI is analyzing requirements & building document...</span>
          </div>
        )}
      </div>

      {/* Input Area with Voice, Camera, Attachments */}
      <div className="p-3 border-t border-gray-100 dark:border-[#3a3020] bg-white dark:bg-[#18150f] shrink-0 space-y-2">
        {/* Attached Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-[#3a3020]">
            {attachments.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative group/att flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 text-[10px] font-semibold text-gray-700 dark:text-neutral-200 shadow-2xs"
              >
                {file.type?.startsWith("image/") && file.dataUrl ? (
                  <img src={file.dataUrl} alt={file.name} className="w-5 h-5 rounded object-cover" />
                ) : file.type?.startsWith("audio/") ? (
                  <Mic className="w-3.5 h-3.5 text-orange-600" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span className="truncate max-w-[100px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                  className="text-gray-400 hover:text-red-500 cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setAttachments([])}
              className="text-[10px] font-bold text-red-500 hover:underline px-1 cursor-pointer self-center"
            >
              Clear
            </button>
          </div>
        )}

        {/* Text Prompt Box */}
        <div className="rounded-2xl border border-gray-200 dark:border-[#3a3020] bg-gray-50/50 dark:bg-slate-900/60 p-2 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-400/20 transition">
          <textarea
            rows={3}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={
              isListening
                ? "Listening... Speak in Hindi or English..."
                : "Type requirements, paste notes, or use mic/camera..."
            }
            className={`w-full resize-none bg-transparent text-xs text-gray-900 dark:text-neutral-100 outline-hidden leading-relaxed ${
              isListening ? "placeholder:text-orange-600 placeholder:animate-pulse font-semibold" : ""
            }`}
          />

          {/* Action Toolbar */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 dark:border-slate-800">
            {/* Input Media Buttons */}
            <div className="flex items-center gap-1">
              {/* 1. Voice Input (Microphone) */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`p-1.5 rounded-xl cursor-pointer transition ${
                  isListening
                    ? "bg-red-600 text-white animate-pulse shadow-md"
                    : "text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800"
                }`}
                title={isListening ? "Stop Voice Listening" : "Speak Voice Requirement (Speech-to-Text)"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* 2. Photo / Camera Upload */}
              <label
                className="p-1.5 rounded-xl text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 cursor-pointer"
                title="Upload Photo / Requirement Image"
              >
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>

              {/* 3. Document / File Attachment */}
              <label
                className="p-1.5 rounded-xl text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 cursor-pointer"
                title="Attach Document (.pdf, .txt, .docx, audio)"
              >
                <Paperclip className="w-4 h-4" />
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.doc,.docx,.csv,audio/*"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
            </div>

            {/* Submit Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleGenerate("append")}
                disabled={loading || (!prompt.trim() && attachments.length === 0)}
                className="px-2.5 py-1.5 rounded-xl border border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950/50 text-orange-600 font-bold text-[11px] disabled:opacity-40 cursor-pointer flex items-center gap-1 transition"
                title="Append generated section to page"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Page</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenerate("replace")}
                disabled={loading || (!prompt.trim() && attachments.length === 0)}
                className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-[11px] disabled:opacity-40 cursor-pointer shadow-md shadow-orange-500/20 flex items-center gap-1 transition active:scale-95"
                title="Generate complete multi-page document"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Full Proposal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated AI Key Configuration & Test Modal */}
      <DocumentAiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        openAiKeyInput={openAiKeyInput}
        setOpenAiKeyInput={setOpenAiKeyInput}
        geminiKeyInput={geminiKeyInput}
        setGeminiKeyInput={setGeminiKeyInput}
        handleSaveKey={handleSaveKey}
        handleTestKey={handleTestKey}
        testingKey={testingKey}
        testResult={testResult}
      />
    </aside>
  );
}

