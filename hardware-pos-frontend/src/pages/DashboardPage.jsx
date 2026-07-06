import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

import { useAuth } from "../auth/AuthContext";
import apiClient from "../api/apiClient";

const QUICK_LINKS = [
  {
    label: "New Sale",
    description: "Start a checkout at the register",
    path: "/new-sale",
    icon: PointOfSaleOutlinedIcon,
    roles: ["OWNER", "MANAGER", "CASHIER"],
  },
  {
    label: "Products",
    description: "Manage catalog & pricing",
    path: "/products",
    icon: Inventory2OutlinedIcon,
    roles: ["OWNER", "MANAGER"],
  },
  {
    label: "Categories",
    description: "Organize product groupings",
    path: "/categories",
    icon: CategoryOutlinedIcon,
    roles: ["OWNER", "MANAGER"],
  },
  {
    label: "Brands",
    description: "Maintain supplier brands",
    path: "/brands",
    icon: SellOutlinedIcon,
    roles: ["OWNER", "MANAGER"],
  },
  {
    label: "Units",
    description: "Measurement units for stock",
    path: "/units",
    icon: StraightenOutlinedIcon,
    roles: ["OWNER", "MANAGER"],
  },
  {
    label: "Users",
    description: "Staff accounts & roles",
    path: "/users",
    icon: GroupOutlinedIcon,
    roles: ["OWNER"],
  },
];

function StatCard({ label, value, loading, icon: Icon }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: "rgba(232,98,44,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ color: "secondary.dark" }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={48} height={32} />
          ) : (
            <Typography variant="h5">{value}</Typography>
          )}
        </Box>
      </Box>
    </Card>
  );
}

function DashboardPage() {
  const { user } = useAuth();

  const [productCount, setProductCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .get("/products")
      .then((response) => {
        if (!isMounted) return;
        const products = response.data ?? [];
        setProductCount(products.filter((p) => p.active).length);
      })
      .catch(() => {
        // Stats are a nice-to-have; a failed fetch shouldn't block the page.
      })
      .finally(() => {
        if (isMounted) setLoadingStats(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const navigate = useNavigate();
  const links = QUICK_LINKS.filter((link) =>
    link.roles.includes(user?.role)
  );

  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4">Welcome back, {firstName}</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Here's what's happening at the shop today.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Active products"
            value={productCount}
            loading={loadingStats}
            icon={Inventory2OutlinedIcon}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Your role"
            value={user?.role ?? "-"}
            loading={false}
            icon={GroupOutlinedIcon}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Signed in as"
            value={user?.username ?? "-"}
            loading={false}
            icon={TrendingUpRoundedIcon}
          />
        </Grid>
      </Grid>

      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick links
        </Typography>
        <Grid container spacing={2}>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Grid key={link.path} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardActionArea
                    onClick={() => navigate(link.path)}
                    sx={{ p: 2.5 }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: "rgba(22,31,43,0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon sx={{ color: "primary.main" }} fontSize="small" />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1">
                          {link.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {link.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Stack>
  );
}

export default DashboardPage;