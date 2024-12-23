import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import snoowrap from 'snoowrap';
import { authOptions } from '../auth/[...nextauth]/route';

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

    const subreddits = await prisma.subreddit.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: { updatedAt: 'desc' },
    });
    
    return NextResponse.json(subreddits);
  } catch (error) {
    console.error('Error fetching subreddits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subreddits' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name } = await request.json();
    
    // Check if the user already tracks this subreddit
    const existingSubreddit = await prisma.subreddit.findFirst({
      where: {
        name,
        userId: session.user.id
      }
    });

    if (existingSubreddit) {
      return NextResponse.json(
        { error: 'You are already tracking this subreddit' },
        { status: 400 }
      );
    }
    
    // Validate subreddit exists and get its stats
    const subredditInfo = await reddit.getSubreddit(name).fetch();
    
    const subreddit = await prisma.subreddit.create({
      data: {
        name,
        subscribers: subredditInfo.subscribers,
        posts: 0, // We'll update this with the actual 24h post count
        userId: session.user.id,
      },
    });

    // Get posts from the last 24 hours to count them
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const submissions = await reddit
      .getSubreddit(name)
      .getNew({ limit: 1000 }); // Maximum limit allowed by Reddit API
    
    const posts = submissions.filter(post => 
      new Date(post.created_utc * 1000) > oneDayAgo
    );

    // Update the post count
    await prisma.subreddit.update({
      where: { id: subreddit.id },
      data: { posts: posts.length },
    });

    return NextResponse.json(subreddit);
  } catch (error) {
    console.error('Error creating subreddit:', error);
    return NextResponse.json(
      { error: 'Failed to create subreddit' },
      { status: 500 }
    );
  }
}