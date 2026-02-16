import "./_RouteLoader.scss";

function RouteLoader() {
  return (
    <div className="route-loader">
      <div className="loader-content">
        <div className="loader-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <div className="loader-text">
          <span>Loading, please wait</span>
          <div className="dots">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RouteLoader;