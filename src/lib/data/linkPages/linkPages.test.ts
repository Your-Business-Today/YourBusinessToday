import { describe, expect, it } from "vitest";
import { findLinkPageByName, linkPagePath, linkPages } from "./linkPages";

const addressSchemes = /^(https:\/\/|mailto:|tel:\+)/;
const pageNameShape = /^[a-z0-9-]+$/;

describe("link pages", () => {
  it("gives every page a name of its own that reads as an address", () => {
    const names = linkPages.map((linkPage) => linkPage.name);
    expect(new Set(names).size).toBe(names.length);
    names.forEach((name) => expect(name).toMatch(pageNameShape));
  });

  it("opens every link over https, by email or by an international phone number", () => {
    const addresses = linkPages.flatMap((linkPage) =>
      linkPage.links.map((link) => link.address),
    );
    addresses.forEach((address) => expect(address).toMatch(addressSchemes));
  });

  it("finds a page by its name whatever its case", () => {
    expect(findLinkPageByName("Jeremy")?.fullName).toBe("Jeremy Ferendinos");
    expect(findLinkPageByName("nobody")).toBeUndefined();
  });

  it("serves each page under the links section", () => {
    const [firstPage] = linkPages;
    expect(linkPagePath(firstPage)).toBe("/links/jeremy");
  });
});
