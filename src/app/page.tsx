import { CommonAccountCard } from '@/components/dashboard/CommonAccountCard';
import { UserBalanceCard } from '@/components/dashboard/UserBalanceCard';
import { UpcomingTurns } from '@/components/dashboard/UpcomingTurns';
import { RecentMovements } from '@/components/dashboard/RecentMovements';

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 pb-20 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-2 lg:col-span-1">
          <CommonAccountCard />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <UserBalanceCard />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <UpcomingTurns />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <RecentMovements />
        </div>
      </div>
    </div>
  );
}
