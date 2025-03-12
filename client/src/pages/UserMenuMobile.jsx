import React from "react";
import UserMenu from "../components/UserMenu";
import { IoClose } from "react-icons/io5";

const UserMenuMobile = () => {
  return (
    <section className="h-full w-full bg-white py-2">
      <button
        onClick={() => window.history.back()}
        className="ml-auto block w-fit text-neutral-800"
      >
        <IoClose size={25} />
      </button>
      <div className="container mx-auto px-3 pb-8">
        <UserMenu />
      </div>
    </section>
  );
};

export default UserMenuMobile;
