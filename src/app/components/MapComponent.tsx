"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import * as d3 from "d3-geo";
import { feature } from "topojson-client";
import { FeatureCollection } from "geojson";

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

  const [countries, setCountries] = useState<any[]>([]);
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
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
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

  // Slow auto-rotation (requestAnimationFrame)
  useEffect(() => {
    let raf = 0;
    let cancelled = false;

    const rotate = () => {
      // stop if unmounted/cancelled
      if (cancelled) return;

      // stop rotating while a country is selected
      if (selectedCountryCode) {
        raf = requestAnimationFrame(rotate);
        return;
      }

      const globe = globeRef.current;
      if (!globe) {
        // Globe not ready yet or already unmounted
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
    if (!selectedCountryCode || countries.length === 0 || !globeRef.current)
      return;

    const country = countries.find(
      (c) => c.properties.name === selectedCountryCode
    );
    if (!country) return;

    const [lng, lat] = country.centroid;

    // Higher altitude => globe appears smaller
    globeRef.current.pointOfView({ lat, lng, altitude: 1 }, 1000);

    setMarkers([{ lat, lng, imgUrl: "/images/location.png" }]);
  }, [selectedCountryCode, countries]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        globeImageUrl="/images/earth-day.jpg"
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
      />
    </div>
  );
}
