import React from "react";
import logo from "../assets/logo.png";
import Search from "./Search";
import { Link, useLocation } from "react-router-dom";
import { FaRegCircleUser } from "react-icons/fa6";
import useMobile from "../hooks/useMobile";

const Header = () => {
  const [isMobile] = useMobile();
  const location = useLocation();
  const isSearchPage = location.pathname === "/search";

  return (
    <header className="sticky top-0 z-40 flex h-24 flex-col justify-center gap-1 bg-white lg:h-20 lg:shadow-md">
      {!(isSearchPage && isMobile) && (
        <div className="container mx-auto flex items-center justify-between px-2">
          {/**logo */}
          <div className="h-full">
            <Link to={"/"} className="flex h-full items-center justify-center">
              <img
                src={logo}
                width={120}
                height={60}
                alt="logo"
                className="hidden lg:block"
              />
              <img
                src={logo}
                width={120}
                height={60}
                alt="logo"
                className="lg:hidden"
              />
            </Link>
          </div>

          {/**Search */}
          <div className="hidden lg:block">
            <Search />
          </div>

          {/**login and my cart */}
          <div className="">
            <button className="text-neutral-600 lg:hidden">
              <FaRegCircleUser size={26} />
            </button>
            <div className="hidden lg:block">Login and my cart</div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-2 lg:hidden">
        <Search />
      </div>
    </header>
  );
};

export default Header;
