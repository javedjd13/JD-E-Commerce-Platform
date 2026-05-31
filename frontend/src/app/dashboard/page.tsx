import { AuthGuard } from '@/features/auth/auth-guard';
import { DashboardView } from './dashboard-view';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardView />
    </AuthGuard>
  );
}
