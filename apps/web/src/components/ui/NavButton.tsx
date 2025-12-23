import React from 'react';
import { Button } from './button';

interface NavButtonProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function NavButton({ 
  children, 
  isActive = false, 
  onClick,
  className = ''
}: NavButtonProps) {
  return (
    <Button
      variant="ghost"
      className={`
        relative font-medium transition-all duration-300 ease-in-out
        px-4 py-2 rounded-t-lg rounded-b-none
        hover:backdrop-blur-md hover:text-white
        ${isActive 
          ? 'text-white backdrop-blur-md' 
          : 'text-white'
        }
        ${className}
      `}
      onClick={onClick}
      style={{
        backgroundColor: isActive 
          ? 'rgba(127, 228, 26, 0.15)' 
          : 'transparent',
        borderBottom: isActive 
          ? '2px solid #7fe41a' 
          : '2px solid transparent',
        borderBottomLeftRadius: '0',
        borderBottomRightRadius: '0',
        color: '#ffffff', // Força a cor sempre branca
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.target as HTMLElement).style.backgroundColor = 'rgba(127, 228, 26, 0.08)';
        }
        (e.target as HTMLElement).style.color = '#ffffff'; // Mantém branco no hover
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.target as HTMLElement).style.backgroundColor = 'transparent';
        }
        (e.target as HTMLElement).style.color = '#ffffff'; // Mantém branco após hover
      }}
    >
      {children}
    </Button>
  );
}