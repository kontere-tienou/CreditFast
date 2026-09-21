import { cx } from '@/utils/cx';

type AvatarProps = {
  src?: string;
  alt: string;
  size?: 'sm' | 'md';
  className?: string;
};

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cx('cf-ui-avatar', size === 'sm' ? 'cf-ui-avatar-sm' : 'cf-ui-avatar-md', className)}
    />
  );
}
