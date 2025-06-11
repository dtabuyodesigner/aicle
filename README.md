Buscador de Centros AICLE - CanariasEste proyecto es una aplicación web interactiva que permite buscar, filtrar y visualizar en un mapa los centros educativos de Canarias que participan en el Programa AICLE.Estructura del Proyecto/
|-- .github/workflows/   # (Para futura automatización)
|-- /css/
|   |-- style.css
|-- /data/
|   |-- centros_geocoded.json    # Base de datos con coordenadas
|-- /js/
|   |-- app.js
|-- /source_docs/
|   |-- LASPALMAS.PDF
|   |-- TENERIFE.pdf
|-- .gitignore
|-- extractor2.py                # Script con geocodificación
|-- index.html
|-- README.md
Fuente de Datos
Los datos se extraen de los listados definitivos publicados por la Consejería de Educación del Gobierno de Canarias. La página oficial de referencia es:Instrucciones y Documentación del Programa AICLE (https://www.gobiernodecanarias.org/educacion/web/programas-redes-educativas/programas-educativos/plurilinguismo/programa-aicle/programa-aicle/instrucciones-aicle)
Cómo Poner en Marcha el ProyectoPaso 1: Preparar el Entorno de PythonCrea y activa un entorno virtual:python3 -m venv venv
source venv/bin/activate 
(En Windows, usa .\venv\Scripts\activate)Instala las librerías necesarias:pip install pdfplumber geopy
Paso 2: Extraer y Geocodificar los DatosAsegúrate de que los archivos PDF originales están en la carpeta /source_docs/.Ejecuta el script extractor2.py. Este proceso tardará varios minutos.python3 extractor2.py
Al finalizar, se creará el archivo data/centros_geocoded.json.Paso 3: Probar la Web LocalmenteDesde la carpeta raíz del proyecto, inicia el servidor local de Python:python3 -m http.server
Abre tu navegador y ve a http://localhost:8000.Cómo Publicar en GitHub PagesCrea un Repositorio en GitHub (si no lo has hecho ya).Sube tus archivos usando GitHub Desktop o la línea de comandos.Activa GitHub Pages en la configuración de tu repositorio, asegurándote de que la rama sea main y la carpeta /(root).
