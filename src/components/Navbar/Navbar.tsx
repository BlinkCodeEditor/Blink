import NavbarLogo from "./NavbarLogo";
import NavbarMenu from "./NavbarMenu";
import NavbarOptions from "./NavbarOptions";
import "./_Navbar.scss";

interface NavbarProps {
    onOpenSettings: () => void;
}

export default function Navbar({ onOpenSettings }: NavbarProps) {
    return (
        <nav>
            <div className="navbar_left">
                <NavbarLogo />
                <NavbarMenu onOpenSettings={onOpenSettings} />
            </div>
            <NavbarOptions />
        </nav>
    );
}
