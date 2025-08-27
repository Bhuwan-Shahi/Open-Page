'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    category: '',
    isbn: '',
    pages: '',
    language: 'English',
    pdfUrl: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [uploadMethod, setUploadMethod] = useState('url') // 'url' or 'file'
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  // Don't render admin panel if user is not admin
  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      let finalPdfUrl = formData.pdfUrl;

      // If uploading a file, upload it first
      if (uploadMethod === 'file' && pdfFile) {
        setIsUploading(true);
        
        const uploadFormData = new FormData();
        uploadFormData.append('file', pdfFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadData = await uploadResponse.json();

        if (uploadResponse.ok) {
          finalPdfUrl = uploadData.fileUrl;
        } else {
          setMessage(`Upload Error: ${uploadData.error}`);
          return;
        }
        
        setIsUploading(false);
      }

      // Validate that we have a PDF URL (either from upload or manual entry)
      if (!finalPdfUrl) {
        setMessage('Please provide a PDF URL or upload a PDF file');
        return;
      }

      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          pdfUrl: finalPdfUrl
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Book added successfully!')
        setFormData({
          title: '',
          author: '',
          description: '',
          price: '',
          category: '',
          isbn: '',
          pages: '',
          language: 'English',
          pdfUrl: ''
        })
        setPdfFile(null)
        setUploadMethod('url')
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Error: Failed to add book')
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  return (
    <Layout className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 relative">
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
            <LoadingSpinner size="large" text="Adding book to collection..." />
          </div>
        )}
        
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#2D3748' }}>Add New Book</h1>
        
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes('Error') 
              ? 'text-red-700 border' 
              : 'text-green-700 border'
          }`} style={{
            backgroundColor: message.includes('Error') ? '#FEF2F2' : '#F0FDF4',
            borderColor: message.includes('Error') ? '#F87171' : '#A8B5A2'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1" style={{ color: '#2D3748' }}>
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Author *
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (Rs.) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Fiction, Science, Business"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
                ISBN
              </label>
                            <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="978-3-16-148410-0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="pages" className="block text-sm font-medium text-gray-700 mb-1">
                Pages
              </label>
                            <input
                type="number"
                id="pages"
                name="pages"
                value={formData.pages}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              PDF Source *
            </label>
            
            {/* Upload Method Toggle */}
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="url"
                  checked={uploadMethod === 'url'}
                  onChange={(e) => setUploadMethod(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Use URL</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="file"
                  checked={uploadMethod === 'file'}
                  onChange={(e) => setUploadMethod(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Upload File</span>
              </label>
            </div>

            {/* URL Input */}
            {uploadMethod === 'url' && (
              <div>
                <input
                  type="url"
                  id="pdfUrl"
                  name="pdfUrl"
                  value={formData.pdfUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/book.pdf"
                  required={uploadMethod === 'url'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the URL of the PDF file from the web.
                </p>
              </div>
            )}

            {/* File Upload */}
            {uploadMethod === 'file' && (
              <div>
                <input
                  type="file"
                  id="pdfFile"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  required={uploadMethod === 'file'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Select a PDF file from your computer (max 10MB). Example: /home/bhuwan/downloads/thinking.pdf
                </p>
                {pdfFile && (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90"
              style={{ 
                backgroundColor: '#95BF47',
                focusRingColor: '#95BF47'
              }}
            >
              {isUploading ? 'Uploading PDF...' : (isSubmitting ? 'Adding Book...' : 'Add Book')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
