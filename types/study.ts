export type Study = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  preparation: string | null;
  price: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type StudiesResponse = {
  data: Study[];
};

export type StudyPackage = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  preparation: string | null;
  price: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PackagesResponse = {
  data: StudyPackage[];
};