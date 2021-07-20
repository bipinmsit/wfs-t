import React, { useContext, useEffect, useState } from "react";
import { MapContext } from "./Map";
import { Group, Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { GeoJSON } from "ol/format";
import { Select, Modify, Draw, Snap } from "ol/interaction";
import { Fill, Stroke, Circle, Style } from "ol/style";

const LocalWFSLayers = () => {
  const [layerName, setLayerName] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState("");
  const [selectedGeom, setSelectedGeom] = useState("");
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

  useEffect(() => {
    if (!map) {
      return;
    }

    const source = new VectorSource({ wrapX: false });
    const vector = new VectorLayer({
      source: source,
    });

    let draw = new Draw({
      source: source,
      type: selectedGeom,
    });

    const snap = new Snap({ source: source });

    const mapInteraction = () => {
      if (selectedGeom !== "select_geom" && selectedGeom !== "None") {
        map.addInteraction(draw);
        map.addInteraction(snap);
      }
    };
    mapInteraction();
    map.addLayer(vector);

    return () => map.removeInteraction(draw);
  }, [selectedGeom]);

  useEffect(() => {
    if (!map) {
      return;
    }

    map.addInteraction(select);
    map.addInteraction(modify);

    return () => {
      map.removeInteraction(select);
      map.removeInteraction(modify);
    };
  }, [map]);

  var fill = new Fill({
    color: "rgba(255,255,255,0.4)",
  });
  var stroke = new Stroke({
    color: "red",
    width: 2,
  });
  var styles = [
    new Style({
      image: new Circle({
        fill: fill,
        stroke: stroke,
        radius: 5,
      }),
      fill: fill,
      stroke: stroke,
    }),
  ];

  let select = new Select({
    style: styles,
  });
  let modify = new Modify({
    features: select.getFeatures(),
  });

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

  const findSelectedLayerSource = (name) => {
    const layerArr = layerGroup.getLayers().getArray();

    layerArr.forEach((element) => {
      const title = element.get("title");
      if (title === name) {
        const source = element.getSource();
        console.log(source);
      }
    });
  };

  return (
    <div className="d-flex">
      <div>
        <label>List of WFS Layers: &nbsp; </label>
        <select
          onChange={(e) => {
            setSelectedLayer(e.target.value);

            if (e.target.value !== "select") {
              const editButton = document.getElementById("editButton");
              editButton.disabled = false;

              editButton.addEventListener("click", () => {
                const geomType = document.getElementById("geomType");
                const undo = document.getElementById("undo");

                geomType.disabled = false;
                undo.disabled = false;
              });
            }
          }}
        >
          <option value="select">Select Layer</option>
          {layerName.map((name, index) => {
            return (
              <option value={name} key={index}>
                {name}
              </option>
            );
          })}
        </select>
        <input type="button" value="Edit" id="editButton" disabled />
      </div>
      &nbsp;
      <div>
        <select
          disabled
          id="geomType"
          onChange={(e) => {
            setSelectedGeom(e.target.value);
          }}
        >
          <option value="select_geom">Select Geometry Type</option>
          <option value="Point">Point</option>
          <option value="LineString">LineString</option>
          <option value="Polygon">Polygon</option>
          <option value="Circle">Circle</option>
          <option value="None">None</option>
        </select>
        <input type="button" value="Undo" id="undo" disabled />
      </div>
    </div>
  );
};

export default LocalWFSLayers;
