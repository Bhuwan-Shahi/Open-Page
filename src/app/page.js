import Layout from '@/components/Layout';
import BookGrid from '@/components/BookGrid';
import Link from "next/link";

async function getBooks() {
  try {
    // In development, we need to use the full URL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:3000';
    
    const res = await fetch(`${baseUrl}/api/books`, {
      cache: 'no-store' // Always fetch fresh data
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch books');
    }
    
    const data = await res.json();
    return data.books || [];
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

export default async function Home() {
  const books = await getBooks();
  const featuredBooks = books.slice(0, 4); // Show only first 4 books on homepage

  return (
    <Layout>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Our Digital Bookstore
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover and purchase amazing books in PDF format. 
          Download instantly after purchase and build your digital library.
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Link 
            href="/books"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            Browse All Books
          </Link>
          <Link 
            href="/admin"
            className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors text-lg font-semibold"
          >
            Admin Panel
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{books.length}</div>
          <div className="text-gray-600">Books Available</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">PDF</div>
          <div className="text-gray-600">Digital Format</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
          <div className="text-gray-600">Instant Downloads</div>
        </div>
      </div>

      {/* Featured Books */}
      <BookGrid 
        books={featuredBooks} 
        title="Featured Books" 
        showAddButton={true} 
      />

      {/* Call to Action */}
      {books.length > 4 && (
        <div className="text-center mt-12 bg-blue-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Explore Our Complete Collection
          </h3>
          <p className="text-gray-600 mb-6">
            We have {books.length} books waiting for you to discover!
          </p>
          <Link 
            href="/books"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            View All Books
          </Link>
        </div>
      )}
    </Layout>
  );
}
