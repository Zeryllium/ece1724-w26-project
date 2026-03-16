"use client";

import {useEffect} from "react";
import {useUser} from "@/context/UserContext"

interface RoleSetterProps {
  role: string | null
}

export default function RoleSetter({role}: RoleSetterProps) {
  const {setCurrentRole} = useUser();

  useEffect(() => {
    setCurrentRole(role);

    // Reset role when leaving the page
    return () => setCurrentRole(null);
  }, [role, setCurrentRole]);

  return null;
}