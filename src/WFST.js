import React, { useContext, useEffect } from "react";
import { MapContext } from "./Map";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { GeoJSON, WFS, GML3 } from "ol/format";
import { Draw, Snap } from "ol/interaction";

const WFST = () => {
  const { map } = useContext(MapContext);

  useEffect(() => {
    if (!map) {
      return;
    }
    map.addLayer(vector);
    map.addLayer(vector2);
  }, [map]);

  const source1 = new VectorSource({
    url: "http://localhost:8080/geoserver/work/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=work%3Abuilding&outputFormat=application%2Fjson",
    format: new GeoJSON(),
  });

  const vector = new VectorLayer({
    title: "Building",
    source: source1,
  });

  const vector2 = new VectorLayer({
    source: new VectorSource({}),
  });

  let draw = new Draw({
    type: "MultiPolygon",
    source: vector2.getSource(),
    geometryName: "geom",
  });

  const snap = new Snap({
    source: vector.getSource(),
  });

  const editHandler = () => {
    if (map) {
      map.addInteraction(draw);
      map.addInteraction(snap);
    }

    draw.on("drawend", async (e) => {
      const myFeature = e.feature;

      console.log(myFeature.getGeometryName());

      myFeature.set("geom", myFeature.getGeometry());

      const format = new WFS({});

      const node = format.writeTransaction([myFeature], null, null, {
        gmlOptions: {
          featureNS: "www.work.com",
          featureType: "work:building",
          srsName: "EPSG:2260",
          // geometryName: "geom",
        },
      });

      // const geometryNode = node.getElementsByTagName("geometry")[0];
      // geometryNode.parentNode.removeChild(geometryNode);
      // console.log(geometryNode);

      var postData = new XMLSerializer().serializeToString(node);
      console.log(postData);

      await fetch("http://localhost:8080/geoserver/wfs", {
        method: "POST",
        headers: new Headers({
          "Content-Type": "text/xml",
        }),
        body: postData,
      });

      console.log("Posting data to geoserver");
    });
  };

  return (
    <div>
      <button onClick={editHandler}>Start Editing</button>
    </div>
  );
};

export default WFST;
