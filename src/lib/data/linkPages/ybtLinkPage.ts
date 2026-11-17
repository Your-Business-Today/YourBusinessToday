import { caseStudyPath } from "$lib/data/caseStudies";
import { companyDetails } from "$lib/data/companyDetails";
import {
  buildTimeline,
  whatWeDoLabel,
  whatWeDoPath,
} from "$lib/data/consultancyOffer";
import { discoveryCallLabel, discoveryCallPath } from "$lib/data/discoveryCall";
import {
  newsletterSignUpLabel,
  newsletterPath,
} from "$lib/data/newsletterSignUp";
import {
  taxCalculatorLabel,
  taxCalculatorPath,
} from "$lib/data/taxCalculator/taxCalculatorPath";
import type { LinkPage } from "./linkPage";

export const ybtLinkPage: LinkPage = {
  path: "/links",
  title: companyDetails.tradingName,
  introduction: `We build your business app or platform in ${buildTimeline}.`,
  links: [
    { label: discoveryCallLabel, address: discoveryCallPath, kind: "website" },
    { label: whatWeDoLabel, address: whatWeDoPath, kind: "website" },
    { label: "See a case study", address: caseStudyPath, kind: "website" },
    { label: newsletterSignUpLabel, address: newsletterPath, kind: "website" },
    { label: taxCalculatorLabel, address: taxCalculatorPath, kind: "website" },
    { label: "Visit yourbusiness.today", address: "/", kind: "website" },
    {
      label: "Email us",
      address: `mailto:${companyDetails.consultingEmail}`,
      kind: "email",
    },
  ],
};
