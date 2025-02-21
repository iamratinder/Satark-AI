import React from "react";
import { motion } from "framer-motion";
import {
  Scale,
  FileText,
  Book,
  Shield,
  Search,
  Activity,
  GitBranch,
  MessageSquare,
} from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group relative rounded-2xl p-6 lg:p-8 
        bg-gradient-to-br from-gray-900/90 to-gray-900/50
        border border-gray-800 hover:border-cyan-500/20
        transition-all duration-500 hover:transform hover:scale-105">
      <div
        className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-violet-500/10 
        opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
      />

      <div className="relative z-10">
        <div className="mb-6 inline-block rounded-full bg-cyan-500/10 p-3">
          <Icon className="w-8 h-8 text-cyan-400" />
        </div>
        <h3 className="text-xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const Features = () => {
  const features = [
    {
      icon: Scale,
      title: "Vivad Mitra",
      description:
        "AI-powered case prediction and investigation tool providing legal insights, pattern recognition, and procedural guidance based on historical data.",
      delay: 0.1,
    },
    {
      icon: FileText,
      title: "Kanoon Patr",
      description:
        "Automated legal document generation system with multi-language support and context-aware legal adjustments for various document types.",
      delay: 0.2,
    },
    {
      icon: Book,
      title: "Nyay Darpan",
      description:
        "Real-time legal knowledge retrieval system with dynamic updates from Indian legal portals and natural language querying capabilities.",
      delay: 0.3,
    },
    {
      icon: Shield,
      title: "Suraksha Setu",
      description:
        "Advanced emergency management and riot control system with real-time surveillance and AI-guided decision-making capabilities.",
      delay: 0.4,
    },
  ];

  const subFeatures = [
    {
      icon: Search,
      title: "Pattern Recognition",
      description:
        "Advanced algorithms analyze case patterns and predict outcomes",
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "24/7 surveillance and threat detection systems",
    },
    {
      icon: GitBranch,
      title: "Process Automation",
      description: "Streamlined workflows and document processing",
    },
    {
      icon: MessageSquare,
      title: "Multi-language Support",
      description: "Available in English, Hindi, and regional languages",
    },
  ];

  return (
    <section className="relative py-20 bg-black overflow-hidden" id="features">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Comprehensive legal solutions powered by advanced artificial
            intelligence
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        {/* Sub Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {subFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center group">
              <div
                className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full 
                bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                {feature.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
