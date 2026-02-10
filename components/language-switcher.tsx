'use client'

import { useI18n } from '@/lib/i18n/context'
import { type Language } from '@/lib/i18n/translations'

const languages: { code: Language; name: string; flag: string }[] = [
	{ code: 'en', name: 'English', flag: '🇬🇧' },
	{ code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
	{ code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
]

export default function LanguageSwitcher() {
	const { language, setLanguage } = useI18n()

	return (
		<div className="flex items-center gap-2 bg-card rounded-xl shadow-xl p-2 border border-border">
			<span className="text-sm text-muted-foreground mr-2">Language:</span>
			<div className="flex gap-1">
				{languages.map((lang) => (
					<button
						key={lang.code}
						onClick={() => setLanguage(lang.code)}
						className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
							language === lang.code
								? 'bg-primary text-primary-foreground shadow-md'
								: 'bg-secondary/50 text-muted-foreground hover:bg-secondary/70'
						}`}
						title={lang.name}
					>
						<span className="mr-1">{lang.flag}</span>
						{lang.name}
					</button>
				))}
			</div>
		</div>
	)
}
