import React, { useState } from "react";
import { FileText, Send } from "lucide-react";

const DocumentGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [documentType, setDocumentType] = useState("fir");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const documentTypes = [
    { id: "fir", label: "FIR" },
    { id: "affidavit", label: "Affidavit" },
    { id: "warrant", label: "Arrest Warrant" },
    { id: "summary", label: "Case Summary" },
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    // Simulate API call to LLM service
    setTimeout(() => {
      const sampleResponse = `IN THE COURT OF CHIEF METROPOLITAN MAGISTRATE
COURT NO. ${Math.floor(Math.random() * 10) + 1}
      
FIR No: ${new Date().getFullYear()}/XXX
Date: ${new Date().toLocaleDateString()}

FIRST INFORMATION REPORT
(Under Section 154 Cr.P.C)

${prompt}

This is a sample generated document based on the prompt: "${prompt}"
`;
      setGeneratedContent(sampleResponse);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Legal Document Generator
          </h2>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <div className="flex flex-wrap gap-2">
              {documentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setDocumentType(type.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    documentType === type.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Document Details
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the details for your document (e.g., Case details, parties involved, etc.)"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              isLoading || !prompt.trim()
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}>
            <Send className="w-4 h-4" />
            {isLoading ? "Generating..." : "Generate Document"}
          </button>
        </div>
      </div>

      {generatedContent && (
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Generated Document</h2>
          </div>
          <div className="p-6">
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
              {generatedContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentGenerator;
