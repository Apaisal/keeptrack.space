export const slideOutLeft = (el: HTMLElement | null, duration: number, callback?: () => void, offset?: number): void => {
  if (!el) {
    console.warn('Element not found!');
    return;
  }

  if (el.style.display === 'none') return;
  el.style.transition = `transform ${duration / 1000}s ease-in-out`;
  el.style.transform = `translateX(${offset || -100}%)`;
  setTimeout(() => {
    if (callback) callback();
  }, duration);
};
/**
 * Causes the HTML Element to slide in from the right
 */

export const slideInRight = (el: HTMLElement | null, duration: number, callback?: () => void): void => {
  if (!el) {
    console.warn('Element not found!');
    return;
  }

  // Start off the screen
  el.style.display = 'block';
  el.style.transform = `translateX(-100%)`;
  el.style.transition = `transform 0s ease-in-out`;
  setTimeout(() => {
    el.style.display = 'block';
    el.style.transition = `transform ${duration / 1000}s ease-in-out`;
    el.style.transform = 'translateX(0)';
  }, 50);
  setTimeout(() => {
    if (callback) callback();
  }, duration);
};
/**
 * Causes the HTML Element to slide out to the top
 */

export const slideOutUp = (el: HTMLElement, duration: number, callback?: () => void): void => {
  if (el === null) throw new Error('Element not found!');

  if (el.style.display === 'none') return;
  el.style.transition = `transform ${duration / 1000}s ease-in-out`;
  el.style.transform = `translateY(${-100}%)`;
  setTimeout(() => {
    if (callback) callback();
  }, duration);
};

export const slideInDown = (el: HTMLElement, duration: number, callback?: () => void): void => {
  if (el === null) throw new Error('Element not found!');

  el.style.transform = `translateY(-100%)`;
  el.style.transition = `transform 0s ease-in-out`;
  el.style.display = 'block';
  setTimeout(() => {
    el.style.display = 'block';
    el.style.transition = `transform ${duration / 1000}s ease-in-out`;
    el.style.transform = 'translateY(0)';
    if (callback) callback();
  }, 50);
};
