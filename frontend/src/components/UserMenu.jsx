import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearSession, getUser } from "@/lib/session";

export default function UserMenu({ onSignOut }) {
  const navigate = useNavigate();
  const user = getUser();
  if (!user) return null;

  const initials = (user.username || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const signOut = () => {
    clearSession();
    if (onSignOut) onSignOut();
    else navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="avatar-trigger" aria-label="Account menu">
        <Avatar className="size-8">
          <AvatarImage src={user.picture} alt="" referrerPolicy="no-referrer" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel className="font-normal text-muted-foreground">
          {user.username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/Library">Library</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/Profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
