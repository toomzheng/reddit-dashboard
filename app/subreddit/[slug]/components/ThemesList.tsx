'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Loader2 } from 'lucide-react';

interface Theme {
  name: string;
  description: string;
  count: number;
  posts: {
    title: string;
    url: string;
    score: number;
  }[];
}

interface ThemesListProps {
  subreddit: string;
}

export function ThemesList({ subreddit }: ThemesListProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  useEffect(() => {
    async function fetchThemes() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/subreddit/${subreddit}/themes`);
        if (!response.ok) throw new Error('Failed to fetch themes');
        const data = await response.json();
        setThemes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch themes');
      } finally {
        setLoading(false);
      }
    }

    fetchThemes();
  }, [subreddit]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-40 bg-gray-100 rounded-lg border border-gray-200"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <h3 className="text-lg font-semibold mb-2">Error Loading Themes</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (themes.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-lg font-semibold mb-2">No Themes Found</h3>
        <p>We couldn't find any relevant themes in the recent posts.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {themes.map((theme) => (
        <Sheet key={theme.name}>
          <SheetTrigger asChild>
            <Card
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors hover:shadow-md"
              onClick={() => setSelectedTheme(theme)}
            >
              <h3 className="text-lg font-semibold mb-2">{theme.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{theme.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{theme.count} posts</div>
                {theme.count > 0 && (
                  <div className="text-xs text-gray-500">Click to view</div>
                )}
              </div>
            </Card>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{theme.name}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {theme.posts.map((post) => (
                <a
                  key={post.url}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors"
                >
                  <div className="font-medium mb-2">{post.title}</div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="flex items-center">
                      Score: {post.score}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
} 