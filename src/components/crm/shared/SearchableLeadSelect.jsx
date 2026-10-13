"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Users, ChevronDown, Search, X, Check } from "lucide-react";

export default function SearchableLeadSelect({
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
