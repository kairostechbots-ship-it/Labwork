
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import BranchesHero from "@/components/branches/BranchesHero";
import BranchesList from "@/components/branches/BranchesList";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("BranchesMetadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function SucursalesPage() {
  return (
    <div className="bg-white">
      <BranchesHero />
      <BranchesList />
    </div>
  );
}
