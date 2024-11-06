import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Box, ThemeProvider } from "@mui/material";
import Navbar from "./components/Navbar";
import AdminPage from "./pages/Admin";
import Login from "./pages/Login";
import ContactForm from "./pages/Contact";
import Gallery from "./pages/Gallery";
// import BioPage from "./pages/BioPage";
import { colourWhite } from "./constants/colors.const";
import theme from "./theme";
import SelectedWorks from "./pages/SelectedWorks";
import CVViewer from "./components/CVViewer";

function App() {
  const location = useLocation();
  return (
    <ThemeProvider theme={theme}>
      <Box
        mt={location.pathname === "/" ? undefined : "75px"}
        bgcolor={colourWhite}
        minHeight={"100vh - 75px"}
        minWidth={"100vw"}
      >
        <Navbar />
        <Box maxHeight={"100%"}>
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/gallery" element={<Gallery />} />
            {/* <Route path="/bio" element={<BioPage />} /> */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<ContactForm />} />
            {/* <Route path="/selected-works" element={<SelectedWorks />} /> */}
            <Route
              path="/selected-works/:seriesId"
              element={<SelectedWorks />}
            />
            <Route path="/cv" element={<CVViewer />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
