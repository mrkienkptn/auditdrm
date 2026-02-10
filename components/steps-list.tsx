'use client'

import { useI18n } from '@/lib/i18n/context'
import { type Step } from '@/lib/api/steps'
import ApiGroupsTabs, { type ApiGroup } from '@/components/api-groups-tabs'

interface StepsListProps {
	steps: Step[]
	selectedStepId: number | string | null
	onStepSelect: (stepId: number | string) => void
	activeGroup: ApiGroup
	onGroupChange: (group: ApiGroup) => void
}

export default function StepsList({
	steps,
	selectedStepId,
	onStepSelect,
	activeGroup,
	onGroupChange,
}: StepsListProps) {
	const { t } = useI18n()

	const getStepTitle = (stepId: number | string): string => {
		return t.steps[String(stepId)]?.title || `Step ${stepId}`
	}

	const getStepDescription = (stepId: number | string): string => {
		return t.steps[String(stepId)]?.description || ''
	}

	return (
		<div className="bg-card rounded-xl shadow-xl flex flex-col max-h-[calc(100vh-12rem)]">
			{/* API Groups Tabs - Pinned at top */}
			<div className="p-6 pb-4 border-b border-border flex-shrink-0">
				<ApiGroupsTabs
					activeGroup={activeGroup}
					onGroupChange={onGroupChange}
				/>
			</div>
			{/* Steps List - Scrollable */}
			<div className="flex-1 overflow-y-auto p-6 pt-4">
				<div className="space-y-3">
					{steps.map((step) => {
						const stepId = String(step.id)
						const isSelected = selectedStepId === step.id
						return (
							<button
								key={stepId}
								onClick={() => onStepSelect(step.id)}
								className={`w-full text-left p-4 rounded-xl transition-all duration-200 border ${
									isSelected
										? 'bg-primary text-white shadow-lg border-primary'
										: 'bg-secondary/30 hover:bg-secondary/50 border-border'
								}`}
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<span
												className={`text-xs px-2 py-1 rounded font-medium ${
													isSelected
														? step.method === 'GET'
															? 'bg-white/20 text-white'
															: step.method === 'POST'
															? 'bg-white/20 text-white'
															: step.method === 'PUT'
															? 'bg-white/20 text-white'
															: 'bg-white/20 text-white'
														: step.method === 'GET'
														? 'bg-green-900/50 text-green-300'
														: step.method === 'POST'
														? 'bg-blue-900/50 text-blue-300'
														: step.method === 'PUT'
														? 'bg-yellow-900/50 text-yellow-300'
														: 'bg-red-900/50 text-red-300'
												}`}
											>
												{step.method}
											</span>
										</div>
										<h3
											className={`font-semibold ${
												isSelected ? 'text-white' : 'text-foreground'
											}`}
										>
											{getStepTitle(step.id)}
										</h3>
										<p
											className={`text-sm mt-1 ${
												isSelected ? 'text-white/80' : 'text-muted-foreground'
											}`}
										>
											{getStepDescription(step.id)}
										</p>
									</div>
								</div>
							</button>
						)
					})}
				</div>
			</div>
		</div>
	)
}
