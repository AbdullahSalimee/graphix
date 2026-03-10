/**
 * csvPreprocessor.ts
 *
 * Detects chart type from CSV structure + data content.
 * Works for any CSV — even generic column names like "month, revenue, profit".
 *
 * Detection priority order:
 *   waterfall → heatmap → radar → pie → bubble → scatter → multiline → line → bar → auto
 */

export type ChartHint =
  | "scatter"
  | "heatmap"
  | "waterfall"
  | "radar"
  | "line"
  | "bar"
  | "pie"
  | "bubble"
  | "multiline"
  | "auto";

// ─── CSV Parser ───────────────────────────────────────────────────────────────

export function parseCSV(csv: string): Record<string, any>[] {
  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => {
      const v = vals[i] ?? "";
      obj[h] = v !== "" && !isNaN(Number(v)) ? Number(v) : v;
    });
    return obj;
  });
}

// ─── Column classifiers ───────────────────────────────────────────────────────

function isNumericCol(rows: Record<string, any>[], col: string): boolean {
  return rows.every((r) => typeof r[col] === "number");
}

function isStringCol(rows: Record<string, any>[], col: string): boolean {
  return rows.every((r) => typeof r[col] === "string");
}

function isDateCol(col: string, rows: Record<string, any>[]): boolean {
  const n = col.toLowerCase();
  if (/date|month|year|week|day|time|period|quarter/.test(n)) return true;
  const sample = String(rows[0]?.[col] || "");
  return (
    /^\d{4}[-/]/.test(sample) ||
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(sample) ||
    /^q[1-4]\s?\d{4}/i.test(sample)
  );
}

function isLabelCol(col: string, rows: Record<string, any>[]): boolean {
  const n = col.toLowerCase();
  if (
    /name|label|category|product|country|city|region|item|title|company|brand|group|type|segment/.test(
      n,
    )
  )
    return true;
  if (!isNumericCol(rows, col)) {
    const unique = new Set(rows.map((r) => r[col])).size;
    return unique <= rows.length * 0.7;
  }
  return false;
}

// A "heatmap column" looks like a day, month, quarter or short categorical name
// NOT a metric name like "revenue", "expenses", "profit"
function isHeatmapAxisCol(col: string): boolean {
  const n = col.toLowerCase();
  const dayMonthPattern =
    /^(mon|tue|wed|thu|fri|sat|sun|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|q[1-4]|week|wk)/i;
  if (dayMonthPattern.test(n)) return true;
  // Short single-word non-metric labels (e.g. "North", "South", "Group A")
  const isMetric =
    /revenue|expense|profit|cost|sales|income|loss|amount|value|price|rate|score|count|total|avg|mean|sum|percent|pct|growth|margin/.test(
      n,
    );
  return !isMetric && n.length <= 15;
}

function hasAllPositiveValues(
  rows: Record<string, any>[],
  col: string,
): boolean {
  return rows.every((r) => Number(r[col]) >= 0);
}

function hasMixedSignValues(rows: Record<string, any>[], col: string): boolean {
  const vals = rows.map((r) => Number(r[col]));
  return vals.some((v) => v < 0) && vals.some((v) => v > 0);
}

function isIdCol(col: string, rows: Record<string, any>[]): boolean {
  const lower = col.toLowerCase();
  if (/^(id|_id|uuid|index|key|serial|row_?num)$/.test(lower)) return true;
  if (lower.endsWith("_id")) return true;
  const vals = rows.map((r) => Number(r[col]));
  const isSeq = vals.every((v, i) => i === 0 || v === vals[i - 1] + 1);
  if (isSeq && vals[0] <= 1) return true;
  return false;
}

function colHasKeyword(col: string, keywords: string[]): boolean {
  const lower = col.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

// ─── Main detection ───────────────────────────────────────────────────────────

export function autoDetectChartHint(csvString: string): ChartHint {
  const rows = parseCSV(csvString);
  if (rows.length < 2) return "auto";

  const cols = Object.keys(rows[0]);
  const numericCols = cols.filter((c) => isNumericCol(rows, c));
  const nonIdNumericCols = numericCols.filter((c) => !isIdCol(c, rows));
  const stringCols = cols.filter((c) => !isNumericCol(rows, c));
  // Date cols: any col whose name or values look like a date/time/period
  const dateCols = cols.filter((c) => isDateCol(c, rows));

  // ── 1. WATERFALL ────────────────────────────────────────────────────────────
  // Signal A: has a type/measure column with waterfall keywords
  const typeCol = cols.find((c) => /^(type|measure|direction|kind)$/i.test(c));
  if (typeCol) {
    const typeVals = rows.map((r) => String(r[typeCol]).toLowerCase());
    const wfKeywords = [
      "absolute",
      "relative",
      "total",
      "increase",
      "decrease",
      "start",
      "end",
      "subtotal",
    ];
    if (typeVals.some((v) => wfKeywords.some((k) => v.includes(k)))) {
      return "waterfall";
    }
  }
  // Signal B: 1 label col + 1 numeric col with mixed +/- values, few rows
  if (
    stringCols.length >= 1 &&
    nonIdNumericCols.length === 1 &&
    hasMixedSignValues(rows, nonIdNumericCols[0]) &&
    rows.length <= 20
  ) {
    return "waterfall";
  }

  // ── 2. HEATMAP ──────────────────────────────────────────────────────────────
  // Must have NO date cols (date cols → time series, not heatmap)
  // First col = row labels, ALL remaining cols = numeric
  // AND those remaining col names look like categories (days/months/regions), NOT metrics
  const restCols = cols.slice(1);
  if (
    dateCols.length === 0 && // ← key: no date/time cols
    !isNumericCol(rows, cols[0]) &&
    restCols.length >= 3 &&
    restCols.every((c) => isNumericCol(rows, c)) &&
    restCols.some((c) => isHeatmapAxisCol(c)) && // at least one day/month/category col name
    rows.length >= 3
  ) {
    return "heatmap";
  }

  // ── 3. RADAR ────────────────────────────────────────────────────────────────
  // Signal A: first col explicitly named attribute/metric/dimension
  if (
    colHasKeyword(cols[0], [
      "attribute",
      "metric",
      "dimension",
      "skill",
      "criteria",
      "factor",
      "kpi",
      "feature",
    ]) &&
    nonIdNumericCols.length >= 2 &&
    rows.length >= 3 &&
    rows.length <= 15
  ) {
    return "radar";
  }
  // Signal B: small number of rows (3-12), 2-6 numeric series, all values 0-100, no dates
  if (
    rows.length >= 3 &&
    rows.length <= 12 &&
    nonIdNumericCols.length >= 2 &&
    nonIdNumericCols.length <= 6 &&
    isStringCol(rows, cols[0]) &&
    dateCols.length === 0 &&
    nonIdNumericCols.every((c) => {
      const vals = rows.map((r) => Number(r[c]));
      return vals.every((v) => v >= 0 && v <= 100);
    })
  ) {
    return "radar";
  }

  // ── 4. PIE ──────────────────────────────────────────────────────────────────
  // 1 label col + exactly 1 numeric col, few rows (2-12), no dates, all positive
  if (
    stringCols.length >= 1 &&
    nonIdNumericCols.length === 1 &&
    hasAllPositiveValues(rows, nonIdNumericCols[0]) &&
    rows.length >= 2 &&
    rows.length <= 12 &&
    dateCols.length === 0
  ) {
    const valColName = nonIdNumericCols[0].toLowerCase();
    const sum = rows.reduce((s, r) => s + Number(r[nonIdNumericCols[0]]), 0);
    if (
      /share|percent|pct|portion|count|revenue|sales|amount|market/.test(
        valColName,
      ) ||
      (sum > 95 && sum < 105) // values sum to ~100% → definitely pie
    ) {
      return "pie";
    }
  }

  // ── 5. BUBBLE ───────────────────────────────────────────────────────────────
  // 3+ numeric cols where one is clearly a size dimension
  if (
    nonIdNumericCols.length >= 3 &&
    nonIdNumericCols.some((c) =>
      colHasKeyword(c, [
        "population",
        "size",
        "volume",
        "count",
        "total",
        "radius",
        "weight",
        "employees",
        "users",
        "views",
        "audience",
        "subscribers",
      ]),
    )
  ) {
    return "bubble";
  }

  // ── 6. SCATTER ──────────────────────────────────────────────────────────────
  // Exactly 2 numeric cols, no date cols, optional 1 string grouping col
  if (
    dateCols.length === 0 &&
    nonIdNumericCols.length === 2 &&
    rows.length >= 8
  ) {
    return "scatter";
  }
  if (
    dateCols.length === 0 &&
    nonIdNumericCols.length >= 2 &&
    stringCols.length === 1 &&
    rows.length >= 6
  ) {
    return "scatter";
  }

  // ── 7. MULTI-LINE ───────────────────────────────────────────────────────────
  // Date/time col + 2 or more numeric series → multiple lines
  // e.g. month, revenue, expenses, profit, customers  →  multiline
  if (dateCols.length >= 1 && nonIdNumericCols.length >= 2) {
    return "multiline";
  }

  // ── 8. LINE ─────────────────────────────────────────────────────────────────
  // Date/time col + exactly 1 numeric col
  if (dateCols.length >= 1 && nonIdNumericCols.length === 1) {
    return "line";
  }
  // Many sequential rows with a string x-axis → time-series-like line chart
  if (
    rows.length >= 10 &&
    nonIdNumericCols.length >= 1 &&
    (isStringCol(rows, cols[0]) || isDateCol(cols[0], rows))
  ) {
    return "line";
  }

  // ── 9. BAR ──────────────────────────────────────────────────────────────────
  // Category col + 1-4 numeric cols, few to medium rows
  if (
    stringCols.length >= 1 &&
    nonIdNumericCols.length >= 1 &&
    nonIdNumericCols.length <= 4 &&
    rows.length >= 2 &&
    rows.length <= 20
  ) {
    return "bar";
  }

  return "auto";
}

// ─── CSV → Plotly config ──────────────────────────────────────────────────────

export function csvToPlotly(
  csvString: string,
  chartHint: ChartHint,
  title = "Chart",
): { data: any[]; layout: any } {
  const rows = parseCSV(csvString);
  if (!rows.length) return { data: [], layout: { title: { text: title } } };

  const cols = Object.keys(rows[0]);
  const numericCols = cols.filter((c) => isNumericCol(rows, c));
  const nonIdNumericCols = numericCols.filter((c) => !isIdCol(c, rows));
  const stringCols = cols.filter((c) => !isNumericCol(rows, c));
  const dateCols = cols.filter((c) => isDateCol(c, rows));

  const COLORS = [
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
  ];

  // ── LINE ──────────────────────────────────────────────────────────────────
  if (chartHint === "line") {
    const xCol = dateCols[0] || stringCols[0] || cols[0];
    const yCol = nonIdNumericCols[0];
    return {
      data: [
        {
          type: "scatter",
          mode: "lines+markers",
          x: rows.map((r) => r[xCol]),
          y: rows.map((r) => r[yCol]),
          name: yCol.replace(/_/g, " "),
          line: { color: COLORS[0], width: 2.5 },
          marker: { size: 6, color: COLORS[0] },
        },
      ],
      layout: {
        title: { text: title },
        xaxis: { title: { text: xCol } },
        yaxis: { title: { text: yCol.replace(/_/g, " ") } },
      },
    };
  }

  // ── MULTI-LINE ─────────────────────────────────────────────────────────────
  if (chartHint === "multiline") {
    const xCol = dateCols[0] || stringCols[0] || cols[0];
    const yCols = nonIdNumericCols.filter((c) => c !== xCol);
    return {
      data: yCols.map((col, i) => ({
        type: "scatter",
        mode: "lines+markers",
        x: rows.map((r) => r[xCol]),
        y: rows.map((r) => r[col]),
        name: col.replace(/_/g, " "),
        line: { color: COLORS[i % COLORS.length], width: 2.5 },
        marker: { size: 5, color: COLORS[i % COLORS.length] },
      })),
      layout: {
        title: { text: title },
        xaxis: { title: { text: xCol } },
        yaxis: { title: { text: yCols[0]?.replace(/_/g, " ") } },
      },
    };
  }

  // ── BAR ────────────────────────────────────────────────────────────────────
  if (chartHint === "bar") {
    const xCol =
      stringCols.find((c) => isLabelCol(c, rows)) ||
      dateCols[0] ||
      stringCols[0] ||
      cols[0];
    const yCols = nonIdNumericCols.filter((c) => c !== xCol);
    return {
      data: yCols.map((col, i) => ({
        type: "bar",
        x: rows.map((r) => r[xCol]),
        y: rows.map((r) => r[col]),
        name: col.replace(/_/g, " "),
        marker: { color: COLORS[i % COLORS.length] },
      })),
      layout: {
        title: { text: title },
        barmode: yCols.length > 1 ? "group" : undefined,
        xaxis: { title: { text: xCol } },
        yaxis: { title: { text: yCols[0]?.replace(/_/g, " ") } },
      },
    };
  }

  // ── PIE ────────────────────────────────────────────────────────────────────
  if (chartHint === "pie") {
    const labelCol =
      stringCols.find((c) => isLabelCol(c, rows)) || stringCols[0];
    const valueCol = nonIdNumericCols[0];
    return {
      data: [
        {
          type: "pie",
          labels: rows.map((r) => r[labelCol]),
          values: rows.map((r) => r[valueCol]),
          marker: { colors: COLORS },
          textinfo: "label+percent",
          hoverinfo: "label+value+percent",
        },
      ],
      layout: { title: { text: title } },
    };
  }

  // ── SCATTER ────────────────────────────────────────────────────────────────
  if (chartHint === "scatter") {
    const xCol = nonIdNumericCols[0];
    const yCol = nonIdNumericCols[1];
    const colorCol = stringCols.find((c) =>
      colHasKeyword(c, [
        "gender",
        "group",
        "category",
        "type",
        "continent",
        "region",
        "class",
        "species",
        "team",
        "segment",
      ]),
    );
    if (colorCol) {
      const groups = [...new Set(rows.map((r) => r[colorCol]))];
      return {
        data: groups.map((g, i) => {
          const gRows = rows.filter((r) => r[colorCol] === g);
          return {
            type: "scatter",
            mode: "markers",
            name: String(g),
            x: gRows.map((r) => r[xCol]),
            y: gRows.map((r) => r[yCol]),
            marker: {
              size: 9,
              color: COLORS[i % COLORS.length],
              opacity: 0.8,
              line: { color: "white", width: 1 },
            },
          };
        }),
        layout: {
          title: { text: title },
          xaxis: { title: { text: xCol } },
          yaxis: { title: { text: yCol } },
        },
      };
    }
    return {
      data: [
        {
          type: "scatter",
          mode: "markers",
          x: rows.map((r) => r[xCol]),
          y: rows.map((r) => r[yCol]),
          marker: {
            size: 9,
            color: COLORS[0],
            opacity: 0.8,
            line: { color: "white", width: 1 },
          },
        },
      ],
      layout: {
        title: { text: title },
        xaxis: { title: { text: xCol } },
        yaxis: { title: { text: yCol } },
      },
    };
  }

  // ── BUBBLE ─────────────────────────────────────────────────────────────────
  if (chartHint === "bubble") {
    const xCol = nonIdNumericCols[0];
    const yCol = nonIdNumericCols[1];
    const sizeCol =
      nonIdNumericCols.find((c) =>
        colHasKeyword(c, [
          "population",
          "size",
          "volume",
          "count",
          "total",
          "radius",
          "weight",
          "employees",
          "users",
          "views",
          "audience",
          "subscribers",
        ]),
      ) || nonIdNumericCols[2];
    const colorCol = stringCols.find((c) =>
      colHasKeyword(c, [
        "continent",
        "region",
        "category",
        "group",
        "type",
        "country",
        "name",
      ]),
    );
    const maxSize = Math.max(...rows.map((r) => Number(r[sizeCol]) || 0));
    const sizeScale = (v: number) => Math.sqrt(v / maxSize) * 50 + 8;

    if (colorCol) {
      const groups = [...new Set(rows.map((r) => r[colorCol]))];
      return {
        data: groups.map((g, i) => {
          const gRows = rows.filter((r) => r[colorCol] === g);
          return {
            type: "scatter",
            mode: "markers",
            name: String(g),
            x: gRows.map((r) => r[xCol]),
            y: gRows.map((r) => r[yCol]),
            marker: {
              size: gRows.map((r) => sizeScale(Number(r[sizeCol]) || 0)),
              color: COLORS[i % COLORS.length],
              opacity: 0.75,
              line: { color: "white", width: 1 },
            },
          };
        }),
        layout: {
          title: { text: title },
          xaxis: { title: { text: xCol } },
          yaxis: { title: { text: yCol } },
        },
      };
    }
    return {
      data: [
        {
          type: "scatter",
          mode: "markers",
          x: rows.map((r) => r[xCol]),
          y: rows.map((r) => r[yCol]),
          marker: {
            size: rows.map((r) => sizeScale(Number(r[sizeCol]) || 0)),
            color: COLORS[0],
            opacity: 0.75,
            line: { color: "white", width: 1 },
          },
        },
      ],
      layout: {
        title: { text: title },
        xaxis: { title: { text: xCol } },
        yaxis: { title: { text: yCol } },
      },
    };
  }

  // ── HEATMAP ────────────────────────────────────────────────────────────────
  if (chartHint === "heatmap") {
    const rowLabelCol = cols[0];
    const valueCols = cols.slice(1).filter((c) => isNumericCol(rows, c));
    const z = rows.map((r) => valueCols.map((c) => Number(r[c]) || 0));
    return {
      data: [
        {
          type: "heatmap",
          z,
          x: valueCols,
          y: rows.map((r) => String(r[rowLabelCol])),
          colorscale: "Viridis",
          showscale: true,
          hoverongaps: false,
        },
      ],
      layout: {
        title: { text: title },
        xaxis: { title: { text: "" } },
        yaxis: { title: { text: rowLabelCol }, autorange: "reversed" },
      },
    };
  }

  // ── WATERFALL ──────────────────────────────────────────────────────────────
  if (chartHint === "waterfall") {
    const labelCol = stringCols[0] || cols[0];
    const valueCol = nonIdNumericCols[0];
    const typeCol = cols.find((c) =>
      /^(type|measure|direction|kind)$/i.test(c),
    );
    const x = rows.map((r) => String(r[labelCol]));
    const y = rows.map((r) => Number(r[valueCol]) || 0);
    const measure = typeCol
      ? rows.map((r) => {
          const t = String(r[typeCol]).toLowerCase();
          if (t.includes("abs") || t.includes("start") || t.includes("begin"))
            return "absolute";
          if (
            t.includes("total") ||
            t.includes("end") ||
            t.includes("final") ||
            t.includes("sum")
          )
            return "total";
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
        },
      ],
      layout: {
        title: { text: title },
        xaxis: { title: { text: labelCol } },
        yaxis: { title: { text: valueCol } },
      },
    };
  }

  // ── RADAR ──────────────────────────────────────────────────────────────────
  if (chartHint === "radar") {
    const attrCol = cols[0];
    const seriesCols = nonIdNumericCols;
    const theta = rows.map((r) => String(r[attrCol]));
    return {
      data: seriesCols.map((col, i) => ({
        type: "scatterpolar",
        r: [
          ...rows.map((r) => Number(r[col]) || 0),
          Number(rows[0][col]) || 0, // close the polygon
        ],
        theta: [...theta, theta[0]],
        fill: "toself",
        name: col.replace(/_/g, " "),
        opacity: 0.75,
        line: { color: COLORS[i % COLORS.length], width: 2 },
        marker: { color: COLORS[i % COLORS.length], size: 5 },
      })),
      layout: {
        title: { text: title },
        polar: { radialaxis: { visible: true, range: [0, 100] } },
      },
    };
  }

  // ── FALLBACK ───────────────────────────────────────────────────────────────
  return { data: [], layout: { title: { text: title } } };
}
