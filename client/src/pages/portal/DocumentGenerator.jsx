import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    { id: "chargesheet", label: "Charge Sheet", icon: Briefcase, color: "#0284c7" },
    { id: "summary", label: "Case Summary", icon: FileSearch, color: "#7c3aed" },
    { id: "summons", label: "Summons", icon: Mail, color: "#ea580c" },
    { id: "testimony", label: "Testimony", icon: MessageSquare, color: "#8b5cf6" },
    { id: "subpoena", label: "Subpoena", icon: Award, color: "#b45309" },
    { id: "pleaagreement", label: "Plea Agreement", icon: FilePlus, color: "#16a34a" },
    { id: "legalnotice", label: "Legal Notice", icon: AlertTriangle, color: "#db2777" },
    { id: "indictment", label: "Indictment", icon: FileWarning, color: "#9f1239" },
  ];

  const handleCopyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderMarkdown = (markdown) => {
    if (!markdown) return "";
    return { __html: marked(markdown) };
  };

  const extractMarkdownFromResponse = (response) => {
    const markdownRegex = /```markdown\s*([\s\S]*?)\s*```/;
    const match = markdownRegex.exec(response.text);
    return match ? match[1] : null;
  };

  const handleDownloadPDF = async () => {
    const contentElement = document.getElementById("document-content");
    if (!contentElement) return;

    setRequestStatus("Generating PDF...");

    try {
      const clone = contentElement.cloneNode(true);
      clone.style.width = "793px";
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

      pdf.setProperties({
        title: `${documentType.toUpperCase()} - ${new Date().toISOString()}`,
        subject: prompt,
        author: "Document Generator",
        keywords: `${documentType}, legal document, automated`,
        creator: "Document Generator System",
        producer: "Document Generator",
      });

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
    const selectedType = documentTypes.find((d) => d.id === documentType)?.label || documentType;
    setInitialPrompt(`Draft a ${selectedType} for ${prompt}`);
  }, [documentType, prompt]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setRequestStatus("Connecting to document generation API...");

    try {
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
      const responseMessage = responseData.outputs[0].outputs[0].results.message;
      const markdownText = extractMarkdownFromResponse(responseMessage);

      if (markdownText) setMarkdownContent(markdownText);

      const formattedResponse = {
        document_type: documentType,
        metadata: {
          reference_id: `DOC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          timestamp: new Date().toISOString(),
          jurisdiction: "Delhi NCR",
          raw_response: responseData,
        },
        content: {
          header: {
            title: documentTypes.find((d) => d.id === documentType)?.label.toUpperCase() || "DOCUMENT",
            number: `${new Date().getFullYear()}/XXX/${Math.floor(Math.random() * 1000) + 100}`,
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
    <div className="max-w-7xl mx-auto bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 p-4">
      <div className="grid md:grid-cols-7 gap-4">
        {/* Left Panel - Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-3"
        >
          <div className="bg-gradient-to-br from-gray-800 to-indigo-900 rounded-xl border border-indigo-700/50 shadow-xl h-full overflow-hidden">
            <div className="px-3 py-2 border-b border-indigo-700/30 bg-gradient-to-r from-indigo-900 to-gray-800">
              <h2 className="text-xs font-medium text-cyan-400 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                DOCUMENT CREATOR
              </h2>
            </div>

            <div className="p-4 space-y-4">
              {/* Document Type Selector */}
              <div>
                <label className="block text-xs font-medium text-indigo-300 mb-2">
                  Document Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {documentTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      onClick={() => setDocumentType(type.id)}
                      whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(34, 211, 238, 0.2)" }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex cursor-pointer justify-center items-center px-2 py-1 rounded-md border text-xs transition-all ${
                        documentType === type.id
                          ? "border-2 shadow-md"
                          : "border-indigo-700/50 hover:border-indigo-600"
                      }`}
                      style={{
                        borderColor: documentType === type.id ? type.color : "",
                        backgroundColor: documentType === type.id ? `${type.color}20` : "rgba(55, 65, 81, 0.5)",
                      }}
                    >
                      <type.icon className="w-4 h-4" style={{ color: type.color }} />
                      <span className="text-indigo-200 px-1">{type.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-medium text-indigo-300">
                    Document Details
                  </label>
                  <span className="text-[10px] text-indigo-400">
                    {prompt.length} chars
                  </span>
                </div>
                <motion.textarea
                  value={prompt || initialPrompt || "No prompt generated yet"}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-32 p-3 bg-gray-800 border border-indigo-600/50 rounded-md resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-indigo-200 text-xs placeholder-indigo-400"
                  placeholder="Describe the details for your document..."
                  whileFocus={{ boxShadow: "0 0 15px rgba(34, 211, 238, 0.3)" }}
                />
              </div>

              {/* Generate Button */}
              <motion.button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-2 rounded-md flex items-center justify-center gap-2 transition-colors text-xs ${
                  isLoading || !prompt.trim()
                    ? "bg-gray-700 cursor-not-allowed text-indigo-400"
                    : "bg-cyan-600 hover:bg-cyan-700 text-white"
                }`}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>Generate Document</span>
                  </>
                )}
              </motion.button>

              {/* Status Message */}
              <AnimatePresence>
                {requestStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-2 text-xs text-center py-1 px-2 bg-indigo-800/50 border border-indigo-700 rounded-md text-cyan-300"
                  >
                    {requestStatus}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Output */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-4"
        >
          <div className="bg-gradient-to-br from-gray-800 to-indigo-900 rounded-xl border border-indigo-700/50 shadow-xl h-full overflow-hidden">
            <div className="px-3 py-2 border-b border-indigo-700/30 bg-gradient-to-r from-indigo-900 to-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-1.5 h-1.5 rounded-full ${generatedContent ? "bg-green-500" : "bg-gray-500"}`}
                />
                <h2 className="text-xs font-medium text-cyan-400">
                  {generatedContent ? "DOCUMENT OUTPUT" : "OUTPUT PREVIEW"}
                </h2>
                {generatedContent && (
                  <span className="text-[10px] bg-indigo-700 text-indigo-300 px-1.5 py-0.5 rounded">
                    {documentTypes.find((t) => t.id === documentType)?.label}
                  </span>
                )}
              </div>

              {generatedContent && (
                <div className="flex items-center gap-1">
                  <motion.button
                    onClick={handleCopyContent}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 text-indigo-300 hover:text-cyan-400 hover:bg-indigo-700 rounded transition-colors"
                    title="Copy JSON"
                  >
                    {copied ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </motion.button>
                  <motion.button
                    onClick={handleDownloadPDF}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 text-indigo-300 hover:text-cyan-400 hover:bg-indigo-700 rounded transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-3 h-3" />
                  </motion.button>
                </div>
              )}
            </div>

            <div className="relative">
              {generatedContent ? (
                <div className="h-[600px] overflow-y-auto p-4" id="document-content">
                  <div className="flex flex-col gap-4">
                    {/* Document Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="pb-3 border-b border-indigo-700/30"
                    >
                      <h3 className="text-sm font-medium text-indigo-100 mb-1">
                        {generatedContent.content.header.title}
                      </h3>
                      <div className="flex items-center gap-3 text-[10px] text-indigo-400">
                        <span>REF: {generatedContent.content.header.number}</span>
                        <span>DATE: {generatedContent.content.header.date}</span>
                        <span>ID: {generatedContent.metadata.reference_id}</span>
                      </div>
                    </motion.div>

                    {/* Markdown Content */}
                    {markdownContent && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="prose prose-sm max-w-none text-indigo-200"
                      >
                        <div dangerouslySetInnerHTML={renderMarkdown(markdownContent)} />
                      </motion.div>
                    )}
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center h-[600px] text-center text-indigo-400 p-4"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 mb-4 rounded-full bg-indigo-800/50 flex items-center justify-center"
                  >
                    <FileText className="w-6 h-6 text-indigo-500" />
                  </motion.div>
                  <h3 className="text-xs font-medium text-indigo-300 mb-2">
                    No Document Generated
                  </h3>
                  <p className="max-w-md text-[11px] text-indigo-400 mb-4">
                    Select a document type and provide details to generate a document. Output will be in Markdown, convertible to PDF.
                  </p>
                </motion.div>
              )}
            </div>

            {generatedContent && (
              <div className="px-3 py-2 border-t border-indigo-700/30 bg-gradient-to-r from-indigo-900 to-gray-800 flex items-center justify-between text-[10px] text-indigo-400">
                <div>Format: Markdown → PDF (editable)</div>
                <div>Generated: {new Date().toLocaleTimeString()}</div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentGenerator;