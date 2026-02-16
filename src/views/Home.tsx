import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import Explorer from "../components/Explorer/Explorer";

export default function Home() {
  return (
    <>
        <Navbar />
        <main>
            <Sidebar />
            <Explorer />
        </main>
    </>
  )
}
