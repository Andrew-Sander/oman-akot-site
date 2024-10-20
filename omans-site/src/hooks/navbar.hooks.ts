import { useState, useEffect } from "react";
import { Breakpoint } from "../interfaces/generic.interface";
import { breakpoints } from "../constants/generic.const";

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let windowWidth = "";
  if (windowSize.width > breakpoints.xl) {
    windowWidth = "xl";
  } else if (windowSize.width > breakpoints.lg) {
    windowWidth = "lg";
  } else if (windowSize.width > breakpoints.md) {
    windowWidth = "md";
  } else if (windowSize.width > breakpoints.sm) {
    windowWidth = "sm";
  } else {
    windowWidth = "xs";
  }

  let windowHeight = "";
  if (windowSize.height > breakpoints.xl) {
    windowHeight = "xl";
  } else if (windowSize.height > breakpoints.lg) {
    windowHeight = "lg";
  } else if (windowSize.height > breakpoints.md) {
    windowHeight = "md";
  } else if (windowSize.height > breakpoints.sm) {
    windowHeight = "sm";
  } else {
    windowHeight = "xs";
  }

  return { windowWidth, windowHeight };
};

// xs, extra-small: 0px
// sm, small: 600px
// md, medium: 900px
// lg, large: 1200px
// xl, extra-large: 1536px
