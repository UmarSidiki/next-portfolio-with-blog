import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const db = await getDatabase();
    const collection = db.collection('blogposts');

    const { slug } = await params;
    
    // Find post by slug
    const post = await collection.findOne({ 
      slug: slug,
      status: 'published' // Only return published posts for public viewing
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store, must-revalidate' } }
      );
    }

    // Enhanced caching for individual blog posts
    return NextResponse.json({
      success: true,
      data: post
    }, { 
      headers: { 
        'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400',
        'Vary': 'Accept-Encoding'
      } 
    });

  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500, headers: { 'Cache-Control': 'no-store, must-revalidate' } }
    );
  }
}
