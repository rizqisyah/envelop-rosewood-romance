/*
 * Every sheet asset, keyed by its file name under src/assets/art/ ("tree-tall.webp"), so the
 * generated band tables can name assets as plain strings instead of one import line each.
 * The sheet reuses most of its florals across bands, so assets are stored once by what they
 * are, not per band -- see the ASSETS map in scripts/frame270.py.
 */
const modules = import.meta.glob('../assets/art/*.{webp,svg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export const art = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [path.split('/').pop()!, url]),
) as Record<string, string>
