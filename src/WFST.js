import React, { useContext, useEffect, useState } from "react";
import { MapContext } from "./Map";
import { Group, Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { GeoJSON } from "ol/format";

const LocalWFSLayers = () => {
  const [layerName, setLayerName] = useState([]);
  const { map } = useContext(MapContext);

  useEffect(() => {
    if (!map) {
      return;
    }
    map.addLayer(layerGroup);

    return () => map.removeLayer(layerGroup);
  }, [layerName]);

  useEffect(() => {
    const fetchWfsLayer = async () => {
      const fetchAPI = await fetch(
        "http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetCapabilities"
      );

      const data = await fetchAPI.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(data, "application/xml");
      const featureList = xml.getElementsByTagName("FeatureTypeList")[0];

      for (let i = 0; i < featureList.childNodes.length; i++) {
        const feature = featureList.childNodes[i];
        setLayerName((prevName) => [
          ...prevName,
          feature.childNodes[0].textContent,
        ]);
      }
    };
    fetchWfsLayer();
  }, []);

  const vector = [];
  layerName.forEach(function (element) {
    // Check if the first word is custom
    if (element.indexOf("custom") === 0) {
      const vector1 = new VectorLayer({
        title: element,
        visible: false,
        source: new VectorSource({
          url: `http://localhost:8080/geoserver/custom/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${element}&outputFormat=application%2Fjson`,
          format: new GeoJSON(),
        }),
      });
      vector.push(vector1);
    }
  });

  const layerGroup = new Group({
    title: "Custom",
    layers: vector,
  });

  return (
    <div>
      <h3>List of WFS Layers</h3>
      <div>
        <select>
          <option>Select Layer</option>
          {layerName.map((name, index) => {
            return (
              <option value={name} key={index}>
                {name}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export default LocalWFSLayers;
