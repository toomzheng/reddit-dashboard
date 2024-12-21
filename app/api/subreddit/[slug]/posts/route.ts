import { NextResponse } from 'next/server';
import snoowrap from 'snoowrap';
import OpenAI from 'openai';
import { z } from 'zod';

// Initialize the Reddit client
const reddit = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT || 'sidehustle',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the schema for sentiment analysis
const SentimentAnalysisSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  score: z.number().min(0).max(1),
});

type SentimentAnalysis = z.infer<typeof SentimentAnalysisSchema>;

// Convert Zod schema to OpenAI function parameters schema
const sentimentSchema = {
  type: "object",
  properties: {
    sentiment: {
      type: "string",
      enum: ["positive", "neutral", "negative"],
      description: "The overall sentiment of the post",
    },
    score: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description: "Confidence score of the sentiment analysis",
    },
  },
  required: ["sentiment", "score"],
};

async function analyzeSentiment(post: { title: string; content: string }) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analyzer for Reddit posts about side hustles and entrepreneurship. Analyze the post's sentiment and provide a confidence score."
        },
        {
          role: "user",
          content: `Analyze the sentiment of this Reddit post:
            Title: ${post.title}
            Content: ${post.content || '[No content]'}`
        }
      ],
      functions: [
        {
          name: "analyze_sentiment",
          description: "Analyze the sentiment of a Reddit post",
          parameters: sentimentSchema
        }
      ],
      function_call: { name: "analyze_sentiment" }
    });

    const functionResponse = response.choices[0].message.function_call;
    if (!functionResponse) {
      throw new Error('No function response received');
    }

    return SentimentAnalysisSchema.parse(JSON.parse(functionResponse.arguments));
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return { sentiment: 'neutral', score: 0.5 } as SentimentAnalysis;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword')?.toLowerCase() || '';
    const sentiment = searchParams.get('sentiment') || 'all';

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

    // Filter by keyword if provided
    const keywordFilteredPosts = keyword
      ? posts.filter(
          post =>
            post.title.toLowerCase().includes(keyword) ||
            post.content.toLowerCase().includes(keyword)
        )
      : posts;

    // Analyze sentiment for filtered posts
    const postsWithSentiment = await Promise.all(
      keywordFilteredPosts.map(async (post) => {
        const sentimentAnalysis = await analyzeSentiment(post);
        return { ...post, sentiment: sentimentAnalysis };
      })
    );

    // Filter by sentiment if provided
    const sentimentFilteredPosts = sentiment === 'all'
      ? postsWithSentiment
      : postsWithSentiment.filter(post => post.sentiment.sentiment === sentiment);

    // Sort by score in descending order
    const sortedPosts = sentimentFilteredPosts.sort((a, b) => b.score - a.score);

    return NextResponse.json(sortedPosts);
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
} 