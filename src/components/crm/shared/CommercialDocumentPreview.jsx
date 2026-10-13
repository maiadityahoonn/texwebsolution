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
