document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const elements = {
        tableBody: document.getElementById('results-table'),
        resultsCount: document.getElementById('results-count'),
        searchNombre: document.getElementById('search-nombre'),
        filterIsla: document.getElementById('filter-isla'),
        filterIdioma: document.getElementById('filter-idioma'),
        filterModalidad: document.getElementById('filter-modalidad'),
        clearFiltersBtn: document.getElementById('clear-filters'),
        sortableHeaders: document.querySelectorAll('.sortable'),
        // NUEVO: Referencia a la sección de estadísticas
        islandStatsContainer: document.getElementById('island-stats')
    };

    let allData = [];
    let currentSort = {
        column: 'nombre',
        direction: 'asc'
    };

    const dataUrl = 'https://raw.githubusercontent.com/dtabuyodesigner/aicle/main/data/centros.json';

    // --- Carga y Preparación de Datos ---
    async function loadData() {
        try {
            const response = await fetch(dataUrl);
            if (!response.ok) {
                throw new Error(`Error de red! status: ${response.status}`);
            }
            allData = await response.json();
            if (!Array.isArray(allData)) {
               throw new Error("El archivo JSON no contiene un array de datos.");
            }
            // NUEVO: Llamamos a las nuevas funciones al cargar los datos
            displayIslandStats(allData);
            populateFilters(allData);
            applyFilters();
        } catch (error) {
            console.error("No se pudo cargar o procesar el archivo de datos:", error);
            elements.tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500 p-4">Error al cargar los datos. Revisa la consola para más detalles (F12).</td></tr>`;
        }
    }

    // NUEVO: Función para mostrar estadísticas por isla
    function displayIslandStats(data) {
        const stats = data.reduce((acc, centro) => {
            acc[centro.isla] = (acc[centro.isla] || 0) + 1;
            return acc;
        }, {});

        const sortedIslands = Object.keys(stats).sort();

        elements.islandStatsContainer.innerHTML = ''; // Limpiamos el contenedor
        sortedIslands.forEach(isla => {
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded-lg shadow-md text-center';
            card.innerHTML = `
                <p class="text-sm text-gray-600">${isla}</p>
                <p class="text-2xl font-bold text-indigo-600">${stats[isla]}</p>
            `;
            elements.islandStatsContainer.appendChild(card);
        });
    }


    function populateFilters(data) {
        const islas = [...new Set(data.map(item => item.isla))].sort();
        const idiomas = [...new Set(data.map(item => item.idioma))].sort();
        const modalidades = [...new Set(data.map(item => item.modalidad))].sort();

        elements.filterIsla.innerHTML = '<option value="">Todas</option>';
        elements.filterIdioma.innerHTML = '<option value="">Todos</option>';
        elements.filterModalidad.innerHTML = '<option value="">Todas</option>';

        islas.forEach(isla => {
            if (isla) elements.filterIsla.add(new Option(isla, isla));
        });
        idiomas.forEach(idioma => {
            if (idioma) elements.filterIdioma.add(new Option(idioma, idioma));
        });
        modalidades.forEach(modalidad => {
           if (modalidad) elements.filterModalidad.add(new Option(modalidad, modalidad));
        });
    }

    // --- Lógica de Filtrado y Renderizado ---
    function applyFilters() {
        const filters = {
            nombre: elements.searchNombre.value.toLowerCase(),
            isla: elements.filterIsla.value,
            idioma: elements.filterIdioma.value,
            modalidad: elements.filterModalidad.value
        };

        let filteredData = allData.filter(item => {
            const nombreMatch = item.nombre.toLowerCase().includes(filters.nombre);
            const islaMatch = filters.isla ? item.isla === filters.isla : true;
            const idiomaMatch = filters.idioma ? item.idioma === filters.idioma : true;
            const modalidadMatch = filters.modalidad ? item.modalidad === filters.modalidad : true;
            return nombreMatch && islaMatch && idiomaMatch && modalidadMatch;
        });

        sortData(filteredData);
        renderTable(filteredData);
    }

    function renderTable(data) {
        elements.tableBody.innerHTML = '';
        if (data.length === 0) {
            elements.tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 p-4">No se encontraron centros con los filtros seleccionados.</td></tr>`;
        } else {
            data.forEach(item => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${item.nombre}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.isla}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.provincia}</td>
                    <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">${item.idioma}</span></td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.modalidad}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.codigo}</td>
                `;
                elements.tableBody.appendChild(row);
            });
        }
        elements.resultsCount.textContent = data.length;
    }

    // --- Lógica de Ordenación ---
    function sortData(data) {
        data.sort((a, b) => {
            const valA = a[currentSort.column] || '';
            const valB = b[currentSort.column] || '';

            if (valA < valB) {
                return currentSort.direction === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return currentSort.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    function handleSort(e) {
        const newColumn = e.target.closest('.sortable').dataset.sort;

        if (currentSort.column === newColumn) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = newColumn;
            currentSort.direction = 'asc';
        }

        updateSortIcons();
        applyFilters();
    }

    function updateSortIcons() {
        elements.sortableHeaders.forEach(header => {
            const arrow = header.querySelector('.arrow');
            header.classList.remove('asc', 'desc');
            if (header.dataset.sort === currentSort.column) {
                header.classList.add(currentSort.direction);
            }
        });
    }

    // --- Event Listeners ---
    elements.searchNombre.addEventListener('input', applyFilters);
    elements.filterIsla.addEventListener('change', applyFilters);
    elements.filterIdioma.addEventListener('change', applyFilters);
    elements.filterModalidad.addEventListener('change', applyFilters);
    elements.sortableHeaders.forEach(header => header.addEventListener('click', handleSort));

    elements.clearFiltersBtn.addEventListener('click', () => {
        elements.searchNombre.value = '';
        elements.filterIsla.value = '';
        elements.filterIdioma.value = '';
        elements.filterModalidad.value = '';
        applyFilters();
    });

    // --- Inicialización ---
    loadData();
    updateSortIcons();
});

