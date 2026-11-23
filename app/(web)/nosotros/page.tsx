
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import AboutHero from "@/components/about/AboutHero";
import OurHistory from "@/components/about/OurHistory";
import MissionVision from "@/components/about/MissionVision";
import OurValues from "@/components/about/OurValues";
import AboutCTA from "@/components/about/AboutCTA";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AboutMetadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function AboutPage() {
  return (
    <div>
      <AboutHero />
      <OurHistory />
      <MissionVision />
      <OurValues />
      <AboutCTA />
    </div>
  );
}
