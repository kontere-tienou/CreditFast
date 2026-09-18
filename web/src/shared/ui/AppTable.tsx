import { useEffect, useMemo, useState, type Key, type ReactNode } from 'react';
import type { SortDescriptor } from 'react-aria-components';
import { PaginationPageMinimalCenter } from '@/components/application/pagination/pagination';
import { Table, TableCard } from '@/components/application/table/table';
import { DropdownIconSimple } from '@/components/base/dropdown/dropdown-icon-simple';
import { cx } from '@/utils/cx';

export type AppTableColumn<T> = {
  id: string;
  label?: string;
  allowsSorting?: boolean;
  isRowHeader?: boolean;
  className?: string;
  tooltip?: string;
  render: (item: T) => ReactNode;
};

type AppTableProps<T extends { id: string }> = {
  title: string;
  badge?: ReactNode;
  description?: string;
  items: T[];
  columns: AppTableColumn<T>[];
  selectionMode?: 'none' | 'single' | 'multiple';
  pageSize?: number;
  defaultSort?: SortDescriptor;
  onRowAction?: (key: Key) => void;
  rowClassName?: (item: T) => string | undefined;
  showMenu?: boolean;
  chrome?: 'card' | 'plain';
  className?: string;
};

function compareValues(first: unknown, second: unknown, direction: SortDescriptor['direction']) {
  if ((typeof first === 'number' && typeof second === 'number') || (typeof first === 'boolean' && typeof second === 'boolean')) {
    return direction === 'descending' ? Number(second) - Number(first) : Number(first) - Number(second);
  }

  if (typeof first === 'string' && typeof second === 'string') {
    const cmp = first.localeCompare(second, 'fr');
    return direction === 'descending' ? cmp * -1 : cmp;
  }

  return 0;
}

export function AppTable<T extends { id: string }>({
  title,
  badge,
  description,
  items,
  columns,
  selectionMode = 'none',
  pageSize = 6,
  defaultSort,
  onRowAction,
  rowClassName,
  showMenu = false,
  chrome = 'card',
  className,
}: AppTableProps<T>) {
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>(
    defaultSort ?? { column: columns[0]?.id ?? 'id', direction: 'ascending' },
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const sortedItems = useMemo(() => {
    const columnId = String(sortDescriptor.column);
    const copy = [...items];

    copy.sort((a, b) => {
      const recordA = a as Record<string, unknown>;
      const recordB = b as Record<string, unknown>;
      return compareValues(recordA[columnId], recordB[columnId], sortDescriptor.direction);
    });

    return copy;
  }, [items, sortDescriptor]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const table = (
    <>
      <Table
        aria-label={title}
        selectionMode={selectionMode}
        sortDescriptor={sortDescriptor}
        onSortChange={(next) => {
          setSortDescriptor(next);
          setPage(1);
        }}
        onRowAction={onRowAction}
      >
        <Table.Header>
          {columns.map((column) => (
            <Table.Head
              key={column.id}
              id={column.id}
              label={column.label}
              isRowHeader={column.isRowHeader}
              allowsSorting={column.allowsSorting}
              tooltip={column.tooltip}
              className={column.className}
            />
          ))}
        </Table.Header>
        <Table.Body items={pageItems}>
          {(item) => (
            <Table.Row id={item.id} className={rowClassName?.(item)}>
              {columns.map((column) => (
                <Table.Cell key={column.id} className={column.className}>
                  {column.render(item)}
                </Table.Cell>
              ))}
            </Table.Row>
          )}
        </Table.Body>
      </Table>
      {sortedItems.length > pageSize ? (
        <PaginationPageMinimalCenter
          page={currentPage}
          total={totalPages}
          onPageChange={setPage}
          className="cf-table-pagination-pad"
        />
      ) : null}
    </>
  );

  if (chrome === 'plain') {
    return <div className={cx('cf-table-plain', className)}>{table}</div>;
  }

  return (
    <TableCard.Root className={className}>
      <TableCard.Header
        title={title}
        badge={badge}
        description={description}
        contentTrailing={
          showMenu ? (
            <div className="cf-table-card-menu">
              <DropdownIconSimple />
            </div>
          ) : null
        }
      />
      {table}
    </TableCard.Root>
  );
}
