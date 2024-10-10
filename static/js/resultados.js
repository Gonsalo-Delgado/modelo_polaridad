document.addEventListener('DOMContentLoaded', function() {
    resultados.forEach((resultado, index) => {
        const polaridadDiv = document.getElementById(`polaridad-${index + 1}`);

        if (resultado.polaridad === 'Positiva') {
            polaridadDiv.classList.add('bg-green-100', 'text-green-700');
        } else if (resultado.polaridad === 'Negativa') {
            polaridadDiv.classList.add('bg-red-100', 'text-red-700');
        } else if (resultado.polaridad === 'Neutra') {
            polaridadDiv.classList.add('bg-amber-100', 'text-amber-700');
        } else if (resultado.polaridad === 'No Clasificada') {
            polaridadDiv.classList.add('bg-purple-100', 'text-purple-700');
        }
    });
});

function showModalTable(index) {
    const resultado = resultados[index - 1];
    const tableHtml = `
                <table class="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead class="bg-gray-100 text-gray-700">
                        <tr>
                            <th class="px-4 py-3 text-left">Calidad de Imagen</th>
                            <th class="px-4 py-3 text-left">Píxeles Segmentados</th>
                            <th class="px-4 py-3 text-left">Procesamiento</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr>
                            <td class="px-4 py-3">
                                <p class="font-medium">Resolución: <span class="font-normal">${resultado.resolucion}</span></p>
                                <p class="font-medium">Formato: <span class="font-normal">${resultado.formato}</span></p>
                                <p class="font-medium">Nitidez: <span class="font-normal">${resultado.nitidez}</span></p>
                                <p class="font-medium">Artefactos: <span class="font-normal">${resultado.artefactos}</span></p>
                            </td>
                            <td class="px-4 py-3">
                                <p class="font-medium">Total de Píxeles: <span class="font-normal">${resultado.total_pixeles}</span></p>
                                <p class="font-medium">Segmentados Correctamente: <span class="font-normal">${resultado.pixeles_segmentados_correctamente}</span></p>
                                <p class="font-medium">Precisión: <span class="font-normal">${(resultado.precision_segmentacion).toFixed(2)}%</span></p>
                            </td>
                            <td class="px-4 py-3">
                                <p class="font-medium">Tiempo: <span class="font-normal">${resultado.tiempo.toFixed(2)}s</span></p>
                                <p class="font-medium">Precisión General: <span class="font-normal">${(resultado.precision_general * 100).toFixed(2)}%</span></p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            `;
    document.getElementById('modal-table-content').innerHTML = tableHtml;
    document.getElementById('modal-table').classList.remove('hidden');
}

function showModalText(text) {
    document.getElementById('modal-text-content').innerText = text;
    document.getElementById('modal-text').classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function downloadGeneralExcel() {
    const data = resultados.map(resultado => ({
        'Nombre': resultado.nombre || '',
        'Polaridad': resultado.polaridad || '',
        'Resolución': resultado.resolucion || '',
        'Formato': resultado.formato || '',
        'Nitidez': resultado.nitidez || '',
        'Artefactos': resultado.artefactos || '',
        'Total de Píxeles': resultado.total_pixeles || '',
        'Píxeles Segmentados Correctamente': resultado.pixeles_segmentados_correctamente || '',
        'Precisión Segmentación': resultado.precision_segmentacion ? resultado.precision_segmentacion.toFixed(2) : '', 
        'Tiempo': resultado.tiempo ? resultado.tiempo.toFixed(2) : '',
        'Precisión General': resultado.precision_general ? (resultado.precision_general * 100).toFixed(2) : '',
        'Texto Extraído': resultado.texto_extraido || ''
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados');
    
    XLSX.writeFile(workbook, 'resultados_clasificacion.xlsx');
}
