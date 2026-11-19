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
export type PackageIncludedService = {
  id: string;
  name: string;
  slug: string;
};

export type PackageDetails = StudyPackage & {
  services: PackageIncludedService[];
};

export type PackageDetailsResponse = {
  data: PackageDetails;
};