"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ExportPDFButtonProps {
    month: number;
    year: number;
}

export function ExportPDFButton({ month, year }: ExportPDFButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const element = document.getElementById("f29-summary-capture");
            if (!element) throw new Error("No se encontró el resumen");

            // Temporalmente forzamos estilos para asegurar un buen renderizado
            element.style.background = "#0f172a"; // slate-900 (el color real del div)
            element.style.padding = "32px";
            element.style.borderRadius = "16px";

            const canvas = await html2canvas(element, {
                scale: 2, // Retína quality
                useCORS: true,
                backgroundColor: "#0f172a", // Evita bordes blancos irregulares
                logging: false,
            });

            // Revertimos estilos forzados (para no dañar la UI original)
            element.style.boxShadow = "";
            element.style.borderRadius = "32px"; // tailwind rounded-[2rem] original
            element.style.padding = ""; // Dejar que tailwind controle

            const imgData = canvas.toDataURL("image/jpeg", 0.95);

            // A4 = 210 x 297 mm
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Header Formal (Para darle toque a documento contable)
            pdf.setFontSize(20);
            pdf.setTextColor(15, 23, 42); // slate-900
            pdf.text("Resumen Formulario 29", 15, 20);

            pdf.setFontSize(12);
            pdf.setTextColor(100, 116, 139); // slate-500
            pdf.text(`Período Tributario: ${monthNames[month]} ${year}`, 15, 28);
            pdf.text(`Fecha de Emisión: ${new Date().toLocaleDateString("es-CL")}`, 15, 34);

            // Banner principal azul oscuro tomado desde Canvas
            const yOffset = 45;
            pdf.addImage(imgData, "JPEG", 15, yOffset, pdfWidth - 30, pdfHeight * (pdfWidth - 30) / pdfWidth);

            // Footer / Branding
            pdf.setFontSize(8);
            pdf.setTextColor(148, 163, 184); // slate-400
            pdf.text("Generado automáticamente por Emprende AutoF29.", 15, yOffset + pdfHeight * (pdfWidth - 30) / pdfWidth + 15);

            // Descargar
            pdf.save(`Resumen_F29_${monthNames[month]}_${year}.pdf`);

        } catch (error) {
            console.error("Error al generar PDF:", error);
            alert("Hubo un error al generar el PDF. Asegúrese de que el reporte haya cargado completamente.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-white text-indigo-900 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Download className="w-4 h-4" />
            {isExporting ? "Procesando PDF..." : "Exportar a Contador"}
        </button>
    );
}
