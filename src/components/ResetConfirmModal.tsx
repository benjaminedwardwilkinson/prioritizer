import React, { useState } from 'react';
import { X, AlertOctagon, RotateCcw, User, Check, ShieldAlert, Volume2, VolumeX, Mail, Download, Sliders } from 'lucide-react';
import { sound } from '../services/sound';
import { StorageService } from '../services/storage';
import { UserProfile } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
  onFullReset: () => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
  onOpenEmail: () => void;
}

const AVATAR_OPTIONS = ['🧭', '🚀', '⚡', '🌌', '🖖', '🛸', '🔮', '🛡️', '🌿', '💎'];

export const ResetConfirmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userProfile,
  onProfileUpdated,
  onFullReset,
  isSoundMuted,
  onToggleSound,
  onOpenEmail,
}) => {
  const [nameInput, setNameInput] = useState(userProfile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar);
  const [isConfirmingPurge, setIsConfirmingPurge] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const updated: UserProfile = {
      ...userProfile,
      name: nameInput.trim(),
      avatar: selectedAvatar,
    };
    StorageService.saveUserProfile(updated);
    onProfileUpdated(updated);
    sound.playLcarsConfirm();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExecutePurge = () => {
    sound.playBuzz();
    StorageService.resetAllData();
    onFullReset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-black border-2 border-rose-500 rounded-2xl shadow-2xl shadow-rose-500/20 overflow-hidden my-4 sm:my-8 font-sans">
        
        {/* Header */}
        <div className="bg-slate-950 border-b-2 border-rose-500 p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-12 sm:w-16 bg-rose-500 rounded-l-full flex items-center justify-center text-black font-black text-xs sm:text-sm font-mono tracking-tighter">
              RESET
            </div>
            <div>
              <span className="text-rose-400 font-mono text-xs uppercase tracking-widest font-bold block">
                PRIVACY CONTROLS & DATA MANAGEMENT
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                Personal Profile & Storage Wipe
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playLcarsBeep();
              onClose();
            }}
            className="p-2 text-rose-400 hover:text-white rounded-lg hover:bg-rose-500/20 transition-colors"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-6 text-slate-200">
          
          {/* Section 1: Customize Call Sign & Avatar */}
          <form onSubmit={handleSaveProfile} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                Profile Identity (Cookie Synced)
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {userProfile.id}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                  Profile Display Name / Moniker:
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={32}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black border border-slate-700 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="e.g. Alex Wilkinson"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
                  Insignia Icon:
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        sound.playTick();
                        setSelectedAvatar(av);
                      }}
                      className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center transition-all ${
                        selectedAvatar === av
                          ? 'bg-amber-500 border-2 border-white scale-110 shadow-md shadow-amber-500/40'
                          : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {savedSuccess ? (
                  <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" /> Identity Saved & Synced
                  </span>
                ) : (
                  <span className="text-xs font-mono text-slate-400">
                    Persists across device reloads
                  </span>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-black font-mono font-bold text-xs uppercase hover:bg-amber-400 transition-colors"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </form>

          {/* Section 2: Session & System Preferences */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Session & Audio Preferences
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Sound Audio Mute Toggle */}
              <button
                type="button"
                onClick={onToggleSound}
                className="p-3 rounded-xl bg-black border border-slate-800 hover:border-amber-400 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-white block">
                    {isSoundMuted ? 'Audio Muted' : 'Audio Active'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isSoundMuted ? 'SFX disabled' : 'SFX & chimes enabled'}
                  </span>
                </div>
                <div className={`p-2 rounded-lg ${isSoundMuted ? 'bg-slate-900 text-slate-500' : 'bg-amber-500/20 text-amber-400'}`}>
                  {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </div>
              </button>

              {/* Email / Save Profile */}
              <button
                type="button"
                onClick={() => {
                  sound.playLcarsBeep();
                  onOpenEmail();
                }}
                className="p-3 rounded-xl bg-black border border-slate-800 hover:border-cyan-400 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-white block">
                    Save Profile
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Email backup & link
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Mail className="w-4 h-4" />
                </div>
              </button>

              {/* Download Code ZIP */}
              <a
                href="/api/download-zip"
                download="prioritizer-project.zip"
                onClick={() => sound.playLcarsConfirm()}
                className="p-3 rounded-xl bg-black border border-slate-800 hover:border-emerald-400 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-white block">
                    Download Code
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Full clean ZIP
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Download className="w-4 h-4" />
                </div>
              </a>
            </div>
          </div>

          {/* Section 3: Full Data Reset */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider">
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
              Reset All Personal Data (Complete Memory Wipe)
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              This completely erases your local state, all cookie identifiers, all temporal snapshots, declared priorities, and your server profile record. You will start with a fresh slate.
            </p>

            {!isConfirmingPurge ? (
              <button
                type="button"
                onClick={() => {
                  sound.playBuzz();
                  setIsConfirmingPurge(true);
                }}
                className="w-full py-2.5 rounded-lg bg-rose-500/20 border border-rose-500/60 text-rose-300 font-mono font-bold text-xs sm:text-sm uppercase hover:bg-rose-500 hover:text-black transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Initiate Personal Data Reset
              </button>
            ) : (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500 space-y-3">
                <div className="text-xs sm:text-sm text-white font-mono font-bold text-center">
                  ⚠️ CONFIRM WIPE: ARE YOU CERTAIN?
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTick();
                      setIsConfirmingPurge(false);
                    }}
                    className="w-1/2 py-2 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs uppercase hover:text-white"
                  >
                    Abort
                  </button>
                  <button
                    type="button"
                    onClick={handleExecutePurge}
                    className="w-1/2 py-2 rounded bg-rose-600 text-white font-mono font-black text-xs uppercase hover:bg-rose-500 shadow-lg shadow-rose-600/40"
                  >
                    Confirm & Wipe All Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            LOCAL & SERVER PERSISTENCE ENCRYPTED // CLIENT AUTHORITATIVE
          </span>
          <button
            type="button"
            onClick={() => {
              sound.playLcarsBeep();
              onClose();
            }}
            className="px-4 py-2 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs uppercase hover:text-white"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
