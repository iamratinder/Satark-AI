import "regenerator-runtime/runtime";
import React, { useState, useEffect, useCallback } from "react";
import { Search, BookOpen, Clock, FileText, AlertCircle, Mic, MicOff, ChevronRight, Trash2 } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import legalApiService from "../../services/legalApi";

const TypeWriter = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed]);

  return (
    <div className="relative">
      <p className="whitespace-pre-wrap">{displayedText}</p>
      {!isComplete && (
        <span className="inline-block w-0.5 h-5 bg-blue-500 ml-1 animate-pulse" />
      )}
    </div>
  );
};

const LegalKnowledge = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [useTypewriter, setUseTypewriter] = useState(true);

  const commands = [
    {
      command: 'reset',
      callback: () => resetTranscript()
    },
    {
      command: 'search',
      callback: () => handleSearch()
    }
  ];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition({ commands });

  const fetchSearchHistory = useCallback(async () => {
    try {
      const history = await legalApiService.getSearchHistory();
      setSearchHistory(history || []);
    } catch (error) {
      console.error("Failed to fetch search history:", error);
      setError("Unable to load search history. Please try again later.");
    }
  }, []);

  useEffect(() => {
    fetchSearchHistory();
  }, [fetchSearchHistory]);

  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);
    setUseTypewriter(true);
    
    try {
      const data = await legalApiService.searchLegalKnowledge(query);
      setResults(data);
      fetchSearchHistory();
    } catch (error) {
      console.error("Search failed:", error);
      setError("Failed to retrieve legal knowledge. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    try {
      const history = await legalApiService.getSearchHistory();
      const updatedHistory = history.filter(item => item._id !== id);
      localStorage.setItem('legalSearchHistory', JSON.stringify(updatedHistory));
      fetchSearchHistory();
    } catch (error) {
      console.error("Failed to delete history item:", error);
      setError("Unable to delete history item. Please try again later.");
    }
  };

  const handleHistoryItemClick = async (historyId) => {
    try {
      setIsLoading(true);
      setError(null);
      setResults(null);
      setUseTypewriter(false);
      
      const searchData = await legalApiService.getSearchDetails(historyId);
      setQuery(searchData.query);
      setResults(searchData.results);
    } catch (error) {
      console.error("Failed to load search details:", error);
      setError("Unable to load previous search. Please try again.");
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
        <div className="mt-2 text-sm text-red-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
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

  const renderResults = () => {
    if (!results) return null;

    const ResultContent = ({ children }) => (
      <div className="mt-8 animate-fade-in">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <ChevronRight className="w-5 h-5 text-blue-600" />
          Search Results
        </h3>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
          {children}
        </div>
      </div>
    );

    return (
      <ResultContent>
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h4 className="font-medium text-blue-700 mb-3">Summary</h4>
          <div className="mt-2 text-gray-700">
            {useTypewriter ? (
              <TypeWriter text={results.summary} speed={30} />
            ) : (
              <p className="whitespace-pre-wrap">{results.summary}</p>
            )}
          </div>
        </div>

        {results.relevantLaws?.length > 0 && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h4 className="font-medium text-blue-700 mb-3">Relevant Laws</h4>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {results.relevantLaws.map((law, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{law.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{law.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.casePrecedents?.length > 0 && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h4 className="font-medium text-blue-700 mb-3">Case Precedents</h4>
            <div className="space-y-4">
              {results.casePrecedents.map((precedent, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{precedent.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{precedent.description}</p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                        <span className="font-medium">{precedent.court}</span>
                        <span>•</span>
                        <span>{precedent.date}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.references?.length > 0 && (
          <div>
            <h4 className="font-medium text-blue-700 mb-3">References</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {results.references.map((ref, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 font-medium">{index + 1}.</span>
                  <span>{ref}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ResultContent>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-blue-800">
            <BookOpen className="w-7 h-7 text-blue-600" />
            Legal Knowledge Retrieval
          </h2>
          <p className="text-gray-600 mt-2 ml-9">
            Search for the latest legal information, amendments, case precedents,
            and legal interpretations.
          </p>
        </div>

        <div className="p-6">
          <div className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What are the latest updates in cybercrime laws?"
              className="w-full p-4 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all group-hover:shadow-md"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              {browserSupportsSpeechRecognition && (
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-lg transition-all ${
                    isListening 
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-md' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  title={isListening ? "Stop voice input" : "Start voice input"}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {renderVoiceStatus()}

          {isListening && transcript && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Current transcript:</span> {transcript}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center my-8 space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-gray-600">Searching legal knowledge base...</p>
            </div>
          )}

          {renderResults()}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Search History
          </h2>
        </div>

        <div className="p-6">
          {searchHistory.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No search history yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {searchHistory.map((item) => (
                 <li
                 key={item._id}
                 className="py-4 px-4 hover:bg-blue-50 cursor-pointer transition-all rounded-lg group"
               >
                 <div className="flex items-start justify-between gap-3">
                   <div 
                     className="flex items-start gap-3 flex-grow"
                     onClick={() => handleHistoryItemClick(item._id)}
                   >
                     <Search className="w-5 h-5 text-gray-400 mt-0.5 group-hover:text-blue-500 transition-colors" />
                     <div>
                       <p className="font-medium group-hover:text-blue-700 transition-colors">{item.query}</p>
                       <p className="text-sm text-gray-500">
                         {new Date(item.timestamp).toLocaleString()}
                       </p>
                     </div>
                   </div>
                   <button
                     onClick={(e) => handleDeleteHistory(item._id, e)}
                     className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                     title="Delete from history"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </li>
             ))}
           </ul>
         )}
       </div>
     </div>
   </div>
 );
};

export default LegalKnowledge;