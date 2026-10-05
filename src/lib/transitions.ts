/**
 * Shared view-transition names for a project. A project card (homepage tile or
 * /projects row) and the project page give the same names to the hero image
 * and title, so navigating between them morphs one into the other. Each name
 * appears at most once per page because each project has one card per page.
 * The animation itself lives in base.css under "Page transitions".
 */
export function projectTransition(id: string) {
  return {
    media: `view-transition-name: project-${id}-media; view-transition-class: project-media`,
    title: `view-transition-name: project-${id}-title; view-transition-class: project-title`,
  };
}
