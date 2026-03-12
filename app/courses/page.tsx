import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";

import { auth } from "@/lib/auth";
import { signOutAction } from "@/app/actions/auth";


export default async function() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login")
  } else {
    return (
      <div>
        <h1>TODO: Courses Page</h1>
        <form action={signOutAction}>
          {/* TODO: Move this into a layout rather than a button on each page. This is only here for testing purposes*/}
          <Button type={"submit"} size={"lg"} variant={"outline"}>
            TEMP: Logout
          </Button>
        </form>
      </div>
    )
  }
}