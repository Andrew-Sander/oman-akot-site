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
import React, { useCallback } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";
import { colourBlack, colourWhite } from "../constants/colors.const";
import { useWindowSize } from "../hooks/navbar.hooks";

interface Page {
  name: string;
  url: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // custom hook
  const { windowWidth } = useWindowSize();

  // callbacks
  const handleClickMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );
  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);
  const handleNavigate = useCallback((page: string) => {
    setAnchorEl(null);
    navigate(page);
  }, []);

  const handleNavigateNavbar = useCallback((page: string) => {
    navigate(page);
  }, []);

  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null;

  const pages: Page[] = [
    { name: "Gallery", url: "/" },
    { name: "Selected Works", url: "/selected-works" },
    { name: "Bio", url: "/bio" },
    { name: "CV", url: "/cv" },
    { name: "Contact", url: "/contact" },
    { name: "Admin", url: "/admin" },
  ];

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
          <Toolbar>
            {pages.map((page) => {
              if (
                (page.url === "/admin" && user && user.role === "admin") ||
                page.url !== "/admin"
              ) {
                return (
                  <Button
                    key={page.name}
                    onClick={() => handleNavigateNavbar(page.url)}
                    size={"small"}
                    variant={
                      location.pathname === page.url ? "outlined" : undefined
                    }
                  >
                    {page.name}
                  </Button>
                );
              }
            })}
          </Toolbar>
        )}
      </Stack>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleCloseMenu}
        onClick={handleCloseMenu}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            width: 160,
            background: colourWhite,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {user && user.role === "admin" && (
          <>
            <MenuItem onClick={() => handleNavigate("/admin")}>Admin</MenuItem>
            <Divider />
          </>
        )}
        <MenuItem onClick={() => handleNavigate("/")}>Gallery</MenuItem>
        <MenuItem onClick={() => handleNavigate("/selected-works")}>
          Selected Works
        </MenuItem>
        <MenuItem onClick={() => handleNavigate("/bio")}>Bio</MenuItem>
        <MenuItem onClick={() => handleNavigate("/contact")}>Contact</MenuItem>
        <MenuItem onClick={() => handleNavigate("/cv")}>CV</MenuItem>
      </Menu>
    </Stack>
  );
};

export default Navbar;
