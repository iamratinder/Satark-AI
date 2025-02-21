import React from "react";
import {
  FileText,
  Scale,
  BookOpen,
  AlertCircle,
  Clock,
  ChevronRight,
  Siren,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const BackgroundEffect = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute w-screen h-screen">
      <div className="absolute w-96 h-96 -top-48 -left-48 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute w-96 h-96 top-1/3 right-1/4 bg-violet-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
    </div>
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    />
  </div>
);

const StatCard = ({ icon: Icon, title, value, subtext }) => (
  <div className="bg-black/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 hover:bg-cyan-500/5 transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        </div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        {subtext && <p className="text-sm text-gray-400">{subtext}</p>}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const stats = [
    {
      icon: MessageSquare,
      title: "AI Consultations",
      value: "2,456",
      subtext: "+14.5% this month",
    },
    {
      icon: FileText,
      title: "Documents Generated",
      value: "856",
      subtext: "+23.4% this month",
    },
    {
      icon: Scale,
      title: "Cases Analyzed",
      value: "1,289",
      subtext: "+18.2% this month",
    },
    {
      icon: BookOpen,
      title: "Legal References",
      value: "15K+",
      subtext: "Across all domains",
    },
  ];

  const recentActivities = [
    {
      type: "Query",
      text: "Legal implications of AI-generated content?",
      time: "5 minutes ago",
      icon: MessageSquare,
    },
    {
      type: "Document",
      text: "Generated legal notice for trademark violation",
      time: "23 minutes ago",
      icon: FileText,
    },
    {
      type: "Analysis",
      text: "Analyzed precedent cases for cybercrime",
      time: "1 hour ago",
      icon: Scale,
    },
  ];

  const alertUpdates = [
    {
      title: "Legal Framework Update",
      description: "New cybersecurity regulations effective from next month",
      severity: "info",
    },
    {
      title: "High Priority Alert",
      description: "Significant amendments to data protection laws",
      severity: "warning",
    },
    {
      title: "System Update",
      description: "AI model enhancement for better legal analysis",
      severity: "success",
    },
  ];

  return (
    <div className="relative min-h-full">
      <BackgroundEffect />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 bg-clip-text text-transparent">
              Command Center
            </span>
          </h1>
          <p className="text-gray-400 mt-2">
            Real-time insights and analytics for legal operations
          </p>
        </div>

        {/* Priority Alert */}
        <div className="mb-8 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="relative">
            <Siren className="w-5 h-5 text-red-400" />
            <div className="absolute inset-0 bg-red-400/30 rounded-full animate-ping" />
          </div>
          <div>
            <h3 className="font-medium text-red-400">Priority Alert</h3>
            <p className="text-sm text-gray-300">
              New Supreme Court judgment affecting digital evidence
              admissibility
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-black/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-cyan-500/20">
              <h2 className="text-xl font-medium text-cyan-400 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 group hover:bg-cyan-500/5 p-4 rounded-xl transition-all duration-300">
                    <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300 group-hover:text-cyan-400 transition-colors">
                        {activity.text}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Updates & Alerts */}
          <div className="bg-black/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-cyan-500/20">
              <h2 className="text-xl font-medium text-cyan-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Updates & Alerts
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {alertUpdates.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${
                      alert.severity === "warning"
                        ? "bg-yellow-500/10 border-yellow-500/20"
                        : alert.severity === "success"
                        ? "bg-green-500/10 border-green-500/20"
                        : "bg-cyan-500/10 border-cyan-500/20"
                    }`}>
                    <h3
                      className={`font-medium ${
                        alert.severity === "warning"
                          ? "text-yellow-400"
                          : alert.severity === "success"
                          ? "text-green-400"
                          : "text-cyan-400"
                      }`}>
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {alert.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-cyan-400">Quick Actions</h2>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/dashboard/generate")}
                className="px-6 cursor-pointer py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white font-medium flex items-center gap-2 hover:brightness-110 transition-all">
                Generate Document
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/dashboard/analysis")}
                className="px-6 cursor-pointer py-2 bg-black/50 border border-cyan-500/20 rounded-lg text-cyan-400 font-medium flex items-center gap-2 hover:bg-cyan-500/10 transition-all">
                Start Analysis
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
