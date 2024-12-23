import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function DELETE(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name } = params;
    if (!name) {
      return NextResponse.json(
        { error: 'Subreddit name is required' },
        { status: 400 }
      );
    }

    // Delete the subreddit
    await prisma.subreddit.deleteMany({
      where: {
        name,
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subreddit:', error);
    return NextResponse.json(
      { error: 'Failed to delete subreddit' },
      { status: 500 }
    );
  }
}
