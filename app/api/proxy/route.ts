import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { url, method, headers, body: requestBody } = body

		if (!url) {
			return NextResponse.json(
				{ error: 'URL is required' },
				{ status: 400 }
			)
		}

		// Create fetch options
		const fetchOptions: RequestInit = {
			method: method || 'GET',
			headers: {
				...headers,
				// Remove host and other problematic headers
			},
		}

		// Add body for non-GET requests
		if (requestBody && method !== 'GET' && method !== 'DELETE') {
			fetchOptions.body =
				typeof requestBody === 'string'
					? requestBody
					: JSON.stringify(requestBody)
		}

		// Make the request
		const response = await fetch(url, fetchOptions)

		// Get response headers
		const responseHeaders: Record<string, string> = {}
		response.headers.forEach((value, key) => {
			// Filter out CORS and other problematic headers
			if (
				!key.toLowerCase().startsWith('access-control') &&
				key.toLowerCase() !== 'content-encoding'
			) {
				responseHeaders[key] = value
			}
		})

		// Parse response body - read as text first to handle HTML responses
		const contentType = response.headers.get('content-type') || ''
		const responseText = await response.text()
		let responseData: any

		// Try to parse as JSON, fallback to text if it fails
		if (contentType.includes('application/json')) {
			try {
				responseData = JSON.parse(responseText)
			} catch {
				// If JSON parsing fails (e.g., HTML error page), return as text
				responseData = responseText
			}
		} else {
			responseData = responseText
		}

		// Return response with CORS headers
		return NextResponse.json(
			{
				status: response.status,
				statusText: response.statusText,
				headers: responseHeaders,
				data: responseData,
			},
			{
				status: response.status,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-credential',
				},
			}
		)
	} catch (error) {
		console.error('Proxy error:', error)
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : 'Failed to proxy request',
			},
			{ status: 500 }
		)
	}
}

export async function GET() {
	return NextResponse.json(
		{ message: 'Proxy API is running. Use POST method to proxy requests.' },
		{
			status: 200,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
		}
	)
}

export async function OPTIONS() {
	return new NextResponse(null, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-credential',
		},
	})
}
