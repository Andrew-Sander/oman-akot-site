import React, { useCallback, useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Container,
  Button,
  Stack,
  IconButton,
  TextField,
  DialogContent,
  Dialog,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { selectImage } from "../redux/imageSlice";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import { Close, Save } from "@mui/icons-material";
import { colourPrimary, colourWhite } from "../constants/colors.const";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggingStyle,
  NotDraggingStyle,
} from "react-beautiful-dnd";

interface Image {
  title: string;
  id: number;
  imageUrl: string;
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
  const [newDescription, setNewDescription] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image>();

  const handleOpenDialog = (image: Image) => {
    setSelectedImage(image);
    setDialogOpen(true);
  };

  const handleClick = (
    id: number,
    description: string | undefined,
    title: string
  ) => {
    dispatch(selectImage({ id, description, title }));
    navigate("/contact");
  };

  const handleEdit = (id: number) => {
    setEditId(id);
    const image = images.find((img) => img.id === id);
    setNewDescription(image?.description || "");
  };

  const handleUpdate = async (id: number) => {
    try {
      await axios.put(`https://oman-akot-site.vercel.app/api/images/${id}`, {
        description: newDescription,
      });
      setImages(
        images.map((image) =>
          image.id === id ? { ...image, description: newDescription } : image
        )
      );
      setEditId(null);
    } catch (error) {
      console.error("Error updating image description:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`https://oman-akot-site.vercel.app/api/images/${id}`);
      setImages(images.filter((image) => image.id !== id));
    } catch (error) {
      console.error("Error deleting image:", error);
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
          await axios.put("/imageRoute/reorder", {
            reorderedIds,
          });
        } catch (error) {
          console.error("Error updating image order:", error);
        }
      }
    },
    [isAdmin, images]
  );

  useEffect(() => {
    fetch("https://oman-akot-site.vercel.app/api/images")
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
        setError("Error fetching images.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return null;
  }

  if (error) {
    return <Typography>{error}</Typography>;
  }

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
                            onClick={() => {
                              !isAdmin && handleOpenDialog(image);
                            }}
                            component="img"
                            image={image.imageUrl}
                            alt={`Image ${image.id}`}
                            sx={{
                              height: "auto",
                              width: !isAdmin ? "70vw" : "50%",
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
                                          onClick={() => handleUpdate(image.id)}
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
          }}
          onClick={() => setDialogOpen(false)}
        >
          <Close color="action" />
        </IconButton>
        <DialogContent sx={{ backgroundColor: "transparent" }}>
          <Stack direction={"column"} alignItems={"center"} spacing={3}>
            <CardMedia
              component="img"
              image={selectedImage?.imageUrl}
              alt={`Image ${selectedImage?.id}`}
              sx={{
                objectFit: "contain",
                backgroundColor: "transparent",
                maxWidth: "70vw",
                maxHeight: "60vh",
              }}
            />
            <Typography
              sx={{ whiteSpace: "pre-wrap", mb: 2 }}
              color={"#4E1D92"}
              variant="h6"
            >
              {selectedImage?.title}
            </Typography>
            <Typography
              sx={{ whiteSpace: "pre-wrap", mt: 2, width: "60%" }}
              variant="body2"
              textAlign={"center"}
            >
              {selectedImage?.description || ""}
            </Typography>
            <Button
              variant="outlined"
              onClick={() =>
                handleClick(
                  selectedImage?.id!,
                  selectedImage?.description,
                  selectedImage?.title!
                )
              }
            >
              Inquire
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Gallery;
