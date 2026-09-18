import type { ButtonHTMLAttributes, ComponentType, SVGProps } from 'react';
import { cx } from '@/utils/cx';

type ButtonUtilityProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tooltip?: string;
  size?: 'xs' | 'sm';
  color?: 'tertiary' | 'secondary';
};

export function ButtonUtility({
  icon: Icon,
  tooltip,
  size = 'xs',
  color = 'tertiary',
  className,
  type = 'button',
  ...props
}: ButtonUtilityProps) {
  return (
    <button
      type={type}
      title={tooltip}
      className={cx('cf-button-utility', size === 'xs' && 'cf-button-utility-xs', color === 'tertiary' && 'cf-button-utility-tertiary', className)}
      {...props}
    >
      <Icon />
    </button>
  );
}
