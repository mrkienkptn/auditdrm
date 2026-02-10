/**
 * API Client utility to make requests through proxy to avoid CORS issues
 */

export interface ApiRequestOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
	headers?: Record<string, string>
	body?: any
}

export interface SystemApiResponse<T = any> {
	ec: number
	data: T
}

export interface ApiResponse<T = any> {
	status: number
	statusText: string
	headers: Record<string, string>
	data: T
	systemResponse?: SystemApiResponse<T>
}

/**
 * Make an API request through the proxy route or directly
 * @param domain - The base domain URL
 * @param endpoint - The API endpoint (e.g., '/broadcasters/v1')
 * @param token - The authentication token for x-credential header
 * @param options - Request options (method, headers, body)
 * @returns Promise with API response
 */
export async function apiRequest<T = any>(
	domain: string,
	endpoint: string,
	token: string,
	options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
	if (!domain) {
		throw new Error('Domain is required')
	}

	const { method = 'GET', headers = {}, body } = options

	// Construct full URL
	const url = `${domain}${endpoint}`

	// Prepare headers
	const requestHeaders: Record<string, string> = {
		'Content-Type': 'application/json',
		...headers,
	}

	// Add token to x-credential header if provided
	if (token) {
		requestHeaders['x-credential'] = token
	}

	// Check if we should use proxy (default to true for development)
	const useProxy = process.env.NEXT_PUBLIC_USE_PROXY !== 'false'

	try {
		let response: Response
		let responseData: any

		if (useProxy) {
			// Use proxy to avoid CORS issues
			const proxyUrl = '/api/proxy'
			const proxyBody = {
				url,
				method,
				headers: requestHeaders,
				body: body && method !== 'GET' && method !== 'DELETE' ? body : undefined,
			}

			response = await fetch(proxyUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(proxyBody),
			})
		} else {
			// Call API directly (production mode)
			const fetchOptions: RequestInit = {
				method,
				headers: requestHeaders,
			}

			// Add body for non-GET requests
			if (body && method !== 'GET' && method !== 'DELETE') {
				fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body)
			}

			response = await fetch(url, fetchOptions)
		}

		if (!response.ok) {
			let errorData: any
			try {
				errorData = await response.json()
			} catch {
				const textResponse = await response.text()
				throw new Error(
					`Invalid response format: ${textResponse.substring(0, 200)}`
				)
			}
			throw new Error(
				errorData.error ||
					`API request failed: ${errorData.status || response.status} ${
						errorData.statusText || response.statusText
					}`
			)
		}

		// Parse response based on whether we used proxy or direct call
		if (useProxy) {
			const proxyResponse: ApiResponse<any> = await response.json()
			responseData = proxyResponse.data
		} else {
			// Direct API call - parse response directly
			const contentType = response.headers.get('content-type') || ''
			const responseText = await response.text()
			
			if (contentType.includes('application/json')) {
				try {
					responseData = JSON.parse(responseText)
				} catch {
					responseData = responseText
				}
			} else {
				responseData = responseText
			}
		}
		
		// System domain returns {ec: number, data} format
		// Extract the actual data from system response
		let actualData = responseData
		
		// Check if response.data is in system format {ec, data}
		if (
			actualData &&
			typeof actualData === 'object' &&
			'ec' in actualData &&
			'data' in actualData
		) {
			const systemResponse = actualData as SystemApiResponse<T>
			
			// Check error code (ec !== 0 means error)
			if (systemResponse.ec !== 0) {
				throw new Error(
					`API error (ec: ${systemResponse.ec}): ${
						typeof systemResponse.data === 'string'
							? systemResponse.data
							: JSON.stringify(systemResponse.data)
					}`
				)
			}
			
			actualData = systemResponse.data
		}
		
		// Get response headers
		const responseHeaders: Record<string, string> = {}
		response.headers.forEach((value, key) => {
			if (
				!key.toLowerCase().startsWith('access-control') &&
				key.toLowerCase() !== 'content-encoding'
			) {
				responseHeaders[key] = value
			}
		})
		
		return {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders,
			data: actualData as T,
			systemResponse: actualData && typeof actualData === 'object' && 'ec' in actualData 
				? actualData as SystemApiResponse<T>
				: undefined,
		}
	} catch (error) {
		if (error instanceof Error) {
			throw error
		}
		throw new Error('Failed to make API request')
	}
}

/**
 * Convenience method for GET requests
 */
export async function apiGet<T = any>(
	domain: string,
	endpoint: string,
	token: string,
	headers?: Record<string, string>
): Promise<ApiResponse<T>> {
	return apiRequest<T>(domain, endpoint, token, { method: 'GET', headers })
}

/**
 * Convenience method for POST requests
 */
export async function apiPost<T = any>(
	domain: string,
	endpoint: string,
	token: string,
	body?: any,
	headers?: Record<string, string>
): Promise<ApiResponse<T>> {
	return apiRequest<T>(domain, endpoint, token, {
		method: 'POST',
		headers,
		body,
	})
}

/**
 * Convenience method for PUT requests
 */
export async function apiPut<T = any>(
	domain: string,
	endpoint: string,
	token: string,
	body?: any,
	headers?: Record<string, string>
): Promise<ApiResponse<T>> {
	return apiRequest<T>(domain, endpoint, token, {
		method: 'PUT',
		headers,
		body,
	})
}

/**
 * Convenience method for DELETE requests
 */
export async function apiDelete<T = any>(
	domain: string,
	endpoint: string,
	token: string,
	headers?: Record<string, string>
): Promise<ApiResponse<T>> {
	return apiRequest<T>(domain, endpoint, token, { method: 'DELETE', headers })
}
