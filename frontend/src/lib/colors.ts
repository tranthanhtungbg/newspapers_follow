export const CATEGORY_COLORS: Record<string, string> = {
  amber: "bg-amber-500 hover:bg-amber-600 text-white",
  red: "bg-red-500 hover:bg-red-600 text-white",
  orange: "bg-orange-500 hover:bg-orange-600 text-white",
  green: "bg-green-500 hover:bg-green-600 text-white",
  emerald: "bg-emerald-500 hover:bg-emerald-600 text-white",
  teal: "bg-teal-500 hover:bg-teal-600 text-white",
  cyan: "bg-cyan-500 hover:bg-cyan-600 text-white",
  blue: "bg-blue-500 hover:bg-blue-600 text-white",
  indigo: "bg-indigo-500 hover:bg-indigo-600 text-white",
  violet: "bg-violet-500 hover:bg-violet-600 text-white",
  purple: "bg-purple-500 hover:bg-purple-600 text-white",
  fuchsia: "bg-fuchsia-500 hover:bg-fuchsia-600 text-white",
  pink: "bg-pink-500 hover:bg-pink-600 text-white",
  rose: "bg-rose-500 hover:bg-rose-600 text-white",
};

export const CATEGORY_BG_COLORS: Record<string, string> = {
  amber: "bg-amber-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  green: "bg-green-500",
  emerald: "bg-emerald-500",
  teal: "bg-teal-500",
  cyan: "bg-cyan-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  purple: "bg-purple-500",
  fuchsia: "bg-fuchsia-500",
  pink: "bg-pink-500",
  rose: "bg-rose-500",
};

export function getCategoryButtonClass(color?: string) {
  return CATEGORY_COLORS[color || 'amber'] || CATEGORY_COLORS['amber'];
}

export function getCategoryBgClass(color?: string) {
  return CATEGORY_BG_COLORS[color || 'amber'] || CATEGORY_BG_COLORS['amber'];
}
