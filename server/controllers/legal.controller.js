const SearchHistory = require("../models/searchHistory.model");
const axios = require("axios");

// Helper to communicate with RAG service
const queryRAGService = async (query) => {
  try {
    // Replace with your actual RAG service endpoint
    const response = await axios.post("http://localhost:8000/query", {
      query: query
    });
    return response.data;
  } catch (error) {
    console.error("RAG service error:", error);
    throw new Error("Failed to retrieve information from knowledge base");
  }
};

// Search legal knowledge
exports.searchLegalKnowledge = async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user.id;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    // Query the RAG service
    const results = await queryRAGService(query);

    // Store the search in history
    const searchRecord = new SearchHistory({
      user: userId,
      query,
      results
    });
    await searchRecord.save();

    return res.status(200).json(results);
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Failed to search legal knowledge" });
  }
};

// Get search history for a user
exports.getSearchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const history = await SearchHistory.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .select("query timestamp _id");
    
    return res.status(200).json({ history });
  } catch (error) {
    console.error("Get history error:", error);
    return res.status(500).json({ message: "Failed to retrieve search history" });
  }
};

// Get details of a specific search
exports.getSearchDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const searchId = req.params.id;
    
    const search = await SearchHistory.findOne({
      _id: searchId,
      user: userId
    });
    
    if (!search) {
      return res.status(404).json({ message: "Search record not found" });
    }
    
    return res.status(200).json(search);
  } catch (error) {
    console.error("Get search details error:", error);
    return res.status(500).json({ message: "Failed to retrieve search details" });
  }
};