// components/LinksWrapper.tsx
import { LinksProvider } from "../contexts/LinksContext";
import type { ReactNode } from "react";

interface LinksWrapperProps {
  children: ReactNode;
}

export const LinksWrapper = ({ children }: LinksWrapperProps) => {
  return <LinksProvider>{children}</LinksProvider>;
};