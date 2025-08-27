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
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";

import { lexicalEditorConfig } from "../../config/lexicalEditorConfig";
import LexicalEditorTopBar from "../LexicalEditorTopBar";
import FloatingTextFormatToolbarPlugin from "../CustomPlugins/FloatingTextFormatPlugin";
import ImagesPlugin from "../CustomPlugins/ImagePlugin";
import { CellContext } from "../CustomPlugins/TablePlugin";
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
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      position: 'relative'
    }}>
      <LexicalComposer initialConfig={lexicalEditorConfig}>
        <CellContext.Provider
          value={{
            cellEditorConfig,
            cellEditorPlugins: null,
          }}
        >
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

          {/* Main editor area with pagination */}
          <Box sx={{ position: 'relative', width: '100%' }}>
            <PaginationPlugin 
              topMargin={margins.top}
              bottomMargin={margins.bottom}
              leftMargin={margins.left}
              rightMargin={margins.right}
            />
            
            <Box sx={{ 
              position: 'relative', 
              zIndex: 2,
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '20px'
            }}>
              <Box sx={{ 
                width: '816px', // A4 width
                position: 'relative'
              }}>
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      style={{
                        minHeight: '1056px', // A4 height
                        outline: 'none',
                        padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
                        backgroundColor: 'transparent',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  }
                  placeholder={
                    <Box
                      sx={{
                        position: 'absolute',
                        top: margins.top + 15,
                        left: margins.left + 10,
                        userSelect: 'none',
                        pointerEvents: 'none',
                        color: '#999',
                        fontSize: '14px',
                      }}
                    >
                      Start typing your document...
                    </Box>
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
              </Box>
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
        </CellContext.Provider>
      </LexicalComposer>
    </Box>
  );
};

export default LexicalEditorWrapper;