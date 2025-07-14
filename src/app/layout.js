// src/app/layout.js

import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Just Put On Shop',
  description: 'Simple men’s clothing store',
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
        {children}
      </body>
    </html>
  );
}