from fastapi import FastAPI
from pydantic import BaseModel
import requests

app = FastAPI(
    title="Microservicio de Geocodificación",
    description="Convierte una dirección en coordenadas (latitud y longitud) usando la API gratuita de Nominatim (OpenStreetMap).",
    version="1.0.0"
)

# Modelo de entrada
class Direccion(BaseModel):
    direccion: str

# Modelo de salida
class Coordenadas(BaseModel):
    direccion: str
    latitud: float
    longitud: float

@app.post("/geocodificar/", response_model=Coordenadas)
def geocodificar(dato: Direccion):
    """
    Introduce una dirección y obtén sus coordenadas.
    Ejemplo:
    {
        "direccion": "Calle 80 # 73a-20 Bogotá"
    }
    """
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": dato.direccion, "format": "json"}
    headers = {"User-Agent": "MicroservicioGeocodificacionLorena"}

    response = requests.get(url, params=params, headers=headers)

    if response.status_code == 200 and len(response.json()) > 0:
        data = response.json()[0]
        return {
            "direccion": dato.direccion,
            "latitud": float(data["lat"]),
            "longitud": float(data["lon"])
        }
    else:
        return {"direccion": dato.direccion, "latitud": 0.0, "longitud": 0.0}
