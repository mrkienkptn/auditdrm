import { apiGet } from './client'

export interface Channel {
	id: number
	name?: string
	broadcasterId?: number
	lcn?: number
	price?: number
	description?: string
	status?: string
	accessCriteria?: number
}

export async function fetchChannels(
	domain: string,
	token: string
): Promise<Channel[]> {
	if (!domain) {
		return []
	}

	try {
		const response = await apiGet<Channel[]>(
			domain,
			'/channels/v1?page=1&r=10',
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
		console.error('Error fetching channels:', error)
		return []
	}
}
