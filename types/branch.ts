export type Branch = {
  id: string;
  name: string;
  slug: string;

  address: string;
  phone: string;

  whatsapp: string | null;

  mapUrl: string | null;

  latitude: number | null;
  longitude: number | null;

  businessHours: string | null;

  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export type BranchesResponse = {
  data: Branch[];
};