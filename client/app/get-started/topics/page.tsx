"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { tagAPI, userAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Check, Plus, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  slug: string;
  category: string;
}

export default function TopicsSelectionPage() {
  const { user, updateUser } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data } = await tagAPI.getAll();
        setTags(data.tags || []);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tags, searchQuery]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleContinue = async () => {
    if (selectedTags.length < 3) return;
    setSaving(true);
    try {
      await userAPI.saveInterests(selectedTags);
      if (user) {
        updateUser({ ...user, has_interests: true });
      }
      router.push("/");
    } catch (error) {
      console.error("Failed to save interests:", error);
      router.push("/");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center">
      <div className="w-full max-w-4xl px-6 py-20 flex flex-col items-center">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-old font-medium tracking-tight text-foreground">
            What are you interested in?
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose 3 or more topics to help us customize your reading experience.
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-xl relative mb-12">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search all topics"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-6 rounded-full bg-secondary/30 border-none focus:ring-1 focus:ring-foreground/20 text-lg transition-all outline-none"
          />
        </div>

        {/* Tags Grid - Chips Style */}
        <div className="w-full flex flex-wrap justify-center gap-3 mb-32">
          {filteredTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full border text-[15px] font-medium transition-all duration-200",
                  isSelected
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-foreground border-border/60 hover:border-foreground/40"
                )}
              >
                {tag.name}
                {isSelected ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Plus className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            );
          })}
          
          {filteredTags.length === 0 && (
            <p className="py-10 text-muted-foreground italic">No topics found matching "{searchQuery}"</p>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full h-24 border-t border-border/40 bg-background flex items-center justify-center px-6 z-50">
        <div className="w-full max-w-4xl flex items-center justify-between">
          <div className="text-sm font-medium">
            {selectedTags.length < 3 ? (
              <span className="text-muted-foreground">Select {3 - selectedTags.length} more to continue</span>
            ) : (
              <span className="text-foreground">{selectedTags.length} topics selected</span>
            )}
          </div>
          
          <Button
            onClick={handleContinue}
            disabled={selectedTags.length < 3 || saving}
            variant="default"
            className={cn(
              "h-12 px-10 rounded-full text-base font-bold transition-all duration-300",
              selectedTags.length >= 3 ? "bg-foreground text-background hover:bg-foreground/90 opacity-100" : "opacity-30 pointer-events-none"
            )}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Finish"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
