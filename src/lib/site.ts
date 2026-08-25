export const site = {
  name: 'Aman Sriven',
  domain: 'amansriven.com',
  url: 'https://amansriven.com',
  role: 'Software Engineer',
  title: 'Aman Sriven — Software Engineer',
  description:
    'Software engineer building infrastructure and products people actually use. Computer science at Texas A&M. Previously platform and AI engineering at Humana and JAGGAER.',
  email: 'sriven.aman@gmail.com',
  location: 'College Station, TX',
  school: 'Texas A&M University',
} as const;

export const socials = [
  { label: 'GitHub', href: 'https://github.com/amansriven', handle: 'amansriven' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/aman-sriven', handle: 'aman-sriven' },
  { label: 'Email', href: `mailto:${site.email}`, handle: site.email },
] as const;

export const nav = [
  { label: 'Work', href: '/#work' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Research', href: '/research' },
  { label: 'About', href: '/#about' },
] as const;

/** The emphasised nav action, rendered as a button rather than a link. */
export const navCta = { label: 'Contact', href: '/#contact' } as const;
