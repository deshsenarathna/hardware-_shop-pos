import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import apiClient from "../api/apiClient";

const initialFormData = {
  supplierCode: "",
  name: "",
  contactPerson: "",
  phone: "",
  active: true,
};

function SupplierManagementPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Search & pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Form dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  // Feedback notifications
  const [feedback, setFeedback] = useState(null); // { severity: "success" | "error" | "info", message: string }

  // Debounce search term by 400ms to reduce unneeded API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reload suppliers whenever page, pageSize, or debounced search changes
  useEffect(() => {
    loadSuppliers();
  }, [page, pageSize, debouncedSearchTerm]);

  async function loadSuppliers() {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(pageSize),
      });

      if (debouncedSearchTerm.trim()) {
        params.append("search", debouncedSearchTerm.trim());
      }

      const response = await apiClient.get(`/suppliers?${params.toString()}`);
      const data = response.data;

      if (Array.isArray(data)) {
        setSuppliers(data);
        setTotalElements(data.length);
      } else if (data && Array.isArray(data.content)) {
        setSuppliers(data.content);
        setTotalElements(data.totalElements ?? data.content.length);
      } else {
        setSuppliers([]);
        setTotalElements(0);
      }
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 401) {
        setFeedback({
          severity: "error",
          message: "Your login session is invalid or expired.",
        });
      } else if (status === 403) {
        setFeedback({
          severity: "error",
          message: "You do not have permission to manage suppliers.",
        });
      } else {
        setFeedback({
          severity: "error",
          message:
            requestError.response?.data?.message ||
            "Unable to load suppliers list.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
    setPage(0);
  }

  function handlePageChange(_event, newPage) {
    setPage(newPage);
  }

  function handleRowsPerPageChange(event) {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0);
  }

  // Form Field Validation
  function validateForm() {
    const errors = {};

    if (!formData.name || !formData.name.trim()) {
      errors.name = "Supplier name is required.";
    } else if (formData.name.trim().length > 150) {
      errors.name = "Supplier name cannot exceed 150 characters.";
    }

    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (formData.phone.trim().length > 25) {
      errors.phone = "Phone number cannot exceed 25 characters.";
    }

    if (formData.contactPerson && formData.contactPerson.trim().length > 100) {
      errors.contactPerson = "Contact person cannot exceed 100 characters.";
    }

    if (formData.supplierCode && formData.supplierCode.trim().length > 50) {
      errors.supplierCode = "Supplier code cannot exceed 50 characters.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleFormChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error on field edit
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function openCreateDialog() {
    setFormData(initialFormData);
    setFormErrors({});
    setEditMode(false);
    setEditingSupplierId(null);
    setDialogOpen(true);
  }

  function openEditDialog(supplier) {
    setFormData({
      supplierCode: supplier.supplierCode || "",
      name: supplier.name || "",
      contactPerson: supplier.contactPerson || "",
      phone: supplier.phone || "",
      active: supplier.active !== false,
    });
    setFormErrors({});
    setEditMode(true);
    setEditingSupplierId(supplier.id);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setFormData(initialFormData);
    setFormErrors({});
    setEditMode(false);
    setEditingSupplierId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      if (editMode) {
        const updatePayload = {
          supplierCode: formData.supplierCode.trim(),
          name: formData.name.trim(),
          contactPerson: formData.contactPerson.trim(),
          phone: formData.phone.trim(),
          active: Boolean(formData.active),
        };

        const response = await apiClient.put(
          `/suppliers/${editingSupplierId}`,
          updatePayload
        );

        setSuppliers((prev) =>
          prev.map((s) => (s.id === editingSupplierId ? response.data : s))
        );

        setFeedback({
          severity: "success",
          message: "Supplier updated successfully.",
        });
      } else {
        const createPayload = {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          ...(formData.contactPerson?.trim() && {
            contactPerson: formData.contactPerson.trim(),
          }),
          ...(formData.supplierCode?.trim() && {
            supplierCode: formData.supplierCode.trim(),
          }),
        };

        const response = await apiClient.post("/suppliers", createPayload);

        // Prepend created supplier and refresh current page
        setSuppliers((prev) => [response.data, ...prev]);
        setTotalElements((prev) => prev + 1);

        setFeedback({
          severity: "success",
          message: "Supplier created successfully.",
        });
      }

      closeDialog();
      loadSuppliers();
    } catch (requestError) {
      const status = requestError.response?.status;
      const responseMessage = requestError.response?.data?.message;

      if (status === 400) {
        setFeedback({
          severity: "error",
          message: responseMessage || "Please check the entered supplier details.",
        });
      } else if (status === 401) {
        setFeedback({
          severity: "error",
          message: "Your login session is invalid or expired.",
        });
      } else if (status === 403) {
        setFeedback({
          severity: "error",
          message: "You do not have permission to perform this action.",
        });
      } else if (status === 409) {
        setFeedback({
          severity: "error",
          message:
            responseMessage ||
            "A supplier with this code or name already exists.",
        });
      } else {
        setFeedback({
          severity: "error",
          message:
            responseMessage ||
            (editMode
              ? "Unable to update supplier."
              : "Unable to create supplier."),
        });
      }
    } finally {
      setSaving(false);
    }
  }

  // Delete handling
  function openDeleteDialog(supplier) {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  }

  function closeDeleteDialog() {
    setDeleteDialogOpen(false);
    setSupplierToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!supplierToDelete) return;

    setDeleting(true);

    try {
      await apiClient.delete(`/suppliers/${supplierToDelete.id}`);

      setSuppliers((prev) => prev.filter((s) => s.id !== supplierToDelete.id));
      setTotalElements((prev) => Math.max(0, prev - 1));

      setFeedback({
        severity: "success",
        message: `Supplier "${supplierToDelete.name}" deleted successfully.`,
      });

      closeDeleteDialog();
      loadSuppliers();
    } catch (requestError) {
      const status = requestError.response?.status;
      const responseMessage = requestError.response?.data?.message;

      if (status === 409) {
        setFeedback({
          severity: "error",
          message:
            responseMessage ||
            "Cannot delete supplier: Existing purchase orders or inventory records reference this supplier.",
        });
      } else if (status === 403) {
        setFeedback({
          severity: "error",
          message: "You do not have permission to delete suppliers.",
        });
      } else {
        setFeedback({
          severity: "error",
          message:
            responseMessage || "Failed to delete the selected supplier.",
        });
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ flexShrink: 0, mb: 2.5 }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: "rgba(232,98,44,0.12)",
                color: "secondary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalShippingOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h4">Supplier Management</Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 0.25 }}>
                Manage vendor profiles, contact details, and procurement partners.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Refresh Suppliers">
            <span>
              <Button
                variant="outlined"
                color="inherit"
                onClick={loadSuppliers}
                disabled={loading}
                startIcon={<RefreshRoundedIcon />}
                sx={{ px: 2 }}
              >
                Refresh
              </Button>
            </span>
          </Tooltip>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddRoundedIcon />}
            onClick={openCreateDialog}
            sx={{ px: 2.5 }}
          >
            Add Supplier
          </Button>
        </Stack>
      </Stack>

      {/* Main Content Area */}
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Toolbar & Search */}
        <Box
          sx={{
            flexShrink: 0,
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Search by supplier name, code, contact, or phone..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ maxWidth: 440 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSearchTerm("");
                          setPage(0);
                        }}
                      >
                        <CloseRoundedIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />

            <Typography variant="body2" color="text.secondary">
              Total Suppliers: <strong>{totalElements}</strong>
            </Typography>
          </Stack>
        </Box>

        {/* Table Container */}
        {loading ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 240,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <Table size="small" stickyHeader sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Supplier Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Company / Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact Person</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, pr: 3 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {suppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <LocalShippingOutlinedIcon
                        sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                      />
                      <Typography color="text.secondary" variant="body1">
                        {searchTerm.trim()
                          ? `No suppliers found matching "${searchTerm}".`
                          : "No suppliers registered yet."}
                      </Typography>
                      {!searchTerm.trim() && (
                        <Button
                          variant="text"
                          color="secondary"
                          startIcon={<AddRoundedIcon />}
                          onClick={openCreateDialog}
                          sx={{ mt: 1 }}
                        >
                          Add the first supplier
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers.map((supplier) => (
                    <TableRow key={supplier.id} hover>
                      <TableCell>
                        <Chip
                          label={supplier.supplierCode || "—"}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontFamily: "monospace",
                            fontWeight: 600,
                            borderRadius: 1.5,
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ fontWeight: 600 }}>
                        {supplier.name}
                      </TableCell>

                      <TableCell>
                        {supplier.contactPerson ? (
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <PersonOutlineRoundedIcon
                              fontSize="small"
                              sx={{ color: "text.secondary", fontSize: 16 }}
                            />
                            <span>{supplier.contactPerson}</span>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <PhoneOutlinedIcon
                            fontSize="small"
                            sx={{ color: "text.secondary", fontSize: 16 }}
                          />
                          <span>{supplier.phone || "—"}</span>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={supplier.active !== false ? "Active" : "Inactive"}
                          size="small"
                          color={supplier.active !== false ? "success" : "default"}
                          variant={supplier.active !== false ? "filled" : "outlined"}
                          sx={{ fontWeight: 600, fontSize: 11 }}
                        />
                      </TableCell>

                      <TableCell align="right" sx={{ pr: 2 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <Tooltip title="Edit Supplier">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openEditDialog(supplier)}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Supplier">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => openDeleteDialog(supplier)}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination footer */}
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 20, 50]}
          sx={{ borderTop: "1px solid", borderColor: "divider", flexShrink: 0 }}
        />
      </Paper>

      {/* Add / Edit Supplier Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pb: 1,
            }}
          >
            <Typography variant="h6">
              {editMode ? "Edit Supplier" : "Add New Supplier"}
            </Typography>
            <IconButton size="small" onClick={closeDialog}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ pt: 2 }}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                required
                label="Supplier / Company Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g. Lanka Hardware Supplies"
                error={Boolean(formErrors.name)}
                helperText={formErrors.name || "Required (max 150 characters)"}
                autoFocus
              />

              <TextField
                fullWidth
                required
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="e.g. +94 11 234 5678 or 0771234567"
                error={Boolean(formErrors.phone)}
                helperText={formErrors.phone || "Required (max 25 characters)"}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label="Supplier Code"
                name="supplierCode"
                value={formData.supplierCode}
                onChange={handleFormChange}
                placeholder={
                  editMode
                    ? "e.g. SUP-001"
                    : "Leave blank to auto-generate (optional)"
                }
                error={Boolean(formErrors.supplierCode)}
                helperText={
                  formErrors.supplierCode ||
                  (editMode
                    ? "Unique code identifying this supplier (max 50 chars)"
                    : "Optional: Backend auto-generates if omitted (max 50 chars)")
                }
              />

              <TextField
                fullWidth
                label="Contact Person"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleFormChange}
                placeholder="e.g. John Doe (Procurement Manager)"
                error={Boolean(formErrors.contactPerson)}
                helperText={
                  formErrors.contactPerson || "Optional (max 100 characters)"
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {editMode && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      name="active"
                      onChange={handleFormChange}
                      color="secondary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Active Status
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Inactive suppliers cannot be selected for new purchase orders.
                      </Typography>
                    </Box>
                  }
                />
              )}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeDialog} color="inherit" disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={saving}
              sx={{ px: 3 }}
            >
              {saving ? (
                <CircularProgress size={22} color="inherit" />
              ) : editMode ? (
                "Save Changes"
              ) : (
                "Create Supplier"
              )}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Confirm Supplier Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete supplier{" "}
            <strong>{supplierToDelete?.name}</strong> (Code:{" "}
            <code>{supplierToDelete?.supplierCode || "N/A"}</code>)?
          </DialogContentText>
          <Typography
            variant="caption"
            color="error.main"
            sx={{ display: "block", mt: 1.5 }}
          >
            * Note: If existing purchase records or inventory items reference this
            supplier, the system will prevent deletion to preserve data integrity.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={closeDeleteDialog}
            color="inherit"
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            sx={{ px: 2.5 }}
          >
            {deleting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Delete Supplier"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={5000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {feedback ? (
          <Alert
            severity={feedback.severity}
            onClose={() => setFeedback(null)}
            variant="filled"
            sx={{ width: "100%", borderRadius: 2 }}
          >
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

export default SupplierManagementPage;

