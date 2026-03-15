"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

import { SignUpForm } from "./SignUpForm"
import { signUpAction } from "@/app/actions/auth";

export default function CreateSignUpForm() {

  const [errorMessage, seterrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    try {
      const error = await signUpAction(formData);
      if (error) {
        seterrorMessage(error)
      } else {
        router.push("/courses")
      }

    } catch (error) {
      // TODO: After debugging, squash this error message so the client does not see the actual server errors
      seterrorMessage(error instanceof Error ? error.message : "Could not sign up")
    }
  }

  return (
    <div className={"space-y-4"}>
      <SignUpForm action={handleSubmit} />
      {
        errorMessage && <p className={"text-sm font-bold text-red-800"}>
          {errorMessage}
        </p>
      }
    </div>
  );
}

