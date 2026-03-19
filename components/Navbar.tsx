"use client";

import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";

export default function Navbar({ role }: { role?: string | null }) {
  const {user, currentRole} = useUser();
  const {name, email, image} = user;
  
  const displayRole = role !== undefined ? role : currentRole;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center flex-row justify-between px-6">
        {/* Brand Name */}
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <span>Demokrit.os</span>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
             {displayRole && (
               <span className="uppercase bg-secondary px-2 py-1.5 rounded-md text-[10px] font-bold tracking-wider text-secondary-foreground">
                 {displayRole}
               </span>
             )}
             <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-foreground">{name}</span>
                <span className="text-xs text-muted-foreground">{email}</span>
             </div>
          </div>
          
          {image && (
            <img 
              src={image} 
              alt={`${name}'s avatar`} 
              width={36} 
              height={36} 
              className="rounded-full shadow-sm border border-slate-200"
            />
          )}

          <div className="h-6 w-px bg-border mx-1 md:mx-2"></div>

          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm" className="font-medium hover:bg-destructive/10 hover:text-destructive">
              Logout
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
