import "./globals.css";
import { AuthProvider } from './context/AuthContext';

const pacifico = {
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
};

const geistSans = {
  variable: "--font-geist-sans",
  subsets: ["latin"],
};

const geistMono = {
  variable: "--font-geist-mono",
  subsets: ["latin"],
};

export const metadata = {
  title: "QuantumVote - Secure Quantum-Powered Voting Platform",
  description: "Experience the future of secure voting with QuantumVote's quantum-powered technology",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
