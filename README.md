Buscador de Centros AICLE - CanariasEste proyecto es una aplicación web interactiva que permite buscar, filtrar y visualizar en un mapa los centros educativos de Canarias que participan en el Programa AICLE.Estructura del Proyecto/
|-- .github/workflows/   # (Para futura automatización)
|-- /css/
|   |-- style.css
|-- /data/
|   |-- centros.json             # Datos base
|   |-- centros_geocoded.json    # Datos con coordenadas
|-- /js/
|   |-- app.js
|-- /source_docs/
|   |-- LASPALMAS.PDF
|   |-- TENERIFE.pdf
|-- .gitignore
|-- extractor.py                 # Script original
|-- extractor2.py                # Script con geocodificación
|-- index.html
|-- README.md
Cómo Poner en Marcha el Proyecto (con Mapa)Paso 1: Preparar el Entorno de PythonCrea y activa un entorno virtual:python -m venv venv
source venv/bin/activate 
(En Windows, usa .\venv\Scripts\activate)Instala las librerías necesarias:Ahora necesitamos dos librerías: una para leer PDFs y otra para la geocodificación.pip install pdfplumber geopy
Paso 2: Extraer y Geocodificar los DatosAsegúrate de que los archivos LASPALMAS.PDF y TENERIFE.pdf están en la carpeta /source_docs/.Ejecuta el nuevo script extractor2.py. Este proceso contactará con un servicio de mapas y tardará varios minutos en completarse. Sé paciente.python extractor2.py
Al finalizar, se creará el archivo data/centros_geocoded.json. Este es el archivo que usará la web para el mapa.Paso 3: Probar la Web Localmente(Igual que antes)Desde la carpeta raíz del proyecto, inicia el servidor local de Python:python -m http.server
Abre tu navegador y ve a http://localhost:8000.Cómo Publicar en GitHub Pages(El proceso no cambia, solo asegúrate de subir el nuevo archivo centros_geocoded.json).
