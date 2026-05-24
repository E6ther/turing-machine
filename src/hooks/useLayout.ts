import { useState, useEffect } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";
export type Orientation = "portrait" | "landscape";
export type LayoutMode = "stack" | "side-by-side";

export interface LayoutInfo {
  deviceType: DeviceType;
  orientation: Orientation;
  layoutMode: LayoutMode;
  width: number;
  height: number;
  isLandscape: boolean;
  isPortrait: boolean;
  isMobile: boolean;
  isDesktop: boolean;
}

function getDeviceType(w: number): DeviceType {
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getOrientation(w: number, h: number): Orientation {
  return w >= h ? "landscape" : "portrait";
}

function getLayoutMode(device: DeviceType, orient: Orientation): LayoutMode {
  if (device === "desktop") return "side-by-side";
  if (device === "tablet" && orient === "landscape") return "side-by-side";
  return "stack";
}

export function useLayout(): LayoutInfo {
  const [info, setInfo] = useState<LayoutInfo>(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const device = getDeviceType(w);
    const orient = getOrientation(w, h);
    return {
      deviceType: device,
      orientation: orient,
      layoutMode: getLayoutMode(device, orient),
      width: w,
      height: h,
      isLandscape: orient === "landscape",
      isPortrait: orient === "portrait",
      isMobile: device === "mobile",
      isDesktop: device !== "mobile",
    };
  });

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const device = getDeviceType(w);
      const orient = getOrientation(w, h);
      setInfo({
        deviceType: device,
        orientation: orient,
        layoutMode: getLayoutMode(device, orient),
        width: w,
        height: h,
        isLandscape: orient === "landscape",
        isPortrait: orient === "portrait",
        isMobile: device === "mobile",
        isDesktop: device !== "mobile",
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return info;
}