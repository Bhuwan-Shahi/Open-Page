import BookCard from './BookCard';
import Link from 'next/link';

export default function BookGrid({ books, title = "Books", showAddButton = false, user = null, onBooksChange }) {

  const handleBookUpdate = (updatedBook) => {
    if (onBooksChange) {
      onBooksChange(books.map(book =>
        book.id === updatedBook.id ? updatedBook : book
      ));
    }
  };

  const handleBookDelete = (bookId) => {
    if (onBooksChange) {
      onBooksChange(books.filter(book => book.id !== bookId));
    }
  };
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        {showAddButton && user && user.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="px-4 py-2 rounded-lg transition-colors text-sm font-semibold bg-ink text-paper hover:bg-night"
          >
            Add New Book
          </Link>
        )}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.length > 0 ? (
          books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onUpdate={handleBookUpdate}
              onDelete={handleBookDelete}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-5xl mb-4" aria-hidden="true">📚</div>
            <h3 className="font-display text-xl font-semibold text-ink mb-2">No books available yet</h3>
            <p className="text-muted mb-4">Be the first to add some books to our collection!</p>
            <Link
              href="/admin"
              className="bg-amber text-white px-6 py-3 rounded-lg hover:bg-amber-soft transition-colors font-semibold inline-block"
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
            className="bg-ink text-paper px-6 py-3 rounded-lg hover:bg-night transition-colors font-semibold inline-block"
          >
            View All Books ({books.length})
          </Link>
        </div>
      )}
    </div>
  );
}
