import Link from "next/link";
import { Button } from "@/components/ui/button";
import CreateLoginForm from "@/components/CreateLoginForm";

export default async function Login() {
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
      </section>
    </main>
  );
}