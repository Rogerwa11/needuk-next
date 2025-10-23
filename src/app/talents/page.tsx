import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { TalentsClient } from './_components/TalentsClient';

export default async function TalentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/');
  return <TalentsClient />;
}
