import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { sound } from '../services/sound';
import { Mail, Check, X, ShieldCheck } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSaved: (email: string) => void;
}

export const EmailSaveModal: React.FC<Props> = ({ onClose, onSaved }) => {
  const [email, setEmail] = useState(StorageService.getSavedEmail());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    sound.playLockConfirm();
    StorageService.saveEmail(email);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      onSaved(email);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-center relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-950 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-3.5 shadow-inner">
          <Mail className="w-7 h-7" />
        </div>

        <h3 className="font-display font-extrabold text-2xl text-slate-100">
          Save Your Priority Profile
        </h3>

        <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
          Want us to remember your profile and notify you when the next seasonal orbit arrives?
        </p>

        {isSuccess ? (
          <div className="mt-5 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Profile linked! We will preserve your orbit history.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-600 text-xs focus:outline-none focus:border-amber-400"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-display font-bold text-xs hover:bg-amber-300 transition-colors shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : 'Preserve My Orbit & Seasonal Reminders'}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Zero spam · Unsubscribe anytime · Data kept private</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
