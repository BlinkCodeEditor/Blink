import { useState, useRef, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faExclamationCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import './_ProblemsPanel.scss';

interface ProblemsPanelProps {
    markers: any[];
    onClose: () => void;
    onJump: (path: string, line: number, column: number) => void;
}

export default function ProblemsPanel({ markers, onClose, onJump }: ProblemsPanelProps) {
    const [height, setHeight] = useState(300);
    const isResizing = useRef(false);

    const startResizing = useCallback(() => {
        isResizing.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'ns-resize';
    }, []);

    const stopResizing = useCallback(() => {
        isResizing.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'default';
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current) return;
        
        // Calculate new height based on mouse position from bottom
        const newHeight = window.innerHeight - e.clientY - 40; // 40px for bottom bar
        if (newHeight > 100 && newHeight < window.innerHeight * 0.8) {
            setHeight(newHeight);
        }
    }, []);

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', stopResizing);
        };
    }, [handleMouseMove, stopResizing]);

    const getNameFromUri = (uri: any) => {
        if (!uri) return 'Unknown';
        const str = uri.toString();
        return str.split('/').pop() || str;
    };

    const getPathFromUri = (uri: any) => {
        if (!uri) return '';
        const str = uri.toString();
        return str.replace(/^file:\/\//, '');
    };

    return (
        <div className="problems_panel" style={{ height: `${height}px` }}>
            <div className="resize_handle" onMouseDown={startResizing} />
            <div className="problems_header">
                <span className="title">Problems ({markers.length})</span>
                <button className="close_btn" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
            <div className="problems_list">
                {markers.length > 0 ? (
                    markers.map((marker, index) => (
                        <div 
                            key={index} 
                            className={`problem_item ${marker.severity === 8 ? 'error' : 'warning'}`}
                            onClick={() => onJump(getPathFromUri(marker.resource), marker.startLineNumber, marker.startColumn)}
                        >
                            <FontAwesomeIcon 
                                icon={marker.severity === 8 ? faTimesCircle : faExclamationCircle} 
                                className="icon"
                            />
                            <div className="problem_details">
                                <span className="message">{marker.message}</span>
                                <span className="location">
                                    {getNameFromUri(marker.resource)} [Ln {marker.startLineNumber}, Col {marker.startColumn}]
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no_problems">No problems have been detected in the workspace.</div>
                )}
            </div>
        </div>
    );
}
