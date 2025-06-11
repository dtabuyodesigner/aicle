import pdfplumber
import json
import re
import os
import time
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

def clean_text(text):
    """Limpia el texto eliminando saltos de línea y espacios extra."""
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()

def extract_data_from_pdfs():
    """
    Extrae los datos de los centros AICLE de los archivos PDF.
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
                current_modalidad = "No especificada"
                current_tipo_centro = "No especificado"
                current_idioma = "No especificado"

                for page in pdf.pages:
                    text = page.extract_text()
                    lines = text.split('\n')

                    for line in lines:
                        if "MODALIDAD SOLICITADA:" in line:
                            match = re.search(r'MODALIDAD SOLICITADA: ([A-Z])', line)
                            if match: current_modalidad = match.group(1)
                        if "Centros de Educación Infantil, Primaria y Centros de Educación Obligatoria" in line:
                            current_tipo_centro = "Infantil, Primaria y CEO"
                        elif "Centros de Educación Secundaria Obligatoria y Bachillerato" in line:
                            current_tipo_centro = "Secundaria y Bachillerato"
                        if "IDIOMA:" in line:
                            match = re.search(r'IDIOMA: (INGLÉS|ALEMÁN|FRANCÉS|ITALIANO)', line, re.IGNORECASE)
                            if match: current_idioma = match.group(1).capitalize()
                        if "NUEVA INCORPORACIÓN" in line:
                            current_modalidad = "Nueva Incorporación"
                        if "adquieren el compromiso de alcanzar la modalidad" in line:
                            current_modalidad = "Compromiso C y D"
                    
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
    
    print(f"\nExtracción básica completada. Se encontraron {len(all_centers)} centros.")
    return all_centers

def geocode_centers(centers):
    """
    Añade coordenadas de latitud y longitud a cada centro usando Nominatim.
    """
    geolocator = Nominatim(user_agent="aicle_map_extractor_daniel_1.0")
    # RateLimiter asegura que no hacemos más de 1 petición por segundo, para cumplir las normas de la API
    geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)
    
    print("\nIniciando geocodificación de centros. Esto puede tardar varios minutos...")
    
    for i, center in enumerate(centers):
        # Creamos una consulta más específica para mejorar la precisión
        query = f"{center['nombre']}, {center['isla']}, España"
        print(f"({i+1}/{len(centers)}) Geocodificando: {center['nombre']}...")
        
        try:
            location = geocode(query, exactly_one=True, timeout=10)
            if location:
                center['lat'] = location.latitude
                center['lon'] = location.longitude
                center['geocoded'] = True
                print("  -> ¡Encontrado!")
            else:
                center['lat'] = None
                center['lon'] = None
                center['geocoded'] = False
                print("  -> No se encontró ubicación.")
        except Exception as e:
            print(f"  -> ERROR durante la geocodificación: {e}")
            center['lat'] = None
            center['lon'] = None
            center['geocoded'] = False
            
    return centers

if __name__ == '__main__':
    # Paso 1: Extraer los datos base de los PDFs
    extracted_centers = extract_data_from_pdfs()
    
    # Paso 2: Enriquecer los datos con coordenadas geográficas
    geocoded_centers = geocode_centers(extracted_centers)
    
    # Paso 3: Guardar los datos enriquecidos en un nuevo archivo
    output_folder = 'data'
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        
    output_path = os.path.join(output_folder, 'centros_geocoded.json')
    
    # Ordenar la lista final alfabéticamente por nombre de centro
    geocoded_centers_sorted = sorted(geocoded_centers, key=lambda x: x['nombre'])
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(geocoded_centers_sorted, f, ensure_ascii=False, indent=4)
        
    print(f"\n¡Proceso completado!")
    print(f"Se han procesado y geocodificado {len(geocoded_centers_sorted)} centros.")
    print(f"Los datos enriquecidos se han guardado en: '{output_path}'")

