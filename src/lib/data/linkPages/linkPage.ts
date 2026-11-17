export type LinkPageLinkKind = "website" | "email" | "telephone";

export type LinkPageLink = {
  label: string;
  address: string;
  kind: LinkPageLinkKind;
};

export type LinkPage = {
  name: string;
  fullName: string;
  role: string;
  introduction: string;
  photoPath: string | null;
  links: LinkPageLink[];
};
