import "regenerator-runtime/runtime";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  Clock,
  FileText,
  AlertCircle,
  Mic,
  MicOff,
  ChevronRight,
  Trash2,
  Scale,
} from "lucide-react";
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
      <p className="whitespace-pre-wrap text-indigo-200">{displayedText}</p>
      {!isComplete && (
        <motion.span
          className="inline-block w-0.5 h-5 bg-cyan-400 ml-1"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
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
    { command: 'reset', callback: () => resetTranscript() },
    { command: 'search', callback: () => handleSearch() }
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
    if (transcript) setQuery(transcript);
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-gray-400"
        >
          Browser doesn't support speech recognition.
        </motion.div>
      );
    }

    if (!isMicrophoneAvailable) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-red-400 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          Please allow microphone access to use voice input.
        </motion.div>
      );
    }

    if (isListening) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 flex items-center gap-2"
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          <span className="text-sm text-indigo-300">Listening...</span>
        </motion.div>
      );
    }

    return null;
  };

  const renderResults = () => {
    if (!results) return null;

    const ResultContent = ({ children }) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8"
      >
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-cyan-400">
          <ChevronRight className="w-5 h-5" />
          Legal Insights
        </h3>
        <div className="bg-gradient-to-br from-gray-800 to-indigo-900 p-6 rounded-xl border border-indigo-700/50 shadow-lg hover:shadow-xl transition-shadow">
          {children}
        </div>
      </motion.div>
    );

    return (
      <ResultContent>
        <div className="mb-6 pb-6 border-b border-indigo-700/30">
          <h4 className="font-medium text-cyan-400 mb-3">Summary</h4>
          <div className="mt-2 text-indigo-200">
            {useTypewriter ? (
              <TypeWriter text={results.summary} speed={30} />
            ) : (
              <p className="whitespace-pre-wrap">{results.summary}</p>
            )}
          </div>
        </div>

        {results.relevantLaws?.length > 0 && (
          <div className="mb-6 pb-6 border-b border-indigo-700/30">
            <h4 className="font-medium text-cyan-400 mb-3">Relevant Statutes</h4>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {results.relevantLaws.map((law, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-indigo-800/50 p-4 rounded-lg hover:bg-indigo-800/70 transition-all"
                >
                  <div className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-indigo-100">{law.title}</p>
                      <p className="text-sm text-indigo-300 mt-1">{law.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {results.casePrecedents?.length > 0 && (
          <div className="mb-6 pb-6 border-b border-indigo-700/30">
            <h4 className="font-medium text-cyan-400 mb-3">Precedent Cases</h4>
            <div className="space-y-4">
              {results.casePrecedents.map((precedent, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-indigo-800/50 p-4 rounded-lg hover:bg-indigo-800/70 transition-all"
                >
                  <div className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-indigo-100">{precedent.title}</p>
                      <p className="text-sm text-indigo-300 mt-1">{precedent.description}</p>
                      <p className="text-xs text-indigo-400 mt-2 flex items-center gap-2">
                        <span className="font-medium">{precedent.court}</span>
                        <span>•</span>
                        <span>{precedent.date}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {results.references?.length > 0 && (
          <div>
            <h4 className="font-medium text-cyan-400 mb-3">References</h4>
            <ul className="space-y-2 text-sm text-indigo-300">
              {results.references.map((ref, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-cyan-400 font-medium">{index + 1}.</span>
                  <span>{ref}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </ResultContent>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-800 to-indigo-900 rounded-xl shadow-xl overflow-hidden border border-indigo-700/50"
      >
        <div className="p-6 border-b border-indigo-700/30 bg-gradient-to-r from-indigo-900 to-gray-800">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-cyan-400">
            <Scale className="w-7 h-7" />
            Legal Codex
          </h2>
          <p className="text-indigo-300 mt-2 ml-9 text-sm">
            Access real-time legal updates, amendments, and case precedents with AI precision.
          </p>
        </div>

        <div className="p-6">
          <div className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What are the latest updates in cybercrime laws?"
              className="w-full p-4 pr-24 bg-gray-700 border border-indigo-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-indigo-100 placeholder-indigo-400 transition-all group-hover:shadow-md"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              {browserSupportsSpeechRecognition && (
                <motion.button
                  onClick={toggleListening}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-lg transition-all ${
                    isListening 
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-md' 
                      : 'bg-indigo-700 hover:bg-indigo-600 text-cyan-300'
                  }`}
                  title={isListening ? "Stop voice input" : "Start voice input"}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </motion.button>
              )}
              <motion.button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all disabled:bg-gray-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <Search className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {renderVoiceStatus()}

          <AnimatePresence>
            {isListening && transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-4 bg-indigo-800/50 border border-indigo-700 rounded-lg"
              >
                <p className="text-sm text-cyan-300">
                  <span className="font-medium">Current transcript:</span> {transcript}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center my-8 space-y-4"
            >
              <motion.div
                className="rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-indigo-300">Scanning legal archives...</p>
            </motion.div>
          )}

          {renderResults()}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-br from-gray-800 to-indigo-900 rounded-xl shadow-xl overflow-hidden border border-indigo-700/50"
      >
        <div className="p-6 border-b border-indigo-700/30 bg-gradient-to-r from-indigo-900 to-gray-800">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-cyan-400">
            <Clock className="w-6 h-6" />
            Search Archives
          </h2>
        </div>

        <div className="p-6">
          {searchHistory.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-indigo-600/50 mx-auto mb-3" />
              <p className="text-indigo-400">No search archives yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-indigo-700/30">
              {searchHistory.map((item) => (
                <motion.li
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="py-4 px-4 hover:bg-indigo-800/50 cursor-pointer transition-all rounded-lg group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex items-start gap-3 flex-grow"
                      onClick={() => handleHistoryItemClick(item._id)}
                    >
                      <Search className="w-5 h-5 text-indigo-400 mt-0.5 group-hover:text-cyan-400 transition-colors" />
                      <div>
                        <p className="font-medium text-indigo-100 group-hover:text-cyan-400 transition-colors">
                          {item.query}
                        </p>
                        <p className="text-sm text-indigo-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={(e) => handleDeleteHistory(item._id, e)}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-indigo-400 hover:text-red-400 hover:bg-red-900/30 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      title="Delete from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LegalKnowledge;