import { useEffect } from 'react';

const MESSAGE_TYPE = 'dgx-rent-vs-buy-calculator:resize';

/** Notify parent frames of content height changes (for responsive iframes). */
export function useEmbedResize(enabled: boolean) {
  useEffect(() => {
    if (!enabled || window.parent === window) return;

    const postHeight = () => {
      window.parent.postMessage(
        { type: MESSAGE_TYPE, height: document.documentElement.scrollHeight },
        '*',
      );
    };

    postHeight();
    const observer = new ResizeObserver(postHeight);
    observer.observe(document.body);

    return () => observer.disconnect();
  }, [enabled]);
}
