import React from "react";
import UserMenu from "../components/UserMenu";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  return (
    <div>
      <section className="bg-white">
        <div className="container mx-auto grid p-3 lg:grid-cols-[250px_1fr]">
          {/* left for menu */}
          <div className="sticky top-24 hidden overflow-y-auto py-4 lg:block">
            <UserMenu />
          </div>

          {/* right for menu */}
          <div className="bg-white p-4">
            <Outlet />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
