import React from "react";
import { Box, Text } from "ink";

interface HeaderProps {
  title: string;
  instructions: string;
  lastUpdated: Date | null;
  metadataError: string | null;
  fundingError: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  instructions,
  lastUpdated,
  metadataError,
  fundingError,
}) => (
  <Box marginBottom={1} flexDirection="column">
    <Text>{title}</Text>
    <Text color="gray">{instructions}</Text>
    {lastUpdated && <Text color="gray">Last update: {lastUpdated.toLocaleTimeString()}</Text>}
    {metadataError && <Text color="red">Metadata error: {metadataError}</Text>}
    {fundingError && <Text color="red">Funding error: {fundingError}</Text>}
  </Box>
);
