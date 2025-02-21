import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  Scale,
  ShieldCheck,
  TrendingUp, // New Icons
  Lightbulb,
  Clock,
  AlertTriangle,
} from "lucide-react";

const Dashboard = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      className="space-y-6 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      {/* Header */}
      <motion.h1
        className="text-3xl font-extrabold text-gray-900 tracking-tight"
        variants={itemVariants}>
        AI Legal Assistant Dashboard
      </motion.h1>

      {/* Stat Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}>
        {[
          {
            icon: <Scale className="text-blue-500" />,
            title: "Legal Queries Processed",
            value: "1.2K",
          },
          {
            icon: <FileText className="text-green-500" />,
            title: "Documents Generated",
            value: "450+",
          },
          {
            icon: <ShieldCheck className="text-yellow-500" />,
            title: "Crime Trends Analyzed",
            value: "320",
          },
          {
            icon: <BarChart3 className="text-red-500" />,
            title: "Law Updates Fetched",
            value: "180+",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="p-5 bg-white shadow-lg rounded-2xl flex items-center space-x-4 hover:shadow-xl transition-shadow duration-300"
            variants={itemVariants}>
            <div className="p-3 rounded-full bg-gray-100">{stat.icon}</div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {stat.title}
              </h2>
              <p className="text-gray-500 text-sm">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity & AI Suggestions */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}>
        <motion.div
          className="p-5 bg-white shadow-md rounded-2xl"
          variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Legal Queries
            </h2>
            <Clock className="w-4 h-4 text-gray-500" />
          </div>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" /> "Latest updates
              on cybercrime laws?"
            </li>
            <li className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" /> "Draft an FIR for
              corporate fraud"
            </li>
            <li className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-yellow-500" /> "Case references
              for IPC 420?"
            </li>
          </ul>
        </motion.div>

        <motion.div
          className="p-5 bg-white shadow-md rounded-2xl"
          variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              AI Legal Suggestions
            </h2>
            <Lightbulb className="w-4 h-4 text-gray-500" />
          </div>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> "Increase
              monitoring for rising cyber fraud cases in Delhi"
            </li>
            <li className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" /> "Recommended
              amendment updates for FIR drafts"
            </li>
            <li className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" /> "Optimize
              document templates for quicker processing"
            </li>
          </ul>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md rounded-2xl flex justify-between items-center"
        variants={itemVariants}>
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="flex space-x-4">
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg shadow-md hover:bg-blue-50 transition-colors duration-200">
            Generate FIR
          </button>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg shadow-md hover:bg-blue-50 transition-colors duration-200">
            Analyze Crime Trends
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
