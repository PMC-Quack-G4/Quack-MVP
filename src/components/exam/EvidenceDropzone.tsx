import * as React from "react";
import { UploadCloud, RotateCw, FileImage, Sparkles, X, CheckCircle, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface EvidenceDropzoneProps {
  selectedImage: string;
  rotation: number;
  onRotate: () => void;
  onImageSelected: (imageUrl: string) => void;
  onClearImage: () => void;
  onBackToTimer: () => void;
  onStartAudit: () => void;
  isAuditing: boolean;
}

export const EvidenceDropzone: React.FC<EvidenceDropzoneProps> = ({
  selectedImage,
  rotation,
  onRotate,
  onImageSelected,
  onClearImage,
  onBackToTimer,
  onStartAudit,
  isAuditing,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor sube un archivo de imagen (PNG, JPG, SVG, WebP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        onImageSelected(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <Card className="border-2 border-slate-300 shadow-md rounded-3xl overflow-hidden bg-white max-w-4xl mx-auto">
      <CardHeader className="border-b bg-slate-50/70 pb-4">
        <Badge className="bg-quack-dandelion text-quack-gunmetal border-quack-amber/40 text-xs w-fit mb-1 font-semibold">
          Paso 2: Carga de Evidencia Manuscrita
        </Badge>
        <CardTitle className="font-brand text-2xl text-quack-gunmetal">
          Fotografía de tu Hoja de Examen
        </CardTitle>
        <CardDescription className="text-xs text-slate-600">
          Arrastra y suelta la foto de tu cuaderno o utiliza una de las muestras predefinidas para auditar el procedimiento.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Selector de Muestras Rápidas Predefinidas */}
        <div className="space-y-2 rounded-2xl bg-amber-50/50 border border-amber-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-quack-gunmetal flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-quack-caramel" />
              Muestras de Examen Rápidas (Prueba Inmediata):
            </span>
            <span className="text-[11px] text-slate-500">¿No tienes foto a mano? Usa un demo</span>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <Button
              type="button"
              variant={selectedImage.includes("derivatives") ? "default" : "outline"}
              size="sm"
              onClick={() => onImageSelected("/samples/sample_exam_derivatives.svg")}
              className={`text-xs gap-1.5 rounded-xl ${
                selectedImage.includes("derivatives")
                  ? "bg-quack-gunmetal text-white"
                  : "bg-white text-slate-700"
              }`}
            >
              <FileImage className="h-3.5 w-3.5" />
              Muestra 1: Cálculo Diferencial (Regla Cadena)
            </Button>

            <Button
              type="button"
              variant={selectedImage.includes("physics") ? "default" : "outline"}
              size="sm"
              onClick={() => onImageSelected("/samples/sample_exam_physics.svg")}
              className={`text-xs gap-1.5 rounded-xl ${
                selectedImage.includes("physics")
                  ? "bg-quack-gunmetal text-white"
                  : "bg-white text-slate-700"
              }`}
            >
              <FileImage className="h-3.5 w-3.5" />
              Muestra 2: Física Mecánica (Colisión e Impulso)
            </Button>
          </div>
        </div>

        {/* Zona Drag & Drop / Previsualizador */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-6 transition-all duration-200 ${
            isDragging
              ? "border-quack-amber bg-amber-50/60 scale-[1.01]"
              : "border-slate-300 bg-slate-50/50 hover:bg-slate-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {selectedImage ? (
            <div className="flex flex-col items-center space-y-4 w-full">
              {/* Contenedor de la Imagen Previsualizada */}
              <div className="relative max-w-md w-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-md p-2">
                <img
                  src={selectedImage}
                  alt="Desarrollo manuscrito del estudiante"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  className="transition-transform duration-300 max-h-72 w-full object-contain mx-auto rounded-xl"
                />
              </div>

              {/* Controles de imagen */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRotate}
                  className="gap-1.5 rounded-xl text-xs bg-white shadow-sm"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  Rotar 90° ({rotation}°)
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 rounded-xl text-xs bg-white shadow-sm"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Cambiar Archivo
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClearImage}
                  className="gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
                >
                  <X className="h-3.5 w-3.5" />
                  Quitar Imagen
                </Button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Fotografía lista para análisis OCR y auditoría KaTeX
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="h-16 w-16 rounded-2xl bg-quack-dandelion/50 border border-quack-amber/40 flex items-center justify-center text-quack-caramel shadow-sm">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-quack-gunmetal">
                  Arrastra tu fotografía aquí o haz clic para buscar en tu dispositivo
                </p>
                <p className="text-xs text-slate-500">
                  Formatos soportados: JPG, PNG, WebP o SVG (máximo 15 MB)
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 rounded-xl text-xs bg-white shadow-sm"
              >
                Seleccionar archivo del dispositivo
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t bg-slate-50/70 p-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBackToTimer}
          className="text-xs text-slate-600"
        >
          Regresar al cronómetro de resolución
        </Button>

        <Button
          size="lg"
          onClick={onStartAudit}
          disabled={!selectedImage || isAuditing}
          className="w-full sm:w-auto bg-quack-amber hover:bg-amber-400 text-quack-gunmetal font-bold rounded-xl shadow-md gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Evaluar Procedimiento con OCR
        </Button>
      </CardFooter>
    </Card>
  );
};
