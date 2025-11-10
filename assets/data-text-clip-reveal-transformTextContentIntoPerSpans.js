/* eslint-disable max-depth */
/* eslint-disable complexity */
import { setAttributes } from './lib-dom-setAttributes.js';
import { some } from './lib-type-some.js';
/** @import {PerSplitMode} from './data-text-clip-reveal-PerSplitMode.js' */

export function transformTextContentIntoPerSpans(
  /** @type {HTMLElement | SVGElement} */ el,
  /** @type {PerSplitMode} */ per,
) {
  /**
   * Some stupid typescript bug that fucks up `Parameters<>` & also anything
   * that directly does `extends (a: infer P) => any ? P : never`
   *
   * @type {typeof recursivelyTransformTextContentToSpans extends (
   *     (_: any, __: any, context: infer P) => any
   *   ) ?
   *     P
   *   : never}
   */
  const context = { index: 0, spans: [] };
  recursivelyTransformTextContentToSpans(el, per, context);
  const { index: length, spans } = context;

  return { el, length, spans };
}

function recursivelyTransformTextContentToSpans(
  /** @type {HTMLElement | SVGElement} */ el,
  /** @type {PerSplitMode} */ per,
  /** @type {{ index: number; spans: HTMLSpanElement[] }} */ context,
) {
  if (el instanceof HTMLScriptElement || el instanceof HTMLStyleElement) return;
  for (const node of [...el.childNodes]) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!some(node.textContent) || node.textContent.trim().length <= 0)
        continue;

      /** @type {(Node | string)[]} */
      const nodes = [];
      /** @type {RegExpExecArray | null} */
      let match;
      let partIndex = 0;
      switch (per) {
        case 'word':
          {
            const regex =
              /(?<part>[^ \t\n\r\f\v]+?)?(?:(?<space>\s+)|(?<end>$))/g;
            while ((match = regex.exec(node.textContent))) {
              // this should never happen!
              if (!match.groups) break;

              // NOTE: <end> could be matched twice if we don't
              // have a trailing space, as it would match <word><end>,
              // then just <end> on the next iteration
              const { part, space, end } = match.groups;

              // we've somehow reached the final <end> match
              if (
                part === undefined &&
                space === undefined &&
                end !== undefined
              )
                break;

              // leading space
              if (part === undefined) {
                nodes.push(
                  createSpaceSpan(
                    // space will always be defined here
                    // because it'll either be <word> or <space>
                    // as they're both the inverse matchers of each other
                    space ?? '',
                    context,
                  ),
                );
                continue;
              }

              // word
              const word = part;
              const subwords = word.split(
                /(?<=\d|\d,|[，、,。.]|[\u4E00-\u9FFF](?![，、,。.]))/gu,
              );
              for (const subword of subwords) {
                const span = createPerSpan(subword, partIndex, context);
                nodes.push(span);
                partIndex++;
              }

              // end
              if (end !== undefined) break;

              // trailing space
              nodes.push(
                createSpaceSpan(
                  // space will always be defined here
                  // because it'll either be <end> or <space>
                  space ?? '',
                  context,
                ),
              );
            }
          }
          break;
        case 'character':
          {
            const { textContent } = node;

            /** @type {HTMLSpanElement | undefined} */
            let wordSpan;
            for (const character of textContent) {
              if (character === '\xad') {
                nodes.push('\u2060\xad');
                wordSpan = undefined;
              }
              if (/\s/.test(character)) {
                nodes.push(createSpaceSpan(character, context));
                wordSpan = undefined;
              } else {
                if (!wordSpan) {
                  wordSpan = document.createElement('span');
                  setAttributes(wordSpan, {
                    'data-per-glue': true,
                  });
                  nodes.push(wordSpan);
                }
                wordSpan.append(createPerSpan(character, partIndex, context));
                partIndex++;
              }
            }
          }
          break;
      }

      context.index +=
        // wordIndex is always 1 ahead of the actual word count
        // making it the size at the end of the iteration
        partIndex;

      node.replaceWith(...nodes);
    } else if (
      el.getAttribute('data-word-exclude') === null &&
      el.getAttribute('data-word') === null
    )
      recursivelyTransformTextContentToSpans(
        /** @type {HTMLElement} */ (node),
        per,
        context,
      );
  }
}

function createSpaceSpan(
  /** @type {string} */ textContent,
  /** @type {{}} */ context,
) {
  const span = document.createElement('span');
  setAttributes(span, {
    textContent,
  });
  return span;
}

function createPerSpan(
  /** @type {string} */ textContent,
  /** @type {number} */ wordIndex,
  /** @type {{ spans: HTMLSpanElement[]; index: number }} */ context,
) {
  const span = document.createElement('span');
  setAttributes(span, {
    'data-per': textContent,
    style: {
      '--per-index': `${wordIndex + context.index}`,
    },
    textContent,
  });
  context.spans.push(span);
  return span;
}
