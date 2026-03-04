"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

interface ExportPDFButtonProps {
    month: number;
    year: number;
}

export function ExportPDFButton({ month, year }: ExportPDFButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Importación dinámica para evitar crash SSR con Next.js
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = (html2pdfModule.default ? html2pdfModule.default : html2pdfModule) as any;

            const element = document.getElementById('f29-pdf-template');
            if (!element) {
                console.error("Template PDF no encontrado en el DOM");
                setIsExporting(false);
                return;
            }

            // Forzamos block por un instante para que html2canvas lo lea perfecto
            element.style.display = 'block';

            // Configuración Carta Ajustada
            const opt = {
                margin: [0.3, 0.3, 0.3, 0.3], // Margen en formato Array [Sup, Der, Inf, Izq] en pulgadas
                filename: `Emprende_F29_Reporte_${month + 1}_${year}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            await html2pdf().from(element).set(opt).save();

        } catch (error) {
            console.error("Error al exportar PDF directo:", error);
            alert("Error al generar Archivo PDF. Por favor reintente.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-white text-indigo-900 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm print:hidden disabled:opacity-75 disabled:cursor-wait"
        >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <Download className="w-4 h-4" />}
            {isExporting ? 'Procesando Documento...' : 'Descargar Doc PDF'}
        </button>
    );
}
