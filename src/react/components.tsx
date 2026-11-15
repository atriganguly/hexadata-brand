import { useEffect, useId, useState } from 'react';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactElement, ReactNode } from 'react';

/**
 * Thin wrappers over the .hd-* CSS components (import '@hexadata/brand/all.css'). They add class names, sensible
 * ARIA defaults and nothing else: no styles of their own, no storage, no network. Brand changes never touch them.
 */
const cx = (...parts: (string | false | null | undefined)[]): string => parts.filter(Boolean).join(' ');

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
interface ButtonLook {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}
const buttonClass = ({ variant = 'primary', size = 'md', block }: ButtonLook, extra?: string): string =>
  cx('hd-btn', variant !== 'primary' && `hd-btn--${variant}`, size !== 'md' && `hd-btn--${size}`, block && 'hd-btn--block', extra);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonLook {}
export function Button({ variant, size, block, className, type = 'button', ...rest }: ButtonProps): ReactElement {
  return <button type={type} className={buttonClass({ variant, size, block }, className)} {...rest} />;
}

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, ButtonLook {}
/** A link that looks like a button (navigation is a link, not a button: keep the semantics). */
export function ButtonLink({ variant, size, block, className, ...rest }: ButtonLinkProps): ReactElement {
  return <a className={buttonClass({ variant, size, block }, className)} {...rest} />;
}

export type AlertTone = 'neutral' | 'accent' | 'danger' | 'warning' | 'success';
export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
}
export function Alert({ tone = 'neutral', className, role, ...rest }: AlertProps): ReactElement {
  const live = tone === 'danger' || tone === 'warning' ? 'alert' : 'status';
  return <div role={role ?? live} className={cx('hd-alert', tone !== 'neutral' && `hd-alert--${tone}`, className)} {...rest} />;
}

export type BadgeTone = 'neutral' | 'accent' | 'danger' | 'warning' | 'success';
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}
export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps): ReactElement {
  return <span className={cx('hd-badge', tone !== 'neutral' && `hd-badge--${tone}`, className)} {...rest} />;
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  alt?: boolean;
  interactive?: boolean;
}
export function Card({ alt, interactive, className, ...rest }: CardProps): ReactElement {
  return <div className={cx('hd-card', alt && 'hd-card--alt', interactive && 'hd-card--interactive', className)} {...rest} />;
}

export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>): ReactElement {
  return <div className={cx('hd-container', className)} {...rest} />;
}
export function Stack({ className, ...rest }: HTMLAttributes<HTMLDivElement>): ReactElement {
  return <div className={cx('hd-stack', className)} {...rest} />;
}
export function Cluster({ className, ...rest }: HTMLAttributes<HTMLDivElement>): ReactElement {
  return <div className={cx('hd-cluster', className)} {...rest} />;
}
export function Grid({ className, ...rest }: HTMLAttributes<HTMLDivElement>): ReactElement {
  return <div className={cx('hd-grid', className)} {...rest} />;
}

/** Announces progress to assistive tech; `label` is required so it is never silent. */
export function Spinner({ label, className, ...rest }: HTMLAttributes<HTMLSpanElement> & { label: string }): ReactElement {
  return (
    <span role="status" className={cx('hd-spinner', className)} {...rest}>
      <span className="hd-sr-only">{label}</span>
    </span>
  );
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: ReactNode;
  help?: ReactNode;
  /** When set the field is marked invalid and the message is linked via aria-describedby. */
  error?: ReactNode;
  id?: string;
}
/** Label + input + help + error, wired for assistive tech. Errors use a bar plus text, never colour alone. */
export function TextField({ label, help, error, id, className, ...rest }: TextFieldProps): ReactElement {
  const auto = useId();
  const fieldId = id ?? auto;
  const describedBy = [help ? `${fieldId}-help` : '', error ? `${fieldId}-error` : ''].filter(Boolean).join(' ');
  return (
    <div className="hd-field">
      <label className="hd-label" htmlFor={fieldId}>
        {label}
      </label>
      <input
        id={fieldId}
        className={cx('hd-input', className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
      {help ? (
        <p id={`${fieldId}-help`} className="hd-help">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${fieldId}-error`} className="hd-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Switches <html data-theme> between light and dark. Nothing is persisted; the choice lasts for the page view. */
export function ThemeToggle({ label = 'Dark mode', className, ...rest }: Omit<ButtonProps, 'children'> & { label?: string }): ReactElement {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const forced = document.documentElement.getAttribute('data-theme');
    setDark(forced ? forced === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);
  return (
    <Button
      variant="secondary"
      size="sm"
      className={className}
      aria-pressed={dark}
      onClick={() => {
        const next = dark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        setDark(next === 'dark');
      }}
      {...rest}
    >
      {label}
    </Button>
  );
}
