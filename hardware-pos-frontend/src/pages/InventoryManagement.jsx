
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
  Tab,
  Tabs,
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

// Inventory summary card
function StatCard({ label, value, color = "default" }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 3,
        borderColor:
          color === "warning" ? "warning.light" : "divider",
      }}
    >
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mt: 1,
            fontWeight: 700,
            color:
              color === "warning"
                ? "warning.main"
                : "text.primary",
            overflowWrap: "anywhere",
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function InventoryManagementPage() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Load inventory whenever the search, status, or page changes.
  useEffect(() => {
    loadInventory();
  }, [page, size, statusFilter, debouncedSearch]);

  // load matrics data separately to avoid unnecessary re-rendering of the table when metrics change
  useEffect(() => {
    loadInventoryMatrics(); 
  }, []);

  // debounce search input to avoid excessive API calls
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 1000);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  async function loadInventoryMatrics() {
    try {
      const metricsResponse = await apiClient.get("/inventory/metrics");
      setMetrics(metricsResponse.data);
    } catch (error) {
      console.error("Failed to load inventory metrics:", error);
    }
  }

  async function loadInventory() {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        status: statusFilter,
        search: debouncedSearch,
      });

      const [inventoryResponse, metricsResponse] = await Promise.all([
        apiClient.get(`/inventory?${params.toString()}`),
        //apiClient.get("/inventory/metrics"),
      ]);

      const inventoryData = inventoryResponse.data;

      // Support a paginated response or a plain array.
      const items = Array.isArray(inventoryData)
        ? inventoryData
        : inventoryData?.content ?? [];

      setInventoryItems(items);

      /* setTotalElements(
        Array.isArray(inventoryData)
          ? inventoryData.length
          : inventoryData?.totalElements ?? items.length
      ); */

      //setMetrics(metricsResponse.data);
    } catch (error) {
      console.error("Failed to load inventory:", error);

      setFeedback({
        severity: "error",
        message: "Failed to load inventory.",
      });
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

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const quantity = Number(formData.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFeedback({
        severity: "error",
        message: "Enter a quantity greater than zero.",
      });
      return;
    }

    if (!activeProduct) {
      setFeedback({
        severity: "error",
        message: "Please select a product.",
      });
      return;
    }

    setSaving(true);

    try {
      const productId =
        activeProduct.productId ??
        activeProduct.product?.id ??
        activeProduct.id;

      await apiClient.post("/inventory/add-stock", {
        productId,
        quantity,
        notes: formData.notes,
      });

      closeDialog();

      setFeedback({
        severity: "success",
        message: "Stock added successfully.",
      });

      // Refresh the table and summary metrics after adding stock.
      await loadInventory();
    } catch (error) {
      console.error("Failed to add stock:", error);

      const status = error.response?.status;

      if (status === 400) {
        setFeedback({
          severity: "error",
          message:
            error.response?.data?.message ||
            "Please check the entered quantity.",
        });
      } else if (status === 403) {
        setFeedback({
          severity: "error",
          message: "You do not have permission to add stock.",
        });
      } else {
        setFeedback({
          severity: "error",
          message:
            error.response?.data?.message ||
            "Unable to add stock.",
        });
      }
    } finally {
      setSaving(false);
    }
  }

  // Normalize inventory responses for the table.
  // Supports inventory entries containing a nested product or flat fields.
  const rows = useMemo(() => {
    return inventoryItems
      .map((item) => {
        const product = item.product ?? item;

        const productId =
          item.productId ?? product.id ?? item.id;

        const quantityOnHand = Number(
          item.quantityOnHand ??
            item.stock?.quantityOnHand ??
            0
        );

        const reorderLevel = Number(
          item.reorderLevel ??
            product.reorderLevel ??
            0
        );

        return {
          product: {
            ...product,
            id: productId,
            name:
              item.productName ??
              product.name ??
              "Unnamed product",
            productCode:
              item.productCode ??
              product.productCode ??
              "—",
            location:
              item.location ??
              product.location ??
              "",
          },
          quantityOnHand,
          reorderLevel,
        };
      })
      .filter(({ product, quantityOnHand, reorderLevel }) => {
        // Apply local status filtering as well.
        if (
          statusFilter === "LOW_STOCK" &&
          (quantityOnHand <= 0 ||
            quantityOnHand > reorderLevel)
        ) {
          return false;
        }

        if (
          statusFilter === "OUT_OF_STOCK" &&
          quantityOnHand > 0
        ) {
          return false;
        }

        // Apply local search filtering.
        const term = searchTerm.trim().toLowerCase();

        return (
          !term ||
          product.name.toLowerCase().includes(term) ||
          product.productCode.toLowerCase().includes(term)
        );
      });
  }, [inventoryItems, statusFilter, searchTerm]);

  const lowStockCount = Number(metrics?.lowStockCount ?? 0);

  const totalStockUnits = Number(
    metrics?.totalStockUnits ?? 0
  );

  const totalInventoryValuation = Number(
    metrics?.totalInventoryValuation ?? 0
  );

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Page header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ flexShrink: 0, mb: 2.5 }}
      >
        <Box>
          <Typography variant="h4">
            Inventory
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Track stock levels and restock products as they run low.
          </Typography>
        </Box>

        {lowStockCount > 0 && (
          <Chip
            icon={<WarningAmberRoundedIcon />}
            label={`${lowStockCount} low-stock product${
              lowStockCount === 1 ? "" : "s"
            }`}
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Stack>

      {/* Inventory summary cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 2.5,
          flexShrink: 0,
        }}
      >
        <StatCard
          label="Total Stock Units"
          value={totalStockUnits.toLocaleString()}
        />

        <StatCard
          label="Low Stock Alerts"
          value={lowStockCount.toLocaleString()}
          color="warning"
        />

        <StatCard
          label="Inventory Valuation"
          value={`Rs. ${totalInventoryValuation.toLocaleString()}`}
        />
      </Box>

      {/* Inventory table and filters */}
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
        {/* Search field and status tabs */}
        <Box
          sx={{
            flexShrink: 0,
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <TextField
              size="small"
              placeholder="Search by code or name"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(0);
              }}
              sx={{
                maxWidth: 420,
                width: "100%",
              }}
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

            <Tabs
              value={statusFilter}
              onChange={(event, value) => {
                setStatusFilter(value);
                setPage(0);
              }}
              variant="scrollable"
              allowScrollButtonsMobile
              aria-label="Inventory stock status"
            >
              <Tab
                label="All Items"
                value="ALL"
              />

              <Tab
                label="Low Stock"
                value="LOW_STOCK"
              />

              <Tab
                label="Out of Stock"
                value="OUT_OF_STOCK"
              />
            </Tabs>
          </Stack>
        </Box>

        {/* Inventory table */}
        {loading ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 180,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
            }}
          >
            <Table
              size="small"
              stickyHeader
              sx={{ minWidth: 820 }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">
                    Quantity on Hand
                  </TableCell>
                  <TableCell align="right">
                    Reorder Level
                  </TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map(
                  ({
                    product,
                    quantityOnHand,
                    reorderLevel,
                  }) => {
                    const isOutOfStock =
                      quantityOnHand <= 0;

                    const isLow =
                      !isOutOfStock &&
                      quantityOnHand <= reorderLevel;

                    return (
                      <TableRow
                        key={product.id}
                        hover
                      >
                        <TableCell>
                          {product.productCode}
                        </TableCell>

                        <TableCell>
                          {product.name}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{ fontWeight: 600 }}
                        >
                          {quantityOnHand.toLocaleString()}
                        </TableCell>

                        <TableCell align="right">
                          {reorderLevel.toLocaleString()}
                        </TableCell>

                        <TableCell>
                          {product.location || "—"}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              isOutOfStock
                                ? "Out of stock"
                                : isLow
                                  ? "Low stock"
                                  : "In stock"
                            }
                            size="small"
                            color={
                              isOutOfStock || isLow
                                ? "error"
                                : "success"
                            }
                            variant={
                              isOutOfStock || isLow
                                ? "filled"
                                : "outlined"
                            }
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<AddRoundedIcon />}
                            onClick={() =>
                              openAddStockDialog(product)
                            }
                          >
                            Add Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 5 }}
                    >
                      <Typography color="text.secondary">
                        {searchTerm
                          ? "No products match your search."
                          : statusFilter === "LOW_STOCK"
                            ? "No low-stock products found."
                            : statusFilter === "OUT_OF_STOCK"
                              ? "No out-of-stock products found."
                              : "No inventory items found."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination information */}
        {!loading && totalElements > 0 && (
          <Box
            sx={{
              p: 1.5,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Showing {rows.length} item(s) on this page
              {" · "}
              {totalElements} total matching item(s)
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Add stock dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Add Stock

          <IconButton
            onClick={closeDialog}
            size="small"
            aria-label="Close dialog"
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Box
          component="form"
          onSubmit={handleSubmit}
        >
          <DialogContent dividers>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2">
                  {activeProduct?.name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {activeProduct?.productCode}
                </Typography>

                {activeProduct?.location && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
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
                slotProps={{
                  htmlInput: {
                    min: 0.001,
                    step: 0.001,
                  },
                }}
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
            <Button
              onClick={closeDialog}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={saving}
            >
              {saving ? (
                <CircularProgress size={22} />
              ) : (
                "Add Stock"
              )}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Success and error messages */}
      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={4000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        {feedback ? (
          <Alert
            severity={feedback.severity}
            onClose={() => setFeedback(null)}
          >
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

export default InventoryManagementPage;
