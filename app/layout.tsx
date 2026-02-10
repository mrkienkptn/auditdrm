import type { Metadata } from 'next'
import './globals.css'
import { I18nProvider } from '@/lib/i18n/context'

export const metadata: Metadata = {
	title: 'SMS Integration',
	description: 'SMS Integration Application',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className="dark">
			<body>
				<I18nProvider>{children}</I18nProvider>
			</body>
		</html>
	)
}
