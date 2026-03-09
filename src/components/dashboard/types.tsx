export type Tab =
  | "dashboard"
  | "graphs"
  | "shared"
  | "favourites"
  | "templates"
  | "import"
  | "settings"
  | "billing"
  | "help";

export const PAGE_TITLE: Record<Tab, string> = {
  dashboard: "Dashboard",
  graphs: "My Graphs",
  shared: "Shared With Me",
  favourites: "Favourites",
  templates: "Templates",
  import: "Import Data",
  settings: "Settings",
  billing: "Billing",
  help: "Help",
};
