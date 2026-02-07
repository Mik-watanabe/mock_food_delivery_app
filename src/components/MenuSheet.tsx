import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bookmark, Menu, Star } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/(auth)/login/actions";


const MenuSheet = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }
  const { avatar_url, full_name } = user.user_metadata as {
    avatar_url: string;
    full_name: string;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"ghost"} size={"icon"} className="flex-center-center">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-6">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            User information and menu information
          </SheetDescription>
        </SheetHeader>

        <div className="flex-center gap-5">
          <Avatar>
            <AvatarImage
              src={avatar_url}
              alt="User avatar"
              referrerPolicy="no-referrer"
            />
            <AvatarFallback>User AvatarImage</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold">{full_name}</div>
            <div>
              <Link href={"#"} className="text-green-500 text-xs">
                Manage my account
              </Link>
            </div>
          </div>
        </div>
        <ul className="space-y-4">
          <li>
            <Link href={"orders"} className="flex-center gap-4">
              <Bookmark fill="bg-primary" />
              <div className="font-bold"> Order History</div>
            </Link>
          </li>
          <li>
            <Link href={"orders"} className="flex-center gap-4">
              <Star fill="bg-primary" />
              <div className="font-bold">Favorites</div>
            </Link>
          </li>
        </ul>
        <SheetFooter>
          <form>
            <Button className="w-full" formAction={logout}>Logout</Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MenuSheet;
