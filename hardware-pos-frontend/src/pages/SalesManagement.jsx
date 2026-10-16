import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  IconButton,
  InputAdornment,
  Paper,
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
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import apiClient from "../api/apiClient";

function money(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`;
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

// Accepts either a plain array or a paged response ({ content: [...] })
function extractSales(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function itemName(item) {
  return item.productName ?? item.product?.name ?? `Product #${item.productId ?? "?"}`;
}

function itemUnitPrice(item) {
  return item.unitPrice ?? item.price ?? item.product?.sellingPrice ?? 0;
}

function SaleRow({ sale }) {
  const [open, setOpen] = useState(false);
  const items = Array.isArray(sale.items) ? sale.items : [];

  return (
    <Fragment>
      <TableRow hover>
        <TableCell padding="checkbox">
          <IconButton
            size="small"
            onClick={() => setOpen((v) => !v)}
            disabled={items.length === 0}
            aria-label={open ? "Hide items" : "Show items"}
          >
            {open ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 600 }}>{sale.invoiceNumber ?? `#${sale.id}`}</TableCell>
        <TableCell>{formatDateTime(sale.createdAt)}</TableCell>
        <TableCell>
          {sale.paymentMethod ? (
            <Chip size="small" variant="outlined" label={String(sale.paymentMethod).toUpperCase()} />
          ) : (
            "—"
          )}
        </TableCell>
        <TableCell align="right">{items.length || "—"}</TableCell>
        <TableCell align="right" sx={{ fontWeight: 600 }}>
          {money(sale.totalAmount ?? sale.total)}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0, border: open ? undefined : "none" }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 1.5, pl: 6 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Line total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => {
                    const price = itemUnitPrice(item);
                    return (
                      <TableRow key={item.id ?? index}>
                        <TableCell>{itemName(item)}</TableCell>
                        <TableCell align="right">{money(price)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          {money(item.lineTotal ?? price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

function SalesManagementPage() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.get("/sales");
      setSales(extractSales(response.data));
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (status === 403) {
        setError("You do not have permission to view sales.");
      } else if (status === 404 || status === 405) {
        setError("The sales list endpoint (GET /api/sales) is not available on the server yet.");
      } else {
        setError("Unable to load sales.");
      }
    } finally {
      setLoading(false);
    }
  }

  const visibleSales = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...sales]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .filter((sale) => {
        if (!term) return true;
        return (
          String(sale.invoiceNumber ?? sale.id).toLowerCase().includes(term) ||
          String(sale.paymentMethod ?? "").toLowerCase().includes(term)
        );
      });
  }, [sales, search]);

  const revenue = visibleSales.reduce(
    (sum, sale) => sum + Number(sale.totalAmount ?? sale.total ?? 0),
    0
  );

  return (
    <Container maxWidth="lg">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            All Sales
          </Typography>
          <Typography color="text.secondary">
            Review completed sales and their line items.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={loadSales}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, minWidth: 160 }}>
          <Typography variant="caption" color="text.secondary">
            Sales
          </Typography>
          <Typography variant="h5">{visibleSales.length}</Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, minWidth: 200 }}>
          <Typography variant="caption" color="text.secondary">
            Total revenue
          </Typography>
          <Typography variant="h5" color="secondary.dark">
            {money(revenue)}
          </Typography>
        </Paper>

        <TextField
          size="small"
          placeholder="Search by invoice number or payment method"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, alignSelf: "center" }}
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

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Invoice</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        {sales.length === 0 ? "No sales found." : "No sales match your search."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleSales.map((sale) => <SaleRow key={sale.id} sale={sale} />)
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}

export default SalesManagementPage;