import React, { useState, useEffect } from "react";
import axios from "axios";
import { domainURL } from "../constants/generic.const";
import {
  Box,
  Button,
  Input,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

interface SelectedWorkData {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  selectedSeriesId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SelectedSeriesData {
  id: number;
  imageUrl?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  selectedWorks?: SelectedWorkData[];
}

const ManageSelectedSeries: React.FC = () => {
  const [selectedSeriesList, setSelectedSeriesList] = useState<
    SelectedSeriesData[]
  >([]);
  const [newSeriesFile, setNewSeriesFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [editSeriesId, setEditSeriesId] = useState<number | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [editSeriesName, setEditSeriesName] = useState<string | null>(null);

  // Fetch the list of selected series
  const fetchSelectedSeries = async () => {
    try {
      const response = await axios.get(`${domainURL}/api/selected-series`);
      setSelectedSeriesList(response.data);
    } catch (error) {
      console.error("Error fetching selected series:", error);
    }
  };

  useEffect(() => {
    fetchSelectedSeries();
  }, []);

  // Handle file selection for new series
  const handleNewSeriesFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewSeriesFile(event.target.files ? event.target.files[0] : null);
  };

  // Create a new selected series
  const handleCreateNewSeries = async () => {
    // if (!newSeriesFile) {
    //   setUploadStatus("No image selected");
    //   return;
    // }
    if (!editSeriesName) {
      setUploadStatus("No name added");
      return;
    }

    const formData = new FormData();
    newSeriesFile && formData.append("image", newSeriesFile);
    formData.append("name", editSeriesName);

    try {
      const response = await axios.post(
        `${domainURL}/api/selected-series/`,
        formData
      );

      setUploadStatus("Selected series created successfully");
      setNewSeriesFile(null);
      fetchSelectedSeries();
    } catch (error) {
      setUploadStatus("Error creating selected series");
      console.error("Error creating selected series:", error);
    }
  };

  // Delete a selected series
  const handleDeleteSeries = async (id: number) => {
    try {
      await axios.delete(`${domainURL}/api/selected-series/${id}`);
      fetchSelectedSeries();
    } catch (error) {
      console.error("Error deleting selected series:", error);
    }
  };

  // Edit a selected series
  const handleEditSeries = (id: number) => {
    setEditSeriesId(id);
  };

  // Save changes to a selected series
  const handleSaveEditSeries = async () => {
    if (editSeriesId === null) return;

    const formData = new FormData();
    if (newImageFile) {
      formData.append("image", newImageFile);
    }
    if (editSeriesName) {
      formData.append("name", editSeriesName);
    }
    try {
      const response = await axios.put(
        `${domainURL}/api/selected-series/${editSeriesId}`,
        formData
      );

      setEditSeriesId(null);
      setNewImageFile(null);
      setEditSeriesName(null);
      fetchSelectedSeries();
    } catch (error) {
      console.error("Error updating selected series:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Create New Selected Series
      </Typography>
      <Box sx={{ mt: 2 }}>
        {/* <Input type="file" onChange={handleNewSeriesFileChange} /> */}
        <Input
          title="Title"
          type={"text"}
          onChange={(
            e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
          ) => {
            setEditSeriesName(e.target.value);
          }}
        />
        <Button
          variant="contained"
          onClick={handleCreateNewSeries}
          sx={{ ml: 2 }}
        >
          Create Selected Series
        </Button>
        {uploadStatus && (
          <Typography variant="body2">{uploadStatus}</Typography>
        )}
      </Box>

      <Typography variant="h6" sx={{ mt: 4 }}>
        Existing Selected Series
      </Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {selectedSeriesList.map((series) => (
          <Grid item xs={12} key={series.id}>
            <Card>
              {/* Series Information */}
              <CardContent>
                <Typography variant="h6">{series.name}</Typography>
                {series.imageUrl && (
                  <CardMedia
                    component="img"
                    image={series.imageUrl}
                    alt={`Selected Series ${series.name}`}
                    sx={{ height: 200, objectFit: "cover" }}
                  />
                )}
              </CardContent>
              <CardActions>
                {/* <Button onClick={() => handleEditSeries(series.id)}>
                  Edit
                </Button> */}
                <Button onClick={() => handleDeleteSeries(series.id)}>
                  Delete
                </Button>
              </CardActions>

              {/* Display Selected Works */}
              {series.selectedWorks && series.selectedWorks.length > 0 ? (
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1">Selected Works:</Typography>
                  <Grid container spacing={2}>
                    {series.selectedWorks.map((work) => (
                      <Grid item xs={12} sm={6} md={4} key={work.id}>
                        <Card>
                          <CardMedia
                            component="img"
                            image={work.imageUrl}
                            alt={work.title}
                            sx={{ height: 150, objectFit: "cover" }}
                          />
                          <CardContent>
                            <Typography variant="body1">
                              {work.title}
                            </Typography>
                            <Typography variant="body2">
                              {work.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ p: 2 }}>
                  No works assigned to this series.
                </Typography>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ManageSelectedSeries;
