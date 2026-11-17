import type { LinkPage } from "./linkPage";

export const linkPagesPath = "/links";

export const linkPages: LinkPage[] = [
  {
    name: "jeremy",
    fullName: "Jeremy Ferendinos",
    role: "Director, Jewel Enterprises",
    introduction:
      "Property services, refurbishment and fire protection across London and the South East.",
    photoPath: null,
    links: [
      {
        label: "Jewel Property Serve",
        address: "https://jewelps.co.uk",
        kind: "website",
      },
      {
        label: "Call 0333 015 5060",
        address: "tel:+443330155060",
        kind: "telephone",
      },
      {
        label: "Email Jeremy",
        address: "mailto:jeremy.ferendinos@jewelenterprises.co.uk",
        kind: "email",
      },
    ],
  },
];

export function findLinkPageByName(name: string): LinkPage | undefined {
  const lowerCaseName = name.toLowerCase();
  return linkPages.find((linkPage) => linkPage.name === lowerCaseName);
}

export function linkPagePath(linkPage: LinkPage): string {
  return `${linkPagesPath}/${linkPage.name}`;
}
