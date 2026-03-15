import { cookies } from "next/headers";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("qalamda_token")?.value;

  let tags = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/home-tags`, {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    tags = data.tags || [];
  } catch (error) {
    console.error("Failed to fetch tags on server:", error);
  }

  return <HomeClient initialTags={tags} />;
}
