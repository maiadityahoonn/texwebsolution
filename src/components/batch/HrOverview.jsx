"use client";

import { useState } from "react";
import {
  Folder,
  Calendar,
  Clock,
  Video,
  CheckSquare,
  AlertCircle,
  Award,
  ExternalLink,
  Send,
  Star,
  User,
  Users,
  ShieldCheck,
  ChevronRight,
  Plus,
  FileText,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function HrOverview({
  userProfile,
  batches = [],
  profiles = [],
  attendanceRecords = [],
  certificates = [],
  onOpenWorkspace,
  onOpenMemberProfile,
  onAddMentor,
  onAddIntern,
  onAssignMentor,
  onSelectSection,
  isDark = false,
  domainLabel = (d) => d,
  localDate = (d) => d,
}) {
  const mentors = profiles.filter((p) => p.role === "mentor");
  const interns = profiles.filter((p) => ["intern", "team_leader"].includes(p.role));

  return (
    <div className="space-y-6">
      {/* 1. TOP METRICS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-2xl border ${
          isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"
        } shadow-sm`}>
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
            <span>Assigned Batches</span>
            <Folder className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">
            {batches.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Active assigned cohorts</div>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"
        } shadow-sm`}>
          <div className="flex items-center justify-between text-xs text-purple-600 font-bold uppercase tracking-wider">
            <span>Supervising Mentors</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-purple-600">
            {mentors.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Domain mentors added</div>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"
        } shadow-sm`}>
          <div className="flex items-center justify-between text-xs text-indigo-600 font-bold uppercase tracking-wider">
            <span>Enrolled Interns</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-indigo-600">
            {interns.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Total trainees active</div>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"
        } shadow-sm`}>
          <div className="flex items-center justify-between text-xs text-emerald-600 font-bold uppercase tracking-wider">
            <span>Certificates</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">
            {certificates.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Verified certificates issued</div>
        </div>
      </div>

      {/* 2. BATCHES OVERVIEW */}
      <div className={`p-5 rounded-2xl border ${
        isDark ? "bg-transparent border-slate-800/80" : "bg-white border-gray-200/80"
      } shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-red-600" />
              <span>Assigned Batches Management ({batches.length})</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Cohorts assigned to you by Super Admin. Assign mentors and monitor team growth.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddMentor}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Mentor</span>
            </button>
            <button
              onClick={onAddIntern}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5 text-red-600" />
              <span>Add Intern</span>
            </button>
          </div>
        </div>

        {batches.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs">
            No batches assigned to your HR account yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {batches.map((b) => {
              const bInterns = profiles.filter((p) => p.batch_id === b.id && p.role === "intern");
              const bMentor = profiles.find((p) => (p.batch_id === b.id && p.role === "mentor") || p.id === b.mentor_id);
              const bTl = profiles.find((p) => (p.batch_id === b.id && p.role === "team_leader") || p.id === b.tl_id);

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-800/30 flex flex-col justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/50 dark:border-red-900">
                        {b.batch_type || "Internship"}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-400">
                        {domainLabel(b.domain)}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                      {b.name}
                    </h4>

                    <div className="mt-3 space-y-1.5 text-gray-500 dark:text-slate-400">
                      <div className="flex items-center justify-between">
                        <span>Mentor:</span>
                        {bMentor ? (
                          <span className="font-semibold text-purple-600">{bMentor.full_name}</span>
                        ) : (
                          <button
                            onClick={() => onAssignMentor(b)}
                            className="text-[11px] text-red-600 font-bold hover:underline"
                          >
                            + Assign Mentor
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Team Leader:</span>
                        <span className="font-semibold text-indigo-600">{bTl?.full_name || "None yet"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Interns:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{bInterns.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => onAssignMentor(b)}
                      className="text-[11px] font-bold text-gray-600 dark:text-slate-300 hover:text-red-600"
                    >
                      Change Leads
                    </button>
                    <button
                      onClick={() => onOpenWorkspace(b.id)}
                      className="px-3 py-1.5 rounded-xl font-bold bg-gray-100 dark:bg-slate-700 hover:bg-red-50 hover:text-red-600 transition flex items-center gap-1"
                    >
                      <span>Workspace</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
