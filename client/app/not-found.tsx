import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen w-screen grid place-items-center">
      <div className="text-center  font-old">
        <h2 className="text-6xl font-poppins">404</h2>
        <h2 className="text-2xl">Bunday sahifa mavjud emas</h2>
        <p className="text-md">
          Siz bosh maqolalarni{" "}
          <Link
            href="/maqolalar"
            className="underline underline-offset-4"
            style={{
              textDecorationThickness: 1,
            }}
          >
            Maqolalar
          </Link>{" "}
          sahifasida ko'rishingiz mumkin
        </p>
        <p className="my-4">yoki</p>
        <Link href="/" className="underline underline-offset-4 font-poppins">
          <Button>
            <ArrowLeft /> Bosh sahifaga qayting
          </Button>
        </Link>
      </div>
    </div>
  );
}
