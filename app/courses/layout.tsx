import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export default async function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <Navbar
        name={session.user.name}
        email={session.user.email}
        role={session.user.role as string ?? "STUDENT"}
        image={session.user.image}
      />
      <main>{children}</main>
    </div>
  );
}
