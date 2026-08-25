<script lang="ts">
  interface NavItem {
    label: string;
    href: string;
  }

  let { items, cta }: { items: NavItem[]; cta: NavItem } = $props();

  let open = $state(false);
  let panel = $state<HTMLElement | null>(null);

  function close() {
    open = false;
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) {
      close();
      trigger?.focus();
    }
  }

  let trigger = $state<HTMLButtonElement | null>(null);

  // Lock background scrolling while the sheet is open, and move focus into it.
  $effect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) panel?.querySelector<HTMLAnchorElement>('a')?.focus();
    return () => {
      document.body.style.overflow = '';
    };
  });
</script>

<svelte:window on:keydown={onKeydown} />

<button
  bind:this={trigger}
  class="trigger"
  type="button"
  aria-expanded={open}
  aria-controls="mobile-nav"
  onclick={() => (open = !open)}
>
  {open ? 'Close' : 'Menu'}
</button>

<div
  id="mobile-nav"
  class="sheet"
  class:is-open={open}
  bind:this={panel}
  inert={!open}
  aria-hidden={!open}
>
  <nav aria-label="Primary mobile">
    <ul>
      {#each items as item, i (item.href)}
        <li style="--i: {i}">
          <a href={item.href} onclick={close}>{item.label}</a>
        </li>
      {/each}
      <li style="--i: {items.length}">
        <a class="sheet__cta" href={cta.href} onclick={close}>{cta.label}</a>
      </li>
    </ul>
  </nav>
</div>

<style>
  .trigger {
    display: none;
    position: relative;
    z-index: 2;
    padding: 0.4rem 0.85rem;
    font-size: var(--fs-sm);
    color: var(--text);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-full);
    transition: border-color var(--dur) var(--ease-out);
  }

  .trigger:hover {
    border-color: var(--border-bright);
  }

  .sheet {
    position: fixed;
    inset: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    padding: var(--gutter);
    background: var(--bg);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-1.25rem);
    transition:
      opacity var(--dur) var(--ease-out),
      transform var(--dur) var(--ease-out),
      visibility var(--dur);
  }

  .sheet.is-open {
    opacity: 1;
    visibility: visible;
    transform: none;
  }

  .sheet ul {
    display: grid;
    gap: var(--space-4);
    width: 100%;
  }

  .sheet a {
    display: block;
    padding-block: var(--space-2);
    font-size: clamp(2rem, 11vw, 3rem);
    font-weight: 500;
    letter-spacing: var(--tracking-tight);
    line-height: 1.1;
    color: var(--text);
    opacity: 0;
    transform: translateY(0.5rem);
    transition:
      opacity var(--dur) var(--ease-out),
      transform var(--dur) var(--ease-out);
    transition-delay: calc(var(--i) * 45ms + 60ms);
  }

  .sheet.is-open a {
    opacity: 1;
    transform: none;
  }

  .sheet__cta {
    color: var(--accent);
  }

  @media (max-width: 47.99rem) {
    .trigger {
      display: inline-flex;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sheet,
    .sheet a {
      transition-duration: 0.01ms;
      transition-delay: 0ms;
    }
  }
</style>
