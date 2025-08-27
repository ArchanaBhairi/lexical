import { $getRoot, $getSelection, $isRangeSelection } from "lexical";
import { useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { MuiContentEditable, placeHolderSx } from "./styles";
import { Box, Divider } from "@mui/material";
import { Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { lexicalEditorConfig } from "../../config/lexicalEditorConfig";
import LexicalEditorTopBar from "../LexicalEditorTopBar";
import TreeViewPlugin from "../CustomPlugins/TreeViewPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import ImagesPlugin from "../CustomPlugins/ImagePlugin";
import FloatingTextFormatToolbarPlugin from "../CustomPlugins/FloatingTextFormatPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  HeadingLevel,
  ExternalHyperlink,
  ShadingType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  TableLayoutType,
} from "docx";
import { saveAs } from "file-saver";
import ColorPlugin from "../CustomPlugins/ColorPlugin";
import {
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from "@lexical/selection";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import TableResizePlugin from "../CustomPlugins/TableResizePlugin";

import TableActionMenuPlugin from "../CustomPlugins/TableActionMenuPlugin";
import AutoPageBreakPlugin from "../CustomPlugins/AutoPageBreakPlugin";

// function LexicalEditorWrapper(props) {
//   const [margins, setMargins] = useState({ top: 96, right: 96, bottom: 96, left: 96 });
//   const [pageSize, setPageSize] = useState({ width: 794, height: 1123 });
//   const [marginPreset, setMarginPreset] = useState("normal");
//   const [customOpen, setCustomOpen] = useState(false);
//   const [tempMargins, setTempMargins] = useState(margins);

// 	// Function to handle DOCX download
// 	const handleDownloadDocx = async (editor) => {
// 		const editorState = editor.getEditorState();
// 		const blocks = [];

// 		// Capture editor-level default font family and size from DOM
// 		const readEditorDefaults = () => {
// 			const rootEl = document.querySelector('.ContentEditable__root');
// 			const cs = rootEl ? window.getComputedStyle(rootEl) : null;
// 			const fontFamily = cs?.fontFamily ? cs.fontFamily.split(',')[0].replace(/["']/g, '').trim() : undefined;
// 			const fontSizePx = cs?.fontSize ? parseFloat(cs.fontSize) : undefined;
// 			const fontSizeHalfPoints = Number.isFinite(fontSizePx) ? Math.round((fontSizePx * 0.75) * 2) : undefined; // px->pt->halfPoints
// 			return { fontFamily, fontSizeHalfPoints };
// 		};
// 		const editorDefaults = readEditorDefaults();

// 		// Measure table column widths directly from the DOM so DOCX matches the editor UI
// 		const measureTablesFromDOM = () => {
// 			const results = [];
// 			const rootEl = document.querySelector('.ContentEditable__root');
// 			if (!rootEl) return results;
// 			const tableEls = rootEl.querySelectorAll('table');
// 			tableEls.forEach((table) => {
// 				try {
// 					const firstRow = table.rows && table.rows[0];
// 					if (!firstRow) {
// 						results.push(null);
// 						return;
// 					}
// 					const colWidthsPx = [];
// 					for (let ci = 0; ci < firstRow.cells.length; ci++) {
// 						const rect = firstRow.cells[ci].getBoundingClientRect();
// 						colWidthsPx.push(Math.max(0, Math.round(rect.width)));
// 					}
// 					const totalPx = colWidthsPx.reduce((a, b) => a + b, 0);
// 					const pxToTwips = (px) => Math.max(0, Math.round(px * 15)); // 1px≈1/96in; 1in=1440 twips => 1440/96=15
// 					const colsTwips = colWidthsPx.map(pxToTwips);
// 					const totalTwips = pxToTwips(totalPx);
// 					results.push({ colsTwips, totalTwips });
// 				} catch (e) {
// 					results.push(null);
// 				}
// 			});
// 			return results;
// 		};

// 		const measuredTables = measureTablesFromDOM();
// 		let measuredTableIndex = 0;

//     // Measure image dimensions directly from the DOM so DOCX matches the editor UI
//     const measureImagesFromDOM = () => {
//       const results = [];
//       const rootEl = document.querySelector('.ContentEditable__root');
//       if (!rootEl) return results;
//       const imageEls = rootEl.querySelectorAll('img');
//       imageEls.forEach((img) => {
//         const rect = img.getBoundingClientRect();
//         results.push({ width: Math.max(0, Math.round(rect.width)), height: Math.max(0, Math.round(rect.height)) });
//       });
//       return results;
//     };

//     const measuredImages = measureImagesFromDOM();
//     let measuredImageIndex = 0;

// 		const parseStyleToObject = (styleString) => {
// 			const style = {};
// 			if (!styleString) return style;
// 			styleString.split(";").forEach((decl) => {
// 				const [prop, val] = decl.split(":");
// 				if (prop && val) {
// 					style[prop.trim()] = val.trim();
// 				}
// 			});
// 			return style;
// 		};

// 		const normalizeFontFamily = (family) => {
// 			if (!family) return undefined;
// 			const first = family.split(",")[0] || "";
// 			return first.replace(/["']/g, "").trim() || undefined;
// 		};

// 		const cssSizeToHalfPoints = (size) => {
// 			if (!size) return undefined;
// 			const s = String(size).trim().toLowerCase();
// 			if (s.endsWith("pt")) {
// 				const pt = parseFloat(s);
// 				return Number.isFinite(pt) ? Math.round(pt * 2) : undefined;
// 			}
// 			if (s.endsWith("px")) {
// 				const px = parseFloat(s);
// 				if (!Number.isFinite(px)) return undefined;
// 				const pt = px * 0.75; // 1pt = 1.333px => pt = px * 0.75
// 				return Math.round(pt * 2);
// 			}
// 			return undefined;
// 		};

// 		const colorToHexNoHash = (c) => {
// 			if (!c) return undefined;
// 			const m = c.trim();
// 			if (m.startsWith("#")) return m.slice(1).toUpperCase();
// 			return m.toUpperCase();
// 		};

// 		const cssLineHeightToDocxLine = (lineHeight, fallbackHalfPoints) => {
// 			if (!lineHeight) return undefined;
// 			const s = String(lineHeight).trim().toLowerCase();
// 			if (s.endsWith('%')) {
// 				const pct = parseFloat(s);
// 				if (Number.isFinite(pct)) return Math.round((pct / 100) * 240);
// 			}
// 			const num = parseFloat(s);
// 			if (Number.isFinite(num) && !s.endsWith('px') && !s.endsWith('pt')) {
// 				return Math.round(num * 240); // 1.0 -> 240
// 			}
// 			let linePt;
// 			if (s.endsWith('pt')) {
// 				linePt = parseFloat(s);
// 			} else if (s.endsWith('px')) {
// 				const px = parseFloat(s);
// 				linePt = Number.isFinite(px) ? px * 0.75 : undefined;
// 			}
// 			if (Number.isFinite(linePt)) {
// 				const fontPt = fallbackHalfPoints ? fallbackHalfPoints / 2 : 11; // default ~11pt
// 				const mult = linePt / fontPt;
// 				return Math.round(mult * 240);
// 			}
// 			return undefined;
// 		};

// 		editorState.read(() => {
// 			const root = $getRoot();

// 			const collectRunsFromNode = (node, linkMeta) => {
// 				const runs = [];
// 				const type = node.getType();
// 				if (type === "text") {
// 					const text = node.getTextContent();
// 					if (text && text.length > 0) {
// 						const styleObj = parseStyleToObject(node.getStyle && node.getStyle());
// 						const color = colorToHexNoHash(styleObj["color"]);
// 						const bgColor = colorToHexNoHash(styleObj["background-color"]);
// 						const fontFamily = normalizeFontFamily(styleObj["font-family"]) || editorDefaults.fontFamily;
// 						const fontSize = cssSizeToHalfPoints(styleObj["font-size"]) || editorDefaults.fontSizeHalfPoints;
// 						runs.push({
// 							kind: "text",
// 							text,
// 							bold: node.hasFormat("bold"),
// 							italics: node.hasFormat("italic"),
// 							underline: node.hasFormat("underline"),
// 							strike: node.hasFormat("strikethrough"),
// 							code: node.hasFormat("code"),
// 							color,
// 							bgColor,
// 							fontFamily,
// 							fontSize,
// 							isLink: linkMeta?.isLink || false,
// 							url: linkMeta?.url,
// 						});
// 					}
// 				} else if (type === "linebreak") {
// 					runs.push({ kind: "break" });
// 				} else if (type === "link") {
// 					const url = node.getURL && node.getURL();
// 					node.getChildren().forEach((child) => {
// 						runs.push(...collectRunsFromNode(child, { isLink: true, url }));
// 					});
// 				} else if (type === "image") {
//           runs.push({ kind: "image", src: node.getSrc && node.getSrc(), index: measuredImageIndex++ });
// 				} else {
// 					if (node.getChildren) {
// 						node.getChildren().forEach((child) => {
// 							runs.push(...collectRunsFromNode(child, linkMeta));
// 						});
// 					}
// 				}
// 				return runs;
// 			};

// 			root.getChildren().forEach((node) => {
// 				const nodeType = node.getType();

// 				const nodeStyle = parseStyleToObject(node.getStyle && node.getStyle());
// 				const paraLine = cssLineHeightToDocxLine(nodeStyle["line-height"], editorDefaults.fontSizeHalfPoints);
        
//         // Use consistent spacing for all elements to ensure alignment
//         const beforeSpacing = 60; // Reduced from 240 to 120 for consistent spacing
//         const afterSpacing = 100;  // Reduced from 240 to 120 for consistent spacing

// 				if (nodeType === "heading") {
// 					const tag = node.getTag && node.getTag();
// 					const runs = collectRunsFromNode(node);
//           blocks.push({ kind: "heading", tag, runs, align: node.getFormatType && node.getFormatType(), line: paraLine, before: beforeSpacing, after: afterSpacing });
// 				} else if (nodeType === "quote") {
// 					const runs = collectRunsFromNode(node);
//           blocks.push({ kind: "quote", runs, align: node.getFormatType && node.getFormatType(), line: paraLine, before: beforeSpacing, after: afterSpacing });
// 				} else if (nodeType === "list") {
// 					const listTag = node.getTag && node.getTag();
// 					const items = node.getChildren();
// 					items.forEach((listItem, idx) => {
// 						const runs = collectRunsFromNode(listItem);
// 						blocks.push({
// 							kind: "list-item",
// 							ordered: listTag === "ol",
// 							index: idx,
// 							runs,
// 							align: node.getFormatType && node.getFormatType(),
// 							line: paraLine,
//               before: beforeSpacing,
//               after: afterSpacing,
// 						});
// 					});
// 				} else if (nodeType === "table") {
// 					const tableRows = [];
// 					const rowNodes = node.getChildren();
// 					rowNodes.forEach((rowNode) => {
// 						const rowCells = [];
// 						const cellNodes = rowNode.getChildren();
// 						cellNodes.forEach((cellNode) => {
// 							const paraNodes = cellNode.getChildren();
// 							const paragraphs = [];
// 							if (Array.isArray(paraNodes) && paraNodes.length > 0) {
// 								paraNodes.forEach((p) => {
// 									const pStyle = parseStyleToObject(p.getStyle && p.getStyle());
// 									const pLine = cssLineHeightToDocxLine(pStyle["line-height"], editorDefaults.fontSizeHalfPoints);
// 									const runs = collectRunsFromNode(p);
// 									paragraphs.push({ runs, align: p.getFormatType && p.getFormatType(), line: pLine });
// 								});
// 							} else {
// 								const runs = collectRunsFromNode(cellNode);
// 								paragraphs.push({ runs, align: cellNode.getFormatType && cellNode.getFormatType(), line: paraLine });
// 							}
// 							rowCells.push({ paragraphs });
// 						});
// 						tableRows.push(rowCells);
// 					});
// 					const dims = measuredTables[measuredTableIndex++] || null;
//           blocks.push({ 
//             kind: "table", 
//             rows: tableRows, 
//             dims,
//             align: node.getFormatType && node.getFormatType(),
//             before: beforeSpacing,
//             after: afterSpacing
//           });
// 				} else if (nodeType === "paragraph") {
// 					const runs = collectRunsFromNode(node);
//           blocks.push({ kind: "paragraph", runs, align: node.getFormatType && node.getFormatType(), line: paraLine, before: beforeSpacing, after: afterSpacing });
// 				} else if (nodeType === "image") {
//           const runs = collectRunsFromNode(node);
//           blocks.push({ kind: "paragraph", runs, align: node.getFormatType && node.getFormatType(), line: paraLine, before: beforeSpacing, after: afterSpacing });
// 				} else {
// 					const runs = collectRunsFromNode(node);
// 					if (runs.length > 0) {
//             blocks.push({ kind: "paragraph", runs, align: node.getFormatType && node.getFormatType(), line: paraLine, before: beforeSpacing, after: afterSpacing });
// 					}
// 				}
// 			});
// 		});

// 		const dataUrlToUint8Array = async (dataUrl) => {
// 			const res = await fetch(dataUrl);
// 			const blob = await res.blob();
// 			const ab = await blob.arrayBuffer();
// 			return new Uint8Array(ab);
// 		};

// 		const loadImageElement = (src) => {
// 			return new Promise((resolve, reject) => {
// 				const img = new Image();
// 				img.onload = () => resolve(img);
// 				img.onerror = (e) => reject(e);
// 				img.src = src;
// 			});
// 		};

// 		const convertImageToPngBytes = async (img) => {
// 			try {
// 				const canvas = document.createElement("canvas");
// 				canvas.width = img.naturalWidth || img.width || 1;
// 				canvas.height = img.naturalHeight || img.height || 1;
// 				const ctx = canvas.getContext("2d");
// 				ctx.drawImage(img, 0, 0);
// 				const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
// 				if (!blob) return null;
// 				const ab = await blob.arrayBuffer();
// 				return new Uint8Array(ab);
// 			} catch (e) {
// 				console.warn("PNG conversion failed", e);
// 				return null;
// 			}
// 		};

// 		const sniffImageType = (bytes) => {
// 			if (!bytes || bytes.length < 12) return null;
// 			if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
// 				return "png";
// 			}
// 			if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpeg";
// 			if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 && (bytes[4] === 0x39 || bytes[4] === 0x37) && bytes[5] === 0x61) {
// 				return "gif";
// 			}
// 			return null;
// 		};

// 		const tryBitmapToPng = async (blob) => {
// 			try {
// 				if (typeof createImageBitmap === "function") {
// 					const bitmap = await createImageBitmap(blob);
// 					const canvas = document.createElement("canvas");
// 					canvas.width = bitmap.width || 1;
// 					canvas.height = bitmap.height || 1;
// 					const ctx = canvas.getContext("2d");
// 					ctx.drawImage(bitmap, 0, 0);
// 					const out = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
// 					if (!out) return null;
// 					const ab = await out.arrayBuffer();
// 					return new Uint8Array(ab);
// 				}
// 			} catch (e) {
// 				console.warn("Bitmap conversion failed", e);
// 			}
// 			return null;
// 		};

// 		const resolveImage = async (src) => {
// 			if (!src) return null;
// 			let data;
//       let naturalWidth;
//       let naturalHeight;
// 			let type;

// 			if (src.startsWith("data:")) {
// 				try {
// 					const img = await loadImageElement(src);
//           naturalWidth = img.naturalWidth || 400;
//           naturalHeight = img.naturalHeight || 300;
// 					const png = await convertImageToPngBytes(img);
// 					if (png) {
// 						data = png;
// 						type = "png";
// 					} else {
// 						data = await dataUrlToUint8Array(src);
// 						type = sniffImageType(data) || "png";
// 					}
// 				} catch (e) {
// 					console.warn("Failed to load data URL image for DOCX:", e);
// 					data = await dataUrlToUint8Array(src);
// 					type = sniffImageType(data) || "png";
//           naturalWidth = 400;
//           naturalHeight = 300;
// 				}
// 			} else {
// 				const res = await fetch(src, { mode: "cors" }).catch((e) => {
// 					console.warn("Image fetch failed due to CORS or network:", src, e);
// 					return null;
// 				});
// 				if (!res || !res.ok) return null;
// 				const blob = await res.blob();
// 				const objectUrl = URL.createObjectURL(blob);
// 				try {
// 					const img = await loadImageElement(objectUrl);
//           naturalWidth = img.naturalWidth || 400;
//           naturalHeight = img.naturalHeight || 300;
// 					const png = await convertImageToPngBytes(img);
// 					if (png) {
// 						data = png;
// 						type = "png";
// 					} else {
// 						const ab = await blob.arrayBuffer();
// 						data = new Uint8Array(ab);
// 						type = sniffImageType(data);
// 						if (!type) {
// 							const conv = await tryBitmapToPng(blob);
// 							if (conv) {
// 								data = conv;
// 								type = "png";
// 							}
// 						}
// 					}
// 				} catch (e) {
// 					console.warn("Failed to load remote image into canvas, falling back to raw bytes", e);
// 					const ab = await blob.arrayBuffer();
// 					data = new Uint8Array(ab);
// 					type = sniffImageType(data);
// 					if (!type) {
// 						const conv = await tryBitmapToPng(blob);
// 						if (conv) {
// 							data = conv;
// 							type = "png";
// 						}
// 					}
//           naturalWidth = 400;
//           naturalHeight = 300;
// 				} finally {
// 					URL.revokeObjectURL(objectUrl);
// 				}
// 			}

// 			if (!data) return null;
//       return { data, naturalWidth, naturalHeight, type: type || "png" };
// 		};

// 		const mapAlign = (align) => {
// 			switch (align) {
// 				case "center":
// 					return AlignmentType.CENTER;
// 				case "right":
// 					return AlignmentType.RIGHT;
// 				case "justify":
// 					return AlignmentType.JUSTIFIED;
// 				default:
// 					return AlignmentType.LEFT;
// 			}
// 		};

// 		const sectionChildren = [];

//     const buildParagraphFromRuns = async (runs, align, line, before, after) => {
// 			const paraChildren = [];

// 			const pushTextSegments = (run) => {
// 				const baseOpts = {
// 					bold: !!run.bold,
// 					italics: !!run.italics,
// 					underline: run.underline || run.isLink ? {} : undefined,
// 					strike: !!run.strike,
// 					color: run.isLink ? "0000FF" : run.color,
// 					font: run.code ? "Courier New" : run.fontFamily,
// 					size: run.fontSize,
// 					shading: run.bgColor ? { type: ShadingType.CLEAR, color: "auto", fill: run.bgColor } : undefined,
// 				};
// 				const text = run.text || "";
// 				const normalizeSpaces = (s) => s.replace(/ {2,}/g, (m) => " " + "\u00A0".repeat(m.length - 1));
// 				const lines = text.split("\n");
// 				lines.forEach((lineText, li) => {
// 					const parts = lineText.split("\t");
// 					parts.forEach((part, pi) => {
// 						const t = normalizeSpaces(part);
// 						const tr = new TextRun({ text: t, ...baseOpts });
// 						if (run.isLink && run.url) {
// 							paraChildren.push(new ExternalHyperlink({ link: run.url, children: [tr] }));
// 						} else {
// 							paraChildren.push(tr);
// 						}
// 						if (pi < parts.length - 1) {
// 							paraChildren.push(new TextRun({ text: "\t" }));
// 						}
// 					});
// 					if (li < lines.length - 1) {
// 						paraChildren.push(new TextRun({ break: 1 }));
// 					}
// 				});
// 			};

// 			if (Array.isArray(runs)) {
// 				for (const run of runs) {
// 					if (run.kind === "image") {
// 						const img = await resolveImage(run.src);
// 						if (img) {
//               const measured = measuredImages[run.index];
//               let widthPt = 300;
//               let heightPt = 225;
//               if (measured && measured.width > 0 && measured.height > 0) {
//                 widthPt = Math.round(measured.width * 0.75);
//                 heightPt = Math.round(measured.height * 0.75);
//               } else {
//                 widthPt = Math.round((img.naturalWidth || 400) * 0.75);
//                 heightPt = Math.round((img.naturalHeight || 300) * 0.75);
//               }
//               console.log(`Image ${run.index} debug: measured ${measured?.width || 'N/A'}px x ${measured?.height || 'N/A'}px, natural ${img.naturalWidth}px x ${img.naturalHeight}px, using ${widthPt}pt x ${heightPt}pt in DOCX`);
// 							paraChildren.push(
// 								new ImageRun({ 
// 									data: img.data, 
//                   transformation: { width: widthPt, height: heightPt }, 
// 									type: img.type 
// 								})
// 							);
// 						}
// 					} else if (run.kind === "break") {
// 						paraChildren.push(new TextRun({ break: 1 }));
//           } else if (run.kind === "text") {
// 						pushTextSegments(run);
// 					}
// 				}
// 			}

// 			return new Paragraph({ 
// 				alignment: mapAlign(align), 
//         spacing: { before, after, line: line || 240 }, 
// 				children: paraChildren 
// 			});
// 		};

// 		for (const block of blocks) {
// 			if (block.kind === "list-item") {
// 				const childrenRuns = [];
// 				if (block.ordered) {
// 					childrenRuns.push(new TextRun({ text: `${(block.index || 0) + 1}. ` }));
// 				} else {
// 					childrenRuns.push(new TextRun({ text: "• " }));
// 				}
// 				for (const run of block.runs) {
// 					if (run.kind === "image") {
// 						const img = await resolveImage(run.src);
// 						if (img) {
//               const measured = measuredImages[run.index];
//               let widthPt = 300;
//               let heightPt = 225;
//               if (measured && measured.width > 0 && measured.height > 0) {
//                 widthPt = Math.round(measured.width * 0.75);
//                 heightPt = Math.round(measured.height * 0.75);
//               } else {
//                 widthPt = Math.round((img.naturalWidth || 400) * 0.75);
//                 heightPt = Math.round((img.naturalHeight || 300) * 0.75);
//               }
//               console.log(`Image ${run.index} debug: measured ${measured?.width || 'N/A'}px x ${measured?.height || 'N/A'}px, natural ${img.naturalWidth}px x ${img.naturalHeight}px, using ${widthPt}pt x ${heightPt}pt in DOCX`);
// 							childrenRuns.push(
// 								new ImageRun({ 
// 									data: img.data, 
//                   transformation: { width: widthPt, height: heightPt }, 
// 									type: img.type 
// 								})
// 							);
// 						}
// 					} else if (run.kind === "break") {
// 						childrenRuns.push(new TextRun({ break: 1 }));
//           } else if (run.kind === "text") {
// 						const baseOpts = {
// 							bold: !!run.bold,
// 							italics: !!run.italics,
// 							underline: run.underline ? {} : undefined,
// 							strike: !!run.strike,
// 							color: run.isLink ? "0000FF" : run.color,
// 							font: run.code ? "Courier New" : run.fontFamily,
// 							size: run.fontSize,
// 							shading: run.bgColor ? { type: ShadingType.CLEAR, color: "auto", fill: run.bgColor } : undefined,
// 						};
// 						const normalizeSpaces = (s) => s.replace(/ {2,}/g, (m) => " " + "\u00A0".repeat(m.length - 1));
// 						const lines = (run.text || "").split("\n");
// 						lines.forEach((lineText, li) => {
// 							const parts = lineText.split("\t");
// 							parts.forEach((part, pi) => {
// 								const t = normalizeSpaces(part);
// 								const tr = new TextRun({ text: t, ...baseOpts });
// 								if (run.isLink && run.url) {
// 									childrenRuns.push(new ExternalHyperlink({ link: run.url, children: [tr] }));
// 								} else {
// 									childrenRuns.push(tr);
// 								}
// 								if (pi < parts.length - 1) {
// 									childrenRuns.push(new TextRun({ text: "\t" }));
// 								}
// 							});
// 							if (li < lines.length - 1) {
// 								childrenRuns.push(new TextRun({ break: 1 }));
// 							}
// 						});
// 					}
// 				}
// 				sectionChildren.push(
// 					new Paragraph({ 
// 						alignment: mapAlign(block.align), 
//             spacing: { before: block.before || 120, after: block.after || 120, line: block.line || 240 }, 
// 						children: childrenRuns 
// 					})
// 				);
// 				continue;
// 			}

// 			if (block.kind === "table") {
// 				const rows = [];
// 				const pageContentWidthTwips = 9360; // ~6.5 inches

// 				let columnWidths = [];
// 				let tableWidthTwips = pageContentWidthTwips;
// 				if (block.dims && Array.isArray(block.dims.colsTwips)) {
// 					const sum = block.dims.colsTwips.reduce((a, b) => a + b, 0) || 0;
// 					if (sum > 0) {
// 						const scale = sum > pageContentWidthTwips ? pageContentWidthTwips / sum : 1;
// 						columnWidths = block.dims.colsTwips.map((w) => Math.max(0, Math.floor(w * scale)));
// 						tableWidthTwips = Math.min(pageContentWidthTwips, Math.max(0, Math.floor(sum * scale)));
// 					}
// 				}

// 				if (!columnWidths.length) {
// 					const colsCount = (block.rows && block.rows[0] ? block.rows[0].length : 0) || 0;
// 					if (colsCount === 3) {
// 						columnWidths = [2200, 2200, pageContentWidthTwips - 2200 - 2200];
// 					} else if (colsCount > 0) {
// 						const each = Math.floor(pageContentWidthTwips / colsCount);
// 						columnWidths = new Array(colsCount).fill(each);
// 					}
// 				}

// 				for (const rowCells of block.rows) {
// 					const cells = [];
// 					for (let ci = 0; ci < rowCells.length; ci++) {
// 						const cell = rowCells[ci];
// 						const cellParagraphs = [];
// 						for (const p of cell.paragraphs) {
// 							cellParagraphs.push(
//                 await buildParagraphFromRuns(p.runs, p.align, p.line, 0, 120)
// 							);
// 						}
// 						cells.push(
// 							new TableCell({
// 								children: cellParagraphs,
// 								width: columnWidths.length ? { size: columnWidths[ci] || columnWidths[0], type: WidthType.DXA } : undefined,
//                 margins: { top: 100, bottom: 100, left: 120, right: 120 },
// 							})
// 						);
// 					}
// 					rows.push(new TableRow({ children: cells }));
// 				}
        
//         // Add spacing before the table to match headings
//         if (block.before && block.before > 0) {
//           sectionChildren.push(new Paragraph({
//             children: [],
//             spacing: { before: 0, after: block.before }
//           }));
//         }
        
// 				sectionChildren.push(
// 					new Table({
// 						width: { size: tableWidthTwips, type: WidthType.DXA },
// 						columnWidths: columnWidths.length ? columnWidths : undefined,
//             alignment: mapAlign(block.align || "left"),
// 						layout: TableLayoutType.FIXED,
// 						rows,
// 						borders: {
// 							top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
// 							bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
// 							left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
// 							right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
// 							insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
// 							insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
// 						},
// 					})
// 				);
        
//         // Add spacing after the table
//         if (block.after && block.after > 0) {
//           sectionChildren.push(new Paragraph({
//             children: [],
//             spacing: { before: block.after, after: 0 }
//           }));
//         }
        
// 				continue;
// 			}

//       if (block.kind === "heading" || block.kind === "quote" || block.kind === "paragraph") {
// 			const paraChildren = [];
// 			if (Array.isArray(block.runs)) {
// 				for (const run of block.runs) {
// 					if (run.kind === "image") {
// 						const img = await resolveImage(run.src);
// 						if (img) {
// 				const measured = measuredImages[run.index];
// 				let widthPt, heightPt;
			  
// 				if (measured && measured.width > 0 && measured.height > 0) {
// 				  widthPt = Math.round(measured.width * 0.75);
// 				  heightPt = Math.round(measured.height * 0.75);
// 				} else {
// 				  widthPt = Math.round((img.naturalWidth || 400) * 0.75);
// 				  heightPt = Math.round((img.naturalHeight || 300) * 0.75);
// 				}
			  
// 				// 🔍 apply a little boost (e.g. +10%)
// 				const BOOST = 1.1;
// 				widthPt = Math.round(widthPt * BOOST);
// 				heightPt = Math.round(heightPt * BOOST);
			  
// 				// 🛑 enforce max page width
// 				const MAX_WIDTH_PT = 700; // ~6.6in with margins
// 				if (widthPt > MAX_WIDTH_PT) {
// 				  const scale = MAX_WIDTH_PT / widthPt;
// 				  widthPt = MAX_WIDTH_PT;
// 				  heightPt = Math.round(heightPt * scale);
// 				  console.log(
// 					`Image ${run.index}: scaled to fit page (with boost) → ${widthPt}pt x ${heightPt}pt`
// 				  );
// 				}
			  
// 				console.log(
// 				  `Image ${run.index} debug: measured ${measured?.width || "N/A"}px x ${
// 					measured?.height || "N/A"
// 				  }px, natural ${img.naturalWidth}px x ${img.naturalHeight}px, using ${widthPt}pt x ${heightPt}pt in DOCX`
// 				);
			  
// 							paraChildren.push(
// 								new ImageRun({ 
// 									data: img.data, 
// 					transformation: { width: widthPt, height: heightPt },
// 					type: img.type,
// 								})
// 							);
// 						}
			  
// 					} else if (run.kind === "break") {
// 						paraChildren.push(new TextRun({ break: 1 }));
//             } else if (run.kind === "text") {
// 						const baseOpts = {
// 							bold: !!run.bold,
// 							italics: !!run.italics,
// 							underline: run.underline || run.isLink ? {} : undefined,
// 							strike: !!run.strike,
// 							color: run.isLink ? "0000FF" : run.color,
// 							font: run.code ? "Courier New" : run.fontFamily,
// 							size: run.fontSize,
// 							shading: run.bgColor ? { type: ShadingType.CLEAR, color: "auto", fill: run.bgColor } : undefined,
// 						};
// 						const normalizeSpaces = (s) => s.replace(/ {2,}/g, (m) => " " + "\u00A0".repeat(m.length - 1));
// 						const lines = (run.text || "").split("\n");
// 						lines.forEach((lineText, li) => {
// 							const parts = lineText.split("\t");
// 							parts.forEach((part, pi) => {
// 								const t = normalizeSpaces(part);
// 								const tr = new TextRun({ text: t, ...baseOpts });
// 								if (run.isLink && run.url) {
// 									paraChildren.push(new ExternalHyperlink({ link: run.url, children: [tr] }));
// 								} else {
// 									paraChildren.push(tr);
// 								}
// 								if (pi < parts.length - 1) {
// 									paraChildren.push(new TextRun({ text: "\t" }));
// 								}
// 							});
// 							if (li < lines.length - 1) {
// 								paraChildren.push(new TextRun({ break: 1 }));
// 							}
// 						});
// 					}
// 				}
// 			}

//         let paragraph;
// 			if (block.kind === "heading") {
// 				const headingLevel = block.tag === "h1" ? HeadingLevel.HEADING_1 : block.tag === "h2" ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
//           paragraph = new Paragraph({ 
// 						heading: headingLevel, 
// 						alignment: mapAlign(block.align), 
//             spacing: { before: block.before, after: block.after, line: block.line || 240 }, 
// 						children: paraChildren 
//           });
// 			} else if (block.kind === "quote") {
//           paragraph = new Paragraph({ 
// 						alignment: mapAlign(block.align), 
//             spacing: { before: block.before, after: block.after, line: block.line || 240 }, 
// 						children: [new TextRun({ text: "“" }), ...paraChildren, new TextRun({ text: "”" })] 
//           });
// 			} else {
//           paragraph = new Paragraph({ 
// 						alignment: mapAlign(block.align), 
//             spacing: { before: block.before, after: block.after, line: block.line || 240 }, 
// 						children: paraChildren 
//           });
//         }
//         sectionChildren.push(paragraph);
// 			}
// 		}

// 		const doc = new Document({
// 			sections: [
// 				{
// 					properties: {
// 						page: {
// 							margin: {
// 								top: Math.round((margins.top / 96) * 1440),
// 								right: Math.round((margins.right / 96) * 1440),
// 								bottom: Math.round((margins.bottom / 96) * 1440),
// 								left: Math.round((margins.left / 96) * 1440),
// 							}
// 						}
// 					},
// 					children: sectionChildren,
// 				},
// 			],
// 		});

// 		const blob = await Packer.toBlob(doc);
// 		saveAs(blob, "document.docx");
//   };

//   return (
//     // <LexicalComposer initialConfig={lexicalEditorConfig}>
      
//     //   <LexicalEditorTopBar onDownloadDocx={handleDownloadDocx} />
//     //   <Divider />
//     //   <Box sx={{ position: "relative", background: "white" }}>
//     //     <RichTextPlugin
//     //       contentEditable={<MuiContentEditable />}
//     //       placeholder={<Box sx={placeHolderSx}>Enter some text...</Box>}
//     //       ErrorBoundary={LexicalErrorBoundary}
//     //     />
//     //     <HistoryPlugin />

//     //     <ListPlugin />
//     //     <LinkPlugin />
//     //     <ImagesPlugin captionsEnabled={false} />
//     //     <FloatingTextFormatToolbarPlugin />
//     //     <TablePlugin />
//     //     <TableResizePlugin />
//     //     <TableActionMenuPlugin />
//     //     <MyCustomAutoFocusPlugin/>
//     //   </Box>
//     // </LexicalComposer>
// // 	<LexicalComposer initialConfig={lexicalEditorConfig}>
// //   {/* Top bar fixed at top */}
// //   <Box sx={{ position: "sticky", top: 0, zIndex: 10, background: "white", borderBottom: "1px solid #ddd" }}>
// //     <LexicalEditorTopBar onDownloadDocx={handleDownloadDocx} />
// //   </Box>

// //   {/* Editor content scrollable */}
// //   <Box
// //     sx={{
// //       position: "relative",
// //       background: "white",
// //       minHeight: "80vh",
// //       maxHeight: "calc(100vh - 120px)", // adjust based on toolbar height
// //       overflowY: "auto",
// //       p: 2,
// //     }}
// //   >
// //     <RichTextPlugin
// //       contentEditable={<MuiContentEditable />}
// //       placeholder={<Box sx={placeHolderSx}></Box>}
// //       ErrorBoundary={LexicalErrorBoundary}
// //     />
// //     <HistoryPlugin />
// //     <ListPlugin />
// //     <LinkPlugin />
// //     <ImagesPlugin captionsEnabled={false} />
// //     <FloatingTextFormatToolbarPlugin />
// //     <TablePlugin />
// //     <TableResizePlugin />
// //     <TableActionMenuPlugin />
// //     <MyCustomAutoFocusPlugin />
// //   </Box>
// // </LexicalComposer>
//     <LexicalComposer initialConfig={lexicalEditorConfig}>
//   {/* 🔹 Full width top bar */}
//       <Box
//         sx={{
//           position: "sticky",
//           top: 0,
//           zIndex: 20,
//       width: "100%",         // full screen
//           background: "white",
//           boxShadow: 2,
//         }}
//       >
//     <LexicalEditorTopBar onDownloadDocx={handleDownloadDocx}  margins={margins}
//           setMargins={setMargins}
//           marginPreset={marginPreset}
//           setMarginPreset={setMarginPreset}
//           customOpen={customOpen}
//           setCustomOpen={setCustomOpen}
//           tempMargins={tempMargins}
//           setTempMargins={setTempMargins}/>
//       </Box>
 
//   {/* 🔹 Editor background */}
//   <Box
//         sx={{
//           flex: 1,
//       background: "#f3f3f3", // gray like Word
//           minHeight: "100vh",
//           display: "flex",
//       justifyContent: "center",
//       alignItems: "flex-start",
//           py: 4,
//         }}
//       >
//     {/* 🔹 Margin controls + Page-like editor */}
//     <Box sx={{ width: `${pageSize.width}px` }}>
//       <Box sx={{ background: "white", p: 2, boxShadow: 1, borderRadius: 1, mb: 2 }}>
//         <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
//           <Box sx={{ fontWeight: 600, mr: 1 }}>Margins:</Box>
//           <TextField
//             size="small"
//             select
//             SelectProps={{ native: true }}
//             label="Preset"
//             value={marginPreset}
//             onChange={(e)=>{
//               const val = e.target.value;
//               setMarginPreset(val);
//               const presets = {
//                 normal: { top: 96, right: 96, bottom: 96, left: 96 },
//                 narrow: { top: 36, right: 36, bottom: 36, left: 36 },
//                 moderate: { top: 96, right: 72, bottom: 96, left: 72 },
//                 wide: { top: 96, right: 144, bottom: 96, left: 144 },
//                 none: { top: 0, right: 0, bottom: 0, left: 0 },
//               };
//               if (val === 'custom') {
//                 setTempMargins(margins);
//                 setCustomOpen(true);
//                 return;
//               }
//               if (val in presets) {
//                 setMargins(presets[val]);
//               }
//             }}
//             sx={{ width: 160 }}
//             SelectDisplayProps={{ style: { paddingRight: 24 } }}
//           >
//             <option value={'normal'}>Normal (1")</option>
//             <option value={'narrow'}>Narrow (0.38")</option>
//             <option value={'moderate'}>Moderate (0.75" sides)</option>
//             <option value={'wide'}>Wide (1.5" sides)</option>
//             <option value={'none'}>None (0)</option>
//             <option value={'custom'}>Custom…</option>
//           </TextField>
//           <TextField size="small" label="Top (px)" type="number" value={margins.top} onChange={(e)=>setMargins((prev)=>({...prev, top: Math.max(0, parseInt(e.target.value||0,10))}))} sx={{ width: 120 }} />
//           <TextField size="small" label="Right (px)" type="number" value={margins.right} onChange={(e)=>setMargins((prev)=>({...prev, right: Math.max(0, parseInt(e.target.value||0,10))}))} sx={{ width: 120 }} />
//           <TextField size="small" label="Bottom (px)" type="number" value={margins.bottom} onChange={(e)=>setMargins((prev)=>({...prev, bottom: Math.max(0, parseInt(e.target.value||0,10))}))} sx={{ width: 120 }} />
//           <TextField size="small" label="Left (px)" type="number" value={margins.left} onChange={(e)=>setMargins((prev)=>({...prev, left: Math.max(0, parseInt(e.target.value||0,10))}))} sx={{ width: 120 }} />
//         </Stack>
//       </Box>

//       <Box
//               sx={{
//                 background: "white",
//           width: `${pageSize.width}px`,
//           minHeight: `${pageSize.height}px`,
//           pt: `${margins.top}px`,
//           pr: `${margins.right}px`,
//           pb: `${margins.bottom}px`,
//           pl: `${margins.left}px`,
//                 boxShadow: 3,
//         }}
//         data-lexical-page
//           >
//             <RichTextPlugin
//         contentEditable={<MuiContentEditable />}
//               placeholder={<Box sx={placeHolderSx}>Enter some text...</Box>}
//               ErrorBoundary={LexicalErrorBoundary}
//             />
//             <HistoryPlugin />
//             <ListPlugin />
//             <LinkPlugin />
//             <ImagesPlugin captionsEnabled={false} />
//             <FloatingTextFormatToolbarPlugin />
//             <TablePlugin />
//             <TableResizePlugin />
//       <AutoPageBreakPlugin
//         pageHeightPx={pageSize.height}
//         topMarginPx={margins.top}
//         bottomMarginPx={margins.bottom}
//       />
      
//             <MyCustomAutoFocusPlugin />
//           </Box>
//         </Box>
//     {/* Custom Margins Dialog */}
//     <Dialog open={customOpen} onClose={()=>setCustomOpen(false)}>
//       <DialogTitle>Custom Margins</DialogTitle>
//       <DialogContent>
//         <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
//           <TextField size="small" label="Top (px)" type="number" value={tempMargins.top} onChange={(e)=>setTempMargins((p)=>({...p, top: Math.max(0, parseInt(e.target.value||0,10))}))} sx={{ width: 140 }} />
//           <TextField size="small" label="Right (px)" type="number" value={tempMargins.right} onChange={(e)=>setTempMargins((p)=>({...p, right: Math.max(0, parseInt(e.target.value||0,10))}))} sx={{ width: 140 }} />
//         </Stack>
//         <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
//           <TextField size="small" label="Bottom (px)" type="number" value={tempMargins.bottom} onChange={(e)=>setTempMargins((p)=>({...p, bottom: Math.max(0, parseInt(e.target.value||0,10))}))} sx={{ width: 140 }} />
//           <TextField size="small" label="Left (px)" type="number" value={tempMargins.left} onChange={(e)=>setTempMargins((p)=>({...p, left: Math.max(0, parseInt(e.target.value||0,10))}))} sx={{ width: 140 }} />
//         </Stack>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={()=>setCustomOpen(false)}>Cancel</Button>
//         <Button variant="contained" onClick={()=>{ setMargins(tempMargins); setMarginPreset('custom'); setCustomOpen(false); }}>Apply</Button>
//       </DialogActions>
//     </Dialog>
//       </Box>
// </LexicalComposer>


//   );
// }

// function MyCustomAutoFocusPlugin() {
//   const [editor] = useLexicalComposerContext();
 
//   useEffect(() => {
//     editor.focus();
//   }, [editor]);
 
//   return null;
// }
 
// export default LexicalEditorWrapper;
function LexicalEditorWrapper(props) {
  const [margins, setMargins] = useState({ top: 96, right: 96, bottom: 96, left: 96 });
  const [pageSize, setPageSize] = useState({ width: 794, height: 1123 });
  const [marginPreset, setMarginPreset] = useState("normal");
  const [customOpen, setCustomOpen] = useState(false);
  const [tempMargins, setTempMargins] = useState(margins);

	// Function to handle DOCX download
	const handleDownloadDocx = async (editor) => {
		const editorState = editor.getEditorState();
		const blocks = [];

		// Capture editor-level default font family and size from DOM
		const readEditorDefaults = () => {
			const rootEl = document.querySelector('.ContentEditable__root');
			const cs = rootEl ? window.getComputedStyle(rootEl) : null;
			const fontFamily = cs?.fontFamily ? cs.fontFamily.split(',')[0].replace(/["']/g, '').trim() : undefined;
			const fontSizePx = cs?.fontSize ? parseFloat(cs.fontSize) : undefined;
			const fontSizeHalfPoints = Number.isFinite(fontSizePx) ? Math.round((fontSizePx * 0.75) * 2) : undefined; // px->pt->halfPoints
			return { fontFamily, fontSizeHalfPoints };
		};
		const editorDefaults = readEditorDefaults();

		// Measure table column widths directly from the DOM so DOCX matches the editor UI
		const measureTablesFromDOM = () => {
			const results = [];
			const rootEl = document.querySelector('.ContentEditable__root');
			if (!rootEl) return results;
			const tableEls = rootEl.querySelectorAll('table');
			tableEls.forEach((table) => {
				try {
					const firstRow = table.rows && table.rows[0];
					if (!firstRow) {
						results.push(null);
						return;
					}
					const colWidthsPx = [];
					for (let ci = 0; ci < firstRow.cells.length; ci++) {
						const rect = firstRow.cells[ci].getBoundingClientRect();
						colWidthsPx.push(Math.max(0, Math.round(rect.width)));
					}
					const totalPx = colWidthsPx.reduce((a, b) => a + b, 0);
					const pxToTwips = (px) => Math.max(0, Math.round(px * 15)); // 1px≈1/96in; 1in=1440 twips => 1440/96=15
					const colsTwips = colWidthsPx.map(pxToTwips);
					const totalTwips = pxToTwips(totalPx);
					results.push({ colsTwips, totalTwips });
				} catch (e) {
					results.push(null);
				}
			});
			return results;
		};

		const measuredTables = measureTablesFromDOM();
		let measuredTableIndex = 0;

    // Measure image dimensions directly from the DOM so DOCX matches the editor UI
    const measureImagesFromDOM = () => {
      const results = [];
      const rootEl = document.querySelector('.ContentEditable__root');
      if (!rootEl) return results;
      const imageEls = rootEl.querySelectorAll('img');
      imageEls.forEach((img) => {
        const rect = img.getBoundingClientRect();
        results.push({ width: Math.max(0, Math.round(rect.width)), height: Math.max(0, Math.round(rect.height)) });
      });
      return results;
    };

    const measuredImages = measureImagesFromDOM();
    let measuredImageIndex = 0;

		const parseStyleToObject = (styleString) => {
			const style = {};
			if (!styleString) return style;
			styleString.split(";").forEach((decl) => {
				const [prop, val] = decl.split(":");
				if (prop && val) {
					style[prop.trim()] = val.trim();
				}
			});
			return style;
		};

		const normalizeFontFamily = (family) => {
			if (!family) return undefined;
			const first = family.split(",")[0] || "";
			return first.replace(/["']/g, "").trim() || undefined;
		};

		const cssSizeToHalfPoints = (size) => {
			if (!size) return undefined;
			const s = String(size).trim().toLowerCase();
			if (s.endsWith("pt")) {
				const pt = parseFloat(s);
				return Number.isFinite(pt) ? Math.round(pt * 2) : undefined;
			}
			if (s.endsWith("px")) {
				const px = parseFloat(s);
				if (!Number.isFinite(px)) return undefined;
				const pt = px * 0.75; // 1pt = 1.333px => pt = px * 0.75
				return Math.round(pt * 2);
			}
			return undefined;
		};

		const colorToHexNoHash = (c) => {
			if (!c) return undefined;
			const m = c.trim();
			if (m.startsWith("#")) return m.slice(1).toUpperCase();
			return m.toUpperCase();
		};

		const cssLineHeightToDocxLine = (lineHeight, fallbackHalfPoints) => {
			if (!lineHeight) return undefined;
			const s = String(lineHeight).trim().toLowerCase();
			if (s.endsWith('%')) {
				const pct = parseFloat(s);
				if (Number.isFinite(pct)) return Math.round((pct / 100) * 240);
			}
			const num = parseFloat(s);
			if (Number.isFinite(num) && !s.endsWith('px') && !s.endsWith('pt')) {
				return Math.round(num * 240); // 1.0 -> 240
			}
			let linePt;
			if (s.endsWith('pt')) {
				linePt = parseFloat(s);
			} else if (s.endsWith('px')) {
				const px = parseFloat(s);
				linePt = Number.isFinite(px) ? px * 0.75 : undefined;
			}
			if (Number.isFinite(linePt)) {
				const fontPt = fallbackHalfPoints ? fallbackHalfPoints / 2 : 11; // default ~11pt
				const mult = linePt / fontPt;
				return Math.round(mult * 240);
			}
			return undefined;
		};

		editorState.read(() => {
			const root = $getRoot();

			const collectRunsFromNode = (node, linkMeta) => {
				const runs = [];
				const type = node.getType();
				if (type === "text") {
					const text = node.getTextContent();
					if (text && text.length > 0) {
						const styleObj = parseStyleToObject(node.getStyle && node.getStyle());
						const color = colorToHexNoHash(styleObj["color"]);
						const bgColor = colorToHexNoHash(styleObj["background-color"]);
						const fontFamily = normalizeFontFamily(styleObj["font-family"]) || editorDefaults.fontFamily;
						const fontSize = cssSizeToHalfPoints(styleObj["font-size"]) || editorDefaults.fontSizeHalfPoints;
						runs.push({
							kind: "text",
							text,
							bold: node.hasFormat("bold"),
							italics: node.hasFormat("italic"),
							underline: node.hasFormat("underline"),
							strike: node.hasFormat("strikethrough"),
							code: node.hasFormat("code"),
							color,
							bgColor,
							fontFamily,
							fontSize,
							isLink: linkMeta?.isLink || false,
							url: linkMeta?.url,
						});
					}
				} else if (type === "linebreak") {
					runs.push({ kind: "break" });
				} else if (type === "link") {
					const url = node.getURL && node.getURL();
					node.getChildren().forEach((child) => {
						runs.push(...collectRunsFromNode(child, { isLink: true, url }));
					});
				} else if (type === "image") {
          runs.push({ kind: "image", src: node.getSrc && node.getSrc(), index: measuredImageIndex++ });
				} else {
					if (node.getChildren) {
						node.getChildren().forEach((child) => {
							runs.push(...collectRunsFromNode(child, linkMeta));
						});
					}
				}
				return runs;
			};

			root.getChildren().forEach((node) => {
				const nodeType = node.getType();

				const nodeStyle = parseStyleToObject(node.getStyle && node.getStyle());
				const paraLine = cssLineHeightToDocxLine(nodeStyle["line-height"], editorDefaults.fontSizeHalfPoints);
        
        // Use consistent spacing for all elements to ensure alignment
        const beforeSpacing = 60; // Reduced from 240 to 120 for consistent spacing
        const afterSpacing = 100;  // Reduced from 240 to 120 for consistent spacing

				if (nodeType === "heading") {
					const tag = node.getTag && node.getTag();
					const runs = collectRunsFromNode(node);
          blocks.push({ kind: "heading", tag, runs, align: node.getFormatType && node.getFormatType(), line: paraLine, before: beforeSpacing, after: afterSpacing });
				} else if (nodeType === "quote") {
					const runs = collectRunsFromNode(node);
          blocks.push({ kind: "quote", runs, align: node.getFormatType && node.getFormatType(), line: paraLine, before: beforeSpacing, after: afterSpacing });
				} else if (nodeType === "list") {
					const listTag = node.getTag && node.getTag();
					const items = node.getChildren();
					items.forEach((listItem, idx) => {
						const runs = collectRunsFromNode(listItem);
						blocks.push({
							kind: "list-item",
							ordered: listTag === "ol",
							index: idx,
							runs,
							align: node.getFormatType && node.getFormatType(),
							line: paraLine,
              before: beforeSpacing,
              after: afterSpacing,
						});
					});
				} else if (nodeType === "table") {
					const tableRows = [];
					const rowNodes = node.getChildren();
					rowNodes.forEach((rowNode) => {
						const rowCells = [];
						const cellNodes = rowNode.getChildren();
						cellNodes.forEach((cellNode) => {
							const paraNodes = cellNode.getChildren();
							const paragraphs = [];
							if (Array.isArray(paraNodes) && paraNodes.length > 0) {
								paraNodes.forEach((p) => {
									const pStyle = parseStyleToObject(p.getStyle && p.getStyle());
									const pLine = cssLineHeightToDocxLine(pStyle["line-height"], editorDefaults.fontSizeHalfPoints);
									const runs = collectRunsFromNode(p);
									paragraphs.push({ runs, align: p.getFormatType && p.getFormatType(), line: pLine });
								});
							} else {
								const runs = collectRunsFromNode(cellNode);
								paragraphs.push({ runs, align: cellNode.getFormatType && cellNode.getFormatType(), line: paraLine });
							}
							rowCells.push({ paragraphs });
						});
						tableRows.push(rowCells);
					});
					const dims = measuredTables[measuredTableIndex++] || null;
          blocks.push({ 
            kind: "table", 
            rows: tableRows, 
            dims,
            align: node.getFormatType && node.getFormatType(),
            before: beforeSpacing,
            after: afterSpacing
          });
				} else if (nodeType === "paragraph") {
					const runs = collectRunsFromNode(node);
          blocks.push({ kind: "paragraph", runs, align: node.getFormatType && node.getFormatType(), line: paraLine, before: beforeSpacing, after: afterSpacing });
				} else if (nodeType === "image") {
          const runs = collectRunsFromNode(node);
          blocks.push({ kind: "paragraph", runs, align: node.getFormatType && node.getFormatType(), line: paraLine, before: beforeSpacing, after: afterSpacing });
				} else {
					const runs = collectRunsFromNode(node);
					if (runs.length > 0) {
            blocks.push({ kind: "paragraph", runs, align: node.getFormatType && node.getFormatType(), line: paraLine, before: beforeSpacing, after: afterSpacing });
					}
				}
			});
		});

		const dataUrlToUint8Array = async (dataUrl) => {
			const res = await fetch(dataUrl);
			const blob = await res.blob();
			const ab = await blob.arrayBuffer();
			return new Uint8Array(ab);
		};

		const loadImageElement = (src) => {
			return new Promise((resolve, reject) => {
				const img = new Image();
				img.onload = () => resolve(img);
				img.onerror = (e) => reject(e);
				img.src = src;
			});
		};

		const convertImageToPngBytes = async (img) => {
			try {
				const canvas = document.createElement("canvas");
				canvas.width = img.naturalWidth || img.width || 1;
				canvas.height = img.naturalHeight || img.height || 1;
				const ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0);
				const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
				if (!blob) return null;
				const ab = await blob.arrayBuffer();
				return new Uint8Array(ab);
			} catch (e) {
				console.warn("PNG conversion failed", e);
				return null;
			}
		};

		const sniffImageType = (bytes) => {
			if (!bytes || bytes.length < 12) return null;
			if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
				return "png";
			}
			if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpeg";
			if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 && (bytes[4] === 0x39 || bytes[4] === 0x37) && bytes[5] === 0x61) {
				return "gif";
			}
			return null;
		};

		const tryBitmapToPng = async (blob) => {
			try {
				if (typeof createImageBitmap === "function") {
					const bitmap = await createImageBitmap(blob);
					const canvas = document.createElement("canvas");
					canvas.width = bitmap.width || 1;
					canvas.height = bitmap.height || 1;
					const ctx = canvas.getContext("2d");
					ctx.drawImage(bitmap, 0, 0);
					const out = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
					if (!out) return null;
					const ab = await out.arrayBuffer();
					return new Uint8Array(ab);
				}
			} catch (e) {
				console.warn("Bitmap conversion failed", e);
			}
			return null;
		};

		const resolveImage = async (src) => {
			if (!src) return null;
			let data;
      let naturalWidth;
      let naturalHeight;
			let type;

			if (src.startsWith("data:")) {
				try {
					const img = await loadImageElement(src);
          naturalWidth = img.naturalWidth || 400;
          naturalHeight = img.naturalHeight || 300;
					const png = await convertImageToPngBytes(img);
					if (png) {
						data = png;
						type = "png";
					} else {
						data = await dataUrlToUint8Array(src);
						type = sniffImageType(data) || "png";
					}
				} catch (e) {
					console.warn("Failed to load data URL image for DOCX:", e);
					data = await dataUrlToUint8Array(src);
					type = sniffImageType(data) || "png";
          naturalWidth = 400;
          naturalHeight = 300;
				}
			} else {
				const res = await fetch(src, { mode: "cors" }).catch((e) => {
					console.warn("Image fetch failed due to CORS or network:", src, e);
					return null;
				});
				if (!res || !res.ok) return null;
				const blob = await res.blob();
				const objectUrl = URL.createObjectURL(blob);
				try {
					const img = await loadImageElement(objectUrl);
          naturalWidth = img.naturalWidth || 400;
          naturalHeight = img.naturalHeight || 300;
					const png = await convertImageToPngBytes(img);
					if (png) {
						data = png;
						type = "png";
					} else {
						const ab = await blob.arrayBuffer();
						data = new Uint8Array(ab);
						type = sniffImageType(data);
						if (!type) {
							const conv = await tryBitmapToPng(blob);
							if (conv) {
								data = conv;
								type = "png";
							}
						}
					}
				} catch (e) {
					console.warn("Failed to load remote image into canvas, falling back to raw bytes", e);
					const ab = await blob.arrayBuffer();
					data = new Uint8Array(ab);
					type = sniffImageType(data);
					if (!type) {
						const conv = await tryBitmapToPng(blob);
						if (conv) {
							data = conv;
							type = "png";
						}
					}
          naturalWidth = 400;
          naturalHeight = 300;
				} finally {
					URL.revokeObjectURL(objectUrl);
				}
			}

			if (!data) return null;
      return { data, naturalWidth, naturalHeight, type: type || "png" };
		};

		const mapAlign = (align) => {
			switch (align) {
				case "center":
					return AlignmentType.CENTER;
				case "right":
					return AlignmentType.RIGHT;
				case "justify":
					return AlignmentType.JUSTIFIED;
				default:
					return AlignmentType.LEFT;
			}
		};

		const sectionChildren = [];

    const buildParagraphFromRuns = async (runs, align, line, before, after) => {
			const paraChildren = [];

			const pushTextSegments = (run) => {
				const baseOpts = {
					bold: !!run.bold,
					italics: !!run.italics,
					underline: run.underline || run.isLink ? {} : undefined,
					strike: !!run.strike,
					color: run.isLink ? "0000FF" : run.color,
					font: run.code ? "Courier New" : run.fontFamily,
					size: run.fontSize,
					shading: run.bgColor ? { type: ShadingType.CLEAR, color: "auto", fill: run.bgColor } : undefined,
				};
				const text = run.text || "";
				const normalizeSpaces = (s) => s.replace(/ {2,}/g, (m) => " " + "\u00A0".repeat(m.length - 1));
				const lines = text.split("\n");
				lines.forEach((lineText, li) => {
					const parts = lineText.split("\t");
					parts.forEach((part, pi) => {
						const t = normalizeSpaces(part);
						const tr = new TextRun({ text: t, ...baseOpts });
						if (run.isLink && run.url) {
							paraChildren.push(new ExternalHyperlink({ link: run.url, children: [tr] }));
						} else {
							paraChildren.push(tr);
						}
						if (pi < parts.length - 1) {
							paraChildren.push(new TextRun({ text: "\t" }));
						}
					});
					if (li < lines.length - 1) {
						paraChildren.push(new TextRun({ break: 1 }));
					}
				});
			};

			if (Array.isArray(runs)) {
				for (const run of runs) {
					if (run.kind === "image") {
						const img = await resolveImage(run.src);
						if (img) {
              const measured = measuredImages[run.index];
              let widthPt = 300;
              let heightPt = 225;
              if (measured && measured.width > 0 && measured.height > 0) {
                widthPt = Math.round(measured.width * 0.75);
                heightPt = Math.round(measured.height * 0.75);
              } else {
                widthPt = Math.round((img.naturalWidth || 400) * 0.75);
                heightPt = Math.round((img.naturalHeight || 300) * 0.75);
              }
              console.log(`Image ${run.index} debug: measured ${measured?.width || 'N/A'}px x ${measured?.height || 'N/A'}px, natural ${img.naturalWidth}px x ${img.naturalHeight}px, using ${widthPt}pt x ${heightPt}pt in DOCX`);
							paraChildren.push(
								new ImageRun({ 
									data: img.data, 
                  transformation: { width: widthPt, height: heightPt }, 
									type: img.type 
								})
							);
						}
					} else if (run.kind === "break") {
						paraChildren.push(new TextRun({ break: 1 }));
          } else if (run.kind === "text") {
						pushTextSegments(run);
					}
				}
			}

			return new Paragraph({ 
				alignment: mapAlign(align), 
        spacing: { before, after, line: line || 240 }, 
				children: paraChildren 
			});
		};

		for (const block of blocks) {
			if (block.kind === "list-item") {
				const childrenRuns = [];
				if (block.ordered) {
					childrenRuns.push(new TextRun({ text: `${(block.index || 0) + 1}. ` }));
				} else {
					childrenRuns.push(new TextRun({ text: "• " }));
				}
				for (const run of block.runs) {
					if (run.kind === "image") {
						const img = await resolveImage(run.src);
						if (img) {
              const measured = measuredImages[run.index];
              let widthPt = 300;
              let heightPt = 225;
              if (measured && measured.width > 0 && measured.height > 0) {
                widthPt = Math.round(measured.width * 0.75);
                heightPt = Math.round(measured.height * 0.75);
              } else {
                widthPt = Math.round((img.naturalWidth || 400) * 0.75);
                heightPt = Math.round((img.naturalHeight || 300) * 0.75);
              }
              console.log(`Image ${run.index} debug: measured ${measured?.width || 'N/A'}px x ${measured?.height || 'N/A'}px, natural ${img.naturalWidth}px x ${img.naturalHeight}px, using ${widthPt}pt x ${heightPt}pt in DOCX`);
							childrenRuns.push(
								new ImageRun({ 
									data: img.data, 
                  transformation: { width: widthPt, height: heightPt }, 
									type: img.type 
								})
							);
						}
					} else if (run.kind === "break") {
						childrenRuns.push(new TextRun({ break: 1 }));
          } else if (run.kind === "text") {
						const baseOpts = {
							bold: !!run.bold,
							italics: !!run.italics,
							underline: run.underline ? {} : undefined,
							strike: !!run.strike,
							color: run.isLink ? "0000FF" : run.color,
							font: run.code ? "Courier New" : run.fontFamily,
							size: run.fontSize,
							shading: run.bgColor ? { type: ShadingType.CLEAR, color: "auto", fill: run.bgColor } : undefined,
						};
						const normalizeSpaces = (s) => s.replace(/ {2,}/g, (m) => " " + "\u00A0".repeat(m.length - 1));
						const lines = (run.text || "").split("\n");
						lines.forEach((lineText, li) => {
							const parts = lineText.split("\t");
							parts.forEach((part, pi) => {
								const t = normalizeSpaces(part);
								const tr = new TextRun({ text: t, ...baseOpts });
								if (run.isLink && run.url) {
									childrenRuns.push(new ExternalHyperlink({ link: run.url, children: [tr] }));
								} else {
									childrenRuns.push(tr);
								}
								if (pi < parts.length - 1) {
									childrenRuns.push(new TextRun({ text: "\t" }));
								}
							});
							if (li < lines.length - 1) {
								childrenRuns.push(new TextRun({ break: 1 }));
							}
						});
					}
				}
				sectionChildren.push(
					new Paragraph({ 
						alignment: mapAlign(block.align), 
            spacing: { before: block.before || 120, after: block.after || 120, line: block.line || 240 }, 
						children: childrenRuns 
					})
				);
				continue;
			}

			if (block.kind === "table") {
				const rows = [];
				const pageContentWidthTwips = 9360; // ~6.5 inches

				let columnWidths = [];
				let tableWidthTwips = pageContentWidthTwips;
				if (block.dims && Array.isArray(block.dims.colsTwips)) {
					const sum = block.dims.colsTwips.reduce((a, b) => a + b, 0) || 0;
					if (sum > 0) {
						const scale = sum > pageContentWidthTwips ? pageContentWidthTwips / sum : 1;
						columnWidths = block.dims.colsTwips.map((w) => Math.max(0, Math.floor(w * scale)));
						tableWidthTwips = Math.min(pageContentWidthTwips, Math.max(0, Math.floor(sum * scale)));
					}
				}

				if (!columnWidths.length) {
					const colsCount = (block.rows && block.rows[0] ? block.rows[0].length : 0) || 0;
					if (colsCount === 3) {
						columnWidths = [2200, 2200, pageContentWidthTwips - 2200 - 2200];
					} else if (colsCount > 0) {
						const each = Math.floor(pageContentWidthTwips / colsCount);
						columnWidths = new Array(colsCount).fill(each);
					}
				}

				for (const rowCells of block.rows) {
					const cells = [];
					for (let ci = 0; ci < rowCells.length; ci++) {
						const cell = rowCells[ci];
						const cellParagraphs = [];
						for (const p of cell.paragraphs) {
							cellParagraphs.push(
                await buildParagraphFromRuns(p.runs, p.align, p.line, 0, 120)
							);
						}
						cells.push(
							new TableCell({
								children: cellParagraphs,
								width: columnWidths.length ? { size: columnWidths[ci] || columnWidths[0], type: WidthType.DXA } : undefined,
                margins: { top: 100, bottom: 100, left: 120, right: 120 },
							})
						);
					}
					rows.push(new TableRow({ children: cells }));
				}
        
        // Add spacing before the table to match headings
        if (block.before && block.before > 0) {
          sectionChildren.push(new Paragraph({
            children: [],
            spacing: { before: 0, after: block.before }
          }));
        }
        
				sectionChildren.push(
					new Table({
						width: { size: tableWidthTwips, type: WidthType.DXA },
						columnWidths: columnWidths.length ? columnWidths : undefined,
            alignment: mapAlign(block.align || "left"),
						layout: TableLayoutType.FIXED,
						rows,
						borders: {
							top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
							bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
							left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
							right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
							insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
							insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
						},
					})
				);
        
        // Add spacing after the table
        if (block.after && block.after > 0) {
          sectionChildren.push(new Paragraph({
            children: [],
            spacing: { before: block.after, after: 0 }
          }));
        }
        
				continue;
			}

      if (block.kind === "heading" || block.kind === "quote" || block.kind === "paragraph") {
			const paraChildren = [];
			if (Array.isArray(block.runs)) {
				for (const run of block.runs) {
					if (run.kind === "image") {
						const img = await resolveImage(run.src);
						if (img) {
				const measured = measuredImages[run.index];
				let widthPt, heightPt;
			  
				if (measured && measured.width > 0 && measured.height > 0) {
				  widthPt = Math.round(measured.width * 0.75);
				  heightPt = Math.round(measured.height * 0.75);
				} else {
				  widthPt = Math.round((img.naturalWidth || 400) * 0.75);
				  heightPt = Math.round((img.naturalHeight || 300) * 0.75);
				}
			  
				// apply a little boost (e.g. +10%)
				const BOOST = 1.1;
				widthPt = Math.round(widthPt * BOOST);
				heightPt = Math.round(heightPt * BOOST);
			  
				// enforce max page width
				const MAX_WIDTH_PT = 700; // ~6.6in with margins
				if (widthPt > MAX_WIDTH_PT) {
				  const scale = MAX_WIDTH_PT / widthPt;
				  widthPt = MAX_WIDTH_PT;
				  heightPt = Math.round(heightPt * scale);
				  console.log(
					`Image ${run.index}: scaled to fit page (with boost) → ${widthPt}pt x ${heightPt}pt`
				  );
				}
			  
				console.log(
				  `Image ${run.index} debug: measured ${measured?.width || "N/A"}px x ${
					measured?.height || "N/A"
				  }px, natural ${img.naturalWidth}px x ${img.naturalHeight}px, using ${widthPt}pt x ${heightPt}pt in DOCX`
				);
			  
							paraChildren.push(
								new ImageRun({ 
									data: img.data, 
					transformation: { width: widthPt, height: heightPt },
					type: img.type,
								})
							);
						}
			  
					} else if (run.kind === "break") {
						paraChildren.push(new TextRun({ break: 1 }));
            } else if (run.kind === "text") {
						const baseOpts = {
							bold: !!run.bold,
							italics: !!run.italics,
							underline: run.underline || run.isLink ? {} : undefined,
							strike: !!run.strike,
							color: run.isLink ? "0000FF" : run.color,
							font: run.code ? "Courier New" : run.fontFamily,
							size: run.fontSize,
							shading: run.bgColor ? { type: ShadingType.CLEAR, color: "auto", fill: run.bgColor } : undefined,
						};
						const normalizeSpaces = (s) => s.replace(/ {2,}/g, (m) => " " + "\u00A0".repeat(m.length - 1));
						const lines = (run.text || "").split("\n");
						lines.forEach((lineText, li) => {
							const parts = lineText.split("\t");
							parts.forEach((part, pi) => {
								const t = normalizeSpaces(part);
								const tr = new TextRun({ text: t, ...baseOpts });
								if (run.isLink && run.url) {
									paraChildren.push(new ExternalHyperlink({ link: run.url, children: [tr] }));
								} else {
									paraChildren.push(tr);
								}
								if (pi < parts.length - 1) {
									paraChildren.push(new TextRun({ text: "\t" }));
								}
							});
							if (li < lines.length - 1) {
								paraChildren.push(new TextRun({ break: 1 }));
							}
						});
					}
				}
			}

        let paragraph;
			if (block.kind === "heading") {
				const headingLevel = block.tag === "h1" ? HeadingLevel.HEADING_1 : block.tag === "h2" ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
          paragraph = new Paragraph({ 
						heading: headingLevel, 
						alignment: mapAlign(block.align), 
            spacing: { before: block.before, after: block.after, line: block.line || 240 }, 
						children: paraChildren 
          });
			} else if (block.kind === "quote") {
          paragraph = new Paragraph({ 
						alignment: mapAlign(block.align), 
            spacing: { before: block.before, after: block.after, line: block.line || 240 }, 
						children: [new TextRun({ text: "“" }), ...paraChildren, new TextRun({ text: "”" })] 
          });
			} else {
          paragraph = new Paragraph({ 
						alignment: mapAlign(block.align), 
            spacing: { before: block.before, after: block.after, line: block.line || 240 }, 
						children: paraChildren 
          });
        }
        sectionChildren.push(paragraph);
			}
		}

		const doc = new Document({
			sections: [
				{
					properties: {
						page: {
							margin: {
								top: Math.round((margins.top / 96) * 1440),
								right: Math.round((margins.right / 96) * 1440),
								bottom: Math.round((margins.bottom / 96) * 1440),
								left: Math.round((margins.left / 96) * 1440),
							}
						}
					},
					children: sectionChildren,
				},
			],
		});

		const blob = await Packer.toBlob(doc);
		saveAs(blob, "document.docx");
  };

  return (
    <LexicalComposer initialConfig={lexicalEditorConfig}>
      {/* Full width top bar */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          width: "100%",
          background: "white",
          boxShadow: 2,
        }}
      >
        <LexicalEditorTopBar 
          onDownloadDocx={handleDownloadDocx}  
          margins={margins}
          setMargins={setMargins}
          marginPreset={marginPreset}
          setMarginPreset={setMarginPreset}
          customOpen={customOpen}
          setCustomOpen={setCustomOpen}
          tempMargins={tempMargins}
          setTempMargins={setTempMargins}
        />
      </Box>
 
      {/* Editor background */}
      <Box
        sx={{
          flex: 1,
          background: "#f3f3f3", // gray like Word
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          py: 4,
        }}
      >
        {/* Page-like editor */}
        <Box sx={{ width: `${pageSize.width}px` }}>
          <Box
            sx={{
              background: "white",
              width: `${pageSize.width}px`,
              minHeight: `${pageSize.height}px`,
              pt: `${margins.top}px`,
              pr: `${margins.right}px`,
              pb: `${margins.bottom}px`,
              pl: `${margins.left}px`,
              boxShadow: 3,
            }}
            data-lexical-page
          >
            <RichTextPlugin
              contentEditable={<MuiContentEditable />}
            //   placeholder={<Box sx={placeHolderSx}>Enter some text...</Box>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <ImagesPlugin captionsEnabled={false} />
            <FloatingTextFormatToolbarPlugin />
            <TablePlugin />
            <TableResizePlugin />
            <AutoPageBreakPlugin
              pageHeightPx={pageSize.height}
              topMarginPx={margins.top}
              bottomMarginPx={margins.bottom}
            />
            <MyCustomAutoFocusPlugin />
          </Box>
        </Box>
      </Box>
    </LexicalComposer>
  );
}

function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();
 
  useEffect(() => {
    editor.focus();
  }, [editor]);
 
  return null;
}

export default LexicalEditorWrapper;