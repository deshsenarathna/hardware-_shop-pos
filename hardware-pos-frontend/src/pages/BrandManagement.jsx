import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import apiClient from "../api/apiClient";

function BrandManagementPage() {
  const navigate = useNavigate();

  const [brands, setBrands] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.get("/brands");
      setBrands(response.data);
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (status === 403) {
        setError("You do not have permission to manage brands.");
      } else {
        setError("Unable to load brands.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiClient.post(
        "/brands",
        formData
      );

      setBrands((previousBrands) => [
        ...previousBrands,
        response.data,
      ]);

      setFormData({
        name: "",
        description: "",
      });

      setSuccess("Brand created successfully.");
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 400) {
        setError("Please check the entered brand details.");
      } else if (status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (status === 403) {
        setError("You do not have permission to create brands.");
      } else if (status === 409) {
        setError(
          requestError.response?.data?.message ||
            "Brand name already exists."
        );
      } else {
        setError("Unable to create the brand.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/dashboard")}
          sx={{ mb: 3 }}
        >
          Back to Dashboard
        </Button>

        <Typography variant="h4" gutterBottom>
          Brand Management
        </Typography>

        <Typography sx={{ mb: 3 }}>
          Manage brands used for hardware-shop products.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1.5fr",
            },
            gap: 3,
          }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create Brand
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                required
                label="Brand Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                placeholder="Example: Tokyo Cement"
              />

              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
                placeholder="Example: Cement and construction material brand"
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{ mt: 3 }}
              >
                {saving ? (
                  <CircularProgress size={24} />
                ) : (
                  "Create Brand"
                )}
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Brands
            </Typography>

            {loading ? (
              <CircularProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {brands.map((brand) => (
                      <TableRow key={brand.id}>
                        <TableCell>{brand.name}</TableCell>

                        <TableCell>
                          {brand.description || "No description"}
                        </TableCell>

                        <TableCell>
                          {brand.active ? "Active" : "Inactive"}
                        </TableCell>
                      </TableRow>
                    ))}

                    {brands.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No brands found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}

export default BrandManagementPage;

