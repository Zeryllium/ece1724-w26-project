// Shared Tailwind class strings to keep styling consistent across components.

export const inputClass =
  "shadow appearance-none border rounded-md p-2 w-full bg-background focus:outline-none focus:ring-2 focus:ring-ring";

export const selectClass =
  "shadow appearance-none border rounded-md p-2 w-full bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px]";

export const mainContainer =
  "container mx-auto p-8 max-w-6xl space-y-16"

export const sectionFlex =
  "flex items-center justify-between "

export const cardSectionFlex =
  "flex justify-center justify-items-center bg-slate-50 border border-dashed rounded-md"

export const cardClass =
  "group flex flex-col md:flex-row items-center justify-between gap-6 rounded-md p-6 m-2 shadow-sm hover:shadow-md border border-slate-300 bg-white"

export const gradientTheme =
  "bg-linear-to-r from-blue-400 to-indigo-600"

export const textGradientTheme =
  `bg-clip-text text-transparent ${gradientTheme}`

export const textH1Style =
  "text-4xl font-extrabold text-slate-900"

export const textH2Style =
  "text-2xl font-bold text-slate-900"

export const textDescription =
  "text-lg text-slate-600"

export const textLinkBack =
  "transition duration-250 ease-in-out text-slate-500 hover:text-slate-800"

export const buttonBaseStyling =
  "py-2.5 px-6 rounded-xl font-bold shadow-md w-auto md:w-42 transition duration-250 ease-in-out"

export const buttonBlueIndigo =
  `${gradientTheme} hover:bg-linear-to-r hover:from-blue-500 hover:to-indigo-700 text-white`

export const buttonRed =
  "bg-red-100 hover:bg-red-200 text-red-500 border border-red-500"

export const buttonGreen =
  "bg-green-100 text-green-800 border border-lime-400"

export const moduleBadgeBaseStyling =
  ""