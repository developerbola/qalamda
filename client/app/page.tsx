import { tagAPI } from "@/lib/api";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  let tags = [];
  try {
    // Fetch tags on server side
    const res = await tagAPI.getAll();
    tags = res.data.tags || [];
  } catch (error) {
    console.error("Failed to fetch tags on server:", error);
    // Fallback to empty tags, client can still try to fetch if needed
    // or we just show empty states
  }

  return <HomeClient initialTags={tags} />;
}
