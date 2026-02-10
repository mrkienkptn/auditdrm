'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'

interface CopyButtonProps {
	text: string
	className?: string
	iconOnly?: boolean
}

export default function CopyButton({
	text,
	className = '',
	iconOnly = false,
}: CopyButtonProps) {
	const { t } = useI18n()
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error('Failed to copy:', err)
		}
	}

	if (iconOnly) {
		return (
			<button
				onClick={handleCopy}
				className={`p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-200 flex items-center justify-center ${className}`}
				title={copied ? t.common.copied : t.common.copy}
			>
				{copied ? (
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
				) : (
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
						/>
					</svg>
				)}
			</button>
		)
	}

	return (
		<button
			onClick={handleCopy}
			className={`px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-all flex items-center gap-1.5 ${className}`}
		>
			{copied ? (
				<>
					<svg
						className="w-3 h-3"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<span className="text-xs">Copied</span>
				</>
			) : (
				<>
					<svg
						className="w-3 h-3"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
						/>
					</svg>
					<span className="text-xs">{t.common.copy}</span>
				</>
			)}
		</button>
	)
}
