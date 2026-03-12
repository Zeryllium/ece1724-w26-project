"use client";

import { useState } from "react";
import { LoginForm } from "./LoginForm"
import { authClient } from "@/lib/auth-client";

export default function CreateLoginForm() {
  const [errorMessage, seterrorMessage] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      const { data, error } = await authClient.signIn.email({
        email: email,
        password: password,
        callbackURL: "/courses",
        rememberMe: false
      }, {
        //callbacks
      })

      if (error) {
        seterrorMessage(error.message ? error.message : "Invalid Credentials" )
      }

    } catch (error) {
      seterrorMessage(error instanceof Error ? error.message : "Could not log in")
    }
  }

  return (
    <div className={"space-y-4"}>
      <LoginForm action={handleSubmit} />
      {
        errorMessage && <p className={"text-sm font-bold text-red-800"}>
          {errorMessage}
          </p>
      }
    </div>
  );
}

