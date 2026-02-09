// components/layouts/StoreLayout.tsx
import { Outlet } from "react-router-dom";
import { StoreProvider } from "../../contexts/StoreContext";

export const StoreLayout = () => {
  return (
    <StoreProvider>
      <Outlet />
    </StoreProvider>
  );
};