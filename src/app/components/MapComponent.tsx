"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import * as d3 from "d3-geo";
import { feature } from "topojson-client";
import { FeatureCollection, Feature, Geometry } from "geojson";

interface Marker {
  lat: number;
  lng: number;
  imgUrl: string;
}

interface MapProps {
  selectedCountryCode: string | null;
}

export default function MapComponent({ selectedCountryCode }: MapProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 320, h: 320 });

  const [countries, setCountries] = useState<Feature<Geometry, any>[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);

  // Measure container and keep Globe canvas in sync
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setSize({
        w: Math.max(1, Math.round(rect.width)),
        h: Math.max(1, Math.round(rect.height)),
      });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Load countries
  useEffect(() => {
    fetch("/data/countries-110m.json")
      .then((res) => res.json())
      .then((topo: any) => {
        const geojson = feature(
          topo,
          (topo.objects as any).countries
        ) as unknown as FeatureCollection;

        geojson.features.forEach((c: any) => {
          c.centroid = d3.geoCentroid(c) || [0, 0];
        });

        setCountries(geojson.features);
      });
  }, []);

  const selectedPolygon = useMemo(() => {
    if (!selectedCountryCode) return null;
    const found = countries.find((c: any) => {
      return c?.properties?.name === selectedCountryCode;
    });
    return found ?? null;
  }, [selectedCountryCode, countries]);

  // Slow auto-rotation
  useEffect(() => {
    let raf = 0;
    let cancelled = false;

    const rotate = () => {
      if (cancelled) return;

      if (selectedCountryCode) {
        raf = requestAnimationFrame(rotate);
        return;
      }

      const globe = globeRef.current;
      if (!globe) {
        raf = requestAnimationFrame(rotate);
        return;
      }

      const pov = globe.pointOfView();
      globe.pointOfView({ ...pov, lng: pov.lng + 0.09 }, 0);

      raf = requestAnimationFrame(rotate);
    };

    raf = requestAnimationFrame(rotate);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [selectedCountryCode]);

  // Zoom + marker
  useEffect(() => {
    if (!selectedPolygon || !globeRef.current) return;

    const [lng, lat] = (selectedPolygon as any).centroid || [0, 0];

    globeRef.current.pointOfView({ lat, lng, altitude: 1 }, 1000);
    setMarkers([{ lat, lng, imgUrl: "/images/pin.png" }]);
  }, [selectedPolygon]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const r = globe.renderer();
    if (!r) return;
    r.setPixelRatio(Math.min(1.25, window.devicePixelRatio));
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        globeImageUrl="/images/earth2.jpg"
        backgroundColor="rgba(0,0,0,0)"
        enablePointerInteraction={true}
        htmlElementsData={markers}
        htmlElement={(d) => {
          const marker = d as Marker;
          const el = document.createElement("img");
          el.src = marker.imgUrl;
          el.style.width = "24px";
          el.style.height = "24px";
          el.style.transform = "translate(-50%, -50%)";
          return el;
        }}
        htmlLat={(d) => (d as Marker).lat}
        htmlLng={(d) => (d as Marker).lng}
        polygonsData={selectedPolygon ? [selectedPolygon] : []}
        polygonCapColor={() => "rgba(0,0,0,0)"}
        polygonSideColor={() => "rgba(0,0,0,0)"}
        polygonStrokeColor={() => "red"}
        polygonAltitude={0.01}
      />
    </div>
  );
}
