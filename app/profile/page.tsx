"use client";

import { useState } from "react";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div>Profile: {user ? user.name : "No User"}</div>
      <button
        className="p-2 px-5 bg-red-600 text-white rounded-lg"
        onClick={() => setUser(null)}
      >
        log out
      </button>
    </div>
  );
};

export default Profile;
