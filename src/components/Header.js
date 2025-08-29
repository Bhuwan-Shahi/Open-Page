'use client'

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { getTotalItems, clearCart } = useCart();
  const { user, logout, loading } = useAuth();
  const itemCount = getTotalItems();

  const handleLogout = async () => {
    try {
      // Clear cart before logging out
      await clearCart();
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b" style={{ borderColor: '#D1D5DB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity" style={{ color: '#2D3748' }}>
              📚 Open Book 
            </Link>
          </div>
          <nav className="flex space-x-6 items-center">
            <Link href="/" className="text-lg font-medium transition-colors hover:opacity-80" style={{ color: '#4A90E2' }}>
              Home
            </Link>
            <Link href="/books" className="text-lg font-medium transition-colors hover:opacity-80" style={{ color: '#4A90E2' }}>
              All Books
            </Link>
            {user && user.role === 'ADMIN' && (
              <>
                <Link href="/admin/dashboard" className="text-lg font-medium transition-colors hover:opacity-80" style={{ color: '#4A90E2' }}>
                  Admin
                </Link>
                <Link href="/admin/users" className="text-lg font-medium transition-colors hover:opacity-80" style={{ color: '#4A90E2' }}>
                  Users
                </Link>
                <Link href="/admin/payments" className="text-lg font-medium transition-colors hover:opacity-80" style={{ color: '#4A90E2' }}>
                  Payments
                </Link>
              </>
            )}
            {user && user.role === 'USER' && (
              <Link href="/dashboard" className="text-lg font-medium transition-colors hover:opacity-80" style={{ color: '#4A90E2' }}>
                My Dashboard
              </Link>
            )}
            <Link href="/cart" className="text-lg font-medium transition-colors hover:opacity-80 relative px-3 py-2 rounded-lg" style={{ backgroundColor: '#4A90E2', color: 'white' }}>
              Cart
              {/* Cart count badge */}
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold" style={{ backgroundColor: '#FF6B35' }}>
                  {itemCount}
                </span>
              )}
            </Link>
            
            {/* Auth Section */}
            <div className="flex space-x-3 ml-4 items-center">
              {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium" style={{ color: '#2D3748' }}>
                    Welcome, {user.name}
                  </span>
                  {user.role === 'ADMIN' && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#F5A623', color: 'white' }}>
                      Admin
                    </span>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium transition-colors rounded-md hover:opacity-80"
                    style={{ backgroundColor: '#DC3545', color: 'white' }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Link href="/login" className="px-4 py-2 text-sm font-medium transition-colors rounded-md border hover:opacity-80" style={{ color: '#4A90E2', borderColor: '#4A90E2' }}>
                    Login
                  </Link>
                  <Link href="/register" className="px-4 py-2 text-sm font-medium transition-colors rounded-md hover:opacity-80" style={{ backgroundColor: '#28A745', color: 'white' }}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
