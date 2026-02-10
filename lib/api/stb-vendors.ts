import { apiGet } from './client'

export interface StbVendor {
	id: string
	companyName?: string
	companyAddress?: string
	contactPerson?: string
	email?: string
	mobile?: string
}

export async function fetchStbVendors(
	domain: string,
	token: string
): Promise<StbVendor[]> {
	if (!domain) {
		return []
	}

	try {
		const response = await apiGet<StbVendor[]>(
			domain,
			'/stb-vendor/v1?page=1&r=10',
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
		console.error('Error fetching STB vendors:', error)
		return []
	}
}
