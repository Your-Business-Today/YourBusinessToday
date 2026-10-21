/**
 * How many ids one `in` filter may carry. The ids travel in the request's address, and a project with hundreds
 * of tasks makes an address longer than the database's gateway accepts, which it refuses as a Bad Request.
 */
export const idsPerRequest = 150;

/** The ids split into lists short enough for one request each. */
export function idBatches(ids: string[]): string[][] {
  const batches: string[][] = [];
  for (let start = 0; start < ids.length; start += idsPerRequest)
    batches.push(ids.slice(start, start + idsPerRequest));
  return batches;
}
