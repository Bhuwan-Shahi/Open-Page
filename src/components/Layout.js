import Header from './Header';

export default function Layout({ children, className = "" }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        {children}
      </main>
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 BookStore</h3>
              <p className="text-gray-600">
                Your digital library for amazing books in PDF format. 
                Discover, purchase, and download books instantly.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="/" className="hover:text-gray-900">Home</a></li>
                <li><a href="/books" className="hover:text-gray-900">All Books</a></li>
                <li><a href="/admin" className="hover:text-gray-900">Admin Panel</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="/books?category=fiction" className="hover:text-gray-900">Fiction</a></li>
                <li><a href="/books?category=science" className="hover:text-gray-900">Science</a></li>
                <li><a href="/books?category=business" className="hover:text-gray-900">Business</a></li>
                <li><a href="/books?category=technology" className="hover:text-gray-900">Technology</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2025 BookStore. Built with Next.js and PostgreSQL.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
