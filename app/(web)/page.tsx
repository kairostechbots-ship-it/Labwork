import Hero from '@/components/home/Hero';
import QuickBenefits from '@/components/home/QuickBenefits';
import FeaturedStudies from '@/components/home/FeaturedStudies';
import FeaturedPackages from '@/components/home/FeaturedPackages';
import AboutPreview from '@/components/home/AboutPreview';
import HowItWorks from '@/components/home/HowItWorks';
import BranchesPreview from '@/components/home/BranchesPreview';
import FinalCTA from '@/components/home/FinalCTA';

export default function Home() {
  return (
    <>
      <Hero />
      <QuickBenefits />
      <FeaturedStudies />
      <FeaturedPackages />
      <AboutPreview />
      <HowItWorks />
      <BranchesPreview />

      <FinalCTA />
    </>
  );
}