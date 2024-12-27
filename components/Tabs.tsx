"use client";
import { useState } from "react";

const Tabs: React.FC = () => {
  const recomended = ["For You", "Following", "Javascript", "NextJS"];
  const liClass = "p-4 px-0";
  const [active, setActive] = useState<string>(recomended[0]);
  return (
    <div>
      <ul className="flex gap-6">
        {recomended.map((r) => {
          return (
            <button
              key={r}
              className={`${liClass} ${
                active === r ? "border-b border-black pt-[17px]" : ""
              }`}
              onClick={() => setActive(r)}
            >
              {r}
            </button>
          );
        })}
      </ul>
    </div>
  );
};

export default Tabs;
