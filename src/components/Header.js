'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const linkCls = "px-2 py-2 rounded-md text-muted hover:text-ink transition-colors";

export default function Header() {
  const { getTotalItems, clearCart } = useCart();
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const itemCount = getTotalItems();

  const handleLogout = async () => {
    try {
      await clearCart();
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            📚 Open Book
          </Link>
          <nav className="flex items-center gap-1 sm:gap-4 text-sm">
            <Link href="/" className={`${linkCls} hidden sm:block${pathname === '/' ? ' text-ink font-semibold' : ''}`}>Home</Link>
            <Link href="/books" className={`${linkCls}${pathname === '/books' ? ' text-ink font-semibold' : ''}`}>Books</Link>
            {user && user.role === 'ADMIN' && (
              <>
                <Link href="/admin/dashboard" className={`${linkCls} hidden md:block`}>Dashboard</Link>
                <Link href="/admin/users" className={`${linkCls} hidden md:block`}>Users</Link>
                <Link href="/admin/payments" className={`${linkCls} hidden md:block`}>Payments</Link>
              </>
            )}
            {user && user.role === 'USER' && (
              <Link href="/dashboard" className={`${linkCls} hidden md:block`}>My Library</Link>
            )}

            <Link
              href="/cart"
              aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
              className="relative inline-flex items-center gap-1 px-3 py-2 rounded-lg font-semibold bg-ink text-paper hover:bg-night transition-colors"
            >
              <span aria-hidden="true">🛒</span>
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber text-white text-[11px] rounded-full h-5 min-w-5 px-1 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-2 ml-1 sm:ml-2">
              {loading ? (
                <span className="text-sm text-muted">…</span>
              ) : user ? (
                <>
                  <span className="hidden sm:inline text-sm text-muted">
                    {user.name}
                    {user.role === 'ADMIN' && (
                      <span className="ml-2 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber text-white">Admin</span>
                    )}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm font-medium rounded-md border border-line text-ink hover:bg-card transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className={`${linkCls} hidden sm:block`}>Login</Link>
                  <Link
                    href="/register"
                    className="px-3 py-2 text-sm font-semibold rounded-md bg-amber text-white hover:bg-amber-soft transition-colors"
                  >
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
