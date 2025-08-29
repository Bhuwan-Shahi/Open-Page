import Header from './Header';

export default function Layout({ children, className = "" }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E8F4FD' }}>
      <Header />
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        {children}
      </main>
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#2D3748' }}>📚 BookStore</h3>
              <p style={{ color: '#6B728E' }}>
                Your digital library for amazing books in PDF format. 
                Discover, purchase, and download books instantly.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4" style={{ color: '#2D3748' }}>Quick Links</h4>
              <ul className="space-y-2" style={{ color: '#6B728E' }}>
                <li><a href="/" className="transition-colors" style={{ color: '#6B728E' }} onMouseEnter={(e) => e.target.style.color = '#2D3748'} onMouseLeave={(e) => e.target.style.color = '#6B728E'}>Home</a></li>
                <li><a href="/books" className="transition-colors" style={{ color: '#6B728E' }} onMouseEnter={(e) => e.target.style.color = '#2D3748'} onMouseLeave={(e) => e.target.style.color = '#6B728E'}>All Books</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4" style={{ color: '#2D3748' }}>Categories</h4>
              <ul className="space-y-2" style={{ color: '#6B728E' }}>
                <li><a href="/books?category=fiction" className="transition-colors" style={{ color: '#6B728E' }} onMouseEnter={(e) => e.target.style.color = '#2D3748'} onMouseLeave={(e) => e.target.style.color = '#6B728E'}>Fiction</a></li>
                <li><a href="/books?category=science" className="transition-colors" style={{ color: '#6B728E' }} onMouseEnter={(e) => e.target.style.color = '#2D3748'} onMouseLeave={(e) => e.target.style.color = '#6B728E'}>Science</a></li>
                <li><a href="/books?category=business" className="transition-colors" style={{ color: '#6B728E' }} onMouseEnter={(e) => e.target.style.color = '#2D3748'} onMouseLeave={(e) => e.target.style.color = '#6B728E'}>Business</a></li>
                <li><a href="/books?category=technology" className="transition-colors" style={{ color: '#6B728E' }} onMouseEnter={(e) => e.target.style.color = '#2D3748'} onMouseLeave={(e) => e.target.style.color = '#6B728E'}>Technology</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center" style={{ color: '#6B728E', borderColor: '#D1D5DB' }}>
            <p>&copy; 2025 BookStore. Built with Next.js and PostgreSQL.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
