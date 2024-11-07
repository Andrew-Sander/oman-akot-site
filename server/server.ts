import express from "express";
import { upload } from "./s3uploads";
import Gallery from "./models/Gallery";
import Settings from "./models/Settings";
import adminRoutes from "./routes/admin";
import authRoutes from "./routes/auth";
import nodemailer from "nodemailer";
import axios from "axios";
import Bio from "./models/Bio";
import ProfilePicture from "./models/ProfilePicture";
import imageRoutes from "./routes/images";
import selectedWorksRoutes from "./routes/selectedWorks";
import selectedSeriesRoutes from "./routes/selectedSeries";
import cv from "./routes/cv";
import landingPageGalleryRoutes from "./routes/landingPageGallery";
const AWS = require("aws-sdk");

const cors = require("cors");
const app = express();
const path = require("path");

app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN_DEV,
      process.env.CORS_ORIGIN_PROD_1,
      process.env.CORS_ORIGIN_PROD_2,
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.use("/api/landing-page-gallery", landingPageGalleryRoutes);
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/imageRoute", imageRoutes);
app.use("/api/selected-works", selectedWorksRoutes);
app.use("/api/selected-series", selectedSeriesRoutes);
app.use("/api/cv", cv);

const s3 = new AWS.S3();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.post("/api/send-email", async (req, res) => {
  const { name, email, message, captchaToken } = req.body;

  // Verify reCAPTCHA token using test secret key
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${captchaToken}`;

  try {
    const response = await axios.post(verifyUrl);
    const { success } = response.data;

    if (!success) {
      return res.status(400).json({ message: "CAPTCHA verification failed." });
    }

    const mailOptions = {
      from: email,
      to: process.env.CONTACT_EMAIL,
      subject: `Website Contact From ${name}`,
      text: `From: ${email} \n\n ${message}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).json({ message: "Error sending email.", error });
  }
});

app.post("/upload", upload.single("image"), async (req, res) => {
  const maxOrderImage = await Gallery.findOne({
    order: [["order", "DESC"]],
  });
  const nextOrder = maxOrderImage ? maxOrderImage.order + 1 : 1;
  //@ts-ignore
  if (req.file && req.file.location) {
    try {
      //@ts-ignore
      const imageUrl = req.file.location; // URL from S3
      const description = req.body.description || "";
      const title = req.body.title || "";
      const newImage = await Gallery.create({
        imageUrl,
        description,
        title,
        order: nextOrder,
      });
      res.status(201).json(newImage);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).send("Error saving image info to database");
    }
  } else {
    res.status(400).send("Image upload failed");
    console.error("no req.file");
  }
});

// Set Background Image from Gallery
app.post("/api/settings/background-image", async (req, res) => {
  const { imageUrl } = req.body;

  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ backgroundImageUrl: imageUrl });
    } else {
      settings.backgroundImageUrl = imageUrl;
      await settings.save();
    }

    res.status(201).send(settings);
  } catch (error) {
    console.error("Error setting background image:", error);
    res.status(500).send("Error setting background image");
  }
});

app.get("/api/bio", async (req, res) => {
  try {
    const bio = await Bio.findOne();
    res.status(200).json({ bio });
  } catch (error) {
    console.error("Error fetching bio:", error);
    res.status(500).send("Error fetching bio");
  }
});

// Endpoint to update Bio
app.post("/api/bio", async (req, res) => {
  const { bioText, profilePictureUrl } = req.body;
  try {
    let bio = await Bio.findOne();
    if (!bio) {
      bio = await Bio.create({ bioText, profilePictureUrl });
    } else {
      bio.bioText = bioText;
      bio.profilePictureUrl = profilePictureUrl;
      await bio.save();
    }
    res.status(200).send(bio);
  } catch (error) {
    console.error("Error updating bio:", error);
    res.status(500).send("Error updating bio");
  }
});

// Upload Profile Picture endpoint
app.post("/api/profile-picture", upload.single("image"), async (req, res) => {
  try {
    //@ts-ignore
    if (req.file && req.file.location) {
      const profilePicture = await ProfilePicture.create({
        //@ts-ignore
        imageUrl: req.file.location,
      });
      res.status(201).send(profilePicture);
    } else {
      res.status(400).send("Image upload failed");
    }
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).send("Error uploading profile picture");
  }
});

// Endpoint to get the current background image URL
app.get("/api/settings/background-image", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.status(200).send({
      backgroundImageUrl: settings ? settings.backgroundImageUrl : null,
    });
  } catch (error) {
    console.error("Error fetching background image:", error);
    res.status(500).send("Error fetching background image");
  }
});

app.get("/api/images", async (req, res) => {
  try {
    console.log("Fetching images from database...");
    const images = await Gallery.findAll({ order: [["order", "ASC"]] });
    res.json(images);
  } catch (error: any) {
    console.error("Error fetching images:", error.stack); // Log full error stack
    res.status(500).send({ message: "Server error", error: error.message });
  }
});

app.get("/images/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const image = await Gallery.findByPk(id); // Assuming you use Sequelize
    if (image) {
      res.json(image);
    } else {
      res.status(404).send("Image not found");
    }
  } catch (error) {
    console.error("Failed to retrieve image:", error);
    res.status(500).send("Server error");
  }
});

app.get("/api/profile-pictures", async (req, res) => {
  try {
    const profilePictures = await ProfilePicture.findAll();
    res.status(200).json(profilePictures);
  } catch (error) {
    console.error("Error fetching profile pictures:", error);
    res.status(500).send("Error fetching profile pictures");
  }
});

app.delete("/api/images/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Find the image in the database
    const image = await Gallery.findByPk(id);

    if (!image) {
      return res.status(404).send("Image not found");
    }

    // Extract the S3 key from the imageUrl
    const s3Key = image.imageUrl.split("/").pop();

    // Delete the image from S3
    await s3
      .deleteObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
      })
      .promise();

    // Delete the image record from the database
    await image.destroy();

    res.status(200).send("Image deleted successfully");
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).send("Error deleting image");
  }
});

app.delete("/api/profile-pictures/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const picture = await ProfilePicture.findByPk(id);
    if (picture) {
      // Delete from S3
      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: picture.imageUrl.split("/").pop(), // Extract the file name
      };

      await s3.deleteObject(s3Params).promise();

      // Delete from database
      await picture.destroy();
      res.status(200).send({ message: "Profile picture deleted" });
    } else {
      res.status(404).send({ message: "Profile picture not found" });
    }
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    res.status(500).send("Error deleting profile picture");
  }
});

app.put("/api/images/:id", async (req, res) => {
  const { id } = req.params;
  const { description, title, order } = req.body;

  try {
    // Find the image in the database
    const image = await Gallery.findByPk(id);

    if (!image) {
      return res.status(404).send("Image not found");
    }

    // Update the image description
    image.description = description;
    image.title = title;
    image.order = order;
    await image.save();

    res.status(200).send("Image description updated successfully");
  } catch (error) {
    console.error("Error updating image description:", error);
    res.status(500).send("Error updating image description");
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../omans-site/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../omans-site/build", "index.html"));
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
