import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Crown,
  Download,
  Eye,
  Lock,
  Share2,
  Star,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { LearningAnalytics } from '../engines/LearningAnalytics';
import { MEDALS } from '../engines/RewardEngine';
import { WorldEngine } from '../engines/WorldEngine';
import { getLocalizedMedal } from '../i18n/contentTranslations';
import { useI18n } from '../i18n/I18nContext';
import { MedalDefinition, ShareCardPayload, UserProgress } from '../types/music';
import { SocialShareBar } from './SocialShareBar';

interface RewardsViewProps {
  progress: UserProgress;
  initialSection?: 'medals' | 'skills';
  onOpenLicense: () => void;
  onShareAchievement: (payload: ShareCardPayload) => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({
  progress,
  initialSection = 'medals',
  onShareAchievement,
}) => {
  const { lang, t } = useI18n();
  const [selectedMedal, setSelectedMedal] = useState<MedalDefinition>(MEDALS[0]);
  const [mobileSection, setMobileSection] = useState<'medals' | 'skills'>(initialSection);
  const [showDiplomaPreview, setShowDiplomaPreview] = useState(false);

  useEffect(() => {
    setMobileSection(initialSection);
  }, [initialSection]);

  const ownedSet = new Set(progress.unlockedMedals);
  const skillSummaries = LearningAnalytics.getSkillSummaries(progress, lang);
  const totalStars = WorldEngine.getTotalStars(progress);
  const completedLevels = Object.values(progress.levels).filter((l) => l.completed).length;
  const globalAccuracy =
    progress.totalCorrect + progress.totalWrong > 0
      ? Math.round(
          (progress.totalCorrect / (progress.totalCorrect + progress.totalWrong)) * 100
        )
      : 0;
  const diplomaUnlocked = Boolean(progress.diplomaUnlockedAt);

  const displayStudentName =
    !progress.studentName || progress.studentName === 'Estudiante Rumie'
      ? t.brand.defaultStudent
      : progress.studentName;

  const issuedDate = progress.diplomaUnlockedAt
    ? new Date(progress.diplomaUnlockedAt).toLocaleDateString(t.rewards.dateLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : t.rewards.pendingWorld8;

  const selectedMedalText = getLocalizedMedal(selectedMedal, lang);

  const handleDownloadDiplomaSvg = () => {
    const escapeSvg = (str: string) =>
      str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const safeName = escapeSvg(displayStudentName);
    const safeHeading = escapeSvg(t.rewards.diplomaHeading);
    const safeSubtitle = escapeSvg(t.rewards.diplomaSubtitle);
    const safeCertifies = escapeSvg(t.rewards.certifiesThat);
    const safeCompleted = escapeSvg(t.rewards.completedJourneyLine);
    const safeStats = escapeSvg(
      t.rewards.diplomaStatsLine(progress.xp, totalStars, globalAccuracy)
    );
    const safeAwarded = escapeSvg(t.rewards.awardedOn(issuedDate));
    const safeTagline = escapeSvg(t.rewards.rumieTagline);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <rect width="1200" height="800" fill="#090B11"/>
      <rect x="36" y="36" width="1128" height="728" rx="24" fill="#14151D" stroke="#FF5A00" stroke-width="3"/>
      <rect x="56" y="56" width="1088" height="688" rx="16" fill="none" stroke="#2A2D3E" stroke-width="1.5"/>
      <text x="600" y="135" fill="#FF5A00" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle" letter-spacing="4">RUMIE EARHERO</text>
      <text x="600" y="195" fill="#FFFFFF" font-family="sans-serif" font-size="48" font-weight="800" text-anchor="middle">${safeHeading}</text>
      <text x="600" y="242" fill="#9CA3AF" font-family="sans-serif" font-size="22" text-anchor="middle">${safeSubtitle}</text>
      <line x1="380" y1="285" x2="820" y2="285" stroke="#FF5A00" stroke-width="2" opacity="0.6"/>
      <text x="600" y="345" fill="#9CA3AF" font-family="sans-serif" font-size="20" text-anchor="middle">${safeCertifies}</text>
      <text x="600" y="420" fill="#FFFFFF" font-family="sans-serif" font-size="52" font-weight="700" text-anchor="middle">${safeName}</text>
      <text x="600" y="485" fill="#D1D5DB" font-family="sans-serif" font-size="21" text-anchor="middle">${safeCompleted}</text>
      <text x="600" y="520" fill="#9CA3AF" font-family="sans-serif" font-size="18" text-anchor="middle">${safeStats}</text>
      <text x="600" y="645" fill="#9CA3AF" font-family="sans-serif" font-size="18" text-anchor="middle">${safeAwarded}</text>
      <text x="600" y="690" fill="#FF5A00" font-family="sans-serif" font-size="16" font-weight="600" text-anchor="middle">${safeTagline}</text>
    </svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Diploma-Rumie-EarHero-${displayStudentName.replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 h-full w-full min-h-0 min-w-0 flex flex-col overflow-hidden arcade-grid-bg select-none">
      {/* TOP TROPHY VAULT STATS BAR */}
      <div className="shrink-0 bg-[#0D0F18]/95 border-b border-white/10 px-3 md:px-5 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3 min-w-0">
        <div className="flex items-center justify-between md:justify-start gap-2 sm:gap-4 min-w-0">
          <span className="font-display text-sm sm:text-base font-extrabold text-white whitespace-nowrap truncate">
            {t.rewards.vaultTitle}
          </span>
          <span className="h-4 w-px bg-white/12 hidden md:block shrink-0" />
          <div className="flex items-center gap-3 text-xs font-mono tabular-nums shrink-0">
            <span className="inline-flex items-center gap-1 text-[#FFB800] font-bold">
              <Award className="w-3.5 h-3.5 shrink-0" />
              {progress.unlockedMedals.length}/16
            </span>
            <span className="inline-flex items-center gap-1 text-[#00E5FF] font-bold">
              <Target className="w-3.5 h-3.5 shrink-0" />
              {globalAccuracy}%
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[#FF5A00] font-bold">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              {progress.xp} XP
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-1.5 md:gap-2 min-w-0 w-full md:w-auto shrink-0">
          {/* Mobile & Tablet Section Toggle (Stats / Diploma tab already includes Diploma card & preview) */}
          <div className="flex lg:hidden items-center p-0.5 rounded-lg bg-[#14151D] border border-white/10 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSection('medals')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-display font-bold whitespace-nowrap transition-colors ${
                mobileSection === 'medals' ? 'bg-[#FF5A00] text-white' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              {t.rewards.medalsTab}
            </button>
            <button
              type="button"
              onClick={() => setMobileSection('skills')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-display font-bold whitespace-nowrap transition-colors ${
                mobileSection === 'skills' ? 'bg-[#FF5A00] text-white' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              {t.rewards.statsDiplomaTab}
            </button>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                onShareAchievement({
                  badgeType: 'progress',
                  categoryTag: t.shareCard.progressCategory,
                  title: t.shareCard.progressTitle(completedLevels),
                  subtitle: t.shareCard.progressSubtitle(progress.unlockedMedals.length),
                  highlightStat: `${completedLevels}/40`,
                })
              }
              className="h-8 px-2.5 sm:px-3 rounded-lg arcade-btn-dark border border-[#FF5A00]/40 hover:border-[#FF5A00] text-white text-xs font-display font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Share2 className="w-3.5 h-3.5 text-[#FF5A00] shrink-0" />
              <span className="hidden sm:inline">{t.shareCard.shareProgressBtn}</span>
              <span className="sm:hidden">{t.shareCard.shareShortBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDiplomaPreview(true)}
              className="hidden md:inline-flex h-8 px-3 rounded-lg arcade-btn-gold text-[#090B11] text-[11px] font-display font-extrabold items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Crown className="w-3.5 h-3.5 shrink-0" />
              <span>{t.rewards.diplomaBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN 100dvh SHOWCASE GRID */}
      <div className="flex-1 min-h-0 min-w-0 max-w-6xl w-full mx-auto px-2.5 sm:px-5 py-2 sm:py-3 flex flex-col lg:grid lg:grid-cols-[1.65fr_1fr] gap-2.5 sm:gap-4 overflow-hidden">
        {/* LEFT: 4x4 METALLIC TROPHY GRID (All 16 Medals fit in 1 screen on desktop; clean internal scroll ONLY on grid in mobile/tablet) */}
        <section
          aria-label={t.rewards.medalsGridAria}
          className={`${
            mobileSection === 'medals' ? 'flex' : 'hidden lg:flex'
          } flex-1 flex-col gap-2 sm:gap-2.5 min-h-0 overflow-hidden`}
        >
          <div className="flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-4 lg:grid-rows-4 auto-rows-[minmax(84px,1fr)] lg:auto-rows-auto gap-2 overflow-y-auto lg:overflow-hidden pr-0.5 lg:pr-0">
            {MEDALS.map((medal) => {
              const unlocked = ownedSet.has(medal.id);
              const isSelected = selectedMedal.id === medal.id;
              const locMedal = getLocalizedMedal(medal, lang);
              return (
                <div key={medal.id} className="relative min-h-0 flex">
                  <button
                    type="button"
                    onClick={() => setSelectedMedal(medal)}
                    className={`w-full h-full relative rounded-xl p-2 sm:p-2.5 border flex flex-col items-center justify-center text-center transition-all min-h-0 overflow-hidden ${
                      unlocked
                        ? isSelected
                          ? 'bg-gradient-to-b from-[#2E2216] via-[#1E1818] to-[#14151D] border-[#FFB800] shadow-[0_0_18px_rgba(255,184,0,0.3)]'
                          : 'bg-gradient-to-b from-[#241C16] to-[#14151D] border-[#FFB800]/45 hover:border-[#FFB800]'
                        : isSelected
                          ? 'bg-[#1A1D2B] border-[#00E5FF]/60'
                          : 'bg-[#12141E]/85 border-white/8 hover:border-white/20 opacity-80'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 shrink-0 ${
                        unlocked
                          ? 'bg-gradient-to-b from-[#FFD452] via-[#FFB800] to-[#D97706] text-[#14151D] shadow-[0_3px_10px_rgba(255,184,0,0.45)]'
                          : 'bg-[#1B1E2C] border border-white/10 text-[#52586D]'
                      }`}
                    >
                      {unlocked ? (
                        <Award className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </div>
                    <span
                      className={`font-display text-[10px] sm:text-xs font-bold leading-tight line-clamp-2 ${
                        unlocked ? 'text-white' : 'text-[#7C829B]'
                      }`}
                    >
                      {locMedal.title}
                    </span>
                  </button>
                  {unlocked && (
                    <button
                      type="button"
                      aria-label={`${t.shareCard.shareOrDownloadBtn}: ${locMedal.title}`}
                      title={t.shareCard.shareOrDownloadBtn}
                      onClick={() =>
                        onShareAchievement({
                          badgeType: medal.category === 'world' ? 'world' : 'medal',
                          categoryTag: t.shareCard.medalCategory,
                          title: locMedal.title,
                          subtitle: locMedal.description,
                        })
                      }
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-[#14151D]/90 hover:bg-[#FF5A00] border border-[#FFB800]/40 hover:border-[#FF5A00] text-[#FFB800] hover:text-white flex items-center justify-center transition-colors z-10"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Medal Inspector Footer Bar */}
          <div className="shrink-0 rounded-xl bg-[#14151D] border border-white/10 px-3.5 py-2.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-xs sm:text-sm font-extrabold text-white truncate">
                  {selectedMedalText.title}
                </span>
                {ownedSet.has(selectedMedal.id) ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t.rewards.earnedBadge}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#FFB800] shrink-0">
                    {selectedMedalText.requirementText}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-[#9CA3AF] truncate mt-0.5">
                {selectedMedalText.description}
              </p>
            </div>
            {ownedSet.has(selectedMedal.id) && (
              <button
                type="button"
                onClick={() =>
                  onShareAchievement({
                    badgeType: selectedMedal.category === 'world' ? 'world' : 'medal',
                    categoryTag: t.shareCard.medalCategory,
                    title: selectedMedalText.title,
                    subtitle: selectedMedalText.description,
                  })
                }
                className="h-8 px-3 rounded-lg arcade-btn-dark border border-[#FFB800]/40 hover:border-[#FFB800] text-[#FFB800] hover:text-white text-[11px] font-display font-bold inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.shareCard.shareOrDownloadBtn}</span>
                <span className="sm:hidden">{t.shareCard.shareShortBtn}</span>
              </button>
            )}
          </div>
        </section>

        {/* RIGHT: SKILL RADAR BARS + DIPLOMA CARD */}
        <aside
          className={`${
            mobileSection === 'skills' ? 'flex' : 'hidden lg:flex'
          } flex-1 flex-col lg:justify-between gap-3 min-h-0 overflow-y-auto lg:overflow-hidden pr-0.5 lg:pr-0`}
        >
          {/* Skill Mastery Meter */}
          <div className="shrink-0 lg:flex-1 lg:min-h-0 rounded-2xl bg-[#14151D] border border-white/10 p-3.5 sm:p-4 flex flex-col justify-between lg:overflow-hidden">
            <div className="flex items-center justify-between shrink-0 mb-2">
              <h2 className="font-display text-sm font-extrabold text-white">
                {t.rewards.skillMasteryTitle}
              </h2>
              <span className="font-mono text-[11px] text-[#00E5FF] tabular-nums">
                {t.rewards.levelsCount(completedLevels)}
              </span>
            </div>

            <div className="space-y-2 flex-1 flex flex-col justify-center">
              {skillSummaries.map((skill) => (
                <div key={skill.category}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-white/90 font-medium">{skill.label}</span>
                    <span className="font-mono text-[#9CA3AF] tabular-nums">
                      {skill.attempts > 0 ? `${skill.accuracy}%` : '—'}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#1F2233] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF5A00] to-[#00E5FF] rounded-full transition-all duration-300"
                      style={{
                        width: `${skill.attempts > 0 ? Math.max(6, skill.accuracy) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Diploma Vault Card */}
          <div className="shrink-0 rounded-2xl bg-gradient-to-br from-[#1C1816] via-[#14151D] to-[#121922] border border-[#FFB800]/40 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  diplomaUnlocked
                    ? 'bg-gradient-to-b from-[#FFD452] to-[#FF5A00] text-[#090B11]'
                    : 'bg-[#1C1D29] text-[#6B7280]'
                }`}
              >
                <Crown className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-mono font-bold text-[#FFB800] uppercase">
                  {t.rewards.officialCertLabel}
                </span>
                <span className="block font-display text-sm font-extrabold text-white truncate">
                  {t.rewards.masterEarDiploma}
                </span>
                <span className="block text-[11px] text-[#9CA3AF] truncate">
                  {diplomaUnlocked ? t.rewards.diplomaReady : t.rewards.diplomaLockedHint}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowDiplomaPreview(true)}
                aria-label={t.rewards.previewDiplomaAria}
                className="h-9 px-3 rounded-lg arcade-btn-dark border border-white/15 text-xs font-bold text-white inline-flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>{t.rewards.viewBtn}</span>
              </button>
              {diplomaUnlocked && (
                <button
                  type="button"
                  onClick={handleDownloadDiplomaSvg}
                  aria-label={t.rewards.downloadDiplomaAria}
                  className="h-9 px-3 rounded-lg arcade-btn-gold text-[#090B11] text-xs font-extrabold inline-flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* DIPLOMA PREVIEW MODAL */}
      {showDiplomaPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t.rewards.diplomaModalAria}
        >
          <div className="w-[92vw] sm:w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-2xl bg-[#14151D] border-2 border-[#FF5A00] p-5 sm:p-8 text-center relative shadow-[0_0_50px_rgba(255,90,0,0.25)]">
            <button
              type="button"
              onClick={() => setShowDiplomaPreview(false)}
              aria-label={t.rewards.closePreviewAria}
              className="absolute top-3.5 right-3.5 w-9 h-9 rounded-xl bg-[#1C1D29] hover:bg-[#25283B] flex items-center justify-center text-[#9CA3AF] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="font-mono text-xs font-bold tracking-[0.25em] text-[#FF5A00] uppercase">
              RUMIE EARHERO
            </p>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-2">
              {t.rewards.diplomaHeading}
            </h3>
            <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
              {t.rewards.diplomaSubtitle}
            </p>

            <div className="my-5 h-px w-48 mx-auto bg-gradient-to-r from-transparent via-[#FF5A00] to-transparent" />

            <p className="text-xs text-[#9CA3AF]">{t.rewards.certifiesThat}</p>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#FFB800] mt-1">
              {displayStudentName}
            </p>
            <p className="text-xs sm:text-sm text-white/85 mt-2 max-w-md mx-auto">
              {t.rewards.completedJourneyLine}
            </p>

            <div className="flex items-center justify-center gap-4 text-xs font-mono text-[#00E5FF] mt-4 tabular-nums">
              <span>{progress.xp} XP</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-[#FFB800]">
                <Star className="w-3.5 h-3.5 fill-[#FFB800]" />
                {totalStars}/120
              </span>
              <span>·</span>
              <span>
                {t.rewards.accuracyWord} {globalAccuracy}%
              </span>
            </div>

            <p className="text-[11px] text-[#9CA3AF] mt-4">{issuedDate}</p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              {diplomaUnlocked ? (
                <button
                  type="button"
                  onClick={handleDownloadDiplomaSvg}
                  className="h-10 px-5 rounded-xl arcade-btn-orange text-xs sm:text-sm font-display font-extrabold text-white inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.rewards.downloadDiplomaBtn}</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C1D29] border border-white/10 text-xs text-[#9CA3AF]">
                  <Lock className="w-4 h-4 text-[#FFB800]" />
                  {t.rewards.completeWorld8ToDownload}
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowDiplomaPreview(false);
                  onShareAchievement({
                    badgeType: 'progress',
                    categoryTag: t.rewards.officialCertLabel,
                    title: t.rewards.masterEarDiploma,
                    subtitle: t.shareCard.progressTitle(completedLevels),
                    highlightStat: `${completedLevels}/40`,
                  });
                }}
                className="h-10 px-4 rounded-xl arcade-btn-dark border border-[#FFB800]/45 hover:border-[#FFB800] text-[#FFB800] hover:text-white text-xs sm:text-sm font-display font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.shareCard.downloadPngBtn}</span>
              </button>
            </div>

            <div className="mt-4 pt-3.5 border-t border-white/10 max-w-md mx-auto">
              <SocialShareBar
                label={t.shareCard.shareSocialHeading}
                shareMessage={`${t.shareCard.shareText(t.rewards.masterEarDiploma)} (${completedLevels}/40 · ${progress.xp} XP · ${globalAccuracy}%)`}
                shareUrl={
                  typeof window !== 'undefined' && window.location?.origin
                    ? window.location.origin
                    : 'https://rumie.app'
                }
                onInstagramClick={() => {
                  setShowDiplomaPreview(false);
                  onShareAchievement({
                    badgeType: 'progress',
                    categoryTag: t.rewards.officialCertLabel,
                    title: t.rewards.masterEarDiploma,
                    subtitle: t.shareCard.progressTitle(completedLevels),
                    highlightStat: `${completedLevels}/40`,
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
