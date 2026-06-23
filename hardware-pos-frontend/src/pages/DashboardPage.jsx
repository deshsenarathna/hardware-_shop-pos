import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 6 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Hardware Shop POS Dashboard
          </Typography>

          <Typography>
            Welcome, {user?.fullName}
          </Typography>

          <Typography>
            Username: {user?.username}
          </Typography>

          <Typography>
            Role: {user?.role}
          </Typography>

          {user?.role === "OWNER" && (
          <Button
             variant="outlined"
             onClick={() => navigate("/users")}
             sx={{ mt: 3, mr: 2 }}
            >
             Manage Users
          </Button>
            )}


            {["OWNER", "MANAGER"].includes(user?.role) && (
            <Button
                 variant="outlined"
                   onClick={() => navigate("/units")}
                   sx={{ mt: 3, mr: 2 }}
                >
                Manage Units
            </Button>
           )}

           {["OWNER", "MANAGER"].includes(user?.role) && (
                <Button
                  variant="outlined"
                  onClick={() => navigate("/categories")}
                  sx={{ mt: 3, mr: 2 }}
                 >
                   Manage Categories
               </Button>
           )}

           {["OWNER", "MANAGER"].includes(user?.role) && (
                <Button
                  variant="outlined"
                  onClick={() => navigate("/brands")}
                  sx={{ mt: 3, mr: 2 }}
                 >
                   Manage Brands
               </Button>
           )}

          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{ mt: 3 }}
          >
            Logout
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default DashboardPage;