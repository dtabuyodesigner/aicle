import requests
from bs4 import BeautifulSoup
import os

# --- CONFIGURACIÓN ---
# URL de la página que contiene los enlaces a los PDFs
SOURCE_URL = "https://www.gobiernodecanarias.org/educacion/web/programas-redes-educativas/programas-educativos/plurilinguismo/programa-aicle/programa-aicle/instrucciones-aicle"
# Carpeta donde se guardarán los PDFs descargados
OUTPUT_FOLDER = "source_docs"
# Textos que buscamos en los enlaces para identificar los PDFs correctos
PDF_KEYWORDS = {
    "LASPALMAS.PDF": "Anexo I",
    "TENERIFE.pdf": "Anexo II"
}

def download_pdfs():
    """
    Navega a la URL de la consejería, encuentra los enlaces a los PDFs de los anexos
    y los descarga en la carpeta source_docs.
    """
    print(f"Accediendo a la página de la Consejería: {SOURCE_URL}")
    
    try:
        response = requests.get(SOURCE_URL)
        response.raise_for_status()  # Lanza un error si la petición falla
    except requests.exceptions.RequestException as e:
        print(f"Error al acceder a la página: {e}")
        return

    soup = BeautifulSoup(response.content, 'html.parser')
    
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)

    links_found = 0
    # Buscamos todos los enlaces (etiquetas <a>) en la página
    for link in soup.find_all('a', href=True):
        for filename, keyword in PDF_KEYWORDS.items():
            # Si el texto del enlace contiene nuestra palabra clave...
            if keyword in link.text:
                pdf_url = link['href']
                
                # Asegurarnos de que la URL es completa
                if not pdf_url.startswith('http'):
                    from urllib.parse import urljoin
                    pdf_url = urljoin(SOURCE_URL, pdf_url)

                print(f"  -> Encontrado enlace para '{keyword}': {pdf_url}")
                
                try:
                    pdf_response = requests.get(pdf_url)
                    pdf_response.raise_for_status()
                    
                    filepath = os.path.join(OUTPUT_FOLDER, filename)
                    with open(filepath, 'wb') as f:
                        f.write(pdf_response.content)
                    print(f"     -- Descargado y guardado como '{filename}'")
                    links_found += 1
                except requests.exceptions.RequestException as e:
                    print(f"     -- ERROR al descargar el PDF de {pdf_url}: {e}")
                
                # Evitar buscar la misma palabra clave de nuevo
                del PDF_KEYWORDS[filename]
                break
    
    if links_found < 2:
        print("\nADVERTENCIA: No se encontraron todos los PDFs esperados. Revisa la URL y las palabras clave.")
    else:
        print("\nDescarga de PDFs completada.")

if __name__ == "__main__":
    download_pdfs()

