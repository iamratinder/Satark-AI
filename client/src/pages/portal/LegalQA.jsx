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
} from "lucide-react";
import legalApiService from "../../services/legalApi";

const LegalQA = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [displayedAnswer, setDisplayedAnswer] = useState(""); // For typewriter effect
  const [isTyping, setIsTyping] = useState(false); // Track typing state
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recentQueries] = useState([
    "What is the punishment under IPC 420 for corporate fraud?",
    "Explain the evidence requirements for NDPS Act cases",
    "What are the bail conditions for non-bailable offenses?",
    "Recent Supreme Court rulings on cyber crimes",
  ]);

  const responseRef = useRef(null);
  const queryInputRef = useRef(null);
  const typingIntervalRef = useRef(null); // Ref to store typing interval

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

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setError("Please log in to view query history.");
      return;
    }
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
    return () => stopTypewriter(); // Cleanup on unmount or new response
  }, [response]);

  const fetchQueryHistory = async () => {
    console.log("Fetching history with token:", localStorage.getItem("token"));
    try {
      const historyData = await legalApiService.getLegalQAHistory();
      console.log("History response:", historyData);
      setHistory(historyData || []);
    } catch (err) {
      console.error("Failed to fetch QA history:", err);
    }
  };

  const startTypewriter = (text) => {
    stopTypewriter(); // Clear any existing typing
    setDisplayedAnswer(""); // Reset displayed text
    setIsTyping(true);
    let currentText = ""; // Local variable to build text
    let index = 0;

    typingIntervalRef.current = setInterval(() => {
      if (index < text.length) {
        currentText += text[index]; // Build text incrementally
        setDisplayedAnswer(currentText); // Update state with full current text
        index++;
      } else {
        stopTypewriter();
      }
    }, 50); // Adjust speed (50ms per character)
  };

  const stopTypewriter = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setIsTyping(false);
    if (response) setDisplayedAnswer(response.answer); // Show full text if stopped
  };

  const handleQuerySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError("");
    setResponse(null); // Reset previous response

    try {
      const result = await legalApiService.submitInvestigationQuery(query);
      console.log("API Response:", result); // Debug response
      setResponse({
        answer: result.answer,
        sources: result.sources,
        confidence: result.confidence,
        query: query,
      });
      fetchQueryHistory(); // Refresh history after successful query
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
    if (queryInputRef.current) queryInputRef.current.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center">
            <Gavel className="mr-3 w-8 h-8" />
            AI Legal Counsel
          </h1>
          <p className="text-indigo-300 mt-2 text-sm">
            Pose any legal question and receive precise answers with case law
            and statutory references.
          </p>
        </motion.div>

        <form onSubmit={handleQuerySubmit} className="mb-6">
          <div className="relative">
            <motion.input
              ref={queryInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., What is the punishment under IPC 420 for corporate fraud?"
              className="w-full p-4 pl-12 pr-24 bg-gray-800 border border-indigo-700/50 rounded-lg text-indigo-100 placeholder-indigo-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              whileFocus={{ boxShadow: "0 0 15px rgba(34, 211, 238, 0.3)" }}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              {browserSupportsSpeechRecognition && (
                <motion.button
                  type="button"
                  onClick={toggleListening}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-lg transition-all ${
                    isListening
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-indigo-700 hover:bg-indigo-600 text-cyan-300"
                  }`}
                  title={isListening ? "Stop listening" : "Start voice input"}>
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
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-cyan-600 text-white hover:bg-cyan-700"
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
              <h3 className="text-sm font-medium text-indigo-400 mb-2">
                Explore these queries:
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentQueries.map((q, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleSuggestedQueryClick(q)}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 10px rgba(34, 211, 238, 0.2)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-indigo-800/50 border border-indigo-700/50 rounded-full px-4 py-2 text-sm text-indigo-200 hover:bg-indigo-800/70 transition-all">
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
              className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 text-red-300 flex items-start gap-2">
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
              className="bg-indigo-800/50 border border-indigo-700 rounded-lg p-4 mb-6">
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
                  <p className="text-sm text-indigo-300">
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
            className="bg-gradient-to-br from-gray-800 to-indigo-900 rounded-xl shadow-xl overflow-hidden mb-8 border border-indigo-700/50">
            <div className="bg-gradient-to-r from-indigo-900 to-gray-800 p-4">
              <h3 className="font-medium text-cyan-400 flex items-center justify-between">
                <span>Legal Analysis</span>
                <div className="flex items-center gap-2">
                  {isTyping && (
                    <motion.button
                      onClick={stopTypewriter}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-indigo-200 hover:text-red-400 p-2 rounded"
                      title="Stop typing">
                      <StopCircle className="w-4 h-4" />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => copyToClipboard(displayedAnswer)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-indigo-200 hover:text-cyan-400 p-2 rounded flex items-center gap-1 relative"
                    title="Copy to clipboard">
                    <Clipboard className="w-4 h-4" />
                    <AnimatePresence>
                      {copied && (
                        <motion.span
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="text-xs absolute right-full mr-2 bg-indigo-700 px-2 py-1 rounded">
                          Copied!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </h3>
              <p className="text-sm text-indigo-300">Query: {response.query}</p>
            </div>

            <div className="p-5 text-indigo-200">
              <div className="prose max-w-none">
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
                  className="mt-6 pt-4 border-t border-indigo-700/30">
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
                        className="text-sm bg-indigo-800/50 p-3 rounded border border-indigo-700/30">
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
                          <div className="mt-2 text-xs bg-indigo-900/50 p-2 rounded italic text-indigo-300">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800 to-indigo-900 rounded-xl shadow-xl overflow-hidden border border-indigo-700/50">
          <div className="bg-gradient-to-r from-indigo-900 to-gray-800 p-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-medium text-cyan-400">Query Archives</h3>
          </div>
          <div className="divide-y divide-indigo-700/30 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-6 text-center text-indigo-400">
                No query archives yet. Begin your legal inquiries!
              </div>
            ) : (
              history.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}
                  className="p-4 cursor-pointer transition-colors"
                  onClick={() => handleHistoryItemClick(item._id)}>
                  <p className="font-medium text-indigo-100">{item.query}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-indigo-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                    {item.sources?.length > 0 && (
                      <span className="text-xs px-2 py-1 bg-indigo-700 text-cyan-300 rounded-full">
                        {item.sources.length} sources
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalQA;
