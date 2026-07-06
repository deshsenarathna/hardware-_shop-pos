import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import { useAuth } from "../auth/AuthContext";

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: DashboardOutlinedIcon,
    roles: ["OWNER", "MANAGER", "CASHIER"],
  },
  {
    label: "New Sale",
    path: "/new-sale",
    icon: PointOfSaleOutlinedIcon,
    roles: ["OWNER", "MANAGER", "CASHIER"],
  },
  {
    label: "Products",
    path: "/products",
    icon: Inventory2OutlinedIcon,
    roles: ["OWNER", "MANAGER"],
  },
  {
    label: "Categories",
    path: "/categories",
    icon: CategoryOutlinedIcon,
    roles: ["OWNER", "MANAGER"],
  },
  {
    label: "Brands",
    path: "/brands",
    icon: SellOutlinedIcon,
    roles: ["OWNER", "MANAGER"],
  },
  {
    label: "Units",
    path: "/units",
    icon: StraightenOutlinedIcon,
    roles: ["OWNER", "MANAGER"],
  },
  {
    label: "Users",
    path: "/users",
    icon: GroupOutlinedIcon,
    roles: ["OWNER"],
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: Inventory2OutlinedIcon,
    roles: ["OWNER", "MANAGER",],
  }
];

function initialsFor(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
  return initials.join("") || "?";
}

function SidebarContent({ items, currentPath, onNavigate }) {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 2.5,
          py: 2.75,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "9px",
            bgcolor: "secondary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ConstructionRoundedIcon sx={{ color: "#fff", fontSize: 20 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{ color: "#fff", lineHeight: 1.2 }}
            noWrap
          >
            Hardware POS
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "rgba(231,234,238,0.55)" }}
          >
            Shop Management
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(231,234,238,0.08)" }} />

      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath.startsWith(item.path);

          return (
            <ListItemButton
              key={item.path}
              selected={isActive}
              onClick={() => onNavigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1,
                color: isActive ? "#fff" : "rgba(231,234,238,0.72)",
                borderLeft: "3px solid",
                borderLeftColor: isActive ? "secondary.main" : "transparent",
                "&.Mui-selected": {
                  bgcolor: "rgba(232,98,44,0.14)",
                },
                "&.Mui-selected:hover": {
                  bgcolor: "rgba(232,98,44,0.2)",
                },
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.06)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: isActive ? "secondary.main" : "inherit",
                }}
              >
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: { fontSize: 14, fontWeight: isActive ? 600 : 500 },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

function Layout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role)
  );

  const currentItem = visibleItems.find((item) =>
    location.pathname.startsWith(item.path)
  );

  function handleNavigate(path) {
    navigate(path);
    setMobileOpen(false);
  }

  function handleLogout() {
    setMenuAnchor(null);
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          <SidebarContent
            items={visibleItems}
            currentPath={location.pathname}
            onNavigate={handleNavigate}
          />
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          <SidebarContent
            items={visibleItems}
            currentPath={location.pathname}
            onNavigate={handleNavigate}
          />
        </Drawer>
      )}

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "background.paper",
            color: "text.primary",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar sx={{ gap: 1.5 }}>
            {!isDesktop && (
              <IconButton
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{ color: "text.primary" }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontSize: 16 }}
              noWrap
            >
              {currentItem?.label ?? "Hardware POS"}
            </Typography>

            <Chip
              label={user?.role}
              size="small"
              sx={{
                bgcolor: "rgba(232,98,44,0.1)",
                color: "secondary.dark",
                fontWeight: 600,
                fontSize: 11,
                display: { xs: "none", sm: "inline-flex" },
              }}
            />

            <Tooltip title="Account">
              <Box
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  cursor: "pointer",
                  pl: 1,
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: 13,
                    bgcolor: "primary.main",
                  }}
                >
                  {initialsFor(user?.fullName)}
                </Avatar>
                <KeyboardArrowDownRoundedIcon
                  fontSize="small"
                  sx={{ color: "text.secondary" }}
                />
              </Box>
            </Tooltip>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <Box sx={{ px: 2, py: 1, minWidth: 180 }}>
                <Typography variant="subtitle2" noWrap>
                  {user?.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  @{user?.username}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Log out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: 0,
            overflowY: "auto",
            bgcolor: "background.default",
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;