import React, { useRef, useState, useEffect } from 'react';
import { getPriorityById } from '../data/ontology';
import { PriorityInsight } from '../types';
import { sound } from '../services/sound';
import { X, Download, Share2, Copy, Check, Sparkles } from 'lucide-react';

interface Props {
  declaredIds: string[];
  insights: PriorityInsight[];
  onClose: () => void;
}

export const ShareModal: React.FC<Props> = ({ declaredIds, insights, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  const biggestGap = insights.find(i => i.type === 'PRIORITY_GAP');
  const biggestAlignment = insights.find(i => i.type === 'ALIGNED');

  // Render high-fidelity graphic card on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    const height = 750;
    canvas.width = width;
    canvas.height = height;

    // Dark background with cosmic gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0e1a');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#05070d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Glowing border
    ctx.strokeStyle = '#f59e0b44';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    // Brand Header
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('PRIORITIZER · LIFE COMPASS', 45, 60);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('Your life. Your priorities. Your choice.', 45, 84);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('DECLARED TOP 5', 45, 140);

    // Render 5 Priorities
    let yPos = 180;
    declaredIds.forEach((id, idx) => {
      const item = getPriorityById(id);
      if (!item) return;

      // Card row background
      ctx.fillStyle = '#1e293b88';
      ctx.fillRect(45, yPos, width - 90, 56);

      // Rank & Emoji
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`#${idx + 1}`, 65, yPos + 35);

      ctx.font = '24px sans-serif';
      ctx.fillText(item.emoji, 110, yPos + 37);

      // Name & domain
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(item.name, 150, yPos + 35);

      yPos += 66;
    });

    // Insights Callout Section
    yPos += 10;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(45, yPos, width - 90, 140);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(45, yPos, width - 90, 140);

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('PRIMARY FRICTION GAP:', 65, yPos + 32);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px sans-serif';
    const gapText = biggestGap
      ? `${biggestGap.priorityEmoji} ${biggestGap.priorityName} (Declared #${biggestGap.declaredRank} vs Calendar #${biggestGap.timeRank})`
      : 'No major deficit detected';
    ctx.fillText(gapText, 65, yPos + 54);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('PRIMARY HARMONIC ALIGNMENT:', 65, yPos + 90);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px sans-serif';
    const alignText = biggestAlignment
      ? `${biggestAlignment.priorityEmoji} ${biggestAlignment.priorityName} (Tight harmony across declared & resources)`
      : 'Evolving across seasons';
    ctx.fillText(alignText, 65, yPos + 112);

    // Footer Branding
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Generated ${new Date().toLocaleDateString()} · prioritizer.app`, 45, height - 35);
  }, [declaredIds, insights]);

  const handleDownloadImage = () => {
    sound.playChime(600, 'sine', 0.2);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `prioritizer-profile-${Date.now()}.png`;
    a.click();
  };

  const handleCopyLink = () => {
    sound.playTick();
    const shareUrl = window.location.origin;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNativeShare = async () => {
    sound.playTick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Prioritizer Universe',
          text: `My #1 priority is ${getPriorityById(declaredIds[0])?.name || 'Life'}. Explore what matters to you on Prioritizer.`,
          url: window.location.origin,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-bold text-base text-slate-100">
              Share Your Priority Card
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Canvas Preview */}
        <div className="my-3 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 flex justify-center">
          <canvas ref={canvasRef} className="w-full max-w-[340px] aspect-[4/5] object-contain shadow-md" />
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold hover:border-slate-700 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNativeShare}
              className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadImage}
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-display font-bold text-xs flex items-center gap-1.5 hover:bg-amber-300 shadow transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Card (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
