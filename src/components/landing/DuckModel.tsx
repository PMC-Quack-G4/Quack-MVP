import * as React from "react";
import { cn } from "@/lib/utils";

interface DuckModelProps {
  /** Tamaño del pato en px (mínimo 128 px según BrandBook). */
  size?: number;
  /** Número de capas de extrusión (más capas = más volumen). */
  layers?: number;
  className?: string;
  /** Desactiva la animación de balanceo. */
  still?: boolean;
}

/**
 * Pato de goma "3D" construido sólo con CSS: se apilan copias del logo en el eje Z
 * (las traseras más oscuras) para simular volumen sin cargar librerías 3D pesadas.
 */
export const DuckModel: React.FC<DuckModelProps> = ({ size = 220, layers = 9, className, still = false }) => {
  const depthStep = 1.6;
  const back = Array.from({ length: layers }, (_, i) => i);

  return (
    <div className={cn("scene-3d", className)} style={{ width: size, height: size }} aria-hidden="true">
      <div
        className={cn("relative h-full w-full", still ? "preserve-3d" : "duck-3d")}
        style={still ? undefined : { animationDelay: "-2s" }}
      >
        {back.map((i) => (
          <img
            key={i}
            src="/brand/quack-logo.png"
            alt=""
            draggable={false}
            style={{
              transform: `translateZ(${-(layers - i) * depthStep}px)`,
              filter: `brightness(${0.72 + (i / layers) * 0.2}) saturate(1.1)`,
            }}
          />
        ))}
        <img
          src="/brand/quack-logo.png"
          alt=""
          draggable={false}
          style={{ transform: "translateZ(0.5px)" }}
        />
      </div>
      {/* Sombra en el piso */}
      <div
        className="mx-auto -mt-3 h-4 w-2/3 rounded-[50%] bg-quack-gunmetal/20 blur-md"
        style={{ transform: "rotateX(70deg)" }}
      />
    </div>
  );
};
