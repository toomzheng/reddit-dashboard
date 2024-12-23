import Link from 'next/link';
import { Card as CardWrapper } from './ui/card';
import { useEffect } from 'react';

interface SubredditCardProps {
  name: string;
  stats?: {
    posts?: number;
    subscribers?: number;
  };
  onDelete?: (name: string) => void;
}

export function SubredditCard({ name, stats, onDelete }: SubredditCardProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'x') {
        onDelete?.(name);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [name, onDelete]);

  const handleClick = (e: React.MouseEvent) => {
    if (onDelete) {
      e.preventDefault();
      onDelete(name);
    }
  };

  return (
    <Link href={`/subreddit/${name}`}>
      <CardWrapper className="p-6 hover:bg-gray-50 transition-colors cursor-pointer relative group">
        {onDelete && (
          <button
            onClick={handleClick}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-500"
          >
            ✕
          </button>
        )}
        <h3 className="text-xl font-semibold mb-2">r/{name}</h3>
        {stats && (
          <div className="text-sm text-gray-600">
            {stats.posts && <p>{stats.posts} posts in last 24h</p>}
            {stats.subscribers && <p>{stats.subscribers.toLocaleString()} subscribers</p>}
          </div>
        )}
      </CardWrapper>
    </Link>
  );
}