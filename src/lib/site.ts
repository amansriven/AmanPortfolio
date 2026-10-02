export const site = {
  name: 'Aman Sriven',
  domain: 'amansriven.com',
  url: 'https://amansriven.com',
  role: 'Software Engineer',
  title: 'Aman Sriven — Software Engineer',
  description:
    'Software engineer building infrastructure and products people actually use. Computer science at Texas A&M. Previously software engineering at Humana and JAGGAER.',
  email: 'sriven.aman@gmail.com',
  phone: { display: '(214) 991-3721', href: 'tel:+12149913721' },
  location: 'College Station, TX',
  school: 'Texas A&M University',
} as const;

export const socials = [
  { label: 'GitHub', href: 'https://github.com/amansriven', handle: 'amansriven' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/aman-sriven', handle: 'aman-sriven' },
  { label: 'Email', href: `mailto:${site.email}`, handle: site.email },
] as const;

export const nav = [
  { label: 'Projects', href: '/projects', section: 'work' },
  { label: 'Experience', href: '/experience', section: 'experience' },
  { label: 'Research', href: '/research', section: 'research' },
  { label: 'About', href: '/about', section: 'about' },
] as const;

/** The emphasised contact link in the primary navigation. */
export const navCta = { label: 'Contact', href: '/contact', section: 'contact' } as const;

/**
 * The public form of a page path. With `build.format: 'file'`, Astro reports
 * paths like `/projects.html` at build time; links, canonicals, and the nav's
 * active state all use `/projects`.
 */
export function cleanPath(pathname: string): string {
  return (
    pathname
      .replace(/\.html$/, '')
      .replace(/\/index$/, '')
      .replace(/\/$/, '') || '/'
  );
}
