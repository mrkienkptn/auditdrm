// Global type definitions

export interface ApiResponse<T> {
	data: T
	message?: string
	error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}
