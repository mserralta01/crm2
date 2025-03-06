import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { DatabaseSeeder } from "@/components/DatabaseSeeder";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SalesPro CRM - Modern Sales Management',
  description: 'Streamline your sales process with our modern CRM solution',
  keywords: 'CRM, sales, lead management, pipeline management, sales automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <DatabaseSeeder />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}