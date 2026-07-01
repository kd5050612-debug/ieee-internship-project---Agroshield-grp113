import { supportedLanguages, useTranslation, type Language } from '../lib/i18n';

function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('agrilens_lang') as Language | null;
  return saved && supportedLanguages.some((l) => l.lang === saved) ? saved : 'en';
}

export default function LanguageSelect() {
  // Ensure selector renders with a stable initial value (SSR-safe).
  const initialLang = getStoredLanguage();
  const { currentLanguage, setLanguage } = useTranslation('common');

  return (
    <div className="hidden sm:flex items-center gap-2">
      <div className="text-[10px] font-mono text-white/40">Lang</div>
      <select
        value={currentLanguage ?? initialLang}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="bg-forest-800/60 border border-white/10 text-white/80 rounded-lg px-2 py-1 text-xs outline-none focus:border-neon-green/35"
      >
        {supportedLanguages.map((l) => (
          <option key={l.lang} value={l.lang}>
            {l.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

