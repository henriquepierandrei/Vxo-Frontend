// components/layouts/LinksLayout.tsx
import { Outlet } from "react-router-dom";
import { LinksProvider } from "../../contexts/LinksContext";

export const LinksLayout = () => {
  return (
    <LinksProvider>
      <Outlet />
    </LinksProvider>
  );
};