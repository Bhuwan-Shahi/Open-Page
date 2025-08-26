import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withAuth } from '@/lib/authMiddleware'

const prisma = new PrismaClient()

async function handler(request) {
  const method = request.method

  if (method === 'GET') {
    // Get user's cart items
    try {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: request.user.id },
        include: {
          book: true
        }
      })

      return NextResponse.json({ items: cartItems })
    } catch (error) {
      console.error('Error fetching cart:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cart' },
        { status: 500 }
      )
    }
  }

  if (method === 'POST') {
    // Add item to cart
    try {
      const { bookId, quantity = 1 } = await request.json()

      if (!bookId) {
        return NextResponse.json(
          { error: 'Book ID is required' },
          { status: 400 }
        )
      }

      // Check if book exists
      const book = await prisma.book.findUnique({
        where: { id: parseInt(bookId) }
      })

      if (!book) {
        return NextResponse.json(
          { error: 'Book not found' },
          { status: 404 }
        )
      }

      // Check if item already in cart
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          userId: request.user.id,
          bookId: parseInt(bookId)
        }
      })

      if (existingItem) {
        // Update quantity
        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
          include: { book: true }
        })
        return NextResponse.json({ item: updatedItem })
      } else {
        // Create new cart item
        const newItem = await prisma.cartItem.create({
          data: {
            userId: request.user.id,
            bookId: parseInt(bookId),
            quantity
          },
          include: { book: true }
        })
        return NextResponse.json({ item: newItem })
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      return NextResponse.json(
        { error: 'Failed to add item to cart' },
        { status: 500 }
      )
    }
  }

  if (method === 'DELETE') {
    // Remove item from cart
    try {
      const { bookId } = await request.json()

      await prisma.cartItem.deleteMany({
        where: {
          userId: request.user.id,
          bookId: parseInt(bookId)
        }
      })

      return NextResponse.json({ message: 'Item removed from cart' })
    } catch (error) {
      console.error('Error removing from cart:', error)
      return NextResponse.json(
        { error: 'Failed to remove item from cart' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export const GET = withAuth(handler)
export const POST = withAuth(handler)
export const DELETE = withAuth(handler)
