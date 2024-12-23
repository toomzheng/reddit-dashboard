'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SubredditCard } from '@/components/Card';
import { AddRedditModal } from '@/components/AddRedditModal';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface Subreddit {
  id: string;
  name: string;
  posts: number;
  subscribers: number;
}

export default function Home() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  const router = useRouter();
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSubreddits();
    }
  }, [status]);

  const fetchSubreddits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subreddits', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/signin');
          return;
        }
        throw new Error('Failed to fetch subreddits');
      }

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
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/signin');
          return;
        }
        throw new Error('Failed to add subreddit');
      }

      // Refresh the subreddits list
      fetchSubreddits();
    } catch (err) {
      console.error('Error adding subreddit:', err);
      // You might want to show an error message to the user here
    }
  };

  const handleDeleteSubreddit = async (name: string) => {
    try {
      const response = await fetch(`/api/subreddits/${name}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/signin');
          return;
        }
        throw new Error('Failed to delete subreddit');
      }

      // Remove the subreddit from the local state
      setSubreddits(subreddits.filter(s => s.name !== name));
    } catch (err) {
      console.error('Error deleting subreddit:', err);
      // You might want to show an error message to the user here
    }
  };

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: '/auth/signin',
      redirect: true,
    });
  };

  if (status === 'loading' || loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Reddit Analytics Platform</h1>
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
        <div>
          <h1 className="text-3xl font-bold">Reddit Analytics Platform</h1>
          <p className="text-gray-600 mt-2">Welcome, {session?.user?.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <AddRedditModal onAdd={handleAddSubreddit} />
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {subreddits.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No subreddits added yet</h2>
          <p className="text-gray-600">
            Click the "Add Subreddit" button to start tracking a subreddit
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subreddits.map((subreddit) => (
            <SubredditCard
              key={subreddit.id}
              name={subreddit.name}
              stats={{
                posts: subreddit.posts,
                subscribers: subreddit.subscribers,
              }}
              onDelete={handleDeleteSubreddit}
            />
          ))}
        </div>
      )}
    </main>
  );
}
