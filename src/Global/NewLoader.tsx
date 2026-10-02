import * as React from "react";

export const NewLoader = () => {
  return (
    <div
      id="newLoader"
      style={{
        background: "#0101016b",
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <div style={{ 
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        
        }}>
        <h3 id="loadertext" style={{ textAlign: "center", color: "white" }}>
          Loading...
        </h3>
      </div>
    </div>
  );
};
