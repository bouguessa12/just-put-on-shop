// src/app/layout.js

import './globals.css';
import { Inter } from 'next/font/google';
import { WishlistProvider } from './components/WishlistContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Shop Just Put On',
  description: 'Premium men\'s fashion store - curated collections for the modern gentleman',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 
        THE CORRECTION IS HERE: 
        We have removed "className={inter.className}" from the <body> tag. 
        This prevents the font's default styles from adding the unwanted 
        white space (padding/margin) around your entire page.
      */}
      <body>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </body>
    </html>
  );
}