'use client';

import { useState, useEffect } from 'react';
import { SubredditCard } from '@/components/Card';
import { AddRedditModal } from '@/components/AddRedditModal';

interface Subreddit {
  id: string;
  name: string;
  posts: number;
  subscribers: number;
}

export default function Home() {
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubreddits();
  }, []);

  const fetchSubreddits = async () => {
    try {
      const response = await fetch('/api/subreddits');
      if (!response.ok) throw new Error('Failed to fetch subreddits');
      const data = await response.json();
      setSubreddits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subreddits');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubreddit = async (name: string) => {
    try {
      const response = await fetch('/api/subreddits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add subreddit');
      }
      
      // Refresh the subreddits list
      fetchSubreddits();
    } catch (err) {
      console.error('Error adding subreddit:', err);
      // You might want to show an error message to the user here
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Reddit Analytics Platform</h1>
          <AddRedditModal onAdd={handleAddSubreddit} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Reddit Analytics Platform</h1>
          <AddRedditModal onAdd={handleAddSubreddit} />
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <h3 className="text-lg font-semibold mb-2">Error Loading Subreddits</h3>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reddit Analytics Platform</h1>
        <AddRedditModal onAdd={handleAddSubreddit} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subreddits.map((subreddit) => (
          <SubredditCard
            key={subreddit.id}
            name={subreddit.name}
            stats={{
              posts: subreddit.posts,
              subscribers: subreddit.subscribers,
            }}
          />
        ))}
      </div>
    </main>
  );
}
