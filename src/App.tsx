import { HashRouter } from "react-router-dom"
import Router from "./views/Router"
import { initGA, logPageView } from "./analytics/analytics"
import { useEffect } from "react"

function App() {
    useEffect(() => {
        initGA()
        logPageView()
    }, [])
    
  return (
    <HashRouter>
        <Router />
    </HashRouter>
  )
}

export default App
