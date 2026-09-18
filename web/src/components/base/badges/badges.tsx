import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import type { BadgeTypes } from './badge-types';

export type BadgeColor =
  | 'gray'
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'blue'
  | 'indigo';

type BadgeProps = {
  children: ReactNode;
  color?: BadgeColor;
  size?: 'sm' | 'md';
  type?: BadgeTypes;
  className?: string;
};

const COLOR_CLASS: Record<BadgeColor, string> = {
  gray: 'cf-badge-gray',
  brand: 'cf-badge-brand',
  success: 'cf-badge-success',
  warning: 'cf-badge-warning',
  error: 'cf-badge-error',
  blue: 'cf-badge-blue',
  indigo: 'cf-badge-indigo',
};

export function Badge({ children, color = 'gray', size = 'sm', className }: BadgeProps) {
  return (
    <span className={cx('cf-ui-badge', COLOR_CLASS[color], size === 'md' && 'cf-ui-badge-md', className)}>
      <span className="cf-ui-badge-label">{children}</span>
    </span>
  );
}

export function BadgeWithDot({ children, color = 'gray', size = 'sm', type: _type, className }: BadgeProps) {
  return (
    <span className={cx('cf-ui-badge', COLOR_CLASS[color], size === 'md' && 'cf-ui-badge-md', className)}>
      <span className="cf-ui-badge-dot" />
      <span className="cf-ui-badge-label">{children}</span>
    </span>
  );
}
