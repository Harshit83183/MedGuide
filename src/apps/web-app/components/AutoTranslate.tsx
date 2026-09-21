import { useEffect } from 'react';
import {
  translateStatic,
  useLanguage,
  type Lang
} from '../lib/language';

const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<
  Element,
  Map<string, string>
>();

const attributes = [
  'placeholder',
  'title',
  'aria-label',
  'alt'
] as const;

function shouldSkip(element: Element) {
  return Boolean(
    element.closest(
      '[data-no-translate="true"], script, style, code, pre'
    )
  );
}

function rememberText(node: Text) {
  if (!originalText.has(node)) {
    originalText.set(node, node.data);
  }
}

function rememberAttributes(element: Element) {
  if (shouldSkip(element)) return;

  let saved = originalAttributes.get(element);

  if (!saved) {
    saved = new Map<string, string>();
    originalAttributes.set(element, saved);
  }

  for (const attribute of attributes) {
    const value = element.getAttribute(attribute);

    if (value !== null && !saved.has(attribute)) {
      saved.set(attribute, value);
    }
  }
}

function registerNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node as Text;
    const parent = text.parentElement;

    if (!parent || shouldSkip(parent)) return;

    rememberText(text);
    return;
  }

  if (!(node instanceof Element)) return;
  if (shouldSkip(node)) return;

  rememberAttributes(node);

  for (const child of Array.from(node.childNodes)) {
    registerNode(child);
  }
}

function translateTextNode(node: Text, lang: Lang) {
  const parent = node.parentElement;

  if (!parent || shouldSkip(parent)) return;

  const source = originalText.get(node) ?? node.data;

  if (!originalText.has(node)) {
    originalText.set(node, source);
  }

  const translated = translateStatic(source, lang);

  if (node.data !== translated) {
    node.data = translated;
  }
}

function translateElementAttributes(
  element: Element,
  lang: Lang
) {
  if (shouldSkip(element)) return;

  rememberAttributes(element);

  const saved = originalAttributes.get(element);

  if (!saved) return;

  for (const [attribute, source] of saved.entries()) {
    const translated = translateStatic(source, lang);

    if (element.getAttribute(attribute) !== translated) {
      element.setAttribute(attribute, translated);
    }
  }
}

function translateNode(node: Node, lang: Lang) {
  if (node.nodeType === Node.TEXT_NODE) {
    translateTextNode(node as Text, lang);
    return;
  }

  if (!(node instanceof Element)) return;
  if (shouldSkip(node)) return;

  translateElementAttributes(node, lang);

  for (const child of Array.from(node.childNodes)) {
    translateNode(child, lang);
  }
}

function handleTextMutation(node: Text, lang: Lang) {
  const parent = node.parentElement;

  if (!parent || shouldSkip(parent)) return;

  const previousSource = originalText.get(node);

  if (!previousSource) {
    originalText.set(node, node.data);
    translateTextNode(node, lang);
    return;
  }

  const expectedTranslation = translateStatic(
    previousSource,
    lang
  );

  if (node.data === expectedTranslation) {
    return;
  }

  if (node.data !== previousSource) {
    originalText.set(node, node.data);
  }

  translateTextNode(node, lang);
}

function handleAttributeMutation(
  element: Element,
  attributeName: string,
  lang: Lang
) {
  if (
    !attributes.includes(
      attributeName as (typeof attributes)[number]
    )
  ) {
    return;
  }

  if (shouldSkip(element)) return;

  const current = element.getAttribute(attributeName);

  if (current === null) return;

  let saved = originalAttributes.get(element);

  if (!saved) {
    saved = new Map<string, string>();
    originalAttributes.set(element, saved);
  }

  const previousSource = saved.get(attributeName);

  if (!previousSource) {
    saved.set(attributeName, current);
  } else {
    const expected = translateStatic(
      previousSource,
      lang
    );

    if (
      current !== expected &&
      current !== previousSource
    ) {
      saved.set(attributeName, current);
    }
  }

  const source =
    saved.get(attributeName) ?? current;

  const translated = translateStatic(source, lang);

  if (current !== translated) {
    element.setAttribute(
      attributeName,
      translated
    );
  }
}

export default function AutoTranslate() {
  const { lang } = useLanguage();

  useEffect(() => {
    const root = document.body;

    registerNode(root);
    translateNode(root, lang);

    const observer = new MutationObserver(
      (mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            for (const node of Array.from(
              mutation.addedNodes
            )) {
              registerNode(node);
              translateNode(node, lang);
            }
          }

          if (
            mutation.type === 'characterData' &&
            mutation.target.nodeType ===
              Node.TEXT_NODE
          ) {
            handleTextMutation(
              mutation.target as Text,
              lang
            );
          }

          if (
            mutation.type === 'attributes' &&
            mutation.target instanceof Element &&
            mutation.attributeName
          ) {
            handleAttributeMutation(
              mutation.target,
              mutation.attributeName,
              lang
            );
          }
        }
      }
    );

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...attributes]
    });

    return () => {
      observer.disconnect();
    };
  }, [lang]);

  return null;
}