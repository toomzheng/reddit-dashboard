import Link from 'next/link';
import { Card as CardWrapper } from './ui/card';

interface SubredditCardProps {
  name: string;
  stats?: {
    posts?: number;
    subscribers?: number;
  };
}

export function SubredditCard({ name, stats }: SubredditCardProps) {
  return (
    <Link href={`/subreddit/${name}`}>
      <CardWrapper className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
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