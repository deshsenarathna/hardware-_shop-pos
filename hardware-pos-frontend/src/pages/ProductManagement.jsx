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
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import apiClient from "../api/apiClient";

const initialFormData = {
  productCode: "",
  name: "",
  description: "",
  categoryId: "",
  brandId: "",
  unitId: "",
  purchasePrice: "",
  sellingPrice: "",
  reorderLevel: "",
};

function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);

  const [formData, setFormData] = useState(initialFormData);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    setLoading(true);
    setError("");

    try {
      const [
        productsResponse,
        categoriesResponse,
        brandsResponse,
        unitsResponse,
      ] = await Promise.all([
        apiClient.get("/products"),
        apiClient.get("/categories"),
        apiClient.get("/brands"),
        apiClient.get("/units"),
      ]);

      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data.filter((c) => c.active));
      setBrands(brandsResponse.data.filter((b) => b.active));
      setUnits(unitsResponse.data.filter((u) => u.active));
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (status === 403) {
        setError("You do not have permission to manage products.");
      } else {
        setError("Unable to load product information.");
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

  function openCreateDialog() {
    setFormData(initialFormData);
    setEditMode(false);
    setEditingProductId(null);
    setDialogOpen(true);
  }

  function openEditDialog(product) {
    setEditMode(true);
    setEditingProductId(product.id);

    setFormData({
      productCode: product.productCode,
      name: product.name,
      description: product.description || "",
      categoryId: product.categoryId,
      brandId: product.brandId || "",
      unitId: product.unitId,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      reorderLevel: product.reorderLevel,
    });

    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setFormData(initialFormData);
    setEditMode(false);
    setEditingProductId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const requestData = {
      productCode: formData.productCode,
      name: formData.name,
      description: formData.description,
      categoryId: Number(formData.categoryId),
      brandId: formData.brandId === "" ? null : Number(formData.brandId),
      unitId: Number(formData.unitId),
      purchasePrice: Number(formData.purchasePrice),
      sellingPrice: Number(formData.sellingPrice),
      reorderLevel: Number(formData.reorderLevel),
    };

    try {
      if (editMode) {
        const response = await apiClient.put(
          `/products/${editingProductId}`,
          requestData
        );

        setProducts((prev) =>
          prev.map((p) => (p.id === editingProductId ? response.data : p))
        );

        setSuccess("Product updated successfully.");
      } else {
        const response = await apiClient.post("/products", requestData);

        setProducts((previousProducts) => [
          ...previousProducts,
          response.data,
        ]);

        setSuccess("Product created successfully.");
      }

      closeDialog();
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 400) {
        setError(
          requestError.response?.data?.message ||
            "Please check the entered product details."
        );
      } else if (status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (status === 403) {
        setError("You do not have permission to create products.");
      } else if (status === 404) {
        setError(
          requestError.response?.data?.message ||
            "The selected category, brand, or unit was not found."
        );
      } else if (status === 409) {
        setError(
          requestError.response?.data?.message ||
            "The product code already exists."
        );
      } else {
        setError("Unable to create the product.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate(id) {
    try {
      await apiClient.patch(`/products/${id}/activate`);

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active: true } : p))
      );

      setSuccess("Product activated successfully.");
    } catch {
      setError("Activation failed.");
    }
  }

  async function handleDeactivate(id) {
    try {
      await apiClient.delete(`/products/${id}`);

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active: false } : p))
      );

      setSuccess("Product deactivated successfully.");
    } catch {
      setError("Deactivation failed.");
    }
  }

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.productCode.toLowerCase().includes(term) ||
        (product.categoryName || "").toLowerCase().includes(term) ||
        (product.brandName || "").toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header — fixed height, never scrolls */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ flexShrink: 0, mb: 2.5 }}
      >
        <Box>
          <Typography variant="h4">Product Management</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Create and manage products sold by the hardware shop.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddRoundedIcon />}
          onClick={openCreateDialog}
          sx={{ flexShrink: 0, px: 2.5 }}
        >
          Add Product
        </Button>
      </Stack>

      {/* Table region — fills all remaining height and scrolls internally */}
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
        <Box
          sx={{
            flexShrink: 0,
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Search by code, name, category or brand"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ maxWidth: 420 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {loading ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <Table size="small" stickyHeader sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell align="right">Purchase Price</TableCell>
                  <TableCell align="right">Selling Price</TableCell>
                  <TableCell align="right">Reorder Level</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>{product.productCode}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.categoryName}</TableCell>
                    <TableCell>{product.brandName || "Generic"}</TableCell>
                    <TableCell>
                      {product.unitName} ({product.unitSymbol})
                    </TableCell>
                    <TableCell align="right">
                      Rs. {Number(product.purchasePrice).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      Rs. {Number(product.sellingPrice).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {product.reorderLevel}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.active ? "Active" : "Inactive"}
                        size="small"
                        color={product.active ? "success" : "default"}
                        variant={product.active ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(product)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {product.active ? (
                        <Tooltip title="Deactivate">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeactivate(product.id)}
                          >
                            <ToggleOnOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Activate">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleActivate(product.id)}
                          >
                            <ToggleOffOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        {searchTerm
                          ? "No products match your search."
                          : "No products found. Click \u201cAdd Product\u201d to create one."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create / edit dialog — keeps the form off the fixed-height page */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {editMode ? "Update Product" : "Create Product"}
          <IconButton onClick={closeDialog} size="small">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ maxHeight: "70vh" }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Product Code"
                  name="productCode"
                  value={formData.productCode}
                  onChange={handleChange}
                  placeholder="Example: CEM-TOK-001"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: Tokyo Super Cement 50 kg"
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Category"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Brand"
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                >
                  <MenuItem value="">Generic / No Brand</MenuItem>
                  {brands.map((brand) => (
                    <MenuItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Unit"
                  name="unitId"
                  value={formData.unitId}
                  onChange={handleChange}
                >
                  {units.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Purchase Price"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: "0.01" }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Selling Price"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: "0.01" }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Reorder Level"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: "0.001" }}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? (
                <CircularProgress size={22} />
              ) : editMode ? (
                "Save Changes"
              ) : (
                "Create Product"
              )}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Feedback — transient, never pushes the layout around */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={4000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProductManagementPage;