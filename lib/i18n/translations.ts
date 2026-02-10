export type Language = 'en' | 'vi' | 'hi'

export interface Translations {
	common: {
		title: string
		domainLabel: string
		domainPlaceholder: string
		tokenLabel: string
		tokenPlaceholder: string
		tokenHelp: string
		stepsTitle: string
		stepLabel: string
		curlTitle: string
		selectStep: string
		method: string
		endpoint: string
		copy: string
		copied: string
		groups: {
			channel: string
			device: string
			fingerprint: string
			message: string
		}
	}
	steps: {
		[key: string]: {
			title: string
			description: string
		}
	}
}

export const translations: Record<Language, Translations> = {
	en: {
		common: {
			title: 'Backend On-Premise Integration Demo',
			domainLabel: 'On-Premise System Domain',
			domainPlaceholder: 'https://example.com',
			tokenLabel: 'Token',
			tokenPlaceholder: 'Enter your token here',
			tokenHelp: 'Token will be used in x-credential header for subsequent steps',
			stepsTitle: 'List of Steps',
			stepLabel: 'Step',
			curlTitle: 'cURL Command',
			selectStep: 'Select a step to view the corresponding cURL command',
			method: 'Method',
			endpoint: 'Endpoint',
			copy: 'Copy',
			copied: 'Copied!',
			groups: {
				channel: 'Channel',
				device: 'Device',
				fingerprint: 'Fingerprint',
				message: 'Message',
			},
		},
		steps: {
			'get_token': {
				title: 'Get Token from CMS',
				description: 'Required for authentication',
			},
			'create_broadcaster': {
				title: 'Create broadcaster',
				description: 'Create new broadcaster',
			},
			'add_channel': {
				title: 'Add channel',
				description: 'Add new channel',
			},
			'edit_channel': {
				title: 'Edit channel',
				description: 'Update channel information',
			},
			'delete_channel': {
				title: 'Delete channel',
				description: 'Delete channel',
			},
			'add_package': {
				title: 'Add Package',
				description: 'Add Package',
			},
			'add_channel_to_package': {
				title: 'Add channel to package',
				description: 'Add channel to subscription package',
			},
			'create_stb_vendor': {
				title: 'Create STB vendor',
				description: 'Create new STB vendor',
			},
			'add_subscriber': {
				title: 'Add Subscriber',
				description: 'Manage subscriber accounts',
			},
			'import_devices': {
				title: 'Import Devices',
				description: 'Import devices from Excel file',
			},
			'add_device': {
				title: 'Add Device',
				description: 'Add device to system',
			},
			'pair_device_to_subscriber': {
				title: 'Pair Device to Subscriber',
				description: 'Pair device to subscriber',
			},
			'assign_package_to_device': {
				title: 'Assign package to STB (device)',
				description: 'Assign package to device',
			},
			'renew_package': {
				title: 'Renew package',
				description: 'Extend package validity period',
			},
			'renew_subscription': {
				title: 'Gia hạn gói (renew)',
				description: 'Renew subscription packages',
			},
			'configure_fingerprint': {
				title: 'Enable Fingerprint',
				description: 'Enable fingerprint settings',
			},
			'configure_message': {
				title: 'Configure Message',
				description: 'Configure message settings',
			},
		},
	},
	vi: {
		common: {
			title: 'Demo Tích Hợp Backend On-Premise',
			domainLabel: 'Domain hệ thống On-Premise',
			domainPlaceholder: 'https://example.com',
			tokenLabel: 'Token',
			tokenPlaceholder: 'Nhập token của bạn',
			tokenHelp: 'Token sẽ được sử dụng trong header x-credential cho các bước tiếp theo',
			stepsTitle: 'Danh sách các bước',
			stepLabel: 'Bước',
			curlTitle: 'Lệnh cURL',
			selectStep: 'Chọn một bước để xem lệnh cURL tương ứng',
			method: 'Method',
			endpoint: 'Endpoint',
			copy: 'Copy',
			copied: 'Đã copy!',
			groups: {
				channel: 'Kênh',
				device: 'Thiết bị',
				fingerprint: 'Fingerprint',
				message: 'Message',
			},
		},
		steps: {
			'get_token': {
				title: 'Lấy Token từ CMS',
				description: 'Bắt buộc để authen',
			},
			'create_broadcaster': {
				title: 'Tạo broadcaster',
				description: 'Tạo mới broadcaster',
			},
			'add_channel': {
				title: 'Thêm channel',
				description: 'Thêm channel mới',
			},
			'edit_channel': {
				title: 'Sửa channel',
				description: 'Cập nhật thông tin channel',
			},
			'delete_channel': {
				title: 'Xoá channel',
				description: 'Xóa channel',
			},
			'add_package': {
				title: 'Thêm, sửa, xoá gói',
				description: 'Quản lý gói cước',
			},
			'add_channel_to_package': {
				title: 'Add channel vào gói',
				description: 'Thêm channel vào gói cước',
			},
			'create_stb_vendor': {
				title: 'Tạo STB vendor',
				description: 'Tạo mới STB vendor',
			},
			'add_subscriber': {
				title: 'Tạo, sửa, xoá Subscriber',
				description: 'Quản lý tài khoản subscriber',
			},
			'import_devices': {
				title: 'Import thiết bị',
				description: 'Import thiết bị từ file Excel',
			},
			'add_device': {
				title: 'Thêm thiết bị',
				description: 'Thêm thiết bị vào hệ thống',
			},
			'pair_device_to_subscriber': {
				title: 'Gán STB (device) vào Subscriber',
				description: 'Gán thiết bị vào tài khoản',
			},
			'assign_package_to_device': {
				title: 'Cộng gói',
				description: 'Cộng gói cước cho thiết bị',
			},
			'renew_package': {
				title: 'Gia hạn gói cước',
				description: 'Gia hạn thời gian sử dụng gói',
			},
			'renew_subscription': {
				title: 'Gia hạn gói (renew)',
				description: 'Gia hạn gói đăng ký',
			},
			'configure_fingerprint': {
				title: 'Bật Fingerprint',
				description: 'Bật cài đặt fingerprint',
			},
			'configure_message': {
				title: 'Cấu hình Message',
				description: 'Cấu hình cài đặt message',
			},
		},
	},
	hi: {
		common: {
			title: 'बैकएंड ऑन-प्रिमाइस एकीकरण डेमो',
			domainLabel: 'ऑन-प्रिमाइस सिस्टम डोमेन',
			domainPlaceholder: 'https://example.com',
			tokenLabel: 'टोकन',
			tokenPlaceholder: 'अपना टोकन दर्ज करें',
			tokenHelp: 'टोकन बाद के चरणों के लिए x-credential हेडर में उपयोग किया जाएगा',
			stepsTitle: 'चरणों की सूची',
			stepLabel: 'चरण',
			curlTitle: 'cURL कमांड',
			selectStep: 'संबंधित cURL कमांड देखने के लिए एक चरण चुनें',
			method: 'विधि',
			endpoint: 'एंडपॉइंट',
			copy: 'कॉपी करें',
			copied: 'कॉपी हो गया!',
			groups: {
				channel: 'चैनल',
				device: 'डिवाइस',
				fingerprint: 'फिंगरप्रिंट',
				message: 'संदेश',
			},
		},
		steps: {
			'get_token': {
				title: 'CMS से टोकन प्राप्त करें',
				description: 'प्रमाणीकरण के लिए आवश्यक',
			},
			'create_broadcaster': {
				title: 'ब्रॉडकास्टर बनाएं',
				description: 'नया ब्रॉडकास्टर बनाएं',
			},
			'add_channel': {
				title: 'चैनल जोड़ें',
				description: 'नया चैनल जोड़ें',
			},
			'edit_channel': {
				title: 'चैनल संपादित करें',
				description: 'चैनल जानकारी अपडेट करें',
			},
			'delete_channel': {
				title: 'चैनल हटाएं',
				description: 'चैनल हटाएं',
			},
			'add_package': {
				title: 'पैकेज जोड़ें, संपादित करें, हटाएं',
				description: 'सदस्यता पैकेज प्रबंधित करें',
			},
			'add_channel_to_package': {
				title: 'पैकेज में चैनल जोड़ें',
				description: 'सदस्यता पैकेज में चैनल जोड़ें',
			},
			'create_stb_vendor': {
				title: 'STB वेंडर बनाएं',
				description: 'नया STB वेंडर बनाएं',
			},
			'add_subscriber': {
				title: 'सब्सक्राइबर बनाएं, संपादित करें, हटाएं',
				description: 'सब्सक्राइबर खाते प्रबंधित करें',
			},
			'import_devices': {
				title: 'डिवाइस आयात करें',
				description: 'एक्सेल फ़ाइल से डिवाइस आयात करें',
			},
			'add_device': {
				title: 'डिवाइस जोड़ें',
				description: 'सिस्टम में डिवाइस जोड़ें',
			},
			'pair_device_to_subscriber': {
				title: 'सब्सक्राइबर को STB (डिवाइस) असाइन करें',
				description: 'खाते में डिवाइस असाइन करें',
			},
			'assign_package_to_device': {
				title: 'STB (डिवाइस) को पैकेज असाइन करें',
				description: 'डिवाइस को पैकेज असाइन करें',
			},
			'renew_package': {
				title: 'पैकेज नवीकरण करें',
				description: 'पैकेज वैधता अवधि बढ़ाएं',
			},
			'renew_subscription': {
				title: 'Gia hạn gói (renew)',
				description: 'सदस्यता पैकेज नवीकरण करें',
			},
			'configure_fingerprint': {
				title: 'Enable Fingerprint',
				description: 'Enable fingerprint settings',
			},
			'configure_message': {
				title: 'संदेश कॉन्फ़िगर करें',
				description: 'संदेश सेटिंग्स कॉन्फ़िगर करें',
			},
		},
	},
}
