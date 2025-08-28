import React, { useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import {LexicalErrorBoundary} from "@lexical/react/LexicalErrorBoundary";

import { lexicalEditorConfig } from "../../config/lexicalEditorConfig";
import LexicalEditorTopBar from "../LexicalEditorTopBar";
import FloatingTextFormatToolbarPlugin from "../CustomPlugins/FloatingTextFormatPlugin";
import ImagesPlugin from "../CustomPlugins/ImagePlugin";
import PaginationPlugin from "../CustomPlugins/PaginationPlugin";
import { Box, Typography } from "@mui/material";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $getRoot } from "lexical";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

const cellEditorConfig = {
  namespace: "Playground",
  nodes: [...lexicalEditorConfig.nodes],
  onError: (error) => {
    throw error;
  },
  theme: lexicalEditorConfig.theme,
};

const LexicalEditorWrapper = () => {
  const [margins, setMargins] = useState({ top: 96, right: 96, bottom: 96, left: 96 });
  const [marginPreset, setMarginPreset] = useState("normal");
  const [customOpen, setCustomOpen] = useState(false);
  const [tempMargins, setTempMargins] = useState(margins);

  const onDownloadDocx = async (editor) => {
    editor.update(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      
      // Simple HTML to DOCX conversion
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Document exported from Lexical Editor",
                  bold: true,
                }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Content: " + $getRoot().getTextContent(),
                }),
              ],
            }),
          ],
        }],
      });

      Packer.toBlob(doc).then((blob) => {
        saveAs(blob, "document.docx");
      });
    });
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100vh',
      backgroundColor: '#f5f5f5',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <LexicalComposer initialConfig={lexicalEditorConfig}>
        
          {/* Top toolbar */}
          <LexicalEditorTopBar 
            onDownloadDocx={onDownloadDocx}
            margins={margins}
            setMargins={setMargins}
            marginPreset={marginPreset}
            setMarginPreset={setMarginPreset}
            customOpen={customOpen}
            setCustomOpen={setCustomOpen}
            tempMargins={tempMargins}
            setTempMargins={setTempMargins}
          />

          {/* Main editor area with Word-like pagination */}
          <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: 'calc(100vh - 120px)', // Subtract toolbar height
            overflow: 'auto',
            backgroundColor: '#f5f5f5'
          }}>
            <PaginationPlugin 
              topMargin={margins.top}
              bottomMargin={margins.bottom}
              leftMargin={margins.left}
              rightMargin={margins.right}
            />
            
            {/* Word-like editor positioned over the pages */}
            <Box sx={{ 
              position: 'absolute', 
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2,
              width: '816px', // A4 width
              minHeight: '100%'
            }}>
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    style={{
                      minHeight: '1056px', // A4 height
                      outline: 'none',
                      padding: '0', // Remove padding, handled by PaginationPlugin
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      fontFamily: 'Arial, sans-serif',
                      border: 'none',
                      width: '100%',
                    }}
                  />
                }
                placeholder={
                  <Box
                    sx={{
                      position: 'absolute',
                      top: margins.top + 10,
                      left: margins.left + 10,
                      userSelect: 'none',
                      pointerEvents: 'none',
                      color: '#999',
                      fontSize: '14px',
                      fontFamily: 'Arial, sans-serif',
                    }}
                  >
                    Start typing your document...
                  </Box>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </Box>
          </Box>

          {/* Plugins */}
          <HistoryPlugin />
          <AutoFocusPlugin />
          <LinkPlugin />
          <ListPlugin />
          <ImagesPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <TablePlugin />
          <FloatingTextFormatToolbarPlugin />
        
      </LexicalComposer>
    </Box>
  );
};

export default LexicalEditorWrapper;