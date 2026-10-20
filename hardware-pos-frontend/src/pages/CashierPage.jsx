import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
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
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";

import apiClient from "../api/apiClient";

const PAYMENT_METHODS = [
  { id: "CASH", label: "Cash", icon: PaymentsOutlinedIcon },
  { id: "CARD", label: "Card", icon: CreditCardOutlinedIcon },
  { id: "OTHER", label: "Other", icon: MoreHorizOutlinedIcon },
];

function money(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`;
}

function CashierPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const [barcode, setBarcode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Checkout modal state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [modalPaymentReceived, setModalPaymentReceived] = useState("");
  const [modalPaymentMethod, setModalPaymentMethod] = useState("CASH");
  const [submitting, setSubmitting] = useState(false);

  const [feedback, setFeedback] = useState(null); // { severity, message }

  const barcodeRef = useRef(null);
  const paymentInputRef = useRef(null);
  const checkoutOpenRef = useRef(false);
  const cartRef = useRef([]);

  useEffect(() => {
    checkoutOpenRef.current = checkoutOpen;
  }, [checkoutOpen]);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  useEffect(() => {

    console.log("Product fetching effect executed");
    loadProducts();

    return () => {
    console.log("CashierPage effect cleanup");
  };
  }, []);

  // When checkout popup opens, focus and auto-select the payment input
  useEffect(() => {
    if (checkoutOpen) {
      setTimeout(() => {
        paymentInputRef.current?.focus();
        paymentInputRef.current?.select();
      }, 50);
    }
  }, [checkoutOpen]);

  // Global keydown listener: Enter triggers checkout modal when ready
  useEffect(() => {
    function handleGlobalKeyDown(e) {
      if (e.key !== "Enter") return;

      // If modal is open, modal's own onKeyDown handles Enter to create sale
      if (checkoutOpenRef.current) return;

      const activeEl = document.activeElement;
      const tag = activeEl?.tagName;

      // Ignore if user is pressing Enter on a button/link
      if (tag === "BUTTON" || tag === "A" || e.repeat) return;

      // If typing in search box, don't trigger checkout
      if (activeEl?.name === "searchQuery") return;

      // If barcode input has text, user is pressing Enter to scan product
      if (activeEl?.getAttribute("data-barcode") === "true" && activeEl.value?.trim()) {
        return;
      }

      // If cart has items and barcode is empty or user is not typing another code
      if (cartRef.current.length > 0) {
        e.preventDefault();
        openCheckoutModal();
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  async function loadProducts() {
  try {
    const res = await apiClient.get("/products/pos-lookup");
    // Directly set the array (already filtered for active products by the backend)
    const productList = Array.isArray(res.data) ? res.data : (res.data.content || []);
    setProducts(productList);
  } catch (error) {
    setFeedback({
      severity: "error",
      message: "Could not load products from server.",
    });
  }
}

  function addToCart(product) {
    const existing = cart.find((c) => c.id === product.id);

    if (existing) {
      increaseQty(existing.id);
      return;
    }

    setCart([
      ...cart,
      {
        id: product.id,
        name: product.name,
        orgPrice: product.purchasePrice,
        price: product.sellingPrice,
        quantity: 1,
        discount: 0,
      },
    ]);
  }

  function increaseQty(productId) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function decreaseQty(productId) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  }

  function removeItem(productId) {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }

  function calculateSubtotal(items = cart) {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function calculateTotal(items = cart) {
    return calculateSubtotal(items);
  }

  function handleBarcodeConfirm() {
    if (!barcode.trim()) return;

    const product = products.find(
      (p) =>
        p.id.toString() === barcode.trim() ||
        (p.productCode || "").toLowerCase() === barcode.trim().toLowerCase()
    );

    if (product) {
      addToCart(product);
      setBarcode("");
    } else {
      setFeedback({ severity: "error", message: "Product not found for that code." });
    }
  }

  function openCheckoutModal() {
    const currentCart = cartRef.current;
    if (!currentCart || currentCart.length === 0) {
      setFeedback({ severity: "error", message: "Cart is empty." });
      return;
    }
    const currentTotal = calculateTotal(currentCart);
    setModalPaymentReceived(currentTotal.toFixed(2));
    setModalPaymentMethod("CASH");
    setCheckoutOpen(true);
  }

  function closeCheckoutModal() {
    setCheckoutOpen(false);
    setTimeout(() => {
      barcodeRef.current?.focus();
    }, 100);
  }

  async function handleConfirmSale() {
    const currentCart = cartRef.current;
    if (!currentCart || currentCart.length === 0) {
      setFeedback({ severity: "error", message: "Cart is empty." });
      return;
    }

    const currentTotal = calculateTotal(currentCart);
    const received = Number(modalPaymentReceived);

    if (isNaN(received) || received < currentTotal) {
      setFeedback({
        severity: "error",
        message: `Payment received must be at least ${money(currentTotal)}.`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: currentCart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        paymentMethod: modalPaymentMethod,
        paymentReceived: received,
        discount: 0,
        tax: 0,
      };

      const res = await apiClient.post("/sales", payload);
      setFeedback({
        severity: "success",
        message: `Sale completed! Invoice: ${res.data.invoiceNumber || "Success"}`,
      });
      setCheckoutOpen(false);
      clearCart();
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || err?.message || "Sale could not be completed";
      setFeedback({ severity: "error", message: errorMsg });
    } finally {
      setSubmitting(false);
    }
  }

  function clearCart() {
    setCart([]);
    setBarcode("");
    setSearchQuery("");
    setTimeout(() => {
      barcodeRef.current?.focus();
    }, 100);
  }

  function handlePrint() {
    window.print();
  }

  const searchedProducts = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return [];
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, searchQuery]);

  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = calculateTotal();
  const change = Math.max(0, Number(modalPaymentReceived || 0) - total);

  return (
    <Box sx={{ height: "100%", minHeight: 0, display: "flex", gap: 2.5 }}>
      {/* LEFT COLUMN — search bar + cart list */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Scan + search inputs */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, flexShrink: 0 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              inputRef={barcodeRef}
              fullWidth
              size="small"
              placeholder="Scan or type barcode/product code, then press Enter"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  if (barcode.trim()) {
                    handleBarcodeConfirm();
                  } else if (cartRef.current.length > 0) {
                    openCheckoutModal();
                  }
                }
              }}
              slotProps={{
                htmlInput: {
                  "data-barcode": "true",
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCode2RoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              name="searchQuery"
              fullWidth
              size="small"
              placeholder="Search products by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          </Stack>
        </Paper>

        {/* Live product search dropdown */}
        {searchQuery.trim() !== "" && (
          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, flexShrink: 0, maxHeight: 220, overflow: "auto" }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Cost</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary" variant="body2">
                        No products found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  searchedProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">
                        {product.purchasePrice != null ? money(product.purchasePrice) : "—"}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {money(product.sellingPrice)}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          color="secondary"
                          onClick={() => {
                            addToCart(product);
                            setSearchQuery("");
                          }}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* Cart list — fills remaining height, only region that scrolls */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            minHeight: 0,
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              flexShrink: 0,
              px: 2,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle1">Cart</Typography>
            <Typography variant="body2" color="text.secondary">
              {cartQuantity} item{cartQuantity === 1 ? "" : "s"}
            </Typography>
          </Stack>

          <TableContainer sx={{ flex: 1, minHeight: 0 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Line Total</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Cart is empty. Scan or search for a product to add it.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  cart.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">{money(item.price)}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                          <IconButton
                            size="small"
                            onClick={() => decreaseQty(item.id)}
                            disabled={item.quantity <= 1}
                          >
                            <RemoveRoundedIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ minWidth: 24, textAlign: "center" }}>
                            {item.quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => increaseQty(item.id)}>
                            <AddRoundedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {money(item.price * item.quantity)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => removeItem(item.id)}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* RIGHT COLUMN — total amount section */}
      <Paper
        variant="outlined"
        sx={{
          width: 340,
          flexShrink: 0,
          minHeight: 0,
          p: 2.5,
          borderRadius: 3,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" fontSize="large">
            Total amount
          </Typography>
          <Typography
            variant="h3"
            color="secondary.dark"
            sx={{ fontWeight: 700, lineHeight: 1.15, wordBreak: "break-word" }}
          >
            {money(total)}
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Total items</Typography>
            <Typography sx={{ fontWeight: 600 }}>{cartQuantity}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography sx={{ fontWeight: 600 }}>{money(calculateSubtotal())}</Typography>
          </Stack>
        </Stack>

        {/* Actions — pinned to the bottom of the panel */}
        <Stack spacing={1.5} sx={{ mt: "auto", pt: 1 }}>
          <Button
            fullWidth
            size="large"
            variant="contained"
            color="secondary"
            onClick={openCheckoutModal}
            disabled={cart.length === 0}
            sx={{ py: 1.5, fontSize: 16, fontWeight: 700 }}
          >
            Checkout (Enter)
          </Button>

          <Stack direction="row" spacing={1.5}>
            <Button fullWidth variant="outlined" color="error" onClick={clearCart}>
              Clear Cart
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PrintOutlinedIcon />}
              onClick={handlePrint}
            >
              Print
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* CHECKOUT / PAYMENT POPUP MODAL */}
      <Dialog
        open={checkoutOpen}
        onClose={closeCheckoutModal}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1 },
          },
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !submitting) {
            e.preventDefault();
            handleConfirmSale();
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
          Complete Sale
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {/* Total Due Banner */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              bgcolor: "secondary.50",
              border: "1px solid",
              borderColor: "secondary.light",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total Amount Due
            </Typography>
            <Typography variant="h3" color="secondary.dark" sx={{ fontWeight: 800 }}>
              {money(total)}
            </Typography>
          </Box>

          {/* Payment Method Selector */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, fontWeight: 600 }}>
              Payment Method
            </Typography>
            <Stack direction="row" spacing={1}>
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const isSelected = modalPaymentMethod === m.id;
                return (
                  <Button
                    key={m.id}
                    variant={isSelected ? "contained" : "outlined"}
                    color={isSelected ? "secondary" : "inherit"}
                    startIcon={<Icon />}
                    onClick={() => setModalPaymentMethod(m.id)}
                    sx={{ flex: 1, py: 1, fontWeight: 600 }}
                  >
                    {m.label}
                  </Button>
                );
              })}
            </Stack>
          </Box>

          {/* Payment Received Input */}
          <Box>
            <TextField
              inputRef={paymentInputRef}
              fullWidth
              label="Payment Received"
              type="number"
              value={modalPaymentReceived}
              onChange={(e) => setModalPaymentReceived(e.target.value)}
              inputProps={{ min: 0, step: "0.01" }}
              helperText="Press Enter to complete sale"
            />
          </Box>

          {/* Change Display */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "rgba(46,125,70,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Change to Return:
            </Typography>
            <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
              {money(change)}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeCheckoutModal} color="inherit" disabled={submitting}>
            Cancel (Esc)
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleConfirmSale}
            disabled={submitting || Number(modalPaymentReceived) < total}
            sx={{ px: 3, fontWeight: 700 }}
          >
            {submitting ? "Processing..." : "Complete Sale (Enter)"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications / Feedback */}
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

export default CashierPage;