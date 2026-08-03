import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  isDark?: boolean;
  name?: string;
  subtitle?: string;
}

/**
 * Precision logo mark — brand-primary stroke/fill via CSS tokens.
 * `isDark` only affects secondary text contrast; icon always uses brand.
 */
const Logo: React.FC<LogoProps> = ({
  className = '',
  width = 40,
  height = 40,
  isDark = false,
  name,
  subtitle,
}) => {
  const textColor = 'text-foreground';
  const iconColor = 'var(--brand-primary-500)';
  const accentColor = 'var(--brand-primary-700)';

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-3"
        aria-hidden="true"
      >
        <path
          d="M20 5L35 13V27L20 35L5 27V13L20 5Z"
          fill="none"
          stroke={iconColor}
          strokeWidth="2"
        />
        <path
          d="M20 35L20 20L35 13M20 20L5 13"
          stroke={iconColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="20" cy="20" r="2" fill={accentColor} />
        <path
          d="M12 16L28 16M12 24L28 24"
          stroke={accentColor}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
      {(name || subtitle) && (
        <div className="flex flex-col">
          {name && (
            <span className={`text-xl font-bold ${textColor} transition-colors duration-300`}>
              {name}
            </span>
          )}
          {subtitle && (
            <span
              className={`text-sm font-medium font-mono uppercase tracking-[0.14em] transition-colors duration-300 ${
                isDark ? 'text-muted-foreground' : 'text-muted-foreground'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
