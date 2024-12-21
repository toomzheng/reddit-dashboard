'use client';

import { useState } from 'react';
import { SubredditCard } from '@/components/Card';
import { AddRedditModal } from '@/components/AddRedditModal';

// Initial subreddits to track
const DEFAULT_SUBREDDITS = [
  { name: 'sidehustle', stats: { posts: 42, subscribers: 150000 } },
  { name: 'passive_income', stats: { posts: 28, subscribers: 80000 } },
  { name: 'entrepreneur', stats: { posts: 65, subscribers: 250000 } },
];

export default function Home() {
  const [subreddits, setSubreddits] = useState(DEFAULT_SUBREDDITS);

  const handleAddSubreddit = (name: string) => {
    setSubreddits(prev => [...prev, { name, stats: { posts: 0, subscribers: 0 } }]);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reddit Analytics Platform</h1>
        <AddRedditModal onAdd={handleAddSubreddit} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subreddits.map((subreddit) => (
          <SubredditCard
            key={subreddit.name}
            name={subreddit.name}
            stats={subreddit.stats}
          />
        ))}
      </div>
    </main>
  );
}
