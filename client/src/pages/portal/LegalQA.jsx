import "regenerator-runtime/runtime";
import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FaSearch, FaSpinner, FaLandmark, FaClipboard, FaHistory, FaExclamationCircle, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import axios from 'axios';
import legalApiService from "../../services/legalApi";

const LegalQA = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recentQueries, setRecentQueries] = useState([
    "What is the punishment under IPC 420 for corporate fraud?",
    "Explain the evidence requirements for NDPS Act cases",
    "What are the bail conditions for non-bailable offenses?",
    "Recent Supreme Court rulings on cyber crimes"
  ]);
  
  const responseRef = useRef(null);

  // Speech recognition commands
  const commands = [
    {
      command: 'reset',
      callback: () => resetTranscript()
    },
    {
      command: 'search',
      callback: () => handleQuerySubmit(new Event('submit'))
    },
    {
      command: 'clear',
      callback: () => setQuery('')
    }
  ];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition({ commands });
  
  useEffect(() => {
    // Load history from API on component mount
    fetchQueryHistory();
  }, []);
  
  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript]);

  const fetchQueryHistory = async () => {
    try {
      const history = await legalApiService.getLegalQAHistory();
      setHistory(history || []);
    } catch (err) {
      console.error("Failed to fetch QA history:", err);
      setError("Unable to load query history. Please try again later.");
    }
  };
  
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // API call to your backend LegalQA endpoint
      const result = await legalApiService.submitLegalQuery(query);
      
      setResponse(result);
      
      // Refresh history after successful query
      fetchQueryHistory();
      
      // Reset transcript if using voice input
      if (isListening) {
        resetTranscript();
      }
    } catch (err) {
      console.error('Error querying legal AI:', err);
      setError('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add toast notification here
    alert("Copied to clipboard!");
  };
  
  const useRecentQuery = (q) => {
    setQuery(q);
  };

  const handleHistoryItemClick = async (historyId) => {
    try {
      setIsLoading(true);
      setError('');
      
      const queryDetails = await legalApiService.getLegalQADetails(historyId);
      setQuery(queryDetails.query);
      setResponse(queryDetails);
    } catch (err) {
      console.error("Failed to load query details:", err);
      setError("Unable to load previous query. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    }
  };

  const renderVoiceStatus = () => {
    if (!browserSupportsSpeechRecognition) {
      return (
        <div className="mt-2 text-sm text-gray-500">
          Browser doesn't support speech recognition.
        </div>
      );
    }

    if (!isMicrophoneAvailable) {
      return (
        <div className="mt-2 text-sm text-red-500">
          Please allow microphone access to use voice input.
        </div>
      );
    }

    if (isListening) {
      return (
        <div className="mt-2 flex items-center gap-2">
          <div className="animate-pulse w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-sm text-gray-700">Listening...</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaLandmark className="mr-3 text-blue-600" />
            Legal Question & Answer System
          </h1>
          <p className="text-gray-600 mt-2">
            Ask any legal question and get accurate answers with case references and relevant sections
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleQuerySubmit} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., What is the punishment under IPC 420 for corporate fraud?"
              className="w-full p-4 pl-12 pr-24 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              {browserSupportsSpeechRecognition && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  title={isListening ? "Stop voice input" : "Start voice input"}
                >
                  {isListening ? 
                    <FaMicrophoneSlash className="w-5 h-5" /> : 
                    <FaMicrophone className="w-5 h-5" />
                  }
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className={`px-3 py-2 rounded-md ${
                  isLoading || !query.trim() ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? <FaSpinner className="animate-spin" /> : 'Ask'}
              </button>
            </div>
          </div>
        </form>

        {renderVoiceStatus()}

        {isListening && transcript && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg mb-6">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Current transcript:</span> {transcript}
            </p>
          </div>
        )}

        {/* Recent Queries */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Common Legal Questions</h3>
          <div className="flex flex-wrap gap-2">
            {recentQueries.map((q, i) => (
              <button
                key={i}
                onClick={() => useRecentQuery(q)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="my-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-start gap-2">
            <FaExclamationCircle className="mt-1 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center my-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Response Section */}
        {response && !isLoading && (
          <div ref={responseRef} className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-blue-600 text-white p-4">
              <h3 className="font-medium flex items-center justify-between">
                <span>Legal Response</span>
                <button
                  onClick={() => copyToClipboard(response.answer)}
                  className="text-white hover:bg-blue-700 p-1 rounded"
                  title="Copy to clipboard"
                >
                  <FaClipboard />
                </button>
              </h3>
              <p className="text-sm text-blue-100">Query: {response.query}</p>
            </div>
            
            <div className="p-5">
              <div className="prose max-w-none">
                {response.answer.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
              
              {/* Sources Section */}
              {response.sources && response.sources.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Sources & References:</h4>
                  <ul className="space-y-2">
                    {response.sources.map((source, idx) => (
                      <li key={idx} className="text-sm bg-gray-50 p-3 rounded">
                        <div><span className="font-medium">Source:</span> {source.title}</div>
                        {source.citation && <div><span className="font-medium">Citation:</span> {source.citation}</div>}
                        {source.excerpt && (
                          <div className="mt-2 text-xs bg-white p-2 rounded border border-gray-200 italic text-gray-700">
                            "{source.excerpt}"
                          </div>
                        )}
                        {source.relevance && <div><span className="font-medium">Relevance:</span> {source.relevance}%</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-700 text-white p-4 flex items-center gap-2">
            <FaHistory className="text-gray-200" />
            <h3 className="font-medium">Recent Queries</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {history.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No query history yet. Start asking legal questions!
              </div>
            ) : (
              history.map((item, index) => (
                <div 
                  key={index} 
                  className="p-4 hover:bg-gray-50 cursor-pointer" 
                  onClick={() => handleHistoryItemClick(item._id)}
                >
                  <p className="font-medium text-gray-800">{item.query}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                    {item.sources && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {item.sources.length} sources
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalQA;