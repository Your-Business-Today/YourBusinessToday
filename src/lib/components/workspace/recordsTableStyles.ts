export type RecordsCellKind = "text" | "link" | "figure" | "status" | "actions";

export type FigureTone = "plain" | "negative" | "positive";

export const wideOnlyCellClasses = "hidden md:table-cell";

export const headerCellClasses =
  "sticky top-0 z-10 h-10 border-b border-hairline-strong bg-night px-4 py-3 align-bottom text-sm font-semibold text-chalk md:px-6";

export const tableClasses =
  "group/records w-full border-collapse text-left text-sm data-[cards=true]:max-md:block";

export const headSectionClasses = "group-data-[cards=true]/records:max-md:hidden";

export const bodySectionClasses = "bg-carriage group-data-[cards=true]/records:max-md:block";

const cardCellClasses =
  "group-data-[cards=true]/records:max-md:flex group-data-[cards=true]/records:max-md:h-auto " +
  "group-data-[cards=true]/records:max-md:items-center group-data-[cards=true]/records:max-md:justify-between " +
  "group-data-[cards=true]/records:max-md:gap-3 group-data-[cards=true]/records:max-md:py-1.5 " +
  "group-data-[cards=true]/records:max-md:before:text-xs group-data-[cards=true]/records:max-md:before:text-chalk-subtle " +
  "group-data-[cards=true]/records:max-md:before:content-[attr(data-label)]";

export const bodyCellClasses = `h-12 px-4 py-4 align-middle group-data-[dense=true]/records:h-10 group-data-[dense=true]/records:py-2 md:px-6 ${cardCellClasses}`;

export const unlabelledCellClasses = "group-data-[cards=true]/records:max-md:before:hidden";

export const cellKindClasses: Record<RecordsCellKind, string> = {
  text: "text-chalk-muted",
  link: "font-medium text-chalk",
  figure: "text-right font-medium whitespace-nowrap text-chalk",
  status: "whitespace-nowrap",
  actions: "text-right whitespace-nowrap",
};

export const figureToneClasses: Record<FigureTone, string> = {
  plain: "",
  negative: "text-signal",
  positive: "text-go",
};

export const rowClasses =
  "border-b border-hairline-strong last:border-b-0 group-data-[cards=true]/records:max-md:flex " +
  "group-data-[cards=true]/records:max-md:flex-col group-data-[cards=true]/records:max-md:py-2";

export const clickableRowClasses = "cursor-pointer hover:bg-carriage-raised";

export const selectedRowClasses = "bg-carriage-raised";

export const checkboxClasses =
  "h-4 w-4 rounded border border-hairline-strong bg-carriage-raised accent-go";
