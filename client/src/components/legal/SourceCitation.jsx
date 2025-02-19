import React from 'react';
import { FaBook, FaExternalLinkAlt } from 'react-icons/fa';

export const SourceCitation = ({ source }) => {
  return (
    <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-3">
      <div className="flex items-start">
        <div className="text-blue-600 mr-3 mt-1">
          <FaBook />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{source.title}</h4>
          {source.citation && (
            <p className="text-sm text-gray-600 mt-1">{source.citation}</p>
          )}
          {source.excerpt && (
            <div className="mt-2 text-sm bg-white p-2 rounded border border-gray-200 italic text-gray-700">
              "{source.excerpt}"
            </div>
          )}
          {source.url && (
            <a 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 text-sm text-blue-600 hover:underline flex items-center"
            >
              View Source <FaExternalLinkAlt className="ml-1 text-xs" />
            </a>
          )}
          {source.relevance && (
            <div className="mt-2 flex items-center">
              <span className="text-xs text-gray-500 mr-2">Relevance:</span>
              <div className="w-24 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-blue-600 rounded-full" 
                  style={{ width: `${source.relevance}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 ml-2">{source.relevance}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// components/legal/QueryHistory.jsx
import React from 'react';
import { FaHistory, FaTrash } from 'react-icons/fa';

export const QueryHistory = ({ history, onSelectQuery, onClearHistory }) => {
  if (!history || history.length === 0) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-700 text-white p-4 flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <FaHistory className="mr-2" /> 
          Query History
        </h3>
        <button 
          onClick={onClearHistory}
          className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded flex items-center"
        >
          <FaTrash className="mr-1" /> Clear
        </button>
      </div>
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {history.map((item, index) => (
          <div 
            key={index} 
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors" 
            onClick={() => onSelectQuery(item.query)}
          >
            <p className="font-medium text-gray-800">{item.query}</p>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                {new Date(item.timestamp).toLocaleString()}
              </p>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                {item.sources?.length || 0} sources
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};