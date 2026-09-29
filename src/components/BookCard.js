'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import InteractiveButton from './InteractiveButton';
import AdminBookActions from './AdminBookActions';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function BookCard({ book, onUpdate, onDelete }) {
  const { addToCart, isLoading } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Redirect to login if user is not authenticated
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    await addToCart(book);
  };

  const handleBookUpdate = (updatedBook) => {
    onUpdate && onUpdate(updatedBook);
  };

  const handleBookDelete = (bookId) => {
    onDelete && onDelete(bookId);
  };

  return (
    <div className="border border-line rounded-xl shadow-sm hover:shadow-md transition-shadow bg-card overflow-hidden">
      <div className="p-4">
        {/* Book Cover Placeholder */}
        <div className="w-full h-48 bg-paper border border-line rounded-lg mb-4 flex items-center justify-center overflow-hidden">
          {book.coverImage ? (
            <Image
              src={book.coverImage}
              alt={book.title}
              width={192}
              height={192}
              className="object-cover rounded-lg"
            />
          ) : (
            <div className="font-display text-4xl text-amber" aria-hidden="true">📖</div>
          )}
        </div>
        
        {/* Book Info */}
        <h3 className="font-display font-bold text-lg leading-snug mb-1 text-ink">
          {book.title}
        </h3>
        <p className="text-sm mb-2 text-muted">by {book.author}</p>
        <p className="text-sm mb-3 line-clamp-2 text-muted">
          {book.description || 'No description available'}
        </p>
        
        {/* Price and Actions */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-xl font-bold text-ink">
            Rs. {book.price}
          </span>
        </div>
        <div className="flex gap-2">
          <InteractiveButton href={`/books/${book.id}`} variant="secondary" size="sm" className="flex-1 text-center">
            View
          </InteractiveButton>
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-colors bg-leaf text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : user ? 'Add to Cart' : 'Login to Buy'}
          </button>
        </div>

        {/* Admin Actions */}
        <AdminBookActions 
          book={book} 
          onUpdate={handleBookUpdate}
          onDelete={handleBookDelete}
        />
      </div>
    </div>
  );
}
