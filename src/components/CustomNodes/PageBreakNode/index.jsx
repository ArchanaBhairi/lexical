import { DecoratorNode } from "lexical";
import React from "react";
 
export class PageBreakNode extends DecoratorNode {
  static getType() {
    return "page-break";
  }
 
  static clone(node) {
    return new PageBreakNode(node.__key);
  }
 
  static importJSON(serializedNode) {
    return new PageBreakNode();
  }
 
  exportJSON() {
    return {
      type: "page-break",
      version: 1,
    };
  }
 
  static importDOM() {
    return {
      div: (domNode) => {
        if (domNode.style.pageBreakBefore === 'always' ||
            domNode.style.breakBefore === 'page' ||
            domNode.classList.contains('page-break')) {
          return {
            conversion: () => ({ node: $createPageBreakNode() }),
            priority: 1,
          };
        }
        return null;
      },
    };
  }
 
  exportDOM() {
    const element = document.createElement("div");
    element.style.pageBreakBefore = "always";
    element.style.breakBefore = "page";
    element.className = "page-break";
    return { element };
  }
 
  createDOM() {
    const div = document.createElement("div");
    div.className = "page-break";
    return div;
  }
 
  updateDOM() {
    return false;
  }
 
  decorate() {
    return (
      <div className="page-break">
        <span>Page Break</span>
      </div>
    );
  }
 
  isInline() {
    return false;
  }
 
  isKeyboardSelectable() {
    return true;
  }
}
 
export function $createPageBreakNode() {
  return new PageBreakNode();
}
 
export function $isPageBreakNode(node) {
  return node instanceof PageBreakNode;
}