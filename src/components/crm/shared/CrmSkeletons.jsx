"use client";

import { PIPELINE_STAGES } from "./leadUtils";

export function TableSkeleton({ rows = 5, columns = 6 }) {
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

export function PipelineSkeleton() {
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

export function StatusCardsSkeleton({ cards = 4 }) {
  return (
    <div
      className={`grid gap-3 ${
        cards === 6
          ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6"
          : cards === 5
          ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
          : "grid-cols-2 lg:grid-cols-4"
      }`}
    >
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

export function LeadPageSkeleton() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="h-12 flex-1 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-12 w-full lg:w-80 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
        </div>
        <div className="h-px bg-gray-100 dark:bg-[#3a3020]" />
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-4 w-10 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse shrink-0" />
          {Array.from({ length: 18 }).map((_, index) => (
            <div
              key={index}
              className={`h-9 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse shrink-0 ${
                index === 0 ? "w-12" : "w-9"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
        <div className="grid grid-cols-5 gap-4 px-4 py-4 border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/80 dark:bg-[#1f1a13]/50">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="h-3 w-28 max-w-full rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, row) => (
          <div key={row} className="grid grid-cols-5 gap-4 px-4 py-4 border-b border-gray-100 dark:border-[#3a3020]/60">
            <div className="space-y-2">
              <div className="h-4 w-32 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-3 w-16 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-36 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-3 w-28 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-8 w-28 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-8 w-20 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
            <div className="flex justify-end gap-2">
              {[0, 1, 2, 3, 4].map((item) => (
                <div key={item} className="h-8 w-8 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DateFilterSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020]">
      <div className="h-4 w-28 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
      <div className="flex flex-wrap items-center gap-2">
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className="h-9 w-20 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function TablePageSkeleton({ rows = 8, columns = 6, toolbar = true }) {
  return (
    <div className="space-y-3">
      {toolbar && (
        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-4 w-44 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-3 w-64 max-w-full rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-28 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-10 w-28 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
            </div>
          </div>
        </div>
      )}
      <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] overflow-hidden shadow-2xs">
        <div className="grid gap-4 px-4 py-4 border-b border-gray-100 dark:border-[#3a3020] bg-gray-50/80 dark:bg-[#1f1a13]/50" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-3 w-24 max-w-full rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
        <TableSkeleton rows={rows} columns={columns} />
      </div>
    </div>
  );
}

export function ReportsSkeleton() {
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

export function CommercialsSkeleton() {
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

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 pb-8">
      {/* 6 KPI Cards Skeleton */}
      <StatusCardsSkeleton cards={6} />

      {/* Mid Section: Pipeline Funnel + Priority Schedule */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-20 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-44 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-16 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-[#211d14] border border-gray-100 dark:border-[#3a3020] flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-40 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-2.5 w-24 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse" />
                </div>
                <div className="h-8 w-20 rounded-lg bg-gray-200 dark:bg-slate-800 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Leads + Lead Source Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        <div className="xl:col-span-2 rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="h-4 w-32 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
          <TableSkeleton rows={4} columns={4} />
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#18150f] border border-gray-100 dark:border-[#3a3020] p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="h-4 w-28 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
