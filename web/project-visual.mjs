import { artworks, projectIcons } from './catalog.mjs';
import { icon } from './ui.mjs';

export function projectVisual({ artwork, color }) {
  if (Object.hasOwn(artworks, artwork)) {
    return `<img class="project-artwork" src="${artworks[artwork].src}" alt="" width="1024" height="500">`;
  }
  return `<span class="project-icon">${icon(projectIcons[color][1])}</span>`;
}
