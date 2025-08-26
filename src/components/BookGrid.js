import BookCard from './BookCard';
import Link from 'next/link';

export default function BookGrid({ books, title = "Books", showAddButton = false }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: '#2D3748' }}>{title}</h2>
        {showAddButton && (
          <Link 
            href="/admin"
            className="px-4 py-2 rounded-lg transition-colors text-white"
            style={{ backgroundColor: '#6B728E' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#5A616F'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#6B728E'}
          >
            Add New Book
          </Link>
        )}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.length > 0 ? (
          books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No books available yet</h3>
            <p className="text-gray-500 mb-4">Be the first to add some books to our collection!</p>
            <Link 
              href="/admin"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Add Your First Book
            </Link>
          </div>
        )}
      </div>

      {/* Show more button if there are many books */}
      {books.length > 8 && (
        <div className="text-center mt-8">
          <Link 
            href="/books"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            View All Books ({books.length})
          </Link>
        </div>
      )}
    </div>
  );
}
