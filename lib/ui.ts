// Shared Tailwind class strings to keep styling consistent across components.

export const inputClass =
  "shadow appearance-none border rounded-md p-2 w-full bg-background focus:outline-none focus:ring-2 focus:ring-ring";

export const selectClass =
  "shadow appearance-none border rounded-md p-2 w-full bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px]";

export const mainContainer =
  "container mx-auto p-8 max-w-6xl space-y-16"

export const sectionFlex =
  "flex items-center justify-between"

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

export const lineBreak =
  "my-2 border-b"

/*
  Card Themes
 */

export const cardSectionFlex =
  "flex justify-center justify-items-center bg-slate-50 border border-dashed rounded-md"

export const cardClass =
  "group flex flex-col md:flex-row items-center justify-self-stretch gap-6 rounded-md p-6 m-2 transition duration-250 shadow-sm hover:shadow-md border border-slate-100 hover:border-slate-200 bg-white"

export const cardTextTitle =
  "text-xl font-bold transition duration-100 ease-in-out bg-clip-text bg-slate-900 text-transparent hover:bg-linear-to-r hover:from-blue-500 hover:to-indigo-700"

export const cardTextDescription =
  "text-sm text-slate-600"

export const cardTextURI =
  "text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"

export const cardTextURILocked =
  "text-sm font-semibold text-slate-400"

/*
  Button Displays
 */

export const buttonBaseStyling =
  "py-2.5 px-6 rounded-xl font-bold shadow-md w-auto md:w-42 transition duration-250 ease-in-out"

export const buttonBlueIndigo =
  `${gradientTheme} hover:bg-linear-to-r hover:from-blue-500 hover:to-indigo-700 text-white`

export const buttonRed =
  "bg-red-100 hover:bg-red-200 text-red-500 border border-red-500"

export const buttonGreen =
  "bg-green-100 text-green-800 border border-lime-400"

export const buttonGrey =
  "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"


/*
  Badge Displays
 */

export const badgeTray =
  "flex flex-wrap items-center gap-3"

export const badgeBaseStyling =
  "text-xs font-bold min-w-20 px-2 py-1 rounded-md uppercase text-center"

export const badgeModuleIndex =
  `${badgeBaseStyling} bg-indigo-100 text-indigo-700 border-indigo-200`

export const badgeModuleLecture =
  `${badgeBaseStyling} bg-blue-100 text-blue-700 border-blue-200`

export const badgeModuleQuiz =
  `${badgeBaseStyling} bg-orange-100 text-orange-700 border-orange-200`

export const badgeModuleAssignment =
  `${badgeBaseStyling} bg-violet-100 text-violet-700 border-violet-200`

export const badgeModuleOther =
  `${badgeBaseStyling} bg-neutral-100 text-neutral-700 border-neutral-200`