// src/pages/AdminPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Input,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { domainURL } from "../constants/generic.const";

interface SelectedSeriesData {
  id: number;
  imageUrl?: string;
  name: string;
}

const UploadSelectedWorks: React.FC = () => {
  //   const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | "">("");
  const [selectedSeriesList, setSelectedSeriesList] = useState<
    SelectedSeriesData[]
  >([]);

  useEffect(() => {
    const fetchSelectedSeries = async () => {
      try {
        const response = await axios.get(`${domainURL}/api/selected-series`);
        setSelectedSeriesList(response.data);
      } catch (error) {
        console.error("Error fetching selected series:", error);
      }
    };

    fetchSelectedSeries();
  }, []);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files ? event.target.files[0] : null);
  };

  const onFileUpload = async () => {
    if (!file) {
      setUploadStatus("No file found");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("description", description);
    formData.append("title", title);
    formData.append("selectedSeriesId", selectedSeriesId.toString());

    try {
      const response = await axios.post(
        `${domainURL}/api/selected-works/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUploadStatus("Selected work uploaded successfully");
      setDescription("");
      setTitle("");
      setFile(null);
    } catch (error) {
      setUploadStatus("Error uploading selected work!");
      console.error("Upload error:", error);
    }
  };

  return (
    <Box sx={{ m: 4 }}>
      <Box sx={{ mt: 4 }}>
        <Input type="file" onChange={onFileChange} />
        <FormControl fullWidth margin="normal">
          <InputLabel id="selected-series-label">Select Series</InputLabel>
          <Select
            labelId="selected-series-label"
            value={selectedSeriesId}
            label="Select Series"
            onChange={(e) => setSelectedSeriesId(Number(e.target.value))}
          >
            {selectedSeriesList.map((series) => (
              <MenuItem key={series.id} value={series.id}>
                {`${series.name}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          margin="normal"
          value={description}
          multiline
          rows={3}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button variant="contained" onClick={onFileUpload} sx={{ mt: 2 }}>
          Upload Selected Work
        </Button>
        {uploadStatus && (
          <Typography variant="body2">{uploadStatus}</Typography>
        )}
      </Box>
    </Box>
  );
};

export default UploadSelectedWorks;
