import * as React from "react";
import { playQuackSound } from "@/lib/quackSound";
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
 * Pato de goma 3D con movimiento sereno y Easter Egg oculto:
 * no muestra avisos de "tócame", pero si alguien descubre hacerle clic,
 * suena "¡Quack!".
 */
export const DuckModel: React.FC<DuckModelProps> = ({
  size = 160,
  layers = 6,
  className,
  still = false,
}) => {
  const [quacking, setQuacking] = React.useState(false);
  const depthStep = 1.4;
  const back = Array.from({ length: layers }, (_, i) => i);

  const handleQuack = () => {
    playQuackSound("duck_3d_easter_egg");
    setQuacking(true);
    window.setTimeout(() => setQuacking(false), 450);
  };

  return (
    <div
      onClick={handleQuack}
      className={cn(
        "scene-3d relative select-none",
        quacking && "scale-105 transition-transform duration-150",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className={cn("relative h-full w-full", still ? "preserve-3d" : "duck-3d")}>
        {back.map((i) => (
          <img
            key={i}
            src="/brand/quack-logo.png"
            alt=""
            draggable={false}
            style={{
              transform: `translateZ(${-(layers - i) * depthStep}px)`,
              filter: `brightness(${0.78 + (i / layers) * 0.18})`,
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

      <div
        className="mx-auto -mt-2.5 h-3 w-3/5 rounded-[50%] bg-quack-gunmetal/15 blur-md"
        style={{ transform: "rotateX(70deg)" }}
      />
    </div>
  );
};
