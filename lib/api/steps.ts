export type ApiGroup = 'channel' | 'device' | 'fingerprint' | 'message'

export interface Step {
	id: string
	method: string
	endpoint: string
	group: ApiGroup
}

export const stepIds: string[] = [
	'get_token',
	'create_broadcaster',
	'add_channel',
	'edit_channel',
	'delete_channel',
	'add_package',
	'add_channel_to_package',
	'create_stb_vendor',
	'add_subscriber',
	'import_devices',
	'add_device',
	'pair_device_to_subscriber',
	'assign_package_to_device',
	'renew_package',
	'renew_subscription',
	'configure_fingerprint',
	'configure_message',
]

export const stepEndpoints: Record<string, string> = {
	'get_token': '/auth/token',
	'create_broadcaster': '/broadcasters/v1',
	'add_channel': '/channels/v1',
	'edit_channel': '/channels/v1',
	'delete_channel': '/channels/v1',
	'add_package': '/packages/v1',
	'add_channel_to_package': '/packages/v1/channels/{packageId}',
	'create_stb_vendor': '/stb-vendor/v1',
	'add_subscriber': '/subscriber/v1',
	'import_devices': '/stb/v1/import',
	'add_device': '/devices/v1',
	'pair_device_to_subscriber': '/subscriber/v1/device',
	'assign_package_to_device': '/subscription/v1',
	'renew_package': '/packages/v1/renew',
	'renew_subscription': '/subscription/v1/renew',
	'configure_fingerprint': '/fingerprint/config',
	'configure_message': '/message/config',
}

export const stepMethods: Record<string, string> = {
	'get_token': 'POST',
	'create_broadcaster': 'POST',
	'add_channel': 'POST',
	'edit_channel': 'PUT',
	'delete_channel': 'DELETE',
	'add_package': 'POST',
	'add_channel_to_package': 'POST',
	'create_stb_vendor': 'POST',
	'add_subscriber': 'POST',
	'import_devices': 'POST',
	'add_device': 'POST',
	'pair_device_to_subscriber': 'POST',
	'assign_package_to_device': 'POST',
	'renew_package': 'POST',
	'renew_subscription': 'POST',
	'configure_fingerprint': 'PUT',
	'configure_message': 'POST',
}

const stepGroups: Record<string, ApiGroup> = {
	'get_token': 'channel', // Auth token - used by all groups
	'create_broadcaster': 'channel', // Create broadcaster
	'add_channel': 'channel', // Add channel
	'edit_channel': 'channel', // Edit channel
	'delete_channel': 'channel', // Delete channel
	'add_package': 'channel', // Create package
	'add_channel_to_package': 'channel', // Add channel to package
	'create_stb_vendor': 'device', // Create STB vendor
	'add_subscriber': 'device', // Create subscriber
	'import_devices': 'device', // Import Devices
	'add_device': 'device', // Add Device
	'pair_device_to_subscriber': 'device', // Assign STB to subscriber
	'assign_package_to_device': 'device', // Subscribe package to STB
	'renew_package': 'device', // Renew package
	'renew_subscription': 'device', // Renew subscription
	'configure_fingerprint': 'fingerprint', // Configure fingerprint
	'configure_message': 'message', // Configure message
}

export function getSteps(): Step[] {
	return stepIds.map((id) => ({
		id,
		method: stepMethods[id] || 'POST',
		endpoint: stepEndpoints[id] || '',
		group: stepGroups[id] || 'channel',
	}))
}

export function getStepsByGroup(group: ApiGroup): Step[] {
	const allSteps = getSteps()
	// Filter out get_token as it's handled by the token input at the top
	const groupSteps = allSteps.filter(
		(step) => step.group === group && step.id !== 'get_token'
	)
	
	return groupSteps
}
