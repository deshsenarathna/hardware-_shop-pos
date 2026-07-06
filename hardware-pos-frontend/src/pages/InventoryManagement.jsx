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
  IconButton,
  InputAdornment,
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
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import apiClient from "../api/apiClient";

const initialFormData = {
  quantity: "",
  notes: "",
};

function InventoryManagementPage() {
  const [products, setProducts] = useState([]);
  const [stockByProductId, setStockByProductId] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { severity, message }

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    setLoading(true);

    try {
      const [productsResponse, stockResponse] = await Promise.all([
        apiClient.get("/products"),
        apiClient.get("/inventory/stock"),
      ]);

      setProducts(productsResponse.data.filter((p) => p.active));

      const stockMap = {};
      stockResponse.data.forEach((stock) => {
        stockMap[stock.productId] = stock;
      });
      setStockByProductId(stockMap);
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 401) {
        setFeedback({ severity: "error", message: "Your login session is invalid or expired." });
      } else if (status === 403) {
        setFeedback({ severity: "error", message: "You do not have permission to view inventory." });
      } else {
        setFeedback({ severity: "error", message: "Unable to load inventory information." });
      }
    } finally {
      setLoading(false);
    }
  }

  function openAddStockDialog(product) {
    setActiveProduct(product);
    setFormData(initialFormData);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setActiveProduct(null);
    setFormData(initialFormData);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await apiClient.post("/inventory/add-stock", {
        productId: activeProduct.id,
        quantity: Number(formData.quantity),
        notes: formData.notes,
      });

      setStockByProductId((prev) => ({
        ...prev,
        [response.data.productId]: response.data,
      }));

      setFeedback({ severity: "success", message: "Stock added successfully." });
      closeDialog();
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 400) {
        setFeedback({
          severity: "error",
          message: requestError.response?.data?.message || "Please check the entered quantity.",
        });
      } else if (status === 403) {
        setFeedback({ severity: "error", message: "You do not have permission to add stock." });
      } else {
        setFeedback({ severity: "error", message: "Unable to add stock." });
      }
    } finally {
      setSaving(false);
    }
  }

  const rows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return products
      .map((product) => {
        const stock = stockByProductId[product.id];
        return {
          product,
          quantityOnHand: stock ? Number(stock.quantityOnHand) : 0,
          reorderLevel: Number(product.reorderLevel ?? 0),
        };
      })
      .filter(
        (row) =>
          !term ||
          row.product.name.toLowerCase().includes(term) ||
          row.product.productCode.toLowerCase().includes(term)
      );
  }, [products, stockByProductId, searchTerm]);

  const lowStockCount = rows.filter((r) => r.quantityOnHand <= r.reorderLevel).length;

  return (
    <Box sx={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      {/* Header — fixed height */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ flexShrink: 0, mb: 2.5 }}
      >
        <Box>
          <Typography variant="h4">Inventory</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Track stock levels and restock products as they run low.
          </Typography>
        </Box>

        {lowStockCount > 0 && (
          <Chip
            icon={<WarningAmberRoundedIcon />}
            label={`${lowStockCount} product${lowStockCount === 1 ? "" : "s"} at or below reorder level`}
            color="error"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Stack>

      {/* Table region — fills remaining height, scrolls internally */}
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
        <Box sx={{ flexShrink: 0, p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search by code or name"
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
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <Table size="small" stickyHeader sx={{ minWidth: 820 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Quantity on Hand</TableCell>
                  <TableCell align="right">Reorder Level</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map(({ product, quantityOnHand, reorderLevel }) => {
                  const isLow = quantityOnHand <= reorderLevel;

                  return (
                    <TableRow key={product.id} hover>
                      <TableCell>{product.productCode}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {quantityOnHand}
                      </TableCell>
                      <TableCell align="right">{reorderLevel}</TableCell>
                      <TableCell>{product.location || "—"}</TableCell>
                      <TableCell>
                        <Chip
                          label={isLow ? "Low stock" : "In stock"}
                          size="small"
                          color={isLow ? "error" : "success"}
                          variant={isLow ? "filled" : "outlined"}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AddRoundedIcon />}
                          onClick={() => openAddStockDialog(product)}
                        >
                          Add Stock
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        {searchTerm ? "No products match your search." : "No active products found."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add stock dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Add Stock
          <IconButton onClick={closeDialog} size="small">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2">{activeProduct?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeProduct?.productCode} · Currently{" "}
                  {activeProduct ? stockByProductId[activeProduct.id]?.quantityOnHand ?? 0 : 0} on hand
                </Typography>
                {activeProduct?.location && (
                  <Typography variant="body2" color="text.secondary">
                    Location: {activeProduct.location}
                  </Typography>
                )}
              </Box>

              <TextField
                fullWidth
                required
                autoFocus
                type="number"
                label="Quantity to add"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                inputProps={{ min: 0.001, step: "0.001" }}
              />

              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Notes (optional)"
                name="notes"
                placeholder="Example: Received from supplier invoice #1042"
                value={formData.notes}
                onChange={handleChange}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="secondary" disabled={saving}>
              {saving ? <CircularProgress size={22} /> : "Add Stock"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={4000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

export default InventoryManagementPage;