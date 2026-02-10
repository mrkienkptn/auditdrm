'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'
import CopyButton from '@/components/ui/copy-button'
import { type Step } from '@/lib/api/steps'
import { apiRequest } from '@/lib/api/client'

interface CurlCommandViewProps {
	step: Step | null
	domain: string
	token: string
	body: Record<string, any>
	onTokenChange: (token: string) => void
}

interface ApiResponse {
	status: number
	statusText: string
	headers: Record<string, string>
	data: any
}

export default function CurlCommandView({
	step,
	domain,
	token,
	body,
	onTokenChange,
}: CurlCommandViewProps) {
	const { t } = useI18n()
	const [loading, setLoading] = useState(false)
	const [response, setResponse] = useState<ApiResponse | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [isExpanded, setIsExpanded] = useState(false)

	const getStepTitle = (stepId: string): string => {
		return t.steps[stepId]?.title || `Step ${stepId}`
	}

	const getStepDescription = (stepId: string): string => {
		return t.steps[stepId]?.description || ''
	}

	const generateCurlCommand = (step: Step): string => {
		if (!domain) {
			return t.common.selectStep
		}

		// Replace path parameters like {packageId} with actual values from body
		let endpoint = step.endpoint
		if (step.id === 'add_channel_to_package' && body.packageId) {
			endpoint = endpoint.replace('{packageId}', String(body.packageId))
		}
		
		// For configure_fingerprint, change endpoint based on type
		if (step.id === 'configure_fingerprint' && body.type) {
			const typeEndpoints: Record<string, string> = {
				package: '/packages/v1/fingerprint/enable',
				channel: '/channels/v1/fingerprint/enable',
				device: '/stb/v1/fp/enable',
				subscriber: '/subscriber/v1/fp/enable',
			}
			endpoint = typeEndpoints[body.type] || step.endpoint
		}

		const url = `${domain}${endpoint}`
		const method = step.method
		const isStep1 = step.id === 'get_token'
		const isFileUpload = step.id === 'import_devices' && body.file

		// get_token step doesn't need x-credential header (it's for getting token)
		if (isStep1) {
			if (method === 'GET') {
				return `curl -X ${method} "${url}"`
			}
			const bodyForRequest = step.id === 'add_channel_to_package' && body.packageId
				? Object.fromEntries(Object.entries(body).filter(([key]) => key !== 'packageId'))
				: body
			const bodyJson = JSON.stringify(bodyForRequest, null, 2)
			const formattedBody = bodyJson.replace(/'/g, "'\\''")
			return `curl -X ${method} "${url}" \\\n  -H "Content-Type: application/json" \\\n  -d '${formattedBody}'`
		}

		// Other steps use x-credential header with token
		const credentialHeader = token
			? `-H "x-credential: ${token}"`
			: '-H "x-credential: YOUR_TOKEN"'

		// File upload step (import_devices)
		if (isFileUpload) {
			const fileName = body.file instanceof File ? body.file.name : 'file.xlsx'
			return `curl --location "${url}" \\\n  ${credentialHeader} \\\n  -H "Authorization: ••••••" \\\n  --form 'file=@"${fileName}"'`
		}

		if (method === 'GET') {
			return `curl -X ${method} "${url}" \\\n  ${credentialHeader}`
		}

		// For add_channel_to_package, remove packageId from body since it's in the URL
		let bodyForRequest = step.id === 'add_channel_to_package' && body.packageId
			? Object.fromEntries(Object.entries(body).filter(([key]) => key !== 'packageId'))
			: body
		
		// For configure_fingerprint, format body based on type
		if (step.id === 'configure_fingerprint' && body.type) {
			bodyForRequest = {}
			if (body.type === 'package' && body.packageIds && Array.isArray(body.packageIds)) {
				bodyForRequest.ids = body.packageIds
			} else if (body.type === 'channel' && body.channelIds && Array.isArray(body.channelIds)) {
				bodyForRequest.ids = body.channelIds
			} else if (body.type === 'device' && body.deviceIds && Array.isArray(body.deviceIds)) {
				bodyForRequest.deviceIds = body.deviceIds
			} else if (body.type === 'subscriber' && body.subscriberIds && Array.isArray(body.subscriberIds)) {
				bodyForRequest.ids = body.subscriberIds
			}
		}
		const bodyJson = JSON.stringify(bodyForRequest, null, 2)
		const formattedBody = bodyJson.replace(/'/g, "'\\''")

		return `curl -X ${method} "${url}" \\\n  -H "Content-Type: application/json" \\\n  ${credentialHeader} \\\n  -d '${formattedBody}'`
	}

	const executeApi = async () => {
		if (!step || !domain) {
			setError('Please provide domain and select a step')
			return
		}

		setLoading(true)
		setError(null)
		setResponse(null)

		try {
			const isStep1 = step.id === 'get_token'
			const isFileUpload = step.id === 'import_devices' && body.file
			const method = step.method as 'GET' | 'POST' | 'PUT' | 'DELETE'

			// Use token only if not get_token step (get_token is for getting token)
			const requestToken = isStep1 ? '' : token

			// Replace path parameters like {packageId} with actual values from body
			let endpoint = step.endpoint
			if (step.id === 'add_channel_to_package' && body.packageId) {
				endpoint = endpoint.replace('{packageId}', String(body.packageId))
			}
			
			// For configure_fingerprint, change endpoint based on type
			if (step.id === 'configure_fingerprint' && body.type) {
				const typeEndpoints: Record<string, string> = {
					package: '/packages/v1/fingerprint/enable',
					channel: '/channels/v1/fingerprint/enable',
					device: '/stb/v1/fp/enable',
					subscriber: '/subscriber/v1/fp/enable',
				}
				endpoint = typeEndpoints[body.type] || step.endpoint
			}

			// Handle file upload (import_devices)
			if (isFileUpload && body.file instanceof File) {
				const useProxy = process.env.NEXT_PUBLIC_USE_PROXY !== 'false'
				
				if (useProxy) {
					// Use proxy-upload endpoint for file upload
					const formData = new FormData()
					formData.append('url', `${domain}${endpoint}`)
					formData.append('token', requestToken)
					formData.append('file', body.file)

					const proxyUrl = '/api/proxy-upload'
					const response = await fetch(proxyUrl, {
						method: 'POST',
						body: formData,
					})

					const proxyResponse = await response.json()
					setResponse({
						status: proxyResponse.status || 200,
						statusText: proxyResponse.statusText || 'OK',
						headers: proxyResponse.headers || {},
						data: proxyResponse.data,
					})
					// Auto-expand after executing
					setIsExpanded(true)
					return
				} else {
					// Direct file upload (production mode)
					const formData = new FormData()
					formData.append('file', body.file)

					const headers: Record<string, string> = {}
					if (requestToken) {
						headers['x-credential'] = requestToken
					}
					headers['Authorization'] = 'Bearer ••••••'

					const response = await fetch(`${domain}${endpoint}`, {
						method: 'POST',
						headers,
						body: formData,
					})

					const contentType = response.headers.get('content-type') || ''
					const responseText = await response.text()
					let responseData: any

					if (contentType.includes('application/json')) {
						try {
							responseData = JSON.parse(responseText)
						} catch {
							responseData = responseText
						}
					} else {
						responseData = responseText
					}

					const responseHeaders: Record<string, string> = {}
					response.headers.forEach((value, key) => {
						if (
							!key.toLowerCase().startsWith('access-control') &&
							key.toLowerCase() !== 'content-encoding'
						) {
							responseHeaders[key] = value
						}
					})

					setResponse({
						status: response.status,
						statusText: response.statusText,
						headers: responseHeaders,
						data: responseData,
					})
					// Auto-expand after executing
					setIsExpanded(true)
					return
				}
			}

			// Prepare body for non-GET/DELETE requests
			// For add_channel_to_package, remove packageId from body since it's in the URL
			let requestBody =
				method !== 'GET' && method !== 'DELETE' && Object.keys(body).length > 0
					? { ...body }
					: undefined
			
			if (step.id === 'add_channel_to_package' && requestBody && requestBody.packageId) {
				delete requestBody.packageId
			}
			
			// For configure_fingerprint, format body based on type
			if (step.id === 'configure_fingerprint' && requestBody) {
				const filteredBody: Record<string, any> = {}
				if (requestBody.type === 'package' && requestBody.packageIds && Array.isArray(requestBody.packageIds)) {
					filteredBody.ids = requestBody.packageIds
				} else if (requestBody.type === 'channel' && requestBody.channelIds && Array.isArray(requestBody.channelIds)) {
					filteredBody.ids = requestBody.channelIds
				} else if (requestBody.type === 'device' && requestBody.deviceIds && Array.isArray(requestBody.deviceIds)) {
					filteredBody.deviceIds = requestBody.deviceIds
				} else if (requestBody.type === 'subscriber' && requestBody.subscriberIds && Array.isArray(requestBody.subscriberIds)) {
					filteredBody.ids = requestBody.subscriberIds
				}
				requestBody = filteredBody
			}

			// Use API client utility which handles proxy and token automatically
			const apiResponse = await apiRequest(
				domain,
				endpoint,
				requestToken,
				{
					method,
					body: requestBody,
				}
			)

			// System API response format is {ec, data}, data is already extracted in apiRequest
			setResponse({
				status: apiResponse.status,
				statusText: apiResponse.statusText,
				headers: apiResponse.headers || {},
				data: apiResponse.data,
			})
			// Auto-expand after executing
			setIsExpanded(true)

			// If step 1 and response has token, auto-fill token
			// Check both direct data and nested data structure
			const responseData = apiResponse.data
			if (isStep1 && responseData) {
				const tokenValue =
					(responseData as any)?.token ||
					(responseData as any)?.data?.token
				if (tokenValue) {
					onTokenChange(tokenValue)
				}
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: 'Failed to execute API. This might be a CORS issue.'
			setError(errorMessage)
			// Auto-expand after error
			setIsExpanded(true)
		} finally {
			setLoading(false)
		}
	}

	if (!step) {
		return (
			<div className="bg-card rounded-xl shadow-xl p-4 flex flex-col">
				<div className="flex items-center justify-between flex-shrink-0">
					<h2 className="text-sm font-semibold text-foreground">
						{t.common.curlTitle}
					</h2>
				</div>
				<div className="text-center py-8 text-muted-foreground text-xs mt-2">
					<p>{t.common.selectStep}</p>
				</div>
			</div>
		)
	}

	const curlCommand = generateCurlCommand(step)

	return (
		<div className="bg-card rounded-xl shadow-xl p-4 flex flex-col">
			{/* Header with title, buttons and collapse toggle */}
			<div className="flex items-center justify-between mb-3 flex-shrink-0">
				<div className="flex items-center gap-2">
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="p-1 hover:bg-secondary/50 rounded transition-colors"
						aria-label={isExpanded ? 'Collapse' : 'Expand'}
					>
						<svg
							className={`w-4 h-4 text-muted-foreground transition-transform ${
								isExpanded ? 'rotate-180' : ''
							}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
					<h2 className="text-sm font-semibold text-foreground">
						{t.common.curlTitle}
					</h2>
				</div>
				<div className="flex items-center gap-2">
					<CopyButton text={curlCommand} />
					<button
						onClick={executeApi}
						disabled={loading || !domain}
						className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
					>
						{loading ? (
							<>
								<svg
									className="animate-spin h-3 w-3"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								<span className="text-xs">Executing...</span>
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
										d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span className="text-xs">Execute</span>
							</>
						)}
					</button>
				</div>
			</div>
			{/* Collapsible content */}
			{isExpanded && (
				<div className="flex-1 overflow-y-auto max-h-[calc(100vh-20rem)]">
					<div className="mb-4">
						<h3 className="text-xs font-medium text-foreground mb-1">
							{getStepTitle(step.id)}
						</h3>
						<p className="text-xs text-muted-foreground">
							{getStepDescription(step.id)}
						</p>
					</div>

					{/* API Response - Show first */}
					{(response || error) && (
						<div className="bg-background/50 border border-border rounded-lg p-3 mb-3">
							<h4 className="text-xs font-semibold text-foreground mb-2">
								API Response
							</h4>
							{error && (
								<div className="bg-red-900/20 border border-red-500/50 rounded-lg p-2 mb-2">
									<p className="text-xs text-red-400 font-medium">Error</p>
									<p className="text-xs text-red-300 mt-1">{error}</p>
								</div>
							)}
							{response && (
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<span
											className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
												response.status >= 200 && response.status < 300
													? 'bg-green-900/50 text-green-300'
													: response.status >= 400
													? 'bg-red-900/50 text-red-300'
													: 'bg-yellow-900/50 text-yellow-300'
											}`}
										>
											{response.status} {response.statusText}
										</span>
									</div>
									{Object.keys(response.headers).length > 0 && (
										<div>
											<p className="text-[10px] font-medium text-muted-foreground mb-1">
												Headers:
											</p>
											<pre className="text-[10px] bg-muted/50 rounded p-1.5 overflow-x-auto font-mono text-muted-foreground">
												{JSON.stringify(response.headers, null, 2)}
											</pre>
										</div>
									)}
									<div>
										<p className="text-[10px] font-medium text-muted-foreground mb-1">
											Body:
										</p>
										<pre className="text-[10px] bg-muted/50 rounded p-1.5 overflow-x-auto font-mono text-foreground max-h-48 overflow-y-auto">
											{typeof response.data === 'string'
												? response.data
												: JSON.stringify(response.data, null, 2)}
										</pre>
									</div>
								</div>
							)}
						</div>
					)}

					{/* cURL Command - Show after API Response */}
					<div className="bg-background/50 border border-border rounded-lg p-3 mb-3 overflow-x-auto">
						<pre className="text-green-400 dark:text-green-300 text-xs font-mono whitespace-pre-wrap break-words">
							<code>{curlCommand}</code>
						</pre>
					</div>
					<div className="bg-secondary/40 border border-border/50 rounded-lg p-3">
						<p className="text-xs">
							<strong className="text-foreground">{t.common.method}:</strong>{' '}
							<span className="text-primary font-medium">{step.method}</span>
						</p>
						<p className="text-xs mt-1">
							<strong className="text-foreground">{t.common.endpoint}:</strong>{' '}
							<span className="text-purple-400 dark:text-purple-300 font-mono">{step.endpoint}</span>
						</p>
					</div>
				</div>
			)}
		</div>
	)
}
