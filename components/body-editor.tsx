'use client'

import { useState, useEffect, useRef } from 'react'
import { FieldSchema, stepBodySchemas } from '@/lib/api/schemas'
import { fetchBroadcasters, type Broadcaster } from '@/lib/api/broadcasters'
import { fetchPackages, type Package } from '@/lib/api/packages'
import { fetchChannels, type Channel } from '@/lib/api/channels'
import { fetchStbVendors, type StbVendor } from '@/lib/api/stb-vendors'
import { fetchSubscribers, type Subscriber } from '@/lib/api/subscribers'

interface BodyEditorProps {
	stepId: string
	onBodyChange: (body: Record<string, any>) => void
	domain: string
	token: string
	onJumpToStep?: (stepId: string) => void
}

export default function BodyEditor({
	stepId,
	onBodyChange,
	domain,
	token,
	onJumpToStep,
}: BodyEditorProps) {
	const [body, setBody] = useState<Record<string, any>>({})
	const [broadcasters, setBroadcasters] = useState<Broadcaster[]>([])
	const [loadingBroadcasters, setLoadingBroadcasters] = useState(false)
	const [packages, setPackages] = useState<Package[]>([])
	const [loadingPackages, setLoadingPackages] = useState(false)
	const [channels, setChannels] = useState<Channel[]>([])
	const [loadingChannels, setLoadingChannels] = useState(false)
	const [stbVendors, setStbVendors] = useState<StbVendor[]>([])
	const [loadingStbVendors, setLoadingStbVendors] = useState(false)
	const [subscribers, setSubscribers] = useState<Subscriber[]>([])
	const [loadingSubscribers, setLoadingSubscribers] = useState(false)
	const fields = stepBodySchemas[String(stepId)] || []
	const isInitialMount = useRef(true)
	const prevBodyRef = useRef<Record<string, any>>({})

	// Initialize body when stepId changes
	useEffect(() => {
		const initialBody: Record<string, any> = {}
		fields.forEach((field) => {
			if (field.type === 'array' && field.fields) {
				// For array fields with nested fields, initialize empty array
				initialBody[field.name] = []
			} else {
				initialBody[field.name] = field.defaultValue
			}
		})
		
		// Special handling for configure_fingerprint: initialize with default type
		if (stepId === 'configure_fingerprint') {
			initialBody.type = 'package'
			initialBody.packageIds = []
			initialBody.channelIds = []
			initialBody.deviceIds = []
			initialBody.subscriberIds = []
		}
		
		// Special handling for assign_package_to_device: set timestamps
		if (stepId === 'assign_package_to_device' && initialBody.packages && Array.isArray(initialBody.packages)) {
			// This will be handled when user adds a package
		}
		
		// Sync id with deviceId in add_device step
		if (stepId === 'add_device') {
			if (initialBody.deviceId && !initialBody.id) {
				initialBody.id = initialBody.deviceId
			} else if (initialBody.id && !initialBody.deviceId) {
				initialBody.deviceId = initialBody.id
			} else if (!initialBody.id && !initialBody.deviceId) {
				// Generate random hex if both are empty
				const randomId = Array.from({ length: 16 }, () =>
					Math.floor(Math.random() * 16).toString(16)
				).join('')
				initialBody.id = randomId
				initialBody.deviceId = randomId
			}
		}
		setBody(initialBody)
		prevBodyRef.current = initialBody
		isInitialMount.current = true
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stepId])

	// Sync body changes to parent component (deferred to avoid render phase updates)
	useEffect(() => {
		// Skip initial mount to avoid calling onBodyChange during render
		if (isInitialMount.current) {
			isInitialMount.current = false
			// Use setTimeout to defer initial callback
			const timeoutId = setTimeout(() => {
				onBodyChange(body)
			}, 0)
			return () => clearTimeout(timeoutId)
		}

		// Only call onBodyChange if body actually changed
		if (JSON.stringify(prevBodyRef.current) !== JSON.stringify(body)) {
			prevBodyRef.current = body
			const timeoutId = setTimeout(() => {
				onBodyChange(body)
			}, 0)
			return () => clearTimeout(timeoutId)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [body])

	// Fetch broadcasters for Add Channel step
	useEffect(() => {
		if (stepId === 'add_channel') {
			setLoadingBroadcasters(true)
			fetchBroadcasters(domain, token)
				.then((data) => {
					setBroadcasters(data)
					// Auto-select first broadcaster if available and no broadcasterId is set
					if (data.length > 0 && !body.broadcasterId) {
						setBody((prev) => ({
							...prev,
							broadcasterId: data[0].id
						}))
					}
				})
				.catch((error) => {
					console.error('Failed to fetch broadcasters:', error)
					setBroadcasters([])
				})
				.finally(() => {
					setLoadingBroadcasters(false)
				})
		} else {
			setBroadcasters([])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stepId, domain, token])

	// Fetch packages, channels, devices, subscribers for Configure Fingerprint step
	useEffect(() => {
		if (stepId === 'configure_fingerprint') {
			// Fetch packages
			if (body.type === 'package') {
				setLoadingPackages(true)
				fetchPackages(domain, token)
					.then((data) => {
						setPackages(data)
					})
					.catch((error) => {
						console.error('Failed to fetch packages:', error)
						setPackages([])
					})
					.finally(() => {
						setLoadingPackages(false)
					})
			} else {
				setPackages([])
			}

			// Fetch channels
			if (body.type === 'channel') {
				setLoadingChannels(true)
				fetchChannels(domain, token)
					.then((data) => {
						setChannels(data)
					})
					.catch((error) => {
						console.error('Failed to fetch channels:', error)
						setChannels([])
					})
					.finally(() => {
						setLoadingChannels(false)
					})
			} else {
				setChannels([])
			}

			// Fetch subscribers
			if (body.type === 'subscriber') {
				setLoadingSubscribers(true)
				fetchSubscribers(domain, token)
					.then((data) => {
						setSubscribers(data)
					})
					.catch((error) => {
						console.error('Failed to fetch subscribers:', error)
						setSubscribers([])
					})
					.finally(() => {
						setLoadingSubscribers(false)
					})
			} else {
				setSubscribers([])
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stepId, domain, token, body.type])

	// Fetch packages for Assign Package to Device and Renew Subscription steps
	useEffect(() => {
		if (stepId === 'assign_package_to_device' || stepId === 'renew_subscription') {
			setLoadingPackages(true)
			fetchPackages(domain, token)
				.then((data) => {
					setPackages(data)
				})
				.catch((error) => {
					console.error('Failed to fetch packages:', error)
					setPackages([])
				})
				.finally(() => {
					setLoadingPackages(false)
				})
		} else if (stepId === 'add_channel_to_package') {
			// Fetch packages
			setLoadingPackages(true)
			fetchPackages(domain, token)
				.then((data) => {
					setPackages(data)
					// Auto-select first package if available and no packageId is set
					if (data.length > 0 && !body.packageId) {
						setBody((prev) => ({
							...prev,
							packageId: data[0].id
						}))
					}
				})
				.catch((error) => {
					console.error('Failed to fetch packages:', error)
					setPackages([])
				})
				.finally(() => {
					setLoadingPackages(false)
				})

			// Fetch channels
			setLoadingChannels(true)
			fetchChannels(domain, token)
				.then((data) => {
					setChannels(data)
				})
				.catch((error) => {
					console.error('Failed to fetch channels:', error)
					setChannels([])
				})
				.finally(() => {
					setLoadingChannels(false)
				})
		} else if (stepId !== 'assign_package_to_device' && stepId !== 'renew_subscription') {
			setPackages([])
			setChannels([])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stepId, domain, token])

	// Fetch STB vendors for Add Device step
	useEffect(() => {
		if (stepId === 'add_device') {
			setLoadingStbVendors(true)
			fetchStbVendors(domain, token)
				.then((data) => {
					setStbVendors(data)
					// Auto-select first vendor if available and no vendorId is set
					if (data.length > 0 && !body.vendorId) {
						setBody((prev) => ({
							...prev,
							vendorId: data[0].id
						}))
					}
				})
				.catch((error) => {
					console.error('Failed to fetch STB vendors:', error)
					setStbVendors([])
				})
				.finally(() => {
					setLoadingStbVendors(false)
				})
		} else {
			setStbVendors([])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stepId, domain, token])

	// Fetch subscribers for Add Device step when status is assigned
	useEffect(() => {
		if (stepId === 'add_device' && body.status === 'assigned') {
			setLoadingSubscribers(true)
			fetchSubscribers(domain, token)
				.then((data) => {
					setSubscribers(data)
				})
				.catch((error) => {
					console.error('Failed to fetch subscribers:', error)
					setSubscribers([])
				})
				.finally(() => {
					setLoadingSubscribers(false)
				})
		} else {
			setSubscribers([])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stepId, domain, token, body.status])

	const handleFieldChange = (fieldName: string, value: any) => {
		const newBody = { ...body, [fieldName]: value }
		// Sync id with deviceId in add_device step
		if (
			stepId === 'add_device' &&
			fieldName === 'deviceId'
		) {
			newBody.id = value
		}
		setBody(newBody)
		// onBodyChange will be called via useEffect when body changes
	}

	const generateRandomHex = (): string => {
		// Generate 16-character hex string (like e1e3c77029759ea7)
		return Array.from({ length: 16 }, () =>
			Math.floor(Math.random() * 16).toString(16)
		).join('')
	}

	const handleRandomDeviceId = () => {
		const randomId = generateRandomHex()
		handleFieldChange('deviceId', randomId)
	}

	const handleArrayChange = (fieldName: string, value: string) => {
		try {
			const arrayValue = JSON.parse(value)
			if (Array.isArray(arrayValue)) {
				handleFieldChange(fieldName, arrayValue)
			}
		} catch {
			// Invalid JSON, ignore
		}
	}

	const handleMultiSelectChange = (fieldName: string, selectedOptions: HTMLCollectionOf<HTMLOptionElement>) => {
		const selectedValues = Array.from(selectedOptions)
			.filter((option) => option.selected)
			.map((option) => Number(option.value))
		handleFieldChange(fieldName, selectedValues)
	}

	const handleCheckboxChange = (fieldName: string, channelId: number, checked: boolean) => {
		setBody((prevBody) => {
			const currentArray = Array.isArray(prevBody[fieldName]) ? prevBody[fieldName] : []
			let newArray: number[]
			if (checked) {
				// Only add if not already in array
				if (!currentArray.includes(channelId)) {
					newArray = [...currentArray, channelId]
				} else {
					newArray = currentArray
				}
			} else {
				newArray = currentArray.filter((id: number) => id !== channelId)
			}
			const newBody = { ...prevBody, [fieldName]: newArray }
			onBodyChange(newBody)
			return newBody
		})
	}

	if (fields.length === 0) {
		return null
	}

	return (
		<div className="bg-card rounded-xl shadow-xl p-3 max-h-[calc(100vh-20rem)] overflow-y-auto flex flex-col">
			<h4 className="text-xs font-semibold text-foreground mb-2 flex-shrink-0">
				Request Body
			</h4>
			<div className="space-y-2 flex-1">
				{/* Special handling for configure_fingerprint: show type selector first */}
				{stepId === 'configure_fingerprint' && (
					<div className="bg-secondary/30 rounded-lg p-3 border border-border/50 mb-3">
						<label className="block text-xs font-medium text-foreground mb-2">
							Fingerprint Type
							<span className="text-red-400 ml-1">*</span>
						</label>
						<div className="grid grid-cols-2 gap-2">
							{['package', 'channel', 'device', 'subscriber'].map((type) => (
								<button
									key={type}
									type="button"
									onClick={() => {
										const newBody: Record<string, any> = {
											type,
											packageIds: [],
											channelIds: [],
											deviceIds: [],
											subscriberIds: [],
										}
										// Clear other type fields when switching
										setBody(newBody)
									}}
									className={`px-3 py-2 text-xs rounded-lg border transition-all ${
										body.type === type
											? 'bg-primary text-white border-primary'
											: 'bg-muted text-foreground border-border hover:border-primary/50'
									}`}
								>
									{type === 'package' && 'Bật cho Package'}
									{type === 'channel' && 'Bật cho Kênh'}
									{type === 'device' && 'Bật cho Device'}
									{type === 'subscriber' && 'Bật cho Subscriber'}
								</button>
							))}
						</div>
					</div>
				)}
				{fields.map((field) => {
					// Hide subId field if status is not 'assigned' in add_device step
					if (
						field.name === 'subId' &&
						stepId === 'add_device' &&
						body.status !== 'assigned'
					) {
						return null
					}

					// Hide fingerprint type field (handled separately above)
					if (stepId === 'configure_fingerprint' && field.name === 'type') {
						return null
					}

					// Hide fingerprint ID fields based on selected type
					if (stepId === 'configure_fingerprint') {
						if (field.name === 'packageIds' && body.type !== 'package') {
							return null
						}
						if (field.name === 'channelIds' && body.type !== 'channel') {
							return null
						}
						if (field.name === 'deviceIds' && body.type !== 'device') {
							return null
						}
						if (field.name === 'subscriberIds' && body.type !== 'subscriber') {
							return null
						}
					}

					// Determine if subId is required (when status is assigned)
					const isSubIdRequired =
						field.name === 'subId' &&
						stepId === 'add_device' &&
						body.status === 'assigned'

					return (
						<div key={field.name} className="bg-secondary/30 rounded-lg p-2">
							<label
								htmlFor={field.name}
								className="block text-xs font-medium text-foreground mb-1"
							>
								{field.label}
								{(field.required || isSubIdRequired) && (
									<span className="text-red-400 ml-1">*</span>
								)}
							</label>
							{field.type === 'string' &&
							field.name === 'status' &&
							stepId === 'add_device' ? (
							<select
								id={field.name}
								value={body[field.name] || 'in_stock'}
								onChange={(e) => {
									const newStatus = e.target.value
									handleFieldChange(field.name, newStatus)
									// Clear subId when status changes from assigned to in_stock
									if (newStatus !== 'assigned' && body.subId) {
										handleFieldChange('subId', '')
									}
								}}
								className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all border border-border/50"
							>
								<option value="in_stock" className="bg-muted">
									In stock
								</option>
								<option value="assigned" className="bg-muted">
									Assigned
								</option>
							</select>
							) : field.type === 'string' &&
							field.name === 'subId' &&
							stepId === 'add_device' &&
							body.status === 'assigned' ? (
							<div>
								{loadingSubscribers ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-muted-foreground border border-border/50">
										Loading subscribers...
									</div>
								) : subscribers.length === 0 ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg border border-border/50">
										<p className="text-xs text-muted-foreground mb-1">
											No subscribers found. Please create a subscriber first.
										</p>
										{onJumpToStep && (
											<button
												type="button"
												onClick={() => onJumpToStep('add_subscriber')}
												className="text-xs text-primary hover:text-primary/80 underline"
											>
												Go to Add Subscriber
											</button>
										)}
									</div>
								) : (
									<select
										id={field.name}
										value={body[field.name] ?? ''}
										onChange={(e) =>
											handleFieldChange(field.name, e.target.value)
										}
										className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all border border-border/50"
									>
										<option value="" className="bg-muted">
											Select a subscriber
										</option>
										{subscribers.map((subscriber) => {
											const displayName =
												subscriber.username ||
												subscriber.fullName ||
												`Subscriber ${subscriber.id}`
											return (
												<option
													key={subscriber.id}
													value={subscriber.id}
													className="bg-muted"
												>
													{displayName}
												</option>
											)
										})}
									</select>
								)}
							</div>
							) : field.type === 'string' &&
							field.name === 'vendorId' &&
							stepId === 'add_device' ? (
							<div>
								{loadingStbVendors ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-muted-foreground border border-border/50">
										Loading STB vendors...
									</div>
								) : stbVendors.length === 0 ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg border border-border/50">
										<p className="text-xs text-muted-foreground mb-1">
											No STB vendors found. Please create an STB vendor first.
										</p>
										{onJumpToStep && (
											<button
												type="button"
												onClick={() => onJumpToStep('create_stb_vendor')}
												className="text-xs text-primary hover:text-primary/80 underline"
											>
												Go to Create STB Vendor
											</button>
										)}
									</div>
								) : (
									<select
										id={field.name}
										value={body[field.name] ?? ''}
										onChange={(e) =>
											handleFieldChange(field.name, e.target.value)
										}
										className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all border border-border/50"
									>
										<option value="" className="bg-muted">
											Select a vendor
										</option>
										{stbVendors.map((vendor) => {
											const displayName =
												vendor.companyName ||
												vendor.id ||
												`Vendor ${vendor.id}`
											return (
												<option
													key={vendor.id}
													value={vendor.id}
													className="bg-muted"
												>
													{displayName}
												</option>
											)
										})}
									</select>
								)}
							</div>
							) : field.type === 'string' &&
							field.name === 'id' &&
							stepId === 'add_device' ? (
							<input
								id={field.name}
								type="text"
								value={body[field.name] || body.deviceId || ''}
								readOnly
								className="w-full px-2 py-1.5 text-xs bg-muted/50 rounded-lg text-muted-foreground cursor-not-allowed border border-border/50"
								placeholder={field.description || field.label}
							/>
							) : field.type === 'string' &&
							field.name === 'deviceId' &&
							stepId === 'add_device' ? (
							<div className="flex gap-2">
								<input
									id={field.name}
									type="text"
									value={body[field.name] || ''}
									onChange={(e) =>
										handleFieldChange(field.name, e.target.value)
									}
									className="flex-1 px-2 py-1.5 text-xs bg-muted rounded-lg text-foreground placeholder-muted-foreground/60 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all border border-border/50"
									placeholder={field.description || field.label}
								/>
								<button
									type="button"
									onClick={handleRandomDeviceId}
									className="px-2 py-1.5 text-xs bg-secondary hover:bg-secondary/80 text-foreground rounded-lg border border-border transition-all"
									title="Generate random hex string"
								>
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
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
								</button>
							</div>
							) : field.type === 'array' &&
							field.name === 'packageIds' &&
							stepId === 'configure_fingerprint' &&
							body.type === 'package' ? (
							<div>
								{loadingPackages ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-muted-foreground border border-border/50">
										Loading packages...
									</div>
								) : packages.length === 0 ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg border border-border/50">
										<p className="text-xs text-muted-foreground mb-1">
											No packages found. Please create a package first.
										</p>
										{onJumpToStep && (
											<button
												type="button"
												onClick={() => onJumpToStep('add_package')}
												className="text-xs text-primary hover:text-primary/80 underline"
											>
												Go to Create Package
											</button>
										)}
									</div>
								) : (
									<div className="bg-muted/50 rounded-lg p-4 border border-border/50 max-h-[300px] overflow-y-auto">
										<div className="space-y-3">
											{packages.map((pkg) => {
												const displayName = pkg.name || `Package ${pkg.id}`
												const packageId = String(pkg.id)
												const isChecked = Array.isArray(body[field.name])
													? body[field.name].includes(packageId)
													: false
												return (
													<label
														key={pkg.id}
														htmlFor={`package-${pkg.id}`}
														className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 cursor-pointer transition-colors"
														onClick={(e) => e.stopPropagation()}
													>
														<input
															id={`package-${pkg.id}`}
															type="checkbox"
															checked={isChecked}
															onChange={(e) => {
																const currentArray = Array.isArray(body[field.name]) ? body[field.name] : []
																let newArray: string[]
																if (e.target.checked) {
																	if (!currentArray.includes(packageId)) {
																		newArray = [...currentArray, packageId]
																	} else {
																		newArray = currentArray
																	}
																} else {
																	newArray = currentArray.filter((id: string) => id !== packageId)
																}
																handleFieldChange(field.name, newArray)
															}}
															className="w-4 h-4 text-primary bg-muted border-border rounded focus:ring-2 focus:ring-primary/50 focus:ring-offset-0 cursor-pointer"
														/>
														<div className="flex-1">
															<span className="text-xs font-medium text-foreground">
																{displayName}
															</span>
														</div>
													</label>
												)
											})}
										</div>
									</div>
								)}
								{Array.isArray(body[field.name]) &&
									body[field.name].length > 0 && (
										<p className="text-xs text-muted-foreground mt-2">
											Selected {body[field.name].length} package(s): {body[field.name].join(', ')}
										</p>
									)}
							</div>
							) : field.type === 'array' &&
							field.name === 'channelIds' &&
							stepId === 'configure_fingerprint' &&
							body.type === 'channel' ? (
							<div>
								{loadingChannels ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-muted-foreground border border-border/50">
										Loading channels...
									</div>
								) : channels.length === 0 ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg border border-border/50">
										<p className="text-xs text-muted-foreground mb-1">
											No channels found. Please create a channel first.
										</p>
										{onJumpToStep && (
											<button
												type="button"
												onClick={() => onJumpToStep('add_channel')}
												className="text-xs text-primary hover:text-primary/80 underline"
											>
												Go to Add Channel
											</button>
										)}
									</div>
								) : (
									<div className="bg-muted/50 rounded-lg p-4 border border-border/50 max-h-[300px] overflow-y-auto">
										<div className="space-y-3">
											{channels.map((channel) => {
												const displayName = channel.name || `Channel ${channel.id}`
												const channelId = String(channel.id)
												const isChecked = Array.isArray(body[field.name])
													? body[field.name].includes(channelId)
													: false
												return (
													<label
														key={channel.id}
														htmlFor={`channel-fp-${channel.id}`}
														className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 cursor-pointer transition-colors"
														onClick={(e) => e.stopPropagation()}
													>
														<input
															id={`channel-fp-${channel.id}`}
															type="checkbox"
															checked={isChecked}
															onChange={(e) => {
																const currentArray = Array.isArray(body[field.name]) ? body[field.name] : []
																let newArray: string[]
																if (e.target.checked) {
																	if (!currentArray.includes(channelId)) {
																		newArray = [...currentArray, channelId]
																	} else {
																		newArray = currentArray
																	}
																} else {
																	newArray = currentArray.filter((id: string) => id !== channelId)
																}
																handleFieldChange(field.name, newArray)
															}}
															className="w-4 h-4 text-primary bg-muted border-border rounded focus:ring-2 focus:ring-primary/50 focus:ring-offset-0 cursor-pointer"
														/>
														<div className="flex-1">
															<span className="text-xs font-medium text-foreground">
																{displayName}
															</span>
														</div>
													</label>
												)
											})}
										</div>
									</div>
								)}
								{Array.isArray(body[field.name]) &&
									body[field.name].length > 0 && (
										<p className="text-xs text-muted-foreground mt-2">
											Selected {body[field.name].length} channel(s): {body[field.name].join(', ')}
										</p>
									)}
							</div>
							) : field.type === 'array' &&
							field.name === 'subscriberIds' &&
							stepId === 'configure_fingerprint' &&
							body.type === 'subscriber' ? (
							<div>
								{loadingSubscribers ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-muted-foreground border border-border/50">
										Loading subscribers...
									</div>
								) : subscribers.length === 0 ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg border border-border/50">
										<p className="text-xs text-muted-foreground mb-1">
											No subscribers found. Please create a subscriber first.
										</p>
										{onJumpToStep && (
											<button
												type="button"
												onClick={() => onJumpToStep('add_subscriber')}
												className="text-xs text-primary hover:text-primary/80 underline"
											>
												Go to Add Subscriber
											</button>
										)}
									</div>
								) : (
									<div className="bg-muted/50 rounded-lg p-4 border border-border/50 max-h-[300px] overflow-y-auto">
										<div className="space-y-3">
											{subscribers.map((subscriber) => {
												const displayName =
													subscriber.username ||
													subscriber.fullName ||
													`Subscriber ${subscriber.id}`
												const subscriberId = String(subscriber.id)
												const isChecked = Array.isArray(body[field.name])
													? body[field.name].includes(subscriberId)
													: false
												return (
													<label
														key={subscriber.id}
														htmlFor={`subscriber-fp-${subscriber.id}`}
														className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 cursor-pointer transition-colors"
														onClick={(e) => e.stopPropagation()}
													>
														<input
															id={`subscriber-fp-${subscriber.id}`}
															type="checkbox"
															checked={isChecked}
															onChange={(e) => {
																const currentArray = Array.isArray(body[field.name]) ? body[field.name] : []
																let newArray: string[]
																if (e.target.checked) {
																	if (!currentArray.includes(subscriberId)) {
																		newArray = [...currentArray, subscriberId]
																	} else {
																		newArray = currentArray
																	}
																} else {
																	newArray = currentArray.filter((id: string) => id !== subscriberId)
																}
																handleFieldChange(field.name, newArray)
															}}
															className="w-4 h-4 text-primary bg-muted border-border rounded focus:ring-2 focus:ring-primary/50 focus:ring-offset-0 cursor-pointer"
														/>
														<div className="flex-1">
															<span className="text-xs font-medium text-foreground">
																{displayName}
															</span>
														</div>
													</label>
												)
											})}
										</div>
									</div>
								)}
								{Array.isArray(body[field.name]) &&
									body[field.name].length > 0 && (
										<p className="text-xs text-muted-foreground mt-2">
											Selected {body[field.name].length} subscriber(s): {body[field.name].join(', ')}
										</p>
									)}
							</div>
							) : field.type === 'string' ? (
							<input
								id={field.name}
								type="text"
								value={body[field.name] || ''}
								onChange={(e) =>
									handleFieldChange(field.name, e.target.value)
								}
								className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-foreground placeholder-muted-foreground/60 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all border border-border/50"
								placeholder={field.description || field.label}
							/>
							) : null}
							{field.type === 'number' &&
						field.name === 'packageId' &&
						stepId === 'add_channel_to_package' ? (
							<div>
								{loadingPackages ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-muted-foreground border border-border/50">
										Loading packages...
									</div>
								) : packages.length === 0 ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg border border-border/50">
										<p className="text-xs text-muted-foreground mb-1">
											No packages found. Please create a package first.
										</p>
										{onJumpToStep && (
											<button
												type="button"
												onClick={() => onJumpToStep('add_package')}
												className="text-xs text-primary hover:text-primary/80 underline"
											>
												Go to Create Package
											</button>
										)}
									</div>
								) : (
									<select
										id={field.name}
										value={body[field.name] ?? ''}
										onChange={(e) =>
											handleFieldChange(
												field.name,
												e.target.value === ''
													? ''
													: Number(e.target.value)
											)
										}
										className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all border border-border/50"
									>
										<option value="" className="bg-muted">
											Select a package
										</option>
										{packages.map((pkg) => {
											const displayName =
												pkg.name || `Package ${pkg.id}`
											return (
												<option
													key={pkg.id}
													value={pkg.id}
													className="bg-muted"
												>
													{displayName}
												</option>
											)
										})}
									</select>
								)}
							</div>
						) : field.type === 'number' &&
						field.name === 'broadcasterId' &&
						stepId === 'add_channel' ? (
							<div>
								{loadingBroadcasters ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-muted-foreground border border-border/50">
										Loading broadcasters...
									</div>
								) : broadcasters.length === 0 ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg border border-border/50">
										<p className="text-xs text-muted-foreground mb-1">
											No broadcasters found. Please create a broadcaster first.
										</p>
										{onJumpToStep && (
											<button
												type="button"
												onClick={() => onJumpToStep('create_broadcaster')}
												className="text-xs text-primary hover:text-primary/80 underline"
											>
												Go to Create Broadcaster
											</button>
										)}
									</div>
								) : (
									<select
										id={field.name}
										value={body[field.name] ?? ''}
										onChange={(e) =>
											handleFieldChange(
												field.name,
												e.target.value === ''
													? ''
													: Number(e.target.value)
											)
										}
										className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all border border-border/50"
									>
										<option value="" className="bg-muted">
											Select a broadcaster
										</option>
										{broadcasters.map((broadcaster) => {
											const displayName =
												broadcaster.companyName ||
												broadcaster.name ||
												`Broadcaster ${broadcaster.id}`
											return (
												<option
													key={broadcaster.id}
													value={broadcaster.id}
													className="bg-muted"
												>
													{displayName}
												</option>
											)
										})}
									</select>
								)}
							</div>
						) : field.type === 'number' ? (
							<input
								id={field.name}
								type="number"
								value={body[field.name] ?? ''}
								onChange={(e) =>
									handleFieldChange(
										field.name,
										e.target.value === ''
											? ''
											: Number(e.target.value)
									)
								}
								className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-foreground placeholder-muted-foreground/60 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all border border-border/50"
								placeholder={field.description || field.label}
							/>
						) : null}
						{field.type === 'boolean' && (
							<select
								id={field.name}
								value={String(body[field.name] ?? false)}
								onChange={(e) =>
									handleFieldChange(
										field.name,
										e.target.value === 'true'
									)
								}
								className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all border border-border/50"
							>
								<option value="true" className="bg-muted">True</option>
								<option value="false" className="bg-muted">False</option>
							</select>
						)}
						{field.type === 'array' &&
						field.name === 'channelIds' &&
						stepId === 'add_channel_to_package' ? (
							<div>
								{loadingChannels ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-muted-foreground border border-border/50">
										Loading channels...
									</div>
								) : channels.length === 0 ? (
									<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg border border-border/50">
										<p className="text-xs text-muted-foreground mb-1">
											No channels found. Please create a channel first.
										</p>
										{onJumpToStep && (
											<button
												type="button"
												onClick={() => onJumpToStep('add_channel')}
												className="text-xs text-primary hover:text-primary/80 underline"
											>
												Go to Add Channel
											</button>
										)}
									</div>
								) : (
									<div className="bg-muted/50 rounded-lg p-4 border border-border/50 max-h-[300px] overflow-y-auto">
										<div className="space-y-3">
											{channels.map((channel) => {
												const displayName =
													channel.name || `Channel ${channel.id}`
												// Use accessCriteria if available, otherwise use id
												const channelValue = channel.accessCriteria !== undefined 
													? channel.accessCriteria 
													: channel.id
												const isChecked = Array.isArray(body[field.name])
													? body[field.name].includes(channelValue)
													: false
												return (
													<label
														key={channel.id}
														htmlFor={`channel-${channel.id}`}
														className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 cursor-pointer transition-colors"
													>
														<input
															id={`channel-${channel.id}`}
															type="checkbox"
															name={`channelIds-${channel.id}`}
															value={channelValue}
															checked={isChecked}
															onChange={(e) => {
																e.stopPropagation()
																handleCheckboxChange(
																	field.name,
																	channelValue,
																	e.target.checked
																)
															}}
															className="w-4 h-4 text-primary bg-muted border-border rounded focus:ring-2 focus:ring-primary/50 focus:ring-offset-0 cursor-pointer"
														/>
														<div className="flex-1">
															<div className="flex items-center gap-2">
																<span className="text-xs font-medium text-foreground">
																	{displayName}
																</span>
																{channel.accessCriteria !== undefined && (
																	<span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
																		Access: {channel.accessCriteria}
																	</span>
																)}
															</div>
															{channel.lcn !== undefined && (
																<p className="text-xs text-muted-foreground mt-0.5">
																	LCN: {channel.lcn}
																</p>
															)}
														</div>
													</label>
												)
											})}
										</div>
									</div>
								)}
								{Array.isArray(body[field.name]) &&
									body[field.name].length > 0 && (
										<p className="text-xs text-muted-foreground mt-2">
											Selected {body[field.name].length} channel(s): {body[field.name].join(', ')}
										</p>
									)}
							</div>
						) : field.type === 'array' && field.fields ? (
							// Array with nested fields (e.g., packages array)
							<div className="space-y-2">
								{(body[field.name] || []).map((item: any, index: number) => {
									const nestedFields = field.fields!
									return (
									<div key={index} className="bg-muted/30 rounded-lg p-3 border border-border/50">
										<div className="flex items-center justify-between mb-2">
											<span className="text-xs font-medium text-foreground">
												Package {index + 1}
											</span>
											<button
												type="button"
												onClick={() => {
													const newArray = [...(body[field.name] || [])]
													newArray.splice(index, 1)
													handleFieldChange(field.name, newArray)
												}}
												className="text-xs text-red-400 hover:text-red-300"
											>
												Remove
											</button>
										</div>
										<div className="space-y-2">
											{nestedFields.map((nestedField) => (
												<div key={nestedField.name}>
													<label className="block text-xs font-medium text-foreground mb-1">
														{nestedField.label}
														{nestedField.required && (
															<span className="text-red-400 ml-1">*</span>
														)}
													</label>
													{nestedField.type === 'string' && 
													nestedField.name === 'packageId' && 
													(stepId === 'assign_package_to_device' || stepId === 'renew_subscription') ? (
														<div>
															{loadingPackages ? (
																<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-muted-foreground border border-border/50">
																	Loading packages...
																</div>
															) : packages.length === 0 ? (
																<div className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg border border-border/50">
																	<p className="text-xs text-muted-foreground mb-1">
																		No packages found. Please create a package first.
																	</p>
																	{onJumpToStep && (
																		<button
																			type="button"
																			onClick={() => onJumpToStep('add_package')}
																			className="text-xs text-primary hover:text-primary/80 underline"
																		>
																			Go to Create Package
																		</button>
																	)}
																</div>
															) : (
																<select
																	value={item?.[nestedField.name] ?? ''}
																	onChange={(e) => {
																		const newArray = [...(body[field.name] || [])]
																		newArray[index] = {
																			...newArray[index],
																			[nestedField.name]: e.target.value,
																		}
																		handleFieldChange(field.name, newArray)
																	}}
																	className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all border border-border/50"
																>
																	<option value="" className="bg-muted">
																		Select a package
																	</option>
																	{packages.map((pkg) => (
																		<option
																			key={pkg.id}
																			value={pkg.id}
																			className="bg-muted"
																		>
																			{pkg.name || `Package ${pkg.id}`}
																		</option>
																	))}
																</select>
															)}
														</div>
													) : nestedField.type === 'string' ? (
														<input
															type="text"
															value={item?.[nestedField.name] ?? nestedField.defaultValue ?? ''}
															onChange={(e) => {
																const newArray = [...(body[field.name] || [])]
																newArray[index] = {
																	...newArray[index],
																	[nestedField.name]: e.target.value,
																}
																handleFieldChange(field.name, newArray)
															}}
															className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-foreground placeholder-muted-foreground/60 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all border border-border/50"
															placeholder={nestedField.description || nestedField.label}
														/>
													) : nestedField.type === 'number' && 
													(nestedField.name === 'fromDate' || nestedField.name === 'toDate') ? (
														// Date picker for fromDate and toDate (display as date, store as epoch milliseconds)
														<input
															type="date"
															value={
																item?.[nestedField.name] && item[nestedField.name] > 0
																	? new Date(item[nestedField.name]).toISOString().split('T')[0]
																	: ''
															}
															onChange={(e) => {
																const newArray = [...(body[field.name] || [])]
																const dateValue = e.target.value
																// Convert date string (YYYY-MM-DD) to epoch timestamp in milliseconds
																const epochValue = dateValue 
																	? new Date(dateValue).getTime()
																	: 0
																newArray[index] = {
																	...newArray[index],
																	[nestedField.name]: epochValue,
																}
																handleFieldChange(field.name, newArray)
															}}
															className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-foreground placeholder-muted-foreground/60 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all border border-border/50"
														/>
													) : nestedField.type === 'number' ? (
														<input
															type="number"
															value={item?.[nestedField.name] ?? nestedField.defaultValue ?? ''}
															onChange={(e) => {
																const newArray = [...(body[field.name] || [])]
																newArray[index] = {
																	...newArray[index],
																	[nestedField.name]: e.target.value === '' ? '' : Number(e.target.value),
																}
																handleFieldChange(field.name, newArray)
															}}
															className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-foreground placeholder-muted-foreground/60 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all border border-border/50"
															placeholder={nestedField.description || nestedField.label}
														/>
													) : null}
												</div>
											))}
										</div>
									</div>
									)
								})}
								<button
									type="button"
									onClick={() => {
										const newItem: any = {}
										const currentTimestamp = Date.now() // milliseconds
										const oneMonthLater = currentTimestamp + (30 * 24 * 60 * 60 * 1000) // milliseconds
										
										field.fields?.forEach((nestedField) => {
											// Set timestamps dynamically for assign_package_to_device and renew_subscription
											if (stepId === 'assign_package_to_device' || stepId === 'renew_subscription') {
												if (nestedField.name === 'fromDate') {
													newItem[nestedField.name] = currentTimestamp
												} else if (nestedField.name === 'toDate') {
													newItem[nestedField.name] = oneMonthLater
												} else {
													newItem[nestedField.name] = nestedField.defaultValue
												}
											} else {
												newItem[nestedField.name] = nestedField.defaultValue
											}
										})
										handleFieldChange(field.name, [...(body[field.name] || []), newItem])
									}}
									className="w-full px-3 py-2 text-xs bg-secondary hover:bg-secondary/80 text-foreground rounded-lg border border-border transition-all"
								>
									+ Add Package
								</button>
							</div>
						) : field.type === 'array' ? (
							<textarea
								id={field.name}
								value={JSON.stringify(body[field.name] || [])}
								onChange={(e) => handleArrayChange(field.name, e.target.value)}
								className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-foreground placeholder-muted-foreground/60 focus:ring-2 focus:ring-primary/50 focus:outline-none font-mono transition-all border border-border/50"
								rows={2}
								placeholder="[1, 2, 3]"
							/>
							) : null}
							{field.type === 'file' && (
								<input
									id={field.name}
									type="file"
									accept=".xlsx,.xls"
									onChange={(e) => {
										const file = e.target.files?.[0]
										const inputElement = e.target as HTMLInputElement
										
										// Clear previous file cache
										if (body[field.name] instanceof File) {
											const previousFile = body[field.name] as File
											// If there was a previous file, clear it from state first
											handleFieldChange(field.name, null)
										}
										
										if (file) {
											// Update with new file
											handleFieldChange(field.name, file)
										} else {
											// Clear file if input is cleared
											handleFieldChange(field.name, null)
										}
										
										// Clear file input cache by resetting the input value
										// This ensures the same file can be selected again and clears browser cache
										// Use requestAnimationFrame to ensure DOM update happens after state update
										requestAnimationFrame(() => {
											if (inputElement) {
												inputElement.value = ''
											}
										})
									}}
									className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg text-foreground file:mr-4 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90 file:cursor-pointer cursor-pointer border border-border/50"
								/>
							)}
							{field.description && (
								<p className="text-xs text-muted-foreground mt-1.5">
									{field.description}
								</p>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}
