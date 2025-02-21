import "regenerator-runtime/runtime";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  Clock,
  FileText,
  AlertCircle,
  Mic,
  MicOff,
  Trash2,
  Scale,
  ArrowRight,
  Brain,
  Book,
  Gavel,
} from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import legalApiService from "../../services/legalApi";

// TypeWriter component remains the same
const TypeWriter = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed]);

  return (
    <div className="relative">
      <p className="whitespace-pre-wrap text-gray-300">{displayedText}</p>
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

// Background Effect Component
const BackgroundEffect = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute w-screen h-screen">
      <div className="absolute w-96 h-96 -top-48 -left-48 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute w-96 h-96 top-1/3 right-1/4 bg-violet-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
    </div>
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    />
  </div>
);

// Glowing Badge Component
const GlowingBadge = ({ icon: Icon, text }) => (
  <div
    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium 
    bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 
    shadow-lg shadow-cyan-500/10 hover:bg-cyan-500/20 transition-all duration-300">
    <Icon className="w-4 h-4 mr-2" />
    {text}
  </div>
);

const LegalKnowledge = () => {
  // State management remains the same
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [useTypewriter, setUseTypewriter] = useState(true);

  // Speech recognition setup
  const commands = [
    { command: "reset", callback: () => resetTranscript() },
    { command: "search", callback: () => handleSearch() },
  ];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition({ commands });

  // All existing useEffects and handlers remain the same
  useEffect(() => {
    fetchSearchHistory();
  }, []);

  useEffect(() => {
    if (transcript) setQuery(transcript);
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

  // All other handlers remain the same
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

  // Improved voice input UI
  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    }
  };

  return (
    <div className="relative min-h-full">
      <BackgroundEffect />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6">
            <Brain className="w-16 h-16 text-cyan-400" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-4 mb-8">
            <GlowingBadge icon={Book} text="Legal Research" />
            <GlowingBadge icon={Scale} text="Case Analysis" />
            <GlowingBadge icon={Gavel} text="Precedent Search" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 bg-clip-text text-transparent">
              Legal Knowledge Hub
            </span>
          </motion.h1>
        </div>

        {/* Search Section */}
        <div className="mb-12">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search legal precedents, statutes, or case law..."
              className="w-full p-4 pl-12 pr-24 bg-black/50 backdrop-blur-xl 
                border border-cyan-500/20 rounded-xl text-white
                placeholder-gray-400 focus:outline-none focus:border-cyan-500/50
                focus:ring-2 focus:ring-cyan-500/20 transition-all"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />

            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              {browserSupportsSpeechRecognition && (
                <motion.button
                  onClick={toggleListening}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 cursor-pointer rounded-lg transition-all ${
                    isListening
                      ? "bg-red-500/20 text-red-400 border border-red-500/20"
                      : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/20"
                  }`}>
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </motion.button>
              )}
              <motion.button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="group cursor-pointer px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600
                  rounded-lg flex items-center gap-2 text-white font-medium
                  disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ) : (
                  <>
                    Search
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                <div className="flex items-center">
                  <motion.div
                    className="mr-3 relative"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}>
                    <div className="absolute inset-0 bg-cyan-400/30 rounded-full animate-ping" />
                    <Mic className="relative text-cyan-400 w-5 h-5" />
                  </motion.div>
                  <div>
                    <p className="text-cyan-400 font-medium">Listening...</p>
                    <p className="text-sm text-cyan-400/80">
                      {transcript || "Speak your legal query..."}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl overflow-hidden mb-8">
              <div className="p-6 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                <h3 className="text-xl font-medium text-cyan-400">
                  Legal Analysis
                </h3>
                <p className="text-gray-400 mt-2">{query}</p>
              </div>

              <div className="p-6">
                {/* Summary */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-cyan-400 mb-4">
                    Summary
                  </h4>
                  {useTypewriter ? (
                    <TypeWriter text={results.summary} speed={30} />
                  ) : (
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {results.summary}
                    </p>
                  )}
                </div>

                {/* Relevant Laws */}
                {results.relevantLaws?.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-medium text-cyan-400 mb-4">
                      Relevant Statutes
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                      {results.relevantLaws.map((law, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-xl">
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-300">
                                {law.title}
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                {law.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Case Precedents */}
                {results.casePrecedents?.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-medium text-cyan-400 mb-4">
                      Precedent Cases
                    </h4>
                    <div className="space-y-4">
                      {results.casePrecedents.map((precedent, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-xl">
                          <div className="flex items-start gap-3">
                            <Gavel className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-300">
                                {precedent.title}
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                {precedent.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-cyan-400">
                                <span className="font-medium">
                                  {precedent.court}
                                </span>
                                <span>•</span>
                                <span>{precedent.date}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* References */}
                {results.references?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-cyan-400 mb-4">
                      Legal References
                    </h4>
                    <ul className="space-y-2">
                      {results.references.map((ref, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 text-sm">
                          <BookOpen className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                          <span className="text-gray-300">{ref}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-black/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
            <h3 className="text-xl font-medium text-cyan-400 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Search Archives
            </h3>
          </div>

          <div className="divide-y divide-cyan-500/20">
            {searchHistory.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="w-12 h-12 text-cyan-400/50 mx-auto mb-3" />
                <p className="text-gray-400">No search history yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your search queries will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-cyan-500/20">
                {searchHistory.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 hover:bg-cyan-500/5 transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex items-start gap-3 flex-grow cursor-pointer"
                        onClick={() => handleHistoryItemClick(item._id)}>
                        <Search className="w-5 h-5 text-cyan-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-300 group-hover:text-cyan-400 transition-colors">
                            {item.query}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        onClick={(e) => handleDeleteHistory(item._id, e)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-400 cursor-pointer hover:text-red-400 rounded-lg group-hover:opacity-100 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LegalKnowledge;
