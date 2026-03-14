import { Button } from "./ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn, formatDate } from "@/lib/utils";
import { Clock, Heart, MessageCircle } from "lucide-react";

const RenderArticle = (article: Article, index: number) => {
  return (
    <Link href={`/article/${article.slug}`} key={article.id}>
      <article
        className={cn(
          "group flex flex-col gap-6 py-6 border-border/30",
          index !== 0 && "border-t",
        )}
      >
        {/* Content */}
        <div className="flex-1 flex items-center justify-between gap-10">
          {/* Author & Date */}
          <div className="flex flex-col gap-1">
            <div className="flex gap-3 items-center">
              <Button
                onClick={() =>
                  window.location.assign(`/profile/${article.users.username}`)
                }
                variant={"link"}
                className="flex w-fit items-center gap-2 text-sm hover:underline px-0"
              >
                {article.users.avatar_url && (
                  <Avatar className="size-5">
                    <AvatarImage src={article.users.avatar_url} />
                    <AvatarFallback className="text-[10px]">
                      {article.users.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                {article.users.full_name || article.users.username}
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDate(article.created_at)}</span>
                {article.reading_time_minutes && (
                  <>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.reading_time_minutes} min
                    </span>
                  </>
                )}
              </div>
            </div>
            {/* Title and Excerpt */}
            <h2 className="text-xl sm:text-2xl font-bold transition mb-2 line-clamp-2">
              {article.title}
            </h2>
            <p className="text-[12px] sm:text-base font-medium transition mb-2 line-clamp-2 text-muted-foreground">
              {article.excerpt}
            </p>

            <div className="flex items-center gap-4">
              <p className="text-[13px] flex items-center pt-[3px]">
                {new Date(article.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {article.likes_count > 0 && (
                <div
                  className={`flex items-center gap-1 text-sm transition text-neutral-500`}
                >
                  <Heart className={`h-4 w-4`} fill="#737373" />
                  <span>{article.likes_count}</span>
                </div>
              )}

              {article.comments_count > 0 && (
                <div className="flex items-center gap-1 text-sm text-neutral-500">
                  <MessageCircle className="h-4 w-4" fill="#737373" />
                  <span>{article.comments_count}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags & Actions */}
          {article.cover_image && (
            <img
              src={article.cover_image}
              alt={article.title}
              className="rounded object-cover h-[70px] sm:h-[100px] min-w-1/4 flex-1 max-w-[30%]"
            />
          )}
        </div>
      </article>
    </Link>
  );
};

export default RenderArticle;
