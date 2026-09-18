import { cx } from '@/utils/cx';

type PaginationProps = {
  page: number;
  total: number;
  className?: string;
  onPageChange?: (page: number) => void;
};

export function PaginationPageMinimalCenter({ page, total, className, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: Math.max(total, 1) }, (_, index) => index + 1);
  const visible = pages.length > 7 ? [1, 2, 3, '...', pages.length - 1, pages.length] : pages;

  return (
    <nav className={cx('cf-table-pagination', className)} aria-label="Pagination">
      <button
        type="button"
        className="cf-table-page-btn"
        disabled={page <= 1}
        onClick={() => onPageChange?.(page - 1)}
      >
        Précédent
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
      <button
        type="button"
        className="cf-table-page-btn"
        disabled={page >= total}
        onClick={() => onPageChange?.(page + 1)}
      >
        Suivant
      </button>
    </nav>
  );
}
