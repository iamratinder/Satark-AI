import "regenerator-runtime/runtime";
import React, { useState, useEffect, useRef } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Map, 
  Calendar, 
  Filter, 
  Mic, 
  MicOff,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Clock
} from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import legalApiService from "../../services/legalApi";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const CrimeAnalysis = () => {
  // State management
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("last30days");
  const [showFilters, setShowFilters] = useState(false);
  const [region, setRegion] = useState("all");
  const [crimeType, setCrimeType] = useState("all");
  const [activeTab, setActiveTab] = useState("trends");
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#4C9AFF', '#FF5630', '#36B37E'];
  
  // Voice recognition setup
  const commands = [
    {
      command: 'reset',
      callback: () => resetTranscript()
    },
    {
      command: 'analyze',
      callback: () => handleAnalysis()
    },
    {
      command: 'filter by region *',
      callback: (region) => setRegion(region)
    },
    {
      command: 'filter by crime *',
      callback: (type) => setCrimeType(type)
    }
  ];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition({ commands });

  // Refs
  const chartRef = useRef(null);

  // Effects
  useEffect(() => {
    fetchAnalysisHistory();
  }, []);

  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript]);

  // Methods
  const fetchAnalysisHistory = async () => {
    try {
      const history = await legalApiService.getCrimeAnalysisHistory();
      setAnalysisHistory(history || []);
    } catch (error) {
      console.error("Failed to fetch analysis history:", error);
      setError("Unable to load analysis history. Please try again later.");
    }
  };

  const handleAnalysis = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        query,
        timeRange,
        region,
        crimeType
      };
      
      const data = await legalApiService.analyzeCrimeData(params);
      setAnalysisResults(data);
      
      // Update analysis history after successful search
      fetchAnalysisHistory();
    } catch (error) {
      console.error("Analysis failed:", error);
      setError("Failed to analyze crime data. Please try again later.");
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
      setError("Unable to load previous analysis. Please try again.");
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

  const exportAnalysis = () => {
    if (!analysisResults) return;
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      analysisResults.trendData.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crime_analysis_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // UI Helpers
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

  const renderTimeRangeSelector = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => setTimeRange("last7days")}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          timeRange === "last7days" 
            ? "bg-indigo-600 text-white" 
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`}
      >
        Last 7 Days
      </button>
      <button
        onClick={() => setTimeRange("last30days")}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          timeRange === "last30days" 
            ? "bg-indigo-600 text-white" 
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`}
      >
        Last 30 Days
      </button>
      <button
        onClick={() => setTimeRange("last90days")}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          timeRange === "last90days" 
            ? "bg-indigo-600 text-white" 
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`}
      >
        Last 90 Days
      </button>
      <button
        onClick={() => setTimeRange("lastYear")}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          timeRange === "lastYear" 
            ? "bg-indigo-600 text-white" 
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`}
      >
        Last Year
      </button>
    </div>
  );

  const renderFilters = () => (
    <div className={`overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-96' : 'max-h-0'}`}>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Crime Type</label>
            <select
              value={crimeType}
              onChange={(e) => setCrimeType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
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
    </div>
  );

  const renderTrendChart = () => {
    if (!analysisResults || !analysisResults.trendData) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Crime Trend Analysis</h3>
          <button 
            onClick={exportAnalysis}
            className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            ref={chartRef}
            data={analysisResults.trendData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" angle={-45} textAnchor="end" height={70} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Incident Count" fill="#4F46E5" />
            <Bar dataKey="growthRate" name="Growth Rate (%)" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderDistributionChart = () => {
    if (!analysisResults || !analysisResults.distributionData) return null;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-medium mb-4">Crime Distribution</h3>
        
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
              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {analysisResults.distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} cases`, 'Count']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderHotspotMap = () => {
    if (!analysisResults || !analysisResults.hotspotData) return null;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-medium mb-4">Crime Hotspot Analysis</h3>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h4 className="font-medium">Top High-Risk Areas</h4>
          </div>
          <ul className="divide-y divide-gray-200">
            {analysisResults.hotspotData.map((area, index) => (
              <li key={index} className="p-4 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  index === 0 ? 'bg-red-100 text-red-600' :
                  index === 1 ? 'bg-orange-100 text-orange-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{area.location}</p>
                  <div className="flex gap-6 mt-1 text-sm text-gray-500">
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
                    <div className="text-xs font-medium mb-1 flex justify-between">
                      <span>Risk level</span>
                      <span className={
                        area.riskScore >= 8 ? 'text-red-600' :
                        area.riskScore >= 6 ? 'text-orange-600' :
                        'text-yellow-600'
                      }>
                        {area.riskScore >= 8 ? 'Critical' :
                         area.riskScore >= 6 ? 'High' :
                         'Moderate'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          area.riskScore >= 8 ? 'bg-red-600' :
                          area.riskScore >= 6 ? 'bg-orange-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${area.riskScore * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!analysisResults || !analysisResults.recommendations) return null;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-medium mb-4">Action Recommendations</h3>
        
        <ul className="space-y-3">
          {analysisResults.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-800">{rec.title}</p>
                <p className="text-sm text-blue-700 mt-1">{rec.description}</p>
                {rec.metrics && (
                  <div className="mt-2 bg-white p-2 rounded border border-blue-100">
                    <p className="text-xs text-gray-500">Expected impact:</p>
                    <p className="text-sm font-medium">{rec.metrics}</p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'trends':
        return renderTrendChart();
      case 'distribution':
        return renderDistributionChart();
      case 'hotspots':
        return renderHotspotMap();
      case 'recommendations':
        return renderRecommendations();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
            <BarChart3 className="w-6 h-6" />
            Crime & Risk Analysis
          </h2>
          <p className="text-indigo-100 mt-2">
            Analyze crime patterns, detect high-risk areas, and predict emerging crime trends.
          </p>
        </div>

        <div className="p-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Analyze cybercrime trends in Delhi over the last 3 months"
              className="w-full p-4 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onKeyPress={(e) => e.key === "Enter" && handleAnalysis()}
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
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                title="Show filters"
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={handleAnalysis}
                disabled={isLoading || !query.trim()}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {renderVoiceStatus()}
          {renderFilters()}

          {isListening && transcript && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Current transcript:</span> {transcript}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center my-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {analysisResults && !isLoading && (
            <div className="mt-8">
              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 mb-6">
                <h3 className="text-lg font-medium text-indigo-800 mb-2">Analysis Summary</h3>
                <p className="text-indigo-700">{analysisResults.summary}</p>
                
                {analysisResults.keyInsights && (
                  <div className="mt-4">
                    <h4 className="font-medium text-indigo-800 mb-2">Key Insights</h4>
                    <ul className="space-y-1 text-indigo-700">
                      {analysisResults.keyInsights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-500" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('trends')}
                  className={`px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'trends' 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Crime Trends
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('distribution')}
                  className={`px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'distribution' 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <PieChart className="w-4 h-4" />
                    Crime Distribution
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('hotspots')}
                  className={`px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'hotspots' 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Map className="w-4 h-4" />
                    Risk Hotspots
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'recommendations' 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Recommendations
                  </div>
                </button>
              </div>
              
              {renderTabContent()}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            Analysis History
          </h2>
        </div>

        <div className="p-6">
          {analysisHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No analysis history yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {analysisHistory.map((item) => (
                <li
                  key={item._id}
                  className="py-4 hover:bg-gray-50 cursor-pointer transition-colors px-2 rounded"
                  onClick={() => handleHistoryItemClick(item._id)}
                >
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-indigo-400 mt-0.5" />
                    <div>
                      <p className="font-medium">{item.query}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {item.timeRange}
                        </span>
                        {item.region !== "all" && (
                          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded">
                            Region: {item.region}
                          </span>
                        )}
                        {item.crimeType !== "all" && (
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
                            Crime: {item.crimeType}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
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

export default CrimeAnalysis;