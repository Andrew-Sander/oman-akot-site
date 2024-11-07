import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Stack,
  IconButton,
  TextField,
  Box,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import { ChevronLeft, ChevronRight, Close, Save } from "@mui/icons-material";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggingStyle,
  NotDraggingStyle,
} from "react-beautiful-dnd";
import { domainURL } from "../constants/generic.const";
import { useWindowSize } from "../hooks/navbar.hooks";
import { colourPrimary } from "../constants/colors.const";
import { useParams } from "react-router-dom";

interface Image {
  title: string;
  id: number;
  imageUrl: string;
  description?: string;
}

export interface GalleryProps {
  isAdmin?: boolean;
}

const SelectedWorks: React.FC<GalleryProps> = ({ isAdmin }) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [newDescription, setNewDescription] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<Image>();

  const thumbnailRefs = useRef<(HTMLImageElement | null)[]>([]); // For auto-scrolling
  const thumbnailContainerRef = useRef<HTMLDivElement>(null); // Ref to the thumbnails container

  // custom hook
  const { windowWidth, windowHeight } = useWindowSize();

  const handleEdit = (id: number) => {
    setEditId(id);
    const image = images.find((img) => img.id === id);
    setNewDescription(image?.description || "");
  };

  const { seriesId } = useParams();
  const seriesIdNumber = seriesId ? parseInt(seriesId, 10) : null;

  // Fetch images associated with the selected series
  useEffect(() => {
    if (!isAdmin) {
      setLoading(true);
      const fetchImages = async () => {
        try {
          if (seriesIdNumber) {
            const response = await axios.get(
              `${domainURL}/api/selected-series/${seriesIdNumber}`
            );
            setImages(response.data.selectedWorks || []);
          } else {
            setImages([]);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error fetching selected works:", error);
          setError("Error fetching selected works.");
          setLoading(false);
        }
      };
      fetchImages();
    }
  }, [seriesIdNumber, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      fetch(`${domainURL}/api/selected-works`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setImages(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error(
            "There has been a problem with your fetch operation:",
            error
          );
          setError("Error fetching selected works.");
          setLoading(false);
        });
    }
  }, [isAdmin]);

  // Auto-scroll to center the selected thumbnail
  useEffect(() => {
    if (!isAdmin) {
      const index = images.findIndex((img) => img.id === selectedImage?.id);
      const thumbnail = thumbnailRefs.current[index];

      if (thumbnail && thumbnailContainerRef.current) {
        const container = thumbnailContainerRef.current;
        const thumbnailWidth = thumbnail.offsetWidth;
        const containerWidth = container.offsetWidth;

        const scrollPosition =
          thumbnail.offsetLeft - containerWidth / 2 + thumbnailWidth / 2;

        container.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        });
      }
    }
  }, [selectedImage, images, isAdmin]);

  const handleUpdate = async (id: number) => {
    try {
      const image = images.find((img) => img.id === id);
      await axios.put(`${domainURL}/api/selected-works/${id}`, {
        description: newDescription,
        title: image?.title,
        imageUrl: image?.imageUrl,
      });
      setImages(
        images.map((image) =>
          image.id === id ? { ...image, description: newDescription } : image
        )
      );
      setEditId(null);
    } catch (error) {
      console.error("Error updating selected work description:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${domainURL}/api/selected-works/${id}`);
      setImages(images.filter((image) => image.id !== id));
    } catch (error) {
      console.error("Error deleting selected work:", error);
    }
  };

  const getItemStyle = (
    isDragging: boolean,
    draggableStyle: DraggingStyle | NotDraggingStyle | undefined
  ): React.CSSProperties | undefined => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: 8 * 2,
    margin: `0 0 ${8}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "white",

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  const handleThumbnailClick = (image: Image) => {
    setSelectedImage(image);
  };

  // Infinite scroll functionality
  const scrollThumbnails = (direction: "left" | "right") => {
    const currentIndex = images.findIndex(
      (img) => img.id === selectedImage?.id
    );
    let newIndex = currentIndex;

    if (direction === "left") {
      newIndex = (currentIndex - 1 + images.length) % images.length; // wrap around left
    } else if (direction === "right") {
      newIndex = (currentIndex + 1) % images.length; // wrap around right
    }

    setSelectedImage(images[newIndex]);
  };

  useEffect(() => {
    setSelectedImage(images[0]);
  }, [images]);

  useEffect(() => {
    // Scroll the container to the start when it mounts
    if (thumbnailContainerRef.current) {
      thumbnailContainerRef.current.scrollLeft = 0; // Start at the beginning
    }
  }, []);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination) return;

      const reorderedImages = Array.from(images);
      const [movedImage] = reorderedImages.splice(result.source.index, 1);
      reorderedImages.splice(result.destination.index, 0, movedImage);

      setImages(reorderedImages);

      if (isAdmin) {
        try {
          const reorderedIds = reorderedImages.map((image) => image.id);
          await axios.put(`${domainURL}/api/selected-works/reorder`, {
            reorderedIds,
          });
        } catch (error) {
          console.error("Error updating selected works order:", error);
        }
      }
    },
    [isAdmin, images]
  );

  if (loading) return <CircularProgress />;

  if (error) {
    console.log(error);
    return null;
  }

  return (
    <>
      {isAdmin ? (
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
                            <CardMedia
                              component="img"
                              image={image.imageUrl}
                              alt={`Image ${image.id}`}
                              sx={{
                                height: "auto",
                                width: "50%",
                                maxWidth: "100%",
                                marginX: "auto",
                                backgroundColor: "transparent",
                                cursor: !isAdmin ? "pointer" : undefined,
                              }}
                            />
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
                                            value={newDescription}
                                            onChange={(e) =>
                                              setNewDescription(e.target.value)
                                            }
                                            multiline
                                            rows={3}
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
      ) : loading ? (
        <Box
          width={"100%"}
          height={"100%"}
          alignContent={"center"}
          alignItems={"center"}
          justifyContent={"center"}
          justifyItems={"center"}
        >
          <CircularProgress />
        </Box>
      ) : (
        selectedImage && (
          <Stack
            direction={"column"}
            alignItems={"center"}
            flex={1}
            maxHeight={"100%"}
            overflow={"hidden"}
          >
            {/* Large Image Display */}
            <Box width={"100%"} height={"90vh"} overflow={"hidden"}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center" // This centers the Stack horizontally
                sx={{ width: "100%", height: "100%" }}
              >
                <IconButton onClick={() => scrollThumbnails("left")}>
                  <ChevronLeft />
                </IconButton>
                <Box
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column", // Center the content vertically
                    height: "100%",
                    overflowY: "auto",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={selectedImage.imageUrl}
                    alt={selectedImage.title}
                    sx={{
                      maxHeight: "calc(100vh - 300px)",
                      maxWidth: "80vw",
                      objectFit: "contain",
                      margin: "0 auto",
                    }}
                  />

                  <Box
                    height={"200px"}
                    sx={{
                      mt: 1,
                    }}
                  >
                    <Typography
                      variant={
                        windowWidth === "sm" ||
                        windowWidth === "xs" ||
                        windowHeight === "sm" ||
                        windowHeight === "xs"
                          ? "h5"
                          : "h4"
                      }
                    >
                      {selectedImage.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {selectedImage.description}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => scrollThumbnails("right")}>
                  <ChevronRight />
                </IconButton>
              </Stack>
            </Box>

            {/* Thumbnail Navigation */}
            <Box
              sx={{
                width: "100%",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "fixed",
                bottom:
                  windowWidth === "sm" ||
                  windowWidth === "xs" ||
                  windowHeight === "sm" ||
                  windowHeight === "xs"
                    ? 2
                    : 1,
                marginX: 2,
                zIndex: 9999,
              }}
            >
              <div
                ref={thumbnailContainerRef}
                style={{
                  display: "flex",
                  overflowX: "auto",
                  scrollBehavior: "smooth",
                  minHeight: "60px",
                }}
              >
                {images.map((image, index) => (
                  <CardMedia
                    key={image.id}
                    component="img"
                    image={image.imageUrl}
                    alt={image.title}
                    onClick={() => handleThumbnailClick(image)}
                    ref={(el) => (thumbnailRefs.current[index] = el)} // Add ref for scrolling
                    sx={{
                      width:
                        windowWidth === "sm" ||
                        windowWidth === "xs" ||
                        windowHeight === "sm" ||
                        windowHeight === "xs"
                          ? 60
                          : 100,
                      height:
                        windowWidth === "sm" ||
                        windowWidth === "xs" ||
                        windowHeight === "sm" ||
                        windowHeight === "xs"
                          ? 60
                          : 100,
                      cursor: "pointer",
                      boxShadow:
                        selectedImage?.id === image.id
                          ? `4px 4px 20px ${colourPrimary}`
                          : undefined,
                      objectFit: "cover",
                      margin: "15px",
                      transition: "box-shadow 0.3s ease",
                      display: "flex",
                    }}
                  />
                ))}
              </div>
            </Box>
          </Stack>
        )
      )}
    </>
  );
};

export default SelectedWorks;
