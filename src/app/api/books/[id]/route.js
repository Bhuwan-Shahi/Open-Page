import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const book = await prisma.book.update({
      where: { id },
      data: body
    })

    return NextResponse.json({ book })
  } catch (error) {
    console.error('Error updating book:', error)
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    )
  }
}

// DELETE /api/books/[id] - Delete a book (Admin only)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    // Soft delete by setting isActive to false
    const book = await prisma.book.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    )
  }
}
