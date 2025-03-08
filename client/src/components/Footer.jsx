import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex flex-col gap-2 p-4 text-center lg:flex-row lg:justify-between">
        <p>© All Rights Reserved 2025.</p>

        <div className="flex items-center justify-center gap-4 text-2xl">
          <a href="" className="hover:text-primary-100">
            <FaFacebook />
          </a>
          <a href="" className="hover:text-primary-100">
            <FaInstagram />
          </a>
          <a href="" className="hover:text-primary-100">
            <FaLinkedin />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
