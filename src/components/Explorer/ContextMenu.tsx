import React from 'react';

interface ContextMenuProps {
    x: number;
    y: number;
    options: {
        label: string;
        onClick: () => void;
        icon?: any;
        danger?: boolean;
    }[];
    onClose: () => void;
}

export default function ContextMenu({ x, y, options, onClose }: ContextMenuProps) {
    React.useEffect(() => {
        const handleClickOutside = () => onClose();
        window.addEventListener('click', handleClickOutside);
        window.addEventListener('contextmenu', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
            window.removeEventListener('contextmenu', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div 
            className="context-menu" 
            style={{ top: y, left: x }}
            onClick={(e) => e.stopPropagation()}
        >
            {options.map((option, index) => (
                <div 
                    key={index} 
                    className={`context-menu-item ${option.danger ? 'danger' : ''}`}
                    onClick={() => {
                        option.onClick();
                        onClose();
                    }}
                >
                    {option.label}
                </div>
            ))}
        </div>
    );
}
