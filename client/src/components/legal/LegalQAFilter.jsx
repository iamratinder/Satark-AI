import React from 'react';
import { FaFilter } from 'react-icons/fa';

export const LegalQAFilter = ({ filters, setFilters }) => {
  const categories = [
    { id: 'criminal', label: 'Criminal Law' },
    { id: 'civil', label: 'Civil Law' },
    { id: 'corporate', label: 'Corporate Law' },
    { id: 'family', label: 'Family Law' },
    { id: 'cyber', label: 'Cyber Law' }
  ];
  
  const sources = [
    { id: 'supreme_court', label: 'Supreme Court' },
    { id: 'high_court', label: 'High Courts' },
    { id: 'statutes', label: 'Statutes & Acts' },
    { id: 'academic', label: 'Academic Articles' }
  ];
  
  const handleCategoryChange = (catId) => {
    setFilters({
      ...filters,
      categories: filters.categories.includes(catId)
        ? filters.categories.filter(id => id !== catId)
        : [...filters.categories, catId]
    });
  };
  
  const handleSourceChange = (sourceId) => {
    setFilters({
      ...filters,
      sources: filters.sources.includes(sourceId)
        ? filters.sources.filter(id => id !== sourceId)
        : [...filters.sources, sourceId]
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="font-medium text-gray-700 flex items-center mb-3">
        <FaFilter className="mr-2 text-blue-600" /> Refine Search
      </h3>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Legal Categories</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-3 py-1 text-xs rounded-full transition ${
                filters.categories.includes(category.id)
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">Source Types</h4>
        <div className="flex flex-wrap gap-2">
          {sources.map(source => (
            <button
              key={source.id}
              onClick={() => handleSourceChange(source.id)}
              className={`px-3 py-1 text-xs rounded-full transition ${
                filters.sources.includes(source.id)
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {source.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
