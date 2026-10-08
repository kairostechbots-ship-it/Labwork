import ContactCards from '@/components/contact/ContactCards';
import ContactForm from '@/components/contact/ContactForm';
import ContactHero from '@/components/contact/ContactHero';
import ContactQuickHelp from '@/components/contact/ContactQuickHelp';

export default function ContactPage() {
  return (
    <main className="bg-white">
      <ContactHero />

      <ContactCards />

      <section className="bg-slate-50/70 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="
              grid
              overflow-hidden
              rounded-[28px]
              border
              border-slate-200
              bg-white
              shadow-[0_16px_45px_rgba(15,23,42,0.06)]
              lg:grid-cols-[1.45fr_0.75fr]
            "
          >
            <div className="p-6 sm:p-8 lg:p-10">
              <ContactForm />
            </div>

            <div className="p-3 sm:p-4 lg:p-5 lg:pl-0">
              <ContactQuickHelp />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}