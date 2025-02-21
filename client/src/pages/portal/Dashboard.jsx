import "regenerator-runtime/runtime";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Map,
  Mic,
  MicOff,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Clock,
  PieChart as PieChartIcon,
} from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import legalApiService from "../../services/legalApi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Hardcoded sample data remains unchanged
const SAMPLE_TREND_DATA = [
  { period: "Jan", count: 120, growthRate: 5 },
  { period: "Feb", count: 150, growthRate: 25 },
  { period: "Mar", count: 180, growthRate: 20 },
  { period: "Apr", count: 140, growthRate: -22 },
  { period: "May", count: 200, growthRate: 42 },
  { period: "Jun", count: 220, growthRate: 10 },
];

const SAMPLE_DISTRIBUTION_DATA = [
  { name: "Cyber Crime", value: 300 },
  { name: "Financial Fraud", value: 250 },
  { name: "Property Crime", value: 180 },
  { name: "Violent Crime", value: 150 },
  { name: "Narcotics", value: 100 },
];

const SAMPLE_HOTSPOT_DATA = [
  { location: "Mumbai", riskScore: 8.5, incidentCount: 245 },
  { location: "Delhi", riskScore: 7.2, incidentCount: 198 },
  { location: "Bangalore", riskScore: 6.8, incidentCount: 167 },
];

const SAMPLE_RECOMMENDATIONS = [
  {
    title: "Increase Cyber Patrols",
    description: "Deploy additional cybercrime units in high-risk zones.",
    metrics: "30% reduction in cyber incidents",
  },
  {
    title: "CCTV Installation",
    description: "Install surveillance in identified hotspots.",
    metrics: "25% decrease in property crime",
  },
];

// Updated colors to match LegalKnowledge/DetectiveEngine theme
const COLORS = [
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#3B82F6", // Blue
];

// Background Effect Component from LegalKnowledge
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

const Dashboard = () => {
  // All state declarations remain unchanged
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [timeRange, setTimeRange] = useState("last30days");
  const [showFilters, setShowFilters] = useState(false);
  const [region, setRegion] = useState("all");
  const [crimeType, setCrimeType] = useState("all");
  const [activeTab, setActiveTab] = useState("trends");

  const chartRef = useRef(null);

  const commands = [
    { command: "reset", callback: () => resetTranscript() },
    { command: "analyze", callback: () => handleAnalysis() },
    { command: "filter by region *", callback: (region) => setRegion(region) },
    { command: "filter by crime *", callback: (type) => setCrimeType(type) },
  ];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition({ commands });

  // All useEffect hooks remain unchanged
  useEffect(() => {
    setAnalysisResults({
      summary: "Sample analysis showing crime trends across regions.",
      keyInsights: ["Cybercrime up by 25%", "Mumbai shows highest risk"],
      trendData: SAMPLE_TREND_DATA,
      distributionData: SAMPLE_DISTRIBUTION_DATA,
      hotspotData: SAMPLE_HOTSPOT_DATA,
      recommendations: SAMPLE_RECOMMENDATIONS,
    });
    fetchAnalysisHistory();
  }, []);

  useEffect(() => {
    if (transcript) setQuery(transcript);
  }, [transcript]);

  const fetchAnalysisHistory = async () => {
    try {
      const history = await legalApiService.getCrimeAnalysisHistory();
      setAnalysisHistory(history || []);
    } catch (error) {
      console.error("Failed to fetch analysis history:", error);
    }
  };

  const handleAnalysis = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = { query, timeRange, region, crimeType };
      const data = await legalApiService.analyzeCrimeData(params);
      setAnalysisResults(
        data || {
          summary: "Sample analysis showing crime trends across regions.",
          keyInsights: ["Cybercrime up by 25%", "Mumbai shows highest risk"],
          trendData: SAMPLE_TREND_DATA,
          distributionData: SAMPLE_DISTRIBUTION_DATA,
          hotspotData: SAMPLE_HOTSPOT_DATA,
          recommendations: SAMPLE_RECOMMENDATIONS,
        }
      );
      fetchAnalysisHistory();
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisResults({
        summary: "Sample analysis showing crime trends across regions.",
        keyInsights: ["Cybercrime up by 25%", "Mumbai shows highest risk"],
        trendData: SAMPLE_TREND_DATA,
        distributionData: SAMPLE_DISTRIBUTION_DATA,
        hotspotData: SAMPLE_HOTSPOT_DATA,
        recommendations: SAMPLE_RECOMMENDATIONS,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryItemClick = async (historyId) => {
    try {
      setIsLoading(true);
      setError(null);

      const analysisData = await legalApiService.getAnalysisDetails(historyId);
      setQuery(analysisData.query);
      setAnalysisResults(analysisData.results);
      setTimeRange(analysisData.timeRange);
      setRegion(analysisData.region);
      setCrimeType(analysisData.crimeType);
    } catch (error) {
      console.error("Failed to load analysis details:", error);
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
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    }
  };

  const exportAnalysis = () => {
    if (!analysisResults) return;

    const csvContent =
      "data:text/csv;charset=utf-8," +
      analysisResults.trendData
        .map((row) => Object.values(row).join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `crime_analysis_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderVoiceStatus = () => {
    if (!browserSupportsSpeechRecognition)
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-cyan-400">
          Browser doesn't support speech recognition.
        </motion.div>
      );
    if (!isMicrophoneAvailable)
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-red-400">
          Please allow microphone access to use voice input.
        </motion.div>
      );
    if (isListening)
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-red-500"
          />
          <span className="text-sm text-cyan-400">Listening...</span>
        </motion.div>
      );
    return null;
  };

  const renderTimeRangeSelector = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {["last7days", "last30days", "last90days", "lastYear"].map((range) => (
        <motion.button
          key={range}
          onClick={() => setTimeRange(range)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            timeRange === range
              ? "bg-cyan-600 text-white"
              : "bg-black/50 text-gray-300 hover:bg-cyan-500/20"
          }`}>
          {range === "last7days"
            ? "Last 7 Days"
            : range === "last30days"
            ? "Last 30 Days"
            : range === "last90days"
            ? "Last 90 Days"
            : "Last Year"}
        </motion.button>
      ))}
    </div>
  );

  const renderFilters = () => (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: showFilters ? "auto" : 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden">
      <div className="bg-black/50 backdrop-blur-xl p-4 rounded-lg border border-cyan-500/20 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full p-2 bg-black/50 border border-cyan-500/20 rounded-lg text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
              <option value="all">All Regions</option>
              <option value="north">Northern India</option>
              <option value="south">Southern India</option>
              <option value="east">Eastern India</option>
              <option value="west">Western India</option>
              <option value="central">Central India</option>
              <option value="northeast">North-Eastern India</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Crime Type
            </label>
            <select
              value={crimeType}
              onChange={(e) => setCrimeType(e.target.value)}
              className="w-full p-2 bg-black/50 border border-cyan-500/20 rounded-lg text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
              <option value="all">All Crimes</option>
              <option value="cyber">Cyber Crime</option>
              <option value="financial">Financial Fraud</option>
              <option value="property">Property Crime</option>
              <option value="violent">Violent Crime</option>
              <option value="narcotics">Narcotics</option>
              <option value="traffic">Traffic Violations</option>
            </select>
          </div>
        </div>
        {renderTimeRangeSelector()}
      </div>
    </motion.div>
  );

  const renderTrendChart = () => {
    if (!analysisResults || !analysisResults.trendData) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black/50 backdrop-blur-xl p-4 rounded-xl border border-cyan-500/20 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-cyan-400">
            Crime Trend Analysis
          </h3>
          <motion.button
            onClick={exportAnalysis}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 text-sm bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-3 py-1.5 rounded-md transition-colors">
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            ref={chartRef}
            data={analysisResults.trendData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#06B6D4"
              opacity={0.2}
            />
            <XAxis
              dataKey="period"
              angle={-45}
              textAnchor="end"
              height={70}
              stroke="#A5B4FC"
            />
            <YAxis stroke="#A5B4FC" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#000000",
                border: "1px solid #06B6D4",
                color: "#E0E7FF",
              }}
            />
            <Legend wrapperStyle={{ color: "#A5B4FC" }} />
            <Bar dataKey="count" name="Incident Count" fill="#06B6D4" />
            <Bar dataKey="growthRate" name="Growth Rate (%)" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    );
  };

  const renderDistributionChart = () => {
    if (!analysisResults || !analysisResults.distributionData) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black/50 backdrop-blur-xl p-4 rounded-xl border border-cyan-500/20 mb-6">
        <h3 className="text-lg font-medium text-cyan-400 mb-4">
          Crime Distribution
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={analysisResults.distributionData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }>
              {analysisResults.distributionData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} cases`, "Count"]}
              contentStyle={{
                backgroundColor: "#000000",
                border: "1px solid #06B6D4",
                color: "#E0E7FF",
              }}
            />
            <Legend wrapperStyle={{ color: "#A5B4FC" }} />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    );
  };

  const renderHotspotMap = () => {
    if (!analysisResults || !analysisResults.hotspotData) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black/50 backdrop-blur-xl p-4 rounded-xl border border-cyan-500/20 mb-6">
        <h3 className="text-lg font-medium text-cyan-400 mb-4">
          Crime Hotspot Analysis
        </h3>
        <div className="border border-cyan-500/20 rounded-lg overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-cyan-500/20">
            <h4 className="font-medium text-gray-300">Top High-Risk Areas</h4>
          </div>
          <ul className="divide-y divide-cyan-500/20">
            {analysisResults.hotspotData.map((area, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    index === 0
                      ? "bg-red-500/20 text-red-400"
                      : index === 1
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-300">{area.location}</p>
                  <div className="flex gap-6 mt-1 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Risk: {area.riskScore}/10
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      {area.incidentCount} incidents
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-medium mb-1 flex justify-between text-cyan-400">
                      <span>Risk level</span>
                      <span
                        className={
                          area.riskScore >= 8
                            ? "text-red-400"
                            : area.riskScore >= 6
                            ? "text-orange-400"
                            : "text-yellow-400"
                        }>
                        {area.riskScore >= 8
                          ? "Critical"
                          : area.riskScore >= 6
                          ? "High"
                          : "Moderate"}
                      </span>
                    </div>
                    <div className="w-full bg-cyan-500/10 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${area.riskScore * 10}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-2 rounded-full ${
                          area.riskScore >= 8
                            ? "bg-red-500"
                            : area.riskScore >= 6
                            ? "bg-orange-500"
                            : "bg-yellow-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    );
  };

  const renderRecommendations = () => {
    if (!analysisResults || !analysisResults.recommendations) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black/50 backdrop-blur-xl p-4 rounded-xl border border-cyan-500/20 mb-6">
        <h3 className="text-lg font-medium text-cyan-400 mb-4">
          Action Recommendations
        </h3>
        <ul className="space-y-3">
          {analysisResults.recommendations.map((rec, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="font-medium text-gray-300">{rec.title}</p>
                <p className="text-sm text-gray-400 mt-1">{rec.description}</p>
                {rec.metrics && (
                  <div className="mt-2 bg-cyan-500/10 p-2 rounded border border-cyan-500/20">
                    <p className="text-xs text-gray-400">Expected impact:</p>
                    <p className="text-sm font-medium text-cyan-400">
                      {rec.metrics}
                    </p>
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "trends":
        return renderTrendChart();
      case "distribution":
        return renderDistributionChart();
      case "hotspots":
        return renderHotspotMap();
      case "recommendations":
        return renderRecommendations();
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-full">
      <BackgroundEffect />
      <motion.div
        className="relative z-10 max-w-6xl mx-auto p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black/50 backdrop-blur-xl rounded-xl border border-cyan-500/20 mb-6">
          <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-cyan-400">
              <BarChart3 className="w-6 h-6" />
              Crime Matrix
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              Uncover crime patterns, identify high-risk zones, and predict
              emerging threats with AI-driven insights.
            </p>
          </div>

          <div className="p-6">
            <div className="relative">
              <motion.input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Analyze cybercrime trends in Delhi over the last 3 months"
                className="w-full p-4 pr-32 bg-black/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                onKeyPress={(e) => e.key === "Enter" && handleAnalysis()}
                whileFocus={{ boxShadow: "0 0 15px rgba(6, 182, 212, 0.3)" }}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                {browserSupportsSpeechRecognition && (
                  <motion.button
                    onClick={toggleListening}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-lg transition-all ${
                      isListening
                        ? "bg-red-500/20 text-red-400 border border-red-500/20"
                        : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/20"
                    }`}
                    title={
                      isListening ? "Stop voice input" : "Start voice input"
                    }>
                    {isListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </motion.button>
                )}
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/30 transition-colors"
                  title="Show filters">
                  {showFilters ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </motion.button>
                <motion.button
                  onClick={handleAnalysis}
                  disabled={isLoading || !query.trim()}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                  <BarChart3 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {renderVoiceStatus()}
            {renderFilters()}

            <AnimatePresence>
              {isListening && transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                  <p className="text-sm text-cyan-400">
                    <span className="font-medium">Current transcript:</span>{" "}
                    {transcript}
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
                  className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center my-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"
                />
              </motion.div>
            )}

            {analysisResults && !isLoading && (
              <div className="mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-black/50 backdrop-blur-xl p-6 rounded-lg border border-cyan-500/20 mb-6">
                  <h3 className="text-lg font-medium text-cyan-400 mb-2">
                    Analysis Overview
                  </h3>
                  <p className="text-gray-300">{analysisResults.summary}</p>
                  {analysisResults.keyInsights && (
                    <div className="mt-4">
                      <h4 className="font-medium text-cyan-400 mb-2">
                        Key Insights
                      </h4>
                      <ul className="space-y-1 text-gray-400">
                        {analysisResults.keyInsights.map((insight, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-2">
                            <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0 text-cyan-400" />
                            <span>{insight}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>

                <div className="flex border-b border-cyan-500/20 mb-6 overflow-x-auto">
                  {[
                    { id: "trends", icon: TrendingUp, label: "Crime Trends" },
                    {
                      id: "distribution",
                      icon: PieChartIcon,
                      label: "Crime Distribution",
                    },
                    { id: "hotspots", icon: Map, label: "Risk Hotspots" },
                    {
                      id: "recommendations",
                      icon: AlertTriangle,
                      label: "Recommendations",
                    },
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab.id
                          ? "border-cyan-500 text-cyan-400"
                          : "border-transparent text-gray-300 hover:text-cyan-400 hover:border-cyan-500/50"
                      }`}>
                      <div className="flex items-center gap-1">
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {renderTabContent()}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-black/50 backdrop-blur-xl rounded-xl border border-cyan-500/20">
          <div className="p-6 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-cyan-400">
              <Clock className="w-6 h-6" />
              Analysis Archives
            </h2>
          </div>

          <div className="p-6">
            {analysisHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                No analysis archives yet.
              </p>
            ) : (
              <ul className="divide-y divide-cyan-500/20">
                {analysisHistory.map((item) => (
                  <motion.li
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ backgroundColor: "rgba(6, 182, 212, 0.05)" }}
                    className="py-4 cursor-pointer transition-colors px-2 rounded"
                    onClick={() => handleHistoryItemClick(item._id)}>
                    <div className="flex items-start gap-3">
                      <BarChart3 className="w-5 h-5 text-cyan-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-300">
                          {item.query}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">
                            {item.timeRange}
                          </span>
                          {item.region !== "all" && (
                            <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">
                              Region: {item.region}
                            </span>
                          )}
                          {item.crimeType !== "all" && (
                            <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">
                              Crime: {item.crimeType}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
