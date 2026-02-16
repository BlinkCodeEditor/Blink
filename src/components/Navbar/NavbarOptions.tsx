import {
    faWindowRestore,
    faWindowMinimize,
    faXmark,
    faExpand,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useWindowControls } from "../../hooks/useWindowControls";

export default function NavbarOptions() {
    const { isMaximized, minimize, toggleMaximize, close } = useWindowControls();

    const options = [
        {
            label: "Minimize",
            icon: faWindowMinimize,
            action: minimize,
        },
        {
            label: isMaximized ? "Restore" : "Maximize",
            icon: isMaximized ? faWindowRestore : faExpand,
            action: toggleMaximize,
        },
        {
            label: "Close",
            icon: faXmark,
            action: close,
        },
    ];

    function NavOption({
        label,
        icon,
        action,
    }: {
        label: string;
        icon: typeof faWindowMinimize;
        action: () => void;
    }) {
        return (
            <button className="navbar_option" title={label} onClick={action}>
                <FontAwesomeIcon icon={icon} />
            </button>
        );
    }

    return (
        <div className="navbar_options">
            {options.map((option) => (
                <NavOption key={option.label} {...option} />
            ))}
        </div>
    );
}
