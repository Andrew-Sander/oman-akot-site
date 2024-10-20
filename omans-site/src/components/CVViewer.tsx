import { Box, CircularProgress, IconButton, Stack } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import DeleteIcon from "@mui/icons-material/Delete";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { useWindowSize } from "../hooks/navbar.hooks";
import { breakpoints } from "../constants/generic.const";

// Set the workerSrc from the local pdfjs-dist version
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface DocumentData {
  id: number;
  title: string;
  description: string;
  pdfUrl: string;
}

const CVViewer: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [numPages, setNumPages] = useState<{ [key: number]: number }>({});

  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const minMax = useWindowSize();

  useEffect(() => {
    fetch("https://oman-akot-site.vercel.app:8000/api/cv")
      .then((response) => response.json())
      .then((data) => {
        setDocuments(data);
      })
      .catch((error) => {
        console.error("Error fetching document:", error);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this CV?")) {
      try {
        await axios.delete(
          `https://oman-akot-site.vercel.app:8000/api/cv/${id}`
        );
        setDocuments((prevDocuments) =>
          prevDocuments.filter((document) => document.id !== id)
        );
        alert("CV deleted successfully!");
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Error deleting CV");
      }
    }
  };

  return (
    <Stack direction={"column"} justifyContent={"center"} alignItems={"center"}>
      {documents.map((document) => (
        <Box key={document.id} sx={{ marginBottom: 4 }}>
          {user && user.role === "admin" && (
            <IconButton
              aria-label="delete"
              sx={{ alignSelf: "flex-end", padding: 2 }}
              onClick={() => handleDelete(document.id)}
            >
              <DeleteIcon color="error" />
            </IconButton>
          )}

          <Box
            className="pdf-viewer-container"
            sx={{
              display: "flex",
              justifyContent: "center", // Horizontally center the content
              alignItems: "flex-start", // Start content from the top
              padding: 2,
              width: "70vw",
              height:
                minMax.windowHeight === "sm" || minMax.windowHeight === "xs"
                  ? "70vh"
                  : "80vh",
              maxWidth: "1000px",
              overflowY: "auto", // Scroll vertically if content overflows
              margin: "0 auto", // Center container horizontally
            }}
          >
            <Document
              file={document.pdfUrl}
              onLoadSuccess={({ numPages }) => {
                setNumPages((prev) => ({ ...prev, [document.id]: numPages }));
              }}
              loading={<CircularProgress></CircularProgress>}
            >
              {Array.from(
                new Array(numPages[document.id] || 0),
                (el, index) => (
                  <Box
                    key={`page_${index + 1}`}
                    sx={{
                      display: "flex",
                      justifyContent: "center", // Horizontally center each page
                      marginBottom: 2, // Space between pages
                    }}
                  >
                    <Page
                      pageNumber={index + 1}
                      renderTextLayer={false}
                      scale={
                        minMax.windowWidth === "sm"
                          ? 0.8
                          : minMax.windowWidth === "xs"
                            ? 0.5
                            : 1
                      }
                      loading={<CircularProgress></CircularProgress>}
                    />
                  </Box>
                )
              )}
            </Document>
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

export default CVViewer;
