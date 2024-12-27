import { ArticlesSection, Tabs } from "@/components/components";

const Articles = () => {
  return (
    <div className="h-screen w-full px-28 py-24 overflow-hidden flex">
      <div className="flex flex-col w-2/3">
        <Tabs />
        <ArticlesSection />
      </div>
      <div className="w-1/3 px-3">Team Messages</div>
    </div>
  );
};

export default Articles;
