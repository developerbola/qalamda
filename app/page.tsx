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
  const user = true;
  return (
    <>
      <div className="h-screen flex items-center justify-center">
        {user ? <HomePage /> : <Start />}
      </div>
    </>
  );
}
