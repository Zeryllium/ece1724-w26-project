"use client";

import {createContext, Dispatch, SetStateAction, useContext, useState} from "react";

type User = {
  name: string;
  email: string;
  role: string;
  image: string | null;
}

interface UserContextInterface {
  user: User;
  currentRole: string | null;
  setCurrentRole: Dispatch<SetStateAction<string | null>>;
}

const UserContext = createContext(({} as UserContextInterface));

export const UserProvider = ({initialUser, children}:Readonly<{initialUser:any, children:React.ReactNode}>) => {
  const [user] = useState(initialUser);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{user, currentRole, setCurrentRole}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);