'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import InteractiveButton from './InteractiveButton';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function BookCard({ book }) {
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

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="p-4">
        {/* Book Cover Placeholder */}
        <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
          {book.coverImage ? (
            <Image
              src={book.coverImage}
              alt={book.title}
              width={192}
              height={192}
              className="object-cover rounded-lg"
            />
          ) : (
            <div className="text-gray-400 text-4xl">📖</div>
          )}
        </div>
        
        {/* Book Info */}
        <h3 className="font-semibold text-lg mb-2" style={{ color: '#2D3748' }}>
          {book.title}
        </h3>
        <p className="mb-2" style={{ color: '#6B728E' }}>by {book.author}</p>
        <p className="text-sm mb-3 line-clamp-2" style={{ color: '#6B728E' }}>
          {book.description || 'No description available'}
        </p>
        
        {/* Price and Actions */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold" style={{ color: '#F5A623' }}>
            ${book.price}
          </span>
        </div>
        <div className="flex gap-2">
          <InteractiveButton href={`/books/${book.id}`} variant="secondary" size="sm" className="flex-1">
            View
          </InteractiveButton>
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            style={{ 
              backgroundColor: '#28A745', 
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#218838')}
            onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#28A745')}
          >
            {isLoading ? 'Adding...' : user ? 'Add to Cart' : 'Login to Buy'}
          </button>
        </div>
      </div>
    </div>
  );
}
