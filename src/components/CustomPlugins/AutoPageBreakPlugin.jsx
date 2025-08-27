import React, { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createPageBreakNode } from "../CustomNodes/PageBreakNode";
import { $getNodeByKey } from "lexical";

/**
 * AutoPageBreakPlugin - Legacy plugin, now replaced by PaginationPlugin
 * Kept for backward compatibility
 */
export default function AutoPageBreakPlugin({ pageHeightPx, topMarginPx, bottomMarginPx }) {
  console.warn('AutoPageBreakPlugin is deprecated. Use PaginationPlugin instead.');
  return null;
}
