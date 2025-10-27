import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth-options';

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/auth/login');
  }
}
