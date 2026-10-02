import React from 'react';

export default function PageContainer({ 
  children, 
  title, 
  description,
  actions,
  fullWidth = false,
  className = "" 
}) {
  return (
    <div className={`h-full flex flex-col ${className}`}>
      {(title || actions) && (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 ${fullWidth ? 'px-6 pt-6' : ''}`}>
          <div>
            {title && <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{title}</h1>}
            {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
