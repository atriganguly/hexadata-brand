import type { HTMLAttributes, ReactElement } from 'react';
import { useHexaBrand } from './HexaProvider.js';

export interface HexaTaglineProps extends Omit<HTMLAttributes<HTMLParagraphElement>, 'children'> {
  variant?: 'primary' | 'secondary';
}

/** Renders a brand tagline as plain text (React-escaped). */
export function HexaTagline({ variant = 'primary', ...rest }: HexaTaglineProps): ReactElement {
  const { taglines } = useHexaBrand().tokens;
  return <p {...rest}>{taglines[variant]}</p>;
}
