import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export function withAuth(handler) {
  return async function(request, context) {
    try {
      const token = request.cookies.get('authToken')?.value

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      // Add user info to request
      request.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }

      return handler(request, context)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }
  }
}

export function withAdminAuth(handler) {
  return async function(request, context) {
    try {
      const token = request.cookies.get('authToken')?.value

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      if (decoded.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }

      // Add user info to request
      request.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }

      return handler(request, context)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }
  }
}
