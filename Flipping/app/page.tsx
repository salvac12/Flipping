import { redirect } from 'next/navigation';

export default function Home() {
  // DESARROLLO: Redirigir directamente al dashboard sin login
  redirect('/dashboard');
}
