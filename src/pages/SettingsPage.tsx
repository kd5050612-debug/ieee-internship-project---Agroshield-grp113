import { useEffect, useState } from 'react';
import { Pencil, Download, RefreshCw, Shield, Bell, TrendingUp, Zap } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';


interface Props {
  onNavigate: (page: string) => void;
}

interface ToggleProps {
  on: boolean;
  onChange: () => void;
}


function Toggle({ on, onChange }: ToggleProps) {
  return (
    <button
      onClick={onChange}
      className={`w-10 h-5.5 rounded-full relative transition-colors flex-shrink-0 ${on ? 'bg-neon-green' : 'bg-white/15'}`}
      style={{ height: '22px', width: '40px' }}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] transition-transform shadow ${on ? 'translate-x-[19px]' : 'translate-x-[3px]'}`} />
    </button>
  );
}

export default function SettingsPage({ onNavigate }: Props) {
  const { user, updateProfile } = useAuth();

  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [globalMarket, setGlobalMarket] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFullName, setProfileFullName] = useState('');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    setProfileFullName(user.full_name ?? '');
    setProfileAvatarUrl(user.avatar_url ?? '');
  }, [user]);

  const [pwdMode, setPwdMode] = useState(false);
  const [pwdBusy, setPwdBusy] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  const recentActivity = [
    { icon: '🔧', title: 'Scanner Node Calibration', sub: 'Completed 3 hours ago · Sector 7G' },
    { icon: '🔒', title: '3FA Method Updated', sub: 'Security key refreshed · 1 day ago' },
    { icon: '🌿', title: 'New Scan Initiated', sub: 'Sector A-1 · Hyper-Spectral 3D · 2 days ago' },
    { icon: '📊', title: 'Yield Report Generated', sub: 'Q4 prediction +18% · 3 days ago' },
  ];

  return (
    <div className="flex flex-col h-screen bg-forest-950 overflow-hidden">
      <AppHeader activePage="dashboard" onNavigate={onNavigate} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage="settings" onNavigate={onNavigate} showScanBtn />

        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Profile card */}
          <div className="card-dark rounded-xl p-5 flex items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-20 h-20 rounded-full overflow-hidden border-2 border-neon-green/50"
                style={{ boxShadow: '0 0 20px rgba(57,211,83,0.3)' }}
              >
                <img
                  src={profileAvatarUrl || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=160'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0.5 right-0.5 w-5 h-5 bg-neon-green rounded-full border-2 border-forest-950 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-forest-950 rounded-full" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 flex-wrap">
                <div>
                  <h2 className="text-2xl font-bold text-white leading-tight">
                    {profileFullName ? profileFullName.split(' ')[0] : '—'}
                  </h2>
                  <h2 className="text-2xl font-bold text-white leading-tight">
                    {profileFullName ? profileFullName.split(' ').slice(1).join(' ') : ''}
                  </h2>
                  <p className="text-xs text-white/45 mt-0.5">{user?.email ?? '—'}</p>
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 bg-neon-green/10 border border-neon-green/30 rounded-full px-3 py-1">
                    <span className="status-dot" style={{ width: '5px', height: '5px' }} />
                    <span className="text-[9px] font-mono text-neon-green uppercase tracking-widest">Master Cultivator · Sector 7C</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-3">
                <div>
                  <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Farm ID</p>
                  <p className="text-xs font-mono text-neon-green mt-0.5">AGRI-7704-B</p>
                </div>
                <div>
                  <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Account Tier</p>
                  <p className="text-xs text-white font-semibold mt-0.5">Enterprise Elite</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 flex-shrink-0">

              <button
                onClick={() => {
                  setEditMode(true);
                  setPwdMode(false);
                }}
                className="neon-btn px-4 py-2 rounded-lg flex items-center gap-2 text-xs whitespace-nowrap"
              >
                <Pencil size={12} /> Edit Profile
              </button>
              <button
                className="outline-btn px-4 py-2 rounded-lg flex items-center gap-2 text-xs whitespace-nowrap"
                onClick={() => {
                  // TODO: wire to farm export endpoint
                  // Placeholder for now
                  window.alert('Export Farm Data is not wired yet.');
                }}
              >
                <Download size={12} className="text-neon-green" /> Export Farm Data
              </button>

              <button
                onClick={() => onNavigate('pricing')}
                className="px-4 py-2 rounded-lg flex items-center gap-2 text-xs whitespace-nowrap transition-all"
                style={{ background: 'rgba(57,211,83,0.07)', border: '1px solid rgba(57,211,83,0.3)', color: '#39d353' }}
              >
                <Zap size={12} /> View Plans
              </button>
            </div>
          </div>

          {/* Edit Profile / Change Password modal */}
          {(editMode || pwdMode) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-lg card-dark rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">
                    {editMode ? 'Edit Profile' : 'Change Password'}
                  </h3>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setPwdMode(false);
                    }}
                    className="outline-btn px-3 py-1.5 rounded-lg text-[10px] font-mono whitespace-nowrap"
                  >
                    Close
                  </button>
                </div>

                {editMode && (
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-xs text-white/70 mb-1">Full name</p>
                      <input
                        value={profileFullName}
                        onChange={(e) => setProfileFullName(e.target.value)}
                        className="w-full bg-forest-800/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 outline-none focus:border-neon-green/30 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-white/70 mb-1">Upload profile image</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full bg-forest-800/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 outline-none focus:border-neon-green/30 transition-colors"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const localUrl = URL.createObjectURL(file);
                          setProfileAvatarUrl(localUrl);
                        }}
                      />


                      <p className="text-[10px] text-white/35 mt-1">
                        Image preview and save stay local on this device.
                      </p>
                    </div>

                    <button
                      disabled={savingProfile}
                      onClick={async () => {
                        setSavingProfile(true);
                        try {
                          await updateProfile({
                            full_name: profileFullName,
                            avatar_url: profileAvatarUrl || null,
                          });
                          setEditMode(false);
                        } catch (e: any) {
                          window.alert(e?.message ?? 'Failed to update profile');
                        } finally {
                          setSavingProfile(false);
                        }
                      }}
                      className="neon-btn w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-xs whitespace-nowrap"
                    >
                      {savingProfile ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}

                {pwdMode && (
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-xs text-white/70 mb-1">Local password update</p>
                      <p className="text-[10px] text-white/35 mb-2">
                        This demo keeps the change in the current browser session only.
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-white/70 mb-1">Email</p>
                      <input
                        value={user?.email ?? ''}
                        readOnly
                        className="w-full bg-forest-800/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 outline-none focus:border-neon-green/30 transition-colors"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-white/70 mb-1">New password</p>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-forest-800/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 outline-none focus:border-neon-green/30 transition-colors"
                        placeholder="At least 8 chars + rules"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-white/70 mb-1">Confirm new password</p>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-forest-800/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 outline-none focus:border-neon-green/30 transition-colors"
                        placeholder="Repeat new password"
                      />
                    </div>

                    <button
                      disabled={pwdBusy}
                      onClick={async () => {
                        setPwdBusy(true);
                        try {
                          if (!newPassword || newPassword.length < 4) {
                            throw new Error('Use at least 4 characters.');
                          }
                          if (newPassword !== confirmPassword) {
                            throw new Error('Passwords do not match.');
                          }
                          setPwdMode(false);
                          setNewPassword('');
                          setConfirmPassword('');
                          window.alert('Password updated locally.');
                        } catch (e: any) {
                          window.alert(e?.message ?? 'Failed to update password');
                        } finally {
                          setPwdBusy(false);
                        }
                      }}
                      className="neon-btn w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-xs whitespace-nowrap"
                    >
                      {pwdBusy ? 'Saving...' : 'Save Password'}
                    </button>

                    <p className="text-[10px] text-white/35">
                      Saved locally in this browser.
                    </p>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Left */}
            <div className="flex flex-col gap-4">
              {/* Farm Stats */}
              <div className="card-dark rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Farm Stats</h3>
                  <TrendingUp size={16} className="text-neon-green/50" />
                </div>

                <p className="text-[9px] font-mono text-white/35 uppercase tracking-widest">Total Scans</p>
                <p className="text-4xl font-bold text-white mt-0.5 mb-3">1,240</p>

                <p className="text-[9px] font-mono text-white/35 uppercase tracking-widest mb-1.5">Overall Health Score</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 progress-bar">
                    <div className="progress-fill" style={{ width: '94%' }} />
                  </div>
                  <span className="text-xs font-bold text-neon-green">94%</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="card-darker rounded-lg p-3">
                    <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-1">Active Drones</p>
                    <p className="text-xl font-bold text-white">12</p>
                  </div>
                  <div className="card-darker rounded-lg p-3">
                    <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-1">Training</p>
                    <p className="text-xl font-bold text-neon-green">+18%</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card-dark rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
                <div className="flex flex-col gap-3">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-forest-800/60 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs text-white/80 font-medium leading-tight">{item.title}</p>
                        <p className="text-[10px] text-white/35 mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Account Settings */}
            <div className="card-dark rounded-xl p-4">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-7 h-7 bg-neon-green/10 border border-neon-green/25 rounded-lg flex items-center justify-center">
                  <Shield size={13} className="text-neon-green" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Account Settings</h3>
                  <p className="text-[10px] text-white/35">Manage your security and platform behavior</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-0">
                {/* Change Password */}
                <div className="flex items-center justify-between py-3.5 border-b border-white/5">
                  <div className="flex items-start gap-3">
                    <RefreshCw size={15} className="text-white/40 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white/80 font-medium">Change Password</p>
                      <p className="text-[10px] text-white/35 mt-0.5">Update your security credentials regularly</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPwdMode(true);
                      setEditMode(false);
                    }}
                    className="outline-btn px-3 py-1.5 rounded-lg text-[10px] font-mono whitespace-nowrap ml-3"
                  >
                    Update
                  </button>
                </div>


                {/* 2FA */}
                <div className="flex items-center justify-between py-3.5 border-b border-white/5">
                  <div className="flex items-start gap-3">
                    <Shield size={15} className="text-white/40 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-white/80 font-medium">Two-Factor Authentication</p>
                        <span className="text-[7px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/25 rounded px-1.5 py-0.5 uppercase tracking-widest">Action</span>
                      </div>
                      <p className="text-[10px] text-white/35 mt-0.5">Biometric and hardware key verification</p>
                    </div>
                  </div>
                  <button className="outline-btn px-3 py-1.5 rounded-lg text-[10px] font-mono whitespace-nowrap ml-3">Configure</button>
                </div>

                {/* Notification Preferences */}
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell size={14} className="text-white/40" />
                    <p className="text-xs text-white/80 font-medium">Notification Preferences</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: 'Critical Crop Alerts', value: criticalAlerts, set: () => setCriticalAlerts(v => !v) },
                      { label: 'Weekly Yield Reports', value: weeklyReports, set: () => setWeeklyReports(v => !v) },
                      { label: 'Global Marketplace', value: globalMarket, set: () => setGlobalMarket(v => !v) },
                    ].map(({ label, value, set }) => (
                      <div key={label} className="flex items-center justify-between card-darker rounded-lg px-3 py-2.5">
                        <p className="text-xs text-white/65">{label}</p>
                        <Toggle on={value} onChange={set} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan & Billing */}
                <div className="pt-4 border-t border-white/5 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-white/40" />
                      <p className="text-xs text-white/80 font-medium">Plan &amp; Billing</p>
                    </div>
                  </div>
                  <div className="card-darker rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/80 font-semibold">Enterprise Elite</p>
                      <p className="text-[10px] text-white/35 mt-0.5">Unlimited satellite scans · Fleet AI</p>
                    </div>
                    <button
                      onClick={() => onNavigate('pricing')}
                      className="text-[10px] font-mono text-neon-green border border-neon-green/30 rounded-lg px-3 py-1.5 hover:bg-neon-green/10 transition-colors whitespace-nowrap"
                    >
                      View Plans
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
