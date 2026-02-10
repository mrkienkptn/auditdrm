'use client'

import { useI18n } from '@/lib/i18n/context'

export type ApiGroup = 'channel' | 'device' | 'fingerprint' | 'message'

interface ApiGroupsTabsProps {
	activeGroup: ApiGroup
	onGroupChange: (group: ApiGroup) => void
}

export default function ApiGroupsTabs({
	activeGroup,
	onGroupChange,
}: ApiGroupsTabsProps) {
	const { t } = useI18n()

	const groups: { id: ApiGroup; label: string; icon: JSX.Element }[] = [
		{
			id: 'channel',
			label: t.common.groups.channel,
			icon: (
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
						d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
			),
		},
		{
			id: 'device',
			label: t.common.groups.device,
			icon: (
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
						d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
					/>
				</svg>
			),
		},
		{
			id: 'fingerprint',
			label: t.common.groups.fingerprint,
			icon: (
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
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
			),
		},
		{
			id: 'message',
			label: t.common.groups.message,
			icon: (
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
						d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
					/>
				</svg>
			),
		},
	]

	return (
		<div className="bg-secondary/30 rounded-lg p-2 border border-border">
			<div className="flex gap-2 overflow-x-auto">
				{groups.map((group) => {
					const isActive = activeGroup === group.id
					return (
						<button
							key={group.id}
							onClick={() => onGroupChange(group.id)}
							className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
								isActive
									? 'bg-blue-600 text-white'
									: 'bg-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
							}`}
							style={
								isActive
									? { backgroundColor: '#2563eb' }
									: undefined
							}
						>
							<span className="flex-shrink-0">{group.icon}</span>
							<span>{group.label}</span>
						</button>
					)
				})}
			</div>
		</div>
	)
}
