import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminBookActions({ book, onUpdate, onDelete }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    price: book.price,
    description: book.description || '',
    category: book.category || ''
  });
  const [loading, setLoading] = useState(false);

  // Don't show admin actions for non-admin users
  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        onUpdate && onUpdate(data.book);
        setIsEditing(false);
        alert('Book updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Failed to update book');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete && onDelete(book.id);
        alert('Book deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book');
    } finally {
      setLoading(false);
      setIsDeleting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4" style={{ backgroundColor: '#f9fafb' }}>
      <h4 className="text-sm font-semibold mb-3" style={{ color: '#374151' }}>Admin Actions</h4>
      
      {!isEditing ? (
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => setIsDeleting(true)}
            className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-800 transition-colors"
            disabled={loading}
          >
            🗑️ Delete
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>Author</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>Price (NPR)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              placeholder="e.g., Fiction, Science, Technology"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              placeholder="Brief description of the book"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 bg-green-700 text-white text-sm rounded hover:bg-green-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : '✓ Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  title: book.title,
                  author: book.author,
                  price: book.price,
                  description: book.description || '',
                  category: book.category || ''
                });
              }}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Delete Confirmation */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Delete Book</h3>
            <p className="mb-6" style={{ color: '#374151' }}>
              Are you sure you want to delete <strong>"{book.title}"</strong>?
              <br />
              <span className="text-sm text-red-500">This action cannot be undone.</span>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setIsDeleting(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
