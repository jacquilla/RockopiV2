import { createBrowserRouter } from "react-router";
import { AdminLayout } from "./components/AdminLayout";
import { OrderPage } from "./pages/OrderPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { FinancePage } from "./pages/FinancePage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <OrderPage />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "transactions", element: <TransactionsPage /> },
      { path: "finance", element: <FinancePage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
