import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Scale,
  Users,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  Brain,
} from "lucide-react";

const ServiceCard = ({
  title,
  description,
  icon: Icon,
  features,
  gradient,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative rounded-2xl overflow-hidden backdrop-blur-sm
        border border-gray-800 hover:border-gray-700 transition-all duration-500`}>
      {/* Gradient Background */}
      <div className={`absolute inset-0 opacity-10 ${gradient}`} />

      {/* Content */}
      <div className="relative p-8">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-full bg-cyan-500/10">
            <Icon className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="ml-4 text-2xl font-bold text-white">{title}</h3>
        </div>

        <p className="text-gray-400 mb-8">{description}</p>

        <ul className="space-y-4">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start">
              <CheckCircle className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
              <span className="ml-3 text-gray-300">{feature}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const Services = () => {
  const services = [
    {
      title: "Law Enforcement",
      description:
        "Enhanced crime analysis and real-time threat detection for law enforcement agencies.",
      icon: Shield,
      gradient: "bg-gradient-to-br from-cyan-500 to-blue-500",
      features: [
        "Real-time crime pattern analysis",
        "AI-powered threat detection",
        "Automated report generation",
        "Evidence management system",
        "Emergency response coordination",
      ],
    },
    {
      title: "Legal Professionals",
      description:
        "Streamlined legal research and documentation tools for lawyers and legal teams.",
      icon: Scale,
      gradient: "bg-gradient-to-br from-blue-500 to-violet-500",
      features: [
        "Automated document drafting",
        "Case law research assistant",
        "Legal precedent analysis",
        "Multi-language support",
        "Compliance verification",
      ],
    },
    {
      title: "Citizens",
      description:
        "Accessible legal guidance and support system for the general public.",
      icon: Users,
      gradient: "bg-gradient-to-br from-violet-500 to-purple-500",
      features: [
        "24/7 legal information access",
        "Simplified legal guidance",
        "Document templates",
        "Rights awareness",
        "Emergency legal support",
      ],
    },
  ];

  return (
    <section className="relative py-20 bg-black" id="services">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Tailored Solutions
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Specialized features designed for different user groups
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-20">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-cyan-500/10 mb-6">
            <Brain className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Transform Your Legal Operations?
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Join the future of legal intelligence with Satark AI's comprehensive
            suite of tools
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 
              text-white font-medium hover:shadow-lg hover:shadow-cyan-500/20 
              transition-all duration-300">
            Schedule a Demo
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
