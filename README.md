/
|-- /css/
|   |-- style.css         # Hoja de estilos
|-- /data/
|   |-- centros.json      # Base de datos (generada por Python)
|-- /js/
|   |-- app.js            # Lógica de la aplicación web
|-- /source_docs/
|   |-- LASPALMAS.PDF     # PDF original
|   |-- TENERIFE.pdf      # PDF original
|-- .gitignore            # Archivos a ignorar por Git
|-- extractor.py          # Script para extraer datos de los PDFs
|-- index.html            # Estructura de la página web
|-- README.md             # Esta guía

Cómo Poner en Marcha el Proyecto
Sigue estos pasos para generar los datos y probar la web en tu ordenador.

Paso 1: Preparar el Entorno de Python
Necesitas tener Python instalado en tu sistema.

Crea un entorno virtual (Recomendado):
Abre tu terminal en la carpeta raíz del proyecto y ejecuta:

python -m venv venv

Activa el entorno:

En Windows: .\venv\Scripts\activate

En macOS/Linux: source venv/bin/activate

Instala las librerías necesarias:
Con el entorno activado, instala la librería para leer PDFs:

pip install pdfplumber

Paso 2: Extraer los Datos
Asegúrate de que los archivos LASPALMAS.PDF y TENERIFE.pdf están dentro de la carpeta /source_docs/.

Ejecuta el script de extracción desde la carpeta raíz:

python extractor.py

Si todo va bien, verás un mensaje de éxito y se creará el archivo data/centros.json.

Paso 3: Probar la Web Localmente
Simplemente abre el archivo index.html en tu navegador web (Firefox, Chrome, etc.). La página debería cargar y mostrar los filtros y la tabla con todos los centros.

Cómo Publicar en GitHub Pages
Sigue estos pasos para subir tu proyecto a GitHub y publicarlo como una web online gratuita.

Crea un Repositorio en GitHub:

Ve a tu cuenta de GitHub y haz clic en "New repository".

Dale un nombre (ej. buscador-aicle-canarias).

Asegúrate de que sea Público.

No inicialices con un README, .gitignore o licencia, ya que nosotros los proporcionaremos.

Copia la URL del repositorio que te proporciona GitHub (ej. https://github.com/tu-usuario/buscador-aicle-canarias.git).

Sube tus Archivos al Repositorio:

Abre una terminal en la carpeta de tu proyecto.

Inicializa Git, añade los archivos, haz tu primer commit y enlaza tu repositorio local con el de GitHub.

git init
git add .
git commit -m "Versión inicial del proyecto"
git branch -M main
git remote add origin https://github.com/tu-usuario/buscador-aicle-canarias.git
git push -u origin main

(Reemplaza la URL con la tuya).

Activa GitHub Pages:

En la página de tu repositorio de GitHub, ve a "Settings" (Configuración).

En el menú de la izquierda, selecciona "Pages".

En la sección "Build and deployment", bajo "Source", selecciona "Deploy from a branch".

Asegúrate de que la rama seleccionada sea main y la carpeta sea /(root).

Haz clic en "Save".

¡Listo!

GitHub tardará uno o dos minutos en construir y publicar tu página.

En la misma sección de "Pages", aparecerá un enlace a tu web publicada, algo como: https://tu-usuario.github.io/buscador-aicle-canarias/.

¡Ya tienes tu buscador online y compartible!
