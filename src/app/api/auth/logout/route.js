import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // You could add server-side cleanup here if needed
    // For example, invalidating sessions in a database, clearing cache, etc.
    
    const response = NextResponse.json({
      message: 'Logged out successfully'
    });

    // Clear the auth cookie
    response.cookies.set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Set to past date to delete
      path: '/' // Ensure we clear the cookie for the entire site
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
