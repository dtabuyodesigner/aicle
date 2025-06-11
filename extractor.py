import pdfplumber
import json
import re
import os

def clean_text(text):
    """Limpia el texto eliminando saltos de línea y espacios extra."""
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()

def extract_data_from_pdfs():
    """
    Extrae los datos de los centros AICLE de los archivos PDF y los guarda en un archivo JSON.
    """
    source_folder = 'source_docs'
    pdf_files = {
        'LASPALMAS.PDF': 'Las Palmas',
        'TENERIFE.pdf': 'Santa Cruz de Tenerife'
    }
    all_centers = []
    
    print("Iniciando extracción de datos de los PDFs...")

    for filename, provincia in pdf_files.items():
        filepath = os.path.join(source_folder, filename)
        if not os.path.exists(filepath):
            print(f"ERROR: No se encontró el archivo {filepath}. Saltando...")
            continue

        print(f"\nProcesando archivo: {filename} (Provincia: {provincia})")
        
        try:
            with pdfplumber.open(filepath) as pdf:
                # Variables para mantener el estado del contexto actual
                current_modalidad = "No especificada"
                current_tipo_centro = "No especificado"
                current_idioma = "No especificado"

                for i, page in enumerate(pdf.pages):
                    text = page.extract_text()
                    lines = text.split('\n')

                    # Búsqueda y actualización del contexto en la página
                    for line in lines:
                        if "MODALIDAD SOLICITADA:" in line:
                            match = re.search(r'MODALIDAD SOLICITADA: ([A-Z])', line)
                            if match:
                                current_modalidad = match.group(1)
                        
                        if "Centros de Educación Infantil, Primaria y Centros de Educación Obligatoria" in line:
                            current_tipo_centro = "Infantil, Primaria y CEO"
                        elif "Centros de Educación Secundaria Obligatoria y Bachillerato" in line:
                            current_tipo_centro = "Secundaria y Bachillerato"

                        if "IDIOMA:" in line:
                            match = re.search(r'IDIOMA: (INGLÉS|ALEMÁN|FRANCÉS|ITALIANO)', line, re.IGNORECASE)
                            if match:
                                current_idioma = match.group(1).capitalize()
                        
                        if "NUEVA INCORPORACIÓN" in line:
                            current_modalidad = "Nueva Incorporación"
                        
                        if "adquieren el compromiso de alcanzar la modalidad" in line:
                            current_modalidad = "Compromiso C y D"
                    
                    # Extracción de tablas
                    tables = page.extract_tables()
                    for table in tables:
                        for row in table:
                            if not row or len(row) < 4 or not row[1] or not (isinstance(row[1], str) and re.match(r'\d{8}', clean_text(row[1]))):
                                continue

                            try:
                                centro_data = {
                                    'codigo': clean_text(row[1]),
                                    'nombre': clean_text(row[2]),
                                    'isla': clean_text(row[3]).title(),
                                    'provincia': provincia,
                                    'modalidad': current_modalidad,
                                    'tipo_centro': current_tipo_centro,
                                    'idioma': current_idioma
                                }
                                if not any(c['codigo'] == centro_data['codigo'] for c in all_centers):
                                    all_centers.append(centro_data)

                            except (IndexError, TypeError):
                                pass
        except Exception as e:
            print(f"ERROR: No se pudo procesar el archivo {filename}. Causa: {e}")

    output_folder = 'data'
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        
    output_path = os.path.join(output_folder, 'centros.json')
    all_centers_sorted = sorted(all_centers, key=lambda x: x['nombre'])
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_centers_sorted, f, ensure_ascii=False, indent=4)
        
    print(f"\n¡Extracción completada!")
    print(f"Se han procesado {len(all_centers_sorted)} centros y guardado en '{output_path}'.")

if __name__ == '__main__':
    extract_data_from_pdfs()

