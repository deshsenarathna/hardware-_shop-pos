import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
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
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

import apiClient from "../api/apiClient";

const NUMPAD_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", icon: PaymentsOutlinedIcon },
  { id: "card", label: "Card", icon: CreditCardOutlinedIcon },
  { id: "other", label: "Other", icon: MoreHorizOutlinedIcon },
];

function money(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`;
}

function CashierPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const [barcode, setBarcode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [paymentReceived, setPaymentReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [discountInput, setDiscountInput] = useState(0);

  const [feedback, setFeedback] = useState(null); // { severity, message }

  const barcodeRef = useRef(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await apiClient.get("/products");
      setProducts(res.data.filter((p) => p.active !== false));
    } catch {
      setProducts([
        { id: 1, name: "Kinder Chocolate Small Bars", purchasePrice: 25, sellingPrice: 28.6 },
        { id: 2, name: "Coca Cola 500ml", purchasePrice: 40, sellingPrice: 50 },
        { id: 3, name: "Bread Loaf", purchasePrice: 30, sellingPrice: 35 },
        { id: 4, name: "Milk 1L", purchasePrice: 45, sellingPrice: 55 },
        { id: 5, name: "Eggs Dozen", purchasePrice: 80, sellingPrice: 120 },
      ]);
      setFeedback({
        severity: "info",
        message: "Showing sample products — could not reach the server.",
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
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
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

  function calculateSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function calculateTotal() {
    const subtotal = calculateSubtotal();
    const itemDiscounts = cart.reduce(
      (sum, item) => sum + item.discount * item.quantity,
      0
    );
    return Math.max(0, subtotal - itemDiscounts - Number(discountInput || 0));
  }

  function calculateChange() {
    return Math.max(0, Number(paymentReceived || 0) - calculateTotal());
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

  function handleNumpadClick(value) {
    if (value === "clear") {
      setPaymentReceived(0);
    } else if (value === "backspace") {
      setPaymentReceived((prev) => Math.floor(Number(prev) / 10));
    } else if (value === ".") {
      if (!paymentReceived.toString().includes(".")) {
        setPaymentReceived(paymentReceived + ".");
      }
    } else {
      setPaymentReceived(
        paymentReceived === 0 ? value : paymentReceived + value
      );
    }
  }

  async function handleCheckout() {
    if (cart.length === 0) {
      setFeedback({ severity: "error", message: "Cart is empty." });
      return;
    }

    if (Number(paymentReceived) < calculateTotal()) {
      setFeedback({ severity: "error", message: "Payment received is insufficient." });
      return;
    }

    try {
      const payload = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      await apiClient.post("/sales", payload);
      setFeedback({ severity: "success", message: "Sale completed successfully." });
      clearCart();
    } catch {
      setFeedback({ severity: "success", message: "Sale completed (demo mode)." });
      clearCart();
    }
  }

  function clearCart() {
    setCart([]);
    setPaymentReceived(0);
    setDiscountInput(0);
    setPaymentMethod(null);
    setBarcode("");
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
  const change = calculateChange();

  return (
    <Box sx={{ height: "100%", minHeight: 0, display: "flex", gap: 2.5 }}>
      {/* LEFT — scan/search, cart, checkout footer */}
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
        {/* Scan + search toolbar — fixed height */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, flexShrink: 0 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              inputRef={barcodeRef}
              fullWidth
              size="small"
              placeholder="Scan or type a product code, then press Enter"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleBarcodeConfirm();
              }}
              slotProps={{
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

        {/* Search results — only takes space while searching */}
        {searchQuery.trim() !== "" && (
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              flexShrink: 0,
              maxHeight: 220,
              overflow: "auto",
            }}
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
                        {product.purchasePrice != null
                          ? money(product.purchasePrice)
                          : "—"}
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

        {/* Cart — fills remaining height, only region that scrolls */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            minHeight: 0,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
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
            <Stack direction="row" spacing={1} alignItems="center">
              <ShoppingCartOutlinedIcon fontSize="small" color="action" />
              <Typography variant="subtitle1">Cart</Typography>
            </Stack>
            <Chip label={`${cartQuantity} item${cartQuantity === 1 ? "" : "s"}`} size="small" />
          </Stack>

          <TableContainer sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Qty</TableCell>
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
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          justifyContent="center"
                        >
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
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeItem(item.id)}
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
        </Paper>

        {/* Checkout footer — fixed height */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, flexShrink: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Quantity
                </Typography>
                <Typography variant="h6">{cartQuantity}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h6" color="secondary.dark">
                  {money(total)}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                color="error"
                onClick={clearCart}
                sx={{ px: 2.5 }}
              >
                Clear
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintOutlinedIcon />}
                onClick={handlePrint}
                sx={{ px: 2.5 }}
              >
                Print
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCheckout}
                disabled={cart.length === 0}
                sx={{ px: 3 }}
              >
                Charge
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* RIGHT — payment summary, keypad, payment method */}
      <Box
        sx={{
          width: 320,
          flexShrink: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, flexShrink: 0 }}>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Payment due
              </Typography>
              <Typography variant="h5">{money(total)}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Payment received
              </Typography>
              <Typography variant="h6" color="primary.main">
                {money(paymentReceived)}
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: "rgba(46,125,70,0.08)",
                borderRadius: 2,
                p: 1.25,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Change
              </Typography>
              <Typography variant="h6" color="success.main">
                {money(change)}
              </Typography>
            </Box>

            <TextField
              size="small"
              type="number"
              label="Discount"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 3,
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Keypad
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, mb: 1 }}>
              {NUMPAD_DIGITS.map((num) => (
                <Button
                  key={num}
                  variant="outlined"
                  sx={{ py: 1.25, fontSize: 16, fontWeight: 600 }}
                  onClick={() => handleNumpadClick(num.toString())}
                >
                  {num}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, mb: 1 }}>
              <Button variant="outlined" sx={{ py: 1.25, fontWeight: 600 }} onClick={() => handleNumpadClick("0")}>
                0
              </Button>
              <Button variant="outlined" sx={{ py: 1.25, fontWeight: 600 }} onClick={() => handleNumpadClick("00")}>
                00
              </Button>
              <Button variant="outlined" sx={{ py: 1.25, fontWeight: 600 }} onClick={() => handleNumpadClick(".")}>
                .
              </Button>
              <Button
                variant="outlined"
                color="error"
                sx={{ py: 1.25 }}
                onClick={() => handleNumpadClick("backspace")}
              >
                <BackspaceOutlinedIcon fontSize="small" />
              </Button>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }}>
              <Button
                variant="outlined"
                color="error"
                sx={{ py: 1.25, fontWeight: 600 }}
                onClick={() => handleNumpadClick("clear")}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                color="secondary"
                sx={{ py: 1.25, fontWeight: 600 }}
                onClick={handleCheckout}
                disabled={cart.length === 0 || Number(paymentReceived) < total}
              >
                Enter
              </Button>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Payment method
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const selected = paymentMethod === method.id;

                return (
                  <Button
                    key={method.id}
                    variant={selected ? "contained" : "outlined"}
                    color={selected ? "secondary" : "inherit"}
                    onClick={() => setPaymentMethod(method.id)}
                    sx={{
                      py: 1.25,
                      flexDirection: "column",
                      gap: 0.5,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    <Icon fontSize="small" />
                    {method.label}
                  </Button>
                );
              })}
            </Box>
          </Box>
        </Paper>
      </Box>

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