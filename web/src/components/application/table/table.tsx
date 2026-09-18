import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, Ref, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { createContext, isValidElement, useContext } from 'react';
import { ArrowDown, ChevronSelectorVertical, Copy01, Edit01, HelpCircle, Trash01 } from '@untitledui/icons';
import type {
  CellProps as AriaCellProps,
  ColumnProps as AriaColumnProps,
  RowProps as AriaRowProps,
  TableHeaderProps as AriaTableHeaderProps,
  TableProps as AriaTableProps,
} from 'react-aria-components';
import {
  Cell as AriaCell,
  Collection as AriaCollection,
  Column as AriaColumn,
  Group as AriaGroup,
  Row as AriaRow,
  Table as AriaTable,
  TableBody as AriaTableBody,
  TableHeader as AriaTableHeader,
  useTableOptions,
} from 'react-aria-components';
import { Badge } from '@/components/base/badges/badges';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';
import { cx } from '@/utils/cx';

export const TableRowActionsDropdown = () => (
  <Dropdown.Root>
    <Dropdown.DotsButton />
    <Dropdown.Popover className="w-min">
      <Dropdown.Menu>
        <Dropdown.Item icon={Edit01}>Edit</Dropdown.Item>
        <Dropdown.Item icon={Copy01}>Copy link</Dropdown.Item>
        <Dropdown.Item icon={Trash01}>Delete</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown.Popover>
  </Dropdown.Root>
);

const TableContext = createContext<{ size: 'sm' | 'md' }>({ size: 'md' });

const TableCardRoot = ({
  children,
  className,
  size = 'md',
  ...props
}: HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' }) => {
  return (
    <TableContext.Provider value={{ size }}>
      <div {...props} className={cx('cf-table-card', size === 'sm' && 'cf-table-card-sm', className)}>
        {children}
      </div>
    </TableContext.Provider>
  );
};

interface TableCardHeaderProps {
  title: string;
  badge?: ReactNode;
  description?: string;
  contentTrailing?: ReactNode;
  className?: string;
}

const TableCardHeader = ({ title, badge, description, contentTrailing, className }: TableCardHeaderProps) => {
  const { size } = useContext(TableContext);

  return (
    <div className={cx('cf-table-card-header', size === 'sm' && 'cf-table-card-header-sm', className)}>
      <div className="cf-table-card-header-main">
        <div className="cf-table-card-title-row">
          <h3 className="cf-table-card-title">{title}</h3>
          {badge ? (
            isValidElement(badge) ? (
              badge
            ) : (
              <Badge color="brand" size="sm">
                {badge}
              </Badge>
            )
          ) : null}
        </div>
        {description ? <p className="cf-table-card-description">{description}</p> : null}
      </div>
      {contentTrailing}
    </div>
  );
};

interface TableRootProps extends AriaTableProps, Omit<ComponentPropsWithRef<'table'>, 'className' | 'slot' | 'style'> {
  size?: 'sm' | 'md';
}

const TableRoot = ({ className, size = 'md', ...props }: TableRootProps) => {
  const context = useContext(TableContext);

  return (
    <TableContext.Provider value={{ size: context?.size ?? size }}>
      <div className="cf-table-scroll">
        <AriaTable
          className={(state) => cx('cf-table', typeof className === 'function' ? className(state) : className)}
          {...props}
        />
      </div>
    </TableContext.Provider>
  );
};
TableRoot.displayName = 'Table';

interface TableHeaderProps<T extends object = object>
  extends AriaTableHeaderProps<T>,
    Omit<ComponentPropsWithRef<'thead'>, 'children' | 'className' | 'slot' | 'style'> {
  bordered?: boolean;
  size?: 'sm' | 'md';
}

const TableHeader = <T extends object>({
  columns,
  children,
  bordered = true,
  className,
  size: sizeProp,
  ...props
}: TableHeaderProps<T>) => {
  const context = useContext(TableContext);
  const { selectionBehavior, selectionMode } = useTableOptions();
  const size = sizeProp ?? context.size;

  return (
    <AriaTableHeader
      {...props}
      className={(state) =>
        cx(
          'cf-table-header',
          size === 'sm' ? 'cf-table-header-sm' : 'cf-table-header-md',
          bordered && 'cf-table-header-bordered',
          typeof className === 'function' ? className(state) : className,
        )
      }
    >
      {selectionBehavior === 'toggle' ? (
        <AriaColumn className="cf-table-select-col">
          {selectionMode === 'multiple' ? <Checkbox slot="selection" /> : null}
        </AriaColumn>
      ) : null}
      <AriaCollection items={columns}>{children}</AriaCollection>
    </AriaTableHeader>
  );
};

TableHeader.displayName = 'TableHeader';

interface TableHeadProps extends AriaColumnProps, Omit<ThHTMLAttributes<HTMLTableCellElement>, 'children' | 'className' | 'style' | 'id'> {
  label?: string;
  tooltip?: string;
}

const TableHead = ({ className, tooltip, label, children, ...props }: TableHeadProps) => {
  const { selectionBehavior } = useTableOptions();

  return (
    <AriaColumn
      {...props}
      className={(state) =>
        cx(
          'cf-table-head',
          selectionBehavior === 'toggle' && 'cf-table-head-after-select',
          state.allowsSorting && 'cf-table-head-sortable',
          typeof className === 'function' ? className(state) : className,
        )
      }
    >
      {(state) => (
        <AriaGroup className="cf-table-head-inner">
          {label ? <span>{label}</span> : null}
          {typeof children === 'function' ? children(state) : children}
          {tooltip ? (
            <TooltipTrigger>
              <Tooltip title={tooltip}>
                <HelpCircle className="cf-table-head-help" />
              </Tooltip>
            </TooltipTrigger>
          ) : null}
          {state.allowsSorting ? (
            state.sortDirection ? (
              <ArrowDown className={cx('cf-table-sort-icon', state.sortDirection === 'descending' && 'cf-table-sort-desc')} />
            ) : (
              <ChevronSelectorVertical className="cf-table-sort-icon cf-table-sort-idle" />
            )
          ) : null}
        </AriaGroup>
      )}
    </AriaColumn>
  );
};
TableHead.displayName = 'TableHead';

interface TableRowProps
  extends AriaRowProps<object>,
    Omit<ComponentPropsWithRef<'tr'>, 'children' | 'className' | 'onClick' | 'slot' | 'style' | 'id'> {
  highlightSelectedRow?: boolean;
  size?: 'sm' | 'md';
}

const TableRow = ({ columns, children, className, highlightSelectedRow = true, size: sizeProp, ...props }: TableRowProps) => {
  const context = useContext(TableContext);
  const { selectionBehavior } = useTableOptions();
  const size = sizeProp ?? context.size;

  return (
    <AriaRow
      {...props}
      className={(state) =>
        cx(
          'cf-table-row',
          size === 'sm' ? 'cf-table-row-sm' : 'cf-table-row-md',
          highlightSelectedRow && 'cf-table-row-selectable',
          typeof className === 'function' ? className(state) : className,
        )
      }
    >
      {selectionBehavior === 'toggle' ? (
        <AriaCell className="cf-table-select-col">
          <Checkbox slot="selection" />
        </AriaCell>
      ) : null}
      <AriaCollection items={columns}>{children}</AriaCollection>
    </AriaRow>
  );
};

TableRow.displayName = 'TableRow';

interface TableCellProps extends AriaCellProps, Omit<TdHTMLAttributes<HTMLTableCellElement>, 'children' | 'className' | 'style' | 'id'> {
  ref?: Ref<HTMLTableCellElement>;
  size?: 'sm' | 'md';
}

const TableCell = ({ className, children, size: sizeProp, ...props }: TableCellProps) => {
  const context = useContext(TableContext);
  const { selectionBehavior } = useTableOptions();
  const size = sizeProp ?? context.size;

  return (
    <AriaCell
      {...props}
      className={(state) =>
        cx(
          'cf-table-cell',
          size === 'sm' ? 'cf-table-cell-sm' : 'cf-table-cell-md',
          selectionBehavior === 'toggle' && 'cf-table-cell-after-select',
          typeof className === 'function' ? className(state) : className,
        )
      }
    >
      {children}
    </AriaCell>
  );
};
TableCell.displayName = 'TableCell';

const TableCard = {
  Root: TableCardRoot,
  Header: TableCardHeader,
};

const Table = TableRoot as typeof TableRoot & {
  Body: typeof AriaTableBody;
  Cell: typeof TableCell;
  Head: typeof TableHead;
  Header: typeof TableHeader;
  Row: typeof TableRow;
};
Table.Body = AriaTableBody;
Table.Cell = TableCell;
Table.Head = TableHead;
Table.Header = TableHeader;
Table.Row = TableRow;

export { Table, TableCard };
