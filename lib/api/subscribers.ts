import { apiGet } from './client'

export interface Subscriber {
	id: number | string
	username?: string
	email?: string
	fullName?: string
}

export async function fetchSubscribers(
	domain: string,
	token: string
): Promise<Subscriber[]> {
	if (!domain) {
		return []
	}

	try {
		const response = await apiGet<Subscriber[]>(
			domain,
			'/subscriber/v1?page=1&r=10',
			token
		)

		const data = response.data
		// System API returns {ec, data} format, data is already extracted in apiRequest
		// Handle different response formats for the data field
		if (Array.isArray(data)) {
			return data
		}
		if (
			data &&
			typeof data === 'object' &&
			data !== null &&
			'data' in data &&
			Array.isArray((data as any).data)
		) {
			return (data as any).data
		}
		if (
			data &&
			typeof data === 'object' &&
			data !== null &&
			'items' in data &&
			Array.isArray((data as any).items)
		) {
			return (data as any).items
		}
		return []
	} catch (error) {
		console.error('Error fetching subscribers:', error)
		return []
	}
}
