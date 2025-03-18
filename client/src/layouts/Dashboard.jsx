import React from "react";
import UserMenu from "../components/UserMenu";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  return (
    <div>
      <section className="bg-white">
        <div className="container mx-auto grid p-3 lg:grid-cols-[250px_1fr]">
          {/* left for menu */}
          <div className="max-h-[calc(100vh - 96px)] sticky top-24 hidden overflow-y-auto border-r border-gray-200 py-4 lg:block">
            <UserMenu />
          </div>

          {/* right for menu */}
          <div className="min-h-[75vh] bg-white">
            <Outlet />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
