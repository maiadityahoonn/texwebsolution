"use client";

export function cleanMetaPhone(val) {
  if (!val) return "";
  let p = String(val).replace(/^p:/i, "").trim();
  p = p.replace(/[^0-9+]/g, "");
  if (p.startsWith("+91") && p.length === 13) {
    return `+91 ${p.slice(3, 8)} ${p.slice(8)}`;
  }
  return p;
}

export function cleanMetaAnswerLabel(value) {
  return String(value || "").trim();
}

export function cleanMetaService(val) {
  return cleanMetaAnswerLabel(val || "Meta Inbound Lead");
}

export function cleanMetaBudgetValue(val) {
  return cleanMetaAnswerLabel(val);
}

export function cleanMetaBudget(val) {
  if (!val) return "";
  const b = String(val).toLowerCase().replace(/_/g, " ").trim();
  if (b.includes("below") && b.includes("40")) return "Below ₹40,000";
  if (b.includes("80") && b.includes("100")) return "₹80,000 - ₹1,00,000";
  if (b.includes("40") && b.includes("80")) return "₹40,000 - ₹80,000";
  if (b.includes("above") || b.includes("100")) return "Above ₹1,00,000";
  return val.replace(/_/g, " ");
}

export function normalizeHeader(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/^\uFEFF/, "")
    .replace(/[\s_-]+/g, "")
    .replace(/[?().]/g, "")
    .trim();
}

export function pickFirstValue(cols, indexes) {
  for (const idx of indexes) {
    const value = idx !== -1 ? cols[idx] : "";
    if (value && String(value).trim()) return value;
  }
  return "";
}

export function splitDelimitedLine(line, delimiter) {
  const tokens = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      tokens.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  tokens.push(current.trim());
  return tokens;
}

export function decodeLeadFile(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder("utf-16le").decode(buffer.slice(2));
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder("utf-16be").decode(buffer.slice(2));
  return new TextDecoder("utf-8").decode(buffer).replace(/^\uFEFF/, "");
}

export function parseDelimitedData(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\r$/, ""))
    .filter((line) => line.trim());

  if (lines.length < 2) {
    return {
      error: "Please provide at least a header row and one lead row.",
      leads: [],
    };
  }

  const headerLine = lines[0];
  const delimiter = headerLine.includes("\t") ? "\t" : ",";
  const headers = splitDelimitedLine(headerLine, delimiter);
  const normalizedHeaders = headers.map(normalizeHeader);
  const findIdx = (patterns) => {
    const normalizedPatterns = patterns.map(normalizeHeader);
    return normalizedHeaders.findIndex((h) => normalizedPatterns.some((p) => h.includes(p)));
  };

  const nameIdx = findIdx(["full_name", "full name", "name", "customer", "पूरा_नाम"]);
  const emailIdx = findIdx(["email", "mail", "ईमेल"]);
  const phoneIdx = findIdx(["phone_number", "phone", "mobile", "मोबाइल"]);
  const serviceIdx = findIdx(["what_service_are_you_looking_for", "service"]);
  const budgetIdx = findIdx(["choose_your_budget_range", "budget"]);
  const conditionalServiceIndexes = [
    findIdx(["what_does_your_business_need"]),
    findIdx(["what_service_are_you_looking_for"]),
    findIdx(["what_type_of_app_are_you_looking_to_build"]),
    findIdx(["what_would_you_like_to_improve_or_manage_with_software"]),
    findIdx(["which_area_would_you_like_to_automate"]),
    findIdx(["what_is_your_main_digital_marketing_goal"]),
    serviceIdx,
  ];
  const conditionalBudgetIdx = findIdx(["what_is_your_approximate_budget_for_this_project", "choose_your_budget_range", "budget"]);
  const platformIdx = findIdx(["platform"]);
  const campaignIdx = findIdx(["campaign_name", "campaign"]);
  const adIdx = findIdx(["ad_name", "ad"]);
  const formIdx = findIdx(["form_name", "form"]);
  const createdIdx = findIdx(["created_time", "created"]);
  const leadStatusIdx = findIdx(["lead_status", "lead status"]);
  const cityIdx = findIdx(["city"]);
  const stateIdx = findIdx(["state"]);
  const idIdx = findIdx(["id"]);
  const adIdIdx = findIdx(["ad_id"]);
  const adsetIdIdx = findIdx(["adset_id"]);
  const campaignIdIdx = findIdx(["campaign_id"]);
  const formIdIdx = findIdx(["form_id"]);

  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitDelimitedLine(lines[i], delimiter);
    if (cols.length < 2) continue;

    const rawName = nameIdx !== -1 ? cols[nameIdx] : "";
    const rawEmail = emailIdx !== -1 ? cols[emailIdx] : "";
    const rawPhone = phoneIdx !== -1 ? cols[phoneIdx] : "";
    const rawService = pickFirstValue(cols, conditionalServiceIndexes);
    const rawBudget = conditionalBudgetIdx !== -1 ? cols[conditionalBudgetIdx] : (budgetIdx !== -1 ? cols[budgetIdx] : "");
    const rawPlatform = platformIdx !== -1 ? cols[platformIdx] : "ig";
    const rawCampaign = campaignIdx !== -1 ? cols[campaignIdx] : "";
    const rawAd = adIdx !== -1 ? cols[adIdx] : "";
    const rawForm = formIdx !== -1 ? cols[formIdx] : "";
    const rawCreated = createdIdx !== -1 ? cols[createdIdx] : "";
    const rawLeadStatus = leadStatusIdx !== -1 ? cols[leadStatusIdx] : "";
    const rawCity = cityIdx !== -1 ? cols[cityIdx] : "";
    const rawState = stateIdx !== -1 ? cols[stateIdx] : "";
    const rawMetaId = idIdx !== -1 ? cols[idIdx] : "";
    const rawFormAnswers = Object.fromEntries(
      headers
        .map((header, index) => [header, cols[index] || ""])
        .filter(([header, value]) => header && String(value || "").trim())
    );

    if (!rawName && !rawPhone && !rawEmail) continue;

    const cleanedPhone = cleanMetaPhone(rawPhone);
    const cleanedService = cleanMetaService(rawService);
    const cleanedBudget = cleanMetaBudgetValue(rawBudget);

    const platformLabel = rawPlatform === "fb" ? "Facebook" : rawPlatform === "ig" ? "Instagram" : "Meta Ads";

    const notesParts = [
      rawCampaign ? `Campaign: ${rawCampaign}` : null,
      rawAd ? `Ad: ${rawAd}` : null,
      rawForm ? `Form: ${rawForm}` : null,
      cleanedBudget ? `Budget: ${cleanedBudget}` : null,
      rawCity || rawState ? `Location: ${[rawCity, rawState].filter(Boolean).join(", ")}` : null,
      rawMetaId ? `Meta Lead ID: ${rawMetaId}` : null,
      rawCreated ? `Meta Created: ${rawCreated}` : null,
      rawLeadStatus ? `Meta Status: ${rawLeadStatus}` : null,
    ].filter(Boolean);

    results.push({
      name: rawName || rawEmail?.split("@")[0] || "Meta Lead",
      phone: cleanedPhone || "Not provided",
      email: rawEmail || "",
      service: cleanedService,
      source: `Meta Ads (${platformLabel})`,
      status: "New",
      notes: notesParts.join(" | ") || "Inbound inquiry via Meta Ads",
      meta_lead_id: rawMetaId.replace(/^l:/i, "") || null,
      ad_id: adIdIdx !== -1 ? cols[adIdIdx] : null,
      adset_id: adsetIdIdx !== -1 ? cols[adsetIdIdx] : null,
      campaign_id: campaignIdIdx !== -1 ? cols[campaignIdIdx] : null,
      form_id: formIdIdx !== -1 ? cols[formIdIdx] : null,
      form_name: rawForm || null,
      platform: rawPlatform === "fb" ? "Facebook" : rawPlatform === "ig" ? "Instagram" : rawPlatform || "Meta Ads",
      budget_range: cleanedBudget || null,
      raw_metadata: {
        source: "meta_excel_import",
        form_answers: rawFormAnswers,
        original_payload: rawFormAnswers,
      },
      city: rawCity,
      state: rawState,
      budget: cleanedBudget,
      campaign: rawCampaign,
      ad: rawAd,
    });
  }

  if (results.length === 0) {
    return {
      error: "Could not extract leads. Please check column headers.",
      leads: [],
    };
  }

  return { error: "", leads: results };
}
