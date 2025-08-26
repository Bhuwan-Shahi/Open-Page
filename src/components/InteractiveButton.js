'use client'

import Link from "next/link";

export default function InteractiveButton({ href, children, variant = "primary", className = "", size = "default", ...props }) {
  const getButtonStyles = () => {
    if (variant === "primary") {
      return {
        backgroundColor: '#4A90E2',
        hoverColor: '#357ABD'
      };
    } else if (variant === "secondary") {
      return {
        backgroundColor: '#6C757D',
        hoverColor: '#5A6268'
      };
    }
    return {
      backgroundColor: '#4A90E2',
      hoverColor: '#357ABD'
    };
  };

  const getSizeStyles = () => {
    if (size === "sm") {
      return "px-4 py-2 text-sm";
    } else if (size === "large") {
      return "px-10 py-4 text-xl";
    }
    return "px-8 py-3 text-lg";
  };

  const { backgroundColor, hoverColor } = getButtonStyles();

  return (
    <Link 
      href={href}
      className={`${getSizeStyles()} rounded-lg font-semibold transition-colors text-white ${className}`}
      style={{ backgroundColor }}
      onMouseEnter={(e) => e.target.style.backgroundColor = hoverColor}
      onMouseLeave={(e) => e.target.style.backgroundColor = backgroundColor}
      {...props}
    >
      {children}
    </Link>
  );
}
