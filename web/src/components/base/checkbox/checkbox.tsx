import type { CheckboxProps } from 'react-aria-components';
import { Checkbox as AriaCheckbox } from 'react-aria-components';
import { cx } from '@/utils/cx';

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <AriaCheckbox
      {...props}
      className={(state) => cx('cf-table-checkbox', typeof className === 'function' ? className(state) : className)}
    >
      {({ isSelected }) => (
        <span className={cx('cf-table-checkbox-box', isSelected && 'is-checked')}>{isSelected ? '✓' : ''}</span>
      )}
    </AriaCheckbox>
  );
}
