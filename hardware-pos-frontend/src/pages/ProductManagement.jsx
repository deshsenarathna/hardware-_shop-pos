import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
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
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);

  const [formData, setFormData] = useState(initialFormData);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      setCategories(
        categoriesResponse.data.filter(
          (category) => category.active
        )
      );

      setBrands(
        brandsResponse.data.filter(
          (brand) => brand.active
        )
      );

      setUnits(
        unitsResponse.data.filter(
          (unit) => unit.active
        )
      );
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (status === 403) {
        setError(
          "You do not have permission to manage products."
        );
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
      brandId:
        formData.brandId === ""
          ? null
          : Number(formData.brandId),
      unitId: Number(formData.unitId),
      purchasePrice: Number(formData.purchasePrice),
      sellingPrice: Number(formData.sellingPrice),
      reorderLevel: Number(formData.reorderLevel),
    };

    try {

      if(editMode)
      {
        const response = await apiClient.put(
          `/products/${editingProductId}`,
          requestData
        )

        setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProductId ? response.data : p
        )
      );

      setSuccess("Product updated successfully.");
      setEditMode(false);
      setEditingProductId(null);

      }else {

         const response = await apiClient.post(
        "/products",
        requestData
      );

      setProducts((previousProducts) => [
        ...previousProducts,
        response.data,
      ]);

      setSuccess("Product created successfully.");

      }

      setFormData(initialFormData);

    } catch 
    (requestError) {
      const status = requestError.response?.status;

      if (status === 400) {
        setError(
          requestError.response?.data?.message ||
            "Please check the entered product details."
        );
      } else if (status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (status === 403) {
        setError(
          "You do not have permission to create products."
        );
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

  //edit the product

  function handleEdit(product) {
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
}




async function handleActivate(id) {
  try {
    await apiClient.patch(`/products/${id}/activate`);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, active: true } : p
      )
    );

    setSuccess("Product activated successfully.");
  } catch (error) {
    setError("Activation failed.");
  }
}

async function handleDeactivate(id) {
  try {
    await apiClient.delete(`/products/${id}`);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, active: false } : p
      )
    );

    setSuccess("Product deactivated successfully.");
  } catch (error) {
    setError("Deactivation failed.");
  }
}

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/dashboard")}
          sx={{ mb: 3 }}
        >
          Back to Dashboard
        </Button>

        <Typography variant="h4" gutterBottom>
          Product Management
        </Typography>

        <Typography sx={{ mb: 3 }}>
          Create and view products sold by the hardware shop.
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
              lg: "1fr 1.7fr",
            },
            gap: 3,
          }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create Product
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                required
                label="Product Code"
                name="productCode"
                value={formData.productCode}
                onChange={handleChange}
                margin="normal"
                placeholder="Example: CEM-TOK-001"
              />

              <TextField
                fullWidth
                required
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                placeholder="Example: Tokyo Super Cement 50 kg"
              />

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                select
                fullWidth
                required
                label="Category"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                margin="normal"
              >
                {categories.map((category) => (
                  <MenuItem
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Brand"
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                margin="normal"
                helperText="Leave as Generic for products without a brand"
              >
                <MenuItem value="">
                  Generic / No Brand
                </MenuItem>

                {brands.map((brand) => (
                  <MenuItem
                    key={brand.id}
                    value={brand.id}
                  >
                    {brand.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                required
                label="Measurement Unit"
                name="unitId"
                value={formData.unitId}
                onChange={handleChange}
                margin="normal"
              >
                {units.map((unit) => (
                  <MenuItem
                    key={unit.id}
                    value={unit.id}
                  >
                    {unit.name} ({unit.symbol})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                required
                type="number"
                label="Purchase Price"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                margin="normal"
                inputProps={{
                  min: 0,
                  step: "0.01",
                }}
              />

              <TextField
                fullWidth
                required
                type="number"
                label="Selling Price"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                margin="normal"
                inputProps={{
                  min: 0,
                  step: "0.01",
                }}
              />

              <TextField
                fullWidth
                required
                type="number"
                label="Reorder Level"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleChange}
                margin="normal"
                inputProps={{
                  min: 0,
                  step: "0.001",
                }}
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
                  editMode ? "Update Product" : "Create Product"
                )}
              </Button>

              <Button
                  onClick={() => {
                    setFormData(initialFormData);
                    setEditMode(false);
                    setEditingProductId(null);
                     }}
                   >
                   Clear
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Products
            </Typography>

            {loading ? (
              <CircularProgress />
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Brand</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell align="right">
                        Purchase Price
                      </TableCell>
                      <TableCell align="right">
                        Selling Price
                      </TableCell>
                      <TableCell align="right">
                        Reorder Level
                      </TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.productCode}
                        </TableCell>

                        <TableCell>
                          {product.name}
                        </TableCell>

                        <TableCell>
                          {product.categoryName}
                        </TableCell>

                        <TableCell>
                          {product.brandName || "Generic"}
                        </TableCell>

                        <TableCell>
                          {product.unitName} (
                          {product.unitSymbol})
                        </TableCell>

                        <TableCell align="right">
                          Rs.{" "}
                          {Number(
                            product.purchasePrice
                          ).toFixed(2)}
                        </TableCell>

                        <TableCell align="right">
                          Rs.{" "}
                          {Number(
                            product.sellingPrice
                          ).toFixed(2)}
                        </TableCell>

                        <TableCell align="right">
                          {product.reorderLevel}
                        </TableCell>

                        <TableCell>
                          {product.active
                            ? "Active"
                            : "Inactive"}
                        </TableCell>

                        <TableCell>
                             <Button
                                 size="small"
                                 variant="outlined"
                                 onClick={() => handleEdit(product)}
                                 sx={{ mr: 1 }}
                                                    >
                                 Edit
                             </Button>

{product.active ? (
  <Button
    color="error"
    onClick={() => handleDeactivate(product.id)}
  >
    Deactivate
  </Button>
) : (
  <Button
    color="success"
    onClick={() => handleActivate(product.id)}
  >
    Activate
  </Button>
)}
  
                        </TableCell>

                      </TableRow>
                    ))}

                    {products.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          align="center"
                        >
                          No products found.
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

export default ProductManagementPage;

