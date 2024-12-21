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
import { SearchBar } from './SearchBar';
import { Badge } from '@/components/ui/badge';

interface RedditPost {
  title: string;
  score: number;
  numComments: number;
  createdAt: Date;
  url: string;
  sentiment: {
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
  };
}

interface TopPostsTableProps {
  subreddit: string;
}

export function TopPostsTable({ subreddit }: TopPostsTableProps) {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [sentiment, setSentiment] = useState('all');

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (sentiment !== 'all') params.append('sentiment', sentiment);

        const response = await fetch(
          `/api/subreddit/${subreddit}/posts?${params.toString()}`
        );
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data.map((post: any) => ({
          ...post,
          createdAt: new Date(post.createdAt),
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [subreddit, keyword, sentiment]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SearchBar
          keyword={keyword}
          sentiment={sentiment}
          onKeywordChange={setKeyword}
          onSentimentChange={setSentiment}
        />
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <SearchBar
          keyword={keyword}
          sentiment={sentiment}
          onKeywordChange={setKeyword}
          onSentimentChange={setSentiment}
        />
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SearchBar
        keyword={keyword}
        sentiment={sentiment}
        onKeywordChange={setKeyword}
        onSentimentChange={setSentiment}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[45%]">Title</TableHead>
              <TableHead className="w-[15%]">Sentiment</TableHead>
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
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getSentimentColor(post.sentiment.sentiment)}
                  >
                    {post.sentiment.sentiment}
                  </Badge>
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
    </div>
  );
} 