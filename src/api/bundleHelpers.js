// src/api/bundleHelpers.js

const VALIDITY_MAP = {
  daily:   "Until midnight",
  "3-day": "3 days",
  weekly:  "7 days",
  monthly: "30 days",
};

/**
 * Parse subCategory from the description string.
 * "20MB daily data bundle"   → "daily"
 * "500MB 3-day bundle"       → "3-day"
 * "2GB weekly bundle"        → "weekly"
 * "3GB monthly bundle"       → "monthly"
 */
function parseSubCategory(description = "") {
  const d = description.toLowerCase();
  if (d.includes("3-day") || d.includes("3 day")) return "3-day";
  if (d.includes("weekly"))  return "weekly";
  if (d.includes("monthly")) return "monthly";
  return "daily"; // default
}

/**
 * Assign a display label based on category + subCategory.
 */
function getLabel(category, subCategory) {
  if (category === "night")                          return "Night";
  if (category === "voice")                          return "Voice";
  if (category === "social")                         return "Social";
  if (category === "data" && subCategory === "daily")   return "Best Value";
  if (category === "data" && subCategory === "weekly")  return "Recommended";
  if (category === "data" && subCategory === "3-day")   return "Popular";
  if (category === "data" && subCategory === "monthly") return "Recommended";
  return "Popular";
}

/** "1.0" → "1", "1.50" → "1.5", "8.30" → "8.3", "20" → "20" */
function formatNumber(n) {
  return String(parseFloat(n));
}

/** Fix casing of GB/MB/Min inside any free text (used for fallbacks). */
function normalizeUnitInText(text = "") {
  return text.replace(/\b(gb|mb|min)\b/gi, (m) => {
    const u = m.toLowerCase();
    if (u === "gb") return "GB";
    if (u === "mb") return "MB";
    return "Min";
  });
}

/**
 * Extract a human-readable size from the bundle code.
 * "DATA-20MB-DAILY" → "20 MB"
 * "1GB"             → "1 GB"
 * "1.0GB"           → "1 GB"
 * "1.50GB"          → "1.5 GB"
 * "8.3gb"           → "8.3 GB"
 * "500mb"           → "500 MB"
 * "500MIN"          → "500 Min"
 */
function parseName(code = "", fallback = "") {
  const match = code.match(/(\d+(?:\.\d+)?)\s*(GB|MB|MIN)/i);
  if (!match) return normalizeUnitInText(fallback);

  const [, numRaw, unitRaw] = match;
  const num  = formatNumber(numRaw);
  const unit = unitRaw.toUpperCase();
  const unitDisplay = unit === "MIN" ? "Min" : unit; // GB / MB / Min
  return `${num} ${unitDisplay}`;
}

/**
 * Extract size in MB as a number (for sorting smallest → biggest).
 * "1GB"   → 1024
 * "500MB" → 500
 * "20MB"  → 20
 * Returns Infinity if no size found so those sink to the end.
 */
function parseSizeMb(code = "") {
  const match = code.match(/(\d+(?:\.\d+)?)\s*(GB|MB)/i);
  if (!match) return Infinity;
  const [, num, unit] = match;
  const n = parseFloat(num);
  return unit.toUpperCase() === "GB" ? n * 1024 : n;
}

/**
 * Transforms a raw ApiBundle into the shape BundlesPage cards expect.
 */
export function normalizeBundle(b) {
  const category    = b.category?.toLowerCase() ?? "data";
  const subCategory = parseSubCategory(b.description);
  const priceNum    = Number(b.price);

  return {
    id:          b.id,
    code:        b.code,
    category,
    subCategory,
    name:        parseName(b.code, b.description),
    description: b.description,
    validity:    VALIDITY_MAP[subCategory] ?? subCategory,
    price:       `${b.currency} ${priceNum.toFixed(2)}`,
    label:       getLabel(category, subCategory),
    badge:       category.charAt(0).toUpperCase() + category.slice(1),
    active:      b.active,
    sizeMb:      parseSizeMb(b.code),   // used for sorting
  };
}