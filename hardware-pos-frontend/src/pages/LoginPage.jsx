import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import apiClient from "../api/apiClient";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post(
        "/auth/login",
        formData
      );

      login(response.data);
      navigate("/dashboard", { replace: true });
      
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 401) {
        setError("Invalid username or password.");
      } else if (status === 403) {
        setError("This user account is inactive.");
      } else {
        setError("Unable to connect to the backend.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={4}
          sx={{
            width: "100%",
            padding: 4,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Hardware Shop POS
          </Typography>

          <Typography
            variant="body1"
            sx={{ marginBottom: 3 }}
          >
            Sign in to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              autoComplete="username"
            />

            <TextField
              fullWidth
              required
              type="password"
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              autoComplete="current-password"
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ marginTop: 3 }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                "Login"
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default LoginPage;