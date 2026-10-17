"use client";

import { Key, X } from "lucide-react";

/**
 * Dedicated AI API Key Configuration & Test Connection Modal
 * Supports ChatGPT (OpenAI GPT-4o) and Google Gemini with live test verification
 */
export default function DocumentAiKeyModal({
  isOpen,
  onClose,
  openAiKeyInput,
  setOpenAiKeyInput,
  geminiKeyInput,
  setGeminiKeyInput,
  handleSaveKey,
  handleTestKey,
  testingKey,
  testResult,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4"
      data-modal-overlay="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#18150f] shadow-2xl border border-gray-200 dark:border-[#3a3020] p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-[#3a3020]">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-600" />
            <h3 className="font-black text-sm text-gray-900 dark:text-white">AI Engine & API Keys</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider 1: ChatGPT (OpenAI) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1.5">
              <span>🟢 ChatGPT (OpenAI Platform)</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold rounded">
                Tareeqa 1 (Active)
              </span>
            </label>
            <button
              type="button"
              disabled={testingKey || !openAiKeyInput.trim()}
              onClick={() => handleTestKey("openai", openAiKeyInput.trim())}
              className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer disabled:opacity-40"
            >
              {testingKey ? "Testing..." : "Test Key"}
            </button>
          </div>
          <input
            type="password"
            value={openAiKeyInput}
            onChange={(e) => setOpenAiKeyInput(e.target.value)}
            placeholder="sk-proj-..."
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3a3020] text-xs font-mono outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <div className="grid grid-cols-2 gap-1 pt-1">
            <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span><strong>Drafting:</strong> GPT-4o / mini</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span><strong>STT (Speech):</strong> Whisper-1</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span><strong>TTS (Audio):</strong> TTS-1 / HD</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span><strong>Vector:</strong> text-embedding-3</span>
            </div>
          </div>
          <p className="text-[10.5px] text-gray-400 leading-tight">
            Key from platform.openai.com. Powers multimodal document drafts, voice transcription, and voice narration.
          </p>
        </div>

        {/* Provider 2: Google Gemini */}
        <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1.5">
              <span>✨ Google Gemini Key</span>
            </label>
            <button
              type="button"
              disabled={testingKey || !geminiKeyInput.trim()}
              onClick={() => handleTestKey("gemini", geminiKeyInput.trim())}
              className="text-[10px] text-orange-600 hover:text-orange-700 font-bold cursor-pointer disabled:opacity-40"
            >
              {testingKey ? "Testing..." : "Test Key"}
            </button>
          </div>
          <input
            type="password"
            value={geminiKeyInput}
            onChange={(e) => setGeminiKeyInput(e.target.value)}
            placeholder="AIzaSy... (Free tier at aistudio.google.com)"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3a3020] text-xs font-mono outline-hidden focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`p-2.5 rounded-xl text-xs font-semibold ${
              testResult.success
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60"
            }`}
          >
            {testResult.message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveKey}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md transition"
          >
            Save Keys
          </button>
        </div>
      </div>
    </div>
  );
}
