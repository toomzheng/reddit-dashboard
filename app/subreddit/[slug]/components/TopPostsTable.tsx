'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';

interface RedditPost {
  title: string;
  score: number;
  numComments: number;
  createdAt: Date;
  url: string;
}

interface TopPostsTableProps {
  subreddit: string;
}

export function TopPostsTable({ subreddit }: TopPostsTableProps) {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        // TODO: Replace with actual API call using snoowrap
        const response = await fetch(`/api/subreddit/${subreddit}/posts`);
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [subreddit]);

  if (loading) {
    return <div>Loading posts...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Title</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Comments</TableHead>
            <TableHead className="text-right">Posted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.url}>
              <TableCell>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {post.title}
                </a>
              </TableCell>
              <TableCell className="text-right">{post.score}</TableCell>
              <TableCell className="text-right">{post.numComments}</TableCell>
              <TableCell className="text-right">
                {formatDistanceToNow(post.createdAt, { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 