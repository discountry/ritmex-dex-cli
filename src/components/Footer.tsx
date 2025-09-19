import React from "react";
import { Text } from "ink";

interface FooterProps {
  totalRows: number;
  startRow: number;
  endRow: number;
}

export const Footer: React.FC<FooterProps> = ({ totalRows, startRow, endRow }) => {
  if (!totalRows) {
    return null;
  }

  return <Text color="gray">Rows {startRow}-{endRow} of {totalRows}</Text>;
};
