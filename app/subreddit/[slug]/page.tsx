'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TopPostsTable } from './components/TopPostsTable';
import { ThemesList } from './components/ThemesList';

interface SubredditPageProps {
  params: {
    slug: string;
  };
}

export default function SubredditPage({ params }: SubredditPageProps) {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">r/{params.slug}</h1>
        <p className="text-gray-600">Analyzing trends and opportunities</p>
      </div>

      <Tabs defaultValue="posts" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="posts">Top Posts</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <TopPostsTable subreddit={params.slug} />
        </TabsContent>

        <TabsContent value="themes" className="space-y-4">
          <ThemesList subreddit={params.slug} />
        </TabsContent>
      </Tabs>
    </main>
  );
} 