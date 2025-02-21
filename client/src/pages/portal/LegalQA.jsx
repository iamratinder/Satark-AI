import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { 
  FaSearch, 
  FaSpinner, 
  FaLandmark, 
  FaClipboard, 
  FaHistory, 
  FaExclamationCircle, 
  FaMicrophone, 
  FaMicrophoneSlash 
} from 'react-icons/fa';
import legalApiService from "../../services/legalApi";

const LegalQA = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recentQueries] = useState([
    "What is the punishment under IPC 420 for corporate fraud?",
    "Explain the evidence requirements for NDPS Act cases",
    "What are the bail conditions for non-bailable offenses?",
    "Recent Supreme Court rulings on cyber crimes"
  ]);
  
  const responseRef = useRef(null);
  const queryInputRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition({
    commands: [
      {
        command: 'reset',
        callback: () => resetTranscript()
      },
      {
        command: 'search',
        callback: () => handleQuerySubmit()
      },
      {
        command: 'clear',
        callback: () => setQuery('')
      }
    ]
  });

  useEffect(() => {
    fetchQueryHistory();
    
    // Focus the input field on component mount
    if (queryInputRef.current) {
      queryInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    // Scroll to response when it changes
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response]);

  useEffect(() => {
    // Reset copy status after 2 seconds
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

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
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError('');
  
    try {
      const result = await legalApiService.submitLegalQuery(query);
      setResponse({
        answer: result.answer,
        sources: result.sources,
        confidence: result.confidence
      });
    } catch (err) {
      console.error('Error querying legal AI:', err);
      setError(err.message || 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Unable to copy to clipboard');
    }
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
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleSuggestedQueryClick = (suggestedQuery) => {
    setQuery(suggestedQuery);
    if (queryInputRef.current) {
      queryInputRef.current.focus();
    }
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

        <form onSubmit={handleQuerySubmit} className="mb-6">
          <div className="relative">
            <input
              ref={queryInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., What is the punishment under IPC 420 for corporate fraud?"
              className="w-full p-4 pl-12 pr-24 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              {browserSupportsSpeechRecognition && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <FaMicrophoneSlash className="w-5 h-5" /> : <FaMicrophone className="w-5 h-5" />}
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className={`px-4 py-2 rounded-lg ${
                  isLoading || !query.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? <FaSpinner className="animate-spin" /> : 'Ask'}
              </button>
            </div>
          </div>
        </form>

        {/* Suggested Queries */}
        {!response && !isLoading && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Try these sample queries:</h3>
            <div className="flex flex-wrap gap-2">
              {recentQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedQueryClick(q)}
                  className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isListening && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="mr-3 relative">
                <div className="absolute inset-0 bg-blue-200 rounded-full opacity-75 animate-ping"></div>
                <FaMicrophone className="relative text-blue-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-blue-700 font-medium">Listening...</p>
                <p className="text-sm text-blue-600">
                  {transcript ? "${transcript}" : "Speak your legal question"}
                </p>
              </div>
            </div>
          </div>
        )}

        {response && !isLoading && (
          <div ref={responseRef} className="bg-white rounded-lg shadow-md overflow-hidden mb-8 transition-all">
            <div className="bg-blue-600 text-white p-4">
              <h3 className="font-medium flex items-center justify-between">
                <span>Legal Response</span>
                <button
                  onClick={() => copyToClipboard(response.answer)}
                  className="text-white hover:bg-blue-700 p-2 rounded flex items-center gap-1"
                  title="Copy to clipboard"
                >
                  <FaClipboard className="w-4 h-4" />
                  {copied && <span className="text-xs">Copied!</span>}
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
              
              {response.sources?.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Sources & References:</h4>
                  <ul className="space-y-2">
                    {response.sources.map((source, idx) => (
                      <li key={idx} className="text-sm bg-gray-50 p-3 rounded">
                        <div><span className="font-medium">Source:</span> {source.title}</div>
                        {source.citation && (
                          <div><span className="font-medium">Citation:</span> {source.citation}</div>
                        )}
                        {source.excerpt && (
                          <div className="mt-2 text-xs bg-white p-2 rounded border border-gray-200 italic">
                            "{source.excerpt}"
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-700 text-white p-4 flex items-center gap-2">
            <FaHistory className="w-4 h-4" />
            <h3 className="font-medium">Query History</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No query history yet. Start asking legal questions!
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item._id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors" 
                  onClick={() => handleHistoryItemClick(item._id)}
                >
                  <p className="font-medium text-gray-800">{item.query}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                    {item.sources?.length > 0 && (
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