import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { Button } from "./ui/button";
import { useLanguage } from "@/lib/language";

const Start = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-6xl h-[80%] flex items-center justify-between gap-10">
        <div className="flex flex-col gap-6 w-full md:w-1/2">
          <h1 className="font-write text-3xl sm:text-5xl leading-relaxed">
            {t("heroTitle")}
          </h1>

          <p className="font-poppins text-[1rem] sm:text-xl text-muted-foreground">
            {t("heroDescription")}
          </p>

          <Link href="/auth" className="cursor-default">
            <Button className="rounded-full text-sm px-6 h-12" size="lg">
              {t("startReading")}
            </Button>
          </Link>
        </div>

        <div className="hidden md:flex w-1/2 h-full items-center justify-center">
          <Image
            src="/hero.png"
            alt="hero image"
            width={400}
            height={400}
            priority
            sizes="(max-width: 768px) 0px, 400px"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(Start);
