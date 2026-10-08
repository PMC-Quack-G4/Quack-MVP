import * as React from "react";
import {
  UploadCloud,
  Camera,
  RotateCw,
  FileImage,
  Sparkles,
  X,
  CheckCircle,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MathRenderer } from "@/components/common/MathRenderer";
import { ExamProblem } from "@/types/exam";

export interface EvidenceDropzoneProps {
  problem: ExamProblem;
  allProblems: ExamProblem[];
  selectedImage: string;
  rotation: number;
  onRotate: () => void;
  onImageSelected: (imageUrl: string) => void;
  onClearImage: () => void;
  onBackToTimer: () => void;
  onStartAudit: () => void;
  isAuditing: boolean;
}

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export const EvidenceDropzone: React.FC<EvidenceDropzoneProps> = ({
  problem,
  allProblems,
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
  const [fileError, setFileError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    setFileError(null);

    if (!file.type.startsWith("image/")) {
      setFileError("Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP o SVG).");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError("La imagen supera el límite máximo de 15 MB. Intenta con una foto más ligera.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        onImageSelected(ev.target.result as string);
      }
    };
    reader.onerror = () => {
      setFileError("No fue posible leer el archivo de imagen seleccionado.");
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
    e.target.value = "";
  };

  const handleSelectSample = (sampleUrl: string) => {
    setFileError(null);
    onImageSelected(sampleUrl);
  };

  return (
    <Card className="border-2 border-slate-300  rounded-3xl overflow-hidden bg-white max-w-4xl mx-auto">
      <CardHeader className="border-b/70 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <Badge className="bg-quack-dandelion text-quack-gunmetal border-quack-amber/40 text-xs w-fit font-semibold">
            Paso 3: Carga de Evidencia Manuscrita
          </Badge>
          <Badge variant="outline" className="text-xs border-slate-300 text-slate-700 bg-white">
            {problem.subject} • {problem.difficulty}
          </Badge>
        </div>
        <CardTitle className="font-brand text-2xl text-quack-gunmetal">
          Fotografía de tu Hoja de Examen
        </CardTitle>
        <CardDescription className="text-xs text-slate-600">
          Toma una foto con la cámara de tu dispositivo, sube un archivo desde tu galería o prueba con las hojas manuscritas de muestra.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 p-6">
        {/* Recordatorio compacto del enunciado activo */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-quack-caramel block">
              Ejercicio a Auditar: {problem.title}
            </span>
            <div className="overflow-x-auto py-0.5">
              <MathRenderer math={problem.statementLatex} className="text-sm text-quack-gunmetal" />
            </div>
          </div>
        </div>

        {/* Inputs ocultos para Archivo y Cámara Nativa */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label="Seleccionar archivo de imagen del dispositivo"
          onChange={handleFileInputChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          aria-label="Tomar fotografía con la cámara del dispositivo"
          onChange={handleFileInputChange}
        />

        {/* Mensaje de error de validación accesible */}
        {fileError && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{fileError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFileError(null)}
              className="text-rose-700 hover:text-rose-900 font-bold px-1.5 py-0.5 rounded"
              aria-label="Cerrar alerta de error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Zona Drag & Drop / Previsualizador */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-6 transition-all duration-200 ${
            isDragging
              ? "border-quack-amber bg-amber-50 scale-[1.01]"
              : selectedImage
              ? "border-emerald-300 bg-emerald-50/20"
              : "border-slate-300 bg-slate-50 hover:bg-slate-50"
          }`}
        >
          {selectedImage ? (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Contenedor de la Imagen Previsualizada */}
              <div className="relative max-w-md w-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-white  p-2">
                <img
                  src={selectedImage}
                  alt="Desarrollo manuscrito del estudiante para auditoría OCR"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  className="transition-transform duration-300 max-h-80 w-full object-contain mx-auto rounded-xl"
                />
              </div>

              {/* Controles de imagen */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRotate}
                  className="gap-1.5 rounded-xl text-xs bg-white "
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  Rotar 90° ({rotation}°)
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => cameraInputRef.current?.click()}
                  className="gap-1.5 rounded-xl text-xs bg-white "
                >
                  <Camera className="h-3.5 w-3.5 text-quack-caramel" />
                  Tomar Otra Foto
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 rounded-xl text-xs bg-white "
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Cambiar Archivo
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFileError(null);
                    onClearImage();
                  }}
                  className="gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
                >
                  <X className="h-3.5 w-3.5" />
                  Quitar Imagen
                </Button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Evidencia cargada y lista para análisis OCR con Gemini Vision
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-8 px-4 gap-4">
              <div className="h-16 w-16 rounded-2xl bg-quack-dandelion border border-quack-amber flex items-center justify-center text-quack-caramel ">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-md">
                <p className="text-base font-bold text-quack-gunmetal">
                  Sube la foto de tu procedimiento en papel o captúrala con tu cámara
                </p>
                <p className="text-xs text-slate-500">
                  Arrastra tu imagen aquí o elige una de las opciones inferiores (JPG, PNG, WebP o SVG • máx. 15 MB)
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <Button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="bg-quack-gunmetal hover:bg-slate-800 text-white font-semibold rounded-xl text-xs gap-2  px-4 py-2.5"
                >
                  <Camera className="h-4 w-4 text-quack-amber" />
                  Tomar Foto con Cámara
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl text-xs bg-white hover:bg-slate-100 text-quack-gunmetal border-slate-300 font-semibold gap-2  px-4 py-2.5"
                >
                  <ImageIcon className="h-4 w-4 text-quack-caramel" />
                  Subir Archivo / Galería
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Selector de Muestras Rápidas Predefinidas coherentes con los 4 problemas */}
        <div className="space-y-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-quack-gunmetal flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-quack-caramel" />
              Muestras Manuscritas para Prueba Rápida (Auditables por Gemini Vision):
            </span>
            <span className="text-[11px] text-slate-500">
              Se rasterizan automáticamente para evaluación real por OCR
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {allProblems.map((item, idx) => {
              const isCurrentProblemSample = item.id === problem.id;
              const isSelectedSample = selectedImage === item.defaultSampleImage;

              return (
                <Button
                  key={item.id}
                  type="button"
                  variant={isSelectedSample ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSelectSample(item.defaultSampleImage)}
                  className={`justify-start text-left h-auto py-2.5 px-3 rounded-xl text-xs gap-2 transition-all ${
                    isSelectedSample
                      ? "bg-quack-gunmetal text-white "
                      : isCurrentProblemSample
                      ? "bg-white border-quack-amber border-2 text-quack-gunmetal hover:bg-amber-50"
                      : "bg-white text-slate-700 hover:bg-white"
                  }`}
                >
                  <FileImage className="h-4 w-4 shrink-0 text-quack-caramel" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold truncate flex items-center gap-1.5">
                      Muestra {idx + 1}: {item.subject}
                      {isCurrentProblemSample && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                            isSelectedSample
                              ? "bg-quack-amber text-quack-gunmetal"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          Ejercicio actual
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-[11px] truncate ${
                        isSelectedSample ? "text-slate-200" : "text-slate-500"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t/70 p-6">
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
          className="w-full sm:w-auto bg-quack-amber hover:bg-amber-400 text-quack-gunmetal font-bold rounded-xl  gap-2 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          Evaluar Procedimiento con OCR
        </Button>
      </CardFooter>
    </Card>
  );
};
