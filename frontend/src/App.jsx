
import { useEffect, useState } from "react";
import axiosClient from "./api/axiosClient";

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const { data } = await axiosClient.get("/health");
        setHealth(data);
      } catch (err) {
        setError(err.message);
      }
    };

    checkHealth();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-white shadow-2xl">

        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Cyber<span className="text-cyan-400">Shield</span>
          </h1>
          <p className="mt-2 text-slate-400">
            Security Event Analysis & Threat Monitoring System
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-slate-800 p-5">
            <p className="text-sm text-slate-400">Backend API</p>
            <p className="mt-2 font-semibold">
              {health ? "Connected" : error ? "Disconnected" : "Checking..."}
            </p>
          </div>

          <div className="rounded-xl bg-slate-800 p-5">
            <p className="text-sm text-slate-400">MongoDB</p>
            <p className="mt-2 font-semibold">
              {health?.database || (error ? "Unavailable" : "Checking...")}
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {health && (
            <p className="text-sm text-emerald-400">
              ✓ {health.message}
            </p>
          )}
        </div>

        <div className="mt-8 border-t border-slate-800 pt-5 text-xs text-slate-500">
          CyberShield · Development Environment · Phase 1
        </div>
      </div>
    </main>
  );
}

export default App;
