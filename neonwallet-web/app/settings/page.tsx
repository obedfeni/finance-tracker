'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { exportToCSV, exportToJSON } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, pin, setPin, setAuthenticated, transactions } = useStore();
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !isAuthenticated) router.replace('/'); }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  const handleChangePin = () => {
    if (newPin.length !== 4 || isNaN(Number(newPin))) { setPinMsg('PIN must be 4 digits'); return; }
    if (newPin !== confirmPin) { setPinMsg('PINs do not match'); return; }
    setPin(newPin);
    setNewPin(''); setConfirmPin('');
    setPinMsg('✓ PIN updated successfully');
    setTimeout(() => setPinMsg(''), 3000);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    router.push('/');
  };

  const handleClearData = () => {
    if (confirm('This will delete ALL transactions, goals, and budgets. This cannot be undone. Continue?')) {
      if (confirm('Are you absolutely sure?')) {
        localStorage.removeItem('neonwallet-storage');
        window.location.reload();
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-dark-900 grid-bg">
      <Sidebar />
      <main className="flex-1 md:ml-56 p-4 md:p-8 pb-24 md:pb-8 max-w-2xl">
        <div className="mb-8 animate-slide-up">
          <p className="text-white/40 text-sm tracking-wider uppercase">App</p>
          <h1 className="font-display text-2xl font-bold text-white mt-1">SETTINGS</h1>
        </div>

        <div className="space-y-4 animate-slide-up">
          {/* Security */}
          <div className="glass-card p-5">
            <p className="section-title">Security</p>
            <div className="space-y-3">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">New PIN (4 digits)</label>
                <input className="input-field font-mono tracking-widest" type="password" maxLength={4} placeholder="••••"
                  value={newPin} onChange={(e) => setNewPin(e.target.value)} />
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Confirm PIN</label>
                <input className="input-field font-mono tracking-widest" type="password" maxLength={4} placeholder="••••"
                  value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} />
              </div>
              {pinMsg && (
                <p className={`text-sm ${pinMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{pinMsg}</p>
              )}
              <button onClick={handleChangePin} className="neon-btn w-full py-3 text-sm">Update PIN</button>
            </div>
          </div>

          {/* Data */}
          <div className="glass-card p-5">
            <p className="section-title">Data & Export</p>
            <div className="space-y-3">
              <p className="text-white/50 text-sm">Total transactions: <span className="text-white font-mono">{transactions.length}</span></p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => exportToCSV(transactions)} className="neon-btn py-3 text-sm">Export CSV</button>
                <button onClick={() => exportToJSON(transactions)} className="neon-btn py-3 text-sm">Export JSON</button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="glass-card p-5">
            <p className="section-title">About</p>
            <div className="space-y-2 text-sm text-white/50">
              <div className="flex justify-between">
                <span>App Name</span>
                <span className="text-white font-display tracking-wide">NEONWALLET</span>
              </div>
              <div className="flex justify-between">
                <span>Version</span>
                <span className="text-neon-blue font-mono">5.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Currency</span>
                <span className="text-white">GHS (₵)</span>
              </div>
              <div className="flex justify-between">
                <span>Storage</span>
                <span className="text-white">Local (browser)</span>
              </div>
            </div>
          </div>

          {/* iPhone Shortcut */}
          <div className="glass-card p-5 border-amber-400/10">
            <p className="section-title">iPhone Shortcut Setup</p>
            <p className="text-white/50 text-sm mb-4">
              Set up Apple Shortcuts for one-tap MoMo SMS import. After deploying to Vercel, use your app URL as the endpoint.
            </p>
            <div className="bg-dark-800 rounded-xl p-4 font-mono text-xs text-neon-blue/70 space-y-1">
              <div className="text-white/40">Shortcut steps:</div>
              <div>1. Receive Input from Share Sheet (text)</div>
              <div>2. Get contents of URL: POST https://your-app.vercel.app/api/sms-import</div>
              <div>3. Body: {`{"sms": "Shortcut Input"}`}</div>
              <div>4. Show notification: "Imported!"</div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="glass-card p-5 border border-red-500/10">
            <p className="text-xs font-display tracking-widest text-red-400/60 uppercase mb-4">Danger Zone</p>
            <div className="flex gap-3">
              <button onClick={handleLogout} className="flex-1 danger-btn py-3 text-sm">Lock App</button>
              <button onClick={handleClearData} className="flex-1 danger-btn py-3 text-sm">Clear All Data</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
