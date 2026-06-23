import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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

function UserManagementPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    email: "",
    role: "CASHIER",
  });

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoadingUsers(true);
    setError("");

    try {
      const response = await apiClient.get("/users/all");
      setUsers(response.data);
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (status === 403) {
        setError("You do not have permission to view users.");
      } else {
        setError("Unable to load users.");
      }
    } finally {
      setLoadingUsers(false);
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
        "/users/create-user",
        formData
      );

      setUsers((previousUsers) => [
        ...previousUsers,
        response.data,
      ]);

      setSuccess("User created successfully.");

      setFormData({
        fullName: "",
        username: "",
        password: "",
        email: "",
        role: "CASHIER",
      });
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 400) {
        setError(
          requestError.response?.data?.message ||
            "Please check the entered information."
        );
      } else if (status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (status === 403) {
        setError(
          "Only the owner can create employee accounts."
        );
      } else if (status === 409) {
        setError(
          requestError.response?.data?.message ||
            "Username or email already exists."
        );
      } else {
        setError("Unable to create the user.");
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
          User Management
        </Typography>

        <Typography sx={{ mb: 3 }}>
          Create manager and cashier accounts.
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
              Create User
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                required
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                fullWidth
                required
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                margin="normal"
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
                helperText="Password must contain at least 8 characters"
              />

              <TextField
                fullWidth
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel id="role-label">
                  Role
                </InputLabel>

                <Select
                  labelId="role-label"
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <MenuItem value="MANAGER">
                    Manager
                  </MenuItem>

                  <MenuItem value="CASHIER">
                    Cashier
                  </MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{ mt: 2 }}
              >
                {saving ? (
                  <CircularProgress size={24} />
                ) : (
                  "Create User"
                )}
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Registered Users
            </Typography>

            {loadingUsers ? (
              <CircularProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Full Name</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.fullName}
                        </TableCell>

                        <TableCell>
                          {user.username}
                        </TableCell>

                        <TableCell>
                          {user.role}
                        </TableCell>

                        <TableCell>
                          {user.active
                            ? "Active"
                            : "Inactive"}
                        </TableCell>
                      </TableRow>
                    ))}

                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No users found.
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

export default UserManagementPage;