import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Avatar,
  Stack,
  Button,
} from "@mui/material";
import axios from "axios";
import { colourWhite } from "../constants/colors.const";
import { useNavigate } from "react-router-dom";

const BioPage: React.FC = () => {
  const [bio, setBio] = useState<string>("");
  const [defaultProfilePicture, setDefaultProfilePicture] =
    useState<string>("");
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBio = async () => {
      try {
        const response = await axios.get("/api/api/bio");
        setBio(response.data.bio?.bioText || "");
        setDefaultProfilePicture(response.data.bio?.profilePictureUrl || "");
      } catch (error) {
        console.error("Error fetching bio:", error);
      }
    };

    fetchBio();
  }, []);

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

  return (
    <Container>
      <Stack
        flex={1}
        flexGrow={1}
        direction={"column"}
        justifyContent={"center"}
        alignContent={"center"}
        alignItems={"center"}
      >
        <Stack
          direction={screenWidth <= 900 ? "column" : "row"}
          justifyContent={"center"}
          alignContent={"center"}
          alignItems={screenWidth <= 900 ? "center" : undefined}
          width={"100%"}
          bgcolor={colourWhite}
          mt={4}
        >
          <Box
            maxWidth={
              screenWidth <= 900 ? { width: "80%", height: "auto" } : 400
            }
          >
            <Typography sx={{ whiteSpace: "pre-wrap" }} variant="h6">
              {bio}
            </Typography>
          </Box>
          {defaultProfilePicture && (
            <Stack
              direction={"column"}
              width={screenWidth <= 900 ? "80%" : undefined}
            >
              <Avatar
                variant="square"
                src={defaultProfilePicture}
                sx={
                  screenWidth <= 900
                    ? { width: "100%", height: "auto", marginTop: "30px" }
                    : { width: 350, height: 500, marginLeft: "30px" }
                }
                alt="Profile Picture"
              />
              <Button
                onClick={() => {
                  navigate("/contact");
                }}
                sx={
                  screenWidth <= 900
                    ? { width: "100%", marginTop: "20px", marginBottom: "20px" }
                    : {
                        width: 350,
                        marginLeft: "30px",
                        marginTop: "20px",
                        marginBottom: "20px",
                      }
                }
                variant="outlined"
              >
                Contact
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Container>
  );
};

export default BioPage;
