import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import snoowrap from 'snoowrap';
import { authOptions } from '../../auth/[...nextauth]/route';

// Initialize the Reddit client
const reddit = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT || 'sidehustle',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all subreddits for the current user
    const subreddits = await prisma.subreddit.findMany({
      where: {
        userId: session.user.id
      }
    });

    // Update each subreddit's stats
    const updates = subreddits.map(async (subreddit) => {
      try {
        // Get subreddit info
        const subredditInfo = await reddit.getSubreddit(subreddit.name).fetch();

        // Get posts from the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const posts = await reddit
          .getSubreddit(subreddit.name)
          .getNew()
          .then(submissions =>
            submissions.filter(post => new Date(post.created_utc * 1000) > oneDayAgo)
          );

        // Update the subreddit stats
        return prisma.subreddit.update({
          where: { 
            id: subreddit.id,
            userId: session.user.id // Ensure we only update user's own subreddits
          },
          data: {
            subscribers: subredditInfo.subscribers,
            posts: posts.length,
            lastUpdated: new Date(),
          },
        });
      } catch (error) {
        console.error(`Error updating stats for r/${subreddit.name}:`, error);
        return null;
      }
    });

    // Wait for all updates to complete
    const results = await Promise.all(updates);
    const successCount = results.filter(Boolean).length;

    return NextResponse.json({
      message: `Updated stats for ${successCount} out of ${subreddits.length} subreddits`,
    });
  } catch (error) {
    console.error('Error updating subreddit stats:', error);
    return NextResponse.json(
      { error: 'Failed to update subreddit stats' },
      { status: 500 }
    );
  }
} 