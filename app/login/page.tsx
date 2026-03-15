import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";

import CreateLoginForm from "@/components/CreateLoginForm";
import { auth } from "@/lib/auth";

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
          <h1 className={"text-2xl font-bold"}>Login</h1>
          <Button asChild variant="ghost">
            <Link href={"/"}>Back</Link>
          </Button>
        </div>

        <section className="rounded-lg border bg-card p-6">
          <CreateLoginForm />
          <p className={"text-sm"}>
            Don't have an account? <Link href={"/signup"} className={"accent-blue-500 font-bold"}>Register</Link>
          </p>
        </section>
      </main>
    );
  }
}