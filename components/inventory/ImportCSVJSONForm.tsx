'use client';
import { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Upload, FileText } from 'lucide-react';

interface ImportError {
  row: number;
  error: string;
}

interface ImportResult {
  imported: number;
  failed: number;
  errors: ImportError[];
}

interface ImportCSVJSONFormProps {
  onImport: (file: File) => Promise<ImportResult>;
}

const CSV_TEMPLATE = `tipo,titulo,ubicacion,zona,precio,moneda,dormitorios,banos,m2,estado
apartment,2 ambientes luminoso Palermo,Palermo CABA,,150000,USD,1,1,45,Disponible
ph,PH 3 ambientes Coghlan,Coghlan CABA,,200000,USD,2,1,75,Disponible
house,Casa con jardín Olivos,Olivos GBA,,350000,USD,3,2,150,Disponible`;

export default function ImportCSVJSONForm({ onImport }: ImportCSVJSONFormProps) {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      alert('Solo se aceptan archivos .csv o .json');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await onImport(file);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla-inventario.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-6 py-4 text-left"
      >
        <h2 className="text-base font-bold text-gray-900">Importar CSV o JSON</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{open ? 'Cerrar' : 'Abrir'}</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-4">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragging ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Upload className="mx-auto text-gray-400 mb-3" size={28} />
            <p className="text-sm text-gray-700 font-medium mb-1">
              Arrastrá tu archivo acá
            </p>
            <p className="text-xs text-gray-500 mb-4">Formatos aceptados: .csv, .json</p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Procesando...' : 'Seleccionar archivo'}
              </button>
              <button
                type="button"
                onClick={downloadTemplate}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5"
              >
                <FileText size={14} />
                Descargar plantilla
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Resultado */}
          {result && (
            <div className="mt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-3">
                <p className="text-sm font-semibold text-green-700">
                  {result.imported} {result.imported === 1 ? 'propiedad importada' : 'propiedades importadas'} correctamente
                  {result.failed > 0 && ` · ${result.failed} con errores`}
                </p>
              </div>

              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-700 mb-2">
                    {result.failed} fila(s) con errores
                  </p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left border-b border-red-200">
                        <th className="py-1 pr-4 font-semibold text-red-600">Fila</th>
                        <th className="py-1 font-semibold text-red-600">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((err, idx) => (
                        <tr key={idx} className="border-b border-red-100">
                          <td className="py-1 pr-4 font-mono text-red-700">{err.row}</td>
                          <td className="py-1 text-red-700">{err.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                type="button"
                onClick={() => { setResult(null); fileRef.current?.click(); }}
                className="mt-3 text-sm text-gray-600 underline hover:text-gray-900"
              >
                Importar otro archivo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
