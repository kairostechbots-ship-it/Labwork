import BranchesHero from '@/components/branches/BranchesHero';
import BranchesList from '@/components/branches/BranchesList';

export default function SucursalesPage() {
  return (
    <main className="bg-white">
      <BranchesHero />
      <BranchesList />
    </main>
  );
}