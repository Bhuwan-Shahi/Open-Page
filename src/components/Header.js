import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              📚 Open Book 
            </Link>
          </div>
          <nav className="flex space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/books" className="text-gray-600 hover:text-gray-900 transition-colors">
              All Books
            </Link>
            <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
              Admin
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-gray-900 transition-colors relative">
              Cart
              {/* Cart count badge - we'll implement this later */}
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
