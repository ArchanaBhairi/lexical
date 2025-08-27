import React, { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createPageBreakNode } from "../CustomNodes/PageBreakNode";
import { $getNodeByKey } from "lexical";

/**
 * AutoPageBreakPlugin
 * - Measures DOM blocks inside the content root
 * - Inserts PageBreakNode before the first block that overflows available height
 * - Repeats until no overflow remains (bounded loop) to handle large pastes/imports
 */
export default function AutoPageBreakPlugin({ pageHeightPx, topMarginPx, bottomMarginPx }) {
  const [editor] = useLexicalComposerContext();
  const handlingRef = useRef(false);

  useEffect(() => {
    if (!pageHeightPx || pageHeightPx <= 0) return;

    const availableHeight = Math.max(0, pageHeightPx - (topMarginPx || 0) - (bottomMarginPx || 0));

    const paginateOnce = () => {
      const rootEl = editor.getRootElement();
      if (!rootEl) return false;

      const children = Array.from(rootEl.children || []);
      if (!children.length) return false;

      let consumed = 0;
      const isPageBreakEl = (el) => el.classList && el.classList.contains("page-break");

      for (let i = 0; i < children.length; i++) {
        const el = children[i];
        if (isPageBreakEl(el)) {
          el.style.marginTop = "0px";
          consumed = 0;
          continue;
        }
        const rect = el.getBoundingClientRect();
        const height = Math.max(0, Math.round(rect.height));
        const nextConsumed = consumed + height;
        if (nextConsumed > availableHeight) {
          const prev = children[i - 1];
          if (prev && isPageBreakEl(prev)) {
            consumed = height;
            continue;
          }
          const leftover = Math.max(0, availableHeight - consumed);
          if (handlingRef.current) return false;
          handlingRef.current = true;
          editor.update(() => {
            try {
              const nodeKey = el.getAttribute && el.getAttribute("data-lexical-node-key");
              const node = nodeKey ? $getNodeByKey(nodeKey) : null;
              if (node && node.insertBefore) {
                node.insertBefore($createPageBreakNode());
              }
            } finally {
              handlingRef.current = false;
            }
          });
          requestAnimationFrame(() => {
            let breaker = el.previousElementSibling;
            while (breaker && !isPageBreakEl(breaker)) breaker = breaker.previousElementSibling;
            if (breaker && isPageBreakEl(breaker)) breaker.style.marginTop = `${leftover}px`;
          });
          return true; // inserted one break
        } else {
          consumed = nextConsumed;
        }
      }
      return false; // no insertion needed
    };

    const paginateAll = () => {
      // Insert up to N breaks per frame to converge on long docs
      let safety = 20;
      let changed = false;
      const step = () => {
        let inserted = false;
        do {
          inserted = paginateOnce();
          changed = changed || inserted;
        } while (inserted && --safety > 0);
      };
      step();
      return changed;
    };

    const unregister = editor.registerUpdateListener(() => {
      requestAnimationFrame(() => {
        paginateAll();
      });
    });

    requestAnimationFrame(() => {
      paginateAll();
    });

    return () => {
      unregister();
    };
  }, [editor, pageHeightPx, topMarginPx, bottomMarginPx]);

  return null;
}
