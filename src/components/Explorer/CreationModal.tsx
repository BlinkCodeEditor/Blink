import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFileCirclePlus, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import './_CreationModal.scss';

interface CreationModalProps {
    isOpen: boolean;
    type: 'file' | 'folder';
    onClose: () => void;
    onCreate: (name: string) => void;
    initialValue?: string;
}

export default function CreationModal({ isOpen, type, onClose, onCreate, initialValue = '' }: CreationModalProps) {
    const [name, setName] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName(initialValue);
            // Focus input when modal opens
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate(name.trim());
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="creation_modal_overlay" onClick={onClose}>
            <div 
                className="creation_modal" 
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <div className="creation_modal_header">
                    <div className="title_area">
                        <FontAwesomeIcon icon={type === 'file' ? faFileCirclePlus : faFolderPlus} className="type_icon" />
                        <h3>New {type === 'file' ? 'File' : 'Folder'}</h3>
                    </div>
                    <button className="close_btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="creation_modal_content">
                    <div className="input_group">
                        <label htmlFor="item-name">Enter name</label>
                        <input
                            id="item-name"
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={`my-${type}${type === 'file' ? '.txt' : ''}`}
                            autoComplete="off"
                        />
                    </div>
                    
                    <div className="creation_modal_footer">
                        <button type="button" className="cancel_btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="create_btn" disabled={!name.trim()}>
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
