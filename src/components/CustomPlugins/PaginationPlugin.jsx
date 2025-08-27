import React, { useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createPageBreakNode } from "../CustomNodes/PageBreakNode";
import { $getNodeByKey } from "lexical";
import { Box } from "@mui/material";

/**
 * PaginationPlugin - Creates paginated view similar to Word/Google Docs
 * - Measures DOM nodes and calculates page breaks
 * - Renders visual page backgrounds
 * - Handles automatic and manual page breaks
 * - Supports A4 page dimensions
 */
export default function PaginationPlugin({ 
  pageWidth = 816, // A4 width in pixels (8.5" * 96 DPI)
  pageHeight = 1056, // A4 height in pixels (11" * 96 DPI)
  topMargin = 96, // 1 inch
  bottomMargin = 96, // 1 inch
  leftMargin = 96, // 1 inch
  rightMargin = 96, // 1 inch
  pageGap = 20 // Gap between pages
}) {
  const [editor] = useLexicalComposerContext();
  const [pages, setPages] = useState([]);
  const containerRef = useRef(null);
  const handlingRef = useRef(false);
  const resizeObserverRef = useRef(null);

  const availableHeight = pageHeight - topMargin - bottomMargin;
  const availableWidth = pageWidth - leftMargin - rightMargin;

  useEffect(() => {
    const calculatePagination = () => {
      if (handlingRef.current) return;
      
      const rootEl = editor.getRootElement();
      if (!rootEl || !containerRef.current) return;

      const children = Array.from(rootEl.children || []);
      if (!children.length) {
        setPages([{ height: pageHeight, nodes: [] }]);
        return;
      }

      let currentPageHeight = 0;
      let currentPageNodes = [];
      let pagesList = [];
      let pageNumber = 1;

      const isPageBreakEl = (el) => el.classList && el.classList.contains("page-break");

      children.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const nodeHeight = Math.max(0, Math.round(rect.height));
        
        // Handle manual page breaks
        if (isPageBreakEl(el)) {
          // Finish current page
          if (currentPageNodes.length > 0) {
            pagesList.push({
              height: pageHeight,
              nodes: [...currentPageNodes],
              pageNumber: pageNumber++
            });
          }
          
          // Start new page
          currentPageHeight = 0;
          currentPageNodes = [];
          
          // Add margin to next element if it exists
          const nextEl = children[index + 1];
          if (nextEl && !isPageBreakEl(nextEl)) {
            const remainingSpace = availableHeight - currentPageHeight;
            nextEl.style.marginTop = `${remainingSpace}px`;
          }
          return;
        }

        // Check if node fits on current page
        if (currentPageHeight + nodeHeight > availableHeight && currentPageNodes.length > 0) {
          // Finish current page
          pagesList.push({
            height: pageHeight,
            nodes: [...currentPageNodes],
            pageNumber: pageNumber++
          });

          // Calculate margin for new page
          const remainingSpace = availableHeight - currentPageHeight;
          el.style.marginTop = `${remainingSpace}px`;
          
          // Start new page
          currentPageHeight = nodeHeight;
          currentPageNodes = [el];
        } else {
          // Add to current page
          if (currentPageNodes.length === 0) {
            // Reset margin for first element on page
            el.style.marginTop = "";
          }
          currentPageHeight += nodeHeight;
          currentPageNodes.push(el);
        }
      });

      // Add final page
      if (currentPageNodes.length > 0) {
        pagesList.push({
          height: pageHeight,
          nodes: currentPageNodes,
          pageNumber: pageNumber
        });
      }

      // Ensure at least one page exists
      if (pagesList.length === 0) {
        pagesList.push({ height: pageHeight, nodes: [], pageNumber: 1 });
      }

      setPages(pagesList);
    };

    // Initial calculation
    setTimeout(calculatePagination, 100);

    // Listen for editor updates
    const unregisterUpdate = editor.registerUpdateListener(() => {
      setTimeout(calculatePagination, 50);
    });

    // Listen for window resize
    const handleResize = () => {
      setTimeout(calculatePagination, 100);
    };
    window.addEventListener('resize', handleResize);

    // Set up ResizeObserver for content changes
    const rootEl = editor.getRootElement();
    if (rootEl && window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver(() => {
        setTimeout(calculatePagination, 50);
      });
      resizeObserverRef.current.observe(rootEl);
    }

    return () => {
      unregisterUpdate();
      window.removeEventListener('resize', handleResize);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [editor, availableHeight, pageHeight]);

  // Apply page styling to editor
  useEffect(() => {
    const rootEl = editor.getRootElement();
    if (!rootEl) return;

    // Style the editor container
    rootEl.style.width = `${availableWidth}px`;
    rootEl.style.minHeight = `${availableHeight}px`;
    rootEl.style.padding = `${topMargin}px ${rightMargin}px ${bottomMargin}px ${leftMargin}px`;
    rootEl.style.margin = '0';
    rootEl.style.backgroundColor = 'white';
    rootEl.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    rootEl.style.position = 'relative';
    rootEl.style.zIndex = '1';

    return () => {
      // Cleanup styles if needed
      rootEl.style.width = '';
      rootEl.style.minHeight = '';
      rootEl.style.padding = '';
      rootEl.style.margin = '';
      rootEl.style.backgroundColor = '';
      rootEl.style.boxShadow = '';
      rootEl.style.position = '';
      rootEl.style.zIndex = '';
    };
  }, [availableWidth, availableHeight, topMargin, rightMargin, bottomMargin, leftMargin]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        padding: '20px 0',
      }}
    >
      {/* Render page backgrounds */}
      {pages.map((page, index) => (
        <Box
          key={`page-${index}`}
          sx={{
            width: `${pageWidth}px`,
            height: `${pageHeight}px`,
            backgroundColor: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: index < pages.length - 1 ? `${pageGap}px` : 0,
            position: 'absolute',
            top: `${20 + index * (pageHeight + pageGap)}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 0,
            border: '1px solid #ddd',
            '&::before': {
              content: `"Page ${page.pageNumber}"`,
              position: 'absolute',
              bottom: '10px',
              right: '20px',
              fontSize: '10px',
              color: '#999',
              fontFamily: 'Arial, sans-serif',
            }
          }}
        />
      ))}
      
      {/* Page ruler/guides (optional) */}
      {pages.map((page, index) => (
        <Box
          key={`ruler-${index}`}
          sx={{
            width: `${pageWidth}px`,
            height: `${pageHeight}px`,
            position: 'absolute',
            top: `${20 + index * (pageHeight + pageGap)}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 0,
            pointerEvents: 'none',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: `${topMargin}px`,
              left: `${leftMargin}px`,
              right: `${rightMargin}px`,
              bottom: `${bottomMargin}px`,
              border: '1px dashed rgba(0,0,0,0.1)',
            }
          }}
        />
      ))}
    </Box>
  );
}