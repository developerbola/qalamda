import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { Button } from "./ui/button";

const Start = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-6xl h-[80%] flex items-center justify-between gap-10">
        <div className="flex flex-col gap-6 w-full md:w-1/2">
          <h1 className="font-write text-3xl sm:text-5xl leading-relaxed">
            O'qing, o'rganing, ulashing!
          </h1>

          <p className="font-poppins text-[1rem] sm:text-xl text-neutral-600">
            Maqolalar o'qish va bilimlaringizni boshqalar bilan ulashish uchun
            yangi imkoniyat.
          </p>

          <Link href="/auth" className="cursor-default">
            <Button className="rounded-full text-sm px-4" size="lg">
              O'qishni boshlash
            </Button>
          </Link>
        </div>

        <div className="hidden md:flex w-1/2 h-full items-center justify-center">
          <Image
            src="/hero.png"
            alt="qalam"
            width={400}
            height={400}
            preload
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(Start);
