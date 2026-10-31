import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role;
  if (role === 'ADMIN') {
    redirect('/admin/dashboard');
  } else if (role === 'STAFF') {
    redirect('/staff/subscriptions');
  } else {
    redirect('/portal/subscriptions');
  }
}
