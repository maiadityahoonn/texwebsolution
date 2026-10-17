"use client";

export default function CommercialDocumentPreview({ form, type, deal, lead, client }) {
  const isAgreement = type === "agreement";
  const amount = Number(form.amount || deal?.deal_value || 0);
  const docNumber = isAgreement ? form.agreement_number : form.quotation_number;
  const contactName = client?.name || lead?.name || "Client Name";
  const contactEmail = client?.email || lead?.email || "client@email.com";
  const contactPhone = client?.phone || lead?.phone || "Client phone";

  return (
    <div className="rounded-2xl bg-gray-100 dark:bg-[#211d14] border border-gray-200 dark:border-[#3a3020] p-3 lg:sticky lg:top-3">
      <div className="relative rounded-xl bg-white text-slate-900 shadow-sm border border-gray-200 overflow-hidden min-h-[620px] flex flex-col justify-between">
        {/* Authentic Letterhead Background Image */}
        <img
          src="/texweb-official-letterhead.png"
          alt="TexWeb Letterhead"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
        />

        {/* Top Header Clearance to avoid overlapping official header */}
        <div className="h-24 w-full shrink-0 relative pointer-events-none z-10" />

        {/* Content Area */}
        <div className="relative px-6 py-2 pb-6 flex-1 overflow-hidden z-10 space-y-4">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-2">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-red-600">
                {isAgreement ? "Agreement" : "Quotation"}
              </div>
              <div className="text-base font-black text-slate-950">
                {form.title || (isAgreement ? "Project Agreement" : "Project Quotation")}
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-500">
              <div className="font-black text-slate-900">{docNumber || "DOC-2026"}</div>
              <div>{new Date().toLocaleDateString("en-IN")}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-lg border border-slate-200 bg-white/90 p-2.5 shadow-2xs">
              <div className="font-black uppercase text-orange-600 mb-1 text-[10px]">Prepared For</div>
              <div className="font-bold text-slate-900">{contactName}</div>
              <div className="text-slate-500 break-words">{contactEmail}</div>
              <div className="text-slate-500">{contactPhone}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white/90 p-2.5 shadow-2xs">
              <div className="font-black uppercase text-orange-600 mb-1 text-[10px]">Project Investment</div>
              <div className="font-bold text-slate-900 truncate">{deal?.title || form.title || "Client Project"}</div>
              <div className="text-slate-500">{deal?.service || "Technology Services"}</div>
              {!isAgreement && (
                <div className="font-black text-emerald-700 mt-1">
                  Rs. {amount.toLocaleString("en-IN")}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2.5 text-[11px] leading-relaxed">
            <section className="bg-white/80 p-2 rounded-lg border border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-0.5">
                Scope of Work
              </h4>
              <p className="whitespace-pre-wrap text-slate-700 text-[10.5px]">
                {form.scope_of_work || "Scope will appear here."}
              </p>
            </section>
            <section className="bg-white/80 p-2 rounded-lg border border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-0.5">
                {isAgreement ? "Commercial Terms" : "Deliverables"}
              </h4>
              <p className="whitespace-pre-wrap text-slate-700 text-[10.5px]">
                {(isAgreement ? form.commercial_terms : form.deliverables) || "Details will appear here."}
              </p>
            </section>
            {form.notes && (
              <section className="bg-white/80 p-2 rounded-lg border border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-0.5">
                  Notes
                </h4>
                <p className="whitespace-pre-wrap text-slate-600 text-[10.5px]">{form.notes}</p>
              </section>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 text-[10px] pt-2">
            <div>
              <div className="h-8 border-b border-slate-300 mb-1" />
              <div className="font-bold text-slate-600">TexWeb Authorized Signature</div>
            </div>
            <div>
              <div className="h-8 border-b border-slate-300 mb-1" />
              <div className="font-bold text-slate-600">Client Confirmation</div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Clearance to avoid overlapping official footer ribbon */}
        <div className="h-16 w-full shrink-0 relative pointer-events-none z-10" />
      </div>
    </div>
  );
}
