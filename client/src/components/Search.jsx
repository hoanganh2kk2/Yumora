import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import useMobile from "../hooks/useMobile";

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchPage, setIsSearchPage] = useState(false);
  const [isMobile] = useMobile();
  const params = useLocation();
  const searchText = params.search.slice(3);
  

  useEffect(() => {
    const isSearch = location.pathname === "/search";
    setIsSearchPage(isSearch);
  }, [location]);

  const redirectToSearchPage = () => {
    navigate("/search");
  };

  const handleOnChange = (e) => {
    const value = e.target.value;
    const url = `/search?q=${value}`;
    navigate(url);
  };

  return (
    <div className="group focus-within:border-primary-200 flex h-11 w-full min-w-[300px] items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-neutral-500 lg:h-12 lg:min-w-[420px]">
      <div>
        {isMobile && isSearchPage ? (
          <Link
            to={"/"}
            className="group-focus-within:text-primary-200 m-1 flex h-full items-center justify-center rounded-full bg-white p-2 shadow-md"
          >
            <FaArrowLeft size={20} />
          </Link>
        ) : (
          <button className="group-focus-within:text-primary-200 flex h-full items-center justify-center p-3">
            <IoSearch size={22} />
          </button>
        )}
      </div>
      <div className="h-full w-full">
        {!isSearchPage ? (
          //not in search page
          <div
            onClick={redirectToSearchPage}
            className="flex h-full w-full items-center"
          >
            <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed out once, initially
                'Tìm kiếm "Sữa"',
                1000, // wait 1s before replacing "Mice" with "Hamsters"
                'Tìm kiếm "Bánh mì"',
                1000,
                'Tìm kiếm "Đường"',
                1000,
                'Tìm kiếm "SôCôLa"',
                1000,
                'Tìm kiếm "Sữa đông"',
                1000,
                'Tìm kiếm "Cơm"',
                1000,
                'Tìm kiếm "Trứng"',
                1000,
                'Tìm kiếm "Bim bim"',
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </div>
        ) : (
          //when i was search page
          <div className="h-full w-full">
            <input
              type="text"
              placeholder="Tìm kiếm Bánh mì và nhiều hơn"
              autoFocus
              defaultValue={searchText}
              className="h-full w-full bg-transparent outline-none"
              onChange={handleOnChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
