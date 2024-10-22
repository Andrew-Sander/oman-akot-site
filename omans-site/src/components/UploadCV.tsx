import React, { useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";
import { domainURL } from "../constants/generic.const";

const UploadCV: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      alert("Please select a PDF file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("title", title);
    formData.append("description", description);

    try {
      await axios.post(`${domainURL}/api/cv/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("PDF uploaded successfully!");
    } catch (error) {
      console.error("Error uploading PDF:", error);
      alert("Error uploading PDF.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>PDF File:</label>
        <br />
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
      </div>
      {/* <div>
        <label>Title:</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div> */}
      {/* <button type="submit">Upload PDF</button> */}
      <Button sx={{ mt: 2 }} variant="contained" type="submit">
        Upload PDF
      </Button>
    </form>
  );
};

export default UploadCV;
