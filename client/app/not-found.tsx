import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen w-full grid place-items-center">
      <div className="text-center  font-old">
        <h2 className="text-6xl font-poppins">404</h2>
        <h2 className="text-2xl">Bunday sahifa mavjud emas</h2>
        <p className="text-md mb-4">
          Siz bosh maqolalarni sahifasida ko'rishingiz mumkin
        </p>
        <Link href="/" className="underline underline-offset-4 font-poppins">
          <Button>
            <ArrowLeft /> Bosh sahifaga qayting
          </Button>
        </Link>
      </div>
    </div>
  );
}
