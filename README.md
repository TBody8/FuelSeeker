# Carburantes España

Plataforma web interactiva para consultar los precios actualizados de gasolina y gasóleo en las estaciones de servicio de España, con datos oficiales del Ministerio para la Transición Ecológica (MITECO).

## Funcionalidades

- **Mapa interactivo** (Leaflet / OpenStreetMap) con geolocalización automática del usuario.
- **Agrupación de marcadores** (`leaflet.markercluster`) para mantener fluido el mapa con cientos de estaciones.
- **Radio de búsqueda** deslizante (1–50 km) con círculo visual en el mapa.
- **Selector de localidad** encadenado provincia → municipio, con datos oficiales de la API.
- **Lista ordenada** de gasolineras de más barata a más cara, con distancia y enlace directo a Google Maps.
- **Gráfico de evolución histórica** por estación (1 año, muestreo semanal).
- **Gráfico de media nacional** (gasolina 95 y gasóleo A) con muestreo mensual, cargado bajo demanda.
- **Modo oscuro** con toggle manual y persistencia.

## Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4
- Leaflet / React-Leaflet / leaflet.markercluster
- Chart.js / React-Chartjs-2
- Lucide React

## Puesta en marcha

```bash
npm install
npm run dev
```

La aplicación arranca en `http://localhost:5173`.

## API oficial del MITECO

Datos vía la API pública REST de precios de carburantes:

```
https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/
```

Documentación de endpoints: `…/PreciosCarburantes/help`. Sin autenticación, solo GET.

### Sobre CORS (importante)

La API del Ministerio **no envía cabeceras CORS**, por lo que el navegador bloquea las
llamadas directas desde el frontend. Este proyecto resuelve el problema en desarrollo con
**un proxy de Vite** (`server.proxy` en `vite.config.ts`): el frontend llama a `/api/…` y
Vite lo reenvía al Ministerio.

**Para producción** es necesario un proxy en tu propio backend (Express, Cloudflare Workers,
Vercel Functions, etc.) que reenvíe las peticiones a la API del Ministerio. El proyecto no
incluye backend a propósito; solo necesitas replicar el comportamiento del proxy:

```
Frontend  →  /api/EstacionesTerrestres/...  →  proxy  →  https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/...
```

### Endpoints usados

| Endpoint | Uso |
|---|---|
| `Listados/Provincias/` | Catálogo de provincias |
| `Listados/MunicipiosPorProvincia/{ID}` | Municipios de una provincia |
| `EstacionesTerrestres/FiltroProvincia/{ID}` | Estaciones de una provincia (todos los precios) |
| `EstacionesTerrestresHist/FiltroProvincia/{FECHA}/{ID}` | Snapshot histórico por provincia (`DD-MM-YYYY`) |
| `EstacionesTerrestresHist/FiltroProducto/{FECHA}/{ID}` | Snapshot nacional por producto (medias nacionales) |

Productos: **Gasolina 95 E5 = 1**, **Gasóleo A = 4**.

## Estructura

```
src/
├── components/   # UI atómica: layout, map, controls, stations, charts, ui
├── hooks/         # useGeolocation, useStations, useNearbyStations, useTheme, ...
├── services/      # Conexión con la API del Ministerio y transformadores
├── types/         # Tipos TypeScript
└── utils/         # geo (Haversine), format, constants
```

## Notas de rendimiento

- El endpoint nacional completo supera los 5 MB sin comprimir; **nunca se llama sin filtro**.
  Las estaciones se cargan siempre por provincia y se cachean en memoria.
- El gráfico nacional usa **muestreo mensual** (los snapshots nacionales pesan ~4 MB cada uno).
- El histórico por estación usa el endpoint **por provincia** (~0,3 MB) con muestreo semanal.
- Las series históricas y los listados se cachean en `sessionStorage`.
- Chart.js y Leaflet se cargan de forma **diferida** (code-splitting de Vite).
