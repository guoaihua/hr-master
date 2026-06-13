import React, { useEffect } from "react";

export function LegacyAppMount() {
  useEffect(() => {
    let disposed = false;

    void import("../legacyApp.js").then((mod) => {
      if (disposed) return;
      mod.mountLegacyApp("#app");
    });

    return () => {
      disposed = true;
      void import("../legacyApp.js").then((mod) => {
        mod.unmountLegacyApp();
      });
    };
  }, []);

  return <div id="app"></div>;
}
