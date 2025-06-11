document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM ---
    const elements = {
        loader: document.getElementById('loader-overlay'),
        tableBody: document.getElementById('results-table'),
        resultsCount: document.getElementById('results-count'),
        searchNombre: document.getElementById('search-nombre'),
        filterIsla: document.getElementById('filter-isla'),
        filterIdioma: document.getElementById('filter-idioma'),
        filterModalidad: document.getElementById('filter-modalidad'),
        clearFiltersBtn: document.getElementById('clear-filters'),
        exportCsvBtn: document.getElementById('export-csv'),
        sortableHeaders: document.querySelectorAll('.sortable'),
        islandStatsContainer: document.getElementById('island-stats'),
        mapContainer: document.getElementById('map')
    };

    // --- Estado de la aplicación ---
    let allData = [];
    let fuse;
    let filteredDataCache = [];
    let map;
    let markersLayer; // Se inicializará más tarde
    let currentSort = { column: 'nombre', direction: 'asc' };
    
    // URL correcta y definitiva al archivo de datos en tu repositorio
    const dataUrl = 'https://raw.githubusercontent.com/dtabuyodesigner/aicle/main/data/centros_geocoded.json';

    // --- Funciones de inicialización ---
    async function initializeApp() {
        showLoader();
        initializeMap();
        try {
            await loadData();
            setupFuse();
            displayIslandStats(allData); // Se movió aquí para que siempre se muestre
            populateFilters();
            applyFiltersAndRender();
            setupEventListeners();
        } catch (error) {
            handleLoadError(error);
        } finally {
            hideLoader();
        }
    }

    async function loadData() {
        const response = await fetch(dataUrl);
        if (!response.ok) {
            // Este error se mostrará si la URL es incorrecta o el archivo no existe
            throw new Error(`Error de red: ${response.status}. No se pudo encontrar el archivo en ${dataUrl}`);
        }
        allData = await response.json();
        if (!Array.isArray(allData)) {
            throw new Error("El archivo JSON no es un array válido.");
        }
    }

    function setupFuse() {
        const fuseOptions = { keys: ['nombre'], includeScore: true, threshold: 0.4 };
        fuse = new Fuse(allData, fuseOptions);
    }

    function initializeMap() {
        map = L.map(elements.mapContainer).setView([28.4636, -16.2518], 8); // Centrado en Canarias
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        // CORRECCIÓN: Usamos L.featureGroup() en lugar de L.layerGroup()
        // L.featureGroup() SÍ tiene el método getBounds() que necesitamos.
        markersLayer = L.featureGroup().addTo(map);
    }
    
    // --- Funciones de renderizado y actualización ---
    function applyFiltersAndRender() {
        filterData();
        sortData();
        renderTable();
        updateMap();
    }
    
    function filterData() {
        const filters = {
            nombre: elements.searchNombre.value.trim(),
            isla: elements.filterIsla.value,
            idioma: elements.filterIdioma.value,
            modalidad: elements.filterModalidad.value
        };

        let results = filters.nombre ? fuse.search(filters.nombre).map(r => r.item) : allData;

        filteredDataCache = results.filter(item => 
            (filters.isla ? item.isla === filters.isla : true) &&
            (filters.idioma ? item.idioma === filters.idioma : true) &&
            (filters.modalidad ? item.modalidad === filters.modalidad : true)
        );
    }
    
    function renderTable() {
        elements.tableBody.innerHTML = '';
        if (filteredDataCache.length === 0) {
            elements.tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 p-4">No se encontraron centros.</td></tr>`;
        } else {
            filteredDataCache.forEach(item => {
                const warningIcon = !item.geocoded ? `<i class="fa-solid fa-triangle-exclamation text-yellow-500 ml-2" title="Ubicación no encontrada en el mapa"></i>` : '';
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-gray-900">${item.nombre}${warningIcon}</div></td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.isla}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.provincia}</td>
                    <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">${item.idioma}</span></td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.modalidad}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.codigo}</td>
                `;
                elements.tableBody.appendChild(row);
            });
        }
        elements.resultsCount.textContent = filteredDataCache.length;
    }
    
    function updateMap() {
        markersLayer.clearLayers();
        const geocodedCenters = filteredDataCache.filter(c => c.geocoded && c.lat && c.lon);

        if (geocodedCenters.length > 0) {
            geocodedCenters.forEach(center => {
                L.marker([center.lat, center.lon])
                    .addTo(markersLayer)
                    .bindPopup(`<b>${center.nombre}</b><br>${center.isla}`);
            });
            map.fitBounds(markersLayer.getBounds(), { padding: [50, 50], maxZoom: 14 });
        } else {
            // Si no hay resultados geocodificados, volvemos a la vista general de Canarias
            map.setView([28.4636, -16.2518], 8);
        }
    }

    function populateFilters() {
        const getUniqueSorted = (key) => [...new Set(allData.map(item => item[key]))].filter(Boolean).sort();
        const islas = getUniqueSorted('isla');
        const idiomas = getUniqueSorted('idioma');
        const modalidades = getUniqueSorted('modalidad');

        const populateSelect = (select, options, defaultText) => {
            select.innerHTML = `<option value="">${defaultText}</option>`;
            options.forEach(opt => select.add(new Option(opt, opt)));
        };
        
        populateSelect(elements.filterIsla, islas, 'Todas');
        populateSelect(elements.filterIdioma, idiomas, 'Todos');
        populateSelect(elements.filterModalidad, modalidades, 'Todas');
    }
    
    function displayIslandStats(data) {
        const stats = data.reduce((acc, c) => { if(c.isla) { acc[c.isla] = (acc[c.isla] || 0) + 1; } return acc; }, {});
        elements.islandStatsContainer.innerHTML = Object.keys(stats).sort().map(isla => `
            <div class="bg-white p-4 rounded-lg shadow-md text-center">
                <p class="text-sm text-gray-600">${isla}</p>
                <p class="text-2xl font-bold text-indigo-600">${stats[isla]}</p>
            </div>
        `).join('');
    }

    // --- Lógica de eventos y utilidades ---
    function sortData() {
        filteredDataCache.sort((a, b) => {
            const valA = a[currentSort.column] || '';
            const valB = b[currentSort.column] || '';
            if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    function setupEventListeners() {
        elements.searchNombre.addEventListener('input', applyFiltersAndRender);
        elements.filterIsla.addEventListener('change', applyFiltersAndRender);
        elements.filterIdioma.addEventListener('change', applyFiltersAndRender);
        elements.filterModalidad.addEventListener('change', applyFiltersAndRender);
        elements.exportCsvBtn.addEventListener('click', exportToCSV);

        elements.sortableHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                const newColumn = e.target.closest('.sortable').dataset.sort;
                currentSort.direction = currentSort.column === newColumn && currentSort.direction === 'asc' ? 'desc' : 'asc';
                currentSort.column = newColumn;
                updateSortIcons();
                applyFiltersAndRender();
            });
        });

        elements.clearFiltersBtn.addEventListener('click', () => {
            elements.searchNombre.value = '';
            elements.filterIsla.value = '';
            elements.filterIdioma.value = '';
            elements.filterModalidad.value = '';
            applyFiltersAndRender();
        });
    }

    function updateSortIcons() {
        elements.sortableHeaders.forEach(header => {
            header.classList.remove('asc', 'desc');
            if (header.dataset.sort === currentSort.column) header.classList.add(currentSort.direction);
        });
    }
    
    function exportToCSV() {
        if (filteredDataCache.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }
        const headers = ["Codigo", "Nombre", "Isla", "Provincia", "Idioma", "Modalidad", "Tipo Centro", "Geocoded"];
        const rows = filteredDataCache.map(c => [
            `"${c.codigo}"`, `"${c.nombre.replace(/"/g, '""')}"`, `"${c.isla}"`, `"${c.provincia}"`,
            `"${c.idioma}"`, `"${c.modalidad}"`, `"${c.tipo_centro}"`, `"${c.geocoded}"`
        ].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(',')].concat(rows).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "centros_aicle_filtrados.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function showLoader() { elements.loader.classList.remove('hidden'); }
    function hideLoader() { elements.loader.classList.add('hidden'); }
    function handleLoadError(error) { 
        console.error("Error detallado:", error); 
        elements.tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500 p-4"><b>Error al cargar los datos.</b><br><span class="text-xs text-gray-600">Asegúrate de que el archivo 'centros_geocoded.json' está subido en la carpeta 'data' de tu repositorio.</span></td></tr>`; 
    }

    // --- Ejecución ---
    initializeApp();
});

