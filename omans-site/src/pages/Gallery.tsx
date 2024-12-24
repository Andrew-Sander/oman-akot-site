import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  IconButton,
  TextField,
  DialogContent,
  Dialog,
  Switch,
  CircularProgress,
  Box,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { selectImage } from "../redux/imageSlice";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import { Close, Save } from "@mui/icons-material";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggingStyle,
  NotDraggingStyle,
} from "react-beautiful-dnd";
import { domainURL } from "../constants/generic.const";
import { colourBlack50 } from "../constants/colors.const";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

interface Image {
  title?: string;
  id: number;
  imageUrl: string;
  available: boolean;
  description?: string;
}

export interface GalleryProps {
  isAdmin?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ isAdmin }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newAvailable, setNewAvailable] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideInterval = useRef<NodeJS.Timeout | undefined>();
  const timerInterval = 5000; // 5 seconds interval for automatic slide

  const location = useLocation();

  const handleOpenDialog = (image: Image) => {
    setSelectedImage(image);
    setDialogOpen(true);
  };

  const handleClick = (
    id: number,
    description: string | undefined,
    title: string | undefined
  ) => {
    dispatch(selectImage({ id, description, title }));
    navigate("/contact");
  };

  const handleEdit = (id: number) => {
    setEditId(id);
    const image = images.find((img) => img.id === id);
    setNewDescription(image?.description || "");
    setNewTitle(image?.title || "");
    setNewAvailable(image?.available || true);
  };

  const handleUpdate = async (id: number) => {
    try {
      await axios.put(`${domainURL}/api/images/${id}`, {
        description: newDescription,
        title: newTitle,
        available: newAvailable,
      });
      setImages(
        images.map((image) =>
          image.id === id
            ? {
                ...image,
                description: newDescription,
                title: newTitle,
                available: newAvailable,
              }
            : image
        )
      );
      setEditId(null);
    } catch (error) {
      console.error("Error updating image description:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${domainURL}/api/images/${id}`);
      setImages(images.filter((image) => image.id !== id));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const getItemStyle = (
    isDragging: boolean,
    draggableStyle: DraggingStyle | NotDraggingStyle | undefined
  ): React.CSSProperties | undefined => ({
    userSelect: "none",
    padding: 8 * 2,
    margin: `0 0 ${8}px 0`,
    background: isDragging ? "lightgreen" : "white",
    ...draggableStyle,
  });

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      // if (!result.destination) return;

      // const reorderedImages = Array.from(images);
      // const [movedImage] = reorderedImages.splice(result.source.index, 1);
      // reorderedImages.splice(result.destination.index, 0, movedImage);

      // setImages(reorderedImages);

      if (isAdmin) {
        try {
          // const reorderedIds = reorderedImages.map((image) => image.id);
          // Update the order in your backend if necessary
          // await axios.put(`${domainURL}/api/images/reorder`, {
          //   reorderedIds,
          // });
        } catch (error) {
          console.error("Error updating image order:", error);
        }
      }
    },
    [isAdmin]
  );

  const goToPreviousImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    resetTimer();
  };

  const goToNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    resetTimer();
  };

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        let combinedImages: Image[] = [];

        if (location.pathname === "/") {
          // Fetch images from LandingPageGallery
          const response = await axios.get(
            `${domainURL}/api/landing-page-gallery`
          );
          combinedImages = response.data;
        } else if (location.pathname === "/gallery") {
          // Fetch images from LandingPageGallery, Gallery, and SelectedWorks
          const [galleryResponse, selectedWorksResponse] = //landingPageResponse,
            await Promise.all([
              // axios.get(`${domainURL}/api/landing-page-gallery`),
              axios.get(`${domainURL}/api/images`),
              axios.get(`${domainURL}/api/selected-works`),
            ]);

          // Combine all images into one array
          combinedImages = [
            // ...landingPageResponse.data,
            ...galleryResponse.data,
            ...selectedWorksResponse.data,
          ];

          // Optionally, remove duplicates based on imageUrl
          const uniqueImagesMap = new Map<string, Image>();
          combinedImages.forEach((image) => {
            if (!uniqueImagesMap.has(image.imageUrl)) {
              uniqueImagesMap.set(image.imageUrl, image);
            }
          });
          combinedImages = Array.from(uniqueImagesMap.values());

          // Optionally, sort images (e.g., by some order or timestamp)
          // combinedImages.sort((a, b) => a.order - b.order);
        } else {
          // Fetch images from regular Gallery
          const response = await axios.get(`${domainURL}/api/images`);
          combinedImages = response.data;
        }

        setImages(combinedImages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching images:", error);
        setError("Error fetching images.");
        setLoading(false);
      }
    };

    fetchImages();
  }, [location.pathname]);

  const resetTimer = useCallback(() => {
    clearInterval(slideInterval.current);
    slideInterval.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, timerInterval);
  }, [images.length]);

  // Automatic slideshow functionality
  useEffect(() => {
    if (!isAdmin && location.pathname === "/") {
      resetTimer();
      return () => clearInterval(slideInterval.current);
    }
  }, [images.length, isAdmin, resetTimer, location.pathname]);

  if (loading) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography>{error}</Typography>;
  }

  if (isAdmin || location.pathname === "/gallery") {
    return (
      <>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable" direction="vertical">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ width: "100%" }}
              >
                <Stack
                  direction={"column"}
                  justifyContent={"center"}
                  justifyItems={"center"}
                  alignContent={"center"}
                  alignItems={"center"}
                  width={"100%"}
                >
                  {images.map((image, index) => (
                    <Draggable
                      key={image.id.toString()}
                      draggableId={image.id.toString()}
                      index={index}
                      isDragDisabled={!isAdmin}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <Card
                            sx={{
                              boxShadow: !isAdmin ? "none" : undefined,
                              backgroundColor: "transparent",
                              maxWidth: !isAdmin ? undefined : "450px",
                              width: !isAdmin ? "80vw" : undefined,
                            }}
                          >
                            {isAdmin && (
                              <IconButton
                                aria-label="delete"
                                sx={{ alignSelf: "flex-end", padding: 2 }}
                                onClick={() => handleDelete(image.id)}
                              >
                                <DeleteIcon color="error" />
                              </IconButton>
                            )}
                            <Box
                              onClick={() => {
                                if (!isAdmin) handleOpenDialog(image);
                              }}
                            >
                              <LazyLoadImage
                                placeholder={<CircularProgress size={80} />}
                                src={image.imageUrl}
                                alt={`Image ${image.id}`}
                                loading="lazy"
                                effect="blur"
                                style={{
                                  height: "auto",
                                  width: !isAdmin ? "100vw" : "50%",
                                  maxWidth: "100%",
                                  margin: "0 auto",
                                  backgroundColor: "transparent",
                                  cursor: !isAdmin ? "pointer" : "default",
                                  display: "block",
                                }}
                              />
                            </Box>

                            {isAdmin && (
                              <CardContent>
                                <Stack
                                  direction={"column"}
                                  justifyContent={"center"}
                                  alignContent={"center"}
                                  alignItems={"center"}
                                  flex={1}
                                >
                                  <Stack
                                    direction={"column"}
                                    alignItems={"center"}
                                    flex={1}
                                  >
                                    {editId === image.id ? (
                                      <>
                                        <Stack direction={"row"}>
                                          <TextField
                                            value={newTitle}
                                            onChange={(e) =>
                                              setNewTitle(e.target.value)
                                            }
                                          />
                                          <TextField
                                            value={newDescription}
                                            onChange={(e) =>
                                              setNewDescription(e.target.value)
                                            }
                                            multiline
                                            rows={3}
                                          />
                                          <Typography>Available?:</Typography>
                                          <Switch
                                            checked={newAvailable}
                                            onChange={(e) =>
                                              setNewAvailable(e.target.checked)
                                            }
                                          />
                                          <IconButton
                                            sx={{
                                              ":hover": {
                                                background: "none",
                                              },
                                            }}
                                            onClick={() =>
                                              handleUpdate(image.id)
                                            }
                                          >
                                            <Save />
                                          </IconButton>
                                        </Stack>
                                      </>
                                    ) : (
                                      <>
                                        <Typography
                                          sx={{ whiteSpace: "pre-wrap" }}
                                          variant="h4"
                                          textAlign={
                                            !isAdmin ? "center" : undefined
                                          }
                                        >
                                          {image.title || ""}
                                        </Typography>
                                        {!image.available && (
                                          <Typography
                                            sx={{ whiteSpace: "pre-wrap" }}
                                            color={colourBlack50}
                                            variant="body2"
                                            textAlign={
                                              !isAdmin ? "center" : undefined
                                            }
                                          >
                                            (Unavailable)
                                          </Typography>
                                        )}

                                        <Typography
                                          sx={{ whiteSpace: "pre-wrap" }}
                                          variant="body2"
                                          textAlign={
                                            !isAdmin ? "center" : undefined
                                          }
                                        >
                                          {image.description || ""}
                                        </Typography>
                                      </>
                                    )}
                                    {editId !== image.id && (
                                      <Button
                                        variant="outlined"
                                        sx={{ width: "200px" }}
                                        onClick={() => handleEdit(image.id)}
                                      >
                                        Edit
                                      </Button>
                                    )}
                                  </Stack>
                                </Stack>
                              </CardContent>
                            )}
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </Stack>

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Dialog for image popup */}
        <Dialog
          scroll="body"
          open={dialogOpen}
          BackdropProps={{
            sx: {
              backgroundColor: "#fff",
            },
          }}
          onClose={() => setDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          sx={{
            "& .MuiPaper-root": {
              backgroundColor: "transparent",
              boxShadow: "none",
            },
            height: "100vh",
          }}
        >
          <IconButton
            sx={{
              position: "absolute",
              padding: 0,
              mb: 1,
              right: 5,
              top: 0,
              zIndex: 9999,
            }}
            onClick={() => setDialogOpen(false)}
            onTouchEnd={() => setDialogOpen(false)}
          >
            <Close color="action" />
          </IconButton>
          <DialogContent sx={{ backgroundColor: "transparent" }}>
            <Stack direction={"column"} alignItems={"center"} spacing={1}>
              <LazyLoadImage
                src={selectedImage?.imageUrl}
                alt={`Image ${selectedImage?.id}`}
                effect="blur"
                placeholder={<CircularProgress size={80} />}
                style={{
                  objectFit: "contain",
                  backgroundColor: "transparent",
                  maxWidth: "70vw",
                  maxHeight: "60vh",
                }}
              />
              <Typography
                sx={{ whiteSpace: "pre-wrap" }}
                color={"#4E1D92"}
                variant="h6"
              >
                {selectedImage?.title}
              </Typography>
              {!selectedImage?.available && (
                <Typography
                  sx={{ whiteSpace: "pre-wrap" }}
                  color={colourBlack50}
                  variant="body2"
                  textAlign={!isAdmin ? "center" : undefined}
                >
                  (Unavailable)
                </Typography>
              )}
              <Typography
                sx={{ whiteSpace: "pre-wrap", mt: 2, width: "60%" }}
                variant="body2"
                textAlign={"center"}
              >
                {selectedImage?.description || ""}
              </Typography>
              {selectedImage?.available && (
                <Button
                  variant="outlined"
                  onClick={() =>
                    handleClick(
                      selectedImage?.id!,
                      selectedImage?.description,
                      selectedImage?.title
                    )
                  }
                >
                  Inquire
                </Button>
              )}
            </Stack>
          </DialogContent>
        </Dialog>
      </>
    );
  } else if (location.pathname === "/") {
    // Landing page slideshow
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          position: "relative",
        }}
        onClick={(e) => {
          if (e.clientX < window.innerWidth / 2) goToPreviousImage();
          else goToNextImage();
        }}
      >
        {images.length > 0 && (
          <LazyLoadImage
            src={images[currentIndex]?.imageUrl}
            alt={`Image ${images[currentIndex]?.id}`}
            placeholder={<CircularProgress size={80} />}
            effect="blur"
            style={{
              width: "100vw",
              height: "100vh",
              objectFit: "cover",
            }}
          />
        )}
      </div>
    );
  } else {
    // Default case if needed
    return null;
  }
};

export default Gallery;
