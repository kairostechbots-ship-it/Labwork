import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Agenda from '@/components/Agenda';
import Branches from '@/components/Branches';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Services />
        <Agenda />
        <Branches />
      </main>
      <Footer />
    </div>
  );
}
