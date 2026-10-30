import { useState, useEffect, useRef } from "react";
import { ImagePlus, Layers, Upload, X } from "lucide-react";
import type { Categoria, CategoriaPayload } from "../../services/products";
import { getAssetUrl } from "../../services/api";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: CategoriaPayload, foto?: File | null, id?: string) => Promise<void> | void;
  initialData?: Categoria | null;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: CategoryModalProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome ?? "");
      setDescricao(initialData.descricao ?? "");
      setFotoFile(null);
      setPreviewUrl(getAssetUrl(initialData.fotoUrl ?? null));
    } else {
      setNome("");
      setDescricao("");
      setFotoFile(null);
      setPreviewUrl(null);
    }
    setIsSaving(false);
  }, [initialData, isOpen]);

  useEffect(() => {
    if (!fotoFile) return;
    const objectUrl = URL.createObjectURL(fotoFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [fotoFile]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setFotoFile(file);
    }
  };

  const handleClearSelectedFile = () => {
    setFotoFile(null);
    setPreviewUrl(getAssetUrl(initialData?.fotoUrl ?? null));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await onSave(
        {
          nome: nome.trim(),
          descricao: descricao.trim() || undefined,
        },
        fotoFile,
        initialData?.id,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={initialData ? "Editar Categoria" : "Nova Categoria"}
      onClick={() => !isSaving && onClose()}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gray-100 text-gray-800">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {initialData ? "Editar Categoria" : "Nova Categoria"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-900 bg-gray-100 p-2 rounded-full cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nome da Categoria
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Tecnologia"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Descrição <span className="text-xs font-normal text-gray-400">(opcional)</span>
            </label>
            <textarea
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve descrição da categoria..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Foto da Categoria
            </label>

            {previewUrl ? (
              <div className="space-y-2.5">
                <div className="relative h-40 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                  <img
                    src={previewUrl}
                    alt={nome || "Prévia da categoria"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-xs font-medium text-white">
                    {fotoFile ? `Nova foto: ${fotoFile.name}` : "Foto atual vinculada"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Trocar foto
                  </button>
                  {fotoFile && (
                    <button
                      type="button"
                      onClick={handleClearSelectedFile}
                      className="py-2 px-3 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Desfazer troca
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 hover:border-black bg-gray-50 hover:bg-gray-100/60 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <ImagePlus className="w-7 h-7 text-gray-400" />
                <span className="text-xs font-semibold">Clique para selecionar uma foto</span>
                <span className="text-[11px] text-gray-400">JPG, PNG ou WebP (máx. 5MB)</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
