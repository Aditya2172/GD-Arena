import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, CheckCircle2, Server, Terminal } from 'lucide-react';
import { api } from '../../services/api';

export const ConnectivityBanner: React.FC = () => {
  const [isBackendDown, setIsBackendDown] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [justRecovered, setJustRecovered] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const checkConnectivity = async () => {
    try {
      setIsChecking(true);
      await api.checkHealth();
      if (isBackendDown) {
        setIsBackendDown(false);
        setJustRecovered(true);
        setTimeout(() => setJustRecovered(false), 4000);
      }
      setRetryCount(0);
    } catch (err) {
      setIsBackendDown(true);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial health check
    checkConnectivity();

    // Heartbeat: 15s when healthy, 8s when backend is down
    const intervalTime = isBackendDown ? 8000 : 20000;
    const interval = setInterval(checkConnectivity, intervalTime);

    return () => clearInterval(interval);
  }, [isBackendDown]);

  if (justRecovered) {
    return (
      <div className="bg-emerald-600/90 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all">
        <CheckCircle2 className="w-4 h-4" />
        <span>Connected to GD Arena Backend API (http://localhost:5000). All systems operational!</span>
      </div>
    );
  }

  if (!isBackendDown) {
    return null;
  }

  return (
    <div className="bg-rose-900/90 border-b border-rose-700 text-rose-100 px-4 py-2.5 text-xs font-medium shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>Backend Unreachable:</strong> Unable to connect to backend server at <code className="bg-rose-950 px-1.5 py-0.5 rounded font-mono text-rose-300">http://localhost:5000/api/health</code>.
            Launch the backend by running <code className="bg-rose-950 px-1.5 py-0.5 rounded font-mono text-rose-300">npm run dev</code> or double-clicking <code className="bg-rose-950 px-1.5 py-0.5 rounded font-mono text-rose-300">start.bat</code>.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={checkConnectivity}
            disabled={isChecking}
            className="px-3 py-1 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking...' : 'Retry Connection'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
