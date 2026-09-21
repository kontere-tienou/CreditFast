import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
  type SelectHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';

type OptionProps = {
  value?: string | number;
  disabled?: boolean;
  children?: unknown;
};

function readOptions(children: SelectHTMLAttributes<HTMLSelectElement>['children']) {
  const items: { value: string; label: string; disabled: boolean }[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== 'option') {
      return;
    }
    const el = child as ReactElement<OptionProps>;
    const value = el.props.value != null ? String(el.props.value) : String(el.props.children ?? '');
    const raw = el.props.children;
    const label = typeof raw === 'string' || typeof raw === 'number' ? String(raw) : value;
    items.push({ value, label, disabled: Boolean(el.props.disabled) });
  });
  return items;
}

export function CfSelect({
  children,
  className = '',
  value,
  defaultValue,
  onChange,
  disabled,
  id,
  name,
  required,
  style,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const listId = useId();
  const nativeRef = useRef<HTMLSelectElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const options = readOptions(children);
  const isControlled = value !== undefined;
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(() => String(defaultValue ?? options[0]?.value ?? ''));
  const current = isControlled ? String(value) : internal;
  const selected = options.find((item) => item.value === current) ?? options[0];
  const [menuBox, setMenuBox] = useState<{ top: number; left: number; width: number } | null>(null);

  const syncMenu = () => {
    const node = triggerRef.current;
    if (!node) {
      return;
    }
    const rect = node.getBoundingClientRect();
    const maxHeight = 240;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const openUp = spaceBelow < 120 && rect.top > spaceBelow;
    setMenuBox({
      top: openUp ? Math.max(8, rect.top - maxHeight - 4) : rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 160),
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    syncMenu();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    const onReposition = () => syncMenu();
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open]);

  const handleNativeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!isControlled) {
      setInternal(event.target.value);
    }
    onChange?.(event);
  };

  const commit = (next: string) => {
    if (nativeRef.current) {
      nativeRef.current.value = next;
    }
    if (!isControlled) {
      setInternal(next);
    }
    const select = nativeRef.current;
    if (select && onChange) {
      onChange({
        target: select,
        currentTarget: select,
      } as ChangeEvent<HTMLSelectElement>);
    }
    setOpen(false);
  };

  return (
    <div className="cf-select" style={style}>
      <select
        {...rest}
        ref={nativeRef}
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="cf-select-native"
        value={current}
        onChange={handleNativeChange}
      >
        {children}
      </select>
      <button
        ref={triggerRef}
        type="button"
        className={['cf-select-trigger', 'form-control', className].filter(Boolean).join(' ')}
        style={style}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (disabled) {
            return;
          }
          setOpen((was) => !was);
        }}
      >
        <span>{selected?.label ?? '—'}</span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'}`} aria-hidden="true"></i>
      </button>
      {open && menuBox
        ? createPortal(
            <ul
              ref={menuRef}
              id={listId}
              className="cf-select-menu"
              role="listbox"
              style={{ top: menuBox.top, left: menuBox.left, width: menuBox.width }}
            >
              {options.map((item) => {
                const isSelected = item.value === current;
                return (
                  <li key={item.value} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={item.disabled}
                      className={`cf-select-option${isSelected ? ' is-selected' : ''}`}
                      onClick={() => {
                        if (!item.disabled) {
                          commit(item.value);
                        }
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>,
            document.body,
          )
        : null}
    </div>
  );
}
