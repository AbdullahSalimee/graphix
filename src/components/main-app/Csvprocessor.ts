/**
 * csvProcessor.ts — Ultimate Edition
 * ─────────────────────────────────────────────────────────────────────────────
 * Standalone CSV → Plotly config engine. Zero AI, zero dependencies.
 *
 * Chart types covered (20):
 *   line · multiline · area · bar · grouped-bar · horizontal-bar ·
 *   stacked-bar · pie · donut · scatter · bubble · heatmap · waterfall ·
 *   radar · histogram · box · violin · funnel · candlestick · treemap
 *
 * Detection pipeline (in priority order):
 *   candlestick → funnel → waterfall → treemap → heatmap → radar →
 *   pie/donut → bubble → scatter → box/violin → histogram →
 *   multiline → line → grouped-bar → stacked-bar → horizontal-bar → bar
 *
 * Public API:
 *   processCSV(rawText: string): CSVProcessResult
 *     ok:true  → { plotlyData, plotlyLayout, chartTypeLabel, reason }
 *     ok:false → { reason }  — caller falls through to AI
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

type ColKind = "numeric" | "date" | "categorical" | "boolean" | "id";

interface Col {
  name: string;
  lower: string; // name.toLowerCase() — precomputed
  kind: ColKind;
  raw: string[]; // raw cell strings per row
  nums: number[]; // numeric values (empty if not numeric)
  unique: Set<string>;
  uniqueCount: number;
  nullFrac: number; // 0–1
  isMonotonic: boolean; // non-decreasing nums
  min: number;
  max: number;
  mean: number;
  hasNegative: boolean;
  hasPositive: boolean;
}

export type CSVProcessResult =
  | {
      ok: true;
      plotlyData: any[];
      plotlyLayout: any;
      chartTypeLabel: string;
      reason: string;
    }
  | { ok: false; reason: string };

// ══════════════════════════════════════════════════════════════════════════════
// 1. PARSING
// ══════════════════════════════════════════════════════════════════════════════

function detectDelimiter(text: string): string {
  // Sample first 5 non-empty lines
  const lines = text
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .slice(0, 5);
  const candidates = [",", ";", "\t", "|"];
  let best = ",";
  let bestScore = -1;
  for (const d of candidates) {
    const counts = lines.map(
      (l) =>
        (l.match(new RegExp(`\\${d === "\t" ? "t" : d}`, "g")) ?? []).length,
    );
    const min = Math.min(...counts);
    const consistency = counts.filter((c) => c === counts[0]).length;
    const score = min * 10 + consistency;
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }
  return best;
}

function splitLine(line: string, delim: string): string[] {
  const res: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQ = !inQ;
    } else if (ch === delim && !inQ) {
      res.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  res.push(cur.trim());
  return res;
}

function parseCSV(
  raw: string,
): { headers: string[]; rows: Record<string, string>[] } | null {
  const text = raw.replace(/^\uFEFF/, "").trim();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return null;

  const delim = detectDelimiter(text);
  const headers = splitLine(lines[0], delim).map((h) =>
    h.replace(/^"|"$/g, "").trim(),
  );
  if (headers.length < 2 || headers.some((h) => h === "")) {
    // Try recovering: strip empty trailing headers
    while (headers.length > 0 && headers[headers.length - 1] === "")
      headers.pop();
    if (headers.length < 2) return null;
  }

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = splitLine(lines[i], delim);
    if (parts.every((p) => p === "")) continue; // blank row
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = (parts[j] ?? "").replace(/^"|"$/g, "").trim();
    });
    rows.push(row);
  }
  return rows.length ? { headers, rows } : null;
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. COLUMN PROFILING
// ══════════════════════════════════════════════════════════════════════════════

const NULL_VALUES = new Set([
  "",
  "null",
  "na",
  "n/a",
  "none",
  "#n/a",
  "-",
  "–",
  "—",
  ".",
  "?",
  "undefined",
]);
const DATE_NAME_RE =
  /date|month|year|week|day|time|period|quarter|timestamp|created|updated|when|dt\b/i;
const DATE_VAL_RE =
  /^\d{4}[-/\.]\d{1,2}([-/\.]\d{1,2})?$|^\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}$|^\d{4}$|^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;
const BOOL_RE = /^(true|false|yes|no|1|0|y|n)$/i;
const ID_NAME_RE = /^(id|_id|uuid|index|key|serial|row_?num|#)$|_id$/i;

function tryNum(s: string): number | null {
  const c = s.replace(/[$€£¥,%\s]/g, "").replace(/,/g, "");
  if (c === "" || c === "-") return null;
  const n = Number(c);
  return isNaN(n) ? null : n;
}

function profileCol(name: string, rows: Record<string, string>[]): Col {
  const lower = name.toLowerCase();
  const raw = rows.map((r) => r[name] ?? "");
  const nonNull = raw.filter((v) => !NULL_VALUES.has(v.toLowerCase()));
  const nullFrac = 1 - nonNull.length / Math.max(raw.length, 1);
  const unique = new Set(raw);

  // ── Boolean ──────────────────────────────────────────────────────────────
  if (nonNull.length > 0 && nonNull.every((v) => BOOL_RE.test(v))) {
    return make(name, lower, "boolean", raw, [], unique, nullFrac);
  }

  // ── Numeric ──────────────────────────────────────────────────────────────
  const parsedNums = raw.map((v) =>
    NULL_VALUES.has(v.toLowerCase()) ? null : tryNum(v),
  );
  const numHits = parsedNums.filter((n) => n !== null).length;
  if (nonNull.length > 0 && numHits / Math.max(nonNull.length, 1) >= 0.8) {
    const nums = parsedNums.map((n) => n ?? NaN).filter((n) => !isNaN(n));
    return make(name, lower, "numeric", raw, nums, unique, nullFrac);
  }

  // ── Date ─────────────────────────────────────────────────────────────────
  if (DATE_NAME_RE.test(lower)) {
    return make(name, lower, "date", raw, [], unique, nullFrac);
  }
  if (
    nonNull.length > 0 &&
    nonNull.filter((v) => DATE_VAL_RE.test(v)).length / nonNull.length >= 0.65
  ) {
    return make(name, lower, "date", raw, [], unique, nullFrac);
  }

  // ── ID ───────────────────────────────────────────────────────────────────
  if (ID_NAME_RE.test(lower) || unique.size === raw.length) {
    return make(name, lower, "id", raw, [], unique, nullFrac);
  }

  return make(name, lower, "categorical", raw, [], unique, nullFrac);
}

function make(
  name: string,
  lower: string,
  kind: ColKind,
  raw: string[],
  nums: number[],
  unique: Set<string>,
  nullFrac: number,
): Col {
  const sorted = [...nums].sort((a, b) => a - b);
  const isMonotonic =
    nums.length > 1 && nums.every((v, i) => i === 0 || v >= nums[i - 1]);
  const min = sorted[0] ?? 0;
  const max = sorted[sorted.length - 1] ?? 0;
  const mean = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  return {
    name,
    lower,
    kind,
    raw,
    nums,
    unique,
    uniqueCount: unique.size,
    nullFrac,
    isMonotonic,
    min,
    max,
    mean,
    hasNegative: nums.some((n) => n < 0),
    hasPositive: nums.some((n) => n > 0),
  };
}

// ── Keyword helpers ───────────────────────────────────────────────────────────

function has(col: Col, ...words: string[]): boolean {
  return words.some((w) => col.lower.includes(w));
}

function hasAny(col: Col, patterns: RegExp): boolean {
  return patterns.test(col.lower);
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. BROKEN CSV DETECTION
// ══════════════════════════════════════════════════════════════════════════════

function detectBroken(raw: string): { broken: boolean; reason: string } {
  const text = raw.replace(/^\uFEFF/, "").trim();
  if (!text) return { broken: true, reason: "File is empty." };

  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2)
    return { broken: true, reason: "Only one line — no data rows." };

  const delim = detectDelimiter(text);
  const hCount = splitLine(lines[0], delim).length;
  if (hCount < 2) return { broken: true, reason: "Only one column detected." };

  // Sample up to 100 rows
  const sample = lines.slice(1, 101);
  const bad = sample.filter((l) => {
    const cnt = splitLine(l, delim).length;
    return Math.abs(cnt - hCount) > Math.max(2, Math.floor(hCount * 0.3));
  }).length;
  if (bad / sample.length > 0.45)
    return {
      broken: true,
      reason: `${Math.round((bad / sample.length) * 100)}% of rows have mismatched column counts.`,
    };

  return { broken: false, reason: "" };
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. CHART TYPE DETECTION
// ══════════════════════════════════════════════════════════════════════════════

interface Decision {
  type: string;
  label: string;
  reason: string;
  meta: {
    xCol?: Col;
    yCols?: Col[];
    labelCol?: Col;
    valueCol?: Col;
    sizeCol?: Col;
    colorCol?: Col;
    openCol?: Col;
    highCol?: Col;
    lowCol?: Col;
    closeCol?: Col;
    parentCol?: Col;
    extra?: Record<string, any>;
  };
}

function detectChart(cols: Col[], rowCount: number): Decision | null {
  const nums = cols.filter((c) => c.kind === "numeric");
  const dates = cols.filter((c) => c.kind === "date");
  const cats = cols.filter((c) => c.kind === "categorical");
  const bools = cols.filter((c) => c.kind === "boolean");
  const nonId = cols.filter((c) => c.kind !== "id");

  // Shorthand: lowest-cardinality categorical
  const bestCat = cats.length
    ? cats.reduce((a, b) => (a.uniqueCount < b.uniqueCount ? a : b))
    : null;

  // ── 1. CANDLESTICK ──────────────────────────────────────────────────────
  // Needs: date/label col + open, high, low, close numeric cols
  const openCol = nums.find((c) => has(c, "open"));
  const highCol = nums.find((c) => has(c, "high"));
  const lowCol = nums.find((c) => has(c, "low"));
  const closeCol = nums.find((c) => has(c, "close"));
  if (
    openCol &&
    highCol &&
    lowCol &&
    closeCol &&
    (dates.length || cats.length)
  ) {
    const xCol = dates[0] ?? cats[0];
    return {
      type: "candlestick",
      label: "Candlestick Chart",
      reason:
        "open/high/low/close columns detected — classic OHLC financial chart.",
      meta: { xCol, openCol, highCol, lowCol, closeCol },
    };
  }

  // ── 2. FUNNEL ────────────────────────────────────────────────────────────
  // Signals: column named "stage/step/phase/funnel" + 1 numeric value col
  const stageCol = cats.find((c) =>
    hasAny(c, /stage|step|phase|funnel|level|tier|conversion/),
  );
  if (stageCol && nums.length === 1) {
    return {
      type: "funnel",
      label: "Funnel Chart",
      reason: `"${stageCol.name}" looks like a funnel stage column.`,
      meta: { labelCol: stageCol, valueCol: nums[0] },
    };
  }
  // Funnel signal: exactly 1 string col + 1 numeric col + all values strictly decreasing
  if (
    cats.length === 1 &&
    nums.length === 1 &&
    rowCount >= 3 &&
    rowCount <= 12
  ) {
    const vals = nums[0].nums;
    const isDecreasing = vals.every((v, i) => i === 0 || v <= vals[i - 1]);
    if (isDecreasing && vals[0] > vals[vals.length - 1] * 1.5) {
      return {
        type: "funnel",
        label: "Funnel Chart",
        reason:
          "Strictly decreasing values with categorical labels → conversion funnel.",
        meta: { labelCol: cats[0], valueCol: nums[0] },
      };
    }
  }

  // ── 3. WATERFALL ─────────────────────────────────────────────────────────
  // Signal A: explicit type/measure column
  const measureCol = cols.find((c) =>
    /^(type|measure|direction|kind)$/i.test(c.name),
  );
  if (measureCol) {
    const vals = measureCol.raw.map((v) => v.toLowerCase());
    const wfWords = [
      "absolute",
      "relative",
      "total",
      "increase",
      "decrease",
      "start",
      "end",
      "subtotal",
      "begin",
      "final",
    ];
    if (
      vals.some((v) => wfWords.some((w) => v.includes(w))) &&
      nums.length >= 1
    ) {
      return {
        type: "waterfall",
        label: "Waterfall Chart",
        reason: `"${measureCol.name}" contains waterfall measure types.`,
        meta: {
          xCol: cats[0] ?? dates[0],
          valueCol: nums[0],
          extra: { measureCol },
        },
      };
    }
  }
  // Signal B: 1 label + 1 numeric, mixed pos/neg, ≤20 rows
  if (
    cats.length >= 1 &&
    nums.length === 1 &&
    nums[0].hasNegative &&
    nums[0].hasPositive &&
    rowCount <= 20
  ) {
    return {
      type: "waterfall",
      label: "Waterfall Chart",
      reason:
        "Mixed positive/negative single numeric column with categorical labels — waterfall bridge chart.",
      meta: { xCol: cats[0], valueCol: nums[0] },
    };
  }

  // ── 4. TREEMAP ───────────────────────────────────────────────────────────
  // Signals: 2+ categorical cols (parent + child hierarchy) + 1 size numeric
  const parentCol = cats.find((c) =>
    hasAny(c, /parent|group|category|sector|segment|division|department/),
  );
  const childCol = cats.find(
    (c) =>
      c !== parentCol && hasAny(c, /name|label|item|product|sub|child|title/),
  );
  if (parentCol && childCol && nums.length >= 1) {
    return {
      type: "treemap",
      label: "Treemap",
      reason: `Hierarchy detected: "${parentCol.name}" → "${childCol.name}" with size metric "${nums[0].name}".`,
      meta: { labelCol: childCol, parentCol, valueCol: nums[0] },
    };
  }

  // ── 5. HEATMAP ───────────────────────────────────────────────────────────
  // First col = row labels, all remaining cols = numeric, col names look like
  // time/category axis (NOT metric names), no date cols, ≥3 rows
  const heatmapAxisRE =
    /^(mon|tue|wed|thu|fri|sat|sun|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|q[1-4]|week\d?|wk\d?|h[1-2]|\d{4}|north|south|east|west)/i;
  const metricRE =
    /revenue|expense|profit|cost|sales|income|loss|amount|value|price|rate|score|count|total|avg|mean|sum|pct|growth|margin|qty|quantity|volume/i;
  const restCols = cols.slice(1);
  const allRestNumeric =
    restCols.length >= 3 && restCols.every((c) => c.kind === "numeric");
  const restLookLikeAxis = restCols.some(
    (c) =>
      heatmapAxisRE.test(c.name) ||
      (!metricRE.test(c.name) && c.name.length <= 12),
  );
  if (
    dates.length === 0 &&
    !cols[0]?.kind.includes("numeric") &&
    allRestNumeric &&
    restLookLikeAxis &&
    rowCount >= 3
  ) {
    return {
      type: "heatmap",
      label: "Heatmap",
      reason: `Matrix structure: "${cols[0].name}" as row labels, "${restCols
        .map((c) => c.name)
        .slice(0, 3)
        .join(", ")}..." as column axis.`,
      meta: {
        labelCol: cols[0],
        yCols: restCols.filter((c) => c.kind === "numeric"),
      },
    };
  }
  // Also: correlation matrix (all numeric, square-ish, col names match row values)
  if (
    nums.length >= 4 &&
    cats.length <= 1 &&
    rowCount >= 4 &&
    Math.abs(nums.length - rowCount) <= 2
  ) {
    return {
      type: "heatmap",
      label: "Heatmap",
      reason: `Near-square numeric matrix (${rowCount} rows × ${nums.length} cols) — correlation/intensity heatmap.`,
      meta: { labelCol: cats[0], yCols: nums },
    };
  }

  // ── 6. RADAR / SPIDER ────────────────────────────────────────────────────
  // Signal A: first col explicitly named attribute/skill/metric/dimension
  const attrCol = cols[0];
  const isAttrCol = hasAny(
    attrCol,
    /attribute|metric|dimension|skill|criteria|factor|kpi|feature|category|axis/,
  );
  if (isAttrCol && nums.length >= 2 && rowCount >= 3 && rowCount <= 15) {
    return {
      type: "radar",
      label: "Radar / Spider Chart",
      reason: `"${attrCol.name}" defines radar axes with ${nums.length} series.`,
      meta: { xCol: attrCol, yCols: nums },
    };
  }
  // Signal B: small rows, 2-6 numeric series, all 0-100, no dates, categorical x
  if (
    rowCount >= 3 &&
    rowCount <= 12 &&
    nums.length >= 2 &&
    nums.length <= 6 &&
    cats.length >= 1 &&
    dates.length === 0 &&
    nums.every((c) => c.min >= 0 && c.max <= 100)
  ) {
    return {
      type: "radar",
      label: "Radar / Spider Chart",
      reason: `${rowCount} attribute rows, ${nums.length} series, all values 0–100 — radar chart.`,
      meta: { xCol: cats[0], yCols: nums },
    };
  }

  // ── 7. PIE / DONUT ───────────────────────────────────────────────────────
  if (
    cats.length >= 1 &&
    nums.length === 1 &&
    dates.length === 0 &&
    !nums[0].hasNegative &&
    rowCount >= 2 &&
    rowCount <= 15
  ) {
    const valName = nums[0].lower;
    const sum = nums[0].nums.reduce((a, b) => a + b, 0);
    const looksProportional =
      /share|percent|pct|portion|count|revenue|sales|amount|market|weight|fraction/.test(
        valName,
      ) ||
      (sum > 95 && sum < 105);
    if (looksProportional || rowCount <= 8) {
      const isDonut = rowCount > 5;
      return {
        type: isDonut ? "donut" : "pie",
        label: isDonut ? "Donut Chart" : "Pie Chart",
        reason: `${rowCount} categories × 1 numeric metric${sum > 95 && sum < 105 ? " (sums to ~100%)" : ""}.`,
        meta: { labelCol: cats[0], valueCol: nums[0] },
      };
    }
  }

  // ── 8. BUBBLE ────────────────────────────────────────────────────────────
  const sizeKeyRE =
    /population|size|volume|count|total|radius|weight|employees|users|views|audience|subscribers|market_?cap|gdp|revenue/i;
  const sizeCol = nums.find((c) => sizeKeyRE.test(c.name));
  if (
    nums.length >= 3 &&
    sizeCol &&
    (cats.length >= 1 || dates.length === 0) &&
    rowCount >= 5
  ) {
    const xC = nums.find((c) => c !== sizeCol) ?? nums[0];
    const yC = nums.find((c) => c !== sizeCol && c !== xC) ?? nums[1];
    const colorC = cats.find((c) =>
      hasAny(c, /continent|region|category|group|country|name|type|segment/),
    );
    return {
      type: "bubble",
      label: "Bubble Chart",
      reason: `"${sizeCol.name}" encodes bubble size; x="${xC.name}", y="${yC.name}".`,
      meta: { xCol: xC, yCols: [yC], sizeCol, colorCol: colorC },
    };
  }
  // Also: exactly 3 numeric cols with no size keyword but varying magnitudes
  if (nums.length === 3 && dates.length === 0 && rowCount >= 6) {
    const [n0, n1, n2] = nums;
    const sizeRange = n2.max - n2.min;
    if (sizeRange > 0 && sizeRange / (n2.mean || 1) > 0.5) {
      return {
        type: "bubble",
        label: "Bubble Chart",
        reason: `Three numeric dimensions — x="${n0.name}", y="${n1.name}", size="${n2.name}".`,
        meta: { xCol: n0, yCols: [n1], sizeCol: n2, colorCol: cats[0] },
      };
    }
  }

  // ── 9. SCATTER ───────────────────────────────────────────────────────────
  if (dates.length === 0 && nums.length === 2 && rowCount >= 8) {
    return {
      type: "scatter",
      label: "Scatter Plot",
      reason: `Two numeric columns — reveals correlation between "${nums[0].name}" and "${nums[1].name}".`,
      meta: { xCol: nums[0], yCols: [nums[1]], colorCol: bestCat ?? undefined },
    };
  }
  if (
    dates.length === 0 &&
    nums.length >= 2 &&
    cats.length === 1 &&
    rowCount >= 6
  ) {
    return {
      type: "scatter",
      label: "Scatter Plot",
      reason: `Numeric pair with categorical grouping by "${cats[0].name}".`,
      meta: { xCol: nums[0], yCols: [nums[1]], colorCol: cats[0] },
    };
  }

  // ── 10. BOX PLOT ─────────────────────────────────────────────────────────
  // Signals: explicitly named group/category col + 1-2 numeric cols + many rows
  const groupCol = cats.find((c) =>
    hasAny(
      c,
      /group|category|class|type|segment|region|gender|grade|team|species/,
    ),
  );
  if (groupCol && nums.length === 1 && rowCount >= 15) {
    return {
      type: "box",
      label: "Box Plot",
      reason: `"${groupCol.name}" groups + "${nums[0].name}" distribution over ${rowCount} rows.`,
      meta: { xCol: groupCol, yCols: [nums[0]] },
    };
  }
  // Many rows, 1 numeric, no good label col → violin
  if (nums.length === 1 && rowCount >= 30 && cats.length === 0) {
    return {
      type: "violin",
      label: "Violin Plot",
      reason: `Single numeric column "${nums[0].name}" with ${rowCount} rows — violin shows full distribution.`,
      meta: { xCol: nums[0], yCols: [] },
    };
  }

  // ── 11. HISTOGRAM ────────────────────────────────────────────────────────
  if (nums.length === 1 && rowCount >= 15) {
    return {
      type: "histogram",
      label: "Histogram",
      reason: `Single numeric column "${nums[0].name}" with ${rowCount} rows.`,
      meta: { xCol: nums[0], yCols: [] },
    };
  }

  // ── 12. MULTILINE ────────────────────────────────────────────────────────
  if ((dates.length >= 1 || cols[0]?.isMonotonic) && nums.length >= 2) {
    const xC = dates[0] ?? cols.find((c) => c.isMonotonic) ?? cols[0];
    const yCs = nums.filter((c) => c !== xC).slice(0, 6);
    return {
      type: "multiline",
      label: "Multi-Line Chart",
      reason: `Time axis "${xC.name}" with ${yCs.length} numeric series.`,
      meta: { xCol: xC, yCols: yCs },
    };
  }

  // ── 13. LINE ─────────────────────────────────────────────────────────────
  if (dates.length >= 1 && nums.length === 1) {
    return {
      type: "line",
      label: "Line Chart",
      reason: `Date axis "${dates[0].name}" with single metric "${nums[0].name}".`,
      meta: { xCol: dates[0], yCols: [nums[0]] },
    };
  }
  // Sequential categorical x + numerics → line
  if (rowCount >= 10 && nums.length >= 1 && cats.length >= 1) {
    const xC = cats.find((c) => DATE_NAME_RE.test(c.lower)) ?? cats[0];
    if (nums.length === 1) {
      return {
        type: "line",
        label: "Line Chart",
        reason: `"${xC.name}" as sequential x-axis with "${nums[0].name}" values.`,
        meta: { xCol: xC, yCols: [nums[0]] },
      };
    }
    return {
      type: "multiline",
      label: "Multi-Line Chart",
      reason: `"${xC.name}" as x-axis with ${nums.length} numeric series.`,
      meta: { xCol: xC, yCols: nums.slice(0, 6) },
    };
  }

  // ── 14. STACKED BAR ──────────────────────────────────────────────────────
  // Strong signal: boolean grouping + numerics, or explicitly named cols
  if (bools.length >= 1 && nums.length >= 1) {
    return {
      type: "stacked-bar",
      label: "Stacked Bar Chart",
      reason: `Boolean grouping "${bools[0].name}" — stacked bars show part/whole.`,
      meta: {
        xCol: bools[0],
        yCols: nums.slice(0, 5),
        extra: { barmode: "stack" },
      },
    };
  }
  const stackKeyRE =
    /q[1-4]|h[12]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i;
  if (
    cats.length >= 1 &&
    nums.length >= 3 &&
    nums.some((c) => stackKeyRE.test(c.name))
  ) {
    return {
      type: "stacked-bar",
      label: "Stacked Bar Chart",
      reason: `Multiple time-period numeric columns (${nums
        .map((c) => c.name)
        .slice(0, 3)
        .join(", ")}…) — stacked bar.`,
      meta: {
        xCol: bestCat!,
        yCols: nums.slice(0, 8),
        extra: { barmode: "stack" },
      },
    };
  }

  // ── 15. GROUPED BAR ──────────────────────────────────────────────────────
  if (
    cats.length >= 1 &&
    nums.length >= 2 &&
    nums.length <= 8 &&
    rowCount <= 30
  ) {
    return {
      type: "grouped-bar",
      label: "Grouped Bar Chart",
      reason: `${nums.length} numeric series across "${bestCat!.name}" categories — grouped bars compare series.`,
      meta: {
        xCol: bestCat!,
        yCols: nums.slice(0, 8),
        extra: { barmode: "group" },
      },
    };
  }

  // ── 16. HORIZONTAL BAR ───────────────────────────────────────────────────
  if (cats.length >= 1 && nums.length === 1 && bestCat!.uniqueCount > 10) {
    return {
      type: "horizontal-bar",
      label: "Horizontal Bar Chart",
      reason: `${bestCat!.uniqueCount} categories — horizontal bars give labels room to breathe.`,
      meta: { xCol: bestCat!, yCols: [nums[0]] },
    };
  }

  // ── 17. BAR (default) ────────────────────────────────────────────────────
  if (cats.length >= 1 && nums.length >= 1) {
    return {
      type: "bar",
      label: "Bar Chart",
      reason: `Categorical "${bestCat!.name}" × numeric "${nums[0].name}".`,
      meta: { xCol: bestCat!, yCols: [nums[0]] },
    };
  }

  // ── 18. All-numeric fallback → scatter ───────────────────────────────────
  if (nums.length >= 2) {
    return {
      type: "scatter",
      label: "Scatter Plot",
      reason: `All-numeric data — scatter plot of "${nums[0].name}" vs "${nums[1].name}".`,
      meta: { xCol: nums[0], yCols: [nums[1]] },
    };
  }

  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. PLOTLY CONFIG BUILDER
// ══════════════════════════════════════════════════════════════════════════════

const PALETTE = [
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#8b5cf6",
  "#14b8a6",
  "#84cc16",
  "#3b82f6",
  "#f43f5e",
  "#22c55e",
  "#eab308",
  "#a855f7",
];

function scaleSizes(nums: number[], lo = 8, hi = 48): number[] {
  const mn = Math.min(...nums),
    mx = Math.max(...nums),
    rng = mx - mn || 1;
  return nums.map((n) => lo + ((n - mn) / rng) * (hi - lo));
}

function xVals(col: Col) {
  return col.kind === "numeric" ? col.nums : col.raw;
}
function yVals(col: Col) {
  return col.nums.length > 0 ? col.nums : col.raw;
}

function clean(s: string) {
  return s.replace(/_/g, " ");
}

function buildConfig(
  d: Decision,
  rowCount: number,
): { data: any[]; layout: any } {
  const { type, meta } = d;
  const {
    xCol,
    yCols = [],
    labelCol,
    valueCol,
    sizeCol,
    colorCol,
    openCol,
    highCol,
    lowCol,
    closeCol,
    parentCol,
    extra,
  } = meta;

  // ── CANDLESTICK ───────────────────────────────────────────────────────────
  if (type === "candlestick") {
    return {
      data: [
        {
          type: "candlestick",
          x: xVals(xCol!),
          open: openCol!.nums,
          high: highCol!.nums,
          low: lowCol!.nums,
          close: closeCol!.nums,
          increasing: { line: { color: "#10b981" }, fillcolor: "#10b981" },
          decreasing: { line: { color: "#ef4444" }, fillcolor: "#ef4444" },
        },
      ],
      layout: {
        title: { text: `${closeCol!.name} — OHLC` },
        xaxis: { title: { text: xCol!.name }, rangeslider: { visible: false } },
        yaxis: { title: { text: "Price" } },
      },
    };
  }

  // ── FUNNEL ────────────────────────────────────────────────────────────────
  if (type === "funnel") {
    return {
      data: [
        {
          type: "funnel",
          y: labelCol!.raw,
          x: valueCol!.nums,
          textinfo: "value+percent initial",
          marker: { color: PALETTE },
          connector: { line: { color: "rgba(0,0,0,0.1)", width: 1 } },
        },
      ],
      layout: {
        title: { text: `${clean(valueCol!.name)} Funnel` },
        funnelmode: "stack",
      },
    };
  }

  // ── WATERFALL ─────────────────────────────────────────────────────────────
  if (type === "waterfall") {
    const x = xVals(xCol!);
    const y = valueCol!.nums;
    const mColData: Col | undefined = extra?.measureCol;
    const measure = mColData
      ? mColData.raw.map((v) => {
          const t = v.toLowerCase();
          if (/abs|start|begin/.test(t)) return "absolute";
          if (/total|end|final|sum|subtotal/.test(t)) return "total";
          return "relative";
        })
      : y.map((_, i) =>
          i === 0 ? "absolute" : i === y.length - 1 ? "total" : "relative",
        );
    return {
      data: [
        {
          type: "waterfall",
          x,
          y,
          measure,
          connector: {
            line: { color: "rgba(0,0,0,0.15)", width: 1, dash: "dot" },
          },
          increasing: { marker: { color: "#10b981" } },
          decreasing: { marker: { color: "#ef4444" } },
          totals: { marker: { color: "#6366f1" } },
          textposition: "outside",
          texttemplate: "%{y:,.0f}",
        },
      ],
      layout: {
        title: { text: `${clean(valueCol!.name)} Waterfall` },
        xaxis: { title: { text: xCol!.name } },
        yaxis: { title: { text: clean(valueCol!.name) } },
      },
    };
  }

  // ── TREEMAP ───────────────────────────────────────────────────────────────
  if (type === "treemap" && parentCol && labelCol && valueCol) {
    const parents = labelCol.raw.map((_, i) => parentCol.raw[i] ?? "");
    return {
      data: [
        {
          type: "treemap",
          labels: labelCol.raw,
          parents,
          values: valueCol.nums,
          textinfo: "label+value+percent parent",
          marker: { colorscale: "Viridis", showscale: true },
        },
      ],
      layout: {
        title: { text: `${clean(valueCol.name)} by ${clean(parentCol.name)}` },
      },
    };
  }

  // ── HEATMAP ───────────────────────────────────────────────────────────────
  if (type === "heatmap") {
    const valueCols = yCols.filter((c) => c.kind === "numeric");
    const z = Array.from({ length: Math.min(rowCount, 300) }, (_, i) =>
      valueCols.map((c) => c.nums[i] ?? 0),
    );
    const yLabels = labelCol
      ? labelCol.raw.slice(0, 300)
      : Array.from({ length: z.length }, (_, i) => String(i));
    return {
      data: [
        {
          type: "heatmap",
          z,
          x: valueCols.map((c) => clean(c.name)),
          y: yLabels,
          colorscale: "Viridis",
          showscale: true,
          hoverongaps: false,
        },
      ],
      layout: {
        title: { text: "Heatmap" },
        xaxis: { title: { text: "" }, tickangle: -30, automargin: true },
        yaxis: {
          title: { text: labelCol?.name ?? "Row" },
          autorange: "reversed",
        },
      },
    };
  }

  // ── RADAR ─────────────────────────────────────────────────────────────────
  if (type === "radar") {
    const theta = xVals(xCol!).map(String);
    return {
      data: yCols.map((col, i) => ({
        type: "scatterpolar",
        r: [...yVals(col), yVals(col)[0]], // close polygon
        theta: [...theta, theta[0]],
        fill: "toself",
        name: clean(col.name),
        opacity: 0.7,
        line: { color: PALETTE[i % PALETTE.length], width: 2 },
        marker: { color: PALETTE[i % PALETTE.length], size: 5 },
      })),
      layout: {
        title: { text: "Radar Chart" },
        polar: { radialaxis: { visible: true } },
      },
    };
  }

  // ── PIE / DONUT ───────────────────────────────────────────────────────────
  if (type === "pie" || type === "donut") {
    return {
      data: [
        {
          type: "pie",
          labels: labelCol!.raw,
          values: valueCol!.nums,
          hole: type === "donut" ? 0.45 : 0,
          marker: { colors: PALETTE, line: { color: "white", width: 2 } },
          textinfo: "label+percent",
          hoverinfo: "label+value+percent",
          sort: false,
        },
      ],
      layout: {
        title: { text: `${clean(valueCol!.name)} by ${clean(labelCol!.name)}` },
        showlegend: true,
      },
    };
  }

  // ── BUBBLE ────────────────────────────────────────────────────────────────
  if (type === "bubble") {
    const sizes = scaleSizes(sizeCol!.nums);
    const colorC = colorCol;

    if (colorC && colorC.uniqueCount <= 20) {
      const groups = [...new Set(colorC.raw)];
      return {
        data: groups.map((g, gi) => {
          const idx = colorC.raw
            .map((v, i) => (v === g ? i : -1))
            .filter((i) => i >= 0);
          return {
            type: "scatter",
            mode: "markers",
            name: String(g),
            x: idx.map((i) => xVals(xCol!)[i]),
            y: idx.map((i) => yVals(yCols[0])[i]),
            marker: {
              size: idx.map((i) => sizes[i]),
              color: PALETTE[gi % PALETTE.length],
              opacity: 0.75,
              line: { color: "white", width: 1 },
              sizemode: "diameter",
            },
          };
        }),
        layout: {
          title: { text: `${clean(yCols[0].name)} vs ${clean(xCol!.name)}` },
          xaxis: { title: { text: clean(xCol!.name) } },
          yaxis: { title: { text: clean(yCols[0].name) } },
        },
      };
    }
    return {
      data: [
        {
          type: "scatter",
          mode: "markers",
          x: xVals(xCol!),
          y: yVals(yCols[0]),
          marker: {
            size: sizes,
            color: PALETTE[0],
            opacity: 0.75,
            line: { color: "white", width: 1 },
            sizemode: "diameter",
          },
        },
      ],
      layout: {
        title: { text: `${clean(yCols[0].name)} vs ${clean(xCol!.name)}` },
        xaxis: { title: { text: clean(xCol!.name) } },
        yaxis: { title: { text: clean(yCols[0].name) } },
      },
    };
  }

  // ── SCATTER ───────────────────────────────────────────────────────────────
  if (type === "scatter") {
    const colorC = colorCol;
    if (colorC && colorC.uniqueCount <= 20) {
      const groups = [...new Set(colorC.raw)];
      return {
        data: groups.map((g, gi) => {
          const idx = colorC.raw
            .map((v, i) => (v === g ? i : -1))
            .filter((i) => i >= 0);
          return {
            type: "scatter",
            mode: "markers",
            name: String(g),
            x: idx.map((i) => xVals(xCol!)[i]),
            y: idx.map((i) => yVals(yCols[0])[i]),
            marker: {
              size: 8,
              color: PALETTE[gi % PALETTE.length],
              opacity: 0.8,
              line: { color: "white", width: 1 },
            },
          };
        }),
        layout: {
          title: { text: `${clean(yCols[0].name)} vs ${clean(xCol!.name)}` },
          xaxis: { title: { text: clean(xCol!.name) } },
          yaxis: { title: { text: clean(yCols[0].name) } },
        },
      };
    }
    return {
      data: [
        {
          type: "scatter",
          mode: "markers",
          x: xVals(xCol!),
          y: yVals(yCols[0]),
          marker: {
            size: 8,
            color: PALETTE[0],
            opacity: 0.8,
            line: { color: "white", width: 1 },
          },
        },
      ],
      layout: {
        title: { text: `${clean(yCols[0].name)} vs ${clean(xCol!.name)}` },
        xaxis: { title: { text: clean(xCol!.name) } },
        yaxis: { title: { text: clean(yCols[0].name) } },
      },
    };
  }

  // ── BOX ───────────────────────────────────────────────────────────────────
  if (type === "box") {
    if (xCol && xCol.kind !== "numeric" && xCol.uniqueCount <= 20) {
      const groups = [...new Set(xCol.raw)];
      return {
        data: groups.map((g, gi) => {
          const vals = xCol.raw
            .map((v, i) => (v === g ? yVals(yCols[0])[i] : null))
            .filter((v) => v !== null);
          return {
            type: "box",
            y: vals,
            name: String(g),
            marker: { color: PALETTE[gi % PALETTE.length] },
            boxpoints: "outliers",
          };
        }),
        layout: {
          title: { text: `${clean(yCols[0].name)} by ${clean(xCol.name)}` },
          yaxis: { title: { text: clean(yCols[0].name) } },
          showlegend: false,
        },
      };
    }
    return {
      data: [
        {
          type: "box",
          y: yVals(yCols[0] ?? xCol!),
          name: clean((yCols[0] ?? xCol!).name),
          marker: { color: PALETTE[0] },
          boxpoints: "outliers",
        },
      ],
      layout: {
        title: { text: `Distribution of ${clean((yCols[0] ?? xCol!).name)}` },
      },
    };
  }

  // ── VIOLIN ────────────────────────────────────────────────────────────────
  if (type === "violin") {
    return {
      data: [
        {
          type: "violin",
          y: xCol!.nums,
          name: clean(xCol!.name),
          line: { color: PALETTE[0] },
          fillcolor: PALETTE[0] + "33",
          meanline: { visible: true },
        },
      ],
      layout: { title: { text: `Distribution of ${clean(xCol!.name)}` } },
    };
  }

  // ── HISTOGRAM ────────────────────────────────────────────────────────────
  if (type === "histogram") {
    return {
      data: [
        {
          type: "histogram",
          x: xCol!.nums,
          nbinsx: Math.min(Math.ceil(Math.sqrt(rowCount)), 60),
          marker: {
            color: PALETTE[0],
            opacity: 0.85,
            line: { color: "rgba(255,255,255,0.5)", width: 1 },
          },
        },
      ],
      layout: {
        title: { text: `Distribution of ${clean(xCol!.name)}` },
        xaxis: { title: { text: clean(xCol!.name) } },
        yaxis: { title: { text: "Count" } },
        bargap: 0.03,
      },
    };
  }

  // ── LINE / MULTILINE ──────────────────────────────────────────────────────
  if (type === "line" || type === "multiline") {
    const xV = xVals(xCol!);
    return {
      data: yCols.map((col, i) => ({
        type: "scatter",
        mode: rowCount > 150 ? "lines" : "lines+markers",
        x: xV,
        y: yVals(col),
        name: clean(col.name),
        line: { color: PALETTE[i % PALETTE.length], width: 2.5 },
        marker: { size: 5, color: PALETTE[i % PALETTE.length] },
      })),
      layout: {
        title: {
          text:
            yCols.map((c) => clean(c.name)).join(", ") +
            " over " +
            clean(xCol!.name),
        },
        xaxis: { title: { text: clean(xCol!.name) } },
        yaxis: { title: { text: clean(yCols[0].name) } },
      },
    };
  }

  // ── STACKED BAR ───────────────────────────────────────────────────────────
  if (type === "stacked-bar") {
    const xV = xVals(xCol!);
    return {
      data: yCols.map((col, i) => ({
        type: "bar",
        x: xV,
        y: yVals(col),
        name: clean(col.name),
        marker: { color: PALETTE[i % PALETTE.length] },
      })),
      layout: {
        title: {
          text:
            yCols.map((c) => clean(c.name)).join(" + ") +
            " by " +
            clean(xCol!.name),
        },
        barmode: "stack",
        xaxis: { title: { text: clean(xCol!.name) } },
        yaxis: { title: { text: "Value" } },
      },
    };
  }

  // ── GROUPED BAR ──────────────────────────────────────────────────────────
  if (type === "grouped-bar") {
    const xV = xVals(xCol!);
    return {
      data: yCols.map((col, i) => ({
        type: "bar",
        x: xV,
        y: yVals(col),
        name: clean(col.name),
        marker: { color: PALETTE[i % PALETTE.length] },
      })),
      layout: {
        title: {
          text:
            yCols.map((c) => clean(c.name)).join(", ") +
            " by " +
            clean(xCol!.name),
        },
        barmode: "group",
        xaxis: {
          title: { text: clean(xCol!.name) },
          tickangle: xCol!.uniqueCount > 8 ? -35 : 0,
        },
        yaxis: { title: { text: clean(yCols[0].name) } },
      },
    };
  }

  // ── HORIZONTAL BAR ───────────────────────────────────────────────────────
  if (type === "horizontal-bar") {
    return {
      data: yCols.map((col, i) => ({
        type: "bar",
        orientation: "h",
        y: xVals(xCol!),
        x: yVals(col),
        name: clean(col.name),
        marker: { color: PALETTE[i % PALETTE.length] },
      })),
      layout: {
        title: { text: clean(yCols[0].name) + " by " + clean(xCol!.name) },
        xaxis: { title: { text: clean(yCols[0].name) } },
        yaxis: { title: { text: clean(xCol!.name) }, automargin: true },
      },
    };
  }

  // ── BAR (default) ────────────────────────────────────────────────────────
  if (xCol && yCols.length >= 1) {
    const xV = xVals(xCol);
    return {
      data: yCols.map((col, i) => ({
        type: "bar",
        x: xV,
        y: yVals(col),
        name: clean(col.name),
        marker: { color: PALETTE[i % PALETTE.length], opacity: 0.9 },
      })),
      layout: {
        title: {
          text:
            yCols.map((c) => clean(c.name)).join(", ") +
            " by " +
            clean(xCol.name),
        },
        barmode: yCols.length > 1 ? "group" : undefined,
        xaxis: {
          title: { text: clean(xCol.name) },
          tickangle: xCol.uniqueCount > 8 ? -35 : 0,
        },
        yaxis: { title: { text: clean(yCols[0].name) } },
      },
    };
  }

  return { data: [], layout: { title: { text: "Chart" } } };
}

// ══════════════════════════════════════════════════════════════════════════════
// 6. PUBLIC API
// ══════════════════════════════════════════════════════════════════════════════

/**
 * processCSV(rawText)
 *
 * Pass the raw text of an uploaded CSV file.
 *
 * Returns:
 *   { ok: true,  plotlyData, plotlyLayout, chartTypeLabel, reason }
 *     → render the chart directly, skip the AI API call
 *
 *   { ok: false, reason }
 *     → fall through to the normal AI route
 *
 * The caller should only use the AI route when:
 *   1. ok is false (broken CSV), OR
 *   2. The user has manually selected a chart type via ChartTypeSelector
 */
export function processCSV(rawText: string): CSVProcessResult {
  // 1. Sanity / broken check
  const { broken, reason: brokenReason } = detectBroken(rawText);
  if (broken) return { ok: false, reason: brokenReason };

  // 2. Parse
  const parsed = parseCSV(rawText);
  if (!parsed) return { ok: false, reason: "Failed to parse CSV structure." };

  // 3. Profile columns
  const allCols = parsed.headers.map((h) => profileCol(h, parsed.rows));

  // 4. Filter out id columns and all-null columns
  const usable = allCols.filter((c) => c.kind !== "id" && c.nullFrac < 0.95);
  if (usable.length < 2)
    return { ok: false, reason: "Not enough usable columns." };

  // 5. Detect chart type
  const decision = detectChart(usable, parsed.rows.length);
  if (!decision)
    return {
      ok: false,
      reason: "Could not determine an appropriate chart type.",
    };

  // 6. Build Plotly config
  const { data, layout } = buildConfig(decision, parsed.rows.length);
  if (!data.length)
    return { ok: false, reason: "Config builder produced empty data." };

  return {
    ok: true,
    plotlyData: data,
    plotlyLayout: layout,
    chartTypeLabel: decision.label,
    reason: decision.reason,
  };
}
