import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/authMiddleware'

// GET /api/books - Get all books (public)
export async function GET() {
  try {
    const books = await prisma.book.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({ books })
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

// POST /api/books - Create a new book (Admin only)
async function createBook(request) {
  try {
    const body = await request.json()
    const { title, author, description, price, category, isbn, pages, language, pdfUrl } = body

    // Basic validation
    if (!title || !author || !price) {
      return NextResponse.json(
        { error: 'Title, author, and price are required' },
        { status: 400 }
      )
    }

    // PDF URL validation
    if (!pdfUrl || pdfUrl.trim() === '') {
      return NextResponse.json(
        { error: 'PDF URL is required' },
        { status: 400 }
      )
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        price: parseFloat(price),
        category,
        isbn,
        pages: pages ? parseInt(pages) : null,
        language: language || 'English',
        pdfUrl: pdfUrl,
      }
    })

    return NextResponse.json({ book }, { status: 201 })
  } catch (error) {
    console.error('Error creating book:', error)
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    )
  }
}

// Apply admin authentication to POST method
export const POST = withAdminAuth(createBook)
