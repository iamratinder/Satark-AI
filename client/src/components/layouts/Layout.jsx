import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import {
  Menu,
  Book,
  X,
  Home,
  FileText,
  MessageCircle,
  BarChart2,
  LogOut,
  Shield,
  Bell,
  User,
} from "lucide-react";

const MOBILE_BREAKPOINT = 1024;

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(
    window.innerWidth >= MOBILE_BREAKPOINT
  );
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT
  );
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      icon: Home,
      label: "Command Center",
      path: "/dashboard",
    },
    {
      icon: Book,
      label: "Legal Database",
      path: "/dashboard/knowledge",
    },
    {
      icon: FileText,
      label: "Document Generator",
      path: "/dashboard/generate",
    },
    {
      icon: MessageCircle,
      label: "Legal Consultation",
      path: "/dashboard/qa",
    },
    {
      icon: BarChart2,
      label: "Analytics Hub",
      path: "/dashboard/analysis",
    },
  ];

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Navbar Component
  const Navbar = () => (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg lg:hidden hover:bg-gray-100 transition-colors">
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {menuItems.find((item) => item.path === location.pathname)
                  ?.label || "Command Center"}
              </h1>
              <p className="text-sm text-gray-600 hidden md:block">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-700" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">Officer John Doe</p>
                <p className="text-gray-600">Badge #12345</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  // Sidebar Component
  const Sidebar = () => {
    const sidebarClasses = `
      fixed top-0 left-0 z-30 h-screen w-64 bg-gray-900
      transform transition-transform duration-200 ease-in-out
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    `;

    return (
      <aside className={sidebarClasses}>
        <div className="flex items-center gap-2 p-6 border-b border-gray-800">
          <Shield className="w-8 h-8 text-blue-500" />
          <Link to="/" className="text-lg font-bold text-white">
            Satark AI
          </Link>
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="ml-auto p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="p-4">
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                  }
                `}>
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    );
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Backdrop for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={`flex-1 min-h-screen flex flex-col transition-all duration-200
          ${isSidebarOpen && !isMobile ? "ml-64" : ""}`}>
        <Navbar />
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
