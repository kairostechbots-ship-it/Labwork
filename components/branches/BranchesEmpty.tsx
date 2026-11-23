
"use client";

import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";

export default function BranchesEmpty() {
  const t = useTranslations("BranchesEmpty");

  return (
    <div className="rounded-[28px] border border-slate-100 bg-primary-50/30 px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
        <MapPin className="h-6 w-6" />
      </div>

      <h2 className="mt-5 font-display text-xl font-bold text-primary-950">
        {t("title")}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {t("description")}
      </p>
    </div>
  );
}
