import './globals.css'

export const metadata = {
    title: 'Aurora - Your Personal Space',
    description: 'A unified personal space for thought, journaling, and planning',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}

