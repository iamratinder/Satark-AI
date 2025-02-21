import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  Scale,
  ShieldCheck,
  TrendingUp,
  Lightbulb,
  Clock,
  AlertTriangle,
  Siren,
  Zap,
  BookOpen,
  Search,
} from "lucide-react";

const Dashboard = () => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, rotateX: -15 },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const hoverEffect = {
    scale: 1.05,
    rotate: 1,
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 p-8 text-white"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with Animated Gradient */}
      <motion.h1
        className="text-4xl font-extrabold tracking-wide bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
        variants={itemVariants}
        whileHover={{ scale: 1.03 }}
      >
        AI LegalSync Dashboard
      </motion.h1>

      {/* Live Crime Alert Ticker */}
      <motion.div
        className="mt-4 p-3 bg-red-600/20 backdrop-blur-md rounded-xl flex items-center gap-3"
        variants={itemVariants}
        animate={{ x: [0, -10, 0], transition: { repeat: Infinity, duration: 2 } }}
      >
        <Siren className="w-5 h-5 text-red-400 animate-pulse" />
        <p className="text-sm">
          <span className="font-semibold">Live Alert:</span> Surge in ATM scams detected in Bengaluru - 15 cases in 24hrs
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6"
        variants={containerVariants}
      >
        {[
          { icon: <Scale />, title: "Legal Queries", value: "1.2K", color: "from-blue-500 to-blue-700" },
          { icon: <FileText />, title: "Docs Generated", value: "450+", color: "from-green-500 to-teal-700" },
          { icon: <ShieldCheck />, title: "Trends Analyzed", value: "320", color: "from-yellow-500 to-orange-700" },
          { icon: <BarChart3 />, title: "Law Updates", value: "180+", color: "from-red-500 to-pink-700" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            className={`p-6 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center space-x-4 shadow-lg`}
            variants={itemVariants}
            whileHover={hoverEffect}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-3 rounded-full bg-white/20">{stat.icon}</div>
            <div>
              <h2 className="text-lg font-semibold">{stat.title}</h2>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8"
        variants={containerVariants}
      >
        {/* Recent Queries */}
        <motion.div
          className="lg:col-span-2 p-6 bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Recent Legal Queries
            </h2>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <ul className="space-y-4">
            {["Latest updates on cybercrime laws?", "Draft an FIR for corporate fraud", "Case references for IPC 420?"].map(
              (query, idx) => (
                <motion.li
                  key={idx}
                  className="bg-gray-700/50 p-3 rounded-lg flex items-center gap-3 hover:bg-gray-600/70 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span>{query}</span>
                </motion.li>
              )
            )}
          </ul>
        </motion.div>

        {/* AI Suggestions */}
        <motion.div
          className="p-6 bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Lightbulb className="w-5 h-5" /> AI Insights
            </h2>
            <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>
          <ul className="space-y-4">
            {[
              "Monitor rising cyber fraud in Delhi",
              "Update FIR templates for compliance",
              "Optimize doc processing speed",
            ].map((suggestion, idx) => (
              <motion.li
                key={idx}
                className="flex items-center gap-3 text-sm"
                whileHover={{ scale: 1.02 }}
              >
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="mt-8 p-6 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl flex justify-between items-center"
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Search className="w-5 h-5" /> Quick Actions
        </h2>
        <div className="flex space-x-4">
          <motion.button
            className="bg-white text-indigo-600 px-5 py-2 rounded-full font-semibold shadow-md"
            whileHover={{ scale: 1.1, boxShadow: "0 5px 15px rgba(255,255,255,0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            Generate FIR
          </motion.button>
          <motion.button
            className="bg-white text-indigo-600 px-5 py-2 rounded-full font-semibold shadow-md"
            whileHover={{ scale: 1.1, boxShadow: "0 5px 15px rgba(255,255,255,0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            Analyze Trends
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;