'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import InteractiveButton from '@/components/InteractiveButton';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function CartPage() {
  const { cartItems, isLoading, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/cart');
    }
  }, [user, authLoading, router]);

  const buyNow = async (book) => {
    if (!user) {
      alert('Please login to purchase books');
      return;
    }

    try {
      setIsCheckingOut(book.id);
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: book.id,
          quantity: 1
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Remove item from cart after successful order creation
        removeFromCart(book.id);
        // Redirect to payment page
        router.push(`/payment/${data.order.id}`);
      } else {
        alert('Failed to create order. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('An error occurred during purchase. Please try again.');
    } finally {
      setIsCheckingOut(null);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  // Don't render cart if user is not authenticated
  if (!user) {
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4 text-muted" aria-hidden="true">🛒</div>
          <h2 className="font-display text-3xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="mb-6 text-muted">Add some books to get started!</p>
          <InteractiveButton href="/books" variant="primary">
            Browse Books
          </InteractiveButton>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Loading overlay for cart operations */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg">
            <LoadingSpinner size="large" text="Updating cart..." />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            Shopping Cart
          </h1>
          <button
            onClick={clearCart}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="border border-line rounded-xl p-4 bg-card shadow-sm">
                <div className="flex items-center gap-4">
                  {/* Book Cover */}
                  <div className="w-16 h-20 bg-paper border border-line rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        width={64}
                        height={80}
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="font-display text-2xl text-amber" aria-hidden="true">📖</div>
                    )}
                  </div>

                  {/* Book Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-ink truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted">by {item.author}</p>
                    <p className="font-display font-bold text-ink">
                      Rs. {item.price}
                    </p>
                    <p className="text-xs mt-1 text-muted/80">PDF Download</p>
                  </div>

                  {/* Buy Now Button */}
                  <button
                    onClick={() => buyNow(item)}
                    disabled={isLoading || isCheckingOut !== null}
                    className="px-4 py-2 rounded-lg font-semibold transition-colors bg-amber text-white hover:bg-amber-soft disabled:opacity-50"
                  >
                    {isCheckingOut === item.id ? 'Processing…' : 'Buy Now'}
                  </button>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    disabled={isLoading}
                    aria-label={`Remove ${item.title} from cart`}
                    className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="border border-line rounded-xl p-6 bg-card shadow-sm sticky top-24">
              <h3 className="font-display text-lg font-semibold mb-4">
                Cart Summary
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted">Items in cart:</span>
                  <span className="text-ink">{cartItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Total value:</span>
                  <span className="font-display font-bold text-amber">Rs. {getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/books')}
                className="w-full py-3 px-4 rounded-lg font-semibold transition-colors border border-line text-ink hover:bg-paper"
              >
                Continue Shopping
              </button>

              <div className="mt-4 p-4 rounded-lg bg-paper border border-line">
                <h4 className="font-semibold mb-2 text-amber">💡 Quick Purchase</h4>
                <p className="text-sm text-ink/80">
                  Click "Buy Now" on any book to purchase it individually with our secure QR payment system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
