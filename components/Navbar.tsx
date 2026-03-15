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
    <nav>
      <span>MyLearn</span>

      <div>
        {image && <img src={image} alt={`${name}'s avatar`} width={32} height={32} />}
        <span>{name}</span>
        <span>{email}</span>
        <span>[{role}]</span>

        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm">
            Logout
          </Button>
        </form>
      </div>
    </nav>
  );
}
