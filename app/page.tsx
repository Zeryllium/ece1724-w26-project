import Image from "next/image";
import {Button} from "@/components/ui/button";
import * as UI from "@/lib/ui";
import Link from "next/link";
import { redirect } from "next/dist/client/components/navigation";
import { headers } from "next/dist/server/request/headers";
import { auth } from "@/lib/auth";

export default async function Home() {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (session) {
    redirect("/courses")
  } else {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-8 py-32 px-16 bg-white dark:bg-black">
          <h1 className="text-center mx-auto text-6xl font-bold tracking-tight text-black dark:text-zinc-50">
            DEMOKRIT.OS
          </h1>
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-semibold leading-snug tracking-tight text-gray-800 dark:text-zinc-400">
              Democritus - <span className="italic">"chosen of the people"</span>
            </h2>
            <h3 className="text-xl font-snormal leading-snug tracking-tight text-gray-600 dark:text-zinc-400">
              A learning platform chosen and designed by you.
            </h3>
          </div>
          <div className="flex flex-row gap-4 text-base font-medium">
            <Link href="/login">
              <Button variant="outline" className={`flex justify-center items-center h-12 gap-4 ${UI.buttonBaseStyling}`}>
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className={`flex justify-center items-center h-12 gap-4 ${UI.buttonBaseStyling}`}>
                Sign Up
              </Button>
            </Link>
          </div>
          <Image
              src="/democritus-bust.jpg"
              alt="democritus statue"
              width={354}
              height={480}
            />
        </main>
      </div>
    )
  }
  // return (
  //   <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
  //     <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
  //       <Image
  //         className="dark:invert"
  //         src="/next.svg"
  //         alt="Next.js logo"
  //         width={100}
  //         height={20}
  //         priority
  //       />
  //       <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
  //         <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
  //           To get started, edit the page.tsx file.
  //         </h1>
  //         <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
  //           Looking for a starting point or more instructions? Head over to{" "}
  //           <a
  //             href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
  //             className="font-medium text-zinc-950 dark:text-zinc-50"
  //           >
  //             Templates
  //           </a>{" "}
  //           or the{" "}
  //           <a
  //             href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
  //             className="font-medium text-zinc-950 dark:text-zinc-50"
  //           >
  //             Learning
  //           </a>{" "}
  //           center.
  //         </p>
  //       </div>
  //       <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
  //         <a
  //           className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
  //           href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           <Image
  //             className="dark:invert"
  //             src="/vercel.svg"
  //             alt="Vercel logomark"
  //             width={16}
  //             height={16}
  //           />
  //           Deploy Now
  //         </a>
  //         <a
  //           className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
  //           href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           Documentation
  //         </a>
  //       </div>
  //     </main>
  //   </div>
  // );
  //  //*/
}
