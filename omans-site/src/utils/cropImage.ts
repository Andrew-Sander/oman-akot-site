// src/utils/cropImage.ts
import { Area } from "react-easy-crop/types";
import { colourBlack } from "../constants/colors.const";

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (
  file: File,
  crop: Area,
  aspectRatio: number = 1
): Promise<File> => {
  const image = await createImage(URL.createObjectURL(file));
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Failed to get canvas context");

  const inputWidth = image.naturalWidth;
  const inputHeight = image.naturalHeight;
  const inputAspectRatio = inputWidth / inputHeight;

  let outputWidth = crop.width;
  let outputHeight = crop.height;

  if (inputAspectRatio > aspectRatio) {
    outputWidth = outputHeight * inputAspectRatio;
  } else {
    outputHeight = outputWidth / inputAspectRatio;
  }

  canvas.width = crop.width;
  canvas.height = crop.height;

  // Fill with black bars
  ctx.fillStyle = colourBlack;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the image within the new aspect ratio canvas
  ctx.drawImage(
    image,
    crop.x * (inputWidth / image.width),
    crop.y * (inputHeight / image.height),
    outputWidth * (inputWidth / image.width),
    outputHeight * (inputHeight / image.height),
    (canvas.width - outputWidth) / 2,
    (canvas.height - outputHeight) / 2,
    outputWidth,
    outputHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], file.name, { type: "image/jpeg" });
        resolve(croppedFile);
      } else {
        reject(new Error("Canvas is empty"));
      }
    }, "image/jpeg");
  });
};

export default getCroppedImg;
