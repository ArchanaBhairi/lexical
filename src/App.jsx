import React from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
import LexicalEditorWrapper from "./components/LexicalEditorWrapper";
import theme from "./theme";
import "./App.css";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ width: '100%', minHeight: '100vh' }}>
        <LexicalEditorWrapper />
      </Box>
    </ThemeProvider>
  );
}

export default App;