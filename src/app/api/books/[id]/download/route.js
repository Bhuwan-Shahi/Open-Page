import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const GET = withAuth(async function(request, { params }) {
  try {
    const { id } = await params;
    const userId = request.user.id;

    // Check if user has active access to this book
    const bookAccess = await prisma.userBookAccess.findUnique({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: id
        }
      },
      include: {
        book: true,
        order: true
      }
    });

    if (!bookAccess || !bookAccess.isActive) {
      return NextResponse.json(
        { error: 'Book access not found or access has been revoked' },
        { status: 403 }
      );
    }

    // Check if access has expired (if applicable)
    if (bookAccess.expiresAt && new Date() > bookAccess.expiresAt) {
      // Update access to inactive
      await prisma.userBookAccess.update({
        where: {
          userId_bookId: {
            userId: userId,
            bookId: id
          }
        },
        data: {
          isActive: false
        }
      });

      return NextResponse.json(
        { error: 'Book access has expired' },
        { status: 403 }
      );
    }

    const book = bookAccess.book;
    
    // Get the PDF file path
    const pdfPath = path.join(process.cwd(), 'public', book.pdfUrl);
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        { error: 'Book file not found' },
        { status: 404 }
      );
    }

    // Update access tracking
    await prisma.userBookAccess.update({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: id
        }
      },
      data: {
        downloadCount: {
          increment: 1
        },
        lastAccessed: new Date()
      }
    });

    // Read the file
    const fileBuffer = fs.readFileSync(pdfPath);
    
    // Return the file as a download
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${book.title}.pdf"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error downloading book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
