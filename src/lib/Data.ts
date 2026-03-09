export const CYAN = "#0891b2";
export const BORDER = "#1e2227";

export type Tab =
  | "dashboard"
  | "graphs"
  | "shared"
  | "favourites"
  | "templates"
  | "settings"
  | "billing"
  | "help"
  | "new-graph"
  | "import-google"
  | "import-excel"
  | "import-paste";

export const PAGE_TITLE: Record<Tab, string> = {
  dashboard: "Dashboard",
  graphs: "My Graphs",
  shared: "Shared With Me",
  favourites: "Favourites",
  templates: "Templates",
  settings: "Settings",
  billing: "Billing",
  help: "Help",
  "new-graph": "New Graph",
  "import-google": "Connect Google Sheets",
  "import-excel": "Upload Excel Sheet",
  "import-paste": "Paste Data",
};

export const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard" as Tab, label: "Dashboard", icon: "grid" },
      { id: "graphs" as Tab, label: "My Graphs", icon: "chart", badge: "24" },
      { id: "shared" as Tab, label: "Shared", icon: "share", badge: "3" },
      {
        id: "favourites" as Tab,
        label: "Favourites",
        icon: "star",
        badge: "3",
      },
    ],
  },
  {
    label: "Library",
    items: [{ id: "templates" as Tab, label: "Templates", icon: "layout" }],
  },
  {
    label: "Account",
    items: [
      { id: "billing" as Tab, label: "Billing", icon: "card" },
      { id: "settings" as Tab, label: "Settings", icon: "settings" },
      { id: "help" as Tab, label: "Help", icon: "help" },
    ],
  },
];

export interface Graph {
  id: string;
  title: string;
  tag: string;
  category: string;
  updated: string;
  views: number;
  trend: string;
  trendUp: boolean;
  starred: boolean;
  desc: string;
  data: number[];
}

export const GRAPHS: Graph[] = [
  {
    id: "g1",
    title: "Monthly Revenue",
    tag: "Line",
    category: "Finance",
    updated: "2h ago",
    views: 284,
    trend: "+18.4%",
    trendUp: true,
    starred: true,
    desc: "12-month rolling revenue across all product lines",
    data: [30, 42, 38, 55, 48, 62, 70, 65, 80, 88, 76, 95],
  },
  {
    id: "g2",
    title: "User Acquisition",
    tag: "Bar",
    category: "Growth",
    updated: "Yesterday",
    views: 156,
    trend: "+7.2%",
    trendUp: true,
    starred: true,
    desc: "Weekly new sign-ups by acquisition channel",
    data: [20, 35, 28, 45, 52, 40, 60, 55, 70, 65, 80, 72],
  },
  {
    id: "g3",
    title: "Churn Analysis",
    tag: "Line",
    category: "Retention",
    updated: "3 days ago",
    views: 98,
    trend: "-2.1%",
    trendUp: false,
    starred: false,
    desc: "Monthly churn rate segmented by plan tier",
    data: [60, 55, 58, 52, 50, 54, 48, 45, 50, 44, 42, 40],
  },
  {
    id: "g4",
    title: "Feature Adoption",
    tag: "Area",
    category: "Product",
    updated: "1 week ago",
    views: 210,
    trend: "+31.6%",
    trendUp: true,
    starred: false,
    desc: "Cumulative feature engagement over 90 days",
    data: [10, 15, 22, 28, 35, 30, 42, 50, 46, 60, 72, 85],
  },
  {
    id: "g5",
    title: "Support Tickets",
    tag: "Bar",
    category: "Operations",
    updated: "1 week ago",
    views: 67,
    trend: "-9.3%",
    trendUp: false,
    starred: false,
    desc: "Open, resolved and escalated tickets by week",
    data: [80, 72, 68, 75, 60, 55, 58, 50, 45, 48, 42, 38],
  },
  {
    id: "g6",
    title: "NPS Over Time",
    tag: "Line",
    category: "Growth",
    updated: "2 weeks ago",
    views: 133,
    trend: "+4.8%",
    trendUp: true,
    starred: true,
    desc: "Net Promoter Score averaged across all cohorts",
    data: [40, 38, 42, 45, 44, 50, 48, 55, 52, 58, 60, 64],
  },
  {
    id: "g7",
    title: "CAC by Channel",
    tag: "Bar",
    category: "Finance",
    updated: "3 weeks ago",
    views: 88,
    trend: "-5.7%",
    trendUp: false,
    starred: false,
    desc: "Customer acquisition cost per marketing channel",
    data: [90, 82, 75, 80, 70, 65, 68, 60, 62, 58, 55, 52],
  },
  {
    id: "g8",
    title: "Session Duration",
    tag: "Area",
    category: "Product",
    updated: "1 month ago",
    views: 177,
    trend: "+12.0%",
    trendUp: true,
    starred: false,
    desc: "Average session time segmented by device type",
    data: [25, 28, 30, 26, 32, 35, 38, 34, 40, 42, 38, 45],
  },
];

export const STATS = [
  { label: "Total Graphs", value: "24", delta: "+3 this week" },
  { label: "Total Views", value: "8.4k", delta: "+12% vs last" },
  { label: "Shared Links", value: "11", delta: "4 active" },
  { label: "Storage Used", value: "2.1GB", delta: "of 10GB" },
];

export const ACTIVITY = [
  { action: "Edited", graph: "Monthly Revenue", time: "2h ago", avatar: "AC" },
  { action: "Shared", graph: "NPS Over Time", time: "5h ago", avatar: "AC" },
  {
    action: "Viewed",
    graph: "User Acquisition",
    time: "Yesterday",
    avatar: "JK",
  },
  {
    action: "Created",
    graph: "Session Duration",
    time: "3d ago",
    avatar: "AC",
  },
  {
    action: "Starred",
    graph: "Feature Adoption",
    time: "1w ago",
    avatar: "PM",
  },
];

export const TEMPLATES = [
  {
    title: "SaaS Metrics",
    tag: "Finance",
    count: 8,
    desc: "MRR, churn, ARR and expansion revenue in one view",
  },
  {
    title: "Growth Dashboard",
    tag: "Marketing",
    count: 6,
    desc: "Acquisition, activation and retention funnels",
  },
  {
    title: "Ops Overview",
    tag: "Operations",
    count: 5,
    desc: "Ticket volume, response time and resolution rate",
  },
  {
    title: "Retention Suite",
    tag: "Product",
    count: 7,
    desc: "Cohort analysis, feature stickiness and NPS",
  },
];

export const USER = {
  name: "Alex Chen",
  email: "alex@company.com",
  avatar: "AC",
  plan: "Pro",
};
