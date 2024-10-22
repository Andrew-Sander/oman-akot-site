import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardMedia,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ProfilePicture } from "../interfaces/generic.interface";
import { domainURL } from "../constants/generic.const";

interface ProfilePictureDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  profilePictures: ProfilePicture[];
  setProfilePictures: React.Dispatch<React.SetStateAction<ProfilePicture[]>>;
}

const ProfilePictureDialog: React.FC<ProfilePictureDialogProps> = ({
  open,
  onClose,
  onSelect,
  profilePictures,
  setProfilePictures,
}) => {
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${domainURL}/api/profile-pictures/${id}`);
      setProfilePictures((prevPictures) =>
        prevPictures.filter((picture) => picture.id !== id)
      );
    } catch (error) {
      console.error("Error deleting profile picture:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Select Profile Picture
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {profilePictures.map((picture) => (
            <Grid item xs={12} sm={6} md={4} key={picture.id}>
              <Card
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  boxShadow: "none",
                  border: "1px solid #ddd",
                }}
              >
                <CardMedia
                  component="img"
                  image={picture.imageUrl}
                  alt="Profile Picture"
                  sx={{ objectFit: "contain", height: 150 }}
                  onClick={() => onSelect(picture.imageUrl)}
                />
                <IconButton
                  aria-label="delete"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                  }}
                  onClick={() => handleDelete(picture.id)}
                >
                  <DeleteIcon color="error" />
                </IconButton>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfilePictureDialog;
