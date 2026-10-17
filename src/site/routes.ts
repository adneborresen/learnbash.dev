// URLs of the site's pages. Shared by the pages, the Vite plugin (which
// writes one HTML file per challenge) and the tests.

export const HOME_URL = "/";

export function challengeUrl(id: string): string {
  return `/challenges/${id}/`;
}

/** The challenge id in a challenge page's path, e.g. "/challenges/look-around/". */
export function challengeIdFromPath(pathname: string): string | undefined {
  return /^\/challenges\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/.exec(pathname)?.[1];
}
