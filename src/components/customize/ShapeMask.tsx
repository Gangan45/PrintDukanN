import { CSSProperties } from "react";

export type ProductShape =
  | "portrait"
  | "landscape"
  | "square"
  | "circle"
  | "balloon"
  | "bean"
  | "bean-portrait"
  | "bean-landscape"
  | "egg"
  | "egg-portrait"
  | "egg-landscape"
  | "squircle"
  | "squircle-portrait"
  | "squircle-landscape"
  | "extra-rounded-portrait"
  | "extra-rounded-landscape"
  | "square-round"
  | "hexa"
  | "butterfly"
  | "dome"
  | "heart"
  | "flower"
  | "collage"
  | "dual-border";

/** ViewBox-based SVG paths for each shape — drawn on a 400x400 canvas */
const SHAPE_PATHS: Record<ProductShape, { path: string; viewBox: string }> = {
  portrait: { path: "M40,20 L360,20 L360,380 L40,380 Z", viewBox: "0 0 400 400" },
  landscape: { path: "M20,60 L380,60 L380,340 L20,340 Z", viewBox: "0 0 400 400" },
  square: { path: "M30,30 L370,30 L370,370 L30,370 Z", viewBox: "0 0 400 400" },
  circle: { path: "M200,30 A170,170 0 1,1 199.99,30 Z", viewBox: "0 0 400 400" },

  // Bean variants — organic asymmetric blob
  bean: {
    path: "M120,40 C220,20 340,60 360,160 C380,260 320,360 220,370 C160,376 110,340 95,295 C82,258 130,238 132,210 C134,178 70,170 70,130 C70,90 90,46 120,40 Z",
    viewBox: "0 0 400 400",
  },
  "bean-portrait": {
    path: "M150,20 C250,10 340,80 350,180 C360,290 290,380 200,385 C130,388 70,340 65,270 C60,210 110,200 115,160 C120,120 80,90 90,55 C100,28 125,22 150,20 Z",
    viewBox: "0 0 400 400",
  },
  "bean-landscape": {
    path: "M50,140 C40,90 90,50 160,55 C220,58 250,100 290,98 C340,95 380,130 375,200 C370,270 320,330 240,335 C160,340 110,310 90,290 C50,255 60,190 50,140 Z",
    viewBox: "0 0 400 400",
  },

  // Egg variants
  egg: {
    path: "M200,30 C290,30 350,140 350,230 C350,320 285,370 200,370 C115,370 50,320 50,230 C50,140 110,30 200,30 Z",
    viewBox: "0 0 400 400",
  },
  "egg-portrait": {
    path: "M200,20 C290,20 345,130 345,230 C345,330 285,385 200,385 C115,385 55,330 55,230 C55,130 110,20 200,20 Z",
    viewBox: "0 0 400 400",
  },
  "egg-landscape": {
    path: "M200,55 C300,55 380,110 380,200 C380,290 300,345 200,345 C100,345 20,290 20,200 C20,110 100,55 200,55 Z",
    viewBox: "0 0 400 400",
  },

  // Balloon: rounded top with small tail
  balloon: {
    path: "M200,30 C290,30 350,100 350,180 C350,265 285,330 215,335 L210,375 L195,335 C120,330 50,265 50,180 C50,100 110,30 200,30 Z",
    viewBox: "0 0 400 400",
  },

  // Squircle / rounded rect variants
  squircle: {
    path: "M70,30 L330,30 C370,30 370,70 370,110 L370,290 C370,330 330,370 290,370 L110,370 C70,370 30,330 30,290 L30,110 C30,70 70,30 70,30 Z",
    viewBox: "0 0 400 400",
  },
  "squircle-portrait": {
    path: "M80,20 L320,20 C360,20 380,60 380,100 L380,300 C380,340 360,380 320,380 L80,380 C40,380 20,340 20,300 L20,100 C20,60 40,20 80,20 Z",
    viewBox: "0 0 400 400",
  },
  "squircle-landscape": {
    path: "M60,60 L340,60 C380,60 390,100 390,140 L390,260 C390,300 380,340 340,340 L60,340 C20,340 10,300 10,260 L10,140 C10,100 20,60 60,60 Z",
    viewBox: "0 0 400 400",
  },

  // Extra rounded — more pillow-shaped (super-ellipse)
  "extra-rounded-portrait": {
    path: "M120,20 L280,20 C360,20 380,80 380,200 C380,320 360,380 280,380 L120,380 C40,380 20,320 20,200 C20,80 40,20 120,20 Z",
    viewBox: "0 0 400 400",
  },
  "extra-rounded-landscape": {
    path: "M60,80 L340,80 C380,80 390,140 390,200 C390,260 380,320 340,320 L60,320 C20,320 10,260 10,200 C10,140 20,80 60,80 Z",
    viewBox: "0 0 400 400",
  },

  // Square with rounded corners
  "square-round": {
    path: "M80,30 L320,30 C360,30 370,70 370,110 L370,290 C370,330 360,370 320,370 L80,370 C40,370 30,330 30,290 L30,110 C30,70 40,30 80,30 Z",
    viewBox: "0 0 400 400",
  },

  // Hexa — hexagon (7-photo grid uses this outer shape)
  hexa: {
    path: "M200,20 L355,110 L355,290 L200,380 L45,290 L45,110 Z",
    viewBox: "0 0 400 400",
  },

  // Butterfly — two heart-like wings
  butterfly: {
    path: "M200,200 C150,80 30,80 30,180 C30,280 150,330 200,330 C250,330 370,280 370,180 C370,80 250,80 200,200 Z",
    viewBox: "0 0 400 400",
  },

  // Dome — flat bottom, rounded top
  dome: {
    path: "M50,200 C50,80 150,30 200,30 C250,30 350,80 350,200 L350,370 L50,370 Z",
    viewBox: "0 0 400 400",
  },

  // Heart
  heart: {
    path: "M200,360 C50,260 30,140 100,90 C150,55 190,80 200,120 C210,80 250,55 300,90 C370,140 350,260 200,360 Z",
    viewBox: "0 0 400 400",
  },

  // Flower — 6-petal bloom
  flower: {
    path: "M200,30 C240,30 260,80 250,120 C290,100 340,120 350,170 C390,180 390,230 350,250 C360,290 320,330 280,310 C270,350 220,360 200,330 C180,360 130,350 120,310 C80,330 40,290 50,250 C10,230 10,180 50,170 C60,120 110,100 150,120 C140,80 160,30 200,30 Z",
    viewBox: "0 0 400 400",
  },

  collage: { path: "M20,40 L380,40 L380,360 L20,360 Z", viewBox: "0 0 400 400" },
  "dual-border": { path: "M30,40 L370,40 L370,360 L30,360 Z", viewBox: "0 0 400 400" },
};

export const shapeAspectRatio: Record<ProductShape, number> = {
  portrait: 3 / 4,
  landscape: 4 / 3,
  square: 1,
  circle: 1,
  balloon: 1,
  bean: 1,
  "bean-portrait": 3 / 4,
  "bean-landscape": 4 / 3,
  egg: 1,
  "egg-portrait": 3 / 4,
  "egg-landscape": 4 / 3,
  squircle: 1,
  "squircle-portrait": 3 / 4,
  "squircle-landscape": 4 / 3,
  "extra-rounded-portrait": 3 / 4,
  "extra-rounded-landscape": 4 / 3,
  "square-round": 1,
  hexa: 1,
  butterfly: 1,
  dome: 3 / 4,
  heart: 1,
  flower: 1,
  collage: 4 / 3,
  "dual-border": 4 / 3,
};

export const shapeLabel: Record<ProductShape, string> = {
  portrait: "Portrait",
  landscape: "Landscape",
  square: "Square",
  circle: "Circle",
  balloon: "Balloon",
  bean: "Bean",
  "bean-portrait": "Bean Portrait",
  "bean-landscape": "Bean Landscape",
  egg: "Egg",
  "egg-portrait": "Egg Portrait",
  "egg-landscape": "Egg Landscape",
  squircle: "Rounded Square",
  "squircle-portrait": "Rounded Portrait",
  "squircle-landscape": "Rounded Landscape",
  "extra-rounded-portrait": "Extra Rounded Portrait",
  "extra-rounded-landscape": "Extra Rounded Landscape",
  "square-round": "Square Round",
  hexa: "Hexagon",
  butterfly: "Butterfly",
  dome: "Dome",
  heart: "Heart",
  flower: "Flower",
  collage: "Collage (2x2)",
  "dual-border": "Dual Border",
};

interface ShapeFrameProps {
  shape: ProductShape;
  children?: React.ReactNode;
  /** outer black border thickness as % of viewbox */
  borderColor?: string;
  innerBorderColor?: string;
  showBolts?: boolean;
  showShadow?: boolean;
  /** Render the inner white ring (true OMGS dual-border look) */
  dualBorder?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * OMGS-style acrylic frame.
 * Renders an SVG with: drop shadow → outer colored border → optional inner white ring → photo masked to shape → optional corner bolts.
 */
export const ShapeFrame = ({
  shape,
  children,
  borderColor = "#0a0a0a",
  innerBorderColor = "#ffffff",
  showBolts = true,
  showShadow = true,
  dualBorder = true,
  className = "",
  style,
}: ShapeFrameProps) => {
  const { path, viewBox } = SHAPE_PATHS[shape] || SHAPE_PATHS.portrait;
  const maskId = `mask-${shape}-${Math.random().toString(36).slice(2, 8)}`;
  const shadowId = `shadow-${shape}-${Math.random().toString(36).slice(2, 8)}`;

  // Insets: when dual-border is on we use 0.9 outer ring + 0.8 photo area; when off photo area = 0.9
  const photoTransform = dualBorder ? "translate(40 40) scale(0.8)" : "translate(20 20) scale(0.9)";

  return (
    <div
      className={`relative ${className}`}
      style={{ aspectRatio: String(shapeAspectRatio[shape] || 1), ...style }}
    >
      <svg
        viewBox={viewBox}
        className="absolute inset-0 w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {showShadow && (
            <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodOpacity="0.35" />
            </filter>
          )}
          <clipPath id={maskId}>
            <path d={path} transform={photoTransform} />
          </clipPath>
        </defs>

        {/* Outer colored border */}
        <path
          d={path}
          fill={borderColor}
          filter={showShadow ? `url(#${shadowId})` : undefined}
        />

        {/* Inner white ring (only for dual-border) */}
        {dualBorder && (
          <path
            d={path}
            fill={innerBorderColor}
            transform="translate(20 20) scale(0.9)"
          />
        )}

        {/* Photo area background placeholder */}
        <path d={path} fill="#e8e8e8" transform={photoTransform} />

        {/* Photo content via foreignObject */}
        {children && (
          <foreignObject x="0" y="0" width="400" height="400" clipPath={`url(#${maskId})`}>
            <div
              // @ts-ignore -- xmlns required for foreignObject HTML
              xmlns="http://www.w3.org/1999/xhtml"
              style={{ width: "100%", height: "100%", position: "relative" }}
            >
              {children}
            </div>
          </foreignObject>
        )}

        {/* Corner bolts (skip for non-rectangular shapes) */}
        {showBolts && !["circle", "heart", "butterfly", "flower", "hexa", "dome", "balloon", "bean", "bean-portrait", "bean-landscape", "egg", "egg-portrait", "egg-landscape"].includes(shape) && (
          <g fill="#c8c8c8" stroke="#888" strokeWidth="0.5">
            <circle cx="60" cy="60" r="4" />
            <circle cx="340" cy="60" r="4" />
            <circle cx="60" cy="340" r="4" />
            <circle cx="340" cy="340" r="4" />
          </g>
        )}
      </svg>
    </div>
  );
};

// Backward-compat export name used elsewhere
export const ShapeMaskFrame = ShapeFrame;
