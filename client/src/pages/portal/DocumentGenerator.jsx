import React, { useState } from "react";
import {
  FileText,
  Send,
  Download,
  ChevronDown,
  Copy,
  CheckCircle,
  Clipboard,
  FileSearch,
  Shield,
  Briefcase,
} from "lucide-react";

const DocumentGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [documentType, setDocumentType] = useState("fir");
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [copied, setCopied] = useState(false);

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
  ];

  const promptExamples = {
    fir: [
      "Cyber fraud case of ₹50 lakh targeting senior citizens",
      "Vehicle theft of Honda City (MH-02-AB-1234) from Connaught Place",
      "Assault at Central Market on Feb 10 at 9:30 PM",
    ],
    affidavit: [
      "Property ownership transfer in Mumbai for plot no. 123",
      "Name change from Raj Kumar Sharma to Raj Sharma",
      "Missing original degree certificate for MBA admission",
    ],
    warrant: [
      "Suspect evading court summons for 3 months in fraud case",
      "Cyber fraud case under sections 420, 120B, 66D IT Act",
      "Violation of bail conditions in NDPS Act Section 27 case",
    ],
    chargesheet: [
      "Theft case under IPC 379, 411 with CCTV evidence",
      "Hit-and-run case with three eyewitness testimonies",
      "Cyberstalking with IP logs and threatening messages",
    ],
    summary: [
      "Property dispute between Singh and Sharma families",
      "Insurance fraud with 12 witnesses and forensic evidence",
      "Criminal conspiracy case across three jurisdictions",
    ],
  };

  const handleSelectExample = (example) => {
    setPrompt(example);
    setShowExamples(false);
  };

  const handleCopyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPDF = () => {
    // PDF conversion would happen here in real implementation
    alert("PDF download functionality will be integrated with backend API");
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    // Simulate API call to LLM service
    setTimeout(() => {
      // Sample JSON response from LLM
      const sampleResponse = {
        document_type: documentType,
        metadata: {
          reference_id: `DOC-${Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase()}`,
          timestamp: new Date().toISOString(),
          jurisdiction: "Delhi NCR",
        },
        content: {
          header: {
            title:
              documentType === "fir"
                ? "FIRST INFORMATION REPORT"
                : documentType === "affidavit"
                ? "AFFIDAVIT"
                : documentType === "warrant"
                ? "ARREST WARRANT"
                : documentType === "chargesheet"
                ? "CHARGE SHEET"
                : "CASE SUMMARY",
            number: `${new Date().getFullYear()}/XXX/${
              Math.floor(Math.random() * 1000) + 100
            }`,
            date: new Date().toLocaleDateString(),
          },
          sections: [
            {
              title: "Basic Information",
              fields: {
                district: "New Delhi",
                police_station: "Central",
                date_filed: new Date().toLocaleDateString(),
                acts_sections: "Indian Penal Code, Sections 420, 120B",
              },
            },
            {
              title: "Case Details",
              fields: {
                description: prompt || "No details provided",
                location: "Central District, New Delhi",
                complainant_name: "XXXX XXXX",
                complainant_contact: "XXXX-XXXX-XXXX",
              },
            },
            {
              title: "Additional Information",
              fields: {
                accused_details: "Name: XXXX, Address: XXXX",
                witnesses: "1. XXXX, 2. XXXX",
                evidence_collected: "1. XXXX, 2. XXXX",
              },
            },
          ],
          certification: {
            officer_name: "Inspector XXXX",
            officer_id: "ID-XXXX",
            signature_date: new Date().toLocaleDateString(),
          },
        },
      };

      setGeneratedContent(sampleResponse);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto bg-gray-100">
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
                <div className="grid grid-cols-5 gap-2">
                  {documentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setDocumentType(type.id)}
                      className={`flex flex-col items-center px-2 py-2 rounded-md border text-xs transition-all ${
                        documentType === type.id
                          ? `border-2 bg-gray-50 shadow-sm`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{
                        borderColor: documentType === type.id ? type.color : "",
                      }}>
                      <type.icon
                        className="w-4 h-4 mb-2"
                        style={{ color: type.color }}
                      />
                      <span className="text-gray-800 px-1 text-ellipsis overflow-hidden whitespace-nowrap max-w-[80px]">
                        {type.label}
                      </span>
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
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-32 p-3 bg-gray-50 border border-gray-300 rounded-md resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    placeholder="Describe the details for your document..."
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowExamples(!showExamples)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <span>Example prompts</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        showExamples ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showExamples && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-md border border-gray-200 py-1 text-xs">
                      {promptExamples[documentType].map((example, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectExample(example)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-l-2 border-transparent hover:border-blue-500">
                          {example}
                        </button>
                      ))}
                    </div>
                  )}
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
                <div className="h-[600px] overflow-y-auto p-4">
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

                    {/* Document Sections */}
                    {generatedContent.content.sections.map((section, index) => (
                      <div key={index} className="mb-4">
                        <h4 className="text-xs font-medium text-gray-700 mb-2 bg-gray-50 py-1 px-2 border-l-2 border-blue-500">
                          {section.title}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(section.fields).map(
                            ([key, value], i) => (
                              <div key={i} className="text-[11px]">
                                <span className="text-gray-500 uppercase text-[10px]">
                                  {key.replace(/_/g, " ")}:
                                </span>
                                <p className="text-gray-800 mt-0.5">{value}</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Certification */}
                    <div className="mt-4 pt-3 border-t border-gray-200 text-[11px]">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-700">
                            Certified by:{" "}
                            {
                              generatedContent.content.certification
                                .officer_name
                            }
                          </p>
                          <p className="text-gray-500">
                            ID:{" "}
                            {generatedContent.content.certification.officer_id}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-700">
                            Date:{" "}
                            {
                              generatedContent.content.certification
                                .signature_date
                            }
                          </p>
                          <p className="text-gray-500 mt-1 italic">
                            Digital Signature
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* JSON Preview Section */}
                    <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200">
                      <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-gray-500" />
                        JSON Response (API Output)
                      </h4>
                      <pre className="bg-gray-50 p-3 rounded-md text-[10px] overflow-x-auto border border-gray-200">
                        {JSON.stringify(generatedContent, null, 2)}
                      </pre>
                    </div>
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
                    document. The output will be provided in JSON format and can
                    be converted to PDF.
                  </p>
                </div>
              )}
            </div>

            {generatedContent && (
              <div className="px-3 py-2 border-t border-gray-300 bg-gray-50 flex items-center justify-between text-[10px] text-gray-500">
                <div>Format: JSON → PDF conversion</div>
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
