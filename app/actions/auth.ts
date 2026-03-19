"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signUpAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const retype_password = formData.get("retype_password") as string;

  if (!name || name.trim() == "") {
    return "Name is required";
  }
  if (!email || email.trim() == "") {
    return "Email is required";
  }
  if (!password) {
    return "Password is required";
  }
  if (!retype_password) {
    return "Please retype your password";
  }
  // Check if passwords match before registering
  if (formData.get("password") as string !== formData.get("retype_password") as string) {
    return "Passwords do not match";
  }

  try {
    await auth.api.signUpEmail({
      headers: await headers(),
      body: {
        name: name,
        email: email,
        password: password,
      }
    });
  } catch (error: any) {
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    return `Failed to register: ${String(error)}`;
  }
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || email.trim() == "") {
    return "Email is required";
  }
  if (!password) {
    return "Password is required";
  }

  try {
    await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email: email,
        password: password,
      }
    });
  } catch (error: any) {
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    return `Invalid credentials: ${String(error)}`;
  }
}

// TODO: Untested
export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers()
  });

  redirect("/");
}