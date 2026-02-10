'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { type Step } from '@/lib/api/steps'
import { fetchStbVendors } from '@/lib/api/stb-vendors'

interface WorkflowDiagramProps {
	steps: Step[]
	selectedStepId: string | null
	onStepSelect: (stepId: string) => void
	domain: string
	token: string
}

interface WorkflowStep {
	id: string
	title: string
	description: string
	section: 'customer' | 'content' | 'player' | 'assignment'
	requires?: string[]
	step?: Step
}

export default function WorkflowDiagram({
	steps,
	selectedStepId,
	onStepSelect,
	domain,
	token,
}: WorkflowDiagramProps) {
	const { t } = useI18n()
	const [stbVendors, setStbVendors] = useState<any[]>([])
	const [loadingVendors, setLoadingVendors] = useState(false)

	// Fetch STB vendors to check if Add Device can be enabled
	useEffect(() => {
		if (domain && token) {
			setLoadingVendors(true)
			fetchStbVendors(domain, token)
				.then((data) => {
					setStbVendors(data)
				})
				.catch((error) => {
					console.error('Failed to fetch STB vendors:', error)
					setStbVendors([])
				})
				.finally(() => {
					setLoadingVendors(false)
				})
		}
	}, [domain, token])

	const getStepTitle = (stepId: string): string => {
		return t.steps[stepId]?.title || `Step ${stepId}`
	}

	const getStepDescription = (stepId: string): string => {
		return t.steps[stepId]?.description || ''
	}

	// Define workflow steps
	const workflowSteps: WorkflowStep[] = [
		// Customer Section
		{
			id: 'create_stb_vendor',
			title: getStepTitle('create_stb_vendor'),
			description: getStepDescription('create_stb_vendor'),
			section: 'customer',
			step: steps.find((s) => s.id === 'create_stb_vendor'),
		},
		{
			id: 'import_devices',
			title: getStepTitle('import_devices'),
			description: getStepDescription('import_devices'),
			section: 'customer',
			requires: ['STB vendor'],
			step: steps.find((s) => s.id === 'import_devices'),
		},
		{
			id: 'add_device',
			title: getStepTitle('add_device'),
			description: getStepDescription('add_device'),
			section: 'customer',
			requires: ['STB vendor'],
			step: stbVendors.length > 0 ? steps.find((s) => s.id === 'add_device') : undefined,
		},
		{
			id: 'pair_device_to_subscriber',
			title: getStepTitle('pair_device_to_subscriber'),
			description: getStepDescription('pair_device_to_subscriber'),
			section: 'customer',
			step: steps.find((s) => s.id === 'pair_device_to_subscriber'),
		},
		// Content Section
		{
			id: 'create_broadcaster',
			title: getStepTitle('create_broadcaster'),
			description: getStepDescription('create_broadcaster'),
			section: 'content',
			step: steps.find((s) => s.id === 'create_broadcaster'),
		},
		{
			id: 'add_channel',
			title: getStepTitle('add_channel'),
			description: getStepDescription('add_channel'),
			section: 'content',
			step: steps.find((s) => s.id === 'add_channel'),
		},
		{
			id: 'add_package',
			title: getStepTitle('add_package'),
			description: getStepDescription('add_package'),
			section: 'content',
			step: steps.find((s) => s.id === 'add_package'),
		},
		// Player Section
		{
			id: 'configure_message',
			title: getStepTitle('configure_message'),
			description: getStepDescription('configure_message'),
			section: 'player',
			step: steps.find((s) => s.id === 'configure_message'),
		},
		{
			id: 'configure_fingerprint',
			title: getStepTitle('configure_fingerprint'),
			description: getStepDescription('configure_fingerprint'),
			section: 'player',
			step: steps.find((s) => s.id === 'configure_fingerprint'),
		},
		// Assignment Section
		{
			id: 'assign_package_to_device',
			title: getStepTitle('assign_package_to_device'),
			description: getStepDescription('assign_package_to_device'),
			section: 'assignment',
			step: steps.find((s) => s.id === 'assign_package_to_device'),
		},
		{
			id: 'add_channel_to_package',
			title: getStepTitle('add_channel_to_package'),
			description: getStepDescription('add_channel_to_package'),
			section: 'assignment',
			step: steps.find((s) => s.id === 'add_channel_to_package'),
		},
		{
			id: 'renew_subscription',
			title: getStepTitle('renew_subscription'),
			description: getStepDescription('renew_subscription'),
			section: 'assignment',
			step: steps.find((s) => s.id === 'renew_subscription'),
		},
	]

	// Organize steps
	const customerSteps = [
		workflowSteps.find((s) => s.id === 'create_stb_vendor'),
		workflowSteps.find((s) => s.id === 'import_devices'),
		workflowSteps.find((s) => s.id === 'add_device'),
		workflowSteps.find((s) => s.id === 'pair_device_to_subscriber'),
	].filter((s): s is WorkflowStep => s !== undefined)
	
	const contentSteps = [
		workflowSteps.find((s) => s.id === 'create_broadcaster'),
		workflowSteps.find((s) => s.id === 'add_channel'),
	].filter((s): s is WorkflowStep => s !== undefined)
	
	const addPackageStep = workflowSteps.find((s) => s.id === 'add_package')
	
	const playerSteps = [
		workflowSteps.find((s) => s.id === 'configure_message'),
		workflowSteps.find((s) => s.id === 'configure_fingerprint'),
	].filter((s): s is WorkflowStep => s !== undefined)
	
	const assignmentSteps = [
		workflowSteps.find((s) => s.id === 'assign_package_to_device'),
		workflowSteps.find((s) => s.id === 'add_channel_to_package'),
		workflowSteps.find((s) => s.id === 'renew_subscription'),
	].filter((s): s is WorkflowStep => s !== undefined)

	const renderStepCard = (workflowStep: WorkflowStep | undefined, cardId: string, showArrowDown = false) => {
		if (!workflowStep) {
			return null
		}
		
		const isDeviceAdd = workflowStep.id === 'add_device'
		const isImportDevices = workflowStep.id === 'import_devices'
		const isPairDevice = workflowStep.id === 'pair_device_to_subscriber'
		const isMainFeature = workflowStep.id === 'assign_package_to_device' || workflowStep.id === 'renew_subscription'
		const hasStbVendors = stbVendors.length > 0
		const hasStep = isDeviceAdd 
			? hasStbVendors && !!workflowStep.step
			: isImportDevices
			? true
			: !!workflowStep.step
		
		const isSelected = isDeviceAdd && hasStbVendors
			? selectedStepId === 'add_device'
			: isImportDevices
			? selectedStepId === 'import_devices'
			: isPairDevice
			? selectedStepId === 'pair_device_to_subscriber'
			: selectedStepId === workflowStep.id && !!workflowStep.step

		return (
			<div key={String(workflowStep.id)} className="relative">
				<div
					className={`relative rounded-lg p-3 ${
						hasStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
					} ${
						isMainFeature 
							? 'bg-primary/10 border-2 border-primary/50 shadow-lg' 
							: 'bg-card border border-border'
					}`}
					onClick={() => {
						if (!hasStep) {
							return
						}
						
					if (isDeviceAdd && hasStbVendors) {
						onStepSelect('add_device')
						return
					}
					
					if (isImportDevices) {
						onStepSelect('import_devices')
						return
					}
					
					const stepIdToSelect = workflowStep.step ? workflowStep.step.id : workflowStep.id
					onStepSelect(stepIdToSelect)
					}}
				>
					<div
						className={`p-3 rounded-lg border transition-all ${
							isSelected
								? 'bg-primary border-primary shadow-lg'
								: isMainFeature
								? 'bg-primary/10 border-primary/50 shadow-md'
								: hasStep
								? 'bg-card border-border hover:border-primary/50 hover:shadow-md'
								: 'bg-card/50 border-border/50'
						}`}
					>
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1 min-w-0">
								<h3
									className={`text-xs font-semibold mb-1 ${
										isSelected ? 'text-white' : 'text-foreground'
									}`}
								>
									{workflowStep.title}
								</h3>
								{workflowStep.description && (
									<p
										className={`text-[10px] ${
											isSelected ? 'text-white/80' : 'text-muted-foreground'
										}`}
									>
										{workflowStep.description}
									</p>
								)}
								{workflowStep.requires && workflowStep.requires.length > 0 && (
									<p
										className={`text-[10px] mt-1 ${
											isSelected ? 'text-white/70' : 'text-muted-foreground/70'
										}`}
									>
										Requires: {workflowStep.requires.join(', ')}
									</p>
								)}
								{workflowStep.step && (
									<span
										className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded ${
											isSelected
												? 'bg-white/20 text-white'
												: workflowStep.step.method === 'GET'
												? 'bg-green-900/50 text-green-300'
												: workflowStep.step.method === 'POST'
												? 'bg-blue-900/50 text-blue-300'
												: workflowStep.step.method === 'PUT'
												? 'bg-yellow-900/50 text-yellow-300'
												: 'bg-red-900/50 text-red-300'
										}`}
									>
										{workflowStep.step.method}
									</span>
								)}
							</div>
						</div>
					</div>
				</div>
				{/* Simple arrow down */}
				{showArrowDown && (
					<div className="flex justify-center mt-2 mb-1">
						<svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</div>
				)}
			</div>
		)
	}

	return (
		<div className="bg-card rounded-xl shadow-xl p-4">
			<div className="space-y-6">
				{/* Top Row: Customer, Content, Player Sections */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Customer Section */}
					<div className="space-y-3">
						<h2 className="text-sm font-bold text-foreground mb-4 text-center border-b border-border pb-1">
							Customer
						</h2>
						<div className="space-y-3">
							{customerSteps[0] && renderStepCard(customerSteps[0], 'customer-create_stb_vendor', true)}
							{customerSteps[1] && renderStepCard(customerSteps[1], 'customer-import_devices', true)}
							{customerSteps[2] && renderStepCard(customerSteps[2], 'customer-add_device', true)}
							{customerSteps[3] && renderStepCard(customerSteps[3], 'customer-pair_device_to_subscriber', false)}
						</div>
					</div>

					{/* Content Section */}
					<div className="space-y-3">
						<h2 className="text-sm font-bold text-foreground mb-4 text-center border-b border-border pb-1">
							Content
						</h2>
						<div className="space-y-3">
							{contentSteps[0] && renderStepCard(contentSteps[0], 'content-create_broadcaster', true)}
							{/* Add Package - same level as Add Channel */}
							{addPackageStep && renderStepCard(addPackageStep, 'content-add_package', false)}
							{contentSteps[1] && renderStepCard(contentSteps[1], 'content-add_channel', false)}
							{assignmentSteps[1] && renderStepCard(assignmentSteps[1], 'assignment-add_channel_to_package', false)}
						</div>
					</div>

					{/* Player Section */}
					<div className="space-y-3">
						<h2 className="text-sm font-bold text-foreground mb-4 text-center border-b border-border pb-1">
							Player
						</h2>
						<div className="space-y-3">
							{playerSteps[0] && renderStepCard(playerSteps[0], 'player-configure_message', true)}
							{playerSteps[1] && renderStepCard(playerSteps[1], 'player-configure_fingerprint', false)}
						</div>
					</div>
				</div>

				{/* Dashed separator line */}
				<div className="border-t border-dashed border-border/50 my-6"></div>

				{/* Bottom Row: Assignment Steps */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{assignmentSteps[0] && renderStepCard(assignmentSteps[0], 'assignment-assign_package_to_device', false)}
					{assignmentSteps[2] && renderStepCard(assignmentSteps[2], 'assignment-renew_subscription', false)}
				</div>
			</div>
		</div>
	)
}
