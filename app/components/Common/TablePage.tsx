import {
  BlockStack,
  Box,
  Button,
  EmptyState,
  IndexTable,
  InlineGrid,
  InlineStack,
  Pagination,
  Text,
  TextField,
} from "@shopify/polaris";
import { EnterIcon } from "@shopify/polaris-icons";
import { IndexTableHeading } from "@shopify/polaris/build/ts/src/components/IndexTable";
import { NonEmptyArray } from "@shopify/polaris/build/ts/src/types";
import { useEffect, useState } from "react";

type TablePaginationProps<T> = {
  data: T[];
  maxPage: number;
  pageCount?: number; // Default is 20
  headings: NonEmptyArray<IndexTableHeading>;
  children?: React.ReactNode;
  emptyState?: React.ReactNode;
  onLoad?: (pageNumber: number) => void;
};

export function TablePagination<T>({
  data,
  maxPage,
  pageCount,
  headings,
  children,
  emptyState,
  onLoad,
}: TablePaginationProps<T>) {
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!loaded) {
      setLoaded(true);
    }
  });

  useEffect(() => {
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [maxPage]);

  const handleNext = () => {
    if (onLoad) {
      var newPage = page + 1;
      setPage(newPage);
      onLoad(newPage);
    }
  };
  const handlePrev = () => {
    if (onLoad) {
      var newPage = page - 1;
      setPage(newPage);
      onLoad(newPage);
    }
  };

  return !loaded || !data?.length ? (
    <div></div>
  ) : (
    <BlockStack gap={"100"}>
      <IndexTable
        itemCount={data?.length || 0}
        selectable={false}
        headings={headings}
        emptyState={emptyState}
      >
        {children}
      </IndexTable>

      <Pagination
        type="table"
        onNext={handleNext}
        onPrevious={handlePrev}
        label={
          <InlineStack gap={"200"}>
            <Box width="150px">
              <TextField
                autoComplete="off"
                label=""
                align="center"
                size="slim"
                prefix={"Go to"}
                connectedRight={<Button icon={EnterIcon}></Button>}
              />
            </Box>
            <Text as="p">
              {page}/{maxPage}
            </Text>
          </InlineStack>
        }
        hasNext={maxPage > page}
        hasPrevious={page != 1}
      />
    </BlockStack>
  );
}
