import Image from "next/image";
import { Poppins, Playwrite_DE_VA } from "next/font/google";
import Link from "next/link";

const playwrite = Playwrite_DE_VA({
  weight: "400",
  display: "swap",
});
const poppins = Poppins({
  weight: "400",
  display: "swap",
  subsets: ["latin"],
});
const StartPage = () => {
  const user = false;
  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-[80%] h-[80%] flex items-center justify-between">
        <div className="h-full md:w-[50%] vxs:w-full flex flex-col gap-7">
          <h1
            className={`${playwrite.className} sm:text-5xl vxs:text-[2rem]`}
            style={{ lineHeight: 1.8 }}
          >
            O'qing, o'rganing, ulashing!
          </h1>
          <p className={`${poppins.className} sm:text-xl vxs:text-[1.1rem]`}>
            Maqolalar o'qish va bilimlaringizni boshqalar bilan ulashish uchun
            yangi imkoniyat.
          </p>
          <Link href={user ? "/articles" : "/login"}>
            <button className="p-3 px-4 rounded-full bg-gray-950 text-white w-[230px]">
              O'qishni boshlash
            </button>
          </Link>
        </div>
        <div className="h-full w-[50%] md:flex vxs:hidden flex items-center justify-center">
          <Image
            src={"/starterImage.png"}
            alt="qalam"
            width={400}
            height={400}
          />
        </div>
      </div>
    </div>
  );
};

export default StartPage;
