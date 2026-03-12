"use client";

import { Button } from "@/components/ui/button";
import { inputClass } from "@/lib/ui";

type LoginFormProps = {
  action: (formData: FormData) => void | Promise<void>;
}

export function LoginForm( {action}: LoginFormProps) {
  return (
    <form action={action} className={"space-y-4 space-x-8"}>
      <div className={"space-y-1"}>
        <label htmlFor={"email"} className={"block text-sm font-bold"}>
          Email
        </label>
        <input type={"email"} name={"email"} id={"email"} className={inputClass} />
        <label htmlFor={"password"} className={"block text-sm font-bold"}>
          Password
        </label>
        <input type={"password"} name={"password"} id={"password"} className={inputClass} />
      </div>
      <Button type="submit">
        Login
      </Button>
    </form>
  );
}