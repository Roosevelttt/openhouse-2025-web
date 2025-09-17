import { writable, type Writable } from 'svelte/store';

export const assetLoadingPromises: Writable<Promise<void>[]> = writable([]);

export function loadImage(src: string | null): Promise<void> {
  return new Promise((resolve) => {
    if (!src) {
      return resolve();
    }
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => {
    //   console.warn(`Failed to load image: ${src}`);
      resolve();
    };
  });
}