import React, { useState } from 'react';
import { 
  Mic, 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  BarChart3, 
  Activity,
  Target,
  GitCompare,
  LogOut, 
  LogIn, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentTab?: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab = 'landing', onNavigate }) => {
  const { user, logout, isDemoUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'New GD', icon: PlusCircle },
    { id: 'speech-lab', label: 'Speech Lab', icon: Activity },
    { id: 'drills', label: 'Drills', icon: Target },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Progress', icon: BarChart3 },
  ];

  const handleNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-navy-950/80 backdrop-blur-md border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => handleNav(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center shadow-lg shadow-accent-blue/20 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                GD <span className="bg-gradient-to-r from-accent-blue to-accent-violet bg-clip-text text-transparent">ARENA</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                AI Voice Discussion Prep
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleNav(id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === id 
                      ? 'bg-navy-800 text-accent-blue font-semibold border border-navy-700 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          )}

          {/* User Auth controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {isDemoUser && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    <Sparkles className="w-3 h-3" /> Demo Mode
                  </span>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-850 border border-navy-800">
                  <div className="w-6 h-6 rounded-full bg-accent-blue/20 text-accent-blue text-xs font-semibold flex items-center justify-center">
                    {user.displayName?.[0] || 'C'}
                  </div>
                  <span className="text-sm font-medium text-slate-200">
                    {user.displayName || 'Candidate'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('auth')}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('auth')}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-accent-blue to-accent-violet hover:opacity-95 text-white shadow-md shadow-accent-blue/20 transition-all"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-navy-800 bg-navy-950 px-4 pt-2 pb-4 space-y-1">
          {user ? (
            <>
              {navLinks.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleNav(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    currentTab === id ? 'bg-navy-800 text-accent-blue' : 'text-slate-300 hover:bg-navy-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
              <div className="pt-3 border-t border-navy-800 flex items-center justify-between">
                <span className="text-sm text-slate-400">Signed in as {user.displayName}</span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm text-rose-400"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => handleNav('auth')}
                className="w-full py-2.5 rounded-lg bg-accent-blue text-white text-sm font-medium"
              >
                Log In / Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
