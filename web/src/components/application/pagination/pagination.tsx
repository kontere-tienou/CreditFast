import { cx } from '@/utils/cx';

type PaginationProps = {
  page: number;
  total: number;
  className?: string;
  onPageChange?: (page: number) => void;
};

export function PaginationPageMinimalCenter({ page, total, className, onPageChange }: PaginationProps) {
  const last = Math.max(total, 1);
  const pages = Array.from({ length: last }, (_, index) => index + 1);
  const visible =
    pages.length > 5 ? [1, Math.min(2, last), Math.min(3, last), '...', last].filter((item, index, list) => list.indexOf(item) === index) : pages;

  return (
    <nav className={cx('cf-table-pagination', className)} aria-label="Pagination">
      <button type="button" className="cf-table-page-btn" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)} title="Page précédente">
        <i className="fas fa-chevron-left"></i>
      </button>
      <div className="cf-table-page-list">
        {visible.map((item, index) =>
          item === '...' ? (
            <span key={`ellipsis-${index}`} className="cf-table-page-ellipsis">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={cx('cf-table-page-num', page === item && 'is-active')}
              onClick={() => onPageChange?.(Number(item))}
            >
              {item}
            </button>
          ),
        )}
      </div>
      <button type="button" className="cf-table-page-btn" disabled={page >= last} onClick={() => onPageChange?.(page + 1)} title="Page suivante">
        <i className="fas fa-chevron-right"></i>
      </button>
    </nav>
  );
}
