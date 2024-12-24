"use client";
import { Articles, Start } from "@/sections/sections";
const HomePage = () => {
  return (
    <>
      <Articles />
    </>
  );
};

export default function Home() {
  const user = false;
  return (
    <>
      <div className="h-screen flex items-center justify-center">
        {user ? <HomePage /> : <Start />}
      </div>
    </>
  );
}
