from fastapi import FastAPI
from pydantic import BaseModel
import folium
from geopy.geocoders import Nominatim
from geopy.distance import geodesic

app = FastAPI(title="Servicio de Rutas con Mapa")

# --- Modelo para recibir las direcciones ---
class DireccionesRequest(BaseModel):
    direcciones: list[str]

# --- Función para obtener coordenadas ---
def obtener_coordenadas(direccion):
    geolocator = Nominatim(user_agent="geoapi")
    location = geolocator.geocode(direccion)
    if location:
        return (location.latitude, location.longitude)
    return None

# --- Función para generar el mapa con la ruta ---
def generar_mapa(direcciones):
    coordenadas = []
    for d in direcciones:
        coord = obtener_coordenadas(d)
        if coord:
            coordenadas.append({
                "direccion": d,
                "latitud": coord[0],
                "longitud": coord[1]
            })

    # Ordenar las direcciones por distancia (empezando desde la primera)
    ruta_ordenada = [coordenadas[0]]
    coordenadas_restantes = coordenadas[1:]

    while coordenadas_restantes:
        ultimo = ruta_ordenada[-1]
        siguiente = min(coordenadas_restantes, key=lambda x: geodesic(
            (ultimo["latitud"], ultimo["longitud"]),
            (x["latitud"], x["longitud"])
        ).km)
        ruta_ordenada.append(siguiente)
        coordenadas_restantes.remove(siguiente)

    # Crear el mapa
    mapa = folium.Map(location=[ruta_ordenada[0]["latitud"], ruta_ordenada[0]["longitud"]], zoom_start=12)

    # Agregar marcadores y líneas
    for punto in ruta_ordenada:
        folium.Marker(
            location=[punto["latitud"], punto["longitud"]],
            popup=f"{punto['direccion']}<br>Lat: {punto['latitud']}<br>Lon: {punto['longitud']}"
        ).add_to(mapa)

    puntos = [(p["latitud"], p["longitud"]) for p in ruta_ordenada]
    folium.PolyLine(puntos, color="blue", weight=4, opacity=0.8).add_to(mapa)

    # Guardar el mapa en un archivo HTML
    mapa.save("ruta.html")

    return ruta_ordenada

# --- Endpoint principal ---
@app.post("/generar_ruta")
def generar_ruta(request: DireccionesRequest):
    ruta = generar_mapa(request.direcciones)
    return {"rutas": ruta, "mensaje": "Mapa generado correctamente. Se guardó como ruta.html"}
