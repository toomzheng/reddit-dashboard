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

// Define the schema for post categorization
const PostCategoryAnalysisSchema = z.object({
  sideHustleOpportunities: z.boolean(),
  freelanceOpportunities: z.boolean(),
  passiveIncomeOpportunities: z.boolean(),
  moneyTalk: z.boolean(),
  sideHustleTips: z.boolean(),
  sideHustleResources: z.boolean(),
});

type PostCategoryAnalysis = z.infer<typeof PostCategoryAnalysisSchema>;

// Convert Zod schema to OpenAI function parameters schema
const categorySchema = {
  type: "object",
  properties: {
    sideHustleOpportunities: {
      type: "boolean",
      description: "Posts where people are posting about their side hustle opportunities",
    },
    freelanceOpportunities: {
      type: "boolean",
      description: "Posts where people are posting about freelance opportunities",
    },
    passiveIncomeOpportunities: {
      type: "boolean",
      description: "Posts where people are posting about how they're able to make passive income",
    },
    moneyTalk: {
      type: "boolean",
      description: "Posts where people are talking about spending money",
    },
    sideHustleTips: {
      type: "boolean",
      description: "Posts where people are posting about tips when they first get into side hustles",
    },
    sideHustleResources: {
      type: "boolean",
      description: "Posts where people are posting about the new resources they're using",
    },
  },
  required: [
    "sideHustleOpportunities",
    "freelanceOpportunities",
    "passiveIncomeOpportunities",
    "moneyTalk",
    "sideHustleTips",
    "sideHustleResources",
  ],
};

async function analyzePost(post: { title: string; content: string }) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a Reddit post analyzer. Analyze the post and categorize it based on its content."
        },
        {
          role: "user",
          content: `Analyze this Reddit post and categorize it:
            Title: ${post.title}
            Content: ${post.content}`
        }
      ],
      functions: [
        {
          name: "categorize_post",
          description: "Categorize a Reddit post into predefined categories",
          parameters: categorySchema
        }
      ],
      function_call: { name: "categorize_post" }
    });

    const functionResponse = response.choices[0].message.function_call;
    if (!functionResponse) {
      throw new Error('No function response received');
    }

    return PostCategoryAnalysisSchema.parse(JSON.parse(functionResponse.arguments));
  } catch (error) {
    console.error('Error analyzing post:', error);
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Get posts from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch posts
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
            url: `https://reddit.com${post.permalink}`,
          }))
      );

    // Analyze posts in parallel
    const analysisResults = await Promise.all(
      posts.map(post => analyzePost(post))
    );

    // Combine posts with their analysis
    const analyzedPosts = posts.map((post, index) => ({
      ...post,
      categories: analysisResults[index],
    }));

    // Group posts by category
    const themes = [
      {
        name: "Side Hustle Opportunities",
        description: "Posts about potential side hustle opportunities",
        posts: analyzedPosts.filter(post => post.categories?.sideHustleOpportunities),
      },
      {
        name: "Freelance Opportunities",
        description: "Posts about freelancing opportunities",
        posts: analyzedPosts.filter(post => post.categories?.freelanceOpportunities),
      },
      {
        name: "Passive Income",
        description: "Posts about passive income streams",
        posts: analyzedPosts.filter(post => post.categories?.passiveIncomeOpportunities),
      },
      {
        name: "Money Talk",
        description: "Discussions about money and finances",
        posts: analyzedPosts.filter(post => post.categories?.moneyTalk),
      },
      {
        name: "Side Hustle Tips",
        description: "Tips and advice for side hustles",
        posts: analyzedPosts.filter(post => post.categories?.sideHustleTips),
      },
      {
        name: "Resources",
        description: "Useful resources and tools",
        posts: analyzedPosts.filter(post => post.categories?.sideHustleResources),
      },
    ].map(theme => ({
      ...theme,
      count: theme.posts.length,
    }));

    return NextResponse.json(themes);
  } catch (error) {
    console.error('Error analyzing themes:', error);
    return NextResponse.json(
      { error: 'Failed to analyze themes' },
      { status: 500 }
    );
  }
} 