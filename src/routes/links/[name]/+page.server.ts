import { error } from "@sveltejs/kit";
import { findLinkPageByName } from "$lib/data/linkPages/linkPages";
import type { PageServerLoad } from "./$types";

const notFound = 404;

export const load: PageServerLoad = ({ params }) => {
  const linkPage = findLinkPageByName(params.name);
  if (!linkPage) error(notFound, "There is no link page by that name.");
  return { linkPage };
};
