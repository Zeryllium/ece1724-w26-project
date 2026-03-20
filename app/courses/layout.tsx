import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { UserProvider} from "@/context/UserContext";
import Navbar from "@/components/Navbar";

export default async function CoursesLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal?: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <UserProvider initialUser={session.user}>
        <Navbar />
        <main>
          {children}
          {modal}
        </main>
      </UserProvider>
    </div>
  );
}
