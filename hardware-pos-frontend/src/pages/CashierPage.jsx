import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import PrintIcon from "@mui/icons-material/Print";

function CashierPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentReceived, setPaymentReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [discountInput, setDiscountInput] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await apiClient.get("/products");
      setProducts(res.data);
      console.log("Products loaded:", res.data);
    } catch (error) {
      console.log("Using dummy product data");
      setProducts([
        { id: 1, name: "Kinder Chocolate Small Bars", costPrice: 25, sellingPrice: 28.60 },
        { id: 2, name: "Coca Cola 500ml", costPrice: 40, sellingPrice: 50 },
        { id: 3, name: "Bread Loaf", costPrice: 30, sellingPrice: 35 },
        { id: 4, name: "Milk 1L", costPrice: 45, sellingPrice: 55 },
        { id: 5, name: "Eggs Dozen", costPrice: 80, sellingPrice: 120 }
      ]);
    }
  }

  function addToCart(product) {
    const existing = cart.find(c => c.id === product.id);

    if (existing) {
      increaseQty(existing.id);
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        orgPrice: product.costPrice,
        price: product.sellingPrice,
        quantity: 1,
        discount: 0
      }]);
    }
  }

  function increaseQty(productId) {
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  }

  function decreaseQty(productId) {
    setCart(cart.map(item =>
      item.id === productId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ));
  }

  function removeItem(productId) {
    setCart(cart.filter(item => item.id !== productId));
  }

  function calculateSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  function calculateTotal() {
    const subtotal = calculateSubtotal();
    const itemDiscounts = cart.reduce((sum, item) => sum + (item.discount * item.quantity), 0);
    return Math.max(0, subtotal - itemDiscounts - discountInput);
  }

  function calculateChange() {
    return Math.max(0, paymentReceived - calculateTotal());
  }

  function handleBarcodeConfirm() {
    if (barcode.trim()) {
      const product = products.find(p => p.id.toString() === barcode || p.name.toLowerCase().includes(barcode.toLowerCase()));
      if (product) {
        addToCart(product);
        setBarcode("");
      } else {
        alert("Product not found!");
      }
    }
  }

  function handleNumpadClick(value) {
    if (value === "clear") {
      setPaymentReceived(0);
    } else if (value === "backspace") {
      setPaymentReceived(Math.floor(paymentReceived / 10));
    } else if (value === ".") {
      if (!paymentReceived.toString().includes(".")) {
        setPaymentReceived(paymentReceived + ".");
      }
    } else {
      setPaymentReceived(paymentReceived + value);
    }
  }

  async function handleCheckout() {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    if (paymentReceived < calculateTotal()) {
      alert("Payment insufficient!");
      return;
    }

    try {
      const payload = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      await apiClient.post("/sales", payload);
      alert("Sale Completed!");
      clearCart();
    } catch (error) {
      console.log("Checkout successful (demo mode)");
      alert("Sale Completed!");
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

  // Filter products based on search query
  const searchedProducts = searchQuery.trim()
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <Box sx={{
      display: "flex",
    height: "100dvh",
    width: "100%",
    bgcolor: "#f5f5f5",
    overflow: "hidden",
    boxSizing: "border-box"
     }}>
      {/* LEFT PANEL - 75% */}
      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        p: 2,
        gap: 2,
        overflow: "auto"
      }}>
        {/* BARCODE SECTION */}
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            BAR CODE
          </CardContent>
        </Card>

        {/* SEARCH SECTION */}
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1
                }
              }}
            />
          </CardContent>
        </Card>

        {/* PRODUCT TABLE */}
        <TableContainer component={Paper} sx={{ flex: 1, overflow: "auto", boxShadow: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", fontSize: 12 }}>Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", fontSize: 12 }}>Org.Price</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", fontSize: 12 }}>Price</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: 12 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {searchQuery.trim() === "" ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: "#999" }}>
                    Enter a product name to search
                  </TableCell>
                </TableRow>
              ) : searchedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: "#999" }}>
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                searchedProducts.map((product) => (
                  <TableRow key={product.id} sx={{ "&:hover": { bgcolor: "#f9f9f9" } }}>
                    <TableCell sx={{ fontSize: 12 }}>{product.name}</TableCell>
                    <TableCell align="right" sx={{ fontSize: 12 }}>${product.costPrice?.toFixed(2) || "N/A"}</TableCell>
                    <TableCell align="right" sx={{ fontSize: 12, fontWeight: "bold" }}>${product.sellingPrice.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          bgcolor: "#4caf50",
                          color: "white",
                          fontWeight: "bold",
                          textTransform: "none"
                        }}
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
        </TableContainer>

        {/* BOTTOM LEFT SUMMARY */}
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography sx={{ color: "#666", fontSize: 12 }}>Quantity</Typography>
                <Typography sx={{ fontWeight: "bold", fontSize: 18 }}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ color: "#666", fontSize: 12 }}>Total</Typography>
                <Typography sx={{ fontWeight: "bold", fontSize: 24, color: "#1976d2" }}>
                  ${calculateTotal().toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#1976d2",
                  color: "white",
                  fontWeight: "bold",
                  py: 1.5
                }}
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                CHARGE
              </Button>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#ef5350",
                  color: "white",
                  fontWeight: "bold",
                  py: 1.5
                }}
                onClick={clearCart}
              >
                CLEAR
              </Button>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#64b5f6",
                  color: "white",
                  fontWeight: "bold",
                  py: 1.5
                }}
                onClick={handlePrint}
                startIcon={<PrintIcon />}
              >
                PRINT
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* RIGHT PANEL - 30% */}
      <Box sx={{
        flex: "0 0 30%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        p: 2,
        gap: 2,
        borderLeft: "1px solid #e0e0e0",
        overflow: "auto"
      }}>
        {/* PAYMENT SUMMARY */}
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: "#999", fontSize: 11 }}>Payment due</Typography>
              <Typography sx={{ fontWeight: "bold", fontSize: 24, color: "#333" }}>
                ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: "#999", fontSize: 11 }}>Payment Received</Typography>
              <Typography sx={{ fontWeight: "bold", fontSize: 20, color: "#1976d2" }}>
                ${typeof paymentReceived === "string" ? paymentReceived : paymentReceived.toFixed(2)}
              </Typography>
            </Box>

            <Box sx={{ bgcolor: "#f5f5f5", p: 1.5, borderRadius: 1 }}>
              <Typography sx={{ color: "#999", fontSize: 11 }}>Change</Typography>
              <Typography sx={{ fontWeight: "bold", fontSize: 20, color: "#4caf50" }}>
                ${calculateChange().toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* NUMERIC KEYPAD */}
        <Box>
          <Typography sx={{ fontWeight: "bold", fontSize: 12, mb: 1 }}>Keypad</Typography>
          
          {/* Rows 1-3 (3 columns) */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, mb: 1 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <Button
                key={num}
                variant="outlined"
                sx={{
                  py: 1.5,
                  fontSize: 16,
                  fontWeight: "bold",
                  borderColor: "#e0e0e0",
                  color: "#333",
                  "&:hover": { bgcolor: "#f5f5f5" }
                }}
                onClick={() => handleNumpadClick(num.toString())}
              >
                {num}
              </Button>
            ))}
          </Box>

          {/* Row 4 (4 columns) */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, mb: 1 }}>
            <Button
              variant="outlined"
              sx={{
                py: 1.5,
                fontSize: 16,
                fontWeight: "bold",
                borderColor: "#e0e0e0",
                color: "#333",
                "&:hover": { bgcolor: "#f5f5f5" }
              }}
              onClick={() => handleNumpadClick("0")}
            >
              0
            </Button>
            <Button
              variant="outlined"
              sx={{
                py: 1.5,
                fontSize: 16,
                fontWeight: "bold",
                borderColor: "#e0e0e0",
                color: "#333",
                "&:hover": { bgcolor: "#f5f5f5" }
              }}
              onClick={() => handleNumpadClick("00")}
            >
              00
            </Button>
            <Button
              variant="outlined"
              sx={{
                py: 1.5,
                fontSize: 16,
                fontWeight: "bold",
                borderColor: "#e0e0e0",
                color: "#333",
                "&:hover": { bgcolor: "#f5f5f5" }
              }}
              onClick={() => handleNumpadClick(".")}
            >
              .
            </Button>
            <Button
              variant="outlined"
              sx={{
                py: 1.5,
                fontSize: 16,
                fontWeight: "bold",
                borderColor: "#e0e0e0",
                color: "#333",
                "&:hover": { bgcolor: "#f5f5f5" }
              }}
              onClick={() => handleNumpadClick("000")}
            >
              000
            </Button>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#64b5f6",
                color: "white",
                py: 1.5,
                fontWeight: "bold",
                fontSize: 12
              }}
              onClick={() => setPaymentReceived(0)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#ef5350",
                color: "white",
                py: 1.5,
                fontWeight: "bold",
                fontSize: 12
              }}
              onClick={() => handleNumpadClick("backspace")}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#4caf50",
                color: "white",
                py: 1.5,
                fontWeight: "bold",
                fontSize: 12
              }}
              onClick={handleCheckout}
              disabled={cart.length === 0 || paymentReceived < calculateTotal()}
            >
              Enter
            </Button>
          </Box>
        </Box>

        {/* PAYMENT METHODS */}
        <Box>
          <Typography sx={{ fontWeight: "bold", fontSize: 12, mb: 1 }}>Payment Method</Typography>
          
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
            <Button
              variant={paymentMethod === "debit" ? "contained" : "outlined"}
              sx={{
                py: 1.5,
                fontWeight: "bold",
                fontSize: 11,
                borderColor: "#e0e0e0",
                ...(paymentMethod === "debit" && { bgcolor: "#1976d2", color: "white" })
              }}
              onClick={() => setPaymentMethod("debit")}
            >
              💳 Debit Card
            </Button>
            <Button
              variant={paymentMethod === "cash" ? "contained" : "outlined"}
              sx={{
                py: 1.5,
                fontWeight: "bold",
                fontSize: 11,
                borderColor: "#e0e0e0",
                ...(paymentMethod === "cash" && { bgcolor: "#1976d2", color: "white" })
              }}
              onClick={() => setPaymentMethod("cash")}
            >
              💵 Cash
            </Button>
            <Button
              variant={paymentMethod === "other" ? "contained" : "outlined"}
              sx={{
                py: 1.5,
                fontWeight: "bold",
                fontSize: 11,
                borderColor: "#e0e0e0",
                ...(paymentMethod === "other" && { bgcolor: "#1976d2", color: "white" })
              }}
              onClick={() => setPaymentMethod("other")}
            >
              ➕ Other
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CashierPage;