import NavbarLogo from "./NavbarLogo";
import NavbarOptions from "./NavbarOptions";
import NavbarSearch from "./NavbarSearch";
import "./_Navbar.scss";

export default function Navbar() {
    return (
        <nav>
            <NavbarLogo />
            <NavbarSearch />
            <NavbarOptions />
        </nav>
    );
}
