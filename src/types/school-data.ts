/** CMS JSON + hero/contact fields (relaxed for UI; Prisma stores some as Json). */
export interface SchoolContent {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  schoolLogo?: string;
  description?: string;
  classes?: string[];
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImage?: string;
  bannerTitle?: string;
  bannerImage?: string;
  bannerStats?: Array<{ icon: string; text: string }>;
  facilities?: Array<{
    name: string;
    image?: string;
    imageUrl?: string;
    description?: string;
    order?: number;
  }>;
  campusImages?: Array<{
    id?: string;
    title?: string;
    name?: string;
    image?: string;
    imageUrl?: string;
    description?: string;
    order?: number;
  }>;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
}

/** Shape consumed by landing + dashboard shell client components. */
export interface SchoolData {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  isAdmissionsOpen: boolean;
  content?: SchoolContent | null;
  levels?: Array<{
    id: string;
    name: string;
    classes: Array<{ id: string; name: string }>;
  }>;
  subjects?: Array<{ id: string; name: string }>;
  students?: Array<{ id: string }>;
}
