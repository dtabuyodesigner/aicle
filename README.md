Buscador de Centros AICLE - Canarias
Este proyecto es una aplicación web interactiva que permite buscar y filtrar los centros educativos de Canarias que participan en el Programa AICLE, basándose en los listados definitivos para el curso 2025-2026.

La aplicación está construida con HTML, CSS y JavaScript para la parte web, y utiliza un script de Python para extraer los datos desde los documentos PDF oficiales.

Estructura del Proyecto
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

Paso 3: Probar la Web Localmente (¡Importante!)
Para que la web funcione en tu ordenador, no puedes simplemente hacer doble clic en el archivo index.html. Por motivos de seguridad, los navegadores bloquean la carga de archivos locales (como el centros.json) cuando la página se abre directamente desde el disco.

Necesitas simular un entorno de servidor web. ¡Es muy fácil con Python!

Abre una terminal en la carpeta raíz de tu proyecto (donde está index.html).

Si creaste un entorno virtual, asegúrate de que esté activado (source venv/bin/activate o similar).

Ejecuta el siguiente comando para iniciar un servidor web local:

python -m http.server

La terminal te mostrará un mensaje como Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...

Abre tu navegador web y ve a la siguiente dirección:

http://localhost:8000

¡Listo! Ahora verás tu aplicación web funcionando perfectamente en tu máquina local. Para detener el servidor, vuelve a la terminal y pulsa Ctrl + C.

Cómo Publicar en GitHub Pages
Una vez que has comprobado que todo funciona en local, sigue estos pasos para publicarlo en internet.

Paso 1: Crea un Repositorio en GitHub
(Este primer paso es común para ambas opciones).

Ve a tu cuenta de GitHub y haz clic en "New repository".

Dale un nombre (ej. buscador-aicle-canarias).

Asegúrate de que sea Público.

No inicialices con un README, .gitignore o licencia.

Haz clic en "Create repository".

Paso 2: Sube tus Archivos
Elige la opción que prefieras:

Opción A: Usando GitHub Desktop (Recomendado si eres nuevo)
Abre la aplicación GitHub Desktop.

Ve a File > Add Local Repository....

Haz clic en Choose... y selecciona tu carpeta del proyecto (ej. AICLE2). Haz clic en Add Repository.

La aplicación analizará los archivos. En la parte inferior izquierda, escribe un resumen del commit, por ejemplo, Versión inicial del proyecto, y haz clic en Commit to main.

Ahora, en la parte superior, verás un botón que dice Publish repository. Haz clic en él.

Asegúrate de que el nombre es correcto y desmarca la opción "Keep this code private". Haz clic en Publish repository.

Opción B: Usando la Línea de Comandos
Abre una terminal en la carpeta raíz de tu proyecto.

Copia la URL de tu repositorio recién creado.

Ejecuta los siguientes comandos:

git init
git add .
git commit -m "Versión inicial del proyecto"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
git push -u origin main

(Reemplaza la URL https://github.com/tu-usuario/tu-repositorio.git por la tuya).

Paso 3: Activa GitHub Pages
En la página de tu repositorio de GitHub, ve a "Settings" (Configuración).

En el menú de la izquierda, selecciona "Pages".

En la sección "Build and deployment", bajo "Source", selecciona "Deploy from a branch".

Asegúrate de que la rama seleccionada sea main y la carpeta sea /(root).

Haz clic en "Save".

Paso 4: ¡Listo!
GitHub tardará uno o dos minutos en construir y publicar tu página.

En la misma sección de "Pages", aparecerá un enlace a tu web publicada, algo como: https://tu-usuario.github.io/tu-repositorio/.

¡Ya tienes tu buscador online y compartible!
