import React, { useState, useEffect } from "react";
import {
  FileText,
  Send,
  Download,
  Copy,
  CheckCircle,
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
import { marked } from "marked";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const DocumentGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [documentType, setDocumentType] = useState("fir");
  const [generatedContent, setGeneratedContent] = useState(null);
  const [markdownContent, setMarkdownContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const handleCopyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Convert markdown to HTML for display
  const renderMarkdown = (markdown) => {
    if (!markdown) return "";
    return { __html: marked(markdown) };
  };

  const extractMarkdownFromResponse = (response) => {
    // Extract markdown content from between markdown code blocks
    const markdownRegex = /```markdown\s*([\s\S]*?)\s*```/;
    const match = markdownRegex.exec(response.text);
    return match ? match[1] : null;
  };

  const handleDownloadPDF = async () => {
    const contentElement = document.getElementById("document-content");
    if (!contentElement) return;

    setRequestStatus("Generating PDF...");

    try {
      // Create a clean clone of the content for PDF generation
      const clone = contentElement.cloneNode(true);
      clone.style.width = "793px"; // A4 width at 96 DPI
      clone.style.padding = "40px";
      clone.style.backgroundColor = "white";
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#FFFFFF",
      });

      document.body.removeChild(clone);

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Metadata for editability
      pdf.setProperties({
        title: `${documentType.toUpperCase()} - ${new Date().toISOString()}`,
        subject: prompt,
        author: "Document Generator",
        keywords: `${documentType}, legal document, automated`,
        creator: "Document Generator System",
        producer: "Document Generator",
      });

      // Download the PDF
      pdf.save(`${documentType}-document-${Date.now()}.pdf`);
      setRequestStatus("PDF downloaded successfully");

      setTimeout(() => setRequestStatus(null), 3000);
    } catch (error) {
      console.error("PDF generation error:", error);
      setRequestStatus("Error generating PDF. Please try again.");
      setTimeout(() => setRequestStatus(null), 3000);
    }
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

      if (markdownText) {
        setMarkdownContent(markdownText);
      }

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
          <div className="bg-white rounded-md border border-gray-300 overflow-hidden h-full shadow-sm">
            <div className="px-3 py-2 border-b border-gray-300 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    generatedContent ? "bg-green-500" : "bg-gray-400"
                  }`}></div>
                <h2 className="text-xs font-medium text-gray-700">
                  {generatedContent ? "GENERATED OUTPUT" : "OUTPUT PREVIEW"}
                </h2>
                {generatedContent && (
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {documentTypes.find((t) => t.id === documentType)?.label}
                  </span>
                )}
              </div>

              {generatedContent && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyContent}
                    className="p-1 text-gray-500 cursor-pointer hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    title="Copy JSON">
                    {copied ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="p-1 text-gray-500 cursor-pointer hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    title="Download PDF">
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              {generatedContent ? (
                <div
                  className="h-[600px] overflow-y-auto p-4"
                  id="document-content">
                  <div className="flex flex-col gap-4">
                    {/* Document Header */}
                    <div className="pb-3 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-800 mb-1">
                        {generatedContent.content.header.title}
                      </h3>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500">
                        <span>
                          REF: {generatedContent.content.header.number}
                        </span>
                        <span>
                          DATE: {generatedContent.content.header.date}
                        </span>
                        <span>
                          ID: {generatedContent.metadata.reference_id}
                        </span>
                      </div>
                    </div>

                    {/* Markdown Content */}
                    {markdownContent && (
                      <div className="prose prose-sm max-w-none text-gray-800">
                        <div
                          dangerouslySetInnerHTML={renderMarkdown(
                            markdownContent
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[600px] text-center text-gray-500 p-4">
                  <div className="w-12 h-12 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-300" />
                  </div>
                  <h3 className="text-xs font-medium text-gray-700 mb-2">
                    No Document Generated
                  </h3>
                  <p className="max-w-md text-[11px] text-gray-500 mb-4">
                    Select document type and provide details to generate a
                    document. The output will be provided in Markdown format and
                    can be converted to PDF.
                  </p>
                </div>
              )}
            </div>

            {generatedContent && (
              <div className="px-3 py-2 border-t border-gray-300 bg-gray-50 flex items-center justify-between text-[10px] text-gray-500">
                <div>Format: Markdown → PDF conversion (editable)</div>
                <div>Generated: {new Date().toLocaleTimeString()}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentGenerator;
