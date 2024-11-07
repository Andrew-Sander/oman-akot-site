import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Divider,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { colourBlack, colourWhite } from "../constants/colors.const";
import { useWindowSize } from "../hooks/navbar.hooks";
import { domainURL } from "../constants/generic.const";

interface Page {
  name: string;
  url: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State for main menu anchor (mobile)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // State for "Selected Works" submenu anchor
  const [selectedWorksAnchorEl, setSelectedWorksAnchorEl] =
    useState<null | HTMLElement>(null);

  // custom hook to get window size
  const { windowWidth } = useWindowSize();

  // State to store selected series
  const [selectedSeries, setSelectedSeries] = useState<any[]>([]);

  // Fetch selected series when component mounts
  useEffect(() => {
    const fetchSelectedSeries = async () => {
      try {
        const response = await axios.get(`${domainURL}/api/selected-series`);
        setSelectedSeries(response.data);
      } catch (error) {
        console.error("Error fetching selected series:", error);
      }
    };

    fetchSelectedSeries();
  }, []);

  // Handlers for main menu (mobile)
  const handleClickMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
    setSelectedWorksAnchorEl(null); // Close any open submenus
  }, []);

  // Handlers for "Selected Works" submenu
  const handleOpenSelectedWorksMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      // Prevent the main menu from closing
      event.stopPropagation();
      setSelectedWorksAnchorEl(event.currentTarget);
    },
    []
  );

  const handleCloseSelectedWorksMenu = useCallback(() => {
    setSelectedWorksAnchorEl(null);
  }, []);

  // Navigation handlers
  const handleNavigate = useCallback(
    (page: string) => {
      setAnchorEl(null);
      setSelectedWorksAnchorEl(null);
      navigate(page);
    },
    [navigate]
  );

  const handleNavigateToSeries = useCallback(
    (seriesId: number) => {
      setAnchorEl(null);
      setSelectedWorksAnchorEl(null);
      navigate(`/selected-works/${seriesId}`);
    },
    [navigate]
  );

  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null;

  const pages: Page[] = [
    { name: "Gallery", url: "/gallery" },
    // "Selected Works" will be handled separately
    { name: "CV", url: "/cv" },
    { name: "Contact", url: "/contact" },
    { name: "Admin", url: "/admin" },
  ];

  if (location.pathname === "/") {
    return (
      <Stack
        direction={"row"}
        flex={1}
        justifyContent={"space-between"}
        top={0}
        left={0}
        zIndex={1000}
        width={"100vw"}
        position={"fixed"}
        alignItems="center" // Ensure vertical centering
      >
        <Typography variant="h1" color={"white"} padding={() => 2}>
          OMAN AKOT
        </Typography>
        <IconButton
          sx={{ ":hover": { background: "none" } }}
          onClick={handleClickMenu}
        >
          <Icon
            sx={{
              color: "white",
              width: 45,
              height: 40,
              padding: { md: 1, sm: 0 },
              marginRight: 2,
            }}
            component={MenuIcon}
          ></Icon>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          // Remove onClick={handleCloseMenu} to prevent menu from closing on submenu click
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              width: 160,
              background: colourWhite,
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {user && user.role === "admin" && (
            <>
              <MenuItem onClick={() => handleNavigate("/admin")}>
                Admin
              </MenuItem>
              <Divider />
            </>
          )}
          <MenuItem onClick={() => handleNavigate("/gallery")}>
            Gallery
          </MenuItem>

          {/* "Selected Works" with Submenu */}
          <MenuItem onClick={handleOpenSelectedWorksMenu}>
            Selected Works
          </MenuItem>
          <Menu
            anchorEl={selectedWorksAnchorEl}
            open={Boolean(selectedWorksAnchorEl)}
            onClose={handleCloseSelectedWorksMenu}
            anchorOrigin={{ horizontal: "right", vertical: "top" }}
            transformOrigin={{ horizontal: "left", vertical: "top" }}
          >
            {selectedSeries.map((series) => (
              <MenuItem
                key={series.id}
                onClick={() => handleNavigateToSeries(series.id)}
              >
                {series.name}
              </MenuItem>
            ))}
          </Menu>

          <MenuItem onClick={() => handleNavigate("/contact")}>
            Contact
          </MenuItem>
          <MenuItem onClick={() => handleNavigate("/cv")}>CV</MenuItem>
        </Menu>
      </Stack>
    );
  } else {
    return (
      <Stack>
        <Stack
          direction={"row"}
          flex={1}
          justifyContent={
            windowWidth === "xs" || windowWidth === "sm"
              ? "space-between"
              : "center"
          }
          top={0}
          left={0}
          zIndex={1000}
          width={"100vw"}
          bgcolor={"white"}
          position={"fixed"}
          alignItems="center" // Ensure vertical centering
        >
          <Typography
            variant="h1"
            onClick={() => {
              navigate("/");
            }}
            padding={() => 2}
            sx={{ cursor: "pointer" }}
          >
            OMAN AKOT
          </Typography>

          {windowWidth === "xs" || windowWidth === "sm" ? (
            // **Mobile View**
            <IconButton
              sx={{ ":hover": { background: "none" } }}
              onClick={handleClickMenu}
            >
              <Icon
                sx={{
                  color: colourBlack,
                  width: 45,
                  height: 40,
                  padding: { md: 1, sm: 0 },
                  marginRight: 2,
                }}
                component={MenuIcon}
              ></Icon>
            </IconButton>
          ) : (
            // **Desktop View**
            <Toolbar>
              {/* "Selected Works" Dropdown */}
              <div>
                <Button
                  onClick={handleOpenSelectedWorksMenu}
                  size={"small"}
                  variant={
                    location.pathname.startsWith("/selected-works")
                      ? "outlined"
                      : undefined
                  }
                >
                  Selected Works
                </Button>
                <Menu
                  anchorEl={selectedWorksAnchorEl}
                  open={Boolean(selectedWorksAnchorEl)}
                  onClose={handleCloseSelectedWorksMenu}
                  anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
                  transformOrigin={{ horizontal: "left", vertical: "top" }}
                >
                  {selectedSeries.map((series) => (
                    <MenuItem
                      key={series.id}
                      onClick={() => handleNavigateToSeries(series.id)}
                    >
                      {series.name}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
              {pages.map((page) => {
                if (
                  (page.url === "/admin" && user && user.role === "admin") ||
                  page.url !== "/admin"
                ) {
                  return (
                    <Button
                      key={page.name}
                      onClick={() => handleNavigate(page.url)}
                      size={"small"}
                      variant={
                        location.pathname === page.url ? "outlined" : undefined
                      }
                    >
                      {page.name}
                    </Button>
                  );
                }
                return null;
              })}
            </Toolbar>
          )}
        </Stack>

        {/* Mobile Menu */}
        {(windowWidth === "xs" || windowWidth === "sm") && (
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            // Remove onClick={handleCloseMenu} to prevent menu from closing on submenu click
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                width: 160,
                background: colourWhite,
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {user && user.role === "admin" && (
              <>
                <MenuItem onClick={() => handleNavigate("/admin")}>
                  Admin
                </MenuItem>
                <Divider />
              </>
            )}
            <MenuItem onClick={() => handleNavigate("/gallery")}>
              Gallery
            </MenuItem>

            {/* "Selected Works" with Submenu */}
            <MenuItem onClick={handleOpenSelectedWorksMenu}>
              Selected Works
            </MenuItem>
            <Menu
              anchorEl={selectedWorksAnchorEl}
              open={Boolean(selectedWorksAnchorEl)}
              onClose={handleCloseSelectedWorksMenu}
              anchorOrigin={{ horizontal: "right", vertical: "top" }}
              transformOrigin={{ horizontal: "left", vertical: "top" }}
            >
              {selectedSeries.map((series) => (
                <MenuItem
                  key={series.id}
                  onClick={() => handleNavigateToSeries(series.id)}
                >
                  {series.name}
                </MenuItem>
              ))}
            </Menu>

            <MenuItem onClick={() => handleNavigate("/contact")}>
              Contact
            </MenuItem>
            <MenuItem onClick={() => handleNavigate("/cv")}>CV</MenuItem>
          </Menu>
        )}
      </Stack>
    );
  }
};

export default Navbar;
