/**
 * Outbound project links, shared by the homepage cards and the case-study
 * header so the two never disagree about what a button says.
 */
export interface ProjectLink {
  label: string;
  href: string;
  kind: 'live' | 'source';
}

/** The primary destination's label depends on where it points. */
export function liveLabel(url: string): string {
  const host = new URL(url).hostname;
  if (host.endsWith('apps.apple.com')) return 'App Store';
  if (host.endsWith('play.google.com')) return 'Google Play';
  return 'Live site';
}

export function projectLinks(data: { liveUrl?: string; githubUrl?: string }): ProjectLink[] {
  const links: ProjectLink[] = [];
  if (data.liveUrl)
    links.push({ label: liveLabel(data.liveUrl), href: data.liveUrl, kind: 'live' });
  if (data.githubUrl) links.push({ label: 'GitHub', href: data.githubUrl, kind: 'source' });
  return links;
}
