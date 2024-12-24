"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SignUp = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.password) {
      router.push("/");
    } else {
      alert("Please fill out all fields.");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
      <Link
        href="/"
        className="flex items-center text-2xl font-semibold text-gray-900"
      >
        <Image src="/logo.svg" alt="logo" width={200} height={60} priority />
      </Link>
      <div className="w-full md:mt-0 sm:max-w-md xl:p-0 ">
        <div className="p-6 sm:p-8 flex flex-col gap-2">
          <form className="space-y-2 md:space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                To`liq ismingiz
              </label>
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="Sizning Ismingiz"
                required
                name="name"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Email manzilingiz
              </label>
              <input
                type="email"
                className={`bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                placeholder="sizningemailingiz@icloud.com"
                required
                name="email"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Parolingiz
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                required
                name="password"
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Sign Up
            </button>
            <p className="text-sm font-light text-gray-900">
              Akkauntiz bormi?{" "}
              <a
                href="/login"
                className="font-medium text-primary-600 underline"
              >
                Login
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
