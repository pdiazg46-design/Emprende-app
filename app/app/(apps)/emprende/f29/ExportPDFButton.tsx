import { Download } from "lucide-react";

interface ExportPDFButtonProps {
    month: number;
    year: number;
}

export function ExportPDFButton({ month, year }: ExportPDFButtonProps) {

    const handleExport = () => {
        // Ejecutar trigger de impresión nativo del navegador
        window.print();
    };

    return (
        <button
            onClick={handleExport}
            className="bg-white text-indigo-900 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm print:hidden"
        >
            <Download className="w-4 h-4" />
            Descargar PDF
        </button>
    );
}
