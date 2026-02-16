import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function NavbarSearch() {
  return (
    <div className="navbar_search">
        <span><FontAwesomeIcon icon={faSearch} /></span>
        <input type="text" placeholder="Search..." />
    </div>
  )
}
