// backend -> /investigation route

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  Search,
  Loader2,
  Gavel,
  Clipboard,
  Clock,
  AlertCircle,
  Mic,
  MicOff,
  StopCircle,
  MessageSquare,
  Scale,
  BookOpen,
} from "lucide-react";
import engineApiService from "../../services/engineApi";

const DetectiveEngine = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recentQueries] = useState([
    "Tell me about the FIR case of Arjun Mehta?",
    "What is the punishment for IPC 420?",
    "What are the legal rights of an arrested person?",
    "What are the bail conditions for non-bailable offenses?",
    "Recent Supreme Court rulings on cyber crimes",
  ]);

  const responseRef = useRef(null);
  const queryInputRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition({
    commands: [
      { command: "reset", callback: () => resetTranscript() },
      { command: "search", callback: () => handleQuerySubmit() },
      { command: "clear", callback: () => setQuery("") },
    ],
  });

  // Background Elements Component
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

  useEffect(() => {
    fetchQueryHistory();
    if (queryInputRef.current) queryInputRef.current.focus();
  }, []);

  useEffect(() => {
    if (transcript) setQuery(transcript);
  }, [transcript]);

  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [response]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    if (response && response.answer && !isTyping) {
      startTypewriter(response.answer);
    }
    return () => stopTypewriter();
  }, [response]);

  const fetchQueryHistory = async () => {
    try {
      const historyData = await engineApiService.getLegalQAHistory();
      setHistory(historyData || []);
    } catch (err) {
      console.error("Failed to fetch QA history:", err);
    }
  };

  const startTypewriter = (text) => {
    stopTypewriter();
    setDisplayedAnswer("");
    setIsTyping(true);
    let currentText = "";
    let index = 0;

    typingIntervalRef.current = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        setDisplayedAnswer(currentText);
        index++;
      } else {
        stopTypewriter();
      }
    }, 50);
  };

  const stopTypewriter = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setIsTyping(false);
    if (response) setDisplayedAnswer(response.answer);
  };

  const handleQuerySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await engineApiService.submitInvestigationQuery(query);
      setResponse({
        answer: result.answer,
        sources: result.sources,
        confidence: result.confidence,
        query: query,
      });
      fetchQueryHistory();
    } catch (err) {
      console.error("Error querying investigation AI:", err);
      setError(err.message || "Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Unable to copy to clipboard");
    }
  };

  const handleHistoryItemClick = async (historyId) => {
    try {
      setIsLoading(true);
      setError("");

      const queryDetails = await engineApiService.getLegalQADetails(historyId);
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
    if (queryInputRef.current) queryInputRef.current.focus();
  };

  return (
    <div className="relative min-h-full">
      <BackgroundEffect />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <MessageSquare className="w-16 h-16 text-cyan-400" />
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium 
              bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 
              shadow-lg shadow-cyan-500/10">
              <Scale className="w-4 h-4 mr-2" />
              Legal Analysis
            </div>
            <div
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium 
              bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 
              shadow-lg shadow-cyan-500/10">
              <BookOpen className="w-4 h-4 mr-2" />
              Case References
            </div>
            <div
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium 
              bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 
              shadow-lg shadow-cyan-500/10">
              <Gavel className="w-4 h-4 mr-2" />
              Legal Guidance
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 bg-clip-text text-transparent">
              Detective Engine
            </span>
          </h1>
        </motion.div>

        {/* Query Input */}
        <form onSubmit={handleQuerySubmit} className="mb-8">
          <div className="relative">
            <motion.input
              ref={queryInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., What is the punishment under IPC 420 for corporate fraud?"
              className="w-full p-4 pl-12 pr-24 bg-black/50 backdrop-blur-xl 
                border border-cyan-500/20 rounded-xl text-white
                placeholder-gray-400 focus:outline-none focus:border-cyan-500/50
                focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              {browserSupportsSpeechRecognition && (
                <motion.button
                  type="button"
                  onClick={toggleListening}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-lg transition-all ${
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
                type="submit"
                disabled={isLoading || !query.trim()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isLoading || !query.trim()
                    ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                }`}>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Ask"
                )}
              </motion.button>
            </div>
          </div>
        </form>

        <AnimatePresence>
          {!response && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-8">
              <h3 className="text-sm font-medium text-cyan-400 mb-2">
                Explore these queries:
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentQueries.map((q, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleSuggestedQueryClick(q)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-cyan-500/10 cursor-pointer border border-cyan-500/20 rounded-full 
                      px-4 py-2 text-sm text-cyan-400 hover:bg-cyan-500/20 transition-all">
                    {q}
                  </motion.button>
                ))}
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
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 mb-6">
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
                    {transcript || "Speak your legal question"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {response && !isLoading && (
          <motion.div
            ref={responseRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-black/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-4">
              <h3 className="font-medium text-cyan-400 flex items-center justify-between">
                <span>Legal Analysis</span>
                <div className="flex items-center gap-2">
                  {isTyping && (
                    <motion.button
                      onClick={stopTypewriter}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-cyan-400 hover:text-red-400 p-2 rounded"
                      title="Stop typing">
                      <StopCircle className="w-4 h-4" />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => copyToClipboard(displayedAnswer)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-cyan-400 hover:text-cyan-300 p-2 rounded flex items-center gap-1 relative"
                    title="Copy to clipboard">
                    <Clipboard className="w-4 h-4" />
                    <AnimatePresence>
                      {copied && (
                        <motion.span
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="text-xs absolute right-full mr-2 bg-cyan-500/10 px-2 py-1 rounded">
                          Copied!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </h3>
              <p className="text-sm text-cyan-400/80">
                Query: {response.query}
              </p>
            </div>

            <div className="p-5 text-gray-300">
              <div className="prose prose-invert max-w-none">
                {displayedAnswer.split("\n").map((paragraph, idx) => (
                  <motion.p
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="mb-4">
                    {paragraph}
                  </motion.p>
                ))}
              </div>

              {response.sources?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 pt-4 border-t border-cyan-500/20">
                  <h4 className="text-lg font-medium text-cyan-400 mb-2">
                    Legal References:
                  </h4>
                  <ul className="space-y-2">
                    {response.sources.map((source, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="text-sm bg-cyan-500/5 p-3 rounded-lg border border-cyan-500/20">
                        <div>
                          <span className="font-medium text-cyan-400">
                            Source:
                          </span>{" "}
                          {source.title}
                        </div>
                        {source.citation && (
                          <div>
                            <span className="font-medium text-cyan-400">
                              Citation:
                            </span>{" "}
                            {source.citation}
                          </div>
                        )}
                        {source.excerpt && (
                          <div className="mt-2 text-xs bg-cyan-500/5 p-2 rounded italic text-cyan-400/80">
                            "{source.excerpt}"
                          </div>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-black/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-medium text-cyan-400">Query Archives</h3>
          </div>
          <div className="divide-y divide-cyan-500/20 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-6 text-center text-cyan-400">
                No query archives yet. Begin your legal inquiries!
              </div>
            ) : (
              history.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ backgroundColor: "rgba(6, 182, 212, 0.05)" }}
                  className="p-4 cursor-pointer transition-colors"
                  onClick={() => handleHistoryItemClick(item._id)}>
                  <p className="font-medium text-gray-300">{item.query}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-cyan-400/80">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                    {item.sources?.length > 0 && (
                      <span className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-full">
                        {item.sources.length} sources
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DetectiveEngine;
