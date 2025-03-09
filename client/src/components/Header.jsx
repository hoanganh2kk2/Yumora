import React from "react";
import logo from "../assets/logo.png";
import Search from "./Search";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaRegCircleUser } from "react-icons/fa6";
import useMobile from "../hooks/useMobile";
import { BsCart4 } from "react-icons/bs";

const Header = () => {
  const [isMobile] = useMobile();
  const location = useLocation();
  const isSearchPage = location.pathname === "/search";
  const navigate = useNavigate();

  const redirectToLoginPage = () => {
    navigate("/login");
  };

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
            {/**user icons display in only mobile version**/}
            <button className="text-neutral-600 lg:hidden">
              <FaRegCircleUser size={26} />
            </button>

            {/**Desktop**/}
            <div className="hidden items-center gap-10 lg:flex">
              <button onClick={redirectToLoginPage} className="text-lg cursor-pointer px-2">
                Login
              </button>
              <button className="flex items-center gap-2 rounded bg-green-800 px-3 py-3 text-white hover:bg-green-700">
                {/**add to cart icons */}
                <div className="animate-bounce">
                  <BsCart4 size={26} />
                </div>
                <div className="font-semibold">
                  <p>My Cart</p>
                </div>
              </button>
            </div>
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
