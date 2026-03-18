"use client";

import {buttonBaseStyling, buttonBlueIndigo, inputClass} from "@/lib/ui";

type SignUpFormProps = {
  action: (formData: FormData) => void | Promise<void>;
}

export function SignUpForm( {action}: SignUpFormProps) {
  return (
    <form action={action} className={"space-y-4"}>
      <div className={"space-y-1"}>
        <label htmlFor={"name"} className={"block text-sm font-bold"}>
          Name
        </label>
        <input type={"text"} name={"name"} id={"name"} className={inputClass} />
        <label htmlFor={"email"} className={"block text-sm font-bold"}>
          Email
        </label>
        <input type={"email"} name={"email"} id={"email"} className={inputClass} />
        <label htmlFor={"password"} className={"block text-sm font-bold"}>
          Password
        </label>
        <input type={"password"} name={"password"} id={"password"} className={inputClass} />
        <label htmlFor={"retype_password"} className={"block text-sm font-bold"}>
          Retype Password
        </label>
        <input type={"password"} name={"retype_password"} id={"retype_password"} className={inputClass} />
      </div>
      <button type="submit" className={`${buttonBaseStyling} ${buttonBlueIndigo}`}>
        Register
      </button>
    </form>
  );
}