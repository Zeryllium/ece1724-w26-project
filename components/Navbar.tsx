import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

type NavbarProps = {
  name: string;
  email: string;
  role: string;
  image?: string | null;
};

export default function Navbar({ name, email, role, image }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center flex-row justify-between px-6">
        {/* Brand Name */}
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <span>MyLearn</span>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
             <span className="text-sm font-semibold">{name}</span>
             <span className="text-xs text-muted-foreground flex gap-1 items-center">
                {email} <span className="uppercase bg-secondary px-1.5 py-0.5 rounded text-[10px] tracking-wider text-secondary-foreground">{role}</span>
             </span>
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

          <div className="h-6 w-px bg-border mx-1"></div>

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
