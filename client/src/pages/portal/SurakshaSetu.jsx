import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  AlertTriangle,
  Shield,
  Map,
  FileText,
  Command,
  UserCog,
  AlertCircle,
  Clipboard,
  StopCircle,
} from "lucide-react";

const SurakshaSetu = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoadingEndpoint, setCurrentLoadingEndpoint] = useState(null);
  const [responses, setResponses] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("tactical");
  const [copied, setCopied] = useState(false);
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const responseRef = useRef(null);
  const queryInputRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const endpoints = [
    {
      id: "tactical",
      name: "Tactical Response",
      Icon: Shield,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      id: "command",
      name: "Command Center",
      Icon: Command,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      id: "security",
      name: "Security Analysis",
      Icon: AlertTriangle,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      id: "evacuation",
      name: "Evacuation Plan",
      Icon: Map,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      id: "evidence",
      name: "Evidence Collection",
      Icon: FileText,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
    },
  ];

  const recentQueries = [
    "a riot happens at connaught place Gate 2?",
    "we have intel of a bomb threat at the Haldiram restraurant of connaught place",
    "A stampede broke out in the crowd, followed by stone-throwing at Middle Circle",
    "A fire broke out in the building near the Shivaji Stadium Terminal",
    "A group of people are protesting against the government at the Palika Bazaar",
  ];

  // Background Elements Component
  const BackgroundEffect = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute w-screen h-screen">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 top-1/3 right-1/4 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
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
    if (queryInputRef.current) queryInputRef.current.focus();
  }, []);

  useEffect(() => {
    if (responses && responses[activeTab] && !isTyping) {
      startTypewriter(responses[activeTab]);
    }
    return () => stopTypewriter();
  }, [responses, activeTab]);

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
    }, 30);
  };

  const stopTypewriter = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setIsTyping(false);
    if (responses) setDisplayedAnswer(responses[activeTab]);
  };

  const fetchEndpoint = async (endpoint, userQuery) => {
    try {
      setCurrentLoadingEndpoint(endpoint.id);
      const response = await fetch(
        `https://suraksha-setu-api.onrender.com/${endpoint.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: userQuery }),
        }
      );
      const data = await response.json();
      return { id: endpoint.id, answer: data.answer };
    } catch (err) {
      console.error(`Error fetching ${endpoint.id}:`, err);
      return {
        id: endpoint.id,
        answer: `Failed to get ${endpoint.name}. Please try again.`,
      };
    }
  };

  const fetchSequentialResponses = async (userQuery) => {
    setIsLoading(true);
    setError("");
    setResponses(null);

    const allResponses = {};

    try {
      for (const endpoint of endpoints) {
        const result = await fetchEndpoint(endpoint, userQuery);
        allResponses[result.id] = result.answer;
        setResponses({ ...allResponses });
      }
    } catch (err) {
      console.error("Error in sequential fetching:", err);
      setError("Failed to complete analysis. Please try again.");
    } finally {
      setIsLoading(false);
      setCurrentLoadingEndpoint(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    fetchSequentialResponses(query);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Unable to copy to clipboard");
    }
  };

  const currentEndpoint = endpoints.find((e) => e.id === activeTab);

  return (
    <div className="relative min-h-screen bg-black">
      <BackgroundEffect />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <UserCog className="w-16 h-16 text-emerald-400" />
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {endpoints.slice(0, 3).map((endpoint) => (
              <div
                key={endpoint.id}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium 
                ${endpoint.bgColor} ${endpoint.color} ${endpoint.borderColor}
                shadow-lg`}>
                <endpoint.Icon className="w-4 h-4 mr-2" />
                {endpoint.name}
              </div>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Suraksha Setu
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Comprehensive crime analysis and response system integrating
            tactical, command, security, evacuation, and evidence collection
            protocols.
          </p>
        </motion.div>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <motion.input
              ref={queryInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe the situation (e.g., A riot happens at Connaught place gate 2)"
              className="w-full p-4 pl-12 pr-24 bg-black/50 backdrop-blur-xl 
                border border-emerald-500/20 rounded-xl text-white
                placeholder-gray-400 focus:outline-none focus:border-emerald-500
                focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" />
            <motion.button
              type="submit"
              disabled={isLoading || !query.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute cursor-pointer right-2 top-1/2 transform -translate-y-1/2 
                px-4 py-2 rounded-lg flex items-center gap-2
                ${
                  isLoading || !query.trim()
                    ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-blue-600 text-white"
                }`}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Analyze"
              )}
            </motion.button>
          </div>
        </form>

        <AnimatePresence>
          {!responses && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-8">
              <h3 className="text-sm font-medium text-cyan-400 mb-2">
                Example scenarios:
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentQueries.map((q, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setQuery(q)}
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

        {/* Response Section */}
        {(responses || isLoading) && (
          <motion.div
            ref={responseRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-emerald-500/20">
              {endpoints.map((endpoint) => {
                const IconComponent = endpoint.Icon;
                return (
                  <motion.button
                    key={endpoint.id}
                    onClick={() => setActiveTab(endpoint.id)}
                    whileHover={{ backgroundColor: endpoint.bgColor }}
                    className={`flex cursor-pointer items-center gap-2 px-6 py-4 transition-colors whitespace-nowrap
                      ${
                        activeTab === endpoint.id
                          ? `${endpoint.color} border-b-2 border-current`
                          : "text-gray-400 hover:text-gray-300"
                      }`}>
                    <IconComponent className="w-5 h-5" />
                    {endpoint.name}
                    {currentLoadingEndpoint === endpoint.id && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`${currentEndpoint.color} font-medium flex items-center gap-2`}>
                  <currentEndpoint.Icon className="w-5 h-5" />
                  {responses && responses[activeTab] && (
                    <motion.button
                      onClick={stopTypewriter}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-emerald-400 hover:text-red-400 p-2 rounded"
                      title="Stop typing">
                      <StopCircle className="w-4 h-4" />
                    </motion.button>
                  )}
                  {currentEndpoint.name}
                </h3>
                <div className="flex items-center gap-2">
                  {isTyping && (
                    <motion.button
                      onClick={() => copyToClipboard(responses[activeTab])}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-emerald-400 hover:text-emerald-300 p-2 rounded relative"
                      title="Copy to clipboard">
                      <Clipboard className="w-4 h-4" />
                      <AnimatePresence>
                        {copied && (
                          <motion.span
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="absolute right-full mr-2 text-xs bg-emerald-500/10 px-2 py-1 rounded">
                            Copied!
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="text-gray-300">
                {currentLoadingEndpoint === activeTab ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 text-emerald-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>
                      Analyzing {currentEndpoint.name.toLowerCase()}...
                    </span>
                  </motion.div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    {displayedAnswer.split("\n").map((paragraph, idx) => (
                      <motion.p
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="mb-4 text-base leading-relaxed">
                        {paragraph}
                      </motion.p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SurakshaSetu;
