import React, { useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';

export const ContextMenu: React.FC = () => {
  const { showContextMenu, contextMenuPosition, contextMenuItems, hideContextMenu } = useUIStore();

  useEffect(() => {
    const handleClickOutside = () => {
      if (showContextMenu) {
        hideContextMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showContextMenu) {
        hideContextMenu();
      }
    };

    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showContextMenu, hideContextMenu]);

  if (!showContextMenu) return null;

  return (
    <div
      className="fixed z-50 bg-dark-800 border border-dark-700 rounded-lg shadow-xl py-2 min-w-48"
      style={{
        left: contextMenuPosition.x,
        top: contextMenuPosition.y,
      }}
    >
      {contextMenuItems.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.action();
            hideContextMenu();
          }}
          className="w-full px-4 py-2 text-left hover:bg-dark-700 transition-colors flex items-center gap-3"
        >
          {item.icon && <span className="text-dark-400">{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};