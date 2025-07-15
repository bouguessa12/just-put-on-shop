export const dynamic = 'force-dynamic';
export const ssr = false;

import { redirect } from 'next/navigation';

export default function StorePage() {
  redirect('/store/client');
}
