import { tagAPI } from "@/lib/api";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  let tags = [];
  try {
    const res = await tagAPI.getHomeTags();
    tags = res.data.tags || [];
  } catch (error) {
    console.error("Failed to fetch tags on server:", error);
  }

  return <HomeClient initialTags={tags} />;
}
