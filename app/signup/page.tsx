import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import SignUpFormWrapper from "@/components/SignUpFormWrapper";
import { auth } from "@/lib/auth";
import {textGradientTheme, textH1Style, textLinkBack} from "@/lib/ui";


export default async function Login() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (session) {
    redirect("/courses")
  } else {
    return (
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className={textH1Style}>Sign Up</h1>
            <Link href={"/"} className={textLinkBack}>
              Back
            </Link>
        </div>

        <section className="rounded-lg border bg-card p-6">
          <SignUpFormWrapper/>
          <p className={"text-sm mt-2"}>
            Have an account? <Link href={"/login"} className={`${textGradientTheme} text-sm transition duration-250 ease-in-out border-b border-b-transparent hover:border-b-blue-500 font-semibold`}>Login</Link> instead.
          </p>
        </section>
      </main>
    );
  }
}