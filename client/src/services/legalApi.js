const API_BASE_URL = 'https://satark-ai-f0xr.onrender.com';

const legalApiService = {
  async searchLegalKnowledge(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/qa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: query }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch legal knowledge');
      }

      const data = await response.json();
      
      // Transform the API response to match the expected format in LegalKnowledge.jsx
      return {
        summary: data.answer || '',
        relevantLaws: data.laws ? data.laws.map(law => ({
          title: law.section || '',
          description: law.description || ''
        })) : [],
        casePrecedents: data.precedents ? data.precedents.map(precedent => ({
          title: precedent.case || '',
          description: precedent.summary || '',
          court: precedent.court || '',
          date: precedent.date || ''
        })) : [],
        references: data.sources || []
      };
    } catch (error) {
      console.error('Legal Knowledge Search Error:', error);
      throw error;
    }
  },

  async getSearchHistory() {
    // Implement if you have a history endpoint
    return [];
  },

  async getSearchDetails(historyId) {
    // Implement if you have a history details endpoint
    return null;
  }
};

export default legalApiService;