import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
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

function UnitManagementPage() {
  const navigate = useNavigate();

  const [units, setUnits] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    allowDecimal: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadUnits();
  }, []);

  async function loadUnits() {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.get("/units");
      setUnits(response.data);
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (status === 403) {
        setError("You do not have permission to manage units.");
      } else {
        setError("Unable to load measurement units.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value, checked, type } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiClient.post(
        "/units",
        formData
      );

      setUnits((previousUnits) => [
        ...previousUnits,
        response.data,
      ]);

      setFormData({
        name: "",
        symbol: "",
        allowDecimal: false,
      });

      setSuccess("Measurement unit created successfully.");
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 400) {
        setError("Please check the entered information.");
      } else if (status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (status === 403) {
        setError("You do not have permission to create units.");
      } else if (status === 409) {
        setError(
          requestError.response?.data?.message ||
            "Unit name or symbol already exists."
        );
      } else {
        setError("Unable to create the measurement unit.");
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
          Measurement Unit Management
        </Typography>

        <Typography sx={{ mb: 3 }}>
          Manage units used for hardware-shop products.
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
              Create Unit
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                required
                label="Unit Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                placeholder="Example: Kilogram"
              />

              <TextField
                fullWidth
                required
                label="Unit Symbol"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                margin="normal"
                placeholder="Example: kg"
              />

              <FormControlLabel
                sx={{ mt: 2 }}
                control={
                  <Checkbox
                    name="allowDecimal"
                    checked={formData.allowDecimal}
                    onChange={handleChange}
                  />
                }
                label="Allow decimal quantities"
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
                  "Create Unit"
                )}
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Units
            </Typography>

            {loading ? (
              <CircularProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Quantity Type</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {units.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell>{unit.name}</TableCell>

                        <TableCell>{unit.symbol}</TableCell>

                        <TableCell>
                          {unit.allowDecimal
                            ? "Whole and decimal"
                            : "Whole numbers only"}
                        </TableCell>

                        <TableCell>
                          {unit.active
                            ? "Active"
                            : "Inactive"}
                        </TableCell>
                      </TableRow>
                    ))}

                    {units.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No measurement units found.
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

export default UnitManagementPage;