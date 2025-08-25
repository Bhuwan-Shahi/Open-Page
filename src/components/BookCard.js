import Image from "next/image";
import Link from "next/link";

export default function BookCard({ book }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {book.coverImage ? (
          <Image
            src={book.coverImage}
            alt={book.title}
            width={200}
            height={200}
            className="object-cover h-full w-full"
          />
        ) : (
          <div className="text-gray-400 text-4xl">📖</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-900 truncate" title={book.title}>
          {book.title}
        </h3>
        <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
        {book.category && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
            {book.category}
          </span>
        )}
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
          {book.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-green-600">
            ${book.price}
          </span>
          <div className="flex gap-2">
            <Link 
              href={`/books/${book.id}`}
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
            >
              View Details
            </Link>
            <button className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors text-sm">
              Add to Cart
            </button>
          </div>
        </div>
        {book.pages && (
          <div className="mt-2 text-xs text-gray-500">
            {book.pages} pages • {book.language}
          </div>
        )}
      </div>
    </div>
  );
}
