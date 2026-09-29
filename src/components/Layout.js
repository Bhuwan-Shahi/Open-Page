import Header from './Header';
import Link from 'next/link';

export default function Layout({ children, className = "" }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        {children}
      </main>
      <footer className="border-t border-line mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display text-xl font-bold mb-3">📚 Open Book</h3>
              <p className="text-sm text-muted">
                Your digital library. Discover, purchase, and download books instantly.
              </p>
            </div>
            <div>
              <h4 className="font-display text-lg font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-muted hover:text-ink transition-colors">Home</Link></li>
                <li><Link href="/books" className="text-muted hover:text-ink transition-colors">All Books</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-lg font-semibold mb-3">Categories</h4>
              <ul className="space-y-2 text-sm">
                {['Fiction', 'Science', 'Business', 'Technology'].map((c) => (
                  <li key={c}>
                    <Link href={`/books?category=${c.toLowerCase()}`} className="text-muted hover:text-ink transition-colors">{c}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-line mt-8 pt-6 text-center text-sm text-muted">
            <p>&copy; 2025 Open Book. Built with Next.js and PostgreSQL.</p>
          </div>
          {/* ponytail: footer category links don't filter yet — /books ignores ?category=; wire it when it matters */}
        </div>
      </footer>
    </div>
  );
}
