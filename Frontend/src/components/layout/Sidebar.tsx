import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Navigation,
  BarChart3,
  FileSpreadsheet,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'System overview & metrics',
    },
    {
      to: '/planner',
      label: 'Route Planner',
      icon: Navigation,
      description: 'Trip optimization engine',
    },
    {
      to: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Pareto & SHAP explainability',
    },
    {
      to: '/reports',
      label: 'Carbon Reports',
      icon: FileSpreadsheet,
      description: 'Audit & GHG documentation',
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#101e1a] border-r border-forest-750/70 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-forest-750/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a5c47] to-[#2f8a9d] flex items-center justify-center shadow-lg shadow-[#1a5c47]/20 flex-shrink-0">
          <Leaf className="w-5 h-5 text-forest-100" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">
                GreenRoute
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2f8a9d]/20 text-[#42a7bc] border border-[#2f8a9d]/40">
                AI
              </span>
            </div>
            <p className="text-[11px] text-forest-300 font-medium truncate">
              Climate Logistics Engine
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-[#1a5c47] text-white shadow-md shadow-[#1a5c47]/30 border border-[#267b5e]/60'
                    : 'text-forest-300 hover:text-white hover:bg-forest-850/80 border border-transparent'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-forest-300 group-hover:text-forest-200'
                    }`}
                  />
                  {!collapsed && (
                    <div className="flex flex-col truncate">
                      <span className="truncate leading-tight">{item.label}</span>
                      <span
                        className={`text-[10px] truncate ${
                          isActive ? 'text-forest-100/80' : 'text-forest-400'
                        }`}
                      >
                        {item.description}
                      </span>
                    </div>
                  )}

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#2f8a9d] rounded-r" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Model Spec Badge */}
      {!collapsed && (
        <div className="mx-3 my-3 p-3 rounded-xl bg-forest-850/70 border border-forest-750/50 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-forest-200 font-semibold">
            <Zap className="w-3.5 h-3.5 text-[#d8993a]" />
            <span>Physics-ML Hybrid</span>
          </div>
          <p className="text-[11px] text-forest-300 leading-relaxed">
            Gradient elevation profiles & live climate risk assessment.
          </p>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-forest-750/50 flex justify-end">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg bg-forest-850 hover:bg-forest-800 text-forest-300 hover:text-white border border-forest-750 transition"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};

