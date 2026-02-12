'use client'

import { useState, useEffect } from 'react'
import LanguageSwitcher from '@/components/language-switcher'
import WorkflowDiagram from '@/components/workflow-diagram'
import CurlCommandView from '@/components/curl-command-view'
import BodyEditor from '@/components/body-editor'
import { useI18n } from '@/lib/i18n/context'
import { getSteps, type Step } from '@/lib/api/steps'

const STORAGE_KEY_DOMAIN = 'sms-integration-domain'
const STORAGE_KEY_TOKEN = 'sms-integration-token'

const DEFAULT_DOMAIN = 'https://audit-drm-api-dev.sigmadrm.com'
const DEFAULT_TOKEN = 'MTRwZTRkejc3amxubW4wcWdlcjFuM2QzbnRjcXI0MDg3MXJ2aGxyMzhtc2lmZTZnbWhmcnNnM3J4bXd6bnIwcjBuYWc2enp0N2lrNTFpczRnOWhqN2cxOXUxejJtdzVsd3ptNXRrMWIyM3poY2k5dXRsZWRzMXV2OGkzYWlxYzA='

const APP_VERSION = '1.0.0'

export default function Home() {
	const { t } = useI18n()
	
	// Initialize state from localStorage or defaults
	const [domain, setDomain] = useState(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem(STORAGE_KEY_DOMAIN)
			return stored || DEFAULT_DOMAIN
		}
		return DEFAULT_DOMAIN
	})
	
	const [token, setToken] = useState(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem(STORAGE_KEY_TOKEN)
			return stored || DEFAULT_TOKEN
		}
		return DEFAULT_TOKEN
	})
	
	const [showToken, setShowToken] = useState(false)
	
	// Save domain to localStorage whenever it changes
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY_DOMAIN, domain)
		}
	}, [domain])
	
	// Save token to localStorage whenever it changes
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY_TOKEN, token)
		}
	}, [token])
	const [selectedStepId, setSelectedStepId] = useState<string | null>(
		null
	)
	const [stepBodies, setStepBodies] = useState<
		Record<string, Record<string, any>>
	>({})

	const steps = getSteps()
	const foundStep = selectedStepId
		? steps.find((s) => s.id === selectedStepId)
		: undefined
	const selectedStep: Step | null = foundStep ?? null

	const handleBodyChange = (
		stepId: string,
		body: Record<string, any>
	) => {
		setStepBodies((prev) => ({
			...prev,
			[stepId]: body,
		}))
	}

	const currentBody = selectedStepId ? stepBodies[selectedStepId] || {} : {}

	return (
		<main className="min-h-screen bg-background p-8">
			<div className="max-w-[95%] mx-auto">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-bold text-foreground">
						{t.common.title}
					</h1>
					<div className="flex items-center gap-4">
						<span className="text-sm text-muted-foreground font-mono">
							v{APP_VERSION}
						</span>
						<LanguageSwitcher />
					</div>
				</div>

				{/* Domain and Token Inputs - Inline */}
				<div className="bg-card rounded-xl shadow-xl p-6 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Domain Input - 2/3 */}
						<div className="md:col-span-2">
							<label
								htmlFor="domain"
								className="block text-sm font-medium text-foreground mb-3"
							>
								{t.common.domainLabel}
							</label>
							<input
								id="domain"
								type="text"
								value={domain}
								onChange={(e) => setDomain(e.target.value)}
								placeholder={t.common.domainPlaceholder}
								className="w-full px-4 py-3 bg-input rounded-lg text-foreground placeholder-muted-foreground/60 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all border border-border"
							/>
						</div>

						{/* Token Input - 1/3 */}
						<div>
							<label
								htmlFor="token"
								className="block text-sm font-medium text-foreground mb-3"
							>
								{t.common.tokenLabel}
							</label>
							<div className="relative">
								<input
									id="token"
									type={showToken ? 'text' : 'password'}
									value={token}
									onChange={(e) => setToken(e.target.value)}
									placeholder={t.common.tokenPlaceholder}
									className="w-full px-4 py-3 pr-12 bg-input rounded-lg text-foreground placeholder-muted-foreground/60 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all border border-border"
								/>
								<button
									type="button"
									onClick={() => setShowToken(!showToken)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									aria-label={showToken ? 'Hide token' : 'Show token'}
								>
									{showToken ? (
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
												d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
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
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
											/>
										</svg>
									)}
								</button>
							</div>
							<p className="text-xs text-muted-foreground mt-2">
								{t.common.tokenHelp}
							</p>
						</div>
					</div>
				</div>

				{/* Main Layout: 2 Columns */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Left Column: Workflow Diagram */}
					<div className="lg:col-span-1">
						<WorkflowDiagram
							steps={steps}
							selectedStepId={selectedStepId}
							onStepSelect={setSelectedStepId}
							domain={domain}
							token={token}
						/>
					</div>

					{/* Right Column: Body Editor and cURL Command */}
					<div className="lg:col-span-1 space-y-6">
						{/* Body Editor */}
						{selectedStep &&
						selectedStep.method !== 'GET' &&
						selectedStep.method !== 'DELETE' ? (
							<BodyEditor
								stepId={selectedStep.id}
								onBodyChange={(body) =>
									handleBodyChange(selectedStep.id, body)
								}
								domain={domain}
								token={token}
								onJumpToStep={setSelectedStepId}
							/>
						) : (
							<div className="bg-card rounded-xl shadow-xl p-4">
								<div className="text-center py-8 text-muted-foreground text-sm">
									<p>Select a step that requires a request body</p>
								</div>
							</div>
						)}

						{/* cURL Command */}
						<CurlCommandView
							step={selectedStep}
							domain={domain}
							token={token}
							body={currentBody}
							onTokenChange={setToken}
						/>
					</div>
				</div>
			</div>
		</main>
	)
}
