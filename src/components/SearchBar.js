'use client'

import { useState } from 'react';

export default function SearchBar({ onSearch, onCategoryFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    'All Categories',
    'Classic Literature',
    'Science Fiction',
    'Business',
    'Technology',
    'Fiction',
    'Non-Fiction',
    'Self-Help',
    'History',
    'Science'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (onCategoryFilter) {
      onCategoryFilter(category === 'All Categories' ? '' : category);
    }
  };

  return (
    <div className="bg-card border border-line rounded-xl shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for books..."
              aria-label="Search books"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-line rounded-lg bg-paper text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-amber transition-colors"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted" aria-hidden="true">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </form>

        {/* Category Filter */}
        <div className="md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            aria-label="Filter by category"
            className="w-full px-4 py-3 border border-line rounded-lg bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-amber transition-colors"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          onClick={handleSearch}
          className="px-6 py-3 rounded-lg font-semibold transition-colors bg-amber text-white hover:bg-amber-soft"
        >
          Search
        </button>
      </div>
    </div>
  );
}
