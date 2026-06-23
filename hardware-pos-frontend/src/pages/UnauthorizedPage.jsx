import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            padding: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Access Denied
          </Typography>

          <Typography sx={{ mb: 3 }}>
            You do not have permission to access this page.
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default UnauthorizedPage;