# Reddit Analytics Platform - Product Requirements Document (PRD)

## 1. Project Overview

### 1.1 Description

We are building a Reddit Analytics Platform focused on emerging side hustle trends. The platform will:

- Allow users to view a list of subreddits and quickly see which ones are trending
- Fetch and display top Reddit posts from specific subreddits
- Perform AI-driven categorization of posts (e.g., "Side Hustle Opportunities", "Freelance Opportunities", etc.)
- Provide an interface to filter by keywords and sentiment
- Allow users to easily add new subreddits to track

### 1.2 Technology Stack

- Next.js (latest version) with the App Router (i.e., using /app directory)
- shadcn and Tailwind CSS for UI styling
- Lucide Icons for iconography
- Snoowrap library for fetching Reddit posts
- OpenAI (GPT-3.5 or GPT-4) for text categorization and sentiment analysis

## 2. Core Functionalities & Requirements

### 2.1 Home Page (Landing)

**List of Subreddits (Cards):**
- Display all tracked subreddits as cards
- Each card shows at least subreddit name, maybe short stats if available

**Add Reddit Button + Modal:**
- Button: "Add Reddit" opens a modal
- Modal: user pastes the subreddit's URL or name
- Once submitted, a new subreddit card is added to the home page

**Dashboard (Trending Topics Over Time):**
- (Future expansion) A dashboard to track trending topics over time and highlight top content

### 2.2 Subreddit Page

**Navigation:**
- Clicking on a subreddit card from the Home page navigates the user to /subreddit/[slug]

**Tabs ("Top Posts" and "Themes"):**

*Top Posts:*
- Show top posts from the last 24 hours sorted by score
- Render in a table component

*Themes:*
- Show AI-driven analysis of each post's category
- Display category "cards" (e.g., "Freelance Opportunities," "Side Hustle Tips") with a count of how many posts fit each category
- Clicking a category card opens a side panel to show all posts under that category

### 2.3 Reddit Data Fetching

**Library:** Snoowrap for fetching Reddit data

**Data to Retrieve:**
- Title
- Score
- Content (self-text)
- URL (including permalink)
- Created at (UTC)
- Number of comments

**Time Filter:** Only fetch posts from the last 24 hours
**Sorting:** Return the results in descending order by score

### 2.4 Analyze Reddit Posts (AI Themes)

**OpenAI Integration:** Use structured output to categorize posts

**Categorization Fields:**
- Freelance Opportunities
- Side Hustle Opportunities
- Passive Income Opportunities
- Money Talk
- Side Hustle Tips
- Side Hustle Resources

**Concurrency:** Process posts in parallel to speed up categorization

**Themes UI:**
- Each category appears as a card with title, description, and number of posts
- Clicking a category card shows a side panel with post titles (and potentially short snippets)

### 2.5 Search Functionality

- Keyword Filtering: e.g., "passive income," "freelancing," etc.
- Sentiment Analysis (Community Excitement): Rank ideas based on their positivity or hype
- (Optional / future scope) Integrate sentiment scoring via OpenAI or another service

### 2.6 Adding New Cards & Re-Analysis

**Add a new card:**
- A user can create a new card (similar to "Add Reddit" but might also apply to custom data)
- After adding a new card, the system re-triggers data fetch and analysis

## 3. File Structure

Below is a recommended minimal file structure that keeps the project well-organized:

```
reddit-sidehustle
.
├── README.md
├── app
│   ├── layout.tsx           # App-wide layout (header, footer, etc.)
│   ├── globals.css          # Global styling (Tailwind/shadcn)
│   ├── page.tsx             # Home page -> shows subreddits + "Add Reddit" modal
│   └── subreddit
│       └── [slug]
│           ├── page.tsx     # Subreddit details (tabs: Top Posts / Themes)
│           └── components   # (Optional) local components for the subreddit page 
│               ├── TopPostsTable.tsx
│               ├── ThemesList.tsx
│               └── ThemesSidePanel.tsx
├── components
│   ├── Card.tsx             # Generic Card component for Subreddit on Home
│   ├── AddRedditModal.tsx   # Modal for adding a new subreddit
│   ├── Icons.tsx            # Lucide icon wrapper or registry
│   └── ui                   # (Optional) shadcn UI wrapper components
│       └── ...
├── lib
│   ├── reddit.ts            # Snoowrap logic (fetching / sorting posts)
│   └── openai.ts            # OpenAI logic (categorizing posts)
├── .env                     # Environment variables
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

**Notes on File Placement:**
- `app/` directory: Uses Next.js App Router
- `components/`: Houses all shared or reusable UI elements such as cards, modals, icons, etc.
- `lib/`: Contains the business logic or "backend-like" functions (Snoowrap and OpenAI)
- `.env`: Store Reddit and OpenAI credentials here, never commit to version control

## 4. Documentation References

### 4.1 Snoowrap Usage (reddit.ts)

<details>
<summary>Example Snoowrap fetch code</summary>

```typescript
import snoowrap from 'snoowrap';

// Define types for Reddit post data
interface RedditPost {
    title: string;
    content: string;
    score: number;
    numComments: number;
    createdAt: Date;
    url: string;
}

// Initialize the Reddit client
const reddit = new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT || 'sidehustle',
    clientId: process.env.REDDIT_CLIENT_ID || 'YOUR_CLIENT_ID',
    clientSecret: process.env.REDDIT_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
    username: process.env.REDDIT_USERNAME || 'YOUR_USERNAME',
    password: process.env.REDDIT_PASSWORD || 'YOUR_PASSWORD',
});

export async function getRecentPosts(subreddit: string = 'sidehustle'): Promise<RedditPost[]> {
    try {
        // Get posts from the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Fetch posts and convert them to our format
        const posts = await reddit
            .getSubreddit(subreddit)
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
        return posts.sort((a, b) => b.score - a.score);

    } catch (error) {
        console.error('Error fetching Reddit posts:', error);
        throw error;
    }
}

// Optional: Add a method to fetch posts from multiple subreddits
export async function getRecentPostsFromMultiple(subreddits: string[]): Promise<Record<string, RedditPost[]>> {
    const results: Record<string, RedditPost[]> = {};

    await Promise.all(
        subreddits.map(async (subreddit) => {
            results[subreddit] = await getRecentPosts(subreddit);
        })
    );

    return results;
}
```
</details>

### 4.2 OpenAI Structured Output (openai.ts)

<details>
<summary>Example OpenAI categorization code</summary>

```typescript
// Suppress punycode warning
process.removeAllListeners('warning');

import 'dotenv/config';
import OpenAI from 'openai';
import { RedditPost } from './reddit';
import { z } from 'zod';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the schema with descriptions for each category
export const PostCategoryAnalysisSchema = z.object({
  sideHustleOpportunities: z.boolean().describe(
    'Posts where people are posting about their side hustle opportunities'
  ),
  freelanceOpportunities: z.boolean().describe(
    'Posts where people are posting about freelance opportunities'
  ),
  passiveIncomeOpportunities: z.boolean().describe(
    'Posts where people are posting about how they\'re able to make passive income'
  ),
  moneyTalk: z.boolean().describe(
    'Posts where people are talking about spending money'
  ),
  sideHustleTips: z.boolean().describe(
    'Posts where people are posting about tips when they first get into side hustles or even deep into side hustling'
  ),
  sideHustleResources: z.boolean().describe(
    'Posts where people are posting about the new resources they\'re using to maximize side hustle output'
  ),
});

// Export the type derived from the schema
export type PostCategoryAnalysis = z.infer<typeof PostCategoryAnalysisSchema>;

// Convert Zod schema to OpenAI function parameters schema
const categorySchema = {
  type: "object",
  properties: Object.fromEntries(
    Object.entries(PostCategoryAnalysisSchema.shape).map(([key, value]) => [
      key,
      {
        type: "boolean",
        description: value.description,
      }
    ])
  ),
  required: Object.keys(PostCategoryAnalysisSchema.shape),
};

export async function analyzePostCategory(post: RedditPost): Promise<PostCategoryAnalysis> {
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

    // Get the function call response
    const functionResponse = response.choices[0].message.function_call;
    if (!functionResponse) {
      throw new Error('No function response received');
    }

    // Parse and validate the response using Zod
    const analysis = PostCategoryAnalysisSchema.parse(
      JSON.parse(functionResponse.arguments)
    );
    return analysis;

  } catch (error) {
    console.error('Error analyzing post:', error);
    // Return all false if analysis fails
    return {
      sideHustleOpportunities: false,
      freelanceOpportunities: false,
      passiveIncomeOpportunities: false,
      moneyTalk: false,
      sideHustleTips: false,
      sideHustleResources: false,
    };
  }
}

// Analyze multiple posts concurrently
export async function analyzeMultiplePosts(posts: RedditPost[]): Promise<PostCategoryAnalysis[]> {
  try {
    const analyses = await Promise.all(
      posts.map(post => analyzePostCategory(post))
    );
    return analyses;
  } catch (error) {
    console.error('Error analyzing multiple posts:', error);
    throw error;
  }
}

// Add this at the bottom of the file
async function main() {
  const testPost: RedditPost = {
    title: "My experience with dropshipping",
    content: "Here's how I made $1000 last month with my side hustle...",
    score: 0,
    numComments: 0,
    createdAt: new Date(),
    url: "https://reddit.com/test"
  };

  const result = await analyzePostCategory(testPost);
  console.log('Analysis Result:', JSON.stringify(result, null, 2));
}

// Call the main function
main().catch(console.error);
```
</details>

## 5. Non-Functional Requirements & Considerations

### Performance
- Concurrency for OpenAI categorization to speed up processing
- Caching or rate-limiting might be needed since the Reddit API and OpenAI have usage limits

### Security
- Store all API keys in .env
- Secure server-side endpoints to avoid exposing credentials in the client

### Scalability
- If multiple subreddits are tracked, ensure the database or storage can handle it
- Potentially, use a queue system for analyzing large volumes of posts

### Usability
- Keep the UI straightforward: card-based design, clear tab structure, minimal modals

### Maintainability
- The recommended file structure separates concerns (UI in components, data fetching in lib, pages in app)

## 6. Summary & Next Steps

**Implementation:** Developers can now proceed to implement the features in Next.js using the references in lib/reddit.ts and lib/openai.ts

**UI/UX:** Designers/developers should finalize the styling with Tailwind and shadcn components, ensuring a coherent user flow

**Testing:** Once functional, incorporate unit and integration tests (potentially with Jest or testing library of choice)

**Deliverables:**
- Fully functioning Home Page displaying subreddit cards, plus "Add Subreddit" modal
- Subreddit Page with "Top Posts" and "Themes" tabs, using actual data from Snoowrap/OpenAI
- Verified concurrency in categorization for timely responses
- Basic search and filtering by category or sentiment (if included in MVP)

This PRD provides all key requirements, recommended structure, and reference code. The development team should have a clear picture of what to build, why it's needed, and how it might be approached.