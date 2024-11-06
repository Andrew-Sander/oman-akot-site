// src/pages/AdminPage.tsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Input,
  TextField,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Stack,
  Avatar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from "@mui/material";
import Gallery from "./Gallery";
import ProfilePictureDialog from "../components/ProfilePictureDialog";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadSelectedWorks from "../components/UploadSelectedWorks";
import SelectedWorks from "./SelectedWorks";
import UploadCV from "../components/UploadCV";
import { domainURL } from "../constants/generic.const";
import ManageSelectedSeries from "../components/ManageSelectedSeries";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { Delete } from "@mui/icons-material";

interface BioData {
  bioText: string;
  profilePictureUrl: string;
}

interface ProfilePictureData {
  id: number;
  imageUrl: string;
}

interface LandingPageImage {
  id: number;
  imageUrl: string;
  order: number;
}

const AdminPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [images, setImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [landingPageImages, setLandingPageImages] = useState<
    LandingPageImage[]
  >([]);
  const [landingPageFile, setLandingPageFile] = useState<File | null>(null);
  const [landingPageUploadStatus, setLandingPageUploadStatus] =
    useState<string>("");

  const [bio, setBio] = useState<string>("");
  const [profilePictures, setProfilePictures] = useState<ProfilePictureData[]>(
    []
  );
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newBio, setNewBio] = useState<string>("");
  const [bioDialogOpen, setBioDialogOpen] = useState<boolean>(false);
  const [defaultProfilePicture, setDefaultProfilePicture] =
    useState<string>("");
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

  const fetchLandingPageImages = useCallback(async () => {
    try {
      const response = await axios.get(`${domainURL}/api/landing-page-gallery`);
      setLandingPageImages(response.data);
    } catch (error) {
      console.error("Error fetching landing page gallery images:", error);
    }
  }, []);
  useEffect(() => {
    fetchLandingPageImages();
  }, [fetchLandingPageImages]);
  const handleLandingPageFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLandingPageFile(event.target.files ? event.target.files[0] : null);
  };
  const handleLandingPageFileUpload = async () => {
    if (!landingPageFile) {
      setLandingPageUploadStatus("No file found");
      return;
    }

    const formData = new FormData();
    formData.append("image", landingPageFile);
    formData.append("order", (landingPageImages.length + 1).toString());

    try {
      const response = await axios.post(
        `${domainURL}/api/landing-page-gallery`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setLandingPageUploadStatus(`File uploaded successfully`);
      setLandingPageFile(null);
      fetchLandingPageImages();
    } catch (error) {
      setLandingPageUploadStatus("Error uploading file!");
      console.error("Upload error:", error);
    }
  };
  const handleLandingPageImageDelete = async (id: number) => {
    try {
      await axios.delete(`${domainURL}/api/landing-page-gallery/${id}`);
      fetchLandingPageImages();
    } catch (error) {
      console.error("Error deleting landing page image:", error);
    }
  };
  const handleLandingPageDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const reorderedImages = Array.from(landingPageImages);
    const [movedImage] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, movedImage);

    // Update the order in the backend
    try {
      for (let i = 0; i < reorderedImages.length; i++) {
        const image = reorderedImages[i];
        await axios.put(`${domainURL}/api/landing-page-gallery/${image.id}`, {
          order: i + 1,
        });
      }
      setLandingPageImages(reorderedImages);
    } catch (error) {
      console.error("Error updating landing page images order:", error);
    }
  };

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

    try {
      const response = await axios.post(`${domainURL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadStatus(`File uploaded successfully`);
      setDescription("");
      setTitle("");
      setFile(null);
    } catch (error) {
      setUploadStatus("Error uploading file!");
      console.error("Upload error:", error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${domainURL}/admin/dashboard`, {
          headers: { Authorization: token },
        });

        setData(response.data);
        setLoading(false);
      } catch (error) {
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${domainURL}/api/images`);
        setImages(response.data);
      } catch (error) {
        console.error("Error fetching gallery images:", error);
      }
    };

    fetchImages();
  }, []);

  const handleSetBackground = async () => {
    if (!selectedImage) return;
    try {
      const response = await axios.post(
        `${domainURL}/api/settings/background-image`,
        {
          imageUrl: selectedImage,
        }
      );
      console.log("Background image set:", response.data);
      setDialogOpen(false);
      // Handle successful setting, e.g., display success message or refresh page
    } catch (error) {
      console.error("Error setting background image:", error);
    }
  };

  //Bio editing
  useEffect(() => {
    const fetchBio = async () => {
      try {
        const response = await axios.get(`${domainURL}/api/bio`);
        setBio(response.data.bio?.bioText || "");
        setNewBio(response.data.bio?.bioText || "");
        setDefaultProfilePicture(response.data.bio?.profilePictureUrl || "");
      } catch (error) {
        console.error("Error fetching bio:", error);
      }
    };

    fetchBio();
  }, []);

  const handleBioUpdate = async () => {
    try {
      const response = await axios.post(`${domainURL}/api/bio`, {
        bioText: newBio,
        profilePictureUrl: defaultProfilePicture,
      });
      setBio(response.data.bioText);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating bio:", error);
    }
  };

  const handleProfilePictureUpdate = async (imageUrl: string) => {
    try {
      const response = await axios.post(`${domainURL}/api/bio`, {
        bioText: bio, // Preserve the existing bio text
        profilePictureUrl: imageUrl,
      });
      setDefaultProfilePicture(response.data.profilePictureUrl);
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  const handleProfilePictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const formData = new FormData();
      formData.append("image", event.target.files[0]);

      try {
        const response = await axios.post(
          `${domainURL}/api/profile-picture`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        fetchProfilePictures();
        // setProfilePictures((prev) => [
        //   ...prev,
        //   { id: response.data.id, imageUrl: response.data.profilePictureUrl },
        // ]);
        // setDefaultProfilePicture(response.data.profilePictureUrl);
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      }
    }
  };

  const fetchProfilePictures = useCallback(async () => {
    try {
      const response = await axios.get(`${domainURL}/api/profile-pictures`);
      setProfilePictures(response.data);
    } catch (error) {
      console.error("Error fetching profile pictures:", error);
    }
  }, []);

  useEffect(() => {
    fetchProfilePictures();
  }, [fetchProfilePictures]);

  const handleProfilePictureSelect = (imageUrl: string) => {
    handleProfilePictureUpdate(imageUrl);
    setBioDialogOpen(false);
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="md">
      {/* New Accordion for Editing Landing Page Gallery */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel-landing-page-gallery-content"
          id="panel-landing-page-gallery-header"
        >
          <Typography variant="h5">Edit Landing Page Gallery</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {/* Upload New Image */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6">Upload New Image</Typography>
            <Input type="file" onChange={handleLandingPageFileChange} />
            <Button
              variant="contained"
              onClick={handleLandingPageFileUpload}
              sx={{ mt: 2 }}
            >
              Upload
            </Button>
            {landingPageUploadStatus && (
              <Typography variant="body2">{landingPageUploadStatus}</Typography>
            )}
          </Box>

          {/* Display and Edit Images */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Manage Images
          </Typography>
          <DragDropContext onDragEnd={handleLandingPageDragEnd}>
            <Droppable droppableId="landingPageGallery" direction="vertical">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {landingPageImages.map((image, index) => (
                    <Draggable
                      key={image.id}
                      draggableId={image.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={image.imageUrl}
                            alt={`Image ${image.id}`}
                            sx={{ width: 100, height: 100, objectFit: "cover" }}
                          />
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="body1">
                              Order: {index + 1}
                            </Typography>
                          </CardContent>
                          <IconButton
                            onClick={() =>
                              handleLandingPageImageDelete(image.id)
                            }
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">Upload to Gallery</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ m: 4 }}>
            <Box sx={{ mt: 4 }}>
              <Input type="file" onChange={onFileChange} />
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
                Upload
              </Button>
              {uploadStatus && (
                <Typography variant="body2">{uploadStatus}</Typography>
              )}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">Edit Gallery</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Gallery isAdmin={true} />
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel-series-content"
          id="panel-series-header"
        >
          <Typography variant="h5">Manage Selected Series</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ManageSelectedSeries />
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">Upload to Selected Works</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <UploadSelectedWorks />
        </AccordionDetails>
      </Accordion>

      {/* <Accordion sx={{ mt: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">Edit Selected Works</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SelectedWorks isAdmin={true} />
        </AccordionDetails>
      </Accordion> */}

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">Upload CV</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <UploadCV />
        </AccordionDetails>
      </Accordion>
      {/* 
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select a Background Image from the gallery</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {images.map((image) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                <Card
                  sx={{
                    boxShadow:
                      selectedImage === image.imageUrl
                        ? "0 0 10px 2px blue"
                        : "none",
                    cursor: "pointer",
                    transition: "box-shadow 0.3s ease-in-out",
                  }}
                  onClick={() => setSelectedImage(image.imageUrl)}
                >
                  <CardMedia
                    component="img"
                    image={image.imageUrl}
                    alt={image.title}
                    sx={{ height: 200, objectFit: "cover" }}
                  />
                  <CardContent>
                    <Typography variant="body2">
                      {image.title || "No Title"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSetBackground}
            disabled={!selectedImage}
          >
            Set Background Image
          </Button>
        </DialogActions>
      </Dialog> */}

      {/* <ProfilePictureDialog
        open={bioDialogOpen}
        onClose={() => setBioDialogOpen(false)}
        onSelect={handleProfilePictureSelect}
        profilePictures={profilePictures}
        setProfilePictures={setProfilePictures}
      /> */}
    </Container>
  );
};

export default AdminPage;
