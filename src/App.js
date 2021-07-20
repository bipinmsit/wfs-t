import React from "react";
import { Map } from "./Map";
import MyLayerSwitcher from "./LayerSwitcher";
import WFST from "./WFST";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  return (
    <div>
      <Map zoom={15} center={[677332.25142889, 818063.76402935]}>
        <MyLayerSwitcher />
        <WFST />
      </Map>
    </div>
  );
};

export default App;
