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
        // TODO: Replace with actual API call
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
    return <div>Loading themes...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {themes.map((theme) => (
        <Sheet key={theme.name}>
          <SheetTrigger asChild>
            <Card
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedTheme(theme)}
            >
              <h3 className="text-lg font-semibold mb-2">{theme.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{theme.description}</p>
              <div className="text-sm font-medium">{theme.count} posts</div>
            </Card>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{theme.name}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {theme.posts.map((post) => (
                <a
                  key={post.url}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 hover:bg-gray-50 rounded-lg"
                >
                  <div className="font-medium mb-1">{post.title}</div>
                  <div className="text-sm text-gray-600">Score: {post.score}</div>
                </a>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
} 