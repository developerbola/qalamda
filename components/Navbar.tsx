"use client";
import Link from "next/link";
import { useState } from "react";
const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [logout, setLogout] = useState<boolean>(false);
  const user = { name: "name" };

  return (
    <nav className="fixed w-full z-999 top-0 start-0 bg-[#ffffffcc] backdrop-blur-[10px]">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-10 py-6">
        <Link
          href="/"
          className="flex space-x-3 rtl:space-x-reverse items-end"
        >
          <img src="/logo-black.ico" className="h-8 w-auto" alt="Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap">
            Qalamda
          </span>
        </Link>
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <div className="flex gap-4">
            {user ? (
              <Link href="/profile">
                <button
                  className="cursor-pointer uppercase font-semibold text-xl text-white bg-gray-950 rounded-full h-[40px] w-[40px] flex items-center justify-center"
                  onClick={() => setLogout(!logout)}
                >
                  {user.name[0]}
                </button>
              </Link>
            ) : (
              <Link href="/login" className="sm:flex vxs:hidden">
                <button
                  type="button"
                  className="text-gray-900 bg-transparent hover:bg-gray-900 hover:text-white hover:outline-none outline font-medium rounded-lg text-sm px-6 py-2 text-center"
                >
                  Login
                </button>
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-black rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
