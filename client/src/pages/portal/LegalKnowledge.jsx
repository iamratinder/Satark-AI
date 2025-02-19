import "regenerator-runtime/runtime";
import React, { useState, useEffect } from "react";
import { Search, BookOpen, Clock, FileText, AlertCircle, Mic, MicOff } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import legalApiService from "../../services/legalApi";

const LegalKnowledge = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);

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

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript]);

  const fetchSearchHistory = async () => {
    try {
      const history = await legalApiService.getSearchHistory();
      setSearchHistory(history || []);
    } catch (error) {
      console.error("Failed to fetch search history:", error);
      setError("Unable to load search history. Please try again later.");
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await legalApiService.searchLegalKnowledge(query);
      setResults(data);
      
      // Update search history after successful search
      fetchSearchHistory();
    } catch (error) {
      console.error("Search failed:", error);
      setError("Failed to retrieve legal knowledge. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryItemClick = async (historyId) => {
    try {
      setIsLoading(true);
      setError(null);
      
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
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Legal Knowledge Retrieval
          </h2>
          <p className="text-gray-600 mt-2">
            Search for the latest legal information, amendments, case precedents,
            and legal interpretations.
          </p>
        </div>

        <div className="p-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What are the latest updates in cybercrime laws?"
              className="w-full p-4 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              {browserSupportsSpeechRecognition && (
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
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
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {renderVoiceStatus()}

          {isListening && transcript && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Current transcript:</span> {transcript}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center my-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {results && !isLoading && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Search Results</h3>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h4 className="font-medium text-blue-700">Summary</h4>
                  <p className="mt-2">{results.summary}</p>
                </div>

                {results.relevantLaws && results.relevantLaws.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <h4 className="font-medium text-blue-700">Relevant Laws</h4>
                    <ul className="mt-2 space-y-2">
                      {results.relevantLaws.map((law, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <FileText className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{law.title}</p>
                            <p className="text-sm text-gray-600">{law.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.casePrecedents && results.casePrecedents.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <h4 className="font-medium text-blue-700">Case Precedents</h4>
                    <ul className="mt-2 space-y-2">
                      {results.casePrecedents.map((precedent, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <FileText className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{precedent.title}</p>
                            <p className="text-sm text-gray-600">{precedent.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {precedent.court} • {precedent.date}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.references && results.references.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-700">References</h4>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      {results.references.map((ref, index) => (
                        <li key={index}>
                          {index + 1}. {ref}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Search History
          </h2>
        </div>

        <div className="p-6">
          {searchHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No search history yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {searchHistory.map((item) => (
                <li
                  key={item._id}
                  className="py-4 hover:bg-gray-50 cursor-pointer transition-colors px-2 rounded"
                  onClick={() => handleHistoryItemClick(item._id)}
                >
                  <div className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">{item.query}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
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