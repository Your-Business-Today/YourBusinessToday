import { describe, expect, it } from "vitest";
import { ybtLinkPage } from "./ybtLinkPage";

const addressShape = /^(\/|https:\/\/|mailto:|tel:\+)/;

describe("YBT's link page", () => {
  it("opens every link on the site, over https, by email or by an international phone number", () => {
    ybtLinkPage.links.forEach((link) =>
      expect(link.address).toMatch(addressShape),
    );
  });

  it("gives every link an address of its own", () => {
    const addresses = ybtLinkPage.links.map((link) => link.address);
    expect(new Set(addresses).size).toBe(addresses.length);
  });
});
