import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
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
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
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

// Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

import apiClient from "../api/apiClient";

// --- Helper Functions ---
function formatCurrency(amount) {
  return `LKR ${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatQuantity(qty) {
  return Number(qty || 0).toFixed(3);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleString("en-GB", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
  } catch {
    return dateStr;
  }
}

function getPaymentStatusChip(status) {
  switch (status) {
    case "PAID":
      return (
        <Chip
          label="PAID"
          size="small"
          color="success"
          sx={{ fontWeight: 600, fontSize: 11 }}
        />
      );
    case "PARTIALLY_PAID":
      return (
        <Chip
          label="PARTIALLY PAID"
          size="small"
          color="warning"
          sx={{ fontWeight: 600, fontSize: 11 }}
        />
      );
    case "UNPAID":
      return (
        <Chip
          label="UNPAID"
          size="small"
          color="error"
          sx={{ fontWeight: 600, fontSize: 11 }}
        />
      );
    default:
      return (
        <Chip
          label={status || "—"}
          size="small"
          variant="outlined"
          sx={{ fontSize: 11 }}
        />
      );
  }
}

function getOrderStatusChip(status) {
  switch (status) {
    case "COMPLETED":
      return (
        <Chip
          label="COMPLETED"
          size="small"
          color="success"
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: 11 }}
        />
      );
    case "CANCELLED":
      return (
        <Chip
          label="CANCELLED"
          size="small"
          color="error"
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: 11 }}
        />
      );
    default:
      return (
        <Chip
          label={status || "—"}
          size="small"
          variant="outlined"
          sx={{ fontSize: 11 }}
        />
      );
  }
}

function PurchaseManagementPage() {
  // Data list states
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Pagination states
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filter toolbar states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("ALL");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("ALL");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("ALL");

  // Master lookup data
  const [suppliersList, setSuppliersList] = useState([]);
  const [productsList, setProductsList] = useState([]);

  // Create Purchase Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderSupplier, setOrderSupplier] = useState(null);
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [orderInvoiceNumber, setOrderInvoiceNumber] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  // Line Items in Create Dialog
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemCost, setItemCost] = useState("");
  const [lineItemError, setLineItemError] = useState("");

  // Financial inputs in Create Dialog
  const [orderDiscount, setOrderDiscount] = useState("");
  const [orderTax, setOrderTax] = useState("");
  const [orderPaidAmount, setOrderPaidAmount] = useState("");
  const [formValidationError, setFormValidationError] = useState("");

  // View Details Modal State
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Cancel Confirmation Modal State
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [purchaseToCancel, setPurchaseToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Feedback Snackbar
  const [feedback, setFeedback] = useState(null); // { severity, message }

  // 1. Debounce Search Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 2. Fetch Master Lookups on Mount
  useEffect(() => {
    loadMasterLookups();
  }, []);

  async function loadMasterLookups() {
    try {
      const [suppliersRes, productsRes] = await Promise.all([
        apiClient.get("/suppliers?page=0&size=100"),
        apiClient
          .get("/products/pos-lookup")
          .catch(() => apiClient.get("/products")),
      ]);

      const suppData =
        suppliersRes.data?.content ||
        (Array.isArray(suppliersRes.data) ? suppliersRes.data : []);
      setSuppliersList(suppData);

      const prodData = Array.isArray(productsRes.data)
        ? productsRes.data
        : productsRes.data?.content || [];
      setProductsList(prodData);
    } catch (err) {
      console.error("Failed to load master lookups:", err);
    }
  }

  // 3. Load Purchases whenever filters or pagination change
  useEffect(() => {
    loadPurchases();
  }, [
    page,
    pageSize,
    debouncedSearchTerm,
    selectedSupplierId,
    selectedPaymentStatus,
    selectedOrderStatus,
  ]);

  async function loadPurchases() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(pageSize),
      });

      if (debouncedSearchTerm.trim()) {
        params.append("search", debouncedSearchTerm.trim());
      }
      if (selectedSupplierId !== "ALL") {
        params.append("supplierId", String(selectedSupplierId));
      }
      if (selectedPaymentStatus !== "ALL") {
        params.append("paymentStatus", selectedPaymentStatus);
      }
      if (selectedOrderStatus !== "ALL") {
        params.append("status", selectedOrderStatus);
      }

      const response = await apiClient.get(`/purchases?${params.toString()}`);
      const data = response.data;

      if (data && Array.isArray(data.content)) {
        setPurchases(data.content);
        setTotalElements(data.totalElements ?? data.content.length);
      } else if (Array.isArray(data)) {
        setPurchases(data);
        setTotalElements(data.length);
      } else {
        setPurchases([]);
        setTotalElements(0);
      }
    } catch (err) {
      console.error("Failed to load purchases:", err);
      setFeedback({
        severity: "error",
        message:
          err.response?.data?.message || "Failed to load purchase orders list.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Reset Filters Handler
  function handleResetFilters() {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSelectedSupplierId("ALL");
    setSelectedPaymentStatus("ALL");
    setSelectedOrderStatus("ALL");
    setPage(0);
  }

  // --- Create Order Calculations ---
  const calculatedSubtotal = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + item.lineTotal, 0);
  }, [orderItems]);

  const calculatedNetTotal = useMemo(() => {
    const disc = Number(orderDiscount) || 0;
    const tx = Number(orderTax) || 0;
    return Math.max(0, calculatedSubtotal - disc + tx);
  }, [calculatedSubtotal, orderDiscount, orderTax]);

  const calculatedBalanceDue = useMemo(() => {
    const paid = Number(orderPaidAmount) || 0;
    return Math.max(0, calculatedNetTotal - paid);
  }, [calculatedNetTotal, orderPaidAmount]);

  // Open Create Dialog
  function handleOpenCreateDialog() {
    setOrderSupplier(null);
    setOrderDate(new Date().toISOString().split("T")[0]);
    setOrderInvoiceNumber("");
    setOrderNotes("");
    setOrderItems([]);
    setSelectedProduct(null);
    setItemQuantity("");
    setItemCost("");
    setOrderDiscount("");
    setOrderTax("");
    setOrderPaidAmount("");
    setLineItemError("");
    setFormValidationError("");
    setCreateDialogOpen(true);
  }

  function handleCloseCreateDialog() {
    if (savingOrder) return;
    setCreateDialogOpen(false);
  }

  // Add Item to Dynamic List
  function handleAddLineItem() {
    setLineItemError("");

    if (!selectedProduct) {
      setLineItemError("Please select a product.");
      return;
    }

    const qty = Number(itemQuantity);
    if (!itemQuantity || isNaN(qty) || qty <= 0) {
      setLineItemError("Enter a valid quantity greater than zero.");
      return;
    }

    const cost = Number(itemCost);
    if (itemCost === "" || isNaN(cost) || cost < 0) {
      setLineItemError("Enter a valid purchase cost price (>= 0).");
      return;
    }

    // Check if product already exists in items list
    const existingIndex = orderItems.findIndex(
      (it) => it.product.id === selectedProduct.id
    );

    if (existingIndex >= 0) {
      setLineItemError(
        "Product is already added. Remove it first if you wish to adjust its quantity or cost."
      );
      return;
    }

    const newItem = {
      product: selectedProduct,
      quantity: qty,
      purchaseCost: cost,
      lineTotal: qty * cost,
    };

    setOrderItems((prev) => [...prev, newItem]);
    setSelectedProduct(null);
    setItemQuantity("");
    setItemCost("");
  }

  function handleRemoveLineItem(index) {
    setOrderItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  // Submit New Purchase
  async function handleSubmitPurchase(e) {
    e.preventDefault();
    setFormValidationError("");

    if (!orderSupplier) {
      setFormValidationError("Please select a supplier.");
      return;
    }

    if (!orderDate) {
      setFormValidationError("Please provide a valid purchase date.");
      return;
    }

    if (orderItems.length === 0) {
      setFormValidationError("Please add at least one line item to the order.");
      return;
    }

    const disc = Number(orderDiscount) || 0;
    if (disc < 0) {
      setFormValidationError("Discount cannot be negative.");
      return;
    }
    if (disc > calculatedSubtotal) {
      setFormValidationError("Discount cannot exceed the subtotal.");
      return;
    }

    const tx = Number(orderTax) || 0;
    if (tx < 0) {
      setFormValidationError("Tax cannot be negative.");
      return;
    }

    const paid = Number(orderPaidAmount) || 0;
    if (paid < 0) {
      setFormValidationError("Paid amount cannot be negative.");
      return;
    }
    if (paid > calculatedNetTotal) {
      setFormValidationError("Paid amount cannot exceed the net total.");
      return;
    }

    setSavingOrder(true);

    try {
      const payload = {
        supplierId: orderSupplier.id,
        purchaseDate: orderDate,
        supplierInvoiceNumber: orderInvoiceNumber.trim() || undefined,
        discount: disc,
        tax: tx,
        paidAmount: paid,
        notes: orderNotes.trim() || undefined,
        items: orderItems.map((item) => ({
          productId: item.product.id,
          quantity: Number(item.quantity),
          purchaseCost: Number(item.purchaseCost),
        })),
      };

      await apiClient.post("/purchases", payload);

      setFeedback({
        severity: "success",
        message: "Purchase order created & stock ingested successfully!",
      });

      setCreateDialogOpen(false);
      loadPurchases();
    } catch (err) {
      console.error("Failed to create purchase order:", err);
      setFormValidationError(
        err.response?.data?.message ||
          "Failed to create purchase order. Check backend details."
      );
    } finally {
      setSavingOrder(false);
    }
  }

  // --- View Details Dialog ---
  async function handleOpenViewDialog(purchase) {
    setSelectedPurchase(purchase);
    setViewDialogOpen(true);
    setLoadingDetails(true);

    try {
      const res = await apiClient.get(`/purchases/${purchase.id}`);
      setSelectedPurchase(res.data);
    } catch (err) {
      console.warn("Could not reload full details, using table data:", err);
    } finally {
      setLoadingDetails(false);
    }
  }

  // --- Cancel Purchase Dialog ---
  function handleOpenCancelDialog(purchase) {
    setPurchaseToCancel(purchase);
    setCancelReason("");
    setCancelDialogOpen(true);
  }

  async function handleConfirmCancel() {
    if (!purchaseToCancel) return;
    setCancelling(true);

    try {
      const params = new URLSearchParams();
      if (cancelReason.trim()) {
        params.append("reason", cancelReason.trim());
      }

      await apiClient.post(
        `/purchases/${purchaseToCancel.id}/cancel?${params.toString()}`
      );

      setFeedback({
        severity: "success",
        message: `Purchase #${purchaseToCancel.purchaseNumber} cancelled and inventory reversed.`,
      });

      setCancelDialogOpen(false);
      setPurchaseToCancel(null);
      loadPurchases();
    } catch (err) {
      console.error("Failed to cancel purchase:", err);
      setFeedback({
        severity: "error",
        message:
          err.response?.data?.message ||
          "Failed to cancel purchase. It may already be cancelled or processed.",
      });
    } finally {
      setCancelling(false);
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
      {/* 1. Header Section */}
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
                width: 40,
                height: 40,
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
              <Typography variant="h4">Purchase Orders (GRN)</Typography>
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ mt: 0.25 }}
              >
                Inbound Goods Received Notes, procurement history, and stock
                intake.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh purchase list">
            <span>
              <IconButton
                onClick={loadPurchases}
                disabled={loading}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <RefreshRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreateDialog}
            sx={{ px: 2.5 }}
          >
            New Purchase (GRN)
          </Button>
        </Stack>
      </Stack>

      {/* 2. Filter Toolbar */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 3,
          flexShrink: 0,
          bgcolor: "background.paper",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search by Purchase #, Inv #, or Supplier..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
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
          </Grid>

          {/* Supplier Dropdown */}
          <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="supplier-filter-label">Supplier</InputLabel>
              <Select
                labelId="supplier-filter-label"
                label="Supplier"
                value={selectedSupplierId}
                onChange={(e) => {
                  setSelectedSupplierId(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Suppliers</MenuItem>
                {suppliersList.map((sup) => (
                  <MenuItem key={sup.id} value={sup.id}>
                    {sup.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Payment Status Dropdown */}
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="payment-status-label">Payment</InputLabel>
              <Select
                labelId="payment-status-label"
                label="Payment"
                value={selectedPaymentStatus}
                onChange={(e) => {
                  setSelectedPaymentStatus(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Payments</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
                <MenuItem value="UNPAID">Unpaid</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Order Status Dropdown */}
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="order-status-label">Status</InputLabel>
              <Select
                labelId="order-status-label"
                label="Status"
                value={selectedOrderStatus}
                onChange={(e) => {
                  setSelectedOrderStatus(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Reset Filters */}
          <Grid size={{ xs: 12, md: 1.5 }}>
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              size="medium"
              onClick={handleResetFilters}
              startIcon={<FilterAltOutlinedIcon />}
              sx={{ height: 40 }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 3. Purchases Table Card */}
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
        {loading ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 280,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <Table size="small" stickyHeader sx={{ minWidth: 1050 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Purchase #</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Supplier</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Supplier Inv #</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Total (LKR)
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Paid (LKR)
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Balance (LKR)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, pr: 3 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {purchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                      <ReceiptLongOutlinedIcon
                        sx={{ fontSize: 50, color: "text.disabled", mb: 1 }}
                      />
                      <Typography color="text.secondary" variant="body1">
                        {searchTerm.trim() ||
                        selectedSupplierId !== "ALL" ||
                        selectedPaymentStatus !== "ALL" ||
                        selectedOrderStatus !== "ALL"
                          ? "No purchase orders match the selected filters."
                          : "No purchase orders recorded yet."}
                      </Typography>
                      <Button
                        variant="text"
                        color="secondary"
                        startIcon={<AddRoundedIcon />}
                        onClick={handleOpenCreateDialog}
                        sx={{ mt: 1 }}
                      >
                        Create your first GRN
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases.map((purchase) => {
                    const isCancelled = purchase.status === "CANCELLED";
                    const balance = Number(purchase.balanceDue || 0);

                    return (
                      <TableRow key={purchase.id} hover>
                        {/* Purchase # */}
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              color: isCancelled
                                ? "text.secondary"
                                : "primary.main",
                            }}
                          >
                            {purchase.purchaseNumber || `#${purchase.id}`}
                          </Typography>
                        </TableCell>

                        {/* Supplier */}
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              textDecoration: isCancelled
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {purchase.supplierName || "—"}
                          </Typography>
                          {purchase.supplierCode && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Code: {purchase.supplierCode}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Date */}
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(purchase.purchaseDate)}
                          </Typography>
                        </TableCell>

                        {/* Supplier Invoice # */}
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              color: purchase.supplierInvoiceNumber
                                ? "text.primary"
                                : "text.secondary",
                            }}
                          >
                            {purchase.supplierInvoiceNumber || "—"}
                          </Typography>
                        </TableCell>

                        {/* Total Amount */}
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {formatCurrency(purchase.totalAmount)}
                        </TableCell>

                        {/* Paid Amount */}
                        <TableCell
                          align="right"
                          sx={{ color: "success.main", fontWeight: 600 }}
                        >
                          {formatCurrency(purchase.paidAmount)}
                        </TableCell>

                        {/* Balance Due */}
                        <TableCell
                          align="right"
                          sx={{
                            color: balance > 0 ? "error.main" : "text.secondary",
                            fontWeight: balance > 0 ? 700 : 500,
                          }}
                        >
                          {formatCurrency(balance)}
                        </TableCell>

                        {/* Payment Status */}
                        <TableCell>
                          {getPaymentStatusChip(purchase.paymentStatus)}
                        </TableCell>

                        {/* Order Status */}
                        <TableCell>
                          {getOrderStatusChip(purchase.status)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right" sx={{ pr: 2 }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Tooltip title="View GRN Details">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenViewDialog(purchase)}
                              >
                                <VisibilityOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {!isCancelled ? (
                              <Tooltip title="Cancel Purchase (Reverse Inventory)">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleOpenCancelDialog(purchase)
                                  }
                                >
                                  <BlockOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Box sx={{ width: 32 }} />
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Table Pagination */}
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_e, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
          sx={{ borderTop: "1px solid", borderColor: "divider", flexShrink: 0 }}
        />
      </Paper>

      {/* =========================================================================
          4. CREATE PURCHASE / INBOUND GRN MODAL
         ========================================================================= */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: "92vh" },
        }}
      >
        <Box component="form" onSubmit={handleSubmitPurchase} noValidate>
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pb: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: 1.5,
                  bgcolor: "rgba(232,98,44,0.12)",
                  color: "secondary.main",
                  display: "flex",
                }}
              >
                <ReceiptLongOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="h6">
                  New Purchase Order / Inbound GRN
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Create procurement record and ingest physical stock into
                  inventory.
                </Typography>
              </Box>
            </Stack>

            <IconButton size="small" onClick={handleCloseCreateDialog}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 2.5, pb: 2 }}>
            {formValidationError && (
              <Alert severity="error" sx={{ mb: 2.5 }}>
                {formValidationError}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* LEFT COLUMN: Header details + Line Items entry & table */}
              <Grid size={{ xs: 12, md: 8 }}>
                {/* Header Info */}
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1.5, fontWeight: 700 }}
                >
                  1. Supplier & Invoice Details
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {/* Supplier Autocomplete */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      options={suppliersList.filter(
                        (s) => s.active !== false
                      )}
                      getOptionLabel={(option) =>
                        `${option.name} (${option.supplierCode || "No Code"})`
                      }
                      value={orderSupplier}
                      onChange={(_e, val) => setOrderSupplier(val)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          required
                          label="Select Supplier"
                          placeholder="Search active suppliers..."
                        />
                      )}
                    />
                  </Grid>

                  {/* Purchase Date */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      type="date"
                      fullWidth
                      required
                      label="Purchase Date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>

                  {/* Supplier Invoice Number */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Supplier Invoice #"
                      placeholder="e.g. INV-TOKYO-8910"
                      value={orderInvoiceNumber}
                      onChange={(e) => setOrderInvoiceNumber(e.target.value)}
                    />
                  </Grid>

                  {/* Delivery / Remarks */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Delivery Notes / Remarks"
                      placeholder="e.g. Main yard delivery"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 3 }} />

                {/* Line Item Entry Section */}
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1.5, fontWeight: 700 }}
                >
                  2. Add Line Items (Inbound Stock)
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: "grey.50" }}
                >
                  <Grid container spacing={1.5} alignItems="center">
                    {/* Product Autocomplete */}
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <Autocomplete
                        options={productsList}
                        getOptionLabel={(option) =>
                          `${option.name} [${option.productCode || "No Code"}]`
                        }
                        value={selectedProduct}
                        onChange={(_e, val) => {
                          setSelectedProduct(val);
                          // Auto populate default purchase price if available
                          if (val?.purchasePrice != null) {
                            setItemCost(String(val.purchasePrice));
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            label="Product"
                            placeholder="Select product..."
                          />
                        )}
                      />
                    </Grid>

                    {/* Quantity */}
                    <Grid size={{ xs: 6, sm: 2.5 }}>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        label="Quantity"
                        placeholder="50.000"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(e.target.value)}
                        slotProps={{
                          htmlInput: { min: 0.001, step: "any" },
                          input: {
                            endAdornment: selectedProduct?.unitName ? (
                              <InputAdornment position="end">
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {selectedProduct.unitName}
                                </Typography>
                              </InputAdornment>
                            ) : null,
                          },
                        }}
                      />
                    </Grid>

                    {/* Purchase Cost */}
                    <Grid size={{ xs: 6, sm: 2.5 }}>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        label="Cost (LKR)"
                        placeholder="2250.00"
                        value={itemCost}
                        onChange={(e) => setItemCost(e.target.value)}
                        slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                      />
                    </Grid>

                    {/* Add Button */}
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={handleAddLineItem}
                        startIcon={<AddRoundedIcon />}
                        sx={{ height: 40 }}
                      >
                        Add
                      </Button>
                    </Grid>
                  </Grid>

                  {lineItemError && (
                    <Typography
                      variant="caption"
                      color="error.main"
                      sx={{ display: "block", mt: 1, fontWeight: 500 }}
                    >
                      {lineItemError}
                    </Typography>
                  )}
                </Paper>

                {/* Line Items Table */}
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ borderRadius: 2, maxHeight: 260 }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Unit
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Quantity
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Cost (LKR)
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Line Total
                        </TableCell>
                        <TableCell align="center" sx={{ width: 48 }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderItems.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            align="center"
                            sx={{ py: 3, color: "text.secondary" }}
                          >
                            No products added yet. Select a product and click
                            "Add".
                          </TableCell>
                        </TableRow>
                      ) : (
                        orderItems.map((item, idx) => (
                          <TableRow key={item.product.id || idx} hover>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {item.product.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Code: {item.product.productCode || "—"}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={item.product.unitName || "UNIT"}
                                size="small"
                                sx={{ fontSize: 10, height: 20 }}
                              />
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontFamily: "monospace" }}
                            >
                              {formatQuantity(item.quantity)}
                            </TableCell>
                            <TableCell align="right">
                              {Number(item.purchaseCost).toFixed(2)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: 700 }}
                            >
                              {formatCurrency(item.lineTotal)}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveLineItem(idx)}
                              >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* RIGHT COLUMN: Financial Summary Card */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{ borderRadius: 2, height: "100%", bgcolor: "grey.50" }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 2, fontWeight: 700 }}
                    >
                      3. Financial Summary
                    </Typography>

                    <Stack spacing={2}>
                      {/* Subtotal */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2" color="text.secondary">
                          Subtotal ({orderItems.length} items):
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {formatCurrency(calculatedSubtotal)}
                        </Typography>
                      </Stack>

                      {/* Discount Input */}
                      <TextField
                        size="small"
                        type="number"
                        fullWidth
                        label="Order Discount (LKR)"
                        placeholder="0.00"
                        value={orderDiscount}
                        onChange={(e) => setOrderDiscount(e.target.value)}
                        slotProps={{
                          htmlInput: {
                            min: 0,
                            max: calculatedSubtotal,
                            step: "0.01",
                          },
                        }}
                      />

                      {/* Tax Input */}
                      <TextField
                        size="small"
                        type="number"
                        fullWidth
                        label="Tax / Shipping (LKR)"
                        placeholder="0.00"
                        value={orderTax}
                        onChange={(e) => setOrderTax(e.target.value)}
                        slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                      />

                      <Divider />

                      {/* Net Total Amount */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700 }}
                        >
                          Net Total Amount:
                        </Typography>
                        <Typography
                          variant="h6"
                          color="secondary.main"
                          sx={{ fontWeight: 800 }}
                        >
                          {formatCurrency(calculatedNetTotal)}
                        </Typography>
                      </Stack>

                      {/* Initial Paid Amount */}
                      <TextField
                        size="small"
                        type="number"
                        fullWidth
                        label="Initial Paid Amount (LKR)"
                        placeholder="0.00"
                        value={orderPaidAmount}
                        onChange={(e) => setOrderPaidAmount(e.target.value)}
                        slotProps={{
                          htmlInput: {
                            min: 0,
                            max: calculatedNetTotal,
                            step: "0.01",
                          },
                        }}
                        helperText="Enter initial advance payment or 0 if fully unpaid."
                      />

                      {/* Balance Due Display */}
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor:
                            calculatedBalanceDue > 0
                              ? "rgba(198,57,44,0.08)"
                              : "rgba(46,125,70,0.08)",
                          border: "1px solid",
                          borderColor:
                            calculatedBalanceDue > 0
                              ? "error.light"
                              : "success.light",
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600 }}
                          >
                            Estimated Balance Due:
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color:
                                calculatedBalanceDue > 0
                                  ? "error.main"
                                  : "success.main",
                            }}
                          >
                            {formatCurrency(calculatedBalanceDue)}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Button
              onClick={handleCloseCreateDialog}
              color="inherit"
              disabled={savingOrder}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={savingOrder || orderItems.length === 0}
              startIcon={
                savingOrder ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <CheckCircleOutlineRoundedIcon />
                )
              }
              sx={{ px: 3 }}
            >
              {savingOrder ? "Ingesting Stock..." : "Confirm & Ingest Stock"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* =========================================================================
          5. VIEW INVOICE & DETAILS MODAL
         ========================================================================= */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h6">Goods Received Note</Typography>
            {selectedPurchase && (
              <Chip
                label={
                  selectedPurchase.purchaseNumber || `#${selectedPurchase.id}`
                }
                size="small"
                color="primary"
                sx={{ fontFamily: "monospace", fontWeight: 700 }}
              />
            )}
          </Stack>
          <IconButton size="small" onClick={() => setViewDialogOpen(false)}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5, pb: 2 }}>
          {loadingDetails ? (
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : selectedPurchase ? (
            <Stack spacing={3}>
              {/* Top metadata grid */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Purchase Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDate(selectedPurchase.purchaseDate)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Supplier Inv #
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, fontFamily: "monospace" }}
                  >
                    {selectedPurchase.supplierInvoiceNumber || "—"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Order Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {getOrderStatusChip(selectedPurchase.status)}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Payment Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {getPaymentStatusChip(selectedPurchase.paymentStatus)}
                  </Box>
                </Grid>
              </Grid>

              {/* Supplier Info Banner */}
              <Paper
                variant="outlined"
                sx={{ p: 2, borderRadius: 2, bgcolor: "grey.50" }}
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Supplier
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {selectedPurchase.supplierName || "—"}
                    </Typography>
                    {selectedPurchase.supplierCode && (
                      <Typography variant="caption" color="text.secondary">
                        Code: {selectedPurchase.supplierCode}
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Created By
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedPurchase.createdByUsername || "System Admin"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Recorded on {formatDateTime(selectedPurchase.createdAt)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Line items table */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Items Received:
                </Typography>
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Unit
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Quantity
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Unit Cost
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Line Total
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPurchase.items &&
                      selectedPurchase.items.length > 0 ? (
                        selectedPurchase.items.map((item, idx) => (
                          <TableRow key={item.id || idx}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {item.productName || "Product"}
                              </Typography>
                              {item.productCode && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {item.productCode}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {item.unitName || "UNIT"}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontFamily: "monospace" }}
                            >
                              {formatQuantity(item.quantity)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.purchaseCost)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: 700 }}
                            >
                              {formatCurrency(item.lineTotal)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            align="center"
                            sx={{ py: 2, color: "text.secondary" }}
                          >
                            No line items recorded.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Financial summary breakdown */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, minWidth: 320, borderRadius: 2 }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Subtotal:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(selectedPurchase.subtotal)}
                      </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Discount:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        - {formatCurrency(selectedPurchase.discount)}
                      </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Tax / Fees:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        + {formatCurrency(selectedPurchase.tax)}
                      </Typography>
                    </Stack>

                    <Divider sx={{ my: 0.5 }} />

                    <Stack direction="row" justifyContent="space-between">
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700 }}
                      >
                        Total Amount:
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 800, color: "secondary.main" }}
                      >
                        {formatCurrency(selectedPurchase.totalAmount)}
                      </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography
                        variant="body2"
                        sx={{ color: "success.main", fontWeight: 600 }}
                      >
                        Paid Amount:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "success.main", fontWeight: 700 }}
                      >
                        {formatCurrency(selectedPurchase.paidAmount)}
                      </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            selectedPurchase.balanceDue > 0
                              ? "error.main"
                              : "text.secondary",
                          fontWeight: 600,
                        }}
                      >
                        Balance Due:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            selectedPurchase.balanceDue > 0
                              ? "error.main"
                              : "text.secondary",
                          fontWeight: 700,
                        }}
                      >
                        {formatCurrency(selectedPurchase.balanceDue)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Box>

              {/* Delivery remarks */}
              {selectedPurchase.notes && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    Notes / Remarks:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: "grey.50",
                      fontStyle: "italic",
                    }}
                  >
                    {selectedPurchase.notes}
                  </Typography>
                </Box>
              )}
            </Stack>
          ) : null}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            startIcon={<PrintOutlinedIcon />}
            variant="outlined"
            onClick={() => window.print()}
          >
            Print GRN
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setViewDialogOpen(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* =========================================================================
          6. CANCEL PURCHASE CONFIRMATION MODAL
         ========================================================================= */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => !cancelling && setCancelDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <WarningAmberRoundedIcon color="error" />
            <Typography variant="h6">Cancel Purchase Order?</Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to cancel{" "}
            <strong>
              {purchaseToCancel?.purchaseNumber ||
                `#${purchaseToCancel?.id || ""}`}
            </strong>
            ?
          </Typography>

          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Inventory Reversal Warning:</strong> Cancelling will
            automatically reduce and reverse the physical quantities received in
            this order from your warehouse.
          </Alert>

          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            label="Cancellation Reason (Optional)"
            placeholder="e.g. Returned goods, invoice entered incorrectly..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            color="inherit"
            disabled={cancelling}
          >
            Back
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disabled={cancelling}
            startIcon={
              cancelling && <CircularProgress size={18} color="inherit" />
            }
          >
            {cancelling ? "Reversing..." : "Void & Reverse Inventory"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =========================================================================
          7. SNACKBAR FEEDBACK
         ========================================================================= */}
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

export default PurchaseManagementPage;