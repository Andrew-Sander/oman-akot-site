import { Box } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";

const Homepage: React.FC = () => {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/settings/background-image"
        );
        setBackgroundImageUrl(response.data.backgroundImageUrl);
      } catch (error) {
        console.error("Error fetching background image:", error);
      }
    };

    fetchBackgroundImage();
  }, []);

  return (
    <Box
      sx={{
        background: `url(${backgroundImageUrl}) no-repeat center center`,
        backgroundSize: "cover",
        height: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
      }}
    ></Box>
  );
};

export default Homepage;
