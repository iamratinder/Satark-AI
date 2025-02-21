import React, { useState, useEffect } from "react";
import {
  FileText,
  Send,
  Clipboard,
  FileSearch,
  Shield,
  FileWarning,
  AlertTriangle,
  Award,
  FilePlus,
  Mail,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import InteractiveDocumentDisplay from "./InteractiveDocumentDisplay";

const DocumentGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [documentType, setDocumentType] = useState("fir");
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [initialPrompt, setInitialPrompt] = useState("");

  const documentTypes = [
    { id: "fir", label: "FIR", icon: FileText, color: "#2563eb" },
    { id: "affidavit", label: "Affidavit", icon: Clipboard, color: "#059669" },
    { id: "warrant", label: "Warrant", icon: Shield, color: "#dc2626" },
    {
      id: "chargesheet",
      label: "Charge Sheet",
      icon: Briefcase,
      color: "#0284c7",
    },
    {
      id: "summary",
      label: "Case Summary",
      icon: FileSearch,
      color: "#7c3aed",
    },
    { id: "summons", label: "Summons", icon: Mail, color: "#ea580c" },
    {
      id: "testimony",
      label: "Testimony",
      icon: MessageSquare,
      color: "#8b5cf6",
    },
    { id: "subpoena", label: "Subpoena", icon: Award, color: "#b45309" },
    {
      id: "pleaagreement",
      label: "Plea Agreement",
      icon: FilePlus,
      color: "#16a34a",
    },
    {
      id: "legalnotice",
      label: "Legal Notice",
      icon: AlertTriangle,
      color: "#db2777",
    },
    {
      id: "indictment",
      label: "Indictment",
      icon: FileWarning,
      color: "#9f1239",
    },
  ];

  const handleSaveContent = (newContent) => {
    if (generatedContent) {
      setGeneratedContent({
        ...generatedContent,
        content: {
          ...generatedContent.content,
          markdown: newContent,
        },
      });
    }
  };

  const extractMarkdownFromResponse = (response) => {
    // Extract markdown content from between markdown code blocks
    const markdownRegex = /```markdown\s*([\s\S]*?)\s*```/;
    const match = markdownRegex.exec(response.text);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const selectedType =
      documentTypes.find((d) => d.id === documentType)?.label || documentType;
    setInitialPrompt(`Draft a ${selectedType} for ${prompt}`);
  }, [documentType, prompt]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setRequestStatus("Connecting to document generation API...");

    try {
      // Prepare the API request payload
      const requestPayload = {
        input_value: initialPrompt,
        output_type: "chat",
        input_type: "chat",
        tweaks: {
          "Agent-diiZi": {},
          "ChatInput-dNWVe": {},
          "ChatOutput-86HdV": {},
        },
      };

      // Make the actual API request
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/proxy/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const responseData = await response.json();

      // Extract the markdown content and response
      const responseMessage =
        responseData.outputs[0].outputs[0].results.message;
      const markdownText = extractMarkdownFromResponse(responseMessage);

      // Create standardized response format for the UI
      const formattedResponse = {
        document_type: documentType,
        metadata: {
          reference_id: `DOC-${Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase()}`,
          timestamp: new Date().toISOString(),
          jurisdiction: "Delhi NCR",
          raw_response: responseData,
        },
        content: {
          header: {
            title:
              documentTypes
                .find((d) => d.id === documentType)
                ?.label.toUpperCase() || "DOCUMENT",
            number: `${new Date().getFullYear()}/XXX/${
              Math.floor(Math.random() * 1000) + 100
            }`,
            date: new Date().toLocaleDateString(),
          },
          markdown: markdownText,
          raw_text: responseMessage.text,
        },
      };

      setGeneratedContent(formattedResponse);
      setRequestStatus("Document generated successfully");

      setTimeout(() => setRequestStatus(null), 3000);
    } catch (error) {
      console.error("Generation error:", error);
      setRequestStatus(`Error: ${error.message}`);
      setTimeout(() => setRequestStatus(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto text-black bg-transparent">
      <div className="grid md:grid-cols-7 gap-4">
        {/* Left Panel - Input */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-md border border-gray-300 overflow-hidden h-full shadow-sm">
            <div className="px-3 py-2 border-b border-gray-300 bg-gray-50">
              <h2 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                INPUT PARAMETERS
              </h2>
            </div>

            <div className="p-4 space-y-4">
              {/* Document Type Selector */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Document Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {documentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setDocumentType(type.id)}
                      className={`flex cursor-pointer justify-center items-center px-2 py-1 rounded-md border text-xs transition-all ${
                        documentType === type.id
                          ? `border-1 bg-gray-50 shadow-sm`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{
                        borderColor: documentType === type.id ? type.color : "",
                        backgroundColor:
                          documentType === type.id ? `${type.color}10` : "",
                      }}>
                      <type.icon
                        className="w-4 h-4"
                        style={{ color: type.color }}
                      />
                      <span className="text-gray-800 px-1">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-medium text-gray-600">
                    Document Details
                  </label>
                  <span className="text-[10px] text-gray-500">
                    {prompt.length} chars
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    value={prompt || initialPrompt || "No prompt generated yet"}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-32 p-3 text-black bg-gray-50 border border-gray-300 rounded-md resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    placeholder="Describe the details for your document..."
                  />
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className={`w-full py-2 rounded-md flex items-center justify-center gap-2 transition-colors text-xs ${
                  isLoading || !prompt.trim()
                    ? "bg-gray-200 cursor-not-allowed text-gray-500"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}>
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>Generate Document</span>
                  </>
                )}
              </button>

              {/* Status Message */}
              {requestStatus && (
                <div className="mt-2 text-xs text-center py-1 px-2 bg-gray-50 border border-gray-200 rounded-md">
                  {requestStatus}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="md:col-span-4">
          <InteractiveDocumentDisplay
            content={generatedContent}
            documentType={
              documentTypes.find((d) => d.id === documentType)?.label
            }
            onSave={handleSaveContent}
            requestStatus={requestStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentGenerator;
