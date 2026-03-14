import HomeClient from "./HomeClient";
export default async function HomePage() {
  let tags = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/home-tags`, {
      cache: "no-store",
    });
    const data = await res.json();
    tags = data.tags || [];
  } catch (error) {
    console.error("Failed to fetch tags on server:", error);
  }

  return <HomeClient initialTags={tags} />;
}
