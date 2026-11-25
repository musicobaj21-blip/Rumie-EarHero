import React from 'react';

interface SocialShareBarProps {
  /** Message describing the achievement + score */
  shareMessage: string;
  /** Public app origin URL */
  shareUrl: string;
  /** Optional heading label above the social icons */
  label?: string;
  /** Triggered when clicking Instagram (downloads asset + copies text + shows confirmation) */
  onInstagramClick: () => void;
}

export const SocialShareBar: React.FC<SocialShareBarProps> = ({
  shareMessage,
  shareUrl,
  label,
  onInstagramClick,
}) => {
  const fullTextWithUrl = `${shareMessage} ${shareUrl}`.trim();

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(fullTextWithUrl)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}&quote=${encodeURIComponent(shareMessage)}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareMessage
  )}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  return (
    <div className="shrink-0 flex flex-col gap-1.5">
      {label && (
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8] text-center">
          {label}
        </span>
      )}
      <div className="grid grid-cols-5 gap-1.5">
        {/* 1. WhatsApp */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/45 text-[#4ADE80] hover:text-white transition-colors min-w-0"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
            <path d="M12.03 2C6.5 2 2 6.48 2 12c0 1.93.55 3.74 1.5 5.28L2 22l4.86-1.46A9.97 9.97 0 0 0 12.03 22C17.55 22 22 17.52 22 12S17.55 2 12.03 2zm5.82 14.12c-.25.7-1.45 1.33-2 1.4-.52.07-1.18.1-1.91-.13-.45-.14-1.02-.34-1.76-.66-3.09-1.33-5.1-4.44-5.26-4.65-.15-.21-1.26-1.67-1.26-3.19 0-1.52.8-2.26 1.08-2.57.28-.3.62-.38.82-.38.2 0 .41.01.59.01.19.01.44-.07.69.52.25.6.86 2.1.94 2.25.08.15.13.33.03.54-.1.21-.15.33-.31.51-.15.18-.32.4-.46.54-.15.15-.31.32-.13.62.18.3.79 1.3 1.7 2.11 1.17 1.04 2.15 1.36 2.46 1.51.31.15.49.13.67-.08.18-.21.77-.9.98-1.21.2-.31.41-.26.69-.15.28.1 1.79.84 2.1.99.31.15.51.23.59.36.07.13.07.75-.18 1.45z" />
          </svg>
          <span className="text-[9px] sm:text-[10px] font-display font-bold truncate leading-none">
            WhatsApp
          </span>
        </a>

        {/* 2. Facebook */}
        <a
          href={facebookHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-[#1877F2]/18 hover:bg-[#1877F2]/30 border border-[#1877F2]/45 text-[#60A5FA] hover:text-white transition-colors min-w-0"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
            <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.52 1.55-1.52h1.65V4.6c-.29-.04-1.27-.12-2.41-.12-2.39 0-4.02 1.46-4.02 4.13v2.3H7.6V14h2.67v8h3.23z" />
          </svg>
          <span className="text-[9px] sm:text-[10px] font-display font-bold truncate leading-none">
            Facebook
          </span>
        </a>

        {/* 3. X / Twitter */}
        <a
          href={twitterHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X / Twitter"
          className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/20 text-white transition-colors min-w-0"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="text-[9px] sm:text-[10px] font-display font-bold truncate leading-none">
            X
          </span>
        </a>

        {/* 4. LinkedIn */}
        <a
          href={linkedinHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-[#0A66C2]/20 hover:bg-[#0A66C2]/32 border border-[#0A66C2]/50 text-[#60A5FA] hover:text-white transition-colors min-w-0"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
            <path d="M6.94 8.5H3.56V19.5H6.94V8.5ZM5.25 3.5C4.14 3.5 3.25 4.39 3.25 5.5C3.25 6.6 4.14 7.5 5.25 7.5C6.35 7.5 7.25 6.6 7.25 5.5C7.25 4.39 6.35 3.5 5.25 3.5ZM20.44 13.02C20.44 9.88 18.76 8.22 16.22 8.22C14.37 8.22 13.48 9.24 13.02 9.98V8.5H9.65C9.7 9.48 9.65 19.5 9.65 19.5H13.02V13.36C13.02 13.02 13.05 12.69 13.15 12.45C13.42 11.79 14.03 11.11 15.07 11.11C16.41 11.11 17.07 12.13 17.07 13.63V19.5H20.44V13.02Z" />
          </svg>
          <span className="text-[9px] sm:text-[10px] font-display font-bold truncate leading-none">
            LinkedIn
          </span>
        </a>

        {/* 5. Instagram (auto-downloads PNG + copies text) */}
        <button
          type="button"
          onClick={onInstagramClick}
          aria-label="Instagram"
          className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-gradient-to-tr from-[#F58529]/25 via-[#DD2A7B]/25 to-[#8134AF]/25 hover:from-[#F58529]/40 hover:via-[#DD2A7B]/40 hover:to-[#8134AF]/40 border border-[#DD2A7B]/50 text-[#F472B6] hover:text-white transition-all min-w-0 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
            <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
          </svg>
          <span className="text-[9px] sm:text-[10px] font-display font-bold truncate leading-none">
            Instagram
          </span>
        </button>
      </div>
    </div>
  );
};
