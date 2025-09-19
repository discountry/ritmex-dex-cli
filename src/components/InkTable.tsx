import React, { Fragment, useMemo } from "react";
import { Box, Text } from "ink";

export type Scalar = string | number | boolean | null | undefined;
export type ScalarDict = {
  [key: string]: Scalar;
};

export type CellProps<T extends ScalarDict> = React.PropsWithChildren<{
  column: number;
  columnKey: keyof T;
  width: number;
}>;

export type HeaderProps<T extends ScalarDict> = React.PropsWithChildren<{
  column: number;
  columnKey: keyof T;
  width: number;
}>;

export type TableProps<T extends ScalarDict> = {
  data: T[];
  columns?: (keyof T)[];
  padding?: number;
  columnLabels?: Partial<Record<keyof T, string>>;
  header?: React.ComponentType<HeaderProps<T>>;
  cell?: React.ComponentType<CellProps<T>>;
  skeleton?: React.ComponentType<React.PropsWithChildren<unknown>>;
};

const DEFAULT_PADDING = 1;

const DefaultHeader = ({ children }: HeaderProps<any>) => (
  <Text color="blue" bold>
    {children}
  </Text>
);

const DefaultCell = ({ children }: CellProps<any>) => <Text>{children}</Text>;

const DefaultSkeleton: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <Text bold>{children}</Text>
);

const getDataKeys = <T extends ScalarDict>(data: T[]): (keyof T)[] => {
  const keys = new Set<keyof T>();

  data.forEach((row) => {
    Object.keys(row).forEach((key) => keys.add(key as keyof T));
  });

  return Array.from(keys);
};

const toStringValue = (value: Scalar): string => {
  if (value === undefined || value === null) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
};

const computeColumnWidths = <T extends ScalarDict>(
  data: T[],
  columns: (keyof T)[],
  padding: number,
  labels?: Partial<Record<keyof T, string>>
): number[] => {
  return columns.map((column) => {
    const label = labels?.[column] ?? toStringValue(column as Scalar);
    const headerWidth = label.length;
    const widestCell = data.reduce((max, row) => {
      const valueWidth = toStringValue(row[column]).length;
      return Math.max(max, valueWidth);
    }, 0);

    return Math.max(headerWidth, widestCell) + padding * 2;
  });
};

const buildBoundary = (columns: number[], left: string, middle: string, right: string): string => {
  if (!columns.length) {
    return `${left}${right}`;
  }

  return columns.reduce((line, width, index) => {
    const segment = "─".repeat(width);
    const connector = index === columns.length - 1 ? right : middle;
    return `${line}${segment}${connector}`;
  }, left);
};

const buildCellContent = (value: string, width: number, padding: number): string => {
  const innerWidth = Math.max(width - padding * 2, 0);
  const truncated = innerWidth > 0 && value.length > innerWidth ? value.slice(0, innerWidth) : value;
  const padded = innerWidth > 0 ? truncated.padEnd(innerWidth, " ") : "";
  return `${" ".repeat(padding)}${padded}${" ".repeat(padding)}`;
};

const Table = <T extends ScalarDict>({
  data,
  columns,
  padding = DEFAULT_PADDING,
  columnLabels,
  header: HeaderComponent = DefaultHeader,
  cell: CellComponent = DefaultCell,
  skeleton: SkeletonComponent = DefaultSkeleton,
}: TableProps<T>): React.ReactElement => {
  const resolvedColumns = useMemo(() => {
    if (columns && columns.length > 0) {
      return columns;
    }

    return getDataKeys(data);
  }, [columns, data]);

  const columnWidths = useMemo(
    () => computeColumnWidths(data, resolvedColumns, padding, columnLabels),
    [data, resolvedColumns, padding, columnLabels]
  );

  const headerLine = buildBoundary(columnWidths, "┌", "┬", "┐");
  const separatorLine = buildBoundary(columnWidths, "├", "┼", "┤");
  const footerLine = buildBoundary(columnWidths, "└", "┴", "┘");

  return (
    <Box flexDirection="column">
      <SkeletonComponent>{headerLine}</SkeletonComponent>

      <Box>
        <SkeletonComponent>│</SkeletonComponent>
        {resolvedColumns.map((column, index) => {
          const width = columnWidths[index] ?? padding * 2;
          const value = columnLabels?.[column] ?? toStringValue(column as Scalar);
          return (
            <Fragment key={`header-${String(column)}`}>
              <HeaderComponent column={index} columnKey={column} width={width}>
                {buildCellContent(value, width, padding)}
              </HeaderComponent>
              <SkeletonComponent>{"│"}</SkeletonComponent>
            </Fragment>
          );
        })}
      </Box>

      {data.length === 0 ? (
        <SkeletonComponent>{separatorLine}</SkeletonComponent>
      ) : (
        data.map((row, rowIndex) => (
          <Fragment key={`row-${rowIndex}`}>
            <SkeletonComponent>{separatorLine}</SkeletonComponent>

            <Box>
              <SkeletonComponent>│</SkeletonComponent>
              {resolvedColumns.map((column, columnIndex) => {
                const width = columnWidths[columnIndex] ?? padding * 2;
                return (
                  <Fragment key={`cell-${rowIndex}-${String(column)}`}>
                    <CellComponent column={columnIndex} columnKey={column} width={width}>
                      {buildCellContent(toStringValue(row[column]), width, padding)}
                    </CellComponent>
                    <SkeletonComponent>{"│"}</SkeletonComponent>
                  </Fragment>
                );
              })}
            </Box>
          </Fragment>
        ))
      )}

      <SkeletonComponent>{footerLine}</SkeletonComponent>
    </Box>
  );
};

export default Table;
