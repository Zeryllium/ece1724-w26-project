import Image from "next/image";
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
              <button className={`${UI.buttonBaseStyling} ${UI.buttonBlueIndigo} flex justify-center items-center h-12 gap-4`}>
                Login
              </button>
            </Link>
            <Link href="/signup">
              <button className={`${UI.buttonBaseStyling} ${UI.buttonGrey} flex justify-center items-center h-12 gap-4`}>
                Sign Up
              </button>
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
}
