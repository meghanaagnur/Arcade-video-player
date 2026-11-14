import '@videojs/html/i18n';
import '@videojs/html/video/player';
import '@videojs/html/media/mux-video';
import '@/video/skin';
import '@fontsource/press-start-2p/400.css';
import './showcase.css';
import skinTemplate from '@/video/skin.html?raw';
import demoMedia from '@demo-media';

/**
 * The video the cabinet plays: a Pixabay stock clip hosted on Mux.
 * Mux instant clipping (asset_start_time / asset_end_time) serves the first 35 seconds,
 * long enough to reach the 2,500-point coin burst before Stage Clear.
 */
const MUX_PLAYBACK_ID = 'EIhBhFYpuoeo00D4GWyIE1UA7Q013r1TubCVMztuXV00yc';
const CLIP = { start: 0, end: 35 };
const SRC = `https://stream.mux.com/${MUX_PLAYBACK_ID}.m3u8?asset_start_time=${CLIP.start}&asset_end_time=${CLIP.end}`;
const POSTER = `https://image.mux.com/${MUX_PLAYBACK_ID}/thumbnail.webp?time=8`;

const MEDIA_PLACEHOLDER = '<!-- Add a compatible media component here. -->';

declare const __ARCADE_DEMO__: boolean;

// `?mp4=<same-origin path>` swaps in a plain MP4 for testing offline; demo builds bundle one.
const query = new URLSearchParams(location.search).get('mp4');
const mp4 = demoMedia || (query && query.startsWith('/') && !query.startsWith('//') ? query : '');
const media = mp4
    ? `<video src="${mp4.startsWith('data:') ? mp4 : encodeURI(mp4)}" playsinline preload="auto"></video>`
    : `<mux-video src="${SRC}" playsinline crossorigin></mux-video>`;

const i18n = document.createElement('media-i18n');
const player = document.createElement('video-player');
if (!mp4) player.setAttribute('poster', POSTER);
player.innerHTML = skinTemplate.replace(MEDIA_PLACEHOLDER, media);
i18n.append(player);
document.getElementById('player')!.append(i18n);

// Demo builds ship only this page, so drop the link to the workbench.
if (__ARCADE_DEMO__) document.querySelector('[data-workbench-link]')?.remove();

// Cabinet themes: the skin reads data-arcade-theme on its media container.
const THEME_KEY = 'midnight-arcade:cabinet:v1';
const container = document.querySelector<HTMLElement>('media-container');
const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-cabinet]'));
function setCabinet(name: string): void {
  if (!container) return;
  if (name === 'midnight') container.removeAttribute('data-arcade-theme');
  else container.setAttribute('data-arcade-theme', name);
  for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.cabinet === name));
  document.querySelector<HTMLElement>('.cabinet-notch')?.setAttribute('data-cabinet-current', name);
  try {
    localStorage.setItem(THEME_KEY, name);
  } catch {
    /* Not stored. */
  }
}
for (const b of buttons) b.addEventListener('click', () => setCabinet(b.dataset.cabinet ?? 'midnight'));
try {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved && buttons.some((b) => b.dataset.cabinet === saved)) setCabinet(saved);
} catch {
  /* Ignore. */
}
