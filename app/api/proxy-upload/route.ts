import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData()
		const url = formData.get('url') as string
		const token = formData.get('token') as string
		const authToken = formData.get('authToken') as string | null
		const file = formData.get('file') as File

		if (!url || !file) {
			return NextResponse.json(
				{ error: 'URL and file are required' },
				{ status: 400 }
			)
		}

		// Create FormData for upstream API
		const upstreamFormData = new FormData()
		upstreamFormData.append('file', file)

		// Prepare headers
		const headers: Record<string, string> = {}
		if (authToken) {
			headers['Authorization'] = `Bearer ${authToken}`
		}
		if (token) {
			headers['x-credential'] = token
		}

		// Make the request to upstream API
		const response = await fetch(url, {
			method: 'POST',
			headers,
			body: upstreamFormData,
		})

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

		// Parse response body
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
		console.error('Proxy upload error:', error)
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : 'Failed to proxy file upload',
			},
			{ status: 500 }
		)
	}
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
