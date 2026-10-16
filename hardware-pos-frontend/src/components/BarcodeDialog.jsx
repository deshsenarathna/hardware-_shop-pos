import { useEffect, useRef, useState } from "react";
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
  Stack,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import JsBarcode from "jsbarcode";

import apiClient from "../api/apiClient";

function BarcodeSvg({ value }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    try {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 16,
        margin: 10,
      });
    } catch {
      // value cannot be encoded as Code128 — leave the SVG empty
    }
  }, [value]);

  return <svg ref={svgRef} style={{ maxWidth: "100%" }} />;
}

// Internal barcodes only, primary first
function pickInternal(barcodes) {
  return (Array.isArray(barcodes) ? barcodes : [])
    .filter((b) => b.barcodeType === "INTERNAL")
    .sort((a, b) => Number(b.primary) - Number(a.primary));
}

/**
 * Barcode popup for one product.
 * Mount it only while it should be open (e.g. {product && <BarcodeDialog key={product.id} ... />})
 * so its internal state resets every time it is opened.
 */
function BarcodeDialog({ product, onClose }) {
  // "type" | "internal" | "external" | "view"
  const [step, setStep] = useState("type");
  const [internalBarcodes, setInternalBarcodes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const printRef = useRef(null);

  const hasBarcode = internalBarcodes.length > 0;
  const selected =
    internalBarcodes.find((b) => b.id === selectedId) ?? internalBarcodes[0] ?? null;

  function errorMessage(err, fallback) {
    return err?.response?.data?.message || fallback;
  }

  // GET barcodes of this product
  async function fetchInternalBarcodes() {
    const response = await apiClient.get(`/barcodes/product/${product.id}`);
    const list = pickInternal(response.data);
    setInternalBarcodes(list);
    setSelectedId(list[0]?.id ?? null);
    return list;
  }

  async function chooseInternal() {
    setError("");
    setInfo("");
    setStep("internal");
    setLoading(true);

    try {
      await fetchInternalBarcodes();
    } catch (err) {
      setError(errorMessage(err, "Unable to load barcodes for this product."));
    } finally {
      setLoading(false);
    }
  }

  function chooseExternal() {
    setError("");
    setInfo("");
    setStep("external");
  }

  // POST create barcode (used by both Generate and Regenerate)
  async function handleGenerate() {
    setError("");
    setInfo("");
    setGenerating(true);

    try {
      await apiClient.post(`/barcodes/generate/${product.id}`, null, {
        params: { primary: true },
      });
      await fetchInternalBarcodes();
      setInfo(hasBarcode ? "Barcode regenerated." : "Barcode generated.");
    } catch (err) {
      setError(errorMessage(err, "Unable to generate the barcode."));
    } finally {
      setGenerating(false);
    }
  }

  // GET barcode, then show it for viewing/printing
  async function handleView() {
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const list = await fetchInternalBarcodes();

      if (list.length === 0) {
        setInfo("This product has no barcode yet. Generate one first.");
      } else {
        setStep("view");
      }
    } catch (err) {
      setError(errorMessage(err, "Unable to load the barcode."));
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    if (!printRef.current) return;

    const printWindow = window.open("", "_blank", "width=480,height=420");

    if (!printWindow) {
      setError("The print window was blocked by your browser. Please allow pop-ups.");
      return;
    }

    printWindow.document.write(`<!doctype html>
<html>
  <head>
    <title>Barcode - ${product.productCode}</title>
    <style>
      body { font-family: Arial, sans-serif; text-align: center; margin: 24px; }
      .name { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
      .code { font-size: 12px; color: #555; margin-bottom: 8px; }
      svg { max-width: 100%; }
    </style>
  </head>
  <body>${printRef.current.innerHTML}</body>
</html>`);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }

  function goBack() {
    setError("");
    setInfo("");
    setStep(step === "view" ? "internal" : "type");
  }

  const titles = {
    type: "Barcode",
    internal: "Internal barcode",
    external: "External barcode",
    view: "View / Print barcode",
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        {titles[step]}
        <Typography variant="body2" color="text.secondary">
          {product.productCode} · {product.name}
        </Typography>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 16, top: 16 }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {info && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {info}
          </Alert>
        )}

        {/* Step 1 — choose barcode type */}
        {step === "type" && (
          <Stack spacing={1.5}>
            <Typography color="text.secondary">
              What kind of barcode do you want to work with?
            </Typography>

            <Button
              variant="outlined"
              size="large"
              startIcon={<QrCode2RoundedIcon />}
              onClick={chooseInternal}
              sx={{ justifyContent: "flex-start", py: 1.5 }}
            >
              Internal — generated by this system
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<StorefrontOutlinedIcon />}
              onClick={chooseExternal}
              sx={{ justifyContent: "flex-start", py: 1.5 }}
            >
              External — manufacturer barcode
            </Button>
          </Stack>
        )}

        {/* External — not handled yet (barcode scanner support comes later) */}
        {step === "external" && (
          <Alert severity="info">
            External (manufacturer) barcodes will be supported later, once a barcode scanner is
            set up. Nothing is changed for this product.
          </Alert>
        )}

        {/* Internal — Generate/Regenerate + View/Print */}
        {step === "internal" && (
          <Stack spacing={2}>
            {loading ? (
              <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <>
                {hasBarcode ? (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Current barcode
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: "monospace" }}>
                      {internalBarcodes[0].barcodeValue}
                    </Typography>
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    This product does not have an internal barcode yet.
                  </Typography>
                )}

                <Stack direction="row" spacing={1.5}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    startIcon={hasBarcode ? <AutorenewRoundedIcon /> : <AddRoundedIcon />}
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    {generating
                      ? "Working..."
                      : hasBarcode
                        ? "Regenerate"
                        : "Generate"}
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<VisibilityOutlinedIcon />}
                    onClick={handleView}
                    disabled={generating}
                  >
                    View / Print
                  </Button>
                </Stack>

                {hasBarcode && (
                  <Typography variant="caption" color="text.secondary">
                    Regenerating creates a new primary barcode. The previous one is kept as a
                    non-primary barcode.
                  </Typography>
                )}
              </>
            )}
          </Stack>
        )}

        {/* View / Print */}
        {step === "view" && selected && (
          <Stack spacing={2} alignItems="center">
            <Box ref={printRef} sx={{ textAlign: "center" }}>
              <div className="name">{product.name}</div>
              <div className="code">{product.productCode}</div>
              <BarcodeSvg value={selected.barcodeValue} />
            </Box>

            {internalBarcodes.length > 1 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                {internalBarcodes.map((b) => (
                  <Chip
                    key={b.id}
                    size="small"
                    label={b.primary ? `${b.barcodeValue} (primary)` : b.barcodeValue}
                    color={b.id === selected.id ? "secondary" : "default"}
                    variant={b.id === selected.id ? "filled" : "outlined"}
                    onClick={() => setSelectedId(b.id)}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        {step !== "type" ? (
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={goBack} color="inherit">
            Back
          </Button>
        ) : (
          <span />
        )}

        {step === "view" && selected ? (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PrintOutlinedIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
        ) : (
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default BarcodeDialog;