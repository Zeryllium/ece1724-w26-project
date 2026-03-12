"use client";

import { useState } from "react";
import { LoginForm } from "./LoginForm"
import { authClient } from "@/lib/auth-client";

export default function CreateLoginForm() {
  const [errorMessage, seterrorMessage] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        callbackURL: "/courses",
        rememberMe: false
      }, {
        //callbacks
      })

      if (error) {
        seterrorMessage(error instanceof Error ? error.message : "Invalid Credentials" )
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

