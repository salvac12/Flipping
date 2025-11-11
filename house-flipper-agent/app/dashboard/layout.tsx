import { MainNav } from '@/components/navigation/MainNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      {children}
    </div>
  );
}