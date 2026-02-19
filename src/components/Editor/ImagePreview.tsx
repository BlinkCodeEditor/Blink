import './_ImagePreview.scss';

interface ImagePreviewProps {
    path: string;
    name: string;
}

export default function ImagePreview({ path, name }: ImagePreviewProps) {
    // Construct URL for the custom protocol using a fixed host for reliable parsing.
    const resourceUrl = `blink-resource://localhost/${path}`;

    return (
        <div className="image-preview">
            <div className="image-preview__container">
                <img src={resourceUrl} alt={name} className="image-preview__img" />
                <div className="image-preview__info">
                    <span className="image-preview__filename">{name}</span>
                    <span className="image-preview__path">{path}</span>
                </div>
            </div>
        </div>
    );
}
