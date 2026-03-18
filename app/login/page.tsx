import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import CreateLoginForm from "@/components/CreateLoginForm";
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
          <h1 className={textH1Style}>Login</h1>
          <Link href={"/"} className={textLinkBack}>
            Back
          </Link>
        </div>

        <section className="rounded-lg border bg-card p-6">
          <CreateLoginForm />
          <p className={"text-sm mt-2"}>
            Don't have an account? <Link href={"/signup"} className={`${textGradientTheme} text-sm transition duration-250 ease-in-out border-b border-b-transparent hover:border-b-blue-500 font-semibold`}>Register</Link>
          </p>
        </section>
      </main>
    );
  }
}