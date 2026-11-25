import React, { useState } from 'react';
import { Check, Crown, RefreshCw, ShieldCheck, Trash2, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { LicenseAdapter } from '../services/LicenseAdapter';
import { ProgressRepository } from '../services/ProgressRepository';
import { LicensePlan, UserProgress } from '../types/music';

interface LicenseModalProps {
  progress: UserProgress;
  qaUnlockAll: boolean;
  onActivateQaUnlock: () => void;
  onDeactivateQaUnlock: () => void;
  onChangeLicense: (plan: LicensePlan) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const LicenseModal: React.FC<LicenseModalProps> = ({
  progress,
  qaUnlockAll,
  onActivateQaUnlock,
  onDeactivateQaUnlock,
  onChangeLicense,
  onResetProgress,
  onClose,
}) => {
  const { t } = useI18n();
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [qaCode, setQaCode] = useState('');
  const [qaCodeError, setQaCodeError] = useState(false);

  const handleQaCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = qaCode.replace(/\s+/g, '').toUpperCase();
    if (normalized === 'RUMIE-QA') {
      setQaCodeError(false);
      setQaCode('');
      onActivateQaUnlock();
      onClose();
    } else {
      setQaCodeError(true);
    }
  };

  const handleServerCheck = async () => {
    setChecking(true);
    const licenseRes = await LicenseAdapter.verifyLicenseWithLaravel(progress.licensePlan);
    const syncRes = await ProgressRepository.syncToLaravel(progress);
    setChecking(false);
    setVerifyMsg(
      licenseRes.verifiedByServer
        ? t.license.verifiedByServer(licenseRes.plan.toUpperCase(), syncRes.synced)
        : `${licenseRes.message ?? t.license.localCheckFallback}`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.license.dialogAria}
    >
      <div className="w-[92vw] sm:w-full max-w-2xl rounded-2xl bg-[#14151D] border border-white/10 p-4 sm:p-7 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              {t.license.title}
            </h2>
            <p className="text-sm text-[#9CA3AF] mt-1">{t.license.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.license.closeAria}
            className="min-w-[40px] min-h-[40px] rounded-xl bg-[#1C1D29] hover:bg-[#252736] flex items-center justify-center text-[#9CA3AF] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Free Tier */}
          <div
            className={`rounded-2xl p-5 border ${
              progress.licensePlan === 'free'
                ? 'bg-[#1C1D29] border-[#FF5A00]'
                : 'bg-[#1C1D29]/50 border-white/8'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white">
                {t.license.freeTitle}
              </h3>
              {progress.licensePlan === 'free' && (
                <span className="text-xs font-semibold text-[#FF5A00]">
                  {t.license.activeBadge}
                </span>
              )}
            </div>
            <p className="text-xs text-[#9CA3AF] mt-1">{t.license.freeSubtitle}</p>

            <ul className="mt-4 space-y-2.5 text-sm text-white/90">
              {t.license.freeFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF5A00] shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => onChangeLicense('free')}
              disabled={progress.licensePlan === 'free'}
              className="mt-5 w-full h-11 rounded-xl arcade-btn-dark disabled:opacity-50 text-xs font-display font-bold text-white border border-white/10"
            >
              {progress.licensePlan === 'free' ? t.license.currentPlanBtn : t.license.tryFreeBtn}
            </button>
          </div>

          {/* Premium Tier */}
          <div
            className={`rounded-2xl p-5 border ${
              progress.licensePlan === 'premium'
                ? 'bg-gradient-to-b from-[#231D18] to-[#171926] border-[#FFB800] shadow-[0_0_24px_rgba(255,184,0,0.18)]'
                : 'bg-[#1C1D29]/60 border-white/12'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white inline-flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-[#FFB800]" />
                <span>{t.license.premiumTitle}</span>
              </h3>
              {progress.licensePlan === 'premium' && (
                <span className="text-xs font-bold text-[#FFB800]">
                  {t.license.premiumActiveBadge}
                </span>
              )}
            </div>
            <p className="text-xs text-[#9CA3AF] mt-1">{t.license.premiumSubtitle}</p>

            <ul className="mt-4 space-y-2.5 text-sm text-white/90">
              {t.license.premiumFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FFB800] shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => onChangeLicense('premium')}
              disabled={progress.licensePlan === 'premium'}
              className="mt-5 w-full h-11 rounded-xl arcade-btn-gold disabled:opacity-50 text-xs font-display font-extrabold text-[#090B11]"
            >
              {progress.licensePlan === 'premium'
                ? t.license.premiumActiveBtn
                : t.license.activatePremiumBtn}
            </button>
          </div>
        </div>

        {/* Laravel Integration & Local Data Tools */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
              <ShieldCheck className="w-4 h-4 text-[#FF5A00] shrink-0" />
              <span>{t.license.laravelAdapterReady}</span>
            </div>
            <button
              type="button"
              onClick={handleServerCheck}
              disabled={checking}
              className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#1C1D29] hover:bg-[#252736] text-xs font-medium text-white border border-white/10 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{t.license.verifyLicenseBtn}</span>
            </button>
          </div>

          {verifyMsg && (
            <p className="text-xs text-white/85 bg-[#1C1D29] rounded-lg px-3 py-2">
              {verifyMsg}
            </p>
          )}

          {/* Reversible QA / Test Access Code (in-memory only, never persisted to localStorage) */}
          <form
            onSubmit={handleQaCodeSubmit}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-[#10121B] border border-white/8 px-3 py-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-mono font-bold text-[#9CA3AF] whitespace-nowrap">
                🛠️ QA / Prueba
              </span>
              {qaUnlockAll && (
                <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-[#FF5A00]/20 text-[#FF8A4C] border border-[#FF5A00]/40 whitespace-nowrap">
                  ACTIVO
                </span>
              )}
              {qaCodeError && (
                <span className="text-[11px] text-rose-400 truncate">
                  Código inválido
                </span>
              )}
            </div>

            {qaUnlockAll ? (
              <button
                type="button"
                onClick={() => {
                  onDeactivateQaUnlock();
                  onClose();
                }}
                className="h-8 px-3 rounded-lg bg-[#FF5A00] hover:bg-[#FF6E1F] text-[11px] font-display font-extrabold text-white whitespace-nowrap shrink-0 transition-colors"
              >
                🛠️ QA ON (Bloquear)
              </button>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="text"
                  value={qaCode}
                  onChange={(e) => {
                    setQaCode(e.target.value);
                    if (qaCodeError) setQaCodeError(false);
                  }}
                  placeholder="Código QA"
                  aria-label="Código QA"
                  className="w-32 sm:w-36 h-8 px-2.5 rounded-lg bg-[#1C1F2E] border border-white/12 text-xs font-mono text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#FF5A00]"
                />
                <button
                  type="submit"
                  className="h-8 px-3 rounded-lg bg-[#1C1D29] hover:bg-[#252736] border border-white/12 text-xs font-bold text-white whitespace-nowrap transition-colors"
                >
                  Activar
                </button>
              </div>
            )}
          </form>

          {/* Reset local progress (2-step inline confirmation, no window.confirm) */}
          <div className="pt-2 flex items-center justify-between">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-xs text-[#9CA3AF] hover:text-rose-400 inline-flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.license.resetProgressBtn}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-300">{t.license.resetConfirmPrompt}</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetProgress();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white"
                >
                  {t.license.resetConfirmBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 rounded-lg bg-[#1C1D29] text-xs text-[#9CA3AF]"
                >
                  {t.license.cancel}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
