import { Box, Button, InlineGrid, InlineStack } from "@shopify/polaris";

import { XIcon } from "@shopify/polaris-icons";

interface RemoveableProps {
  index: number;
  children: any;
  onRemove: (index: number) => void;
}

export function Removeable({ index, children, onRemove }: RemoveableProps) {
  return (
    <InlineStack align="space-between">
      {/* <Box key={`content-${index}`}>{children}</Box> */}
      {children}
      <InlineGrid alignItems="center">
        <Button
          key={`btn-rm-${index}`}
          tone="critical"
          onClick={() => onRemove(index)}
          icon={XIcon}
        ></Button>
      </InlineGrid>
    </InlineStack>
  );
}
