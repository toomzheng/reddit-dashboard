import { NextResponse } from 'next/server';
import snoowrap from 'snoowrap';

// Initialize the Reddit client
const reddit = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT || 'sidehustle',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Get posts from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch posts and convert them to our format
    const posts = await reddit
      .getSubreddit(params.slug)
      .getNew()
      .then(submissions =>
        submissions
          .filter(post => new Date(post.created_utc * 1000) > oneDayAgo)
          .map(post => ({
            title: post.title,
            content: post.selftext,
            score: post.score,
            numComments: post.num_comments,
            createdAt: new Date(post.created_utc * 1000),
            url: `https://reddit.com${post.permalink}`,
          }))
      );

    // Sort by score in descending order
    const sortedPosts = posts.sort((a, b) => b.score - a.score);

    return NextResponse.json(sortedPosts);
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
} 