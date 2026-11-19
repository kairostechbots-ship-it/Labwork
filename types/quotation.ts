import type { Study, StudyPackage } from './study';

export type QuotationItem =
  | { type: 'study'; id: string; name: string; price: string | null; slug: string }
  | { type: 'package'; id: string; name: string; price: string | null; slug: string };

export const quotationKey = (item: Pick<QuotationItem, 'type' | 'id'>) => `${item.type}:${item.id}`;

export function studyToQuotationItem(study: Study): QuotationItem {
  return { type: 'study', id: study.id, name: study.name, slug: study.slug, price: study.price };
}

export function packageToQuotationItem(item: StudyPackage): QuotationItem {
  return { type: 'package', id: item.id, name: item.name, slug: item.slug, price: item.price };
}

export function validPrice(value: string | null): number | null {
  if (value === null || value.trim() === '') return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}
