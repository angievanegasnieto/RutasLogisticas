from fastapi import FastAPI
from pydantic import BaseModel
import requests

app = FastAPI(title="Microservicio de Geocodificación")

# Modelo de entrada
class Direccion(BaseModel):
    direccion: str

@app.post("/geocodificar/")
def geocodificar(dato: Direccion):
    """
    Servicio independiente que convierte una dirección en coordenadas.
    Usa la API gratuita de Nominatim (OpenStreetMap).
    """
    url = f"https://nominatim.openstreetmap.org/search"
    params = {"q": dato.direccion, "format": "json"}
    headers = {"User-Agent": "MiAppPruebaLorena"}

    response = requests.get(url, params=params, headers=headers)

    if response.status_code == 200 and len(response.json()) > 0:
        data = response.json()[0]
        return {
            "direccion": dato.direccion,
            "latitud": data["lat"],
            "longitud": data["lon"]
        }
    else:
        return {"error": "No se encontraron coordenadas para esa dirección."}
