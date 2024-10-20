import React, { useEffect, useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const ContactForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const inquiry = useSelector((state: any) => state.image.message);

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!captchaToken) {
      setResponse("Please complete the CAPTCHA.");
      return;
    }

    const payload = {
      name,
      email,
      message,
      captchaToken,
    };

    try {
      const res = await axios.post(
        "https://oman-akot-site.vercel.app:8000/api/send-email",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setResponse(res.data.message);
    } catch (error) {
      console.error("Error in form submission:", error);
      setResponse("Error sending message.");
    }
  };

  useEffect(() => {
    if (inquiry) setMessage(inquiry);
  }, [inquiry]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 3, width: "770px", maxWidth: "70vw", mx: "auto" }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Contact
      </Typography>
      <TextField
        label="Name"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
        required
      />
      <TextField
        label="Email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
        type="email"
        required
      />
      <TextField
        label="Message"
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        margin="normal"
        multiline
        rows={4}
        required
      />
      <ReCAPTCHA
        sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
        onChange={handleCaptchaChange}
      />
      <Button
        disabled={!!!captchaToken}
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 1 }}
      >
        Send
      </Button>
      {response && (
        <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
          {response}
        </Typography>
      )}
    </Box>
  );
};

export default ContactForm;
