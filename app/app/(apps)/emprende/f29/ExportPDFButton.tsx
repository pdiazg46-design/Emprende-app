"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface ExportPDFButtonProps {
    month: number;
    year: number;
}

export function ExportPDFButton({ month, year }: ExportPDFButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const element = document.getElementById('f29-pdf-template');
            if (!element) {
                console.error("Template PDF no encontrado en el DOM");
                setIsExporting(false);
                return;
            }

            // Capturar la imagen forzada del canvas
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.98);

            // Instanciar un documento Carta (letter), vertical (portrait)
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

            // Calculamos propociones en milímetros 
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Inyectamos la imagen capturada en alta resolución y la descargamos
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Emprende_F29_Reporte_${month + 1}_${year}.pdf`);

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
