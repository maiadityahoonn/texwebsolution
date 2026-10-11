"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  TrendingUp,
  Users,
  CheckCircle2,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  Clock,
  MessageSquare,
  Building2,
  Briefcase,
  X,
  ExternalLink,
  FileText,
  Pencil,
  Trash2,
  Sparkles,
  XCircle,
  Copy,
  Check,
  AlertCircle,
  ShieldAlert,
  RotateCcw,
  Target,
  Percent,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  History,
  Eye,
  Video,
  ArrowDownAZ,
  Settings,
  Mic,
  Paperclip,
  IndianRupee,
  Layers,
} from "lucide-react";
import ActivityTimeline from "../shared/ActivityTimeline";
import MetaLeadsImportModal from "./MetaLeadsImportModal";
import { playNotificationSound } from "@/lib/notificationSound";
import {
  createAiDraft,
  createAiMessage,
  createAiThread,
  createInvoice,
  generateAiDocumentDraft,
  getAiMessages,
  getAiThread,
} from "@/services/supabaseService";

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const DEFAULT_REMINDER_MINUTES = 10;
const REMINDER_OPTIONS = [
  [5, "5 min before"],
  [10, "10 min before"],
  [15, "15 min before"],
  [30, "30 min before"],
  [60, "1 hour before"],
  [120, "2 hours before"],
  [1440, "1 day before"],
];
const DURATION_OPTIONS = [
  [15, "15 min"],
  [30, "30 min"],
  [45, "45 min"],
  [60, "1 hour"],
  [90, "1.5 hours"],
  [120, "2 hours"],
];
const TIME_HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
const TIME_MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

function toLocalDateTimeInput(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function datePart(value) {
  return String(value || "").slice(0, 10);
}

function timePart(value) {
  return String(value || "").slice(11, 16);
}

function timeParts12(value) {
  const [hourRaw = "10", minuteRaw = "00"] = timePart(value).split(":");
  const hour24 = Math.min(23, Math.max(0, Number.parseInt(hourRaw, 10) || 10));
  const minute = Math.min(59, Math.max(0, Number.parseInt(minuteRaw, 10) || 0));
  return {
    hour: String(hour24 % 12 || 12).padStart(2, "0"),
    minute: String(minute).padStart(2, "0"),
    meridiem: hour24 >= 12 ? "PM" : "AM",
  };
}

function buildTimeFrom12Hour(hour, minute, meridiem) {
  let nextHour = Math.min(12, Math.max(1, Number.parseInt(hour, 10) || 10));
  const nextMinute = Math.min(59, Math.max(0, Number.parseInt(minute, 10) || 0));
  if (meridiem === "PM" && nextHour !== 12) nextHour += 12;
  if (meridiem === "AM" && nextHour === 12) nextHour = 0;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

function combineDateTimeParts(currentValue, part, nextValue) {
  const today = toLocalDateTimeInput(new Date()).slice(0, 10);
  const currentDate = datePart(currentValue) || today;
  const currentTime = timePart(currentValue) || "10:00";
  const nextDate = part === "date" ? nextValue : currentDate;
  const nextTime = part === "time" ? nextValue : currentTime;
  return `${nextDate || today}T${nextTime || "10:00"}`;
}

function combineTime12Parts(currentValue, patch) {
  const current = timeParts12(currentValue);
  const next = { ...current, ...patch };
  return combineDateTimeParts(currentValue, "time", buildTimeFrom12Hour(next.hour, next.minute, next.meridiem));
}

function SplitDateTimeField({
  label = "Schedule",
  value,
  onChange,
  required = false,
  reminderValue,
  onReminderChange,
  showReminder = true,
  className = "",
}) {
  const selectedTime = timeParts12(value);
  return (
    <div className={`p-3.5 sm:p-4 rounded-2xl bg-gray-50/70 dark:bg-[#1a1712]/70 border border-gray-200/80 dark:border-[#3a3020] space-y-3 ${className}`}>
      {label ? (
        <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-neutral-200 text-xs">
          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        {/* Date Field */}
        <div className="sm:col-span-5 space-y-1.5">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Date {required ? "*" : ""}
          </span>
          <input
            type="date"
            required={required}
            value={datePart(value)}
            onChange={(e) => onChange?.(combineDateTimeParts(value, "date", e.target.value))}
            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-xs font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs"
          />
        </div>

        {/* Time Field */}
        <div className="sm:col-span-7 space-y-1.5">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Time (12-Hour) {required ? "*" : ""}
          </span>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,72px)] gap-1.5 items-center h-10">
            <select
              required={required}
              value={selectedTime.hour}
              onChange={(e) => onChange?.(combineTime12Parts(value, { hour: e.target.value }))}
              aria-label="Hour"
              className="w-full h-full px-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-center font-bold text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs cursor-pointer"
            >
              {TIME_HOUR_OPTIONS.map((hour) => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
            <span className="text-gray-400 dark:text-neutral-500 font-black text-xs shrink-0">:</span>
            <select
              required={required}
              value={selectedTime.minute}
              onChange={(e) => onChange?.(combineTime12Parts(value, { minute: e.target.value }))}
              aria-label="Minute"
              className="w-full h-full px-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-center font-bold text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs cursor-pointer"
            >
              {TIME_MINUTE_OPTIONS.map((minute) => (
                <option key={minute} value={minute}>{minute}</option>
              ))}
            </select>
            <select
              required={required}
              value={selectedTime.meridiem}
              onChange={(e) => onChange?.(combineTime12Parts(value, { meridiem: e.target.value }))}
              aria-label="AM or PM"
              className="w-full h-full px-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold text-xs text-center focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs cursor-pointer"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>

      {showReminder ? (
        <div className="space-y-1.5 pt-0.5">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <Clock className="w-3 h-3 text-emerald-500" />
            <span>Reminder Notification</span>
          </span>
          <select
            value={Number(reminderValue ?? DEFAULT_REMINDER_MINUTES)}
            onChange={(e) => onReminderChange?.(Number(e.target.value))}
            className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs cursor-pointer"
          >
            {REMINDER_OPTIONS.map(([minutes, labelText]) => (
              <option key={minutes} value={minutes}>{labelText}</option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}

function DurationSelectField({ label = null, value, onChange, className = "" }) {
  return (
    <div className={className}>
      {label ? (
        <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200 mb-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>{label}</span>
        </label>
      ) : null}
      <select
        value={Number(value || 60)}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs cursor-pointer text-xs"
      >
        {DURATION_OPTIONS.map(([minutes, labelText]) => (
          <option key={minutes} value={minutes}>{labelText}</option>
        ))}
      </select>
    </div>
  );
}

function SearchableLeadSelect({
  leads = [],
  value = "",
  onChange,
  placeholder = "Search lead by name, phone...",
  label = null,
  required = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedLead = useMemo(() => {
    return leads.find((l) => l.id === value) || null;
  }, [leads, value]);

  const filteredLeads = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return leads;
    return leads.filter((lead) => {
      const name = (lead.name || "").toLowerCase();
      const phone = (lead.phone || "").toLowerCase();
      const company = (lead.company || "").toLowerCase();
      const service = (lead.service || "").toLowerCase();
      return name.includes(term) || phone.includes(term) || company.includes(term) || service.includes(term);
    });
  }, [leads, searchTerm]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200 mb-1.5">
          <Users className="w-3.5 h-3.5 text-orange-500" />
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearchTerm("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
            if (!isOpen) setSearchTerm("");
          }
        }}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border ${
          isOpen ? "border-orange-500 ring-2 ring-orange-500/20 bg-white dark:bg-slate-800" : "border-gray-200 dark:border-slate-700"
        } text-gray-900 dark:text-white font-medium flex items-center justify-between gap-2 cursor-pointer transition shadow-2xs text-xs select-none`}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {selectedLead ? (
            <div className="truncate flex items-center gap-1.5">
              <span className="font-bold text-gray-900 dark:text-white truncate">{selectedLead.name}</span>
              {selectedLead.company && (
                <span className="text-gray-400 text-[10px] truncate">({selectedLead.company})</span>
              )}
              {selectedLead.phone && (
                <span className="text-gray-400 font-mono text-[10px] truncate">· {selectedLead.phone}</span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder || "No lead selected"}</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {selectedLead && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.("", null);
              }}
              className="p-0.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-white dark:bg-[#1f1b14] border border-gray-200 dark:border-[#3a3020] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#282218]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type name, phone, or service to search..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-orange-500 font-medium"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Leads List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 dark:divide-[#2e2619] text-xs">
            {/* Option to clear / No lead */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                onChange?.("", null);
                setIsOpen(false);
              }}
              className={`px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/60 transition ${
                !value ? "bg-orange-50/60 dark:bg-orange-950/20 text-orange-600 font-bold" : "text-gray-500"
              }`}
            >
              <span>No lead selected</span>
              {!value && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
            </div>

            {filteredLeads.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-xs">
                No leads matching &quot;{searchTerm}&quot;
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const isSelected = lead.id === value;
                return (
                  <div
                    key={lead.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      onChange?.(lead.id, lead);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-2 flex items-center justify-between gap-2 cursor-pointer hover:bg-orange-50/40 dark:hover:bg-orange-950/20 transition ${
                      isSelected ? "bg-orange-50/80 dark:bg-orange-950/40 text-orange-600 font-bold" : "text-gray-800 dark:text-neutral-200"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                        <span className="truncate">{lead.name}</span>
                        {lead.company && (
                          <span className="text-[10px] text-gray-400 font-normal truncate">({lead.company})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-normal mt-0.5">
                        {lead.phone && <span className="font-mono">{lead.phone}</span>}
                        {lead.service && (
                          <span className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-300">
                            {lead.service}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-orange-600 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResponsiveTableContainer({ children, className = "" }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0, hasMoved: false });

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const overflowing = maxScroll > 6;
    setIsOverflowing(overflowing);
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(overflowing && scrollLeft < maxScroll - 6);
    setScrollProgress(maxScroll > 0 ? Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)) : 0);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);
    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  const scrollByAmount = (amount) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const target = e.target;
    if (target.closest("button, a, input, select, textarea, [role='button']")) return;
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = {
      isDown: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!dragState.current.isDown) return;
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragState.current.startX) * 1.5;
    if (Math.abs(walk) > 3) {
      dragState.current.hasMoved = true;
      e.preventDefault();
    }
    el.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    dragState.current.isDown = false;
    setIsDragging(false);
  };

  return (
    <div className="relative group/table-wrapper">
      {/* Top Quick Scroll Bar */}
      {isOverflowing && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-orange-50/90 dark:from-[#251e13] dark:via-[#1f190e] dark:to-[#251e13] border-b border-orange-200/50 dark:border-[#3a3020] text-xs select-none">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-orange-950 dark:text-orange-200">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="truncate">Horizontal scroll: swipe, drag or use arrows</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Visual Mini Progress Bar */}
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-orange-700 dark:text-orange-300 font-mono">
              <div className="w-16 h-1.5 bg-orange-200/70 dark:bg-[#3a3020] rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 dark:bg-orange-400 transition-all duration-150 rounded-full"
                  style={{ width: `${Math.max(15, scrollProgress)}%` }}
                />
              </div>
            </div>

            {/* Quick Scroll Left / Right Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollByAmount(-280)}
                disabled={!canScrollLeft}
                className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-orange-200/70 dark:border-slate-700 text-gray-700 dark:text-neutral-200 hover:bg-orange-100 dark:hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
                title="Scroll table left"
                aria-label="Scroll table left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount(280)}
                disabled={!canScrollRight}
                className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-orange-200/70 dark:border-slate-700 text-gray-700 dark:text-neutral-200 hover:bg-orange-100 dark:hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
                title="Scroll table right"
                aria-label="Scroll table right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Side Edge Scroll Buttons */}
      {isOverflowing && canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-280)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 dark:bg-[#211d14]/95 text-gray-800 dark:text-white shadow-md border border-gray-200/80 dark:border-[#3a3020] flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-85 hover:opacity-100 cursor-pointer"
          title="Scroll Left"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {isOverflowing && canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(280)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 dark:bg-[#211d14]/95 text-gray-800 dark:text-white shadow-md border border-gray-200/80 dark:border-[#3a3020] flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-85 hover:opacity-100 cursor-pointer"
          title="Scroll Right"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* The Scrollable Viewport */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`overflow-x-auto table-scroll ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"} ${className}`}
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x pan-y",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5, columns = 6 }) {
  return (
    <div className="overflow-hidden">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-3 px-4 py-3 border-b border-gray-100 dark:border-[#3a3020]/60" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`h-3 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse ${colIndex === 0 ? "w-4/5" : colIndex === columns - 1 ? "w-2/3 justify-self-end" : "w-full"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function PipelineSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {PIPELINE_STAGES.map((stage) => (
        <div key={stage.id} className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-3 shadow-2xs min-h-[350px]">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#3a3020]">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${stage.color}`} />
              <div className="h-3 w-20 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-5 w-8 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="mt-3 space-y-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-xl border border-gray-200/80 dark:border-[#3a3020] bg-gray-50 dark:bg-[#211d14] p-3 space-y-2">
                <div className="h-3 w-4/5 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-1/2 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-12 rounded-lg bg-gray-200/70 dark:bg-slate-800 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusCardsSkeleton({ cards = 4 }) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <div className="h-3 w-24 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-8 w-8 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="h-7 w-16 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse mt-3" />
          <div className="h-3 w-32 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse mt-2" />
        </div>
      ))}
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-4">
      <StatusCardsSkeleton cards={4} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[0, 1].map((item) => (
          <div key={item} className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 shadow-2xs space-y-3">
            <div className="h-4 w-36 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((metric) => (
                <div key={metric} className="rounded-xl bg-gray-50 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] p-3 space-y-2">
                  <div className="h-5 w-12 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-3 w-16 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 shadow-2xs">
        <TableSkeleton rows={4} columns={3} />
      </div>
    </div>
  );
}

function CommercialsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs space-y-2">
            <div className="h-4 w-32 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-3 w-44 max-w-full rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
        <TableSkeleton rows={6} columns={6} />
      </div>
    </div>
  );
}

function CommercialDocumentPreview({ form, type, deal, lead, client }) {
  const isAgreement = type === "agreement";
  const amount = Number(form.amount || deal?.deal_value || 0);
  const docNumber = isAgreement ? form.agreement_number : form.quotation_number;
  const contactName = client?.name || lead?.name || "Client Name";
  const contactEmail = client?.email || lead?.email || "client@email.com";
  const contactPhone = client?.phone || lead?.phone || "Client phone";

  return (
    <div className="rounded-2xl bg-gray-100 dark:bg-[#211d14] border border-gray-200 dark:border-[#3a3020] p-3 lg:sticky lg:top-3">
      <div className="relative rounded-xl bg-white text-slate-900 shadow-sm border border-gray-200 overflow-hidden min-h-[620px]">
        <div className="relative h-28 border-b-4 border-slate-950 overflow-hidden bg-white">
          <div className="absolute -left-8 -top-8 grid grid-cols-6 gap-1 opacity-20">
            {Array.from({ length: 36 }).map((_, index) => (
              <span key={index} className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            ))}
          </div>
          <div className="absolute left-0 bottom-0 h-8 w-40 bg-slate-950 -skew-x-35 origin-bottom-left" />
          <div className="absolute left-0 bottom-0 h-4 w-36 bg-red-600 -skew-x-35 origin-bottom-left translate-y-1" />
          <div className="absolute right-0 top-0 h-full w-24 bg-slate-950 skew-x-35 translate-x-10" />
          <div className="absolute right-0 top-7 h-5 w-32 bg-red-600 -skew-x-35 translate-x-3" />
          <div className="relative z-10 flex h-full items-center justify-between gap-5 px-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-14 w-14 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                TW
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-black leading-none tracking-tight text-slate-950">TEXWEB</div>
                <div className="text-2xl font-black leading-none text-red-600">SOLUTION</div>
                <div className="text-[10px] font-semibold text-slate-600 mt-1 truncate">Complete Digital Solutions for Your Business</div>
              </div>
            </div>
            <div className="hidden sm:block h-16 w-px bg-slate-900/80" />
            <div className="hidden sm:grid gap-1 text-[10px] font-semibold text-slate-700 shrink-0 pr-8">
              {[
                ["TEL", "0755-4601839"],
                ["MAIL", "info@texwebsolution.in"],
                ["WEB", "www.texwebsolution.in"],
                ["PIN", "Kolkata | Bhopal"],
              ].map(([icon, value]) => (
                <div key={icon} className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-red-600 text-white text-[8px] font-black flex items-center justify-center">{icon}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative px-7 py-6 pb-28 min-h-[492px] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-red-500/6 flex items-center justify-center text-white font-black text-6xl">
              TW
            </div>
            <div className="absolute -left-20 bottom-14 h-40 w-[520px] rounded-[50%] border-t border-slate-200 rotate-[-14deg]" />
            <div className="absolute -left-10 bottom-8 h-28 w-[520px] rounded-[50%] border-t border-red-200 rotate-[-10deg]" />
            <div className="absolute -right-12 bottom-16 h-36 w-[420px] rounded-[50%] border-t border-slate-200 rotate-[-12deg]" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-red-600">{isAgreement ? "Agreement" : "Quotation"}</div>
                <div className="text-lg font-black">{form.title || (isAgreement ? "Project Agreement" : "Project Quotation")}</div>
              </div>
              <div className="text-right text-[10px] text-slate-500">
                <div className="font-black text-slate-900">{docNumber || "DOC-2026"}</div>
                <div>{new Date().toLocaleDateString("en-IN")}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="rounded-lg border border-slate-200 bg-white/80 p-3">
                <div className="font-black uppercase text-slate-400 mb-1">Prepared For</div>
                <div className="font-bold text-slate-900">{contactName}</div>
                <div className="text-slate-500 break-words">{contactEmail}</div>
                <div className="text-slate-500">{contactPhone}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/80 p-3">
                <div className="font-black uppercase text-slate-400 mb-1">Project</div>
                <div className="font-bold text-slate-900">{deal?.title || form.title || "Client Project"}</div>
                <div className="text-slate-500">{deal?.service || "Technology Services"}</div>
                {!isAgreement && <div className="font-black text-emerald-700 mt-1">Rs. {amount.toLocaleString("en-IN")}</div>}
              </div>
            </div>

            <div className="space-y-3 text-[11px] leading-relaxed">
              <section>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Scope of Work</h4>
                <p className="whitespace-pre-wrap text-slate-700">{form.scope_of_work || "Scope will appear here."}</p>
              </section>
              <section>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">{isAgreement ? "Commercial Terms" : "Deliverables"}</h4>
                <p className="whitespace-pre-wrap text-slate-700">{(isAgreement ? form.commercial_terms : form.deliverables) || "Details will appear here."}</p>
              </section>
              <section>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Notes</h4>
                <p className="whitespace-pre-wrap text-slate-600">{form.notes || "Review required before sending."}</p>
              </section>
            </div>

            <div className="grid grid-cols-2 gap-8 text-[10px] pt-4">
              <div>
                <div className="h-10 border-b border-slate-300 mb-1" />
                <div className="font-bold text-slate-600">TexWeb Authorized Signature</div>
              </div>
              <div>
                <div className="h-10 border-b border-slate-300 mb-1" />
                <div className="font-bold text-slate-600">Client Confirmation</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute left-0 right-0 bottom-0 h-16 bg-slate-950 text-white overflow-hidden">
          <div className="absolute left-0 top-0 h-8 w-32 bg-red-600 -skew-x-35 -translate-x-6" />
          <div className="absolute right-0 top-0 h-full w-20 bg-red-600 skew-x-35 translate-x-8" />
          <div className="relative z-10 h-full flex items-center justify-between gap-2 px-4 text-[9px]">
            <div className="font-black leading-tight min-w-0">
              <div>TexWeb Solution Private Limited</div>
              <div className="font-semibold text-white/70">CIN: U85500WB2026PTC287896</div>
            </div>
            {["Website Development", "Mobile App Development", "E-commerce Solutions", "Digital Marketing", "SMM", "AI & Automation"].map((item) => (
              <div key={item} className="hidden md:flex items-center gap-1 border-l border-red-600/70 pl-2 font-bold leading-tight">
                <span className="h-4 w-4 rounded bg-red-600/20 text-red-400 flex items-center justify-center text-[8px]">+</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const PIPELINE_STAGES = [
  { id: "contacted", label: "Contacted", color: "bg-cyan-500" },
  { id: "qualified", label: "Meeting", color: "bg-indigo-500" },
  { id: "proposal", label: "Quotation", color: "bg-purple-500" },
  { id: "negotiation", label: "Negotiation", color: "bg-amber-500" },
  { id: "closed_won", label: "Closed Won", color: "bg-emerald-500" },
];

const CLOSED_PIPELINE_STAGES = ["closed_won", "closed_lost"];

const STAGE_LOSS_REASONS = {
  contacted: [
    "Unresponsive after 3+ Follow-ups (Ghosted)",
    "Invalid / Wrong Phone Number",
    "Not Interested / Accidental Click",
    "Job / Internship Seeker",
    "Student / Academic Inquiry",
    "Spam / Junk Lead",
    "Budget Too Low (< Minimum Budget)",
  ],
  meeting: [
    "Meeting No-Show / Client Didn't Join",
    "Tech Stack / Scope Mismatch",
    "Client Postponed Project (3-6 Months)",
    "Competitor Selected (Lower Price / Existing SaaS)",
    "Decided to Build with In-House Team",
    "Decision Maker Not Convinced",
  ],
  proposal: [
    "Quotation Rejected (Pricing Too High)",
    "Scope / Deliverables Not Matched",
    "Competitor Selected (Lower Price)",
    "Competitor Selected (Better Brand / Portfolio)",
    "Project Budget Frozen / Cancelled by Management",
    "Client Ghosted After Receiving Quote",
  ],
  negotiation: [
    "Payment Terms Disagreement (Advance %)",
    "Timeline / Delivery SLA Not Matched",
    "Contract / Legal / IP Terms Disagreement",
    "Final Price Discount Not Agreed",
  ],
};

const LOSS_REASONS = [
  ...STAGE_LOSS_REASONS.contacted,
  ...STAGE_LOSS_REASONS.meeting,
  ...STAGE_LOSS_REASONS.proposal,
  ...STAGE_LOSS_REASONS.negotiation,
];

const AI_OBJECTION_HANDLERS = {
  "Quotation Rejected (Pricing Too High)": {
    counter: "Break project into Phase 1 MVP (core features only) to fit current budget, with Phase 2 later.",
    whatsapp_draft: "Hi {NAME}, completely understand budget constraints! Rather than compromising quality, how about we launch a Phase 1 MVP with core essentials at ~40% lower cost, and build advanced modules as revenue flows in? Let's do a quick 5-min call to review the tailored scope.",
  },
  "Budget Too Low (< Minimum Budget)": {
    counter: "Offer a pre-built template/starter kit solution instead of 100% bespoke software.",
    whatsapp_draft: "Hi {NAME}, custom development typically starts higher, but we also have modern pre-built frameworks that can get you live at your target budget! Let me know if you'd like a quick preview demo.",
  },
  "Competitor Selected (Lower Price)": {
    counter: "Emphasize 100% custom code ownership, dedicated project management, post-launch bug warranty, and zero recurring lock-in fees.",
    whatsapp_draft: "Hi {NAME}, wishing you the best with your selection! One quick note: TexWeb provides 100% full source code ownership, zero hidden license fees, and a dedicated PM. If anything changes down the line, our doors are always open.",
  },
  "Competitor Selected (Lower Price / Existing SaaS)": {
    counter: "Explain that off-the-shelf SaaS charges per-user per-month forever, whereas custom software has zero recurring licensing cost.",
    whatsapp_draft: "Hi {NAME}, congratulations on moving forward! Just keep in mind that custom software has 0 recurring user licenses. Whenever you outgrow SaaS limits, feel free to give us a shout.",
  },
  "Unresponsive after 3+ Follow-ups (Ghosted)": {
    counter: "Send a polite 'Breakup / File Closing' message. This psychologically triggers response in 45%+ cases.",
    whatsapp_draft: "Hi {NAME}, haven't heard back so assuming your tech project is on hold for now. Closing this inquiry file to keep your inbox clean - feel free to ping anytime you're ready to restart!",
  },
  "Client Postponed Project (3-6 Months)": {
    counter: "Schedule automated re-touch notification for 45-60 days before their new planned launch quarter.",
    whatsapp_draft: "Hi {NAME}, understood! Timing is everything. I'll make a note to reconnect in a couple of months so we can plan the roadmap well in advance of your launch target.",
  },
  "Meeting No-Show / Client Didn't Join": {
    counter: "Send a gentle rescheduled calendar link with zero pressure.",
    whatsapp_draft: "Hi {NAME}, missed you on our call today! Tech emergencies happen - here's our quick booking link whenever you have 15 mins to reschedule: https://texweb.in/meet",
  },
  "Tech Stack / Scope Mismatch": {
    counter: "Check if TexWeb's custom full-stack, AI, or mobile team can architect a customized alternative.",
    whatsapp_draft: "Hi {NAME}, thank you for walking through your requirements. We've reviewed the scope with our principal engineers to see if an alternative architecture could achieve your exact vision.",
  },
  "Payment Terms Disagreement (Advance %)": {
    counter: "Offer escrow or milestone-based payments (30% advance, 40% demo staging, 30% handover).",
    whatsapp_draft: "Hi {NAME}, we can restructure the payment plan to 3 milestones linked to clear deliverables so you only pay as you see tangible progress. Let's finalize this today!",
  },
};

function getLeadNextAction(lead, followUps = [], meetings = []) {
  if (lead?.status === "Lost") return "Archive with loss reason and create nurture reminder after 30 days.";
  if (lead?.status === "Converted") return "Handover to client portal and project delivery.";
  const hasPendingFollowUp = followUps.some((item) => item.lead_id === lead?.id && item.status === "pending");
  const hasScheduledMeeting = meetings.some((item) => item.lead_id === lead?.id && item.status === "scheduled");
  if (!lead?.phone && !lead?.email) return "Capture phone or email before qualification.";
  if (lead?.status === "New") return hasPendingFollowUp ? "Complete first contact follow-up." : "Contact within 5 minutes and qualify budget.";
  if (lead?.status === "Contacted") return hasScheduledMeeting ? "Prepare discovery agenda and confirm attendee." : "Schedule discovery meeting.";
  if (lead?.status === "Proposal Sent") return hasPendingFollowUp ? "Follow up for quotation approval." : "Create approval follow-up for quotation.";
  return "Review conversation and move to next pipeline stage.";
}

function getLeadBudget(lead) {
  if (!lead) return "-";
  if (lead.budget_range) return lead.budget_range;
  if (!lead.notes) return "-";
  const match = lead.notes.match(/Budget:\s*([^|]+)/i);
  return match ? match[1].trim() : "-";
}

function getLeadLocation(lead) {
  if (!lead) return "-";
  if (lead.city || lead.state) {
    return [lead.city, lead.state].filter(Boolean).join(", ");
  }
  if (!lead.notes) return "-";
  const match = lead.notes.match(/Location:\s*([^|]+)/i);
  return match ? match[1].trim() : "-";
}

function getLeadLossReason(lead, linkedDeal) {
  if (lead?.loss_reason) return lead.loss_reason;
  if (linkedDeal?.loss_reason) return linkedDeal.loss_reason;
  const notes = String(lead?.notes || linkedDeal?.notes || "");
  const match = notes.match(/Lost:\s*([^\n\r]+)/i);
  if (match && match[1]) return match[1].trim();
  return null;
}

function formatLeadAnswer(value) {
  const text = String(value || "").trim();
  if (!text || text === "-" || text === "—" || /[\u0080-\u009f\u00c2\u00c3\u00e2\u201a]/u.test(text)) return "-";
  return text;
}

function getLeadDisplayNotes(lead) {
  const cleanParts = String(lead?.notes || "")
    .split(/[|\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/reason:\s*(error validating access token|session has expired|unsupported get request|missing permissions|graph api|oauth|access token)/i.test(part))
    .filter((part) => !/error validating access token|session has expired|unsupported get request|missing permissions|oauth|access token/i.test(part));
  return cleanParts.join(" | ");
}

function parseLeadNoteFields(lead) {
  const fields = [];
  String(lead?.notes || "")
    .split(/[|\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const separatorIndex = part.indexOf(":");
      if (separatorIndex === -1) return;
      const label = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      if (!label) return;
      fields.push({
        key: label.toLowerCase(),
        label,
        value,
      });
    });
  return fields;
}

function getLeadNoteValue(fields, labels) {
  const wanted = labels.map((label) => label.toLowerCase());
  return fields.find((field) => wanted.includes(field.key))?.value || "";
}

function getLeadRawFormAnswers(lead) {
  let metadata = lead?.raw_metadata || {};
  if (typeof metadata === "string") {
    try {
      metadata = JSON.parse(metadata);
    } catch (_) {
      metadata = {};
    }
  }
  const answers = metadata?.form_answers || metadata?.formAnswers || metadata?.original_payload || {};
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return [];
  return Object.entries(answers)
    .filter(([label, value]) => {
      if (!label) return false;
      if (value === undefined || value === null) return false;
      return String(Array.isArray(value) ? value.join(", ") : value).trim() !== "";
    })
    .map(([label, value]) => ({
    key: String(label || "").toLowerCase(),
    label: String(label || "").trim(),
    value: Array.isArray(value) ? value.join(", ") : value,
  }));
}

function getLeadFormAnswers(lead) {
  const noteFields = parseLeadNoteFields(lead);
  const rawAnswerFields = getLeadRawFormAnswers(lead);
  const baseFields = [
    { label: "Service Looking For", value: lead?.service || getLeadNoteValue(noteFields, ["Service"]) },
    { label: "Budget Range", value: getLeadNoteValue(noteFields, ["Budget"]) || getLeadBudget(lead) },
    { label: "City / State", value: getLeadNoteValue(noteFields, ["Location"]) || getLeadLocation(lead) },
  ];
  const reserved = new Set([
    "service",
    "budget",
    "location",
    "form",
    "form name",
    "campaign",
    "campaign name",
    "ad",
    "ad name",
    "meta lead id",
    "lead id",
    "leadgen id",
    "meta created",
    "created time",
    "meta status",
    "lead status",
    "source",
    "platform",
    "is organic",
    "is_organic",
    "page id",
    "form id",
    "ad id",
    "adset id",
    "campaign id",
    "reason",
  ]);
  const mergedFields = [...noteFields.filter((field) => !reserved.has(field.key)), ...rawAnswerFields];
  const seen = new Set();
  const extraFields = mergedFields
    .filter((field) => {
      const key = `${field.key}:${String(field.value || "").trim().toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((field) => ({ label: field.label, value: field.value }));
  return [...baseFields, ...extraFields].map((field) => ({
    ...field,
    value: formatLeadAnswer(field.value),
  })).filter((field) => field.value !== "-");
}

function getFollowUpWhatsappMessage(item, lead, client) {
  const name = client?.name || lead?.name || "there";
  const context = item?.notes || item?.title || "your project discussion";
  return `Hi ${name}, quick follow-up from TexWeb Solution regarding ${context}. Please let me know a good time to close the next step.`;
}

const FOLLOWUP_STAGES = [
  { id: "pending", label: "Pending" },
  { id: "in_discussion", label: "In Discussion" },
  { id: "quote_sent", label: "Quotation Sent" },
  { id: "done", label: "Completed (Done)" },
  { id: "missed", label: "Missed" },
  { id: "cancelled", label: "Cancelled" },
];

const MEETING_STAGES = [
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed (Conducted)" },
  { id: "no_show", label: "No Show" },
  { id: "rescheduled", label: "Rescheduled" },
  { id: "cancelled", label: "Cancelled" },
];

function formatStatusLabel(status) {
  if (!status) return "Pending";
  const map = {
    pending: "Pending",
    done: "Completed",
    completed: "Completed",
    missed: "Missed",
    no_show: "No Show",
    scheduled: "Scheduled",
    cancelled: "Cancelled",
    in_discussion: "In Discussion",
    quote_sent: "Quote Sent",
    rescheduled: "Rescheduled",
    converted: "Converted",
  };
  return map[status] || status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseNotesHistory(rawNotes) {
  if (!rawNotes || typeof rawNotes !== "string") return [];
  const trimmed = rawNotes.trim();
  if (!trimmed) return [];

  const blocks = trimmed.split(/\n{2,}/);
  const parsed = [];

  blocks.forEach((block, idx) => {
    const text = block.trim();
    if (!text) return;

    // Pattern: [11 Oct 2026, 06:45 PM • Completed]: Note body
    const match = text.match(/^\[(.*?)(?:\s*[•\-|]\s*(?:Status:\s*)?(.*?))?\]:\s*([\s\S]*)$/i);
    if (match) {
      parsed.push({
        id: `entry-${idx}`,
        timestamp: match[1]?.trim() || "",
        stage: match[2]?.trim() || "",
        note: match[3]?.trim() || "",
        raw: text,
      });
    } else {
      parsed.push({
        id: `entry-${idx}`,
        timestamp: idx === 0 && blocks.length > 1 ? "Latest Note" : "Note",
        stage: "",
        note: text,
        raw: text,
      });
    }
  });

  return parsed;
}

function getLatestNoteSnippet(rawNotes) {
  if (!rawNotes || typeof rawNotes !== "string") return "";
  const history = parseNotesHistory(rawNotes);
  if (history.length > 0) {
    return history[0].note || history[0].raw;
  }
  return rawNotes.split("\n")[0] || "";
}

function getMeetingFullNotes(item) {
  if (!item) return "";
  const parts = [];
  if (item.outcome) parts.push(item.outcome);
  if (item.agenda) parts.push(`Agenda: ${item.agenda}`);
  if (item.next_action) parts.push(`Next Action: ${item.next_action}`);
  return parts.join("\n\n") || "No agenda or notes logged yet.";
}

function getLatestMeetingSnippet(item) {
  if (!item) return "";
  if (item.outcome) {
    return getLatestNoteSnippet(item.outcome);
  }
  return item.agenda || item.next_action || "Sales meeting scheduled";
}

export default function CrmModule({
  leads = [],
  deals = [],
  dealPagination = null,
  clients = [],
  proposals = [],
  quotations = [],
  agreements = [],
  invoices = [],
  followUps = [],
  followUpPagination = null,
  salesMeetings = [],
  meetingPagination = null,
  initialViewMode = "leads",
  leadPagination = null,
  leadSummary = null,
  onRefreshLeadSummary = null,
  commercialScope = "all",
  isDark = false,
  onUpdateLeadStatus,
  onCreateLead,
  onAddLead,
  onImportBatchLeads,
  onUpdateLead,
  onDeleteLead,
  onConvertToClientAndProject,
  onCreateProposal,
  onUpdateProposal,
  onUpdateQuotation,
  onCreateAgreement,
  onUpdateAgreement,
  onCreateInvoice,
  onCreateFollowUp,
  onUpdateFollowUp,
  onDeleteFollowUp,
  onCreateSalesMeeting,
  onUpdateSalesMeeting,
  onDeleteSalesMeeting,
  onUpdateDealStage,
  onUpdateDeal,
  onMarkLeadLost,
  onCreateDeal,
  onOpenDirectWhatsapp,
  onOpenChatWithLead,
  onOpenChat,
  onNavigateSection,
  onRefresh,
  onFetchLeadsPage,
  onFetchDealsPage,
  onFetchFollowUpsPage,
  onFetchMeetingsPage,
  isLoading = false,
  showViewTabs = false,
  headerActionsSlotId = "",
}) {
  const [viewMode, setViewMode] = useState(initialViewMode); // 'leads' or 'pipeline'
  const [headerActionsTarget, setHeaderActionsTarget] = useState(null);

  // Sync viewMode when initialViewMode prop changes (e.g., clicking Leads vs Sales Pipeline in sidebar)
  useEffect(() => {
    if (initialViewMode) setViewMode(initialViewMode);
  }, [initialViewMode]);

  useEffect(() => {
    setQuery("");
    setStatusFilter(viewMode === "leads" ? "active" : "all");
    setDateFilter("all");
    setLeadAlphabetFilter("all");
    setLeadSortOrder("default");
    setLeadPage(1);
  }, [viewMode]);

  useEffect(() => {
    if (!headerActionsSlotId) {
      setHeaderActionsTarget(null);
      return;
    }
    setHeaderActionsTarget(document.getElementById(headerActionsSlotId));
  }, [headerActionsSlotId, viewMode]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [leadPage, setLeadPage] = useState(1);
  const [leadsPerPage, setLeadsPerPage] = useState(10);
  const [leadAlphabetFilter, setLeadAlphabetFilter] = useState("all");
  const [leadSortOrder, setLeadSortOrder] = useState("default");
  const [pipelinePage, setPipelinePage] = useState(1);
  const [pipelinePageSize, setPipelinePageSize] = useState(20);
  const [followUpPage, setFollowUpPage] = useState(1);
  const [followUpPageSize, setFollowUpPageSize] = useState(10);
  const [meetingPage, setMeetingPage] = useState(1);
  const [meetingPageSize, setMeetingPageSize] = useState(50);
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({
    from: "",
    to: "",
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [showMetaImportModal, setShowMetaImportModal] = useState(false);
  const [showCommercialModal, setShowCommercialModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceDeal, setInvoiceDeal] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState({
    deal_id: "",
    client_id: "",
    invoice_number: "",
    title: "",
    amount: "",
    milestone_type: "advance",
    due_date: "",
    notes: "",
    status: "sent",
  });
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showSalesMeetingModal, setShowSalesMeetingModal] = useState(false);
  const [showMeetingSettingsModal, setShowMeetingSettingsModal] = useState(false);
  const [defaultMeetLink, setDefaultMeetLink] = useState(() => {
    if (typeof window === "undefined") return "https://meet.google.com/new";
    return localStorage.getItem("texweb_sales_default_meet_link") || "https://meet.google.com/new";
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("texweb_sales_default_meet_link", defaultMeetLink || "https://meet.google.com/new");
  }, [defaultMeetLink]);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [salesMeetingRescheduleTarget, setSalesMeetingRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    due_at: toLocalDateTimeInput(new Date(Date.now() + 86400000)),
    reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
    notes: "",
    meeting_link: "",
  });
  const [stageModalTarget, setStageModalTarget] = useState(null); // { item, type: 'followup' | 'meeting' }
  const [stageModalStatus, setStageModalStatus] = useState("");
  const [stageModalNote, setStageModalNote] = useState("");
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostTarget, setLostTarget] = useState(null);
  const [commercialType, setCommercialType] = useState("proposal");
  const [editingLead, setEditingLead] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [dealModalTab, setDealModalTab] = useState("overview"); // 'overview' | 'lead' | 'meetings' | 'followups' | 'timeline'
  const [editingDeal, setEditingDeal] = useState(null);
  const [editDealForm, setEditDealForm] = useState({
    title: "",
    deal_value: 0,
    pipeline_stage: "contacted",
    service: "Web Development",
    expected_close_date: "",
    loss_reason: "",
    notes: "",
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [newDealForm, setNewDealForm] = useState({
    title: "",
    client_id: "",
    lead_id: "",
    pipeline_stage: "contacted",
    deal_value: "100000",
    service: "Web Development",
    meeting_scheduled_at: toLocalDateTimeInput(new Date(Date.now() + 2 * 60 * 60 * 1000)),
    reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
    duration_minutes: 60,
    meeting_link: defaultMeetLink,
    notes: "",
  });
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "Web Development",
    source: "Website",
    status: "New",
    notes: "",
  });
  const [editLeadForm, setEditLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "Web Development",
    source: "Website",
    status: "New",
    notes: "",
  });
  const [commercialForm, setCommercialForm] = useState({
    title: "Website + CRM Implementation Quotation",
    quotation_number: `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    agreement_number: `AGR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    client_id: "",
    deal_id: "",
    proposal_id: "",
    quotation_id: "",
    amount: "120000",
    valid_until: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
    scope_of_work: "Discovery, UI/UX, Next.js development, Supabase setup, QA, deployment, and handover.",
    deliverables: "Admin panel, client portal, responsive website, source handover, and support.",
    commercial_terms: "40% advance, 30% milestone, 30% final before handover.",
    status: "sent",
    notes: "Prepared by Sales Head for client approval.",
  });
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
  const [followUpForm, setFollowUpForm] = useState({
    title: "Follow up for quotation approval",
    lead_id: "",
    client_id: "",
    deal_id: "",
    channel: "whatsapp",
    due_at: toLocalDateTimeInput(new Date(Date.now() + 86400000)),
    reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
    priority: "medium",
    notes: "",
  });
  const [salesMeetingForm, setSalesMeetingForm] = useState({
    title: "Client requirement discovery call",
    lead_id: "",
    client_id: "",
    deal_id: "",
    meeting_type: "discovery",
    scheduled_at: toLocalDateTimeInput(new Date(Date.now() + 86400000)),
    reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
    duration_minutes: 60,
    meeting_link: defaultMeetLink,
    agenda: "Requirement discovery, budget, timeline, decision maker, and next action.",
  });
  const [copiedScript, setCopiedScript] = useState(false);
  const [draggedDealId, setDraggedDealId] = useState(null);
  const [lostForm, setLostForm] = useState({
    stage: "contacted",
    reason: "Unresponsive after 3+ Follow-ups (Ghosted)",
    notes: "",
    competitor_name: "",
    re_nurture_days: "30",
  });

  function matchesDateFilter(item, field = "created_at") {
    if (dateFilter === "all") return true;
    const rawDate = item?.[field] || item?.created_at || item?.updated_at;
    if (!rawDate) return false;
    const time = new Date(rawDate).getTime();
    const now = Date.now();
    if (Number.isNaN(time)) return false;
    const itemDate = new Date(time);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    if (dateFilter === "today") return itemDate >= todayStart && itemDate < tomorrowStart;
    if (dateFilter === "yesterday") return itemDate >= yesterdayStart && itemDate < todayStart;
    if (dateFilter === "date") {
      if (!selectedDate) return true;
      const selectedStart = new Date(`${selectedDate}T00:00:00`);
      const selectedEnd = new Date(selectedStart);
      selectedEnd.setDate(selectedEnd.getDate() + 1);
      return itemDate >= selectedStart && itemDate < selectedEnd;
    }
    if (dateFilter === "day") return time >= now - 86400000;
    if (dateFilter === "week") return time >= now - 7 * 86400000;
    if (dateFilter === "month") return time >= now - 30 * 86400000;
    if (dateFilter === "year") return time >= now - 365 * 86400000;
    if (dateFilter === "custom") {
      const from = customDateRange.from ? new Date(`${customDateRange.from}T00:00:00`).getTime() : null;
      const to = customDateRange.to ? new Date(`${customDateRange.to}T23:59:59`).getTime() : null;
      return (!from || time >= from) && (!to || time <= to);
    }
    return true;
  }

  function getLeadServerDateRange() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const toIso = (date) => date.toISOString();
    if (dateFilter === "today") return { dateFrom: toIso(todayStart), dateTo: toIso(tomorrowStart) };
    if (dateFilter === "yesterday") {
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      return { dateFrom: toIso(yesterdayStart), dateTo: toIso(todayStart) };
    }
    if (dateFilter === "date" && selectedDate) {
      const selectedStart = new Date(`${selectedDate}T00:00:00`);
      const selectedEnd = new Date(selectedStart);
      selectedEnd.setDate(selectedEnd.getDate() + 1);
      return { dateFrom: toIso(selectedStart), dateTo: toIso(selectedEnd) };
    }
    if (dateFilter === "day") return { dateFrom: toIso(new Date(Date.now() - 86400000)), dateTo: "" };
    if (dateFilter === "week") return { dateFrom: toIso(new Date(Date.now() - 7 * 86400000)), dateTo: "" };
    if (dateFilter === "month") return { dateFrom: toIso(new Date(Date.now() - 30 * 86400000)), dateTo: "" };
    if (dateFilter === "year") return { dateFrom: toIso(new Date(Date.now() - 365 * 86400000)), dateTo: "" };
    if (dateFilter === "custom") {
      return {
        dateFrom: customDateRange.from ? new Date(`${customDateRange.from}T00:00:00`).toISOString() : "",
        dateTo: customDateRange.to ? new Date(`${customDateRange.to}T23:59:59`).toISOString() : "",
      };
    }
    return { dateFrom: "", dateTo: "" };
  }

  function getServerDateRange(fieldMode = "created") {
    return getLeadServerDateRange(fieldMode);
  }

  useEffect(() => {
    if (!onFetchLeadsPage || viewMode !== "leads") return;
    const timer = setTimeout(() => {
      const range = getLeadServerDateRange();
      onFetchLeadsPage({
        page: 1,
        pageSize: 200,
        search: "",
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange.from, customDateRange.to, dateFilter, onFetchLeadsPage, selectedDate, viewMode]);

  useEffect(() => {
    if (!onFetchDealsPage || viewMode !== "pipeline") return;
    const timer = setTimeout(() => {
      const range = getServerDateRange();
      onFetchDealsPage({
        page: 1,
        pageSize: 200,
        search: "",
        stage: "",
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange.from, customDateRange.to, dateFilter, onFetchDealsPage, selectedDate, viewMode]);

  useEffect(() => {
    if (!onFetchFollowUpsPage || viewMode !== "followups") return;
    const timer = setTimeout(() => {
      const range = getServerDateRange();
      onFetchFollowUpsPage({
        page: 1,
        pageSize: 100,
        search: "",
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange.from, customDateRange.to, dateFilter, onFetchFollowUpsPage, selectedDate, viewMode]);

  useEffect(() => {
    if (!onFetchMeetingsPage || viewMode !== "sales_meetings") return;
    const timer = setTimeout(() => {
      const range = getServerDateRange();
      onFetchMeetingsPage({
        page: meetingPage,
        pageSize: meetingPageSize,
        search: "",
        status: "",
        ...range,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange.from, customDateRange.to, dateFilter, meetingPage, meetingPageSize, onFetchMeetingsPage, selectedDate, viewMode]);

  const leadLetterCounts = useMemo(() => {
    const counts = {};
    leads.forEach((lead) => {
      const linkedDeal = deals.find((deal) => deal.lead_id === lead.id);
      const isInPipeline = Boolean(linkedDeal && !CLOSED_PIPELINE_STAGES.includes(linkedDeal.pipeline_stage || linkedDeal.stage));
      const hasWonDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_won");
      const hasLostDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_lost");

      const isConverted = hasWonDeal || (!linkedDeal && (lead.status === "Converted" || lead.status === "Closed Won"));
      const isLost = !isConverted && (hasLostDeal || (!linkedDeal && lead.status === "Lost"));
      const isPipelineLead = !isConverted && !isLost && (isInPipeline || (!linkedDeal && ["Contacted", "Qualified", "Proposal Sent", "In Pipeline", "Negotiation", "In Progress"].includes(lead.status)));
      const isActiveInquiry = !isConverted && !isLost && !isPipelineLead;

      const matchStatus =
        statusFilter === "all" || !statusFilter
          ? true
          : statusFilter === "active"
          ? isActiveInquiry
          : statusFilter === "pipeline"
          ? isPipelineLead
          : statusFilter === "converted" || statusFilter === "won"
          ? isConverted
          : statusFilter === "lost"
          ? isLost
          : true;

      const matchDate = matchesDateFilter(lead);
      if (matchStatus && matchDate) {
        const first = (lead.name || "").trim().toUpperCase().charAt(0);
        if (/[A-Z]/.test(first)) {
          counts[first] = (counts[first] || 0) + 1;
        } else if (first) {
          counts["#"] = (counts["#"] || 0) + 1;
        }
      }
    });
    return counts;
  }, [customDateRange.from, customDateRange.to, dateFilter, deals, leads, selectedDate, statusFilter]);

  const totalLettersCount = useMemo(() => {
    return Object.values(leadLetterCounts).reduce((a, b) => a + b, 0);
  }, [leadLetterCounts]);

  const filteredLeads = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = leads.filter((lead) => {
      const linkedDeal = deals.find((deal) => deal.lead_id === lead.id);
      const isInPipeline = Boolean(linkedDeal && !CLOSED_PIPELINE_STAGES.includes(linkedDeal.pipeline_stage || linkedDeal.stage));
      const hasWonDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_won");
      const hasLostDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_lost");

      const isConverted = hasWonDeal || (!linkedDeal && (lead.status === "Converted" || lead.status === "Closed Won"));
      const isLost = !isConverted && (hasLostDeal || (!linkedDeal && lead.status === "Lost"));
      const isPipelineLead = !isConverted && !isLost && (isInPipeline || (!linkedDeal && ["Contacted", "Qualified", "Proposal Sent", "In Pipeline", "Negotiation", "In Progress"].includes(lead.status)));
      const isActiveInquiry = !isConverted && !isLost && !isPipelineLead;

      const matchStatus =
        statusFilter === "all" || !statusFilter
          ? true
          : statusFilter === "active"
          ? isActiveInquiry
          : statusFilter === "pipeline"
          ? isPipelineLead
          : statusFilter === "converted" || statusFilter === "won"
          ? isConverted
          : statusFilter === "lost"
          ? isLost
          : true;

      const matchDate = matchesDateFilter(lead);
      const matchQuery =
        !q ||
        [lead.name, lead.phone, lead.email, lead.service, lead.source, lead.city, lead.state].some((val) =>
          String(val || "").toLowerCase().includes(q)
        );

      const firstChar = (lead.name || "").trim().toUpperCase().charAt(0);
      const matchAlphabet =
        leadAlphabetFilter === "all"
          ? true
          : leadAlphabetFilter === "#"
          ? !/[A-Z]/.test(firstChar)
          : firstChar === leadAlphabetFilter;

      return matchStatus && matchQuery && matchDate && matchAlphabet;
    });

    if (leadSortOrder === "asc" || (leadSortOrder === "default" && leadAlphabetFilter !== "all")) {
      result.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" }));
    } else if (leadSortOrder === "desc") {
      result.sort((a, b) => String(b.name || "").localeCompare(String(a.name || ""), undefined, { sensitivity: "base" }));
    }

    return result;
  }, [customDateRange.from, customDateRange.to, dateFilter, deals, leadAlphabetFilter, leadSortOrder, leads, query, selectedDate, statusFilter]);

  useEffect(() => {
    setLeadPage(1);
    setPipelinePage(1);
    setFollowUpPage(1);
    setMeetingPage(1);
  }, [customDateRange.from, customDateRange.to, dateFilter, followUpPageSize, leadAlphabetFilter, leadSortOrder, leadsPerPage, meetingPageSize, pipelinePageSize, query, selectedDate, statusFilter, viewMode]);

  const leadTotalForPagination = filteredLeads.length;
  const leadPageCount = Math.max(1, Math.ceil(leadTotalForPagination / leadsPerPage));
  const safeLeadPage = Math.min(Math.max(1, leadPage), leadPageCount);
  const paginatedLeads = useMemo(() => {
    const start = (safeLeadPage - 1) * leadsPerPage;
    return filteredLeads.slice(start, start + leadsPerPage);
  }, [filteredLeads, leadsPerPage, safeLeadPage]);
  const leadPageStart = leadTotalForPagination === 0 ? 0 : (safeLeadPage - 1) * leadsPerPage + 1;
  const leadPageEnd = Math.min(leadTotalForPagination, safeLeadPage * leadsPerPage);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = leadSummary?.total ?? leads.length;
    const newCount = leads.filter((l) => l.status === "New" && !deals.some((d) => d.lead_id === l.id)).length;
    
    const wonDealLeadIds = new Set(
      deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_won").map((d) => d.lead_id).filter(Boolean)
    );
    const activePipelineLeadIds = new Set(
      deals.filter((d) => !CLOSED_PIPELINE_STAGES.includes(d.pipeline_stage || d.stage)).map((d) => d.lead_id).filter(Boolean)
    );
    const lostDealLeadIds = new Set(
      deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_lost").map((d) => d.lead_id).filter(Boolean)
    );

    const convertedCount = leads.filter((l) => {
      if (wonDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || lostDealLeadIds.has(l.id)) return false;
      return l.status === "Converted" || l.status === "Closed Won";
    }).length + deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_won" && !d.lead_id).length;

    const lostCount = leads.filter((l) => {
      if (lostDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || wonDealLeadIds.has(l.id)) return false;
      return l.status === "Lost";
    }).length + deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_lost" && !d.lead_id).length;

    const lostDealsCount = deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_lost").length;
    const rate = total > 0 ? Math.round((convertedCount / total) * 100) : 0;
    const totalPipelineValue = deals
      .filter((d) => !CLOSED_PIPELINE_STAGES.includes(d.pipeline_stage || d.stage))
      .reduce((acc, d) => acc + (Number(d.deal_value || d.value) || 0), 0);
    const wonValue = deals
      .filter((d) => (d.pipeline_stage || d.stage) === "closed_won")
      .reduce((acc, d) => acc + (Number(d.deal_value || d.value) || 0), 0);
    const lostValue = deals
      .filter((d) => (d.pipeline_stage || d.stage) === "closed_lost")
      .reduce((acc, d) => acc + (Number(d.deal_value || d.value) || 0), 0);

    return { total, newCount, convertedCount, lostCount, lostDealsCount, rate, totalPipelineValue, wonValue, lostValue };
  }, [leads, deals, leadSummary]);

  const commercialDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = [
      ...proposals.map((item) => ({ ...item, docType: "proposal_quote" })),
      ...quotations.map((item) => ({ ...item, docType: "proposal_quote" })),
      ...agreements.map((item) => ({ ...item, docType: "agreement" })),
    ];
    return rows.filter((item) => {
      if (commercialScope === "proposal_quote" && item.docType !== "proposal_quote") return false;
      if (commercialScope === "agreement" && item.docType !== "agreement") return false;
      if (!matchesDateFilter(item, item.docType === "agreement" ? "start_date" : "created_at")) return false;
      const client = clients.find((c) => c.id === item.client_id);
      return (
        !q ||
        [item.title, item.quotation_number, item.agreement_number, item.status, client?.name, client?.company_name]
          .some((value) => String(value || "").toLowerCase().includes(q))
      );
    });
  }, [agreements, clients, commercialScope, customDateRange.from, customDateRange.to, dateFilter, proposals, query, quotations, selectedDate]);

  function getLatestLinkedDoc(items, deal) {
    if (!deal) return null;
    return items
      .filter((item) => item.deal_id === deal.id || (deal.client_id && item.client_id === deal.client_id))
      .sort((a, b) => new Date(b.sent_at || b.signed_at || b.paid_at || b.created_at || 0).getTime() - new Date(a.sent_at || a.signed_at || a.paid_at || a.created_at || 0).getTime())[0] || null;
  }

  function getDocStatusBadge(label, doc) {
    const status = String(doc?.status || "").toLowerCase();
    if (!doc || !status || status === "draft") return null;
    const displayStatus = status.replace(/_/g, " ");
    const tone = ["paid", "signed", "accepted"].includes(status)
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
      : ["rejected", "declined", "cancelled", "overdue"].includes(status)
      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
      : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300";
    return { label: `${label} ${displayStatus}`, tone };
  }

  const filteredFollowUps = useMemo(() => {
    const now = Date.now();
    return followUps.filter((item) => {
      if (!matchesDateFilter(item, "due_at")) return false;
      const isOverdue = item.status === "pending" && item.due_at && new Date(item.due_at).getTime() < now;
      const matchStatus =
        statusFilter === "all" || !statusFilter
          ? true
          : statusFilter === "pending" || statusFilter === "active"
          ? item.status === "pending" && !isOverdue
          : statusFilter === "overdue"
          ? isOverdue
          : statusFilter === "done" || statusFilter === "completed"
          ? item.status === "done"
          : statusFilter === "missed"
          ? item.status === "missed"
          : true;
      if (!matchStatus) return false;
      return true;
    });
  }, [customDateRange.from, customDateRange.to, dateFilter, followUps, selectedDate, statusFilter]);

  const filteredSalesMeetings = useMemo(() => {
    const todayStr = new Date().toDateString();
    return salesMeetings.filter((item) => {
      if (!matchesDateFilter(item, "scheduled_at")) return false;
      const isToday = Boolean(item.scheduled_at && new Date(item.scheduled_at).toDateString() === todayStr);
      const matchStatus =
        statusFilter === "all" || !statusFilter
          ? true
          : statusFilter === "scheduled" || statusFilter === "pending" || statusFilter === "active"
          ? item.status === "scheduled"
          : statusFilter === "today"
          ? isToday
          : statusFilter === "completed" || statusFilter === "done"
          ? item.status === "completed"
          : statusFilter === "no_show" || statusFilter === "cancelled" || statusFilter === "missed"
          ? ["no_show", "cancelled"].includes(item.status)
          : true;
      if (!matchStatus) return false;
      return true;
    });
  }, [customDateRange.from, customDateRange.to, dateFilter, salesMeetings, selectedDate, statusFilter]);

  const allPipelineDeals = useMemo(() => {
    const existingDealLeadIds = new Set(deals.map((d) => d.lead_id).filter(Boolean));
    const list = [...deals];
    leads.forEach((l) => {
      const isLeadWon = l.status === "Converted" || l.status === "Closed Won";
      if (isLeadWon && !existingDealLeadIds.has(l.id)) {
        list.push({
          id: `lead-converted-${l.id}`,
          title: l.name ? `${l.name} - ${l.service || "Tech Development"}` : "Converted Lead",
          lead_id: l.id,
          pipeline_stage: "closed_won",
          stage: "closed_won",
          deal_value: Number(l.deal_value || l.budget || 0) || 50000,
          currency: "INR",
          service: l.service || "Tech Development",
          created_at: l.created_at,
          updated_at: l.updated_at || l.created_at,
          notes: l.notes || `Converted from lead: ${l.name}`,
        });
      }
    });
    return list;
  }, [deals, leads]);

  const visiblePipelineDeals = useMemo(() => {
    return allPipelineDeals.filter((deal) => {
      const stage = deal.pipeline_stage || deal.stage || "contacted";
      if (dateFilter !== "all" && !matchesDateFilter(deal, "created_at") && !matchesDateFilter(deal, "updated_at")) return false;
      if (statusFilter === "lost") return stage === "closed_lost";
      if (statusFilter === "won" || statusFilter === "converted") return stage === "closed_won";
      if (statusFilter === "active") return !CLOSED_PIPELINE_STAGES.includes(stage);
      if (stage === "closed_lost") return false;
      return true;
    });
  }, [allPipelineDeals, customDateRange.from, customDateRange.to, dateFilter, selectedDate, statusFilter]);
  const pipelineTotal = visiblePipelineDeals.length;
  const pipelinePageCount = Math.max(1, Math.ceil(pipelineTotal / pipelinePageSize));
  const safePipelinePage = Math.min(Math.max(1, pipelinePage), pipelinePageCount);
  const paginatedPipelineDeals = useMemo(() => {
    const start = (safePipelinePage - 1) * pipelinePageSize;
    return visiblePipelineDeals.slice(start, start + pipelinePageSize);
  }, [visiblePipelineDeals, pipelinePageSize, safePipelinePage]);
  const pipelinePageStart = pipelineTotal === 0 ? 0 : (safePipelinePage - 1) * pipelinePageSize + 1;
  const pipelinePageEnd = Math.min(pipelineTotal, safePipelinePage * pipelinePageSize);
  const followUpTotal = filteredFollowUps.length;
  const followUpPageCount = Math.max(1, Math.ceil(followUpTotal / followUpPageSize));
  const safeFollowUpPage = Math.min(Math.max(1, followUpPage), followUpPageCount);
  const paginatedFollowUps = useMemo(() => {
    const start = (safeFollowUpPage - 1) * followUpPageSize;
    return filteredFollowUps.slice(start, start + followUpPageSize);
  }, [filteredFollowUps, followUpPageSize, safeFollowUpPage]);
  const followUpPageStart = followUpTotal === 0 ? 0 : (safeFollowUpPage - 1) * followUpPageSize + 1;
  const followUpPageEnd = Math.min(followUpTotal, safeFollowUpPage * followUpPageSize);
  const meetingTotal = meetingPagination?.count ?? filteredSalesMeetings.length;
  const meetingBasePageCount = Math.max(1, Math.ceil(Math.max(meetingTotal, filteredSalesMeetings.length) / meetingPageSize));
  const safeMeetingPage = onFetchMeetingsPage ? Math.max(1, meetingPage) : Math.min(meetingPage, meetingBasePageCount);
  const meetingPageCount = Math.max(safeMeetingPage, meetingBasePageCount, onFetchMeetingsPage && filteredSalesMeetings.length >= meetingPageSize ? safeMeetingPage + 1 : 1);
  const paginatedSalesMeetings = useMemo(() => {
    if (onFetchMeetingsPage) return filteredSalesMeetings;
    const start = (safeMeetingPage - 1) * meetingPageSize;
    return filteredSalesMeetings.slice(start, start + meetingPageSize);
  }, [filteredSalesMeetings, meetingPageSize, onFetchMeetingsPage, safeMeetingPage]);
  const meetingPageStart = meetingTotal === 0 ? 0 : (safeMeetingPage - 1) * meetingPageSize + 1;
  const meetingPageEnd = Math.min(meetingTotal, safeMeetingPage * meetingPageSize);
  const isLeadsLoading = Boolean(leadPagination?.loading || (isLoading && leads.length === 0));
  const isPipelineLoading = Boolean(dealPagination?.loading || (isLoading && deals.length === 0));
  const isFollowUpsLoading = Boolean(followUpPagination?.loading || (isLoading && followUps.length === 0));
  const isMeetingsLoading = Boolean(meetingPagination?.loading || (isLoading && salesMeetings.length === 0));
  const isReportsLoading = Boolean(isLoading && leads.length === 0 && deals.length === 0 && followUps.length === 0);
  const isCommercialsLoading = Boolean(isLoading && proposals.length === 0 && quotations.length === 0 && agreements.length === 0);

  const dateFilteredLeadsForStats = useMemo(() => {
    return leads.filter((lead) => matchesDateFilter(lead, "created_at"));
  }, [customDateRange.from, customDateRange.to, dateFilter, leads, selectedDate]);

  const dateFilteredPipelineDealsForStats = useMemo(() => {
    return allPipelineDeals.filter((deal) => (
      dateFilter === "all" ||
      matchesDateFilter(deal, "created_at") ||
      matchesDateFilter(deal, "updated_at")
    ));
  }, [allPipelineDeals, customDateRange.from, customDateRange.to, dateFilter, selectedDate]);

  const dateFilteredFollowUpsForStats = useMemo(() => {
    return followUps.filter((item) => matchesDateFilter(item, "due_at"));
  }, [customDateRange.from, customDateRange.to, dateFilter, followUps, selectedDate]);

  const dateFilteredMeetingsForStats = useMemo(() => {
    return salesMeetings.filter((item) => matchesDateFilter(item, "scheduled_at"));
  }, [customDateRange.from, customDateRange.to, dateFilter, salesMeetings, selectedDate]);

  const leadSummaryMetrics = useMemo(() => {
    const totalLeads = dateFilter === "all"
      ? (leadSummary?.total ?? (leadPagination?.count || dateFilteredLeadsForStats.length))
      : (leadPagination?.count ?? leadSummary?.total ?? dateFilteredLeadsForStats.length);

    const wonDealLeadIds = new Set(
      deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_won").map((d) => d.lead_id).filter(Boolean)
    );
    const activePipelineLeadIds = new Set(
      deals.filter((d) => !CLOSED_PIPELINE_STAGES.includes(d.pipeline_stage || d.stage)).map((d) => d.lead_id).filter(Boolean)
    );
    const lostDealLeadIds = new Set(
      deals.filter((d) => (d.pipeline_stage || d.stage) === "closed_lost").map((d) => d.lead_id).filter(Boolean)
    );

    // 1. Converted / Won Leads
    const convertedFromLeads = dateFilteredLeadsForStats.filter((l) => {
      if (wonDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || lostDealLeadIds.has(l.id)) return false;
      return l.status === "Converted" || l.status === "Closed Won";
    }).length;
    const convertedCount = convertedFromLeads;

    // 2. Lost Leads
    const lostFromLeads = dateFilteredLeadsForStats.filter((l) => {
      if (lostDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || wonDealLeadIds.has(l.id)) return false;
      return l.status === "Lost";
    }).length;
    const lostCount = lostFromLeads;

    // 3. In Pipeline (Deal Stage)
    const pipelineCount = dateFilteredLeadsForStats.filter((l) => {
      if (activePipelineLeadIds.has(l.id)) return true;
      if (wonDealLeadIds.has(l.id) || lostDealLeadIds.has(l.id)) return false;
      return ["Contacted", "Qualified", "Proposal Sent", "In Pipeline", "Negotiation", "In Progress"].includes(l.status);
    }).length;

    // 4. Active Inquiries (Raw incoming leads not in pipeline and not decided)
    const activeCount = Math.max(0, totalLeads - pipelineCount - convertedCount - lostCount);

    const convRateNumber = totalLeads > 0 ? (convertedCount / totalLeads) * 100 : 0;
    const convRateDisplay = convRateNumber % 1 === 0 ? `${convRateNumber}%` : `${convRateNumber.toFixed(1)}%`;

    const decidedTotal = convertedCount + lostCount;
    const winRateNumber = decidedTotal > 0 ? (convertedCount / decidedTotal) * 100 : 0;
    const winRateDisplay = winRateNumber % 1 === 0 ? `${winRateNumber}%` : `${winRateNumber.toFixed(1)}%`;

    return {
      totalLeads,
      activeCount,
      pipelineCount,
      convertedCount,
      lostCount,
      decidedTotal,
      convRateNumber,
      convRateDisplay,
      winRateNumber,
      winRateDisplay,
    };
  }, [dateFilter, dateFilteredLeadsForStats, deals, leadPagination?.count, leadSummary]);

  const pageStatusCards = useMemo(() => {
    if (viewMode === "reports") return [];
    if (viewMode === "leads") {
      const {
        totalLeads,
        activeCount,
        pipelineCount,
        convertedCount,
        lostCount,
        decidedTotal,
        convRateDisplay,
        winRateDisplay,
      } = leadSummaryMetrics;

      return [
        {
          id: "total_leads",
          label: "Total Leads",
          value: totalLeads,
          sub: "All captured inbound leads",
          icon: Users,
          tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
          filterKey: "all",
          helpText: "All captured inbound inquiries across all channels.",
        },
        {
          id: "active_inquiries",
          label: "Active Inquiries",
          value: activeCount,
          sub: "New inquiries to qualify",
          icon: HelpCircle,
          tone: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30",
          filterKey: "active",
          helpText: "Inbound leads waiting to be qualified into sales pipeline.",
        },
        {
          id: "pipeline",
          label: "In Pipeline",
          value: pipelineCount,
          sub: "Active in deal stages",
          icon: TrendingUp,
          tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
          filterKey: "pipeline",
          helpText: "Leads currently in contacted, meeting, proposal, or negotiation stages.",
        },
        {
          id: "converted",
          label: "Converted (Won)",
          value: convertedCount,
          sub: "Turned into paying clients",
          icon: CheckCircle2,
          tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
          filterKey: "converted",
          helpText: "Leads successfully converted to closed won deals / client accounts.",
        },
        {
          id: "lost",
          label: "Lost Leads",
          value: lostCount,
          sub: "Dropped / marked lost",
          icon: XCircle,
          tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
          filterKey: "lost",
          helpText: "Leads that dropped off or were closed lost with documented reasons.",
        },
        {
          id: "conversion_rate",
          label: "Conversion Rate",
          value: convRateDisplay,
          sub: `${convertedCount} Won ÷ ${totalLeads} Total`,
          icon: Target,
          tone: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
          filterKey: "converted",
          badge: `Win Rate: ${winRateDisplay}`,
          isRateCard: true,
          ratioBasis: `Formula: (Converted Leads ÷ Total Leads) × 100`,
          ratioFormula: `(${convertedCount} ÷ ${totalLeads}) × 100 = ${convRateDisplay}`,
          winRateFormula: decidedTotal > 0 ? `Win Rate on Closed: (${convertedCount} Won ÷ ${decidedTotal} Decided) = ${winRateDisplay}` : null,
          helpText: `Conversion Ratio is calculated as (Converted Leads ÷ Total Leads) × 100. Out of ${totalLeads} total leads, ${convertedCount} became clients (${convRateDisplay}). Win rate on decided deals (${convertedCount} won, ${lostCount} lost) is ${winRateDisplay}.`,
        },
      ];
    }
    if (viewMode === "pipeline") {
      const activeDeals = dateFilteredPipelineDealsForStats.filter(
        (deal) => !CLOSED_PIPELINE_STAGES.includes(deal.pipeline_stage || deal.stage)
      );
      const wonDeals = dateFilteredPipelineDealsForStats.filter(
        (deal) => (deal.pipeline_stage || deal.stage) === "closed_won"
      );
      const lostDeals = dateFilteredPipelineDealsForStats.filter(
        (deal) => (deal.pipeline_stage || deal.stage) === "closed_lost"
      );

      const openCount = activeDeals.length;
      const wonCount = wonDeals.length;
      const lostCount = lostDeals.length;
      const totalDealsCount = dateFilteredPipelineDealsForStats.length;
      const decidedCount = wonCount + lostCount;

      const activeValue = activeDeals.reduce((sum, d) => sum + (Number(d.deal_value || d.value) || 0), 0);
      const wonValue = wonDeals.reduce((sum, d) => sum + (Number(d.deal_value || d.value) || 0), 0);
      const lostValue = lostDeals.reduce((sum, d) => sum + (Number(d.deal_value || d.value) || 0), 0);
      const totalValue = dateFilteredPipelineDealsForStats.reduce((sum, d) => sum + (Number(d.deal_value || d.value) || 0), 0);

      const winRateNumber = decidedCount > 0 ? (wonCount / decidedCount) * 100 : 0;
      const winRateDisplay = winRateNumber % 1 === 0 ? `${winRateNumber}%` : `${winRateNumber.toFixed(1)}%`;

      return [
        {
          id: "pipeline_value",
          label: "Total Pipeline Value",
          value: `Rs. ${totalValue.toLocaleString("en-IN")}`,
          sub: `${totalDealsCount} total deals managed`,
          badge: `${openCount} in progress`,
          icon: DollarSign,
          tone: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30",
          filterKey: "all",
          helpText: "Total monetary value across all deals in the sales pipeline.",
        },
        {
          id: "active_deals",
          label: "Active Deals",
          value: openCount,
          sub: `Rs. ${activeValue.toLocaleString("en-IN")} in active stages`,
          badge: "In Progress",
          icon: TrendingUp,
          tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
          filterKey: "active",
          helpText: "Open deals currently in Contacted, Meeting, Quotation, or Negotiation stages.",
        },
        {
          id: "closed_won",
          label: "Closed Won",
          value: wonCount,
          sub: `Rs. ${wonValue.toLocaleString("en-IN")} revenue booked`,
          badge: "Won Deals",
          icon: CheckCircle2,
          tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
          filterKey: "won",
          helpText: "Deals successfully won and converted into paying clients.",
        },
        {
          id: "closed_lost",
          label: "Closed Lost",
          value: lostCount,
          sub: `Rs. ${lostValue.toLocaleString("en-IN")} dropped value`,
          badge: "Drop-offs",
          icon: XCircle,
          tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
          filterKey: "lost",
          helpText: "Deals marked lost with recorded drop-off reasons.",
        },
        {
          id: "deal_win_rate",
          label: "Deal Win Rate",
          value: winRateDisplay,
          sub: decidedCount > 0 ? `(${wonCount} Won ÷ ${decidedCount} Decided)` : "No closed deals yet",
          badge: decidedCount > 0 ? `${wonCount}W / ${lostCount}L` : "0 Decided",
          icon: Target,
          tone: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
          filterKey: "won",
          helpText: "Win rate calculated as (Closed Won ÷ (Closed Won + Closed Lost)) × 100.",
        },
      ];
    }
    if (viewMode === "commercials") {
      const quotationCount = proposals.length + quotations.length;
      const agreementCount = agreements.length;
      const sentCount = [...proposals, ...quotations, ...agreements].filter((item) => ["sent", "accepted", "signed"].includes(item.status)).length;
      const approvedCount = [...proposals, ...quotations, ...agreements].filter((item) => ["accepted", "signed"].includes(item.status)).length;
      return [
        { label: "Quotations", value: quotationCount, sub: "Proposal/quotation docs", icon: FileText, tone: "text-orange-600 bg-orange-50 dark:bg-orange-950/30" },
        { label: "Agreements", value: agreementCount, sub: "Client agreement docs", icon: CheckCircle2, tone: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30" },
        { label: "Sent", value: sentCount, sub: "Shared with client", icon: ExternalLink, tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
        { label: "Approved", value: approvedCount, sub: "Accepted or signed", icon: ShieldAlert, tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
      ];
    }
    if (viewMode === "followups") {
      const now = Date.now();
      const allFollowUps = dateFilteredFollowUpsForStats;
      const totalCount = allFollowUps.length;
      const allPending = allFollowUps.filter((item) => item.status === "pending");
      const overdueCount = allPending.filter((item) => item.due_at && new Date(item.due_at).getTime() < now).length;
      const pendingCount = allPending.length - overdueCount;
      const doneCount = allFollowUps.filter((item) => item.status === "done").length;
      const missedCount = allFollowUps.filter((item) => item.status === "missed").length;

      return [
        {
          id: "total_followups",
          label: "Total Follow-ups",
          value: totalCount,
          sub: "All scheduled follow-ups",
          icon: Calendar,
          tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
          filterKey: "all",
          helpText: "All follow-up activities recorded for leads and clients.",
        },
        {
          id: "pending_followups",
          label: "Pending",
          value: pendingCount,
          sub: "Upcoming actions required",
          badge: "Open",
          icon: Phone,
          tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
          filterKey: "pending",
          helpText: "Open follow-ups scheduled for today or future dates.",
        },
        {
          id: "overdue_followups",
          label: "Overdue",
          value: overdueCount,
          sub: "Past due action required",
          badge: overdueCount > 0 ? "Urgent" : null,
          icon: AlertCircle,
          tone: "text-red-600 bg-red-50 dark:bg-red-950/30",
          filterKey: "overdue",
          helpText: "Pending follow-ups whose due date has passed.",
        },
        {
          id: "completed_followups",
          label: "Completed",
          value: doneCount,
          sub: "Marked done successfully",
          icon: CheckCircle2,
          tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
          filterKey: "done",
          helpText: "Follow-ups that were successfully completed.",
        },
        {
          id: "missed_followups",
          label: "Missed",
          value: missedCount,
          sub: "Needs reschedule",
          icon: XCircle,
          tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
          filterKey: "missed",
          helpText: "Follow-ups marked as missed or requiring rescheduling.",
        },
      ];
    }
    if (viewMode === "sales_meetings") {
      const allMeetings = dateFilteredMeetingsForStats;
      const totalCount = allMeetings.length;
      const scheduledCount = allMeetings.filter((item) => item.status === "scheduled").length;
      const completedCount = allMeetings.filter((item) => item.status === "completed").length;
      const noShowCount = allMeetings.filter((item) => ["no_show", "cancelled"].includes(item.status)).length;
      const decidedCount = completedCount + noShowCount;
      const showUpRateNum = decidedCount > 0 ? (completedCount / decidedCount) * 100 : 0;
      const showUpRateDisplay = showUpRateNum % 1 === 0 ? `${showUpRateNum}%` : `${showUpRateNum.toFixed(1)}%`;

      return [
        {
          id: "total_meetings",
          label: "Total Meetings",
          value: totalCount,
          sub: "All pipeline meetings",
          icon: Calendar,
          tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
          filterKey: "all",
          helpText: "All client discovery, demo, quotation, and negotiation meetings.",
        },
        {
          id: "scheduled_meetings",
          label: "Scheduled",
          value: scheduledCount,
          sub: "Upcoming pipeline calls",
          badge: "Upcoming",
          icon: Video,
          tone: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30",
          filterKey: "scheduled",
          helpText: "Scheduled meetings waiting to be conducted.",
        },
        {
          id: "completed_meetings",
          label: "Completed",
          value: completedCount,
          sub: "Successfully conducted",
          badge: "Conducted",
          icon: CheckCircle2,
          tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
          filterKey: "completed",
          helpText: "Successfully held discovery or closing meetings.",
        },
        {
          id: "no_show_meetings",
          label: "No Show / Missed",
          value: noShowCount,
          sub: "Client missed or cancelled",
          badge: noShowCount > 0 ? "Reschedule" : null,
          icon: XCircle,
          tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
          filterKey: "no_show",
          helpText: "Meetings where client did not attend or cancelled; follow up to reschedule.",
        },
        {
          id: "showup_rate",
          label: "Show-up Rate",
          value: showUpRateDisplay,
          sub: decidedCount > 0 ? `${completedCount} Done ÷ ${decidedCount} Decided` : "No closed sessions",
          badge: decidedCount > 0 ? `${completedCount}W / ${noShowCount}L` : null,
          icon: Target,
          tone: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
          filterKey: "completed",
          isRateCard: true,
          ratioBasis: "Formula: (Completed ÷ (Completed + No Show)) × 100",
          ratioFormula: decidedCount > 0 ? `(${completedCount} ÷ ${decidedCount}) × 100 = ${showUpRateDisplay}` : null,
          helpText: `Meeting Show-up Rate is (${completedCount} completed out of ${decidedCount} decided meetings).`,
        },
      ].filter((card) => !["today_meetings", "showup_rate"].includes(card.id));
    }
    return [];
  }, [
    agreements,
    dateFilteredFollowUpsForStats,
    dateFilteredMeetingsForStats,
    dateFilteredPipelineDealsForStats,
    deals,
    filteredFollowUps,
    filteredLeads,
    filteredSalesMeetings,
    leadTotalForPagination,
    leads,
    proposals,
    quotations,
    viewMode,
    visiblePipelineDeals,
    leadSummaryMetrics,
  ]);

  const archivedDeals = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals.filter((deal) => {
      const isArchived = (deal.pipeline_stage || deal.stage) === "closed_lost";
      const matchQuery = !q || [deal.title, deal.service, deal.loss_reason, deal.notes]
        .some((value) => String(value || "").toLowerCase().includes(q));
      return isArchived && matchQuery && matchesDateFilter(deal, "updated_at");
    });
  }, [customDateRange.from, customDateRange.to, dateFilter, deals, query, selectedDate]);

  const aiInsights = useMemo(() => {
    const openLeads = leads.filter((lead) => !["Converted", "Lost"].includes(lead.status) && !deals.some((deal) => deal.lead_id === lead.id));
    const rankedLeads = openLeads
      .map((lead) => ({
        lead,
        action: getLeadNextAction(lead, followUps, salesMeetings),
      }))
      .slice(0, 3);
    const overdueFollowUps = followUps.filter((item) => item.status === "pending" && new Date(item.due_at).getTime() < Date.now()).length;
    const staleDeals = deals.filter((deal) => !["closed_won", "closed_lost"].includes(deal.pipeline_stage) && new Date(deal.updated_at || deal.created_at || Date.now()).getTime() < Date.now() - 7 * 86400000);
    const warmStaleDeals = deals.filter((deal) => !["closed_won", "closed_lost"].includes(deal.pipeline_stage) && new Date(deal.updated_at || deal.created_at || Date.now()).getTime() < Date.now() - 3 * 86400000);
    return { rankedLeads, overdueFollowUps, staleDeals, warmStaleDeals };
  }, [deals, followUps, leads, salesMeetings]);

  const salesReport = useMemo(() => {
    const completedFollowUps = followUps.filter((item) => item.status === "done" && matchesDateFilter(item, "completed_at")).length;
    const missedFollowUps = followUps.filter((item) => item.status === "missed" && matchesDateFilter(item, "updated_at")).length;
    const overdueFollowUps = followUps.filter((item) => item.status === "pending" && new Date(item.due_at).getTime() < Date.now()).length;
    const wonDeals = deals.filter((deal) => (deal.pipeline_stage || deal.stage) === "closed_won" && matchesDateFilter(deal, "updated_at")).length;
    const lostDeals = deals.filter((deal) => (deal.pipeline_stage || deal.stage) === "closed_lost" && matchesDateFilter(deal, "updated_at")).length;
    const activeLeads = leads.filter((lead) => matchesDateFilter(lead, "created_at")).length;
    const totalBaseLeads = dateFilter === "all" ? Math.max(activeLeads, leadSummary?.total || 0) : activeLeads;
    const totalWon = wonDeals;
    const conversionRate = totalBaseLeads > 0 ? Math.round((totalWon / totalBaseLeads) * 100) : 0;
    const sourceMap = new Map();
    leads.forEach((lead) => {
      const source = lead.source || "Unknown";
      const row = sourceMap.get(source) || { source, leads: 0, won: 0, lost: 0, value: 0 };
      row.leads += 1;
      if (lead.status === "Lost") row.lost += 1;
      sourceMap.set(source, row);
    });
    deals.forEach((deal) => {
      const lead = leads.find((item) => item.id === deal.lead_id);
      const source = lead?.source || "Direct / Client";
      const row = sourceMap.get(source) || { source, leads: 0, won: 0, lost: 0, value: 0 };
      if ((deal.pipeline_stage || deal.stage) === "closed_won") row.won += 1;
      if ((deal.pipeline_stage || deal.stage) === "closed_lost") row.lost += 1;
      row.value += Number(deal.deal_value || deal.value) || 0;
      sourceMap.set(source, row);
    });
    return {
      completedFollowUps,
      missedFollowUps,
      overdueFollowUps,
      conversionRate,
      sourceRows: Array.from(sourceMap.values()).sort((a, b) => b.value - a.value).slice(0, 5),
    };
  }, [customDateRange.from, customDateRange.to, dateFilter, deals, followUps, leadSummary, leads, selectedDate]);

  const selectedLeadActivity = useMemo(() => {
    if (!selectedLead?.id) return { followUps: [], meetings: [], deals: [], summary: "" };
    const linkedDeals = deals.filter((deal) => deal.lead_id === selectedLead.id);
    const dealIds = new Set(linkedDeals.map((deal) => deal.id));
    const linkedFollowUps = followUps
      .filter((item) => item.lead_id === selectedLead.id || dealIds.has(item.deal_id))
      .sort((a, b) => new Date(b.completed_at || b.due_at || b.created_at || 0) - new Date(a.completed_at || a.due_at || a.created_at || 0));
    const linkedMeetings = salesMeetings
      .filter((item) => item.lead_id === selectedLead.id || dealIds.has(item.deal_id))
      .sort((a, b) => new Date(b.scheduled_at || b.created_at || 0) - new Date(a.scheduled_at || a.created_at || 0));
    const lastFollowUp = linkedFollowUps[0];
    const lastMeeting = linkedMeetings[0];
    const openFollowUps = linkedFollowUps.filter((item) => item.status === "pending").length;
    const summary = [
      `${selectedLead.name || "Client"} came from ${selectedLead.source || "unknown source"} for ${selectedLead.service || "a TexWeb service"}.`,
      lastMeeting ? `Latest meeting: ${lastMeeting.title} (${lastMeeting.status}).` : "No meeting completed yet.",
      lastFollowUp ? `Latest follow-up: ${lastFollowUp.title} (${lastFollowUp.status}).` : "No follow-up history yet.",
      openFollowUps ? `${openFollowUps} pending follow-up(s) need action.` : "No pending follow-up currently.",
    ].filter(Boolean).join(" ");
    return { followUps: linkedFollowUps, meetings: linkedMeetings, deals: linkedDeals, summary };
  }, [deals, followUps, salesMeetings, selectedLead]);

  const selectedLeadDeal = useMemo(() => {
    if (!selectedLead?.id) return null;
    return deals.find((deal) => deal.lead_id === selectedLead.id) || null;
  }, [deals, selectedLead]);

  const selectedLeadIsLost = useMemo(() => {
    if (!selectedLead?.id) return false;
    const hasLostDeal = Boolean(selectedLeadDeal && (selectedLeadDeal.pipeline_stage || selectedLeadDeal.stage) === "closed_lost");
    return hasLostDeal || (!selectedLeadDeal && selectedLead.status === "Lost");
  }, [selectedLead, selectedLeadDeal]);

  const selectedLeadLossReason = useMemo(() => {
    if (!selectedLeadIsLost || !selectedLead) return null;
    return getLeadLossReason(selectedLead, selectedLeadDeal);
  }, [selectedLead, selectedLeadDeal, selectedLeadIsLost]);

  function handleAddLeadSubmit(e) {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return;
    const addFn = onCreateLead || onAddLead;
    addFn?.(newLeadForm);
    playNotificationSound("lead");
    setShowAddLeadModal(false);
    setNewLeadForm({
      name: "",
      phone: "",
      email: "",
      service: "Web Development",
      source: "Manual",
      status: "New",
      notes: "",
    });
  }

  function handleOpenEdit(lead) {
    setEditingLead(lead);
    setEditLeadForm({
      name: lead.name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      service: lead.service || "Web Development",
      source: lead.source || "Website",
      status: lead.status || "New",
      notes: lead.notes || "",
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingLead) return;
    onUpdateLead?.(editingLead.id, editLeadForm);
    setEditingLead(null);
  }

  function handleOpenEditDeal(deal) {
    if (!deal) return;
    setEditingDeal(deal);
    setEditDealForm({
      title: deal.title || "",
      deal_value: deal.deal_value || deal.value || 0,
      pipeline_stage: deal.pipeline_stage || deal.stage || "contacted",
      service: deal.service || "Web Development",
      expected_close_date: deal.expected_close_date ? deal.expected_close_date.split("T")[0] : "",
      loss_reason: deal.loss_reason || "",
      notes: deal.notes || "",
    });
  }

  async function handleSaveEditDeal(e) {
    e.preventDefault();
    if (!editingDeal) return;
    const updates = {
      title: editDealForm.title.trim() || editingDeal.title,
      deal_value: Number(editDealForm.deal_value) || 0,
      pipeline_stage: editDealForm.pipeline_stage,
      service: editDealForm.service || "Web Development",
      expected_close_date: editDealForm.expected_close_date || null,
      loss_reason: editDealForm.pipeline_stage === "closed_lost" ? editDealForm.loss_reason : null,
      notes: editDealForm.notes || "",
    };

    if (onUpdateDeal) {
      await onUpdateDeal(editingDeal.id, updates);
    } else if (onUpdateDealStage) {
      await onUpdateDealStage(editingDeal.id, updates.pipeline_stage, updates);
    }

    if (selectedDeal?.id === editingDeal.id) {
      setSelectedDeal((prev) => (prev ? { ...prev, ...updates } : null));
    }

    setEditingDeal(null);
  }

  function handleDelete(leadId) {
    onDeleteLead?.(leadId);
    setDeleteConfirmId(null);
  }

  function handleWhatsAppClick(lead) {
    if (!lead.phone) return;
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hello ${lead.name}, greetings from TexWeb Solution! We received your inquiry regarding ${lead.service || "our software development services"}. How may we assist your project?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function getDealLead(deal) {
    return leads.find((lead) => lead.id === deal?.lead_id) || null;
  }

  function getMeetingStartIso(rawValue = "") {
    if (rawValue) return new Date(rawValue).toISOString();
    const start = new Date(Date.now() + 2 * 60 * 60 * 1000);
    start.setMinutes(start.getMinutes() < 30 ? 30 : 0, 0, 0);
    if (start.getMinutes() === 0) start.setHours(start.getHours() + 1);
    return start.toISOString();
  }

  async function scheduleAutoMeetingForDeal(deal) {
    if (!deal?.id) return;
    const alreadyScheduled = salesMeetings.some((item) => item.deal_id === deal.id && !["cancelled", "completed", "no_show"].includes(item.status));
    if (alreadyScheduled) return;
    const lead = getDealLead(deal);
    await onCreateSalesMeeting?.({
      title: `Client meeting: ${deal.title || lead?.name || "Sales deal"}`,
      lead_id: deal.lead_id || null,
      client_id: deal.client_id || null,
      deal_id: deal.id,
      meeting_type: "discovery",
      scheduled_at: deal.meeting_scheduled_at ? new Date(deal.meeting_scheduled_at).toISOString() : getMeetingStartIso(),
      duration_minutes: Number(deal.duration_minutes) || 60,
      reminder_before_minutes: Number(deal.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
      meeting_link: deal.meeting_link || defaultMeetLink || "https://meet.google.com/new",
      agenda: "Auto-created when lead was moved into sales pipeline. Confirm requirements, budget, timeline, and decision maker.",
      status: "scheduled",
    });
  }

  function openMeetingWhatsApp(deal) {
    const lead = getDealLead(deal);
    const contactName = lead?.name || deal.title || "there";
    const message = `Hi ${contactName}, thanks for your interest in ${deal.service || lead?.service || "TexWeb Solution services"}. I have scheduled a quick discovery meeting to understand your requirement, budget, and timeline. Please confirm your available time.`;
    if (onOpenDirectWhatsapp) {
      onOpenDirectWhatsapp(lead?.phone || deal.phone, contactName, message);
      return;
    }
    if (!lead?.phone) return;
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  function openCommercialModal(type = "proposal", deal = null) {
    if (type === "invoice") {
      return openInvoiceModal(deal);
    }
    const linkedDeal = deal || deals.find((item) => item.id === commercialForm.deal_id) || deals[0];
    setCommercialType(type);
    setCommercialForm((prev) => ({
      ...prev,
      deal_id: linkedDeal?.id || "",
      title: linkedDeal ? `${linkedDeal.title} ${type === "agreement" ? "Agreement" : "Quotation"}` : prev.title,
      amount: linkedDeal?.deal_value ? String(linkedDeal.deal_value) : prev.amount,
      proposal_id: proposals[0]?.id || "",
      quotation_id: quotations[0]?.id || "",
      quotation_number: `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      agreement_number: `AGR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    }));
    setAiDocDraft(null);
    setAiDocInput("");
    setAiDocAttachments([]);
    setAiDocTracking({ status: "draft", sent_at: "", channel: "" });
    setShowCommercialModal(true);
  }

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
  }, [aiDocumentType, commercialForm.deal_id, showCommercialModal]);

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleAiAttachmentChange(files) {
    const selected = Array.from(files || []).slice(0, 4);
    const mapped = await Promise.all(selected.map(async (file) => ({
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      dataUrl: await readFileAsDataUrl(file),
    })));
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
        draft?.scope_of_work ? `Scope: ${draft.scope_of_work}` : null,
      ].filter(Boolean).join("\n\n");
      const savedAssistant = aiDocThread?.id
        ? await createAiMessage({ thread_id: aiDocThread.id, role: "assistant", content: assistantContent })
        : { role: "assistant", content: assistantContent, created_at: new Date().toISOString() };
      setAiDocMessages((prev) => [...prev, savedAssistant]);
      if (draft) {
        await createAiDraft({
          thread_id: aiDocThread?.id || null,
          deal_id: commercialForm.deal_id,
          document_type: aiDocumentType,
          title: draft.title,
          content: draft,
          status: "draft",
        });
      }
      setAiDocInput("");
    } finally {
      setAiDocLoading(false);
    }
  }

  function handlePreviewCommercialPdf() {
    const selectedDeal = deals.find((deal) => deal.id === commercialForm.deal_id);
    const selectedLead = leads.find((lead) => lead.id === selectedDeal?.lead_id);
    const selectedClient = clients.find((client) => client.id === selectedDeal?.client_id);
    const isAgreement = commercialType === "agreement";
    const amount = Number(commercialForm.amount || selectedDeal?.deal_value || 0);
    const docNumber = isAgreement ? commercialForm.agreement_number : commercialForm.quotation_number;
    const contactName = selectedClient?.name || selectedLead?.name || "Client Name";
    const contactEmail = selectedClient?.email || selectedLead?.email || "client@email.com";
    const contactPhone = selectedClient?.phone || selectedLead?.phone || "Client phone";
    const escapeHtml = (value = "") =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    const paragraph = (value, fallback) => escapeHtml(value || fallback).replace(/\n/g, "<br />");
    const preview = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(commercialForm.title || (isAgreement ? "Agreement" : "Quotation"))}</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; background: #e5e7eb; font-family: Arial, sans-serif; color: #0f172a; }
            .page { width: 794px; min-height: 1123px; margin: 24px auto; background: #fff; position: relative; overflow: hidden; box-shadow: 0 18px 60px rgba(15,23,42,.18); }
            .header { height: 150px; border-bottom: 7px solid #071521; position: relative; overflow: hidden; }
            .dots { position: absolute; left: 0; top: 0; width: 115px; height: 115px; opacity: .2; background-image: radial-gradient(#64748b 3px, transparent 4px); background-size: 16px 16px; }
            .leftDark { position: absolute; left: -45px; bottom: 0; width: 220px; height: 42px; background: #071521; transform: skewX(35deg); }
            .leftRed { position: absolute; left: -35px; bottom: 18px; width: 170px; height: 20px; background: #ef0000; transform: skewX(35deg); }
            .rightDark { position: absolute; right: -60px; top: 0; width: 135px; height: 150px; background: #071521; transform: skewX(-34deg); }
            .rightRed { position: absolute; right: -10px; top: 65px; width: 185px; height: 20px; background: #ef0000; transform: skewX(-34deg); }
            .brand { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; height: 100%; padding: 26px 72px 22px 92px; gap: 28px; }
            .logoWrap { display: flex; align-items: center; gap: 18px; }
            .logo { width: 78px; height: 78px; border-radius: 14px; background: #e60000; color: white; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 900; letter-spacing: -4px; }
            .name1 { font-size: 43px; font-weight: 900; line-height: .86; letter-spacing: -2px; }
            .name2 { font-size: 40px; font-weight: 900; line-height: .9; color: #e60000; letter-spacing: -1px; }
            .tag { margin-top: 5px; font-size: 14px; font-weight: 600; color: #334155; }
            .divider { width: 2px; height: 82px; background: #071521; }
            .contact { display: grid; gap: 8px; min-width: 210px; font-size: 16px; font-weight: 600; color: #1f2937; }
            .contact div { display: flex; align-items: center; gap: 12px; }
            .badge { width: 25px; height: 25px; border-radius: 50%; background: #e60000; color: white; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900; }
            .content { position: relative; min-height: 850px; padding: 48px 58px 145px; }
            .watermark { position: absolute; left: 50%; top: 48%; transform: translate(-50%, -50%); width: 250px; height: 250px; border-radius: 34px; background: rgba(239,0,0,.07); color: white; display: flex; align-items: center; justify-content: center; font-size: 96px; font-weight: 900; letter-spacing: -14px; }
            .curve1, .curve2, .curve3 { position: absolute; border-top: 1px solid #e2e8f0; border-radius: 50%; transform: rotate(-12deg); }
            .curve1 { left: -120px; bottom: 130px; width: 700px; height: 220px; }
            .curve2 { left: -80px; bottom: 90px; width: 690px; height: 160px; border-color: #fecaca; }
            .curve3 { right: -100px; bottom: 120px; width: 540px; height: 180px; }
            .contentInner { position: relative; z-index: 2; }
            .docHead { display: flex; justify-content: space-between; gap: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 18px; margin-bottom: 18px; }
            .docType { color: #e60000; font-size: 13px; text-transform: uppercase; font-weight: 900; letter-spacing: .12em; }
            h1 { margin: 4px 0 0; font-size: 24px; }
            .meta { text-align: right; font-size: 13px; color: #64748b; line-height: 1.6; }
            .meta strong { color: #0f172a; }
            .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
            .card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: rgba(255,255,255,.86); font-size: 13px; line-height: 1.6; }
            .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 900; margin-bottom: 4px; }
            .section { margin-top: 18px; font-size: 13px; line-height: 1.7; }
            .section h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .12em; color: #64748b; margin: 0 0 6px; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 70px; margin-top: 52px; font-size: 12px; font-weight: 700; color: #475569; }
            .signLine { height: 48px; border-bottom: 1px solid #94a3b8; margin-bottom: 8px; }
            .footer { position: absolute; left: 0; right: 0; bottom: 0; height: 78px; background: #071521; color: white; display: flex; align-items: center; gap: 18px; padding: 0 28px; font-size: 11px; overflow: hidden; }
            .footer:before { content: ""; position: absolute; left: -35px; top: 0; width: 145px; height: 36px; background: #e60000; transform: skewX(35deg); }
            .footer:after { content: ""; position: absolute; right: -30px; top: 0; width: 90px; height: 78px; background: #e60000; transform: skewX(-35deg); }
            .company { position: relative; z-index: 2; min-width: 230px; font-weight: 900; font-size: 14px; }
            .cin { color: rgba(255,255,255,.75); font-size: 11px; margin-top: 5px; }
            .service { position: relative; z-index: 2; border-left: 1px solid rgba(239,0,0,.7); padding-left: 12px; font-weight: 700; line-height: 1.25; }
            @media print { body { background: white; } .page { margin: 0; box-shadow: none; } }
          </style>
        </head>
        <body>
          <main class="page">
            <header class="header">
              <div class="dots"></div><div class="leftDark"></div><div class="leftRed"></div><div class="rightDark"></div><div class="rightRed"></div>
              <div class="brand">
                <div class="logoWrap"><div class="logo">TW</div><div><div class="name1">TEXWEB</div><div class="name2">SOLUTION</div><div class="tag">Complete Digital Solutions for Your Business</div></div></div>
                <div class="divider"></div>
                <div class="contact">
                  <div><span class="badge">TEL</span>0755-4601839</div>
                  <div><span class="badge">MAIL</span>info@texwebsolution.in</div>
                  <div><span class="badge">WEB</span>www.texwebsolution.in</div>
                  <div><span class="badge">PIN</span>Kolkata | Bhopal</div>
                </div>
              </div>
            </header>
            <section class="content">
              <div class="watermark">TW</div><div class="curve1"></div><div class="curve2"></div><div class="curve3"></div>
              <div class="contentInner">
                <div class="docHead"><div><div class="docType">${isAgreement ? "Agreement" : "Quotation"}</div><h1>${escapeHtml(commercialForm.title || (isAgreement ? "Project Agreement" : "Project Quotation"))}</h1></div><div class="meta"><strong>${escapeHtml(docNumber || "DOC-2026")}</strong><br />${new Date().toLocaleDateString("en-IN")}</div></div>
                <div class="cards">
                  <div class="card"><div class="label">Prepared For</div><strong>${escapeHtml(contactName)}</strong><br />${escapeHtml(contactEmail)}<br />${escapeHtml(contactPhone)}</div>
                  <div class="card"><div class="label">Project</div><strong>${escapeHtml(selectedDeal?.title || commercialForm.title || "Client Project")}</strong><br />${escapeHtml(selectedDeal?.service || "Technology Services")}${!isAgreement ? `<br /><strong>Rs. ${amount.toLocaleString("en-IN")}</strong>` : ""}</div>
                </div>
                <div class="section"><h2>Scope of Work</h2>${paragraph(commercialForm.scope_of_work, "Scope will appear here.")}</div>
                <div class="section"><h2>${isAgreement ? "Commercial Terms" : "Deliverables"}</h2>${paragraph(isAgreement ? commercialForm.commercial_terms : commercialForm.deliverables, "Details will appear here.")}</div>
                <div class="section"><h2>Notes</h2>${paragraph(commercialForm.notes, "Review required before sending.")}</div>
                <div class="signatures"><div><div class="signLine"></div>TexWeb Authorized Signature</div><div><div class="signLine"></div>Client Confirmation</div></div>
              </div>
            </section>
            <footer class="footer"><div class="company">TexWeb Solution Private Limited<div class="cin">CIN: U85500WB2026PTC287896</div></div><div class="service">Website<br />Development</div><div class="service">Mobile App<br />Development</div><div class="service">E-commerce<br />Solutions</div><div class="service">Digital<br />Marketing</div><div class="service">SMM<br />(Social Media)</div><div class="service">AI &<br />Automation</div></footer>
          </main>
        </body>
      </html>`;
    const blob = new Blob([preview], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function openInvoiceModal(deal = null) {
    const linkedDeal = deal || deals.find((item) => item.id === invoiceForm.deal_id) || deals[0];
    setInvoiceDeal(linkedDeal || null);
    const dealVal = linkedDeal ? Number(linkedDeal.deal_value || linkedDeal.value) || 0 : 0;
    const invNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const advanceAmount = dealVal > 0 ? Math.round(dealVal * 0.4) : (dealVal ? dealVal : "");
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const dealTitle = linkedDeal?.title || linkedDeal?.client_name || "Client";

    setInvoiceForm({
      deal_id: linkedDeal?.id || "",
      client_id: linkedDeal?.client_id || "",
      invoice_number: invNumber,
      title: `${dealTitle} - Advance Invoice (40%)`,
      amount: advanceAmount ? String(advanceAmount) : "",
      milestone_type: "advance",
      due_date: dueDate,
      notes: "Payment due within 7 days of invoice issue date. 18% GST standard applicable.",
      status: "sent",
    });
    setShowInvoiceModal(true);
  }

  function handleInvoiceMilestoneChange(newMilestone) {
    const dealVal = invoiceDeal ? Number(invoiceDeal.deal_value || invoiceDeal.value) || 0 : 0;
    const dealTitle = invoiceDeal?.title || invoiceDeal?.client_name || "Client";
    let newAmount = invoiceForm.amount;
    let newTitle = invoiceForm.title;

    if (dealVal > 0) {
      if (newMilestone === "advance") {
        newAmount = String(Math.round(dealVal * 0.4));
        newTitle = `${dealTitle} - Advance Invoice (40%)`;
      } else if (newMilestone === "milestone") {
        newAmount = String(Math.round(dealVal * 0.3));
        newTitle = `${dealTitle} - Sprint Milestone Invoice (30%)`;
      } else if (newMilestone === "final") {
        newAmount = String(Math.round(dealVal * 0.3));
        newTitle = `${dealTitle} - Final Delivery Invoice (30%)`;
      } else if (newMilestone === "full") {
        newAmount = String(dealVal);
        newTitle = `${dealTitle} - Full Payment Invoice (100%)`;
      } else if (newMilestone === "monthly_retainer") {
        newAmount = String(dealVal);
        newTitle = `${dealTitle} - Monthly Retainer Invoice`;
      }
    }

    setInvoiceForm((prev) => ({
      ...prev,
      milestone_type: newMilestone,
      amount: newAmount,
      title: newTitle,
    }));
  }

  function sendDocWhatsApp(doc, docType = "quotation") {
    const linkedDeal = deals.find((d) => d.id === (doc.deal_id || doc.dealId));
    const lead = leads.find((l) => l.id === (linkedDeal?.lead_id || doc.lead_id || doc.leadId));
    const client = clients.find((c) => c.id === (linkedDeal?.client_id || doc.client_id || doc.clientId));
    const contactName = lead?.name || client?.name || linkedDeal?.title || "there";
    const rawPhone = lead?.phone || client?.phone || linkedDeal?.phone || "";

    if (!rawPhone) {
      alert(`Client phone number not found for ${contactName}. Please check lead or client profile.`);
      return;
    }

    let message = "";
    if (docType === "agreement") {
      const agrNum = doc.agreement_number || "AGR-2026";
      const title = doc.title || linkedDeal?.title || "your project";
      message = `Hi ${contactName}, greetings from TexWeb Solution! Your Project Agreement *#${agrNum}* for *${title}* is ready. Please review the commercial terms and confirm for execution. Thank you!`;
    } else if (docType === "invoice") {
      const invNum = doc.invoice_number || "INV-2026";
      const totalAmt = Number(doc.total_amount || doc.amount || 0).toLocaleString("en-IN");
      const dueDate = doc.due_date || "Within 7 days";
      const title = doc.title || linkedDeal?.title || "Project Development";
      message = `Hi ${contactName}, greetings from TexWeb Solution! Invoice *#${invNum}* for *${title}* has been generated for *₹${totalAmt}* (Due Date: ${dueDate}). Please find the invoice details and proceed with the payment. Thank you!`;
    } else {
      const quotNum = doc.quotation_number || "QT-2026";
      const totalAmt = Number(doc.total || doc.amount || 0).toLocaleString("en-IN");
      const title = doc.title || linkedDeal?.title || "your project";
      message = `Hi ${contactName}, greetings from TexWeb Solution! We have prepared the official Quotation *#${quotNum}* for *${title}* with total value *₹${totalAmt}*. Please review and let us know your confirmation or feedback. Thank you!`;
    }

    if (onOpenDirectWhatsapp) {
      onOpenDirectWhatsapp(rawPhone, contactName, message);
      return;
    }
    const digits = rawPhone.replace(/[^0-9]/g, "");
    const cleanPhone = digits.length === 10 ? `91${digits}` : digits;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  function sendDealDocWhatsApp(deal) {
    const latestInvoice = getLatestLinkedDoc(invoices, deal);
    if (latestInvoice) {
      return sendDocWhatsApp(latestInvoice, "invoice");
    }
    const latestAgreement = getLatestLinkedDoc(agreements, deal);
    if (latestAgreement) {
      return sendDocWhatsApp(latestAgreement, "agreement");
    }
    const latestQuotation = getLatestLinkedDoc([...proposals, ...quotations], deal);
    if (latestQuotation) {
      return sendDocWhatsApp(latestQuotation, "quotation");
    }
    return openMeetingWhatsApp(deal);
  }

  async function handleCreateInvoiceSubmit(e, sendWhatsApp = false) {
    if (e && e.preventDefault) e.preventDefault();
    if (!invoiceForm.deal_id || !invoiceForm.amount) return;
    const baseAmt = parseFloat(invoiceForm.amount) || 0;
    const taxAmt = Math.round(baseAmt * 0.18);
    const payload = {
      ...invoiceForm,
      amount: baseAmt,
      tax_amount: taxAmt,
      total_amount: baseAmt + taxAmt,
    };
    if (onCreateInvoice) {
      await onCreateInvoice(payload);
    } else {
      await createInvoice(payload);
    }
    try {
      playNotificationSound?.("payment");
    } catch (_) {}
    setShowInvoiceModal(false);
    if (sendWhatsApp) {
      sendDocWhatsApp(payload, "invoice");
    }
  }

  async function handleCreateCommercialSubmit(e, sendWhatsApp = false) {
    if (e && e.preventDefault) e.preventDefault();
    if (!commercialForm.deal_id) return;
    const amount = parseFloat(commercialForm.amount) || 0;
    if (commercialType !== "agreement") {
      await onCreateProposal?.({
        deal_id: commercialForm.deal_id || null,
        title: commercialForm.title,
        amount,
        status: commercialForm.status,
        scope_of_work: commercialForm.scope_of_work,
        deliverables: commercialForm.deliverables,
        sent_at: commercialForm.status === "sent" ? new Date().toISOString() : null,
        notes: commercialForm.notes,
      });
    } else {
      await onCreateAgreement?.({
        agreement_number: commercialForm.agreement_number,
        deal_id: commercialForm.deal_id || null,
        proposal_id: commercialForm.proposal_id || null,
        quotation_id: commercialForm.quotation_id || null,
        title: commercialForm.title,
        scope_of_work: commercialForm.scope_of_work,
        deliverables: commercialForm.deliverables,
        commercial_terms: commercialForm.commercial_terms,
        payment_milestones: [
          { label: "Advance", percent: 40 },
          { label: "Milestone", percent: 30 },
          { label: "Final", percent: 30 },
        ],
        start_date: commercialForm.start_date,
        end_date: commercialForm.end_date,
        status: commercialForm.status === "signed" ? "signed" : "sent",
        signed_at: commercialForm.status === "signed" ? new Date().toISOString() : null,
        notes: commercialForm.notes,
      });
    }
    await createAiDraft({
      thread_id: aiDocThread?.id || null,
      deal_id: commercialForm.deal_id || null,
      document_type: aiDocumentType,
      title: commercialForm.title,
      content: {
        title: commercialForm.title,
        scope_of_work: commercialForm.scope_of_work,
        deliverables: commercialForm.deliverables,
        commercial_terms: commercialForm.commercial_terms,
        notes: commercialForm.notes,
      },
      status: sendWhatsApp ? "sent" : commercialForm.status || "draft",
      sent_at: sendWhatsApp || commercialForm.status === "sent" ? new Date().toISOString() : null,
    });
    setAiDocTracking({
      status: sendWhatsApp ? "sent" : commercialForm.status || "draft",
      sent_at: sendWhatsApp || commercialForm.status === "sent" ? new Date().toISOString() : "",
      channel: sendWhatsApp ? "whatsapp" : "",
    });
    setShowCommercialModal(false);
    if (sendWhatsApp) {
      sendDocWhatsApp(commercialForm, commercialType);
    }
  }

  function handleCreateFollowUpSubmit(e) {
    e.preventDefault();
    if (!followUpForm.title || !followUpForm.due_at) return;
    onCreateFollowUp?.({
      ...followUpForm,
      lead_id: followUpForm.lead_id || null,
      deal_id: followUpForm.deal_id || null,
      reminder_before_minutes: Number(followUpForm.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
      due_at: new Date(followUpForm.due_at).toISOString(),
      status: "pending",
    });
    setShowFollowUpModal(false);
  }

  function openPipelineFollowUpModal(deal) {
    const lead = getDealLead(deal);
    setFollowUpForm({
      title: `Follow up: ${deal.title || lead?.name || "Pipeline deal"}`,
      lead_id: deal.lead_id || "",
      client_id: "",
      deal_id: deal.id || "",
      channel: "whatsapp",
      due_at: toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
      priority: "medium",
      notes: `Manual follow-up from ${PIPELINE_STAGES.find((stage) => stage.id === (deal.pipeline_stage || "contacted"))?.label || "pipeline"} stage.`,
    });
    setShowFollowUpModal(true);
  }

  function openLeadFollowUpModal(lead) {
    setFollowUpForm({
      title: `Follow up: ${lead?.name || "Lead"}`,
      lead_id: lead?.id || "",
      client_id: "",
      deal_id: "",
      channel: lead?.phone ? "whatsapp" : "phone",
      due_at: toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
      priority: "medium",
      notes: `Manual follow-up from lead page for ${lead?.service || "inquiry"}.`,
    });
    setShowFollowUpModal(true);
  }

  function openDealFollowUpModal(deal, lead = null) {
    const l = lead || leads.find((item) => item.id === deal?.lead_id);
    setFollowUpForm({
      title: `Follow up: ${deal?.title || l?.name || "Deal"}`,
      lead_id: deal?.lead_id || l?.id || "",
      client_id: deal?.client_id || "",
      deal_id: deal?.id || "",
      channel: l?.phone ? "whatsapp" : "phone",
      due_at: toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
      priority: "medium",
      notes: `Follow-up for pipeline deal: ${deal?.title || "Deal"}.`,
    });
    setShowFollowUpModal(true);
  }

  function openDealMeetingModal(deal, lead = null) {
    const l = lead || leads.find((item) => item.id === deal?.lead_id);
    setSalesMeetingForm({
      lead_id: deal?.lead_id || l?.id || "",
      deal_id: deal?.id || "",
      title: `Meeting: ${deal?.title || l?.name || "Deal"}`,
      scheduled_at: toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      duration_minutes: 30,
      meeting_link: defaultMeetLink || "https://meet.google.com/new",
      reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
      agenda: `Discuss requirements for ${deal?.service || "project"}`,
      notes: "",
    });
    setShowSalesMeetingModal(true);
  }

  function handleCreateSalesMeetingSubmit(e) {
    e.preventDefault();
    if (!salesMeetingForm.title || !salesMeetingForm.scheduled_at) return;
    const finalMeetLink = salesMeetingForm.meeting_link?.trim() || defaultMeetLink || "https://meet.google.com/new";
    onCreateSalesMeeting?.({
      ...salesMeetingForm,
      meeting_link: finalMeetLink,
      lead_id: salesMeetingForm.lead_id || null,
      deal_id: salesMeetingForm.deal_id || null,
      duration_minutes: Number(salesMeetingForm.duration_minutes) || 30,
      reminder_before_minutes: Number(salesMeetingForm.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
      scheduled_at: new Date(salesMeetingForm.scheduled_at).toISOString(),
      status: "scheduled",
    });
    setShowSalesMeetingModal(false);
  }

  function openStageModal(item, type, prefillStatus = null) {
    setStageModalTarget({ item, type });
    setStageModalStatus(prefillStatus || item.status || (type === "meeting" ? "scheduled" : "pending"));
    setStageModalNote("");
  }

  function handleSaveStageModal(e, isQuickDoneWithoutNote = false) {
    if (e?.preventDefault) e.preventDefault();
    if (!stageModalTarget) return;

    const { item, type } = stageModalTarget;
    const isDone = type === "meeting" ? stageModalStatus === "completed" : stageModalStatus === "done";
    const nowStr = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const formattedStage = formatStatusLabel(stageModalStatus);
    const noteText = isQuickDoneWithoutNote
      ? "Marked as completed"
      : stageModalNote.trim() || (isDone ? "Marked as completed" : `Stage updated to ${formattedStage}`);

    const newHistoryEntry = `[${nowStr} • ${formattedStage}]: ${noteText}`;

    if (type === "followup") {
      const updatedNotes = [newHistoryEntry, item.notes].filter(Boolean).join("\n\n");
      onUpdateFollowUp?.(item.id, {
        status: stageModalStatus,
        completed_at: isDone ? new Date().toISOString() : item.completed_at || null,
        notes: updatedNotes,
      });
    } else if (type === "meeting") {
      const updatedOutcome = [newHistoryEntry, item.outcome].filter(Boolean).join("\n\n");
      onUpdateSalesMeeting?.(item.id, {
        status: stageModalStatus,
        outcome: updatedOutcome,
        next_action: isDone ? (noteText || item.next_action || "") : item.next_action,
      });
    }

    setStageModalTarget(null);
    setStageModalNote("");
  }

  function openRescheduleModal(item) {
    setRescheduleTarget(item);
    setSalesMeetingRescheduleTarget(null);
    setRescheduleForm({
      due_at: toLocalDateTimeInput(new Date(Date.now() + 86400000)),
      reminder_before_minutes: Number(item.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
      notes: item.notes || "",
      meeting_link: "",
    });
    setShowRescheduleModal(true);
  }

  function openSalesMeetingRescheduleModal(item) {
    setSalesMeetingRescheduleTarget(item);
    setRescheduleTarget(null);
    setRescheduleForm({
      due_at: item.scheduled_at ? toLocalDateTimeInput(item.scheduled_at) : toLocalDateTimeInput(new Date(Date.now() + 86400000)),
      reminder_before_minutes: Number(item.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
      notes: item.agenda || item.outcome || "",
      meeting_link: item.meeting_link || defaultMeetLink || "https://meet.google.com/new",
    });
    setShowRescheduleModal(true);
  }

  function handleRescheduleSubmit(e) {
    e.preventDefault();
    if (salesMeetingRescheduleTarget) {
      onUpdateSalesMeeting?.(salesMeetingRescheduleTarget.id, {
        status: "scheduled",
        scheduled_at: new Date(rescheduleForm.due_at).toISOString(),
        reminder_before_minutes: Number(rescheduleForm.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
        meeting_link: rescheduleForm.meeting_link?.trim() || salesMeetingRescheduleTarget.meeting_link || defaultMeetLink || "https://meet.google.com/new",
        agenda: rescheduleForm.notes || salesMeetingRescheduleTarget.agenda || "",
      });
      setShowRescheduleModal(false);
      setSalesMeetingRescheduleTarget(null);
      return;
    }
    if (!rescheduleTarget || !rescheduleForm.due_at) return;
    onUpdateFollowUp?.(rescheduleTarget.id, {
      status: "pending",
      due_at: new Date(rescheduleForm.due_at).toISOString(),
      reminder_before_minutes: Number(rescheduleForm.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
      notes: [rescheduleForm.notes, `Rescheduled from ${new Date(rescheduleTarget.due_at).toLocaleString("en-IN")}`]
        .filter(Boolean)
        .join("\n"),
    });
    setShowRescheduleModal(false);
    setRescheduleTarget(null);
  }

  async function handleSaveMeetingSettings() {
    const trimmed = defaultMeetLink?.trim() || "https://meet.google.com/new";
    setDefaultMeetLink(trimmed);
    if (typeof window !== "undefined") {
      localStorage.setItem("texweb_sales_default_meet_link", trimmed);
    }
    const targetMeetings = salesMeetings.filter(
      (item) => item.status === "scheduled" || !item.meeting_link || item.meeting_link === "https://meet.google.com/new"
    );
    for (const meeting of targetMeetings) {
      await onUpdateSalesMeeting?.(meeting.id, { meeting_link: trimmed });
    }
    setShowMeetingSettingsModal(false);
  }

  function openLostModal(target) {
    const rawStage = (
      target?.stage ||
      (target?.type === "deal"
        ? target?.item?.pipeline_stage || "proposal"
        : target?.item?.status || "Contacted")
    ).toLowerCase();

    const mappedStage =
      rawStage.includes("meet") || rawStage.includes("qual") ? "meeting" :
      rawStage.includes("prop") || rawStage.includes("quot") ? "proposal" :
      rawStage.includes("nego") ? "negotiation" : "contacted";

    const stageReasons = STAGE_LOSS_REASONS[mappedStage] || STAGE_LOSS_REASONS.contacted;

    setLostTarget(target);
    setLostForm({
      stage: mappedStage,
      reason: stageReasons[0],
      notes: "",
      competitor_name: "",
      re_nurture_days: "30",
    });
    setShowLostModal(true);
  }

  function handleMarkLostSubmit(e) {
    e.preventDefault();
    if (!lostTarget) return;
    const reasonText = [
      `[Lost At: ${lostForm.stage?.toUpperCase()}]`,
      lostForm.reason,
      lostForm.competitor_name ? `Competitor: ${lostForm.competitor_name}` : "",
      lostForm.re_nurture_days !== "none" ? `Re-Nurture: in ${lostForm.re_nurture_days} days` : "No Re-nurture",
      lostForm.notes,
    ]
      .filter(Boolean)
      .join(" | ");

    if (lostTarget.type === "deal") {
      if (onUpdateDealStage) {
        onUpdateDealStage(lostTarget.item.id, "closed_lost", {
          loss_reason: reasonText,
          notes: [lostTarget.item.notes, `Lost: ${reasonText}`].filter(Boolean).join("\n"),
        });
      }
    } else if (lostTarget.type === "lead") {
      if (onMarkLeadLost) {
        onMarkLeadLost(lostTarget.item.id, {
          status: "Lost",
          loss_reason: reasonText,
          notes: [lostTarget.item.notes, `Lost: ${reasonText}`].filter(Boolean).join("\n"),
          lost_at_stage: lostForm.stage,
        });
      } else if (onUpdateLead) {
        onUpdateLead(lostTarget.item.id, {
          status: "Lost",
          loss_reason: reasonText,
          notes: [lostTarget.item.notes, `Lost: ${reasonText}`].filter(Boolean).join("\n"),
        });
      } else if (onUpdateLeadStatus) {
        onUpdateLeadStatus(lostTarget.item.id, "Lost");
      }

      if (selectedLead?.id === lostTarget.item.id) {
        setSelectedLead((prev) =>
          prev
            ? {
                ...prev,
                status: "Lost",
                loss_reason: reasonText,
                notes: [lostTarget.item.notes, `Lost: ${reasonText}`].filter(Boolean).join("\n"),
              }
            : null
        );
      }
    }

    setShowLostModal(false);
    setLostTarget(null);
  }

  async function handleReopenLead(lead, linkedDeal) {
    if (!lead) return;
    try {
      const updates = {
        status: "Contacted",
        notes: [lead.notes, `[Restored from Lost to Active at ${new Date().toLocaleString("en-IN")}]`].filter(Boolean).join("\n"),
        loss_reason: null,
      };

      if (onUpdateLead) {
        await onUpdateLead(lead.id, updates);
      } else if (onUpdateLeadStatus) {
        await onUpdateLeadStatus(lead.id, "Contacted");
      }

      const dealToReopen = linkedDeal || deals.find((d) => d.lead_id === lead.id);
      if (dealToReopen && (dealToReopen.pipeline_stage || dealToReopen.stage) === "closed_lost") {
        if (onUpdateDealStage) {
          await onUpdateDealStage(dealToReopen.id, "contacted", {
            loss_reason: null,
            notes: [dealToReopen.notes, `[Deal Reopened from Lost at ${new Date().toLocaleString("en-IN")}]`].filter(Boolean).join("\n"),
          });
        }
      }

      if (selectedLead?.id === lead.id) {
        setSelectedLead((prev) => (prev ? { ...prev, ...updates, loss_reason: null } : prev));
      }
    } catch (err) {
      console.error("Failed to restore lead:", err);
    }
  }

  function openAddDealModal(initialStage = "contacted", lead = null) {
    setNewDealForm({
      title: lead ? `${lead.name} - ${lead.service || "Tech Development"}` : "",
      client_id: "",
      lead_id: lead ? lead.id : "",
      pipeline_stage: "contacted",
      deal_value: "100000",
      service: lead?.service || "Web Development",
      meeting_scheduled_at: toLocalDateTimeInput(new Date(Date.now() + 2 * 60 * 60 * 1000)),
      reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
      duration_minutes: 60,
      meeting_link: defaultMeetLink || "https://meet.google.com/new",
      notes: lead ? `Created from lead: ${lead.name} (${lead.phone || ""})` : "",
    });
    setShowAddDealModal(true);
  }

  async function handleCreateDealSubmit(e) {
    e.preventDefault();
    if (
      !newDealForm.title ||
      !newDealForm.deal_value ||
      !newDealForm.pipeline_stage ||
      !newDealForm.service ||
      !newDealForm.meeting_scheduled_at ||
      !newDealForm.meeting_link ||
      !newDealForm.lead_id ||
      !newDealForm.notes?.trim()
    ) return;
    const created = await onCreateDeal?.({
      ...newDealForm,
      pipeline_stage: "contacted",
      deal_value: Number(newDealForm.deal_value) || 0,
      client_id: null,
      lead_id: newDealForm.lead_id || null,
      reminder_before_minutes: Number(newDealForm.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
      expected_close_date: newDealForm.meeting_scheduled_at ? newDealForm.meeting_scheduled_at.slice(0, 10) : null,
      notes: [
        newDealForm.notes,
        newDealForm.meeting_scheduled_at ? `Meeting scheduled: ${new Date(newDealForm.meeting_scheduled_at).toLocaleString("en-IN")}` : null,
        newDealForm.meeting_link ? `Google Meet: ${newDealForm.meeting_link}` : null,
      ].filter(Boolean).join("\n"),
    });
    if (created?.id && newDealForm.meeting_scheduled_at) {
      await scheduleAutoMeetingForDeal({
        ...newDealForm,
        ...created,
      meeting_scheduled_at: newDealForm.meeting_scheduled_at,
      reminder_before_minutes: Number(newDealForm.reminder_before_minutes) || DEFAULT_REMINDER_MINUTES,
      meeting_link: newDealForm.meeting_link,
      });
    }
    if ((created?.pipeline_stage || "contacted") === "closed_won") {
      onConvertToClientAndProject?.(created || { ...newDealForm, pipeline_stage: "closed_won" });
    }
    setShowAddDealModal(false);
    setNewDealForm({
      title: "",
      client_id: "",
      lead_id: "",
      pipeline_stage: "contacted",
      deal_value: "100000",
      service: "Web Development",
      meeting_scheduled_at: toLocalDateTimeInput(new Date(Date.now() + 2 * 60 * 60 * 1000)),
      reminder_before_minutes: DEFAULT_REMINDER_MINUTES,
      duration_minutes: 60,
      meeting_link: defaultMeetLink || "https://meet.google.com/new",
      notes: "",
    });
  }

  async function handleDealStageChange(deal, nextStage, currentStage) {
    if (!deal || nextStage === (deal.pipeline_stage || currentStage)) return;
    if (nextStage === "closed_lost") {
      openLostModal({ type: "deal", item: deal, stage: currentStage });
      return;
    }
    const updatedDeal = await onUpdateDealStage?.(deal.id, nextStage);
    const stageDeal = { ...deal, ...(updatedDeal || {}), pipeline_stage: nextStage };
    if (nextStage === "contacted") {
      await scheduleAutoMeetingForDeal(stageDeal);
    }
    if (nextStage === "closed_won") {
      onConvertToClientAndProject?.(stageDeal);
    }
  }

  function handleDealDrop(stageId) {
    if (!draggedDealId) return;
    const deal = deals.find((item) => item.id === draggedDealId);
    setDraggedDealId(null);
    if (!deal) return;
    handleDealStageChange(deal, stageId, deal.pipeline_stage || "contacted");
  }

  const crmActionButtons = (
    <>
      <button
        onClick={() => onRefresh?.()}
        className="p-2 shrink-0 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-neutral-300 transition cursor-pointer"
        title="Refresh CRM"
      >
        <RefreshCw className="w-4 h-4" />
      </button>

      {viewMode === "leads" && (
        <button
          onClick={() => setShowMetaImportModal(true)}
          className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white font-semibold text-xs transition shadow-sm cursor-pointer shadow-pink-500/20"
          title="Import Excel, Google Sheet, or Meta Ads leads into CRM"
        >
          <Sparkles className="w-4 h-4" />
          <span>Import Excel Leads</span>
        </button>
      )}

      {viewMode === "commercials" && (
        <button
          onClick={() => openCommercialModal("proposal")}
          className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 font-semibold text-xs transition shadow-sm cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Quotation + Agreement</span>
        </button>
      )}

      {viewMode === "followups" && (
        <button
          onClick={() => setShowFollowUpModal(true)}
          className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition shadow-sm cursor-pointer"
        >
          <Phone className="w-4 h-4" />
          <span>Follow-up</span>
        </button>
      )}

      {viewMode === "sales_meetings" && (
        <>
        <button
          type="button"
          onClick={() => setShowMeetingSettingsModal(true)}
          className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold text-xs transition shadow-sm cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>Meet Settings</span>
        </button>
        <button
          onClick={() => {
            setSalesMeetingForm((prev) => ({
              ...prev,
              meeting_link: defaultMeetLink || "https://meet.google.com/new",
            }));
            setShowSalesMeetingModal(true);
          }}
          className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </button>
        </>
      )}

      {viewMode === "pipeline" ? (
        <button
          type="button"
          onClick={() => openAddDealModal("contacted")}
          className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Deal</span>
        </button>
      ) : viewMode === "leads" ? (
        <button
          type="button"
          onClick={() => setShowAddLeadModal(true)}
          className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </button>
      ) : null}
    </>
  );

  return (
    <div className="space-y-6">
      {headerActionsTarget
        ? createPortal(
            <div className="flex items-center justify-end gap-2 shrink-0 flex-nowrap whitespace-nowrap">
              {crmActionButtons}
            </div>,
            headerActionsTarget
          )
        : null}
      {/* 1. Header & Actions */}
      <div className={`${headerActionsTarget ? "hidden" : "flex"} items-center justify-end gap-2 overflow-x-auto no-scrollbar whitespace-nowrap`}>
          {/* View Mode Toggle */}
          {showViewTabs && (
          <div className="flex shrink-0 p-1 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("leads")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "leads"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Leads List
            </button>
            <button
              onClick={() => setViewMode("pipeline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "pipeline"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Sales Pipeline
            </button>
            <button
              onClick={() => setViewMode("commercials")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "commercials"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Commercials
            </button>
            <button
              onClick={() => setViewMode("followups")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "followups"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Follow-ups
            </button>
            <button
              onClick={() => setViewMode("sales_meetings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "sales_meetings"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Meetings
            </button>
          </div>
          )}

          {crmActionButtons}
      </div>

      {pageStatusCards.length > 0 && (
        isReportsLoading || isLeadsLoading || isPipelineLoading || isFollowUpsLoading || isMeetingsLoading || isCommercialsLoading ? (
          <StatusCardsSkeleton cards={Math.min(6, Math.max(1, pageStatusCards.length))} />
        ) : (
        <div className={`grid gap-3 ${pageStatusCards.length === 6 ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" : pageStatusCards.length === 5 ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" : "grid-cols-2 lg:grid-cols-4"}`}>
          {pageStatusCards.map((card) => {
            const Icon = card.icon;
            const isClickable = Boolean(
              card.filterKey && ["leads", "pipeline", "followups", "sales_meetings"].includes(viewMode)
            );
            const isFilterActive =
              ["leads", "pipeline", "followups", "sales_meetings"].includes(viewMode) &&
              card.filterKey &&
              (
                (card.filterKey === "all" && (statusFilter === "all" || !statusFilter)) ||
                (card.filterKey === "scheduled" && (statusFilter === "scheduled" || statusFilter === "pending" || statusFilter === "active")) ||
                (card.filterKey === "today" && statusFilter === "today") ||
                (card.filterKey === "completed" && (statusFilter === "completed" || statusFilter === "done")) ||
                (card.filterKey === "no_show" && (statusFilter === "no_show" || statusFilter === "cancelled" || statusFilter === "missed")) ||
                (card.filterKey === "pending" && (statusFilter === "pending" || statusFilter === "active")) ||
                (card.filterKey === "overdue" && statusFilter === "overdue") ||
                (card.filterKey === "done" && (statusFilter === "done" || statusFilter === "completed")) ||
                (card.filterKey === "missed" && statusFilter === "missed") ||
                (card.filterKey === "active" && statusFilter === "active") ||
                (card.filterKey === "pipeline" && statusFilter === "pipeline") ||
                (card.filterKey === "converted" && (statusFilter === "converted" || statusFilter === "won")) ||
                (card.filterKey === "lost" && statusFilter === "lost")
              );
            return (
              <div
                key={card.label}
                onClick={() => {
                  if (isClickable && card.filterKey) {
                    setStatusFilter(card.filterKey);
                    setLeadPage(1);
                    setPipelinePage(1);
                    setFollowUpPage(1);
                    setMeetingPage(1);
                  }
                }}
                className={`p-4 rounded-2xl bg-white dark:bg-[#18150f] border shadow-2xs min-w-0 transition-all ${
                  isFilterActive
                    ? "border-orange-500 ring-2 ring-orange-500/40 bg-orange-50/25 dark:bg-orange-950/25 shadow-xs"
                    : "border-gray-100 dark:border-[#3a3020]"
                } ${
                  isClickable ? "cursor-pointer hover:border-orange-300 dark:hover:border-orange-500/50 hover:shadow-xs active:scale-[0.99]" : ""
                }`}
                title={card.helpText || card.label}
              >
                <div className="flex items-center justify-between gap-2 text-gray-500 dark:text-neutral-400 text-xs">
                  <span className="font-semibold truncate">{card.label}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {card.badge && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300">
                        {card.badge}
                      </span>
                    )}
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${card.tone}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black mt-2 text-gray-900 dark:text-white truncate">{card.value}</div>
                <div className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1 font-medium truncate" title={card.sub}>
                  {card.sub}
                </div>
                {card.ratioFormula && (
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-[#2a2418] text-[10px] text-purple-600 dark:text-purple-400 font-bold truncate flex items-center gap-1" title={card.ratioBasis}>
                    <Sparkles className="w-3 h-3 shrink-0" />
                    <span className="truncate">{card.ratioFormula}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )
      )}


      {viewMode === "reports" && (
        isReportsLoading ? (
          <ReportsSkeleton />
        ) : (
      <>
      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-xs">
            <span>Total Captured Leads</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2">{stats.total}</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
            {stats.newCount} New awaiting action
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-xs">
            <span>Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2">{stats.rate}%</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            {stats.convertedCount} Converted to clients
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-xs">
            <span>Active Pipeline Value</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2">
            Rs. {stats.totalPipelineValue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Across open proposals</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-xs">
            <span>Closed Won Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2">
            Rs. {stats.wonValue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Transferred to project execution
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">Sales Report</div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Follow-up performance and conversion for selected date filter.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-black">{salesReport.conversionRate}% conversion</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              ["Completed", salesReport.completedFollowUps, "text-emerald-600"],
              ["Missed", salesReport.missedFollowUps, "text-red-600"],
              ["Overdue", salesReport.overdueFollowUps, "text-amber-600"],
              ["Conversion", `${salesReport.conversionRate}%`, "text-blue-600"],
            ].map(([label, value, tone]) => (
              <div key={label} className="rounded-xl bg-gray-50 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] p-3">
                <div className={`text-lg font-black ${tone}`}>{value}</div>
                <div className="text-[11px] text-gray-500 dark:text-neutral-400 font-semibold">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">Lead Source ROI</div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Meta, Google, referral, and direct source quality.</p>
            </div>
            <DollarSign className="w-4 h-4 text-orange-500" />
          </div>
          <div className="space-y-2">
            {salesReport.sourceRows.length === 0 ? (
              <div className="text-xs text-gray-500 dark:text-neutral-400">No source data available.</div>
            ) : salesReport.sourceRows.map((row) => (
              <div key={row.source} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center text-xs rounded-xl bg-gray-50 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] px-3 py-2">
                <div className="font-bold text-gray-900 dark:text-white truncate">{row.source}</div>
                <div className="text-gray-500">{row.leads} leads</div>
                <div className="text-emerald-600 font-bold">{row.won} won</div>
                <div className="font-mono text-orange-600 font-bold">Rs. {row.value.toLocaleString("en-IN")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
              <Target className="w-4 h-4 text-orange-500" />
              Sales Priority & Next Actions
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Priority, risk, and next action from lead data, meetings, and follow-ups.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600">{aiInsights.overdueFollowUps} overdue</span>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">{aiInsights.staleDeals} stale deals</span>
            {(stats.lostCount > 0 || stats.lostDealsCount > 0) && (
              <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">{stats.lostCount + stats.lostDealsCount} drop-offs logged</span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {aiInsights.rankedLeads.length === 0 ? (
            <div className="md:col-span-3 text-xs text-gray-500 dark:text-neutral-400">No active lead needs action right now.</div>
          ) : (
            aiInsights.rankedLeads.map(({ lead, action }) => (
              <div key={lead.id} className="rounded-xl border border-gray-100 dark:border-[#3a3020] bg-gray-50 dark:bg-[#211d14] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{lead.name}</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1 line-clamp-2">{action}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openAddDealModal("contacted", lead)} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-orange-600 text-white">Pipeline</button>
                  <button onClick={() => openLostModal({ type: "lead", item: lead })} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-600">Lost</button>
                </div>
              </div>
            ))
          )}
        </div>
        {aiInsights.warmStaleDeals.length > 0 && (
          <div className="mt-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-3">
            <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-300 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span>Stale Deal Alerts</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {aiInsights.warmStaleDeals.slice(0, 4).map((deal) => {
                const ageDays = Math.floor((Date.now() - new Date(deal.updated_at || deal.created_at || Date.now()).getTime()) / 86400000);
                return (
                  <div key={deal.id} className="flex items-center justify-between gap-3 rounded-lg bg-white dark:bg-[#211d14] px-3 py-2 text-xs">
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white truncate">{deal.title}</div>
                      <div className="text-gray-500">{deal.pipeline_stage || "pipeline"} - {ageDays} days idle</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-black ${ageDays >= 7 ? "bg-red-50 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                      {ageDays >= 7 ? "7d+" : "3d+"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      </>
        )
      )}

      {/* 3. Filter & Search Controls (Hidden on Leads, Pipeline, Follow-ups, and Meetings as cards handle filtering) */}
      {viewMode === "commercials" && (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search quotations, proposals, agreements by title, client..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
      )}

      {viewMode !== "reports" && (
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020]">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-neutral-400">
          <Calendar className="w-4 h-4" />
          <span>Date Filter</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            ["all", "All"],
            ["today", "Today"],
            ["yesterday", "Yesterday"],
            ["date", "Date"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDateFilter(value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                dateFilter === value
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-400"
              }`}
            >
              {label}
            </button>
          ))}
          {dateFilter === "date" && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              aria-label="Select exact date"
            />
          )}
          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customDateRange.from}
                onChange={(e) => setCustomDateRange({ ...customDateRange, from: e.target.value })}
                className="px-2.5 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              />
              <input
                type="date"
                value={customDateRange.to}
                onChange={(e) => setCustomDateRange({ ...customDateRange, to: e.target.value })}
                className="px-2.5 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              />
            </div>
          )}
        </div>
      </div>
      )}

      {/* 4. Leads List View */}
      {viewMode === "leads" && (
        <div className="space-y-3">
          {/* Alphabetical Search & Filter Bar */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search input with clear button */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search leads alphabetically by name, phone, email, service..."
                  className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white placeholder-gray-400"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* A-Z Sort Controls */}
              <div className="flex items-center gap-1.5 shrink-0 bg-gray-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
                <span className="text-[11px] text-gray-500 dark:text-neutral-400 px-1.5 flex items-center gap-1 select-none">
                  <ArrowDownAZ className="w-3.5 h-3.5 text-orange-500" />
                  <span>Sort:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setLeadSortOrder("asc")}
                  className={`px-2.5 py-1 rounded-lg transition select-none cursor-pointer ${
                    leadSortOrder === "asc"
                      ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-2xs font-bold"
                      : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Sort Alphabetically A to Z"
                >
                  A → Z
                </button>
                <button
                  type="button"
                  onClick={() => setLeadSortOrder("desc")}
                  className={`px-2.5 py-1 rounded-lg transition select-none cursor-pointer ${
                    leadSortOrder === "desc"
                      ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-2xs font-bold"
                      : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Sort Alphabetically Z to A"
                >
                  Z → A
                </button>
                <button
                  type="button"
                  onClick={() => setLeadSortOrder("default")}
                  className={`px-2 py-1 rounded-lg transition select-none cursor-pointer ${
                    leadSortOrder === "default"
                      ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-2xs font-bold"
                      : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Default order (Newest first)"
                >
                  Default
                </button>
              </div>
            </div>

            {/* A-Z Alphabet Selector Row */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2 border-t border-gray-100 dark:border-[#2e2619]">
              <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider shrink-0 mr-1 select-none">
                A-Z:
              </span>
              {["all", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "#"].map((char) => {
                const isSelected = leadAlphabetFilter === char;
                const count = char === "all" ? totalLettersCount : leadLetterCounts[char] || 0;
                const hasLeads = count > 0;

                return (
                  <button
                    key={char}
                    type="button"
                    onClick={() => {
                      setLeadAlphabetFilter(isSelected && char !== "all" ? "all" : char);
                      setLeadPage(1);
                    }}
                    disabled={char !== "all" && !hasLeads}
                    className={`min-w-[26px] h-7 px-1.5 rounded-lg text-[11px] font-bold shrink-0 transition flex items-center justify-center gap-0.5 select-none ${
                      isSelected
                        ? "bg-orange-600 text-white shadow-2xs scale-105 cursor-pointer"
                        : hasLeads
                        ? "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-neutral-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 cursor-pointer"
                        : "text-gray-300 dark:text-neutral-600 cursor-not-allowed opacity-35"
                    }`}
                    title={
                      char === "all"
                        ? `All leads (${totalLettersCount})`
                        : hasLeads
                        ? `${count} lead(s) starting with "${char}"`
                        : `No leads starting with "${char}"`
                    }
                  >
                    <span>{char === "all" ? "All" : char}</span>
                    {isSelected && char !== "all" && (
                      <span className="text-[9px] opacity-90">({count})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
            {isLeadsLoading && paginatedLeads.length === 0 ? (
              <TableSkeleton rows={6} columns={6} />
            ) : filteredLeads.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500 dark:text-neutral-400">
                <p>No leads found matching your search and filter criteria{leadAlphabetFilter !== "all" && ` starting with "${leadAlphabetFilter}"`}.</p>
                {(leadAlphabetFilter !== "all" || query) && (
                  <button
                    onClick={() => {
                      setLeadAlphabetFilter("all");
                      setQuery("");
                    }}
                    className="mt-2 text-xs font-semibold text-orange-600 hover:underline inline-block cursor-pointer"
                  >
                    Clear search & letter filter
                  </button>
                )}
              </div>
            ) : (
              <>
              <ResponsiveTableContainer>
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[1020px]">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                      <th
                        onClick={() => setLeadSortOrder(leadSortOrder === "asc" ? "desc" : "asc")}
                        className="py-3 px-4 min-w-[220px] cursor-pointer hover:text-orange-600 transition select-none"
                        title="Click to sort alphabetically"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Full Name</span>
                          <ArrowDownAZ className={`w-3.5 h-3.5 ${leadSortOrder !== "default" ? "text-orange-500" : "text-gray-400"}`} />
                          {leadSortOrder === "asc" && <span className="text-[9px] font-bold text-orange-600 lowercase">a-z</span>}
                          {leadSortOrder === "desc" && <span className="text-[9px] font-bold text-orange-600 lowercase">z-a</span>}
                        </div>
                      </th>
                      <th className="py-3 px-4 min-w-[210px] whitespace-nowrap">Contact (Phone & Email)</th>
                      <th className="py-3 px-3 min-w-[160px] whitespace-nowrap">Service Needed</th>
                      <th className="py-3 px-3 min-w-[130px] whitespace-nowrap">Budget Range</th>
                      <th className="py-3 px-4 text-right min-w-[250px] whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                  {paginatedLeads.map((lead) => {
                    const budget = getLeadBudget(lead);
                    const location = getLeadLocation(lead);
                    const linkedDeal = deals.find((deal) => deal.lead_id === lead.id);
                    const hasWonDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_won");
                    const hasLostDeal = Boolean(linkedDeal && (linkedDeal.pipeline_stage || linkedDeal.stage) === "closed_lost");
                    const isInPipeline = Boolean(linkedDeal && !CLOSED_PIPELINE_STAGES.includes(linkedDeal.pipeline_stage || linkedDeal.stage));
                    const isConverted = hasWonDeal || (!linkedDeal && (lead.status === "Converted" || lead.status === "Closed Won"));
                    const isLost = hasLostDeal || (!linkedDeal && lead.status === "Lost");
                    const lossReason = isLost ? getLeadLossReason(lead, linkedDeal) : null;
                    const stageLabel = linkedDeal ? (PIPELINE_STAGES.find((s) => s.id === (linkedDeal.pipeline_stage || linkedDeal.stage))?.label || "Pipeline") : null;
                    const nextLeadMeeting = salesMeetings
                      .filter((m) => m.lead_id === lead.id && !["cancelled", "completed", "no_show"].includes(m.status))
                      .sort((a, b) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime())[0];
                    const nextLeadFollowUp = followUps
                      .filter((f) => f.lead_id === lead.id && f.status === "pending")
                      .sort((a, b) => new Date(a.due_at || 0).getTime() - new Date(b.due_at || 0).getTime())[0];

                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition group"
                      >
                        {/* 1. Full Name */}
                        <td className="py-3.5 px-4 min-w-[220px]">
                          <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setSelectedLead(lead)}
                              className="font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition text-left cursor-pointer"
                              title="Click to view Lead details & timeline"
                            >
                              {lead.name}
                            </button>
                            {isConverted && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 shrink-0">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                <span>Won in Pipeline</span>
                              </span>
                            )}
                            {!isConverted && !isLost && linkedDeal && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 shrink-0">
                                <TrendingUp className="w-2.5 h-2.5 text-amber-500" />
                                <span>Pipeline: {stageLabel}</span>
                              </span>
                            )}
                            {isLost && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 shrink-0">
                                <XCircle className="w-2.5 h-2.5 text-rose-500" />
                                <span>Lost</span>
                              </span>
                            )}
                            {nextLeadMeeting && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewMode("sales_meetings");
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 shrink-0 cursor-pointer hover:bg-blue-100 transition"
                                title={`Scheduled Meeting: ${nextLeadMeeting.title} (${new Date(nextLeadMeeting.scheduled_at).toLocaleString("en-IN")})`}
                              >
                                <Video className="w-2.5 h-2.5 text-blue-500" />
                                <span>Meet: {new Date(nextLeadMeeting.scheduled_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                              </button>
                            )}
                            {nextLeadFollowUp && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewMode("followups");
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 shrink-0 cursor-pointer hover:bg-amber-100 transition"
                                title={`Pending Follow-up: ${nextLeadFollowUp.title} (${new Date(nextLeadFollowUp.due_at).toLocaleString("en-IN")})`}
                              >
                                <Clock className="w-2.5 h-2.5 text-amber-500" />
                                <span>Follow-up: {new Date(nextLeadFollowUp.due_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                              </button>
                            )}
                            {lead.source?.toLowerCase().includes("meta") && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/60 shrink-0">
                                <Sparkles className="w-2.5 h-2.5 text-pink-500" />
                                <span>{lead.source.includes("Instagram") ? "Instagram" : "Meta"}</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[10.5px] text-gray-400 mt-0.5">
                            {new Date(lead.created_at || Date.now()).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </div>

                          {/* Show Lost Reason right under lead details */}
                          {isLost && (
                            <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-rose-700 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-950/30 p-2 rounded-xl border border-rose-200/60 dark:border-rose-900/40 max-w-sm">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <div className="leading-tight">
                                <span className="font-bold text-[10px] uppercase text-rose-800 dark:text-rose-200 block mb-0.5">Lost Reason:</span>
                                <span className="whitespace-pre-line break-words text-rose-700 dark:text-rose-300 font-medium" title={lossReason || "Not specified"}>
                                  {lossReason || "No specific reason provided"}
                                </span>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* 2. Contact Info (Phone & Email) */}
                        <td className="py-3.5 px-4 min-w-[210px]">
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone.replace(/[^0-9+]/g, "")}`}
                              className="group/phone inline-flex items-center gap-1.5 font-mono text-gray-800 dark:text-slate-200 font-medium whitespace-nowrap hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
                              title={`Click to call ${lead.phone}`}
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-500 group-hover/phone:scale-110 transition shrink-0" />
                              <span className="group-hover/phone:underline">{lead.phone}</span>
                            </a>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="group/email flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5 whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                              title={`Click to email ${lead.email}`}
                            >
                              <Mail className="w-3 h-3 text-gray-400 group-hover/email:text-blue-500 group-hover/email:scale-110 transition shrink-0" />
                              <span className="truncate max-w-[190px] group-hover/email:underline" title={lead.email}>{lead.email}</span>
                            </a>
                          )}
                        </td>

                        {/* 3. Service Needed (what_service_are_you_looking_for?) */}
                        <td className="py-3.5 px-3 min-w-[160px]">
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] leading-snug font-semibold bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-neutral-200 align-middle whitespace-normal break-words"
                            title={lead.service || "General Inquiry"}
                          >
                            {lead.service ? lead.service.replace(/_/g, " ") : "General Inquiry"}
                          </span>
                        </td>

                        {/* 4. Budget Range (choose_your_budget_range?) */}
                        <td className="py-3.5 px-3 min-w-[130px] whitespace-nowrap">
                          {budget !== "-" ? (
                            <span
                              className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] leading-snug font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 align-middle whitespace-nowrap"
                              title={budget}
                            >
                              {budget.replace(/_/g, " ")}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>

                        {/* 5. Actions */}
                        <td className="py-3.5 px-4 text-right min-w-[250px] whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 shrink-0 whitespace-nowrap">
                          {/* 1. WhatsApp Button */}
                          {lead.phone && (
                            <button
                              onClick={() => handleWhatsAppClick(lead)}
                              className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition shrink-0 cursor-pointer"
                              title="Chat on WhatsApp"
                              aria-label="Chat on WhatsApp"
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 2. Restore Lead Button (Only for Lost Leads) */}
                          {isLost && (
                            <button
                              onClick={() => handleReopenLead(lead, linkedDeal)}
                              className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/60 dark:border-emerald-800/40 transition shrink-0 cursor-pointer"
                              title="Restore / Re-activate Lead back to Active"
                              aria-label="Restore / Re-activate Lead back to Active"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 3. Pipeline / Deal Button */}
                          {isConverted ? (
                            <button
                              onClick={() => {
                                setViewMode("pipeline");
                                setStatusFilter("all");
                              }}
                              className="p-1.5 rounded-lg shrink-0 transition text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer"
                              title="Won in Pipeline (Click to view)"
                              aria-label="Won in Pipeline"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                            </button>
                          ) : isInPipeline && !isLost ? (
                            <button
                              onClick={() => {
                                setViewMode("pipeline");
                                setStatusFilter("all");
                              }}
                              className="p-1.5 rounded-lg shrink-0 transition text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100 cursor-pointer"
                              title={`In Pipeline (${stageLabel || "Active"}) - Click to view`}
                              aria-label="In Pipeline"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openAddDealModal("contacted", lead)}
                              className="p-1.5 rounded-lg text-orange-600 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 transition shrink-0 cursor-pointer"
                              title={isLost ? "Reopen & Convert to Pipeline Deal" : "Move to Pipeline"}
                              aria-label={isLost ? "Reopen & Convert to Pipeline Deal" : "Move to Pipeline"}
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 4. Follow-up Button */}
                          <button
                            onClick={() => openLeadFollowUpModal(lead)}
                            className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition shrink-0 cursor-pointer"
                            title={isLost ? "Schedule Re-nurture Follow-up" : "Schedule Follow-up"}
                            aria-label={isLost ? "Schedule Re-nurture Follow-up" : "Schedule Follow-up"}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          {/* 5. Mark as Lost Button (Only if NOT already Lost and NOT Won) */}
                          {!isLost && !isConverted && (
                            <button
                              onClick={() => openLostModal({ type: "lead", item: lead })}
                              className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0 cursor-pointer"
                              title="Mark Lead as Lost"
                              aria-label="Mark Lead as Lost"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 6. Edit Lead Details */}
                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="p-1.5 rounded-lg text-amber-600 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition shrink-0 cursor-pointer"
                            title="Edit Lead Details"
                            aria-label="Edit Lead Details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* 7. View Details & Timeline Button */}
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
                            title="View Details & Timeline"
                            aria-label="View Details & Timeline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
              </ResponsiveTableContainer>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#211d14]/60 text-xs">
              <div className="text-gray-500 dark:text-neutral-400 flex items-center gap-1.5 flex-wrap">
                <span>Showing</span>
                <span className="font-bold text-gray-800 dark:text-white">{leadPageStart}</span>
                <span>to</span>
                <span className="font-bold text-gray-800 dark:text-white">{leadPageEnd}</span>
                <span>of</span>
                <span className="font-bold text-gray-800 dark:text-white">{leadTotalForPagination}</span>
                <span>leads</span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
                  <span className="hidden xs:inline">Rows per page:</span>
                  <select
                    value={leadsPerPage}
                    onChange={(e) => {
                      setLeadsPerPage(Number(e.target.value));
                      setLeadPage(1);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-neutral-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                    aria-label="Leads per page"
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLeadPage((p) => Math.max(1, p - 1))}
                    disabled={safeLeadPage <= 1}
                    className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                    title="Previous Page"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {Array.from({ length: leadPageCount }, (_, i) => i + 1)
                    .filter((page) => {
                      if (leadPageCount <= 5) return true;
                      if (page === 1 || page === leadPageCount) return true;
                      return Math.abs(page - safeLeadPage) <= 1;
                    })
                    .reduce((acc, page, idx, arr) => {
                      if (idx > 0 && page - arr[idx - 1] > 1) {
                        acc.push("...");
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 font-bold select-none">
                          ...
                        </span>
                      ) : (
                        <button
                          key={`page-${item}`}
                          type="button"
                          onClick={() => setLeadPage(item)}
                          className={`min-w-[28px] h-7 px-2 rounded-xl text-xs font-bold transition ${
                            safeLeadPage === item
                              ? "bg-orange-600 text-white shadow-2xs"
                              : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    type="button"
                    onClick={() => setLeadPage((p) => Math.min(leadPageCount, p + 1))}
                    disabled={safeLeadPage >= leadPageCount}
                    className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                    title="Next Page"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            </>
          )}
        </div>
      </div>
      )}

      {viewMode === "pipeline" && (
        <>
        {isPipelineLoading && visiblePipelineDeals.length === 0 ? (
          <PipelineSkeleton />
        ) : (
        <div className={`grid grid-cols-1 ${statusFilter === "lost" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"} gap-3`}>
          {(statusFilter === "lost"
            ? [{ id: "closed_lost", label: "Closed Lost Deals", color: "bg-rose-500" }]
            : PIPELINE_STAGES
          ).map((col) => {
            const colDeals = paginatedPipelineDeals.filter(
              (d) =>
                (d.pipeline_stage || "contacted") === col.id &&
                (dateFilter === "all" || matchesDateFilter(d, "created_at") || matchesDateFilter(d, "updated_at"))
            );
            const colTotal = colDeals.reduce((sum, d) => sum + (Number(d.deal_value) || 0), 0);

            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDealDrop(col.id)}
                className={`flex flex-col rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-3 shadow-2xs min-h-[350px] transition ${
                  draggedDealId ? "ring-1 ring-orange-400/40" : ""
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#3a3020]">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.color}`} />
                    <span className="font-semibold text-xs text-gray-800 dark:text-neutral-200">
                      {col.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                      {colDeals.length}
                    </span>
                    {col.id !== "closed_lost" && (
                      <button
                        type="button"
                        onClick={() => openAddDealModal(col.id)}
                        className="p-0.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title={`Add Deal in ${col.label}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 mt-1 mb-2 font-mono">
                  Rs. {colTotal.toLocaleString("en-IN")}
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                  {colDeals.map((deal) => {
                    const dealFollowUps = followUps
                      .filter((item) => (item.deal_id === deal.id || (deal.lead_id && item.lead_id === deal.lead_id)) && item.status === "pending")
                      .sort((a, b) => new Date(a.due_at || 0).getTime() - new Date(b.due_at || 0).getTime());
                    const nextFollowUp = dealFollowUps[0];
                    const nextMeeting = salesMeetings
                      .filter((item) => (item.deal_id === deal.id || (deal.lead_id && item.lead_id === deal.lead_id)) && item.status === "scheduled")
                      .sort((a, b) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime())[0];
                    const latestQuotation = getLatestLinkedDoc([...proposals, ...quotations], deal);
                    const latestAgreement = getLatestLinkedDoc(agreements, deal);
                    const latestInvoice = getLatestLinkedDoc(invoices, deal);
                    const docBadges = [
                      getDocStatusBadge("Quotation", latestQuotation),
                      getDocStatusBadge("Agreement", latestAgreement),
                      getDocStatusBadge("Invoice", latestInvoice),
                    ].filter(Boolean);

                    const lead = leads.find((item) => item.id === deal.lead_id);
                    const clientName = lead?.name || deal.title?.split(" - ")[0] || deal.title || "Deal";
                    const serviceName = deal.service || lead?.service || deal.title?.split(" - ")[1] || "Tech Development";
                    const dealInitials = clientName
                      .split(" ")
                      .map((w) => w[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "DL";

                    const isMetaLead = Boolean(
                      lead?.source?.toLowerCase().includes("meta") ||
                      lead?.source?.toLowerCase().includes("instagram") ||
                      deal.notes?.toLowerCase().includes("meta") ||
                      deal.notes?.toLowerCase().includes("instagram")
                    );
                    const isInstagram = Boolean(
                      lead?.source?.toLowerCase().includes("instagram") ||
                      deal.notes?.toLowerCase().includes("instagram")
                    );

                    const isDefaultNote = !deal.notes || [
                      "converted lead",
                      "created from lead",
                    ].some((kw) => deal.notes.toLowerCase().includes(kw));
                    const customNotes = !isDefaultNote ? deal.notes : null;

                    const meetingDateStr = nextMeeting?.scheduled_at
                      ? new Date(nextMeeting.scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
                        ", " +
                        new Date(nextMeeting.scheduled_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
                      : null;

                    const followUpDateStr = nextFollowUp?.due_at
                      ? new Date(nextFollowUp.due_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
                        ", " +
                        new Date(nextFollowUp.due_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
                      : null;

                    return (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => setDraggedDealId(deal.id)}
                      onDragEnd={() => setDraggedDealId(null)}
                      onClick={() => {
                        setSelectedDeal(deal);
                        setDealModalTab("overview");
                      }}
                      className="group relative p-2.5 rounded-xl bg-white dark:bg-[#1a1711] border border-gray-200/90 dark:border-[#382f20] hover:border-orange-500/80 hover:shadow-md transition-all duration-150 space-y-2 cursor-pointer select-none"
                    >
                      {/* 1. Header: Avatar + Client Name + Value + Edit button */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 text-white text-[9px] font-black flex items-center justify-center shrink-0 uppercase tracking-tighter shadow-2xs">
                            {dealInitials}
                          </span>
                          <span className="font-bold text-xs text-gray-900 dark:text-white truncate group-hover:text-orange-600 transition" title={clientName}>
                            {clientName}
                          </span>
                          {deal._optimistic && (
                            <span className="text-[8px] font-bold text-amber-600 animate-pulse shrink-0">●</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-black tracking-tight ${
                            col.id === "closed_won"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40"
                              : "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/40"
                          }`}>
                            ₹{(Number(deal.deal_value) || 0).toLocaleString("en-IN")}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditDeal(deal);
                            }}
                            className="p-1 rounded-md text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Edit Deal Details"
                            aria-label="Edit Deal Details"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* 2. Service & Badges */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-neutral-300 truncate max-w-[140px]">
                          {serviceName}
                        </span>
                        {isMetaLead && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-200/50">
                            {isInstagram ? "IG" : "Meta"}
                          </span>
                        )}
                        {docBadges.map((badge) => (
                          <span
                            key={badge.label}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold capitalize ${badge.tone}`}
                          >
                            {badge.label}
                          </span>
                        ))}
                      </div>

                      {/* 3. Action / Status Highlight (Single Compact Row) */}
                      {col.id === "closed_won" ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-200/40 dark:border-emerald-800/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">Won · Client & Project Active</span>
                        </div>
                      ) : col.id === "closed_lost" ? (
                        <div className="flex items-start gap-1.5 text-[10px] font-medium text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/30 px-2 py-1 rounded-lg border border-rose-200/40" title={deal.loss_reason}>
                          <XCircle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                          <span className="break-words">{deal.loss_reason || "Deal dropped"}</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {meetingDateStr && (
                            <div className="flex items-center justify-between gap-1 text-[10px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/30 px-2 py-1 rounded-lg border border-blue-200/40">
                              <div className="flex items-center gap-1.5 truncate">
                                <Video className="w-3 h-3 text-blue-500 shrink-0" />
                                <span className="truncate font-semibold">Meet: {meetingDateStr}</span>
                              </div>
                              {nextMeeting?.scheduled_at && new Date(nextMeeting.scheduled_at).toDateString() === new Date().toDateString() && (
                                <span className="px-1 py-0.2 rounded text-[8px] font-black uppercase bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-100 shrink-0">
                                  Today
                                </span>
                              )}
                            </div>
                          )}
                          {followUpDateStr && (
                            <div className="flex items-center justify-between gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-200/40">
                              <div className="flex items-center gap-1.5 truncate">
                                <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                <span className="truncate font-semibold">Follow-up: {followUpDateStr}</span>
                              </div>
                              {new Date(nextFollowUp.due_at).getTime() < Date.now() ? (
                                <span className="px-1 py-0.2 rounded text-[8px] font-black uppercase bg-red-100 text-red-600 shrink-0">
                                  Overdue
                                </span>
                              ) : new Date(nextFollowUp.due_at).toDateString() === new Date().toDateString() ? (
                                <span className="px-1 py-0.2 rounded text-[8px] font-black uppercase bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-100 shrink-0">
                                  Today
                                </span>
                              ) : null}
                            </div>
                          )}
                          {!meetingDateStr && !followUpDateStr && customNotes && (
                            <div className="text-[10px] text-gray-500 dark:text-neutral-400 px-1 italic whitespace-pre-line break-words">
                              {customNotes}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 4. Action Toolbar */}
                      <div className="pt-1.5 border-t border-gray-100 dark:border-[#2e2619] space-y-1.5">
                        {col.id !== "closed_won" && col.id !== "closed_lost" ? (
                          <>
                            <div className="flex items-center justify-between gap-1 min-w-0">
                              <select
                                value={deal.pipeline_stage || "contacted"}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleDealStageChange(deal, e.target.value, col.id);
                                }}
                                className="text-[9.5px] font-semibold bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md px-1 py-0.5 text-gray-700 dark:text-neutral-300 focus:outline-hidden cursor-pointer max-w-[76px] shrink truncate"
                              >
                                <option value="contacted">Contacted</option>
                                <option value="qualified">Meeting</option>
                                <option value="proposal">Quotation</option>
                                <option value="negotiation">Negotiation</option>
                                <option value="closed_won">Won</option>
                                <option value="closed_lost">Lost</option>
                              </select>

                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPipelineFollowUpModal(deal);
                                  }}
                                  className="p-1 rounded-md text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-200/40 shrink-0 transition cursor-pointer"
                                  title="Add Follow-up"
                                >
                                  <Clock className="w-3 h-3 shrink-0" />
                                </button>

                                {col.id === "contacted" && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openMeetingWhatsApp(deal);
                                    }}
                                    className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/40 shrink-0 transition cursor-pointer"
                                    title="Send WhatsApp confirmation"
                                  >
                                    <WhatsAppIcon className="w-3 h-3 shrink-0" />
                                  </button>
                                )}

                                {col.id === "proposal" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openCommercialModal("proposal", deal);
                                      }}
                                      className="p-1 rounded-md text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 border border-orange-200/40 shrink-0 transition cursor-pointer"
                                      title="Open Quotation"
                                    >
                                      <FileText className="w-3 h-3 shrink-0" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        sendDealDocWhatsApp(deal);
                                      }}
                                      className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/40 shrink-0 transition cursor-pointer"
                                      title="Share Quotation on WhatsApp"
                                    >
                                      <WhatsAppIcon className="w-3 h-3 shrink-0" />
                                    </button>
                                  </>
                                )}

                                {col.id === "negotiation" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openCommercialModal("agreement", deal);
                                      }}
                                      className="p-1 rounded-md text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 border border-indigo-200/40 shrink-0 transition cursor-pointer"
                                      title="Create / Open Agreement"
                                    >
                                      <FileText className="w-3 h-3 shrink-0" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openInvoiceModal(deal);
                                      }}
                                      className="p-1 rounded-md text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 border border-purple-200/40 shrink-0 transition cursor-pointer"
                                      title="Generate / Open Invoice"
                                    >
                                      <DollarSign className="w-3 h-3 shrink-0" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        sendDealDocWhatsApp(deal);
                                      }}
                                      className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/40 shrink-0 transition cursor-pointer"
                                      title="Share Agreement / Invoice on WhatsApp"
                                    >
                                      <WhatsAppIcon className="w-3 h-3 shrink-0" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </>
                        ) : col.id === "closed_won" ? (
                          <div className="w-full flex items-center justify-between text-[10px]">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              <span>Client Active</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateSection?.("projects");
                              }}
                              className="text-[9.5px] font-bold text-gray-500 hover:text-emerald-600 dark:text-neutral-400 flex items-center gap-0.5 transition cursor-pointer"
                            >
                              <span>View Project</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full flex items-center justify-between text-[10px]">
                            <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>Closed Lost</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDealStageChange(deal, "contacted", col.id);
                              }}
                              className="text-[9.5px] font-bold text-blue-600 hover:underline transition cursor-pointer"
                            >
                              Re-open
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        )}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-gray-100 dark:border-[#3a3020] bg-white dark:bg-[#18150f] text-xs shadow-2xs">
          <div className="text-gray-500 dark:text-neutral-400 flex items-center gap-1.5 flex-wrap">
            <span>Showing</span>
            <span className="font-bold text-gray-800 dark:text-white">{pipelinePageStart}</span>
            <span>to</span>
            <span className="font-bold text-gray-800 dark:text-white">{pipelinePageEnd}</span>
            <span>of</span>
            <span className="font-bold text-gray-800 dark:text-white">{pipelineTotal}</span>
            <span>deals</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
              <span className="hidden xs:inline">Deals per page:</span>
              <select
                value={pipelinePageSize}
                onChange={(e) => {
                  setPipelinePageSize(Number(e.target.value));
                  setPipelinePage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-neutral-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                aria-label="Pipeline deals per page"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPipelinePage((p) => Math.max(1, p - 1))}
                disabled={safePipelinePage <= 1}
                className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: pipelinePageCount }, (_, i) => i + 1)
                .filter((page) => {
                  if (pipelinePageCount <= 5) return true;
                  if (page === 1 || page === pipelinePageCount) return true;
                  return Math.abs(page - safePipelinePage) <= 1;
                })
                .reduce((acc, page, idx, arr) => {
                  if (idx > 0 && page - arr[idx - 1] > 1) {
                    acc.push("...");
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 font-bold select-none">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${item}`}
                      type="button"
                      onClick={() => setPipelinePage(item)}
                      className={`min-w-[28px] h-7 px-2 rounded-xl text-xs font-bold transition ${
                        safePipelinePage === item
                          ? "bg-orange-600 text-white shadow-2xs"
                          : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                type="button"
                onClick={() => setPipelinePage((p) => Math.min(pipelinePageCount, p + 1))}
                disabled={safePipelinePage >= pipelinePageCount}
                className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                title="Next Page"
                aria-label="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        </>
      )}

      {viewMode === "commercials" && (
        isCommercialsLoading ? (
          <CommercialsSkeleton />
        ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              ["proposal", "New Quotation", "Scope, deliverables, price, tax"],
              ["agreement", "New Agreement", "Terms, milestones, signature"],
            ].map(([type, title, desc]) => (
              <button
                key={type}
                onClick={() => openCommercialModal(type)}
                className="p-4 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] text-left hover:border-orange-500/60 transition shadow-2xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">{title}</span>
                  <Plus className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">{desc}</p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
            {commercialDocs.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500 dark:text-neutral-400">
                No quotation or agreement found.
              </div>
            ) : (
              <ResponsiveTableContainer>
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[960px]">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4 min-w-[180px]">Document</th>
                      <th className="py-3 px-4 min-w-[150px]">Deal</th>
                      <th className="py-3 px-4 min-w-[160px]">Value / Terms</th>
                      <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">Status</th>
                      <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">Date</th>
                      <th className="py-3 px-4 text-right min-w-[160px] whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                    {commercialDocs.map((doc) => {
                      const deal = deals.find((item) => item.id === doc.deal_id);
                      const amount = Number(doc.total) || Number(doc.amount) || Number(doc.subtotal) || 0;
                      const label = doc.agreement_number || doc.quotation_number || doc.title;
                      const isFinal = ["accepted", "signed", "rejected", "declined", "cancelled"].includes(doc.status);

                      return (
                        <tr key={`${doc.docType}-${doc.id}`} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 min-w-[180px]">
                            <div className="font-bold text-gray-900 dark:text-white">{label || "Commercial Document"}</div>
                            <div className="text-[11px] text-gray-500 capitalize">{doc.docType}</div>
                          </td>
                          <td className="py-3.5 px-4 min-w-[150px]">
                            <div className="font-semibold text-gray-900 dark:text-white">{deal?.title || "Linked Deal"}</div>
                            <div className="text-[11px] text-gray-500">{deal?.pipeline_stage || "Pipeline deal"}</div>
                          </td>
                          <td className="py-3.5 px-4 min-w-[160px]">
                            <div className="font-mono font-bold text-gray-900 dark:text-white">
                              {doc.docType === "agreement" ? (doc.commercial_terms || "Payment milestones") : `Rs. ${amount.toLocaleString("en-IN")}`}
                            </div>
                            {doc.scope_of_work && <div className="text-[11px] text-gray-500 dark:text-neutral-400 whitespace-pre-line break-words mt-0.5 leading-relaxed">{doc.scope_of_work}</div>}
                          </td>
                          <td className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              ["accepted", "signed"].includes(doc.status)
                                ? "bg-emerald-50 text-emerald-600"
                                : ["rejected", "declined", "cancelled"].includes(doc.status)
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-600"
                            }`}>
                              {doc.status || "draft"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 min-w-[110px] whitespace-nowrap text-gray-500 text-xs">
                            {doc.valid_until || doc.start_date || doc.sent_at?.slice(0, 10) || doc.created_at?.slice(0, 10) || "-"}
                          </td>
                          <td className="py-3.5 px-4 text-right min-w-[160px] whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5 shrink-0 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => sendDocWhatsApp(doc, doc.docType)}
                                className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/50 dark:border-emerald-800/40 transition shrink-0 cursor-pointer"
                                title="Send on WhatsApp"
                                aria-label="Send on WhatsApp"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                              </button>
                              {!isFinal && (
                                <>
                                  <button
                                    onClick={() => {
                                      if (doc.docType === "agreement") onUpdateAgreement?.(doc.id, { status: "signed", signed_at: new Date().toISOString() });
                                      else if (doc.quotation_number) onUpdateQuotation?.(doc.id, { status: "accepted" });
                                      else onUpdateProposal?.(doc.id, { status: "accepted", accepted_at: new Date().toISOString() });
                                    }}
                                    className="p-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition shrink-0 cursor-pointer"
                                    title={doc.docType === "agreement" ? "Sign Agreement" : "Accept Document"}
                                    aria-label={doc.docType === "agreement" ? "Sign Agreement" : "Accept Document"}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (doc.docType === "agreement") onUpdateAgreement?.(doc.id, { status: "cancelled" });
                                      else if (doc.quotation_number) onUpdateQuotation?.(doc.id, { status: "declined" });
                                      else onUpdateProposal?.(doc.id, { status: "rejected" });
                                    }}
                                    className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0 cursor-pointer"
                                    title="Reject / Cancel"
                                    aria-label="Reject / Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </ResponsiveTableContainer>
            )}
          </div>
        </div>
        )
      )}

      {viewMode === "followups" && (
        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
          {isFollowUpsLoading && paginatedFollowUps.length === 0 ? (
            <TableSkeleton rows={6} columns={6} />
          ) : filteredFollowUps.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-neutral-400">No sales follow-up found.</div>
          ) : (
            <>
            <ResponsiveTableContainer>
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[980px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 min-w-[200px]">Follow-up</th>
                    <th className="py-3 px-4 min-w-[140px]">Linked Account</th>
                    <th className="py-3 px-4 min-w-[120px]">Channel</th>
                    <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Due</th>
                    <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 text-right min-w-[210px] whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                  {paginatedFollowUps.map((item) => {
                    const lead = leads.find((leadItem) => leadItem.id === item.lead_id);
                    const client = clients.find((clientItem) => clientItem.id === item.client_id);
                    const contactPhone = client?.phone || lead?.phone || "";
                    const isOverdue = item.status === "pending" && new Date(item.due_at).getTime() < Date.now();
                    return (
                      <tr key={item.id} className={`hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition ${isOverdue ? "bg-red-50/40 dark:bg-red-950/10" : ""}`}>
                        <td className="py-3.5 px-4 max-w-[280px]">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-gray-900 dark:text-white truncate" title={item.title}>{item.title}</div>
                            {isOverdue && (
                              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase shrink-0">Overdue</span>
                            )}
                          </div>
                          {/* Truncated stage & note preview with current stage in hover tooltip - non-clickable */}
                          <div
                            title={`Stage: ${formatStatusLabel(item.status)}${getLatestNoteSnippet(item.notes) ? ` - ${getLatestNoteSnippet(item.notes)}` : ""}`}
                            className="text-[11px] text-gray-500 dark:text-neutral-400 truncate mt-0.5 flex items-center gap-1.5"
                          >
                            <span className="font-semibold text-gray-700 dark:text-neutral-300 shrink-0">
                              [{formatStatusLabel(item.status)}]:
                            </span>
                            <span className="truncate">
                              {getLatestNoteSnippet(item.notes) || "No notes"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900 dark:text-white">{client?.name || lead?.name || "Unlinked"}</div>
                          <div className="text-[11px] text-gray-500">{client ? "Client" : lead ? "Lead" : "General"}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="capitalize font-semibold text-gray-700 dark:text-neutral-200">{item.channel}</div>
                          {contactPhone ? (
                            <a
                              href={`tel:${contactPhone.replace(/[^0-9+]/g, "")}`}
                              className="text-[11px] text-gray-500 dark:text-neutral-400 font-mono hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline block"
                              title={`Click to call ${contactPhone}`}
                            >
                              {contactPhone}
                            </a>
                          ) : (
                            <div className="text-[11px] text-gray-400 font-mono">-</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-xs whitespace-nowrap">{new Date(item.due_at).toLocaleString("en-IN")}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            item.status === "done" ? "bg-emerald-50 text-emerald-600" : item.status === "missed" || isOverdue ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                          }`}>{item.status}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap min-w-[210px]">
                          <div className="flex items-center justify-end gap-1.5 shrink-0">
                            {contactPhone && (
                              <button
                                onClick={() => {
                                  const cleanPhone = contactPhone.replace(/[^0-9]/g, "");
                                  const text = encodeURIComponent(getFollowUpWhatsappMessage(item, lead, client));
                                  window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank", "noopener,noreferrer");
                                }}
                                className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition shrink-0"
                                title="Chat on WhatsApp"
                                aria-label="Chat on WhatsApp"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {/* Dedicated Stage & History Modal Button */}
                            <button
                              type="button"
                              onClick={() => openStageModal(item, "followup")}
                              className="p-1.5 rounded-lg text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition shrink-0 cursor-pointer"
                              title="Stage & Notes History"
                              aria-label="Stage & Notes History"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            {item.status === "pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openStageModal(item, "followup", "done")}
                                  className="p-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition shrink-0 cursor-pointer"
                                  title="Mark as Done (record completion note)"
                                  aria-label="Mark as Done"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openStageModal(item, "followup", "missed")}
                                  className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0 cursor-pointer"
                                  title="Mark as Missed"
                                  aria-label="Mark as Missed"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {["pending", "missed"].includes(item.status) && (
                              <button
                                onClick={() => openRescheduleModal(item)}
                                className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition shrink-0"
                                title="Reschedule Follow-up"
                                aria-label="Reschedule Follow-up"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete Follow-up */}
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this follow-up?")) {
                                  onDeleteFollowUp?.(item.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0 cursor-pointer"
                              title="Delete Follow-up"
                              aria-label="Delete Follow-up"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ResponsiveTableContainer>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#211d14]/60 text-xs">
                <div className="text-gray-500 dark:text-neutral-400 flex items-center gap-1.5 flex-wrap">
                  <span>Showing</span>
                  <span className="font-bold text-gray-800 dark:text-white">{followUpPageStart}</span>
                  <span>to</span>
                  <span className="font-bold text-gray-800 dark:text-white">{followUpPageEnd}</span>
                  <span>of</span>
                  <span className="font-bold text-gray-800 dark:text-white">{followUpTotal}</span>
                  <span>follow-ups</span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
                    <span className="hidden xs:inline">Rows per page:</span>
                    <select
                      value={followUpPageSize}
                      onChange={(e) => {
                        setFollowUpPageSize(Number(e.target.value));
                        setFollowUpPage(1);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-neutral-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                      aria-label="Follow-ups per page"
                    >
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                      <option value={50}>50 / page</option>
                      <option value={100}>100 / page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setFollowUpPage((p) => Math.max(1, p - 1))}
                      disabled={safeFollowUpPage <= 1}
                      className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                      title="Previous Page"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    {Array.from({ length: followUpPageCount }, (_, i) => i + 1)
                      .filter((page) => {
                        if (followUpPageCount <= 5) return true;
                        if (page === 1 || page === followUpPageCount) return true;
                        return Math.abs(page - safeFollowUpPage) <= 1;
                      })
                      .reduce((acc, page, idx, arr) => {
                        if (idx > 0 && page - arr[idx - 1] > 1) {
                          acc.push("...");
                        }
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === "..." ? (
                          <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 font-bold select-none">
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${item}`}
                            type="button"
                            onClick={() => setFollowUpPage(item)}
                            className={`min-w-[28px] h-7 px-2 rounded-xl text-xs font-bold transition ${
                              safeFollowUpPage === item
                                ? "bg-orange-600 text-white shadow-2xs"
                                : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}

                    <button
                      type="button"
                      onClick={() => setFollowUpPage((p) => Math.min(followUpPageCount, p + 1))}
                      disabled={safeFollowUpPage >= followUpPageCount}
                      className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                      title="Next Page"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {viewMode === "sales_meetings" && (
        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
          {isMeetingsLoading && paginatedSalesMeetings.length === 0 ? (
            <TableSkeleton rows={6} columns={6} />
          ) : filteredSalesMeetings.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="font-bold text-gray-900 dark:text-white text-base">No sales meetings found</div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 max-w-sm mx-auto">
                {dateFilter !== "all"
                  ? "No meetings match the selected date range."
                  : "There are currently no sales meetings scheduled."}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                {dateFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => {
                      setDateFilter("all");
                      setMeetingPage(1);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 transition cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSalesMeetingForm((prev) => ({
                      ...prev,
                      meeting_link: defaultMeetLink || "https://meet.google.com/new",
                    }));
                    setShowSalesMeetingModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white transition cursor-pointer"
                >
                  Schedule Meeting
                </button>
              </div>
            </div>
          ) : (
            <>
            <ResponsiveTableContainer>
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[1040px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#211d14] text-gray-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 min-w-[220px]">Meeting</th>
                    <th className="py-3 px-4 min-w-[140px]">Linked Account</th>
                    <th className="py-3 px-4 min-w-[100px]">Type</th>
                    <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Schedule</th>
                    <th className="py-3 px-4 min-w-[120px] whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 text-right min-w-[260px] whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#3a3020]/60">
                  {paginatedSalesMeetings.map((item) => {
                    const lead = leads.find((leadItem) => leadItem.id === item.lead_id);
                    const client = clients.find((clientItem) => clientItem.id === item.client_id);
                    const contactPhone = client?.phone || lead?.phone || "";
                    const scheduledTime = item.scheduled_at ? new Date(item.scheduled_at).getTime() : 0;
                    const isOverdue = item.status === "scheduled" && scheduledTime > 0 && scheduledTime < Date.now();
                    const isToday = item.scheduled_at && new Date(item.scheduled_at).toDateString() === new Date().toDateString();
                    const effectiveMeetLink = (item.meeting_link && item.meeting_link !== "https://meet.google.com/new")
                      ? item.meeting_link
                      : (defaultMeetLink || item.meeting_link || "https://meet.google.com/new");
                    return (
                      <tr key={item.id} className={`hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition ${isOverdue ? "bg-red-50/40 dark:bg-red-950/10" : ""}`}>
                        <td className="py-3.5 px-4 max-w-[280px]">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-gray-900 dark:text-white truncate" title={item.title}>{item.title}</div>
                            {isOverdue && (
                              <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[10px] font-black uppercase shrink-0">
                                Passed
                              </span>
                            )}
                            {!isOverdue && isToday && item.status === "scheduled" && (
                              <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 text-[10px] font-black uppercase shrink-0">
                                Today
                              </span>
                            )}
                          </div>
                          {/* Truncated stage & agenda/outcome note preview with current stage in hover tooltip - non-clickable */}
                          <div
                            title={`Stage: ${item.status === "no_show" ? "No Show" : formatStatusLabel(item.status)}${getLatestMeetingSnippet(item) ? ` - ${getLatestMeetingSnippet(item)}` : ""}`}
                            className="text-[11px] text-gray-500 dark:text-neutral-400 truncate mt-0.5 flex items-center gap-1.5"
                          >
                            <span className="font-semibold text-gray-700 dark:text-neutral-300 shrink-0">
                              [{item.status === "no_show" ? "No Show" : formatStatusLabel(item.status)}]:
                            </span>
                            <span className="truncate">
                              {getLatestMeetingSnippet(item) || "Sales meeting"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {lead ? (
                            <button
                              type="button"
                              onClick={() => setSelectedLead(lead)}
                              className="text-left font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer"
                              title="View Lead Details"
                            >
                              {lead.name}
                            </button>
                          ) : (
                            <div className="font-semibold text-gray-900 dark:text-white">{client?.name || "Unlinked"}</div>
                          )}
                          <div className="text-[11px] text-gray-500">{client ? "Client" : lead ? "Lead" : "General"}</div>
                        </td>
                        <td className="py-3.5 px-4 capitalize font-semibold text-gray-700 dark:text-neutral-200">{item.meeting_type}</td>
                        <td className="py-3.5 px-4 text-gray-500 text-xs whitespace-nowrap">
                          <div>{new Date(item.scheduled_at).toLocaleString("en-IN")}</div>
                          <div className="text-[11px] text-gray-400">{item.duration_minutes || 30} mins</div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            item.status === "completed"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : item.status === "cancelled" || item.status === "no_show"
                              ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300"
                              : isOverdue
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
                          }`}>
                            {item.status === "no_show" ? "No Show" : formatStatusLabel(item.status)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap min-w-[260px]">
                          <div className="flex items-center justify-end gap-1.5 shrink-0">
                            {contactPhone && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cleanPhone = contactPhone.replace(/[^0-9]/g, "");
                                    const name = client?.name || lead?.name || "there";
                                    const linkNote = effectiveMeetLink ? ` Meeting link: ${effectiveMeetLink}` : "";
                                    const text = encodeURIComponent(`Hi ${name}, quick check regarding our sales meeting "${item.title}".${linkNote} Please let me know if you need any info before our discussion.`);
                                    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank", "noopener,noreferrer");
                                  }}
                                  className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition shrink-0 cursor-pointer"
                                  title="Chat on WhatsApp"
                                  aria-label="Chat on WhatsApp"
                                >
                                  <WhatsAppIcon className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={`tel:${contactPhone}`}
                                  className="p-1.5 rounded-lg text-orange-600 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 transition shrink-0"
                                  title="Call Contact"
                                  aria-label="Call Contact"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              </>
                            )}
                            {effectiveMeetLink && item.status !== "completed" && item.status !== "no_show" && item.status !== "cancelled" && (
                              <a
                                href={effectiveMeetLink.startsWith("http") ? effectiveMeetLink : `https://${effectiveMeetLink}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition shrink-0 inline-flex items-center justify-center cursor-pointer shadow-2xs"
                                title={`Join Meeting (${effectiveMeetLink})`}
                                aria-label="Join Meeting"
                              >
                                <Video className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {/* Dedicated Stage & History Modal Button */}
                            <button
                              type="button"
                              onClick={() => openStageModal(item, "meeting")}
                              className="p-1.5 rounded-lg text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition shrink-0 cursor-pointer"
                              title="Stage & Notes History"
                              aria-label="Stage & Notes History"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            {item.status === "scheduled" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openSalesMeetingRescheduleModal(item)}
                                  className="p-1.5 rounded-lg text-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition shrink-0 cursor-pointer"
                                  title="Reschedule Meeting"
                                  aria-label="Reschedule Meeting"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openStageModal(item, "meeting", "completed")}
                                  className="p-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition shrink-0 cursor-pointer"
                                  title="Mark as Completed (record outcome note)"
                                  aria-label="Mark as Completed"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openStageModal(item, "meeting", "no_show")}
                                  className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0 cursor-pointer"
                                  title="Mark as No Show"
                                  aria-label="Mark as No Show"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {/* Delete Meeting */}
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this sales meeting?")) {
                                  onDeleteSalesMeeting?.(item.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition shrink-0 cursor-pointer"
                              title="Delete Meeting"
                              aria-label="Delete Meeting"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ResponsiveTableContainer>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#211d14]/60 text-xs">
                <div className="text-gray-500 dark:text-neutral-400 flex items-center gap-1.5 flex-wrap">
                  <span>Showing</span>
                  <span className="font-bold text-gray-800 dark:text-white">{meetingPageStart}</span>
                  <span>to</span>
                  <span className="font-bold text-gray-800 dark:text-white">{meetingPageEnd}</span>
                  <span>of</span>
                  <span className="font-bold text-gray-800 dark:text-white">{meetingTotal}</span>
                  <span>meetings</span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
                    <span className="hidden xs:inline">Rows per page:</span>
                    <select
                      value={meetingPageSize}
                      onChange={(e) => {
                        setMeetingPageSize(Number(e.target.value));
                        setMeetingPage(1);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-neutral-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                      aria-label="Meetings per page"
                    >
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                      <option value={50}>50 / page</option>
                      <option value={100}>100 / page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setMeetingPage((p) => Math.max(1, p - 1))}
                      disabled={safeMeetingPage <= 1}
                      className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      title="Previous Page"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    {Array.from({ length: meetingPageCount }, (_, i) => i + 1)
                      .filter((page) => {
                        if (meetingPageCount <= 5) return true;
                        if (page === 1 || page === meetingPageCount) return true;
                        return Math.abs(page - safeMeetingPage) <= 1;
                      })
                      .reduce((acc, page, idx, arr) => {
                        if (idx > 0 && page - arr[idx - 1] > 1) {
                          acc.push("...");
                        }
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === "..." ? (
                          <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 font-bold select-none">
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${item}`}
                            type="button"
                            onClick={() => setMeetingPage(item)}
                            className={`min-w-[28px] h-7 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                              safeMeetingPage === item
                                ? "bg-orange-600 text-white shadow-2xs"
                                : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}

                    <button
                      type="button"
                      onClick={() => setMeetingPage((p) => Math.min(meetingPageCount, p + 1))}
                      disabled={safeMeetingPage >= meetingPageCount}
                      className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      title="Next Page"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 6. Lead Detail Drawer / Modal with Activity Timeline */}
      {selectedLead && (
        <div
          data-modal-overlay="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedLead(null);
          }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg max-h-[82vh] rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] p-4 sm:p-5 pb-3 shrink-0">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">{selectedLead.name}</h3>
                <span className="text-xs text-gray-500 dark:text-neutral-400">Lead Details & Timeline</span>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 no-scrollbar">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="text-gray-400 text-[10px] block">Phone Number</span>
                {selectedLead.phone ? (
                  <a
                    href={`tel:${selectedLead.phone.replace(/[^0-9+]/g, "")}`}
                    className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline font-mono inline-flex items-center gap-1.5 mt-0.5 cursor-pointer"
                    title={`Click to call ${selectedLead.phone}`}
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedLead.phone}</span>
                  </a>
                ) : (
                  <span className="font-semibold text-gray-400 font-mono">N/A</span>
                )}
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="text-gray-400 text-[10px] block">Email Address</span>
                {selectedLead.email ? (
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate inline-flex items-center gap-1.5 mt-0.5 max-w-full cursor-pointer"
                    title={`Click to email ${selectedLead.email}`}
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{selectedLead.email}</span>
                  </a>
                ) : (
                  <span className="font-semibold text-gray-400">N/A</span>
                )}
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="text-gray-400 text-[10px] block">Service Required</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {selectedLead.service || "Web Development"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="text-gray-400 text-[10px] block">Budget Range</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {getLeadBudget(selectedLead)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="text-gray-400 text-[10px] block">City & State</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {getLeadLocation(selectedLead)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="text-gray-400 text-[10px] block">Lead Source</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {selectedLead.source || "Website"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs">
              <span className="text-gray-400 text-[10px] block font-semibold uppercase mb-2">
                Form Answers
              </span>
              {getLeadFormAnswers(selectedLead).length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-100 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40">
                  {getLeadFormAnswers(selectedLead).map((answer) => (
                    <div
                      key={answer.label}
                      className="grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)] gap-1 sm:gap-3 px-3 py-2 border-b border-gray-100 dark:border-slate-700 last:border-b-0"
                    >
                      <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold break-all" title={answer.label}>
                        {answer.label}
                      </span>
                      <span
                        className="font-semibold text-gray-800 dark:text-white break-words font-mono"
                        title={answer.value}
                      >
                        {answer.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="font-semibold text-gray-800 dark:text-white">-</span>
              )}
            </div>

            {getLeadDisplayNotes(selectedLead) && (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs">
                <span className="text-gray-400 text-[10px] block font-semibold uppercase mb-1">
                  Inquiry Notes
                </span>
                <p className="text-gray-700 dark:text-neutral-300">{getLeadDisplayNotes(selectedLead)}</p>
              </div>
            )}

            {selectedLeadIsLost && (
              <div className="p-3.5 rounded-xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span className="uppercase text-[10.5px] tracking-wide">Lead Lost Reason</span>
                </div>
                <div className="bg-white/90 dark:bg-[#211d14]/80 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                  <p className="text-rose-700 dark:text-rose-300 font-semibold leading-relaxed">
                    {selectedLeadLossReason || "No specific reason was provided when marking this lead as lost."}
                  </p>
                </div>
              </div>
            )}

            {(selectedLeadActivity.meetings.length > 0 || selectedLeadActivity.followUps.length > 0) && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Linked Engagements ({selectedLeadActivity.meetings.length + selectedLeadActivity.followUps.length})
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        openLeadFollowUpModal(selectedLead);
                        setSelectedLead(null);
                      }}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      + Follow-up
                    </button>
                    <span className="text-gray-300">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSalesMeetingForm((prev) => ({
                          ...prev,
                          lead_id: selectedLead.id,
                          title: `Sales call: ${selectedLead.name}`,
                          meeting_link: defaultMeetLink || "https://meet.google.com/new",
                        }));
                        setShowSalesMeetingModal(true);
                        setSelectedLead(null);
                      }}
                      className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                    >
                      + Meeting
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedLeadActivity.meetings.slice(0, 2).map((m) => (
                    <div
                      key={m.id}
                      title={`Stage: ${m.status === "no_show" ? "No Show" : formatStatusLabel(m.status)}${getLatestMeetingSnippet(m) ? ` - ${getLatestMeetingSnippet(m)}` : ""}`}
                      className="p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-blue-900 dark:text-blue-200 truncate flex items-center gap-1">
                          <Video className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">{m.title}</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shrink-0">
                          {m.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-neutral-400 flex items-center justify-between">
                        <span>{new Date(m.scheduled_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        {m.meeting_link && (
                          <a
                            href={m.meeting_link.startsWith("http") ? m.meeting_link : `https://${m.meeting_link}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-blue-600 hover:underline"
                          >
                            Join
                          </a>
                        )}
                      </div>
                    </div>
                  ))}

                  {selectedLeadActivity.followUps.slice(0, 2).map((f) => (
                    <div
                      key={f.id}
                      title={`Stage: ${formatStatusLabel(f.status)}${getLatestNoteSnippet(f.notes) ? ` - ${getLatestNoteSnippet(f.notes)}` : ""}`}
                      className="p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-amber-900 dark:text-amber-200 truncate flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate">{f.title}</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
                          {f.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-neutral-400 flex items-center justify-between">
                        <span>{new Date(f.due_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="capitalize font-semibold text-gray-600 dark:text-neutral-300">{f.channel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">
                Activity History
              </h4>
              <ActivityTimeline
                isDark={isDark}
                events={[
                  {
                    type: "lead_created",
                    title: "Lead Captured",
                    description: `Captured via ${selectedLead.source || "Website"} inquiry form.`,
                    time: new Date(selectedLead.created_at || Date.now()).toLocaleDateString(),
                  },
                  ...selectedLeadActivity.meetings.map((item) => ({
                    type: "meeting",
                    title: `Meeting: ${item.title}`,
                    description: `${item.status || "scheduled"} - ${item.outcome || item.agenda || "Sales meeting"}`,
                    time: new Date(item.scheduled_at || item.created_at || Date.now()).toLocaleString("en-IN"),
                  })),
                  ...selectedLeadActivity.followUps.map((item) => ({
                    type: "followup",
                    title: `Follow-up: ${item.title}`,
                    description: `${item.status || "pending"} - ${item.notes || item.channel || "Sales follow-up"}`,
                    time: new Date(item.completed_at || item.due_at || item.created_at || Date.now()).toLocaleString("en-IN"),
                  })),
                ]}
              />
            </div>

            </div>

            <div className="flex items-center justify-between gap-2 p-4 border-t border-gray-100 dark:border-[#3a3020] bg-white dark:bg-[#18150f] shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(selectedLead);
                    setSelectedLead(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  title="Edit Lead Details"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Lead</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedLead.phone && (
                  <button
                    type="button"
                    onClick={() => handleWhatsAppClick(selectedLead)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition flex items-center gap-1.5 cursor-pointer"
                    title="Chat on WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                )}

                {selectedLeadIsLost && (
                  <button
                    type="button"
                    onClick={() => handleReopenLead(selectedLead, selectedLeadDeal)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Restore Lead back to Active"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Lead to Active</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Add Lead Modal */}
      {showAddLeadModal && (
        <div data-modal-overlay="true" className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200">
          <form
            onSubmit={handleAddLeadSubmit}
            className="w-full max-w-xl max-h-[82vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-orange-50/70 via-amber-50/25 to-transparent dark:from-orange-950/25 dark:via-transparent dark:to-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">Add New Lead</h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Capture inbound inquiry or outbound sales prospect</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLeadModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5 text-xs flex-1 overflow-y-auto no-scrollbar">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <Users className="w-3.5 h-3.5 text-orange-500" />
                  <span>Full Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white transition shadow-2xs font-medium"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Phone Number</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white transition shadow-2xs font-mono font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white transition shadow-2xs font-medium"
                  />
                </div>
              </div>

              {/* Service & Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Service Required</span>
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.service}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, service: e.target.value })}
                    placeholder="e.g. Web Development"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white transition shadow-2xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Target className="w-3.5 h-3.5 text-amber-500" />
                    <span>Lead Source</span>
                  </label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white font-medium transition shadow-2xs"
                  >
                    <option value="Website">Website</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                  </select>
                </div>
              </div>

              {/* Notes / Requirements */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                  <span>Notes / Requirements</span>
                </label>
                <textarea
                  rows={3}
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="Customer requirements summary, budget discussed, timeline..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white transition shadow-2xs font-normal text-xs resize-y"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0">
              <button
                type="button"
                onClick={() => setShowAddLeadModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25 hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Save Lead</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7b. Add Deal to Pipeline Modal */}
      {showAddDealModal && (
        <div data-modal-overlay="true" className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateDealSubmit}
            className="w-full max-w-xl max-h-[82vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-emerald-50/70 via-teal-50/25 to-transparent dark:from-emerald-950/25 dark:via-transparent dark:to-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">New Sales Pipeline Deal</h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Add an active commercial opportunity with value forecast</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDealModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Content Body */}
            <div className="p-5 space-y-3.5 text-xs flex-1 overflow-y-auto no-scrollbar">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Deal Title</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDealForm.title}
                  onChange={(e) => setNewDealForm({ ...newDealForm, title: e.target.value })}
                  placeholder="e.g. Acme Corp - E-Commerce Website & Portal"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Average Deal Value (INR)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newDealForm.deal_value}
                      onChange={(e) => setNewDealForm({ ...newDealForm, deal_value: e.target.value })}
                      placeholder="100000"
                      className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 font-mono font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Pipeline Stage</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Contacted</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>Service</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newDealForm.service}
                    onChange={(e) => setNewDealForm({ ...newDealForm, service: e.target.value })}
                    required
                    placeholder="e.g. Web Development"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <DurationSelectField
                    label="Meeting Duration"
                    value={newDealForm.duration_minutes}
                    onChange={(value) => setNewDealForm({ ...newDealForm, duration_minutes: value })}
                  />
                </div>
              </div>

              {/* Meeting Schedule - Full Width Card */}
              <div>
                <SplitDateTimeField
                  label="Meeting Schedule"
                  required
                  value={newDealForm.meeting_scheduled_at}
                  onChange={(value) => setNewDealForm({ ...newDealForm, meeting_scheduled_at: value })}
                  reminderValue={newDealForm.reminder_before_minutes}
                  onReminderChange={(value) => setNewDealForm({ ...newDealForm, reminder_before_minutes: value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <Video className="w-3.5 h-3.5 text-blue-500" />
                  <span>Google Meet Link</span>
                </label>
                <input
                  type="url"
                  required
                  readOnly
                  value={newDealForm.meeting_link}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-neutral-400 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <Users className="w-3.5 h-3.5 text-orange-500" />
                  <span>Linked Lead</span>
                </label>
                {newDealForm.lead_id ? (
                  <div className="px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-semibold flex items-center justify-between">
                    <span className="truncate">{leads.find((l) => l.id === newDealForm.lead_id)?.name || "Selected lead"}</span>
                    <button
                      type="button"
                      onClick={() => setNewDealForm({ ...newDealForm, lead_id: "" })}
                      className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline shrink-0 ml-2 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <SearchableLeadSelect
                    leads={leads}
                    value={newDealForm.lead_id}
                    onChange={(selId, matchedLead) => {
                      setNewDealForm({
                        ...newDealForm,
                        lead_id: selId,
                        title: newDealForm.title || (matchedLead ? `${matchedLead.name} - ${matchedLead.service || "Project"}` : ""),
                        service: matchedLead?.service || newDealForm.service,
                      });
                    }}
                    placeholder="Search lead by name, phone..."
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                  <span>Deal Notes / Strategy</span>
                </label>
                <textarea
                  rows={2}
                  value={newDealForm.notes}
                  onChange={(e) => setNewDealForm({ ...newDealForm, notes: e.target.value })}
                  placeholder="Key deliverables, client expectations, stakeholders involved..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs font-normal text-xs resize-y"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0">
              <button
                type="button"
                onClick={() => setShowAddDealModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Pipeline Deal</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {showCommercialModal && (
        <div data-modal-overlay="true" className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateCommercialSubmit}
            className="w-full max-w-6xl max-h-[82vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-orange-50/70 via-amber-50/25 to-transparent dark:from-orange-950/25 dark:via-transparent dark:to-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">Sales Quotation / Agreement</h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Quotation is the sales document; agreement is final signing before deal won</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCommercialModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs flex-1 overflow-y-auto no-scrollbar">

            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs">
              {[
                ["proposal", "Quotation"],
                ["agreement", "Agreement"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCommercialType(id)}
                  className={`flex-1 rounded-lg px-3 py-2 font-bold transition ${
                    commercialType === id ? "bg-white dark:bg-slate-900 text-orange-600 shadow-2xs" : "text-gray-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-orange-100 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/10 p-3 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-white">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    AI Draft Assistant
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                    Isolated history for this deal and {commercialType === "agreement" ? "agreement" : "quotation"} only.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  <span className="px-2 py-1 rounded-full bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/40 text-orange-700 dark:text-orange-300">
                    {aiDocTracking.status || "draft"}
                  </span>
                  {aiDocTracking.sent_at && (
                    <span className="px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                      Sent tracked
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-3">
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={aiDocInput}
                    onChange={(e) => setAiDocInput(e.target.value)}
                    placeholder="Type requirement notes, meeting summary, pricing instruction, special terms..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={startAiVoiceInput}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                        aiDocListening
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-white dark:bg-slate-900 text-gray-700 dark:text-neutral-200 border-orange-100 dark:border-orange-900/40"
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      {aiDocListening ? "Listening..." : "Voice"}
                    </button>
                    <label className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-white dark:bg-slate-900 text-gray-700 dark:text-neutral-200 border border-orange-100 dark:border-orange-900/40 cursor-pointer">
                      <Paperclip className="w-3.5 h-3.5" />
                      Upload Doc/Image
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.txt,.doc,.docx,image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => handleAiAttachmentChange(e.target.files)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateAiDocumentDraft}
                      disabled={aiDocLoading || !commercialForm.deal_id}
                      className="px-3 py-1.5 rounded-xl text-xs font-black bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {aiDocLoading ? "Generating..." : "Generate Draft"}
                    </button>
                  </div>
                  {aiDocAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {aiDocAttachments.map((item, index) => (
                        <span key={`${item.name}-${index}`} className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/40 text-[10px] font-semibold text-gray-600 dark:text-neutral-300">
                          {item.name}
                        </span>
                      ))}
                      <button type="button" onClick={() => setAiDocAttachments([])} className="text-[10px] font-bold text-red-600 px-2">
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/40 p-2.5 min-h-[150px] max-h-[240px] overflow-y-auto space-y-2">
                  {aiDocMessages.length === 0 && !aiDocDraft ? (
                    <div className="h-full min-h-[120px] flex items-center justify-center text-center text-[11px] text-gray-400 px-4">
                      Client-specific AI chat history will appear here. It will not mix with other deals.
                    </div>
                  ) : (
                    <>
                      {aiDocMessages.slice(-6).map((msg, index) => (
                        <div key={msg.id || index} className={`p-2 rounded-lg text-[11px] ${
                          msg.role === "assistant"
                            ? "bg-orange-50 dark:bg-orange-950/30 text-gray-700 dark:text-neutral-200"
                            : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-neutral-200"
                        }`}>
                          <div className="font-black uppercase text-[9px] text-gray-400 mb-1">{msg.role}</div>
                          <div className="whitespace-pre-wrap line-clamp-5">{msg.content}</div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {aiDocDraft && (
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/40 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-black text-gray-900 dark:text-white">Editable AI Draft Preview</div>
                    <button
                      type="button"
                      onClick={() => applyAiDraftToCommercialForm()}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black cursor-pointer"
                    >
                      Insert Again
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-neutral-300">
                    <div><span className="font-bold">Title:</span> {aiDocDraft.title}</div>
                    <div><span className="font-bold">Terms:</span> {aiDocDraft.commercial_terms}</div>
                    <div className="sm:col-span-2"><span className="font-bold">Scope:</span> {aiDocDraft.scope_of_work}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-4 items-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Linked Deal *</label>
                <div className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-neutral-200 font-semibold">
                  {deals.find((deal) => deal.id === commercialForm.deal_id)?.title || "No deal available"}
                </div>
              </div>

              {commercialType === "agreement" && (
                <>
                  <div>
                    <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Agreement Number</label>
                    <input
                      type="text"
                      value={commercialForm.agreement_number}
                      onChange={(e) => setCommercialForm({ ...commercialForm, agreement_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Quotation Ref</label>
                    <select
                      value={commercialForm.proposal_id}
                      onChange={(e) => setCommercialForm({ ...commercialForm, proposal_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                    >
                      <option value="">No quotation ref</option>
                      {proposals.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                    </select>
                  </div>
                </>
              )}

              {commercialType !== "agreement" && (
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Commercial Value *</label>
                  <input
                    type="number"
                    required
                    value={commercialForm.amount}
                    onChange={(e) => setCommercialForm({ ...commercialForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  {commercialType === "agreement" ? "Start Date" : "Valid Until"}
                </label>
                <input
                  type="date"
                  value={commercialType === "agreement" ? commercialForm.start_date : commercialForm.valid_until}
                  onChange={(e) =>
                    setCommercialForm({
                      ...commercialForm,
                      [commercialType === "agreement" ? "start_date" : "valid_until"]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              {commercialType === "agreement" && (
                <div>
                  <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">End Date</label>
                  <input
                    type="date"
                    value={commercialForm.end_date}
                    onChange={(e) => setCommercialForm({ ...commercialForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Status</label>
                <select
                  value={commercialForm.status}
                  onChange={(e) => setCommercialForm({ ...commercialForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  {commercialType === "agreement" ? <option value="signed">Signed</option> : <option value="accepted">Accepted</option>}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Title *</label>
                <input
                  type="text"
                  required
                  value={commercialForm.title}
                  onChange={(e) => setCommercialForm({ ...commercialForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Scope of Work</label>
                <textarea
                  rows={3}
                  value={commercialForm.scope_of_work}
                  onChange={(e) => setCommercialForm({ ...commercialForm, scope_of_work: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">
                  {commercialType === "agreement" ? "Commercial Terms" : "Deliverables"}
                </label>
                <textarea
                  rows={3}
                  value={commercialType === "agreement" ? commercialForm.commercial_terms : commercialForm.deliverables}
                  onChange={(e) =>
                    setCommercialForm({
                      ...commercialForm,
                      [commercialType === "agreement" ? "commercial_terms" : "deliverables"]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>
            </div>
            <CommercialDocumentPreview
              form={commercialForm}
              type={commercialType}
              deal={deals.find((deal) => deal.id === commercialForm.deal_id)}
              lead={leads.find((lead) => lead.id === deals.find((deal) => deal.id === commercialForm.deal_id)?.lead_id)}
            />
            </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 px-5 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0">
              <button
                type="button"
                onClick={() => setShowCommercialModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePreviewCommercialPdf}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 shrink-0" />
                <span>Preview PDF</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25 hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>Save {commercialType === "agreement" ? "Agreement" : "Quotation"}</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleCreateCommercialSubmit(e, true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Save & WhatsApp</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sales Invoice Modal */}
      {showInvoiceModal && (
        <div data-modal-overlay="true" className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateInvoiceSubmit}
            className="w-full max-w-xl max-h-[82vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-purple-50/70 via-indigo-50/25 to-transparent dark:from-purple-950/25 dark:via-transparent dark:to-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25 shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">Generate Sales Invoice</h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Create and issue an official tax invoice linked to this pipeline deal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5 text-xs flex-1 overflow-y-auto no-scrollbar">

            {/* Linked Deal Context Card */}
            {invoiceDeal && (
              <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">Linked Deal</div>
                  <div className="font-bold text-xs text-gray-900 dark:text-white">
                    {invoiceDeal.title || invoiceDeal.client_name || "Client Deal"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-400">Deal Value</div>
                  <div className="font-black text-xs text-purple-700 dark:text-purple-300">
                    ₹{Number(invoiceDeal.deal_value || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Invoice Number *</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.invoice_number}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Milestone Stage</label>
                <select
                  value={invoiceForm.milestone_type}
                  onChange={(e) => handleInvoiceMilestoneChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-semibold cursor-pointer"
                >
                  <option value="advance">Advance (40%)</option>
                  <option value="milestone">Sprint Milestone (30%)</option>
                  <option value="final">Final Delivery (30%)</option>
                  <option value="full">Full Payment (100%)</option>
                  <option value="monthly_retainer">Monthly Retainer</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Invoice Title / Description *</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.title}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Subtotal (Excl. Tax) ₹ *</label>
                <input
                  type="number"
                  required
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Due Date</label>
                <input
                  type="date"
                  value={invoiceForm.due_date}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                />
              </div>

              {/* Tax & Total Calculation Summary */}
              <div className="sm:col-span-2 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200/70 dark:border-slate-700/60 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500 dark:text-neutral-400">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono font-semibold">₹{(Number(invoiceForm.amount) || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-neutral-400">
                  <span>GST (18% Standard):</span>
                  <span className="font-mono font-semibold">₹{Math.round((Number(invoiceForm.amount) || 0) * 0.18).toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-1.5 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center font-bold text-gray-900 dark:text-white">
                  <span>Total Invoiced (Inc. Tax):</span>
                  <span className="font-mono text-sm text-purple-600 dark:text-purple-400">
                    ₹{Math.round((Number(invoiceForm.amount) || 0) * 1.18).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1 text-gray-700 dark:text-neutral-300">Notes & Payment Terms</label>
                <textarea
                  rows={2}
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 px-5 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/25 hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <DollarSign className="w-3.5 h-3.5 shrink-0" />
                <span>Issue Invoice</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleCreateInvoiceSubmit(e, true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Issue & WhatsApp</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {showFollowUpModal && (
        <div data-modal-overlay="true" className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
          <form
            onSubmit={handleCreateFollowUpSubmit}
            className="w-full max-w-xl max-h-[82vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-blue-50/60 via-indigo-50/20 to-transparent dark:from-blue-950/25 dark:via-transparent dark:to-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">Create Sales Follow-up</h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Schedule timely follow-up & track prospect responses</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFollowUpModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-5 space-y-3.5 text-xs flex-1 overflow-y-auto no-scrollbar">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Title</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={followUpForm.title}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, title: e.target.value })}
                  placeholder="e.g. Follow up for quotation approval"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-2xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Users className="w-3.5 h-3.5 text-orange-500" />
                    <span>Lead</span>
                  </label>
                  <SearchableLeadSelect
                    leads={leads}
                    value={followUpForm.lead_id}
                    onChange={(leadId, lead) => {
                      setFollowUpForm({
                        ...followUpForm,
                        lead_id: leadId,
                        title: followUpForm.title === "Follow up for quotation approval" || !followUpForm.title
                          ? (lead ? `Follow up: ${lead.name}` : followUpForm.title)
                          : followUpForm.title,
                      });
                    }}
                    placeholder="Search by name, phone..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Channel</span>
                  </label>
                  <select
                    value={followUpForm.channel}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, channel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-2xs cursor-pointer"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">In-Person / Meeting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {followUpForm.deal_id && (
                <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Linked Pipeline Deal (Read Only)</span>
                  </div>
                  <div className="font-semibold text-gray-800 dark:text-neutral-200 text-xs">
                    {deals.find((deal) => deal.id === followUpForm.deal_id)?.title || "Selected pipeline deal"}
                  </div>
                </div>
              )}

              <div>
                <SplitDateTimeField
                  label="Due Schedule"
                  required
                  value={followUpForm.due_at}
                  onChange={(value) => setFollowUpForm({ ...followUpForm, due_at: value })}
                  reminderValue={followUpForm.reminder_before_minutes}
                  onReminderChange={(value) => setFollowUpForm({ ...followUpForm, reminder_before_minutes: value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                  <span>Notes & Action Plan</span>
                </label>
                <textarea
                  rows={3}
                  value={followUpForm.notes}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                  placeholder="e.g. Call client to discuss revised quotation, milestone breakdown, and timeline confirmation..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-2xs font-normal text-xs resize-y"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0">
              <button
                type="button"
                onClick={() => setShowFollowUpModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Follow-up</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {showRescheduleModal && (rescheduleTarget || salesMeetingRescheduleTarget) && (
        <div data-modal-overlay="true" className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
          <form
            onSubmit={handleRescheduleSubmit}
            className="w-full max-w-lg max-h-[82vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-amber-50/60 via-orange-50/20 to-transparent dark:from-amber-950/25 dark:via-transparent dark:to-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">
                    {salesMeetingRescheduleTarget ? "Reschedule Meeting" : "Reschedule Follow-up"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5 truncate max-w-xs">
                    {(salesMeetingRescheduleTarget || rescheduleTarget)?.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5 text-xs flex-1 overflow-y-auto no-scrollbar">
              <div>
                <SplitDateTimeField
                  label={salesMeetingRescheduleTarget ? "New Meeting Schedule" : "New Due Schedule"}
                  required
                  value={rescheduleForm.due_at}
                  onChange={(value) => setRescheduleForm({ ...rescheduleForm, due_at: value })}
                  reminderValue={rescheduleForm.reminder_before_minutes}
                  onReminderChange={(value) => setRescheduleForm({ ...rescheduleForm, reminder_before_minutes: value })}
                />
              </div>

              {salesMeetingRescheduleTarget && (
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Video className="w-3.5 h-3.5 text-blue-500" />
                    <span>Google Meet Link</span>
                  </label>
                  <input
                    type="url"
                    value={rescheduleForm.meeting_link}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, meeting_link: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition shadow-2xs font-medium"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                  <span>Reschedule Notes / Reason</span>
                </label>
                <textarea
                  rows={3}
                  value={rescheduleForm.notes}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, notes: e.target.value })}
                  placeholder="e.g. Client requested a different time slot due to meeting conflict..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition shadow-2xs font-normal text-xs resize-y"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0">
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/25 hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Confirm Reschedule</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dedicated Stage & Notes History Modal */}
      {stageModalTarget && (
        <div data-modal-overlay="true" className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl overflow-hidden transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[82vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-orange-50/70 via-amber-50/30 to-transparent dark:from-orange-950/20 dark:via-transparent dark:to-transparent shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300">
                      {stageModalTarget.type === "meeting" ? "Meeting Stage & History" : "Follow-up Stage & History"}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      ["done", "completed"].includes(stageModalTarget.item.status)
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : ["missed", "no_show"].includes(stageModalTarget.item.status)
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    }`}>
                      Current: {formatStatusLabel(stageModalTarget.item.status)}
                    </span>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate mt-0.5">
                    {stageModalTarget.item.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStageModalTarget(null);
                  setStageModalNote("");
                }}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs no-scrollbar">
              {/* Linked Account Card */}
              {(() => {
                const lead = leads.find((l) => l.id === stageModalTarget.item.lead_id);
                const client = clients.find((c) => c.id === stageModalTarget.item.client_id);
                const contact = lead || client;
                const contactPhone = client?.phone || lead?.phone || "";
                return (
                  <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {contact?.name?.charAt(0)?.toUpperCase() || "C"}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{contact?.name || "Unlinked Contact"}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{contactPhone || contact?.email || "No contact info"}</div>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-gray-500">
                      <div className="font-semibold text-gray-700 dark:text-neutral-300">
                        {stageModalTarget.type === "meeting"
                          ? (stageModalTarget.item.scheduled_at ? new Date(stageModalTarget.item.scheduled_at).toLocaleString("en-IN") : "-")
                          : (stageModalTarget.item.due_at ? new Date(stageModalTarget.item.due_at).toLocaleString("en-IN") : "-")}
                      </div>
                      <div>{stageModalTarget.type === "meeting" ? `Duration: ${stageModalTarget.item.duration_minutes || 30}m` : `Channel: ${stageModalTarget.item.channel || "General"}`}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Stage Update Section */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-200/70 dark:border-orange-950/50 space-y-3.5 shadow-2xs">
                <div>
                  <label className="block font-bold text-gray-900 dark:text-white mb-2">
                    Select New Stage / Status
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(stageModalTarget.type === "meeting" ? MEETING_STAGES : FOLLOWUP_STAGES).map((stage) => {
                      const isSelected = stageModalStatus === stage.id;
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => setStageModalStatus(stage.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border cursor-pointer ${
                            isSelected
                              ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                              : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-neutral-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100"
                          }`}
                        >
                          {stage.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Note Field */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-orange-600" />
                    <span>
                      {["done", "completed"].includes(stageModalStatus)
                        ? "Done Note / Outcome (Required for Done History)"
                        : "Update Note / Discussion Remarks"}
                    </span>
                    {["done", "completed"].includes(stageModalStatus) && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        Done History
                      </span>
                    )}
                  </label>
                  <textarea
                    rows={3}
                    value={stageModalNote}
                    onChange={(e) => setStageModalNote(e.target.value)}
                    placeholder={
                      ["done", "completed"].includes(stageModalStatus)
                        ? "Describe completion details (e.g. Client agreed on quotation, advance payment scheduled for Monday...)"
                        : "Add update note (e.g. Spoke with Rahul, sent company deck, follow-up scheduled...)"
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 transition resize-y ${
                      ["done", "completed"].includes(stageModalStatus)
                        ? "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 focus:ring-emerald-500/30 focus:border-emerald-500"
                        : "bg-gray-50/80 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 focus:ring-orange-500/30 focus:border-orange-500"
                    }`}
                  />
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                    {["done", "completed"].includes(stageModalStatus)
                      ? "This note will be permanently logged in the history timeline so you remember why & how it was completed."
                      : "Timestamp, selected stage, and this note will be appended into the history timeline."}
                  </p>
                </div>
              </div>

              {/* History Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-gray-900 dark:text-white">
                      Previous Notes & Stage History
                    </span>
                  </div>
                  {(() => {
                    const hist = stageModalTarget.type === "meeting"
                      ? parseNotesHistory(getMeetingFullNotes(stageModalTarget.item))
                      : parseNotesHistory(stageModalTarget.item.notes);
                    return hist.length > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-[10px] font-bold text-gray-600 dark:text-neutral-400">
                        {hist.length} updates logged
                      </span>
                    ) : null;
                  })()}
                </div>

                {(() => {
                  const hist = stageModalTarget.type === "meeting"
                    ? parseNotesHistory(getMeetingFullNotes(stageModalTarget.item))
                    : parseNotesHistory(stageModalTarget.item.notes);

                  if (hist.length === 0) {
                    return (
                      <div className="p-6 text-center rounded-2xl bg-gray-50/60 dark:bg-slate-800/30 border border-dashed border-gray-200 dark:border-slate-700 text-gray-400 text-xs">
                        No previous stage history or notes found yet.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {hist.map((entry, idx) => (
                        <div
                          key={entry.id || idx}
                          className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/70 border border-gray-200/80 dark:border-slate-700/80 space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-800 dark:text-neutral-200">
                                {entry.timestamp}
                              </span>
                              {entry.stage && (
                                <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-bold text-[10px] uppercase">
                                  {entry.stage}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(entry.note || entry.raw);
                              }}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200 transition cursor-pointer"
                              title="Copy note"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-xs text-gray-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                            {entry.note || entry.raw}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0">
              <button
                type="button"
                onClick={() => {
                  setStageModalTarget(null);
                  setStageModalNote("");
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              {["done", "completed"].includes(stageModalStatus) && (
                <button
                  type="button"
                  onClick={() => handleSaveStageModal(null, true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                >
                  Quick Done (without note)
                </button>
              )}
              <button
                type="button"
                onClick={(e) => handleSaveStageModal(e, false)}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center gap-1.5 cursor-pointer ${
                  ["done", "completed"].includes(stageModalStatus)
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25"
                    : "bg-orange-600 hover:bg-orange-700 shadow-orange-500/25"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {["done", "completed"].includes(stageModalStatus)
                    ? "Save & Mark Done"
                    : "Save Stage & Note"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showMeetingSettingsModal && (
        <div data-modal-overlay="true" className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl overflow-hidden transition-all animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-gray-50 via-slate-50 to-transparent dark:from-slate-900/40 dark:via-transparent dark:to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-800 dark:bg-slate-700 text-white flex items-center justify-center shadow-md shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Meeting Settings</h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Default Google Meet link used in pipeline meetings.</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowMeetingSettingsModal(false)} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white transition cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <label className="block font-semibold text-gray-700 dark:text-neutral-200">Default Google Meet Link</label>
              <input
                type="url"
                required
                value={defaultMeetLink}
                onChange={(e) => setDefaultMeetLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition shadow-2xs font-medium"
              />
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                This link is automatically applied to all sales meetings and shown in the meetings table.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712]">
              <button type="button" onClick={() => setDefaultMeetLink("https://meet.google.com/new")} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer">Reset Default</button>
              <button type="button" onClick={handleSaveMeetingSettings} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/25 transition cursor-pointer flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Save & Sync to All Meetings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showSalesMeetingModal && (
        <div data-modal-overlay="true" className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
          <form
            onSubmit={handleCreateSalesMeetingSubmit}
            className="w-full max-w-xl max-h-[82vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-emerald-50/60 via-teal-50/20 to-transparent dark:from-emerald-950/25 dark:via-transparent dark:to-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">Schedule Sales Meeting</h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Set up discovery, proposal, or closing call with prospect</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSalesMeetingModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-5 space-y-3.5 text-xs flex-1 overflow-y-auto no-scrollbar">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Title</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={salesMeetingForm.title}
                  onChange={(e) => setSalesMeetingForm({ ...salesMeetingForm, title: e.target.value })}
                  placeholder="e.g. Client requirement discovery call"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Users className="w-3.5 h-3.5 text-orange-500" />
                    <span>Lead</span>
                  </label>
                  <SearchableLeadSelect
                    leads={leads}
                    value={salesMeetingForm.lead_id}
                    onChange={(leadId, lead) => {
                      setSalesMeetingForm({
                        ...salesMeetingForm,
                        lead_id: leadId,
                        title: salesMeetingForm.title === "Client requirement discovery call" || !salesMeetingForm.title
                          ? (lead ? `Sales call: ${lead.name}` : salesMeetingForm.title)
                          : salesMeetingForm.title,
                      });
                    }}
                    placeholder="Search by name, phone..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Target className="w-3.5 h-3.5 text-blue-500" />
                    <span>Meeting Type</span>
                  </label>
                  <select
                    value={salesMeetingForm.meeting_type}
                    onChange={(e) => setSalesMeetingForm({ ...salesMeetingForm, meeting_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs cursor-pointer"
                  >
                    <option value="discovery">Discovery</option>
                    <option value="requirement">Requirement</option>
                    <option value="proposal">Quotation</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="handover">Handover</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <SplitDateTimeField
                  label="Schedule"
                  required
                  value={salesMeetingForm.scheduled_at}
                  onChange={(value) => setSalesMeetingForm({ ...salesMeetingForm, scheduled_at: value })}
                  reminderValue={salesMeetingForm.reminder_before_minutes}
                  onReminderChange={(value) => setSalesMeetingForm({ ...salesMeetingForm, reminder_before_minutes: value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Video className="w-3.5 h-3.5 text-blue-500" />
                    <span>Meeting Link</span>
                  </label>
                  <input
                    value={salesMeetingForm.meeting_link}
                    onChange={(e) => setSalesMeetingForm({ ...salesMeetingForm, meeting_link: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Duration</span>
                  </label>
                  <DurationSelectField
                    label={null}
                    value={salesMeetingForm.duration_minutes}
                    onChange={(value) => setSalesMeetingForm({ ...salesMeetingForm, duration_minutes: value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                  <span>Agenda & Discussion Plan</span>
                </label>
                <textarea
                  rows={3}
                  value={salesMeetingForm.agenda}
                  onChange={(e) => setSalesMeetingForm({ ...salesMeetingForm, agenda: e.target.value })}
                  placeholder="e.g. Requirement discovery, budget, timeline, decision maker, and next action."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-2xs font-normal text-xs resize-y"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0">
              <button
                type="button"
                onClick={() => setShowSalesMeetingModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Meeting</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 8. Edit Lead Modal */}
      {editingLead && (
        <div data-modal-overlay="true" className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-xl max-h-[82vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-amber-50/70 via-orange-50/25 to-transparent dark:from-amber-950/25 dark:via-transparent dark:to-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">Edit Lead Details</h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Update contact information, services, and requirements</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5 text-xs flex-1 overflow-y-auto no-scrollbar">
              {/* Client / Lead Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  <span>Client / Lead Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editLeadForm.name}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 dark:text-white transition shadow-2xs font-medium"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Phone (WhatsApp)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={editLeadForm.phone}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 dark:text-white transition shadow-2xs font-mono font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={editLeadForm.email}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 dark:text-white transition shadow-2xs font-medium"
                  />
                </div>
              </div>

              {/* Service Required */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Service Required</span>
                </label>
                <input
                  type="text"
                  value={editLeadForm.service}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, service: e.target.value })}
                  placeholder="e.g. Web Development"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 dark:text-white transition shadow-2xs font-medium"
                />
              </div>

              {/* Notes / Requirements */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                  <span>Notes / Requirements</span>
                </label>
                <textarea
                  rows={3}
                  value={editLeadForm.notes}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, notes: e.target.value })}
                  placeholder="Customer requirements summary..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 dark:text-white transition shadow-2xs font-normal text-xs resize-y"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0">
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/25 hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 9. Deal Details Modal */}
      {selectedDeal && (() => {
        const lead = leads.find((l) => l.id === selectedDeal.lead_id);
        const client = clients.find((c) => c.id === selectedDeal.client_id);
        const contactName = client?.name || lead?.name || selectedDeal.title?.split(" - ")[0] || "Client";
        const contactPhone = lead?.phone || client?.phone || "";
        const contactEmail = lead?.email || client?.email || "";
        const contactCompany = client?.company_name || lead?.company_name || "";
        const dealStage = selectedDeal.pipeline_stage || selectedDeal.stage || "contacted";
        const isLost = dealStage === "closed_lost";
        const isWon = dealStage === "closed_won";
        const dealValue = Number(selectedDeal.deal_value || selectedDeal.value || 0);

        const dealProposals = [...proposals, ...quotations].filter(
          (p) => p.deal_id === selectedDeal.id || (selectedDeal.lead_id && p.lead_id === selectedDeal.lead_id)
        );
        const dealAgreements = agreements.filter(
          (a) => a.deal_id === selectedDeal.id || (selectedDeal.client_id && a.client_id === selectedDeal.client_id)
        );
        const dealInvoices = invoices.filter(
          (i) => i.deal_id === selectedDeal.id || (selectedDeal.client_id && i.client_id === selectedDeal.client_id)
        );
        const dealMeetings = salesMeetings.filter(
          (m) => m.deal_id === selectedDeal.id || (selectedDeal.lead_id && m.lead_id === selectedDeal.lead_id)
        );
        const dealFollowUps = followUps.filter(
          (f) => f.deal_id === selectedDeal.id || (selectedDeal.lead_id && f.lead_id === selectedDeal.lead_id)
        );

        const sortedDealMeetings = [...dealMeetings].sort(
          (a, b) => new Date(b.scheduled_at || 0).getTime() - new Date(a.scheduled_at || 0).getTime()
        );
        const sortedDealFollowUps = [...dealFollowUps].sort(
          (a, b) => new Date(b.due_at || 0).getTime() - new Date(a.due_at || 0).getTime()
        );

        const upcomingMeeting = dealMeetings
          .filter((m) => m.status === "scheduled")
          .sort((a, b) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime())[0];
        const upcomingFollowUp = dealFollowUps
          .filter((f) => f.status === "pending")
          .sort((a, b) => new Date(a.due_at || 0).getTime() - new Date(b.due_at || 0).getTime())[0];

        // Construct A to Z Chronological Events
        const rawTimelineEvents = [];
        if (lead) {
          rawTimelineEvents.push({
            type: "lead_created",
            title: `Lead Captured: ${lead.name}`,
            description: `Source: ${lead.source || "Website"} · Service: ${lead.service || "Tech Development"}${lead.notes ? ` · Note: ${getLeadDisplayNotes(lead)}` : ""}`,
            time: lead.created_at ? new Date(lead.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "Lead",
            timestamp: new Date(lead.created_at || 0).getTime(),
          });
        }

        rawTimelineEvents.push({
          type: "project",
          title: `Deal Created in Pipeline`,
          description: `Stage: ${dealStage.replace("_", " ")} · Value: ₹${dealValue.toLocaleString("en-IN")}${selectedDeal.service ? ` · ${selectedDeal.service}` : ""}`,
          time: selectedDeal.created_at ? new Date(selectedDeal.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "Deal",
          timestamp: new Date(selectedDeal.created_at || 0).getTime(),
        });

        dealMeetings.forEach((m) => {
          rawTimelineEvents.push({
            type: m.status === "completed" ? "completed" : "meeting",
            title: `Meeting: ${m.title} [${formatStatusLabel(m.status)}]`,
            description: `Scheduled: ${new Date(m.scheduled_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}${m.agenda ? ` · Agenda: ${m.agenda}` : ""}`,
            time: new Date(m.scheduled_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true }),
            timestamp: new Date(m.scheduled_at || 0).getTime(),
          });

          const mHistory = parseNotesHistory(getMeetingFullNotes(m));
          mHistory.forEach((entry, idx) => {
            if (entry.note && !entry.note.toLowerCase().includes("no agenda or notes logged")) {
              rawTimelineEvents.push({
                type: entry.stage?.toLowerCase().includes("conducted") || entry.stage?.toLowerCase().includes("completed") ? "completed" : "meeting",
                title: `Meeting Update · ${entry.stage || formatStatusLabel(m.status)}`,
                description: entry.note,
                time: entry.timestamp || "Update",
                timestamp: new Date(m.updated_at || m.scheduled_at || 0).getTime() + (idx + 1) * 1000,
              });
            }
          });
        });

        dealFollowUps.forEach((f) => {
          rawTimelineEvents.push({
            type: f.status === "done" ? "completed" : "call",
            title: `Follow-up: ${f.title} [${formatStatusLabel(f.status)}]`,
            description: `Via ${f.channel || "Phone"} · Priority: ${f.priority || "Medium"} · Due: ${f.due_at ? new Date(f.due_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true }) : "No date"}`,
            time: f.due_at ? new Date(f.due_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true }) : "Follow-up",
            timestamp: new Date(f.due_at || f.created_at || 0).getTime(),
          });

          const fHistory = parseNotesHistory(f.notes);
          fHistory.forEach((entry, idx) => {
            if (entry.note) {
              rawTimelineEvents.push({
                type: entry.stage?.toLowerCase().includes("done") || entry.stage?.toLowerCase().includes("completed") ? "completed" : "chat",
                title: `Follow-up Update · ${entry.stage || formatStatusLabel(f.status)}`,
                description: entry.note,
                time: entry.timestamp || "Update",
                timestamp: new Date(f.updated_at || f.due_at || 0).getTime() + (idx + 1) * 1000,
              });
            }
          });
        });

        dealProposals.forEach((p) => {
          rawTimelineEvents.push({
            type: "quotation",
            title: `Quotation: ${p.title || p.quotation_number || "Quotation"}`,
            description: `Amount: ₹${(Number(p.total || p.amount) || 0).toLocaleString("en-IN")} · Status: ${p.status || "sent"}`,
            time: p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN") : "Doc",
            timestamp: new Date(p.created_at || 0).getTime(),
          });
        });

        dealAgreements.forEach((a) => {
          rawTimelineEvents.push({
            type: "project",
            title: `Agreement: ${a.title || a.agreement_number || "Agreement"}`,
            description: `Amount: ₹${(Number(a.amount) || 0).toLocaleString("en-IN")} · Status: ${a.status || "active"}`,
            time: a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN") : "Doc",
            timestamp: new Date(a.created_at || 0).getTime(),
          });
        });

        dealInvoices.forEach((inv) => {
          rawTimelineEvents.push({
            type: "payment",
            title: `Invoice: ${inv.title || inv.invoice_number || "Invoice"}`,
            description: `Amount: ₹${(Number(inv.total_amount || inv.amount) || 0).toLocaleString("en-IN")} · Status: ${inv.status || "unpaid"}`,
            time: inv.created_at ? new Date(inv.created_at).toLocaleDateString("en-IN") : "Doc",
            timestamp: new Date(inv.created_at || 0).getTime(),
          });
        });

        if (isWon) {
          rawTimelineEvents.push({
            type: "completed",
            title: `Deal Closed Won! 🎉`,
            description: `Converted successfully with value ₹${dealValue.toLocaleString("en-IN")}`,
            time: selectedDeal.updated_at ? new Date(selectedDeal.updated_at).toLocaleString("en-IN") : "Won",
            timestamp: new Date(selectedDeal.updated_at || Date.now()).getTime(),
          });
        }
        if (isLost) {
          rawTimelineEvents.push({
            type: "alert",
            title: `Deal Closed Lost`,
            description: `Reason: ${selectedDeal.loss_reason || "Marked as lost"}`,
            time: selectedDeal.updated_at ? new Date(selectedDeal.updated_at).toLocaleString("en-IN") : "Lost",
            timestamp: new Date(selectedDeal.updated_at || Date.now()).getTime(),
          });
        }

        const dealTimelineEvents = rawTimelineEvents.sort((a, b) => b.timestamp - a.timestamp);

        const STAGES = [
          { id: "contacted", label: "Contacted" },
          { id: "qualified", label: "Meeting" },
          { id: "proposal", label: "Quotation" },
          { id: "negotiation", label: "Negotiation" },
          { id: "closed_won", label: "Won" },
        ];
        const currentStageIndex = isLost ? -1 : STAGES.findIndex((s) => s.id === dealStage);

        return (
          <div
            data-modal-overlay="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedDeal(null);
            }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200"
          >
            <div className="w-full max-w-3xl max-h-[82vh] rounded-2xl bg-white dark:bg-[#18150f] border border-gray-200 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3a3020] p-4 sm:p-5 pb-3.5 shrink-0 bg-gray-50/50 dark:bg-[#1f1a13]/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                    {contactName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                        {selectedDeal.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isWon
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : isLost
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                          : "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
                      }`}>
                        {dealStage.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                      Pipeline Deal Details · Created {new Date(selectedDeal.created_at || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditDeal(selectedDeal)}
                    className="p-1.5 rounded-lg text-gray-600 dark:text-neutral-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition flex items-center gap-1 text-xs font-semibold cursor-pointer border border-gray-200/80 dark:border-slate-700"
                    title="Edit Deal"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDeal(null)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs Bar */}
              <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2 border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/70 dark:bg-[#1a1711] overflow-x-auto no-scrollbar shrink-0">
                {[
                  { id: "overview", label: "Overview", icon: Target },
                  { id: "lead", label: "Lead History", icon: Users, badge: lead ? (lead.source || "Linked") : null },
                  { id: "meetings", label: "Meetings", icon: Video, count: dealMeetings.length },
                  { id: "followups", label: "Follow-ups", icon: Clock, count: dealFollowUps.length },
                  { id: "timeline", label: "A to Z Timeline", icon: History, count: dealTimelineEvents.length },
                ].map((tab) => {
                  const isActive = dealModalTab === tab.id;
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDealModalTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isActive
                          ? "bg-white dark:bg-[#252017] text-orange-600 dark:text-orange-400 shadow-xs border border-orange-200/70 dark:border-orange-900/50"
                          : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <TabIcon className={`w-3.5 h-3.5 ${isActive ? "text-orange-500" : "text-gray-400"}`} />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && tab.count !== null && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                          isActive
                            ? "bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300"
                            : "bg-gray-200/80 dark:bg-slate-800 text-gray-600 dark:text-neutral-400"
                        }`}>
                          {tab.count}
                        </span>
                      )}
                      {tab.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 capitalize truncate max-w-[80px]">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Tab Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs no-scrollbar">
                {/* TAB 1: OVERVIEW */}
                {dealModalTab === "overview" && (
                  <div className="space-y-4">
                    {/* Key Value Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                        <span className="text-gray-500 dark:text-neutral-400 text-[10px] block font-semibold uppercase">Deal Value</span>
                        <span className="font-extrabold text-sm sm:text-base text-orange-600 dark:text-orange-400 font-mono mt-0.5 block">
                          ₹{dealValue.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50">
                        <span className="text-gray-500 dark:text-neutral-400 text-[10px] block font-semibold uppercase">Service</span>
                        <span className="font-bold text-gray-800 dark:text-white mt-0.5 block truncate" title={selectedDeal.service}>
                          {selectedDeal.service || "Tech Development"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50">
                        <span className="text-gray-500 dark:text-neutral-400 text-[10px] block font-semibold uppercase">Current Stage</span>
                        <span className="font-bold text-gray-800 dark:text-white capitalize mt-0.5 block">
                          {dealStage.replace("_", " ")}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50">
                        <span className="text-gray-500 dark:text-neutral-400 text-[10px] block font-semibold uppercase">Expected Close</span>
                        <span className="font-bold text-gray-800 dark:text-white mt-0.5 block">
                          {selectedDeal.expected_close_date
                            ? new Date(selectedDeal.expected_close_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                            : "Open"}
                        </span>
                      </div>
                    </div>

                    {/* Pipeline Progression */}
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-700 dark:text-neutral-300 uppercase tracking-wide">
                          Pipeline Progression
                        </span>
                        {isWon ? (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Deal Won
                          </span>
                        ) : isLost ? (
                          <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Closed Lost
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-gray-500">
                            Step {currentStageIndex + 1} of 5
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {STAGES.map((st, idx) => {
                          const isCompleted = !isLost && currentStageIndex >= idx;
                          const isCurrent = !isLost && currentStageIndex === idx;
                          return (
                            <div
                              key={st.id}
                              className={`text-center py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all ${
                                isCurrent
                                  ? "bg-orange-500 text-white shadow-xs"
                                  : isCompleted
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                                  : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-neutral-500"
                              }`}
                            >
                              {st.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Lost Reason Banner */}
                    {isLost && (
                      <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-200 text-xs">
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Closed Lost Reason</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDealStageChange(selectedDeal, "contacted", "closed_lost")}
                            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Re-open Deal
                          </button>
                        </div>
                        <p className="text-xs text-rose-700 dark:text-rose-300 bg-white/80 dark:bg-[#201713]/80 p-2.5 rounded-lg border border-rose-200/60 font-medium">
                          {selectedDeal.loss_reason || "No specific loss reason recorded for this deal."}
                        </p>
                      </div>
                    )}

                    {/* Quick Highlights: Next Engagements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide flex items-center gap-1">
                            <Video className="w-3.5 h-3.5 text-blue-500" />
                            <span>Upcoming Meeting</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setDealModalTab("meetings")}
                            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            View All ({dealMeetings.length}) →
                          </button>
                        </div>
                        {upcomingMeeting ? (
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white block truncate">{upcomingMeeting.title}</span>
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block">
                              {new Date(upcomingMeeting.scheduled_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                            </span>
                            {upcomingMeeting.meeting_link && (
                              <a
                                href={upcomingMeeting.meeting_link.startsWith("http") ? upcomingMeeting.meeting_link : `https://${upcomingMeeting.meeting_link}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:underline mt-1"
                              >
                                Join Google Meet <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-gray-500 pt-1">
                            <span>No upcoming meeting</span>
                            <button
                              type="button"
                              onClick={() => openDealMeetingModal(selectedDeal, lead)}
                              className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                            >
                              + Schedule
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Upcoming Follow-up</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setDealModalTab("followups")}
                            className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                          >
                            View All ({dealFollowUps.length}) →
                          </button>
                        </div>
                        {upcomingFollowUp ? (
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white block truncate">{upcomingFollowUp.title}</span>
                            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold block">
                              {new Date(upcomingFollowUp.due_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                            </span>
                            <span className="text-[10px] text-gray-500 capitalize">Via {upcomingFollowUp.channel || "Phone"}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-gray-500 pt-1">
                            <span>No upcoming follow-up</span>
                            <button
                              type="button"
                              onClick={() => openDealFollowUpModal(selectedDeal, lead)}
                              className="text-[10px] font-bold text-amber-600 hover:underline cursor-pointer"
                            >
                              + Add
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact & Client Details Card */}
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/60 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                          <Users className="w-4 h-4 text-orange-500" />
                          <span>Contact & Client Details</span>
                        </div>
                        {contactPhone && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (lead) handleWhatsAppClick(lead);
                                else sendDealDocWhatsApp(selectedDeal);
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold text-[10px] flex items-center gap-1 hover:bg-emerald-100 transition cursor-pointer"
                            >
                              <WhatsAppIcon className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                            <a
                              href={`tel:${contactPhone}`}
                              className="px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 font-bold text-[10px] flex items-center gap-1 hover:bg-orange-100 transition"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Call</span>
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400 text-[10px] block">Name / Entity</span>
                          <span className="font-semibold text-gray-800 dark:text-neutral-200">
                            {contactName} {contactCompany ? `(${contactCompany})` : ""}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] block">Phone Number</span>
                          <span className="font-semibold text-gray-800 dark:text-neutral-200 font-mono">
                            {contactPhone || "Not provided"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] block">Email</span>
                          <span className="font-semibold text-gray-800 dark:text-neutral-200 truncate block">
                            {contactEmail || "Not provided"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] block">Relationship</span>
                          <span className="font-semibold text-gray-800 dark:text-neutral-200">
                            {client ? "Existing Client" : lead ? "Inbound Lead" : "Direct Deal"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notes & Requirements */}
                    {selectedDeal.notes && (
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50">
                        <span className="text-gray-400 text-[10px] block font-semibold uppercase mb-1">
                          Deal Notes & Requirements
                        </span>
                        <p className="text-gray-700 dark:text-neutral-300 whitespace-pre-wrap font-medium">
                          {selectedDeal.notes}
                        </p>
                      </div>
                    )}

                    {/* Commercial Documents Linked */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-white uppercase text-[11px] tracking-wide flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          <span>Commercial Documents ({dealProposals.length + dealAgreements.length + dealInvoices.length})</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openCommercialModal("proposal", selectedDeal)}
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 transition cursor-pointer"
                          >
                            + Quotation
                          </button>
                          <button
                            type="button"
                            onClick={() => openCommercialModal("agreement", selectedDeal)}
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition cursor-pointer"
                          >
                            + Agreement
                          </button>
                          <button
                            type="button"
                            onClick={() => openInvoiceModal(selectedDeal)}
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 transition cursor-pointer"
                          >
                            + Invoice
                          </button>
                        </div>
                      </div>
                      {dealProposals.length === 0 && dealAgreements.length === 0 && dealInvoices.length === 0 ? (
                        <div className="p-3 rounded-xl border border-dashed border-gray-200 dark:border-slate-800 text-center text-gray-400 text-xs">
                          No commercial documents attached to this deal yet.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {dealProposals.map((p) => (
                            <div key={p.id} className="p-2.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-gray-900 dark:text-white block">{p.title || "Quotation"}</span>
                                <span className="text-[10px] text-gray-500">{p.quotation_number || "QT"} · ₹{(Number(p.total || p.amount) || 0).toLocaleString("en-IN")}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 uppercase">
                                {p.status || "sent"}
                              </span>
                            </div>
                          ))}
                          {dealAgreements.map((a) => (
                            <div key={a.id} className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-gray-900 dark:text-white block">{a.title || "Agreement"}</span>
                                <span className="text-[10px] text-gray-500">{a.agreement_number || "AGR"} · ₹{(Number(a.amount) || 0).toLocaleString("en-IN")}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 uppercase">
                                {a.status || "active"}
                              </span>
                            </div>
                          ))}
                          {dealInvoices.map((inv) => (
                            <div key={inv.id} className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-gray-900 dark:text-white block">{inv.title || "Invoice"}</span>
                                <span className="text-[10px] text-gray-500">{inv.invoice_number || "INV"} · ₹{(Number(inv.total_amount || inv.amount) || 0).toLocaleString("en-IN")}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 uppercase">
                                {inv.status || "unpaid"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: LEAD HISTORY */}
                {dealModalTab === "lead" && (
                  <div className="space-y-4">
                    {lead ? (
                      <>
                        {/* Lead Header */}
                        <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/25 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900 dark:text-white">{lead.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                                {formatStatusLabel(lead.status)}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                              Captured on {new Date(lead.created_at || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedLead(lead)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-2xs hover:bg-blue-50 cursor-pointer"
                          >
                            Open Lead Modal
                          </button>
                        </div>

                        {/* Lead Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                            <span className="text-gray-400 text-[10px] block font-semibold uppercase">Source</span>
                            <span className="font-bold text-gray-800 dark:text-white mt-0.5 block">{lead.source || "Website"}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                            <span className="text-gray-400 text-[10px] block font-semibold uppercase">Phone</span>
                            <span className="font-bold text-gray-800 dark:text-white mt-0.5 block font-mono">{lead.phone || "N/A"}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                            <span className="text-gray-400 text-[10px] block font-semibold uppercase">Email</span>
                            <span className="font-bold text-gray-800 dark:text-white mt-0.5 block truncate" title={lead.email}>{lead.email || "N/A"}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                            <span className="text-gray-400 text-[10px] block font-semibold uppercase">Location</span>
                            <span className="font-bold text-gray-800 dark:text-white mt-0.5 block">{getLeadLocation(lead)}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                            <span className="text-gray-400 text-[10px] block font-semibold uppercase">Budget Range</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{getLeadBudget(lead)}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                            <span className="text-gray-400 text-[10px] block font-semibold uppercase">Service</span>
                            <span className="font-bold text-gray-800 dark:text-white mt-0.5 block truncate">{lead.service || "Web Development"}</span>
                          </div>
                        </div>

                        {/* Form Answers (Inquiry Form Responses) */}
                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs space-y-2">
                          <span className="text-gray-500 dark:text-neutral-400 text-[10.5px] block font-bold uppercase tracking-wider">
                            Inquiry Form Questionnaire Answers
                          </span>
                          {getLeadFormAnswers(lead).length > 0 ? (
                            <div className="overflow-hidden rounded-lg border border-gray-200/80 dark:border-slate-700 bg-white dark:bg-slate-900/50">
                              {getLeadFormAnswers(lead).map((answer) => (
                                <div
                                  key={answer.label}
                                  className="grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] gap-1 sm:gap-3 px-3 py-2 border-b border-gray-100 dark:border-slate-800 last:border-b-0"
                                >
                                  <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-neutral-400 font-bold break-words" title={answer.label}>
                                    {answer.label}
                                  </span>
                                  <span className="font-semibold text-gray-800 dark:text-white break-words font-mono" title={answer.value}>
                                    {answer.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No custom form answers provided.</span>
                          )}
                        </div>

                        {/* Inquiry Notes & History */}
                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs space-y-2.5">
                          <span className="text-gray-500 dark:text-neutral-400 text-[10.5px] block font-bold uppercase tracking-wider">
                            Lead Notes & Historical Audit
                          </span>
                          {getLeadDisplayNotes(lead) ? (
                            <div className="space-y-2">
                              {parseNotesHistory(getLeadDisplayNotes(lead)).map((item, idx) => (
                                <div key={item.id || idx} className="p-2.5 rounded-lg bg-white dark:bg-slate-900/60 border border-gray-100 dark:border-slate-700/60 space-y-1">
                                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                                    <span className="font-semibold text-orange-600 dark:text-orange-400">{item.timestamp}</span>
                                    {item.stage && (
                                      <span className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-slate-800 font-bold text-gray-600 dark:text-neutral-300">
                                        {item.stage}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed font-medium">
                                    {item.note || item.raw}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No notes logged for this lead yet.</span>
                          )}
                        </div>

                        {/* Lead Lost Reason if lost */}
                        {getLeadLossReason(lead, selectedDeal) && (
                          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300">
                            <span className="font-bold text-[11px] block uppercase">Lead Loss Reason</span>
                            <p className="mt-1 font-semibold">{getLeadLossReason(lead, selectedDeal)}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-8 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 text-center space-y-2">
                        <Users className="w-8 h-8 text-gray-300 dark:text-neutral-600 mx-auto" />
                        <h4 className="font-bold text-sm text-gray-800 dark:text-white">Direct Pipeline Deal</h4>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto">
                          This deal was created directly in the Sales Pipeline without being mapped from an inbound website inquiry lead.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: A TO Z MEETINGS */}
                {dealModalTab === "meetings" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-blue-500" />
                        <span>All Sales Meetings ({dealMeetings.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => openDealMeetingModal(selectedDeal, lead)}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Schedule Meeting</span>
                      </button>
                    </div>

                    {sortedDealMeetings.length === 0 ? (
                      <div className="p-8 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 text-center space-y-3">
                        <Video className="w-8 h-8 text-blue-300 dark:text-blue-900/60 mx-auto" />
                        <div>
                          <h4 className="font-bold text-sm text-gray-800 dark:text-white">No Meetings Scheduled</h4>
                          <p className="text-xs text-gray-400 mt-0.5">Schedule a discovery call or product demonstration for this deal.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openDealMeetingModal(selectedDeal, lead)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xs inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Schedule First Meeting</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedDealMeetings.map((m) => {
                          const meetingHist = parseNotesHistory(getMeetingFullNotes(m));
                          const isMeetingScheduled = m.status === "scheduled";
                          const isMeetingDone = m.status === "completed";
                          return (
                            <div
                              key={m.id}
                              className={`p-3.5 rounded-2xl border transition-all space-y-3 ${
                                isMeetingScheduled
                                  ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/40"
                                  : isMeetingDone
                                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40"
                                  : "bg-gray-50/60 dark:bg-slate-800/40 border-gray-200 dark:border-slate-700/60"
                              }`}
                            >
                              {/* Top Bar */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-gray-900 dark:text-white">{m.title}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                      isMeetingScheduled
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                        : isMeetingDone
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                                        : "bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-neutral-300"
                                    }`}>
                                      {formatStatusLabel(m.status)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-neutral-400">
                                    <span className="font-semibold text-gray-700 dark:text-neutral-300">
                                      {new Date(m.scheduled_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                                    </span>
                                    <span>·</span>
                                    <span>{m.duration_minutes || 30} mins</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {m.meeting_link && (
                                    <a
                                      href={m.meeting_link.startsWith("http") ? m.meeting_link : `https://${m.meeting_link}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-2xs"
                                    >
                                      <Video className="w-3 h-3" />
                                      <span>Join Meet</span>
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => openStageModal(m, "meeting")}
                                    className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 border border-gray-200 dark:border-slate-700 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
                                    title="Update Status & Add Notes History"
                                  >
                                    <History className="w-3 h-3 text-orange-500" />
                                    <span>Stage & Notes</span>
                                  </button>
                                </div>
                              </div>

                              {/* Agenda & Next Action */}
                              {(m.agenda || m.next_action) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white/70 dark:bg-slate-900/40 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                                  {m.agenda && (
                                    <div>
                                      <span className="text-gray-400 text-[10px] block font-semibold uppercase">Agenda</span>
                                      <span className="text-gray-800 dark:text-neutral-200 font-medium">{m.agenda}</span>
                                    </div>
                                  )}
                                  {m.next_action && (
                                    <div>
                                      <span className="text-gray-400 text-[10px] block font-semibold uppercase">Next Action</span>
                                      <span className="text-gray-800 dark:text-neutral-200 font-medium">{m.next_action}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Complete Stage & Notes History Breakdown */}
                              <div className="space-y-1.5 pt-1 border-t border-gray-100 dark:border-slate-800">
                                <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">
                                  Meeting Notes & Updates History ({meetingHist.length})
                                </span>
                                {meetingHist.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {meetingHist.map((entry, idx) => (
                                      <div key={entry.id || idx} className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 text-xs flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center justify-between text-[10px] text-gray-400">
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">{entry.timestamp}</span>
                                            {entry.stage && (
                                              <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold uppercase text-[9px]">
                                                {entry.stage}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-gray-800 dark:text-neutral-200 whitespace-pre-line font-medium mt-0.5">
                                            {entry.note || entry.raw}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-gray-400 italic">No historical outcome or discussion logged yet.</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: A TO Z FOLLOW-UPS */}
                {dealModalTab === "followups" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>All Follow-ups ({dealFollowUps.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => openDealFollowUpModal(selectedDeal, lead)}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Follow-up</span>
                      </button>
                    </div>

                    {sortedDealFollowUps.length === 0 ? (
                      <div className="p-8 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 text-center space-y-3">
                        <Clock className="w-8 h-8 text-amber-300 dark:text-amber-900/60 mx-auto" />
                        <div>
                          <h4 className="font-bold text-sm text-gray-800 dark:text-white">No Follow-ups Recorded</h4>
                          <p className="text-xs text-gray-400 mt-0.5">Stay on top of prospect conversion with scheduled touchpoints.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openDealFollowUpModal(selectedDeal, lead)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer shadow-xs inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add First Follow-up</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedDealFollowUps.map((f) => {
                          const followUpHist = parseNotesHistory(f.notes);
                          const isFollowUpPending = f.status === "pending";
                          const isFollowUpDone = f.status === "done";
                          return (
                            <div
                              key={f.id}
                              className={`p-3.5 rounded-2xl border transition-all space-y-3 ${
                                isFollowUpPending
                                  ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40"
                                  : isFollowUpDone
                                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40"
                                  : "bg-gray-50/60 dark:bg-slate-800/40 border-gray-200 dark:border-slate-700/60"
                              }`}
                            >
                              {/* Top Bar */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-gray-900 dark:text-white">{f.title}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                      isFollowUpPending
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                                        : isFollowUpDone
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                                        : "bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-neutral-300"
                                    }`}>
                                      {formatStatusLabel(f.status)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-neutral-400">
                                    <span className="font-semibold text-gray-700 dark:text-neutral-300">
                                      Due: {f.due_at ? new Date(f.due_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "No due date"}
                                    </span>
                                    <span>·</span>
                                    <span className="capitalize">{f.channel || "Phone"}</span>
                                    {f.priority && (
                                      <>
                                        <span>·</span>
                                        <span className="capitalize font-semibold text-orange-600">{f.priority} priority</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {isFollowUpPending && (
                                    <button
                                      type="button"
                                      onClick={() => openStageModal(f, "followup", "done")}
                                      className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-2xs cursor-pointer"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Mark Done</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => openStageModal(f, "followup")}
                                    className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 text-gray-700 dark:text-neutral-200 border border-gray-200 dark:border-slate-700 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
                                    title="Update Status & Add Notes History"
                                  >
                                    <History className="w-3 h-3 text-orange-500" />
                                    <span>Stage & Notes</span>
                                  </button>
                                </div>
                              </div>

                              {/* Complete Stage & Notes History Breakdown */}
                              <div className="space-y-1.5 pt-1 border-t border-gray-100 dark:border-slate-800">
                                <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">
                                  Follow-up Notes & Updates History ({followUpHist.length})
                                </span>
                                {followUpHist.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {followUpHist.map((entry, idx) => (
                                      <div key={entry.id || idx} className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 text-xs flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center justify-between text-[10px] text-gray-400">
                                            <span className="font-semibold text-amber-600 dark:text-amber-400">{entry.timestamp}</span>
                                            {entry.stage && (
                                              <span className="px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold uppercase text-[9px]">
                                                {entry.stage}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-gray-800 dark:text-neutral-200 whitespace-pre-line font-medium mt-0.5">
                                            {entry.note || entry.raw}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-gray-400 italic">No notes logged for this follow-up yet.</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: A TO Z TIMELINE */}
                {dealModalTab === "timeline" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                          A to Z Activity Timeline
                        </h4>
                        <p className="text-[11px] text-gray-400">Complete chronological audit trail across lead, meetings, follow-ups & documents</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
                        {dealTimelineEvents.length} Events
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/60">
                      <ActivityTimeline events={dealTimelineEvents} isDark={isDark} />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 p-3.5 sm:p-4 border-t border-gray-100 dark:border-[#3a3020] bg-white dark:bg-[#18150f] shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEditDeal(selectedDeal)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Deal Details</span>
                </button>
                <div className="flex items-center gap-2">
                  {dealModalTab !== "overview" && (
                    <button
                      type="button"
                      onClick={() => setDealModalTab("overview")}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      ← Back to Overview
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedDeal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 10. Edit Deal Modal */}
      {editingDeal && (
        <div data-modal-overlay="true" className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveEditDeal}
            className="w-full max-w-xl max-h-[82vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-orange-50/70 via-amber-50/25 to-transparent dark:from-orange-950/25 dark:via-transparent dark:to-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">Edit Deal Details</h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Update pipeline stages, value, service, and closing details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingDeal(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5 text-xs flex-1 overflow-y-auto no-scrollbar">
              {/* Deal Title */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <Briefcase className="w-3.5 h-3.5 text-orange-500" />
                  <span>Deal Title</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editDealForm.title}
                  onChange={(e) => setEditDealForm({ ...editDealForm, title: e.target.value })}
                  placeholder="e.g. Acme Corp - E-Commerce Platform"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white transition shadow-2xs font-medium"
                />
              </div>

              {/* Deal Value & Service */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Deal Value (₹)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editDealForm.deal_value}
                    onChange={(e) => setEditDealForm({ ...editDealForm, deal_value: e.target.value })}
                    placeholder="100000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 font-mono font-bold text-gray-900 dark:text-white transition shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>Service Required</span>
                  </label>
                  <select
                    value={editDealForm.service}
                    onChange={(e) => setEditDealForm({ ...editDealForm, service: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white font-medium transition shadow-2xs"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="E-Commerce Development">E-Commerce Development</option>
                    <option value="Custom CRM / ERP">Custom CRM / ERP</option>
                    <option value="SEO & Digital Marketing">SEO & Digital Marketing</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="AI Automation">AI Automation</option>
                    <option value="Full Stack Solution">Full Stack Solution</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Pipeline Stage & Expected Close Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Pipeline Stage</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editDealForm.pipeline_stage}
                    onChange={(e) => setEditDealForm({ ...editDealForm, pipeline_stage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white font-semibold transition shadow-2xs"
                  >
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Meeting / Qualified</option>
                    <option value="proposal">Quotation / Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Expected Close Date</span>
                  </label>
                  <input
                    type="date"
                    value={editDealForm.expected_close_date}
                    onChange={(e) => setEditDealForm({ ...editDealForm, expected_close_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white transition shadow-2xs font-medium"
                  />
                </div>
              </div>

              {/* Loss Reason (if stage is closed_lost) */}
              {editDealForm.pipeline_stage === "closed_lost" && (
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Loss Reason / Root Cause</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editDealForm.loss_reason}
                    onChange={(e) => setEditDealForm({ ...editDealForm, loss_reason: e.target.value })}
                    placeholder="e.g. Budget out of range, chosen competitor, requirements dropped..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-gray-900 dark:text-white transition shadow-2xs text-xs resize-y"
                  />
                </div>
              )}

              {/* Notes & Strategy */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-neutral-200">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                  <span>Deal Notes / Strategy</span>
                </label>
                <textarea
                  rows={3}
                  value={editDealForm.notes}
                  onChange={(e) => setEditDealForm({ ...editDealForm, notes: e.target.value })}
                  placeholder="Key deliverables, client expectations, scope details..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-900 dark:text-white transition shadow-2xs font-normal text-xs resize-y"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0">
              <button
                type="button"
                onClick={() => setEditingDeal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {showLostModal && lostTarget && (
        <div data-modal-overlay="true" className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200">
          <form
            onSubmit={handleMarkLostSubmit}
            className="w-full max-w-lg max-h-[82vh] rounded-3xl bg-white dark:bg-[#18150f] border border-gray-200/80 dark:border-[#3a3020] shadow-2xl flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3020] bg-linear-to-r from-rose-50/70 via-red-50/25 to-transparent dark:from-rose-950/25 dark:via-transparent dark:to-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/25 shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">
                    Mark as Closed Lost
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5 truncate max-w-xs sm:max-w-sm">
                    Target: <span className="font-semibold text-gray-800 dark:text-slate-200">{lostTarget.item.name || lostTarget.item.title}</span> ({lostTarget.type === "deal" ? "Pipeline Deal" : "Inbound Lead"})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLostModal(false);
                  setLostTarget(null);
                }}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5 text-xs flex-1 overflow-y-auto no-scrollbar">
              {/* 1. Stage where deal was lost */}
              <div>
                <label className="block font-bold mb-1.5 text-gray-700 dark:text-neutral-300">
                  Where was this deal lost? (Drop-Off Stage) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: "contacted", label: "Contact", desc: "First Call / Outreach" },
                    { id: "meeting", label: "Meeting", desc: "Post Discovery / Demo" },
                    { id: "proposal", label: "Quotation", desc: "Quotation Sent" },
                    { id: "negotiation", label: "Negotiation", desc: "Final Terms" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        const newStage = st.id;
                        const newReasons = STAGE_LOSS_REASONS[newStage] || STAGE_LOSS_REASONS.contacted;
                        setLostForm({
                          ...lostForm,
                          stage: newStage,
                          reason: newReasons[0],
                        });
                      }}
                      className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                        lostForm.stage === st.id
                          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold shadow-2xs"
                          : "border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="text-xs font-bold">{st.label}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{st.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Primary Loss Reason */}
              <div>
                <label className="block font-bold mb-1 text-gray-700 dark:text-neutral-300">
                  Primary Loss Reason *
                </label>
                <select
                  value={lostForm.reason}
                  onChange={(e) => setLostForm({ ...lostForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition shadow-2xs"
                >
                  {(STAGE_LOSS_REASONS[lostForm.stage] || STAGE_LOSS_REASONS.contacted).map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Competitor & Re-Nurture Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-neutral-300">
                    Competitor Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={lostForm.competitor_name}
                    onChange={(e) => setLostForm({ ...lostForm, competitor_name: e.target.value })}
                    placeholder="e.g. Local Agency / Wix / Freelancer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-gray-900 dark:text-white transition shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-neutral-300">
                    Re-Nurture Cadence
                  </label>
                  <select
                    value={lostForm.re_nurture_days}
                    onChange={(e) => setLostForm({ ...lostForm, re_nurture_days: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-gray-900 dark:text-white font-medium transition shadow-2xs"
                  >
                    <option value="30">Re-engage after 30 days</option>
                    <option value="60">Re-engage after 60 days (Quarterly)</option>
                    <option value="90">Re-engage after 90 days (New Budget)</option>
                    <option value="none">Do Not Nurture (Spam / Unqualified)</option>
                  </select>
                </div>
              </div>

              {/* 4. Notes & Feedback */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-neutral-300">
                  Loss Notes & Context
                </label>
                <textarea
                  rows={3}
                  value={lostForm.notes}
                  onChange={(e) => setLostForm({ ...lostForm, notes: e.target.value })}
                  placeholder="Why did they decline? What budget did they expect? Any key objections raised?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-gray-900 dark:text-white transition shadow-2xs text-xs resize-y font-normal"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-gray-100 dark:border-[#3a3020] bg-gray-50/60 dark:bg-[#1a1712] shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowLostModal(false);
                  setLostTarget(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-md shadow-rose-500/25 hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Confirm & Mark as Lost</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {showMetaImportModal && (
        <MetaLeadsImportModal
          isOpen={showMetaImportModal}
          onClose={() => setShowMetaImportModal(false)}
          onImport={async (importedLeads) => {
            await onImportBatchLeads?.(importedLeads);
            playNotificationSound("lead");
          }}
          isDark={isDark}
        />
      )}
    </div>
  );
}
