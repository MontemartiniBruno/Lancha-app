import { BoatInfo } from '@/components/info/BoatInfo';

export default function InfoPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 pb-20 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">🛥️ Información Útil</h1>
      
      <BoatInfo />
    </div>
  );
}
