import React, { useRef, useState, useEffect, createContext } from "react";
import * as ol from "ol";
import "ol/ol.css";
import Group from "ol/layer/Group";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { get as getProjection } from "ol/proj";
import "./map.css";

export const MapContext = createContext();

export const Map = ({ children, zoom, center }) => {
  const mapRef = useRef();
  const [map, setMap] = useState(null);

  const epsg2260 = () => {
    proj4.defs(
      "EPSG:2260",
      "+proj=tmerc +lat_0=38.83333333333334 +lon_0=-74.5 +k=0.9999 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs"
    );
    register(proj4);
    const proj2260 = getProjection("EPSG:2260");
    return proj2260;
  };

  // on component mount
  useEffect(() => {
    let options = {
      view: new ol.View({ zoom, center, projection: epsg2260() }),
      layers: [baseMaps],

      // controls: [],
      // overlays: [],
    };

    let mapObject = new ol.Map(options);
    mapObject.setTarget(mapRef.current);
    setMap(mapObject);

    return () => mapObject.setTarget(undefined);
  }, []);

  // zoom change handler
  useEffect(() => {
    if (!map) return;

    map.getView().setZoom(zoom);
  }, [zoom]);

  // center change handler
  useEffect(() => {
    if (!map) return;

    map.getView().setCenter(center);
  }, [center]);

  // BaseMaps
  const baseMaps = new Group({
    title: "Base maps",
    layers: [
      new TileLayer({
        title: "OSM",
        type: "base",
        visible: true,
        source: new OSM(),
      }),

      new TileLayer({
        title: "Satellite Map",
        type: "base",
        visible: false,
        source: new XYZ({
          attributions: [
            "Powered by Esri",
            "Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community",
          ],
          attributionsCollapsible: false,
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          maxZoom: 23,
        }),
      }),
    ],
  });

  return (
    <MapContext.Provider value={{ map }}>
      <div ref={mapRef} className="ol-map">
        {children}
      </div>
    </MapContext.Provider>
  );
};
