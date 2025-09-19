import React from "react";
import { Box, Text } from "ink";
import Table from "ink-table";
import type { DisplayRow, SortKey } from "../types/table";

interface HeaderCellStyle {
  color?: string;
}

interface FundingTableProps {
  data: DisplayRow[];
  columns: SortKey[];
  columnLabels: Partial<Record<SortKey, string>>;
  headerStyles: HeaderCellStyle[];
}

export const FundingTable: React.FC<FundingTableProps> = ({ data, columns, columnLabels, headerStyles }) => {
  const HeaderCell: React.FC<React.PropsWithChildren<{ column: number }>> = ({ column, children }) => {
    const style = headerStyles[column] ?? {};
    return (
      <Text color={style.color} bold>
        {children}
      </Text>
    );
  };

  return (
    <Box marginTop={1}>
      <Table data={data} columns={columns} columnLabels={columnLabels} header={HeaderCell} />
    </Box>
  );
};
