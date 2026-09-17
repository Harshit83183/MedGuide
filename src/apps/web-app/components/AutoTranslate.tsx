import { useEffect } from 'react';
import { translateStatic, useLanguage } from '../lib/language';

const originalText = new WeakMap<Text, string>();
const attrNames = ['placeholder', 'title', 'aria-label'] as const;

function register(root: Node) {
  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node as Text;
      if (!originalText.has(t)) originalText.set(t, t.data);
      return;
    }
    if (!(node instanceof Element)) return;
    if (node.closest('[data-no-translate="true"]')) return;
    for (const attr of attrNames) {
      const val = node.getAttribute(attr);
      if (val && !node.hasAttribute('data-i18n-' + attr)) node.setAttribute('data-i18n-' + attr, val);
    }
    node.childNodes.forEach(visit);
  };
  visit(root);
}

function apply(root: Node, lang: ReturnType<typeof useLanguage>['lang']) {
  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node as Text;
      const src = originalText.get(t) ?? t.data;
      if (!originalText.has(t)) originalText.set(t, src);
      t.data = translateStatic(src, lang);
      return;
    }
    if (!(node instanceof Element)) return;
    if (node.closest('[data-no-translate="true"]')) return;
    for (const attr of attrNames) {
      const src = node.getAttribute('data-i18n-' + attr);
      if (src) node.setAttribute(attr, translateStatic(src, lang));
    }
    node.childNodes.forEach(visit);
  };
  visit(root);
}

export default function AutoTranslate() {
  const { lang } = useLanguage();
  useEffect(() => {
    register(document.body);
    apply(document.body, lang);
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          m.addedNodes.forEach((n) => { register(n); apply(n, lang); });
        } else if (m.type === 'characterData') {
          const t = m.target as Text;
          const src = originalText.get(t);
          const expected = src ? translateStatic(src, lang) : null;
          // Ignore the mutation caused by our own translation. If React has
          // written new source text into the node, remember it and translate it.
          if (!src || t.data !== expected) {
            originalText.set(t, t.data);
            apply(t, lang);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [lang]);
  return null;
}
