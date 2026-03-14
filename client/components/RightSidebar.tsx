import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

const staffPicks = [
  {
    id: 1,
    author: "Alejandro Izquierdo López, ...",
    publication: "Fossils et ...",
    title: "Stop it! Animals don't evolve into crabs",
    date: "Feb 22",
    isMemberOnly: true,
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 2,
    author: "Medium Staff",
    publication: "The Medium Blog",
    title: "How Medium moderates its open platform in the AI era",
    date: "3d ago",
    isMemberOnly: false,
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 3,
    author: "Vilma G. Reynoso",
    publication: "Fourth Wave",
    title: "Why Women’s History Month Matters for All Women",
    date: "Feb 26",
    isMemberOnly: true,
    avatar: "https://i.pravatar.cc/150?img=5",
  },
];

const recommendedTopics = [
  "Data Science",
  "Self Improvement",
  "Writing",
  "Relationships",
  "Politics",
  "Cryptocurrency",
  "Productivity",
];

const whoToFollow = [
  {
    id: 1,
    name: "Barack Obama",
    description: "Dad, husband, President, citizen.",
    avatar: "https://i.pravatar.cc/150?img=15",
  },
  {
    id: 2,
    name: "Sarah Dayan",
    description: "Staff Software Engineer @Algolia.",
    avatar: "https://i.pravatar.cc/150?img=20",
  },
  {
    id: 3,
    name: "John Doe",
    description: "Avid reader and writer.",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
];

export function RightSidebar() {
  const pathname = usePathname();
  if (pathname && pathname.startsWith("/auth")) return null;
  return (
   <aside className="hidden lg:block w-[320px] xl:w-[350px] border-l border-border/40 pt-20 p-6">
      <div className="space-y-10">
        {/* Staff Picks */}
        <div>
          <h2 className="font-bold text-base mb-4 text-foreground">
            Staff Picks
          </h2>
          <div className="space-y-4">
            {staffPicks.map((pick) => (
              <div key={pick.id} className="group cursor-pointer">
                <div className="flex items-center gap-2 mb-1.5 line-clamp-1">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={pick.avatar} alt={pick.author} />
                    <AvatarFallback className="text-[10px]">
                      {pick.author.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-muted-foreground font-medium truncate">
                    In{" "}
                    <span className="text-foreground">{pick.publication}</span>{" "}
                    by <span className="text-foreground">{pick.author}</span>
                  </p>
                </div>
                <h3 className="font-bold text-[15px] leading-tight text-foreground group-hover:underline decoration-foreground mb-1.5">
                  {pick.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {pick.isMemberOnly && (
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  )}
                  <span>{pick.date}</span>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="#"
            className="inline-block mt-4 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            See the full list
          </Link>
        </div>

        {/* Recommended Topics */}
        <div>
          <h2 className="font-bold text-base mb-4 text-foreground">
            Recommended topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {recommendedTopics.map((topic) => (
              <Link
                key={topic}
                href={`/tags/${topic.toLowerCase().replace(" ", "-")}`}
                className="bg-secondary/50 hover:bg-secondary border border-border/50 text-[13px] px-4 py-2 rounded-full text-foreground transition-colors"
              >
                {topic}
              </Link>
            ))}
          </div>
          <Link
            href="#"
            className="inline-block mt-4 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            See more topics
          </Link>
        </div>

        {/* Who to follow */}
        <div>
          <h2 className="font-bold text-base mb-4 text-foreground">
            Who to follow
          </h2>
          <div className="space-y-4">
            {whoToFollow.map((user) => (
              <div key={user.id} className="flex gap-3 items-start">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[14px] text-foreground truncate">
                    {user.name}
                  </h3>
                  <p className="text-[13px] text-muted-foreground line-clamp-2">
                    {user.description}
                  </p>
                </div>
                <button className="shrink-0 h-8 px-4 text-[13px] border border-border/60 hover:border-foreground rounded-full font-medium transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
