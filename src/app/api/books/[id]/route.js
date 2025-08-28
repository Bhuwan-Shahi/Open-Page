import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/authMiddleware'
import fs from 'fs'
import path from 'path'

// GET /api/books/[id] - Get a single book
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const book = await prisma.book.findUnique({
      where: {
        id: id,
        isActive: true
      },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ book })
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    )
  }
}

// PUT /api/books/[id] - Update a book (Admin only)
export const PUT = withAuth(async function(request, { params }) {
  try {
    const { id } = await params
    
    // Check if user is admin
    if (request.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json()
    const { title, author, price, description, category } = body;

    // Validate required fields
    if (!title || !author || price === undefined) {
      return NextResponse.json(
        { error: 'Title, author, and price are required' },
        { status: 400 }
      );
    }

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: id }
    });

    if (!existingBook) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }
    
    const book = await prisma.book.update({
      where: { id },
      data: {
        title,
        author,
        price: parseFloat(price),
        description: description || existingBook.description,
        category: category || existingBook.category,
      }
    })

    return NextResponse.json({ 
      message: 'Book updated successfully',
      book 
    })
  } catch (error) {
    console.error('Error updating book:', error)
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    )
  }
})

// DELETE /api/books/[id] - Delete a book (Admin only)
export const DELETE = withAuth(async function(request, { params }) {
  try {
    const { id } = await params

    // Check if user is admin
    if (request.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: id }
    });

    if (!existingBook) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Check if book has any completed orders (prevent deletion if purchased)
    const orderItems = await prisma.orderItem.findMany({
      where: { 
        bookId: id,
        order: {
          status: 'COMPLETED'
        }
      }
    });

    if (orderItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete book that has been purchased. Use soft delete instead.' },
        { status: 400 }
      );
    }

    // Delete PDF file if exists
    if (existingBook.pdfPath) {
      const filePath = path.join(process.cwd(), 'public', existingBook.pdfPath);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fileError) {
          console.error('Error deleting PDF file:', fileError);
        }
      }
    }

    // Hard delete if no purchases, otherwise soft delete
    await prisma.book.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    )
  }
})
