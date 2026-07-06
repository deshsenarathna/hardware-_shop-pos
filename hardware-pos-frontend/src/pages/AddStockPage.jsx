import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper
} from "@mui/material";

import Autocomplete from "@mui/material/Autocomplete";
import apiClient from "../../api/apiClient";

function AddStockPage() {

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        📦 Add Stock (Owner)
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 500 }}>
        
        {/* PRODUCT SEARCH */}
        
        {/* QUANTITY */}
        
        {/* BUTTON */}

      </Paper>
    </Box>
  );
}


export default AddStockPage;