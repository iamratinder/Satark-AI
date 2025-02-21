import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NavLink,
  Outlet,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  BookOpen,
  X,
  Home,
  FileText,
  MessageSquare,
  BarChart2,
  LogOut,
  Shield,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
  Scale,
  Gavel,
  Brain,
} from "lucide-react";

const MOBILE_BREAKPOINT = 1024;

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= MOBILE_BREAKPOINT);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const menuItems = [
    { icon: Home, label: "Command Center", path: "/dashboard" },
    { icon: BookOpen, label: "Legal Codex", path: "/dashboard/knowledge" },
    { icon: FileText, label: "Doc Forge", path: "/dashboard/generate" },
    { icon: MessageSquare, label: "AI Counsel", path: "/dashboard/qa" },
    { icon: BarChart2, label: "Crime Matrix", path: "/dashboard/analysis" },
  ];

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const sidebarVariants = {
    open: { 
      x: 0, 
      width: "18rem", 
      transition: { type: "spring", stiffness: 120, damping: 15 }
    },
    closed: { 
      x: 0, 
      width: "5rem", 
      transition: { type: "spring", stiffness: 120, damping: 15 }
    },
  };

  const Navbar = () => (
    <motion.header
      className="sticky top-0 z-20 bg-gradient-to-r from-indigo-900 via-gray-900 to-indigo-900 shadow-xl border-b border-indigo-800/30"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-indigo-800/50 text-indigo-200 hover:bg-indigo-700/70 transition-colors"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
          >
            {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </motion.button>
          <motion.div
            className="text-xl font-semibold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {menuItems.find((item) => item.path === location.pathname)?.label || "Command Center"}
          </motion.div>
        </div>

        <motion.div
          className="flex items-center gap-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="flex items-center gap-3 px-4 py-2 bg-indigo-800/30 rounded-xl border border-indigo-700/50">
            <motion.div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center relative overflow-hidden"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-900/30"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <User className="w-5 h-5 text-white relative z-10" />
            </motion.div>
            <div className="text-sm text-indigo-100">
              <p className="font-medium">
                {user ? `${user.fullname.firstname} ${user.fullname.lastname}` : "User"}
              </p>
              <p className="text-indigo-300/80 text-xs">{user?.email || "Loading..."}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );

  const Sidebar = () => (
    <motion.aside
      className="fixed top-0 left-0 z-30 h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-900 shadow-2xl border-r border-indigo-800/20 overflow-hidden"
      variants={sidebarVariants}
      initial="open"
      animate={isSidebarOpen ? "open" : "closed"}
    >
      <div className="p-6 flex items-center gap-3 border-b border-indigo-800/30 relative">
        <motion.div
          className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-xl flex items-center justify-center relative"
          animate={{ 
            scale: [1, 1.05, 1],
            boxShadow: ["0 0 10px rgba(59, 130, 246, 0)", "0 0 20px rgba(59, 130, 246, 0.3)", "0 0 10px rgba(59, 130, 246, 0)"]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Scale className="w-6 h-6 text-white" />
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/20 to-indigo-600/20"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        {isSidebarOpen && (
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Satark AI
          </Link>
        )}
      </div>

      <nav className="p-4 flex-1">
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              end={item.path === "/dashboard"}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative overflow-hidden ${
                  isActive
                    ? "bg-indigo-700/80 text-white shadow-lg border border-indigo-600/50"
                    : "text-indigo-200 hover:bg-indigo-800/30"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative z-10"
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="font-medium relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-cyan-500/20"
                      layoutId="activeBackground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <motion.div
        className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-800/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-indigo-200 hover:bg-red-900/30 hover:text-red-200 transition-all relative"
        >
          <motion.div whileHover={{ x: 5 }}>
            <LogOut className="w-5 h-5" />
          </motion.div>
          {isSidebarOpen && (
            <span className="font-medium">Sign Out</span>
          )}
        </button>
      </motion.div>
    </motion.aside>
  );

  const CommandPalette = () => (
    <motion.div
      className="fixed bottom-8 right-8 z-40"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
    >
      <motion.button
        className="p-4 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-full shadow-xl border border-cyan-400/30 relative overflow-hidden"
        whileHover={{ 
          scale: 1.15, 
          boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" 
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-transparent to-cyan-400/20"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <Search className="w-6 h-6 text-white relative z-10" />
      </motion.button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white flex overflow-hidden">
      <Sidebar />

      <motion.div
        className="flex-1 flex flex-col"
        animate={{ marginLeft: isSidebarOpen && !isMobile ? "18rem" : "5rem" }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
      >
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto relative">
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-indigo-600/10" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10"
          >
            <Outlet />
          </motion.div>
        </main>

        <CommandPalette />

        <AnimatePresence>
          {isMobile && isSidebarOpen && (
            <motion.div
              className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Layout;