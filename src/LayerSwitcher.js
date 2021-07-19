import React, { useContext, useEffect } from "react";
import { MapContext } from "./Map";
import LayerSwitcher from "ol-layerswitcher";
import "ol-layerswitcher/dist/ol-layerswitcher.css";

const MyLayerSwitcher = () => {
  const { map } = useContext(MapContext);

  useEffect(() => {
    if (!map) {
      return;
    }

    const layerSwitcher = new LayerSwitcher({
      //   activationMode: "click",
      startActive: false,
      tipLabel: "Layers", // Optional label for button
      groupSelectStyle: "children", // Can be 'children' [default], 'group' or 'none'
      collapseTipLabel: "Collapse layers",
    });
    map.addControl(layerSwitcher);

    return () => map.controls.remove(layerSwitcher);
  }, [map]);

  return null;
};

export default MyLayerSwitcher;
