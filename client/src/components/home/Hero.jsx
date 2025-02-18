import React from "react";
import { Shield, AlertCircle } from "lucide-react";

const Hero = () => {
  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto py-4 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-indigo-900" />
            <div>
              <h1 className="text-xl font-bold text-indigo-900">Satark AI</h1>
              <p className="text-sm text-slate-600">
                Initiative by Team Binary Vision
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-indigo-900 mx-auto" />
          <h2 className="text-4xl font-bold text-indigo-900">Coming Soon</h2>
          <p className="text-slate-600">
            A Retrieval-Augmented Generation (RAG) System for Legal and Law
            Enforcement
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-4">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm text-slate-600 text-center">
            © 2025 Government of India
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Hero;
