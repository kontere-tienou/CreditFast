import { isValidElement, useEffect, useMemo, useState, type Key, type ReactNode } from 'react';
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
  searchable?: boolean;
  searchPlaceholder?: string;
  headerActions?: ReactNode;
  chrome?: 'card' | 'plain';
  className?: string;
};

function asTableCell(content: ReactNode): ReactNode {
  if (content != null && typeof content === 'object' && !isValidElement(content) && !Array.isArray(content)) {
    try {
      return JSON.stringify(content);
    } catch {
      return String(content);
    }
  }
  return content;
}

function cellTitle(content: ReactNode): string | undefined {
  if (typeof content === 'string' || typeof content === 'number') {
    return String(content);
  }
  return undefined;
}

function isActionsColumn(column: { id: string; className?: string }) {
  return column.id === 'actions' || Boolean(column.className?.includes('actions'));
}

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

function searchableText(item: object) {
  return Object.values(item)
    .flatMap((value) => {
      if (value == null || typeof value === 'function') {
        return [];
      }
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return [String(value)];
      }
      return [];
    })
    .join(' ')
    .toLowerCase();
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
  showMenu,
  searchable = true,
  searchPlaceholder = 'Rechercher…',
  headerActions,
  chrome = 'card',
  className,
}: AppTableProps<T>) {
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>(
    defaultSort ?? { column: columns.find((column) => column.id !== 'actions')?.id ?? columns[0]?.id ?? 'id', direction: 'ascending' },
  );
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const menuVisible = showMenu ?? chrome === 'card';

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return items;
    }
    return items.filter((item) => searchableText(item).includes(needle));
  }, [items, query]);

  useEffect(() => {
    setPage(1);
  }, [items.length, query]);

  const sortedItems = useMemo(() => {
    const columnId = String(sortDescriptor.column);
    const copy = [...filteredItems];

    copy.sort((a, b) => {
      const recordA = a as Record<string, unknown>;
      const recordB = b as Record<string, unknown>;
      return compareValues(recordA[columnId], recordB[columnId], sortDescriptor.direction);
    });

    return copy;
  }, [filteredItems, sortDescriptor]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = sortedItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, sortedItems.length);
  const pageItems = sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toolbar = (
    <div className="cf-table-toolbar">
      {searchable ? (
        <label className="cf-table-search">
          <i className="fas fa-magnifying-glass" aria-hidden></i>
          <input
            type="search"
            value={query}
            placeholder={searchPlaceholder}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={searchPlaceholder}
          />
        </label>
      ) : null}
      {headerActions}
      {menuVisible ? (
        <div className="cf-table-card-menu">
          <DropdownIconSimple />
        </div>
      ) : null}
    </div>
  );

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
              {columns.map((column) => {
                const content = asTableCell(column.render(item));
                const skipTruncate = isActionsColumn(column);
                const record = item as Record<string, unknown>;
                const titleAttr =
                  cellTitle(content) ?? (typeof record[column.id] === 'string' ? record[column.id] : undefined);
                return (
                  <Table.Cell key={column.id} className={column.className}>
                    {skipTruncate ? (
                      content
                    ) : (
                      <span className="cf-table-truncate" title={typeof titleAttr === 'string' ? titleAttr : undefined}>
                        {content}
                      </span>
                    )}
                  </Table.Cell>
                );
              })}
            </Table.Row>
          )}
        </Table.Body>
      </Table>
      <div className="cf-table-footer">
        <p className="cf-table-showing">
          Affichage {start} – {end} sur {sortedItems.length} entrée{sortedItems.length > 1 ? 's' : ''}
        </p>
        {sortedItems.length > pageSize ? (
          <PaginationPageMinimalCenter page={currentPage} total={totalPages} onPageChange={setPage} />
        ) : null}
      </div>
    </>
  );

  if (chrome === 'plain') {
    return (
      <div className={cx('cf-table-plain', className)}>
        {(searchable || headerActions || menuVisible) && (title || toolbar) ? (
          <div className="cf-table-card-header cf-table-plain-header">
            <div className="cf-table-card-header-main">
              <div className="cf-table-card-title-row">
                <h3 className="cf-table-card-title">{title}</h3>
                {badge}
              </div>
            </div>
            {toolbar}
          </div>
        ) : null}
        {table}
      </div>
    );
  }

  return (
    <TableCard.Root className={className}>
      <TableCard.Header title={title} badge={badge} description={description} contentTrailing={toolbar} />
      {table}
    </TableCard.Root>
  );
}
