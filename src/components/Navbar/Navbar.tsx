import NavbarLogo from "./NavbarLogo";
import NavbarMenu from "./NavbarMenu";
import NavbarOptions from "./NavbarOptions";
import NavbarSearch from "./NavbarSearch";
import "./_Navbar.scss";

export default function Navbar() {
    return (
        <nav>
            <div className="navbar_left">
                <NavbarLogo />
                <NavbarMenu />
            </div>
            <NavbarSearch />
            <NavbarOptions />
        </nav>
    );
}
