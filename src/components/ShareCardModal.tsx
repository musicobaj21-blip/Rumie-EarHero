import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Download, Share2, Sparkles, X } from 'lucide-react';
import { WorldEngine } from '../engines/WorldEngine';
import { useI18n } from '../i18n/I18nContext';
import { ShareCardPayload, UserProgress } from '../types/music';
import { renderAchievementCardToCanvas } from '../utils/achievementCardCanvas';
import { SocialShareBar } from './SocialShareBar';

interface ShareCardModalProps {
  payload: ShareCardPayload;
  progress: UserProgress;
  onClose: () => void;
}

const PNG_FILENAME = 'Rumie-EarHero-Logro.png';

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  payload,
  progress,
  onClose,
}) => {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const totalStars = useMemo(() => WorldEngine.getTotalStars(progress), [progress]);
  const globalAccuracy = useMemo(() => {
    const total = progress.totalCorrect + progress.totalWrong;
    return total > 0 ? Math.round((progress.totalCorrect / total) * 100) : 0;
  }, [progress.totalCorrect, progress.totalWrong]);

  const displayStudentName =
    !progress.studentName.trim() || progress.studentName === 'Estudiante Rumie'
      ? t.brand.defaultStudent
      : progress.studentName;

  const formattedDate = useMemo(
    () =>
      new Date().toLocaleDateString(t.rewards.dateLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [t.rewards.dateLocale]
  );

  const appUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://rumie.app';

  const socialShareMessage = useMemo(() => {
    const scorePart = payload.highlightStat
      ? ` (${payload.highlightStat} · ${progress.xp} XP · ${globalAccuracy}%)`
      : ` (${progress.xp} XP · ★ ${totalStars} · ${globalAccuracy}%)`;
    return `${t.shareCard.shareText(payload.title)}${scorePart}`;
  }, [
    t.shareCard,
    payload.title,
    payload.highlightStat,
    progress.xp,
    totalStars,
    globalAccuracy,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderAchievementCardToCanvas(canvas, {
      payload,
      studentName: displayStudentName,
      slogan: t.brand.slogan,
      totalStars,
      streakDays: progress.streakDays,
      xp: progress.xp,
      globalAccuracy,
      dateText: formattedDate,
      labels: {
        starsMetric: t.shareCard.starsMetric,
        streakMetric: t.shareCard.streakMetric,
        energyMetric: t.shareCard.energyMetric,
        accuracyMetric: t.shareCard.accuracyMetric,
      },
    });
    try {
      setPreviewUrl(canvas.toDataURL('image/png'));
    } catch {
      setPreviewUrl('');
    }
  }, [
    payload,
    displayStudentName,
    t.brand.slogan,
    t.shareCard.starsMetric,
    t.shareCard.streakMetric,
    t.shareCard.energyMetric,
    t.shareCard.accuracyMetric,
    totalStars,
    progress.streakDays,
    progress.xp,
    globalAccuracy,
    formattedDate,
  ]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, [onClose]);

  const showNotice = (msg: string) => {
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    setStatusNotice(msg);
    noticeTimerRef.current = window.setTimeout(() => {
      setStatusNotice(null);
      noticeTimerRef.current = null;
    }, 3600);
  };

  const copyShareTextToClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${socialShareMessage} ${appUrl}`);
      }
    } catch {
      // Ignore clipboard permission errors inside restricted iframes
    }
  };

  const getPngBlob = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        resolve(null);
        return;
      }
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });

  const triggerDownload = (blob: Blob | null) => {
    const url = blob ? URL.createObjectURL(blob) : previewUrl;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = PNG_FILENAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (blob) {
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const handleDownloadPng = async () => {
    const blob = await getPngBlob();
    triggerDownload(blob);
    showNotice(t.shareCard.downloadedMsg);
  };

  const handleInstagramShare = async () => {
    const blob = await getPngBlob();
    triggerDownload(blob);
    await copyShareTextToClipboard();
    showNotice(t.shareCard.instagramReadyMsg);
  };

  const handleShare = async () => {
    const blob = await getPngBlob();
    if (blob && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const file = new File([blob], PNG_FILENAME, { type: 'image/png' });
        if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: t.brand.name,
            text: socialShareMessage,
          });
          showNotice(t.shareCard.sharedSuccessMsg);
          return;
        }
        await navigator.share({
          title: t.brand.name,
          text: socialShareMessage,
          url: appUrl,
        });
        showNotice(t.shareCard.sharedSuccessMsg);
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
      }
    }
    // Desktop fallback: copy text + download PNG so user can share immediately
    await copyShareTextToClipboard();
    triggerDownload(blob);
    showNotice(t.shareCard.downloadedToShareMsg);
  };

  return (
    <div
      className="fixed inset-0 z-[60] h-[100dvh] max-h-[100dvh] w-full bg-black/82 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-label={t.shareCard.modalAria}
      onClick={onClose}
    >
      {/* Hidden offscreen 1080x1080 canvas */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[94vw] sm:w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl bg-[#121521] border border-[#FF5A00]/45 p-3.5 sm:p-4 shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col gap-2.5 sm:gap-3"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FFB800] shrink-0" />
              <h2 className="font-display text-sm sm:text-base font-extrabold text-white truncate">
                {t.shareCard.modalTitle}
              </h2>
            </div>
            <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
              {t.shareCard.modalSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.shareCard.closeAria}
            className="w-8 h-8 rounded-xl arcade-btn-dark border border-white/10 flex items-center justify-center text-[#9CA3AF] hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Crisp Square Preview sized so preview + social row + buttons always fit in 92dvh */}
        <div className="flex items-center justify-center min-h-0">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={payload.title}
              className="aspect-square w-full max-w-[235px] sm:max-w-[275px] max-h-[34dvh] sm:max-h-[40dvh] rounded-2xl border border-[#FFB800]/35 shadow-[0_0_28px_rgba(255,90,0,0.2)] object-contain"
            />
          ) : (
            <div className="aspect-square w-full max-w-[235px] sm:max-w-[275px] max-h-[34dvh] sm:max-h-[40dvh] rounded-2xl bg-[#0B0E18] border border-white/10 animate-pulse" />
          )}
        </div>

        {/* Friendly Status Notice */}
        {statusNotice && (
          <div
            role="status"
            aria-live="polite"
            className="shrink-0 rounded-xl bg-emerald-500/15 border border-emerald-400/45 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-emerald-300 flex items-center justify-center gap-2 text-center"
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Direct Social Media Share Row (WhatsApp, Facebook, X, LinkedIn, Instagram) */}
        <SocialShareBar
          label={t.shareCard.shareSocialHeading}
          shareMessage={socialShareMessage}
          shareUrl={appUrl}
          onInstagramClick={handleInstagramShare}
        />

        {/* Dual Action Buttons */}
        <div className="grid grid-cols-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="h-10 sm:h-11 px-3 rounded-xl arcade-btn-dark border border-white/15 hover:border-[#FFB800]/60 text-xs sm:text-sm font-display font-extrabold text-white inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-[#FFB800] shrink-0" />
            <span>{t.shareCard.downloadPngBtn}</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="h-10 sm:h-11 px-3 rounded-xl arcade-btn-orange text-xs sm:text-sm font-display font-extrabold text-white inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>{t.shareCard.shareBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
