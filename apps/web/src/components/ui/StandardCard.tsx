import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface StandardCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export default function StandardCard({ 
  title, 
  description, 
  children, 
  className = "",
  headerAction 
}: StandardCardProps) {
  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-lg ${className}`}
      style={{ 
        backgroundColor: '#000000', 
        borderColor: 'rgba(127, 228, 26, 0.3)',
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
    >
      {(title || headerAction) && (
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              {title && (
                <CardTitle 
                  className="text-lg font-semibold"
                  style={{ color: '#ffffff' }}
                >
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription 
                  className="mt-1"
                  style={{ color: '#9f9fa9' }}
                >
                  {description}
                </CardDescription>
              )}
            </div>
            {headerAction && (
              <div className="ml-4 flex-shrink-0">
                {headerAction}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={title || headerAction ? "pt-0" : "p-6"}>
        {children}
      </CardContent>
    </Card>
  );
}