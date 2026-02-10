import { apiGet } from './client'

export interface Package {
	id: number
	name?: string
	price?: number
	duration?: number
	description?: string
	status?: string
}

export async function fetchPackages(
	domain: string,
	token: string
): Promise<Package[]> {
	if (!domain) {
		return []
	}

	try {
		const response = await apiGet<Package[]>(
			domain,
			'/packages/v1?page=1&record=20',
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
		console.error('Error fetching packages:', error)
		return []
	}
}
