"use client";
import StoreContent from './StoreContent';

// Disable SSR completely for this page
export const dynamic = 'force-dynamic';
export const ssr = false;

export default function StorePage() {
  return <StoreContent />;
}
