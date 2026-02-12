import Link from "next/link";
import MenuSidebar from "./MenuSheet";
import SearchBar from "./SearchBar";
import AddressModal from "./AddressModal";
import { readLocationCookie } from "@/lib/location/cookies";

const Header = async () => {
  const location = await readLocationCookie();
  console.log("Header location:", location);
  return (
    <header className="bg-background h-16 fixed top-0 w-full left-0 z-50">
      <div className="flex-center h-full space-x-4 px-4 max-w-[1920px] m-auto">
        <MenuSidebar />
        <div className="font-bold">
          <Link href={"/"}>Delivery App</Link>
        </div>
        <AddressModal />
        <div className="flex-1 bg-yellow-400">
          <SearchBar location={location} />
        </div>
        <div>cart</div>
      </div>
    </header>
  );
};

export default Header;
