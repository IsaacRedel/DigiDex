export function artPath(d, size = 'large') {
  return './' + (d.imageVariants?.[size] || d.image);
}

export function artSrcset(d) {
  if (!d.imageVariants) return '';
  return `${artPath(d, 'medium')} 480w, ${artPath(d)} 960w`;
}

export const artSizes = '(max-width: 600px) 80vw, 420px';

export function artAttributes(d, size = 'large') {
  const responsive = size === 'large' && d.imageVariants
    ? ` srcset="${artSrcset(d)}" sizes="${artSizes}"`
    : '';
  return `src="${artPath(d, size)}"${responsive}`;
}
