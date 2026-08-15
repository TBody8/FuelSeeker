# Plan de Implementación — Gasolineras España

> **Proyecto:** Plataforma web interactiva de consulta de precios de carburantes en España.
> **Datos:** API oficial del MITECO (Ministerio para la Transición Ecológica) — `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/`
> **Última actualización de este documento:** 15/08/2026

---

## 0. Contexto y decisiones de producto (confirmadas con el usuario)

| Decisión | Valor elegido |
|---|---|
| Estrategia CORS | Solo proxy de Vite en desarrollo (`vite.config.ts`). Documentada para producción. |
| Profundidad histórica | 1 año con muestreo semanal (~52 puntos por serie). |
| Dark mode | Sí, con toggle manual (clase `dark` en `<html>`, persistencia en `localStorage`). |
| Paleta | Azul oscuro (`#0f172a`/`#1e293b`) + verde esmeralda (`#10b981`). |
| Estilo | Minimalista, glassmorphism sutil *solo donde comunica profundidad* (overlays sobre el mapa), sombras difuminadas, microinteracciones, skeletons. |
| Stack | React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Leaflet/react-leaflet + leaflet.markercluster + Chart.js/react-chartjs-2 + Lucide React. |

---

## 1. Estructura de carpetas

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileDrawer.tsx
│   ├── map/
│   │   ├── MapView.tsx
│   │   ├── StationMarker.tsx          # (referencia; se usa el cluster con divIcon)
│   │   ├── StationCluster.tsx
│   │   ├── RadiusCircle.tsx
│   │   ├── FlyToCenter.tsx
│   │   └── stationIcon.ts             # constructor del divIcon con precio
│   ├── controls/
│   │   ├── RadiusSlider.tsx
│   │   ├── FuelTypeSelector.tsx
│   │   └── LocationSelector.tsx
│   ├── stations/
│   │   ├── StationList.tsx
│   │   ├── StationCard.tsx
│   │   └── StationCardSkeleton.tsx
│   ├── charts/
│   │   ├── HistoricalChart.tsx
│   │   ├── NationalChart.tsx
│   │   ├── ChartPanel.tsx
│   │   ├── StationHistory.tsx
│   │   └── chartConfig.ts             # registro Chart.js + opciones/tokens
│   └── ui/
│       ├── ThemeToggle.tsx
│       ├── LoadingSpinner.tsx
│       ├── GlassCard.tsx
│       └── Badge.tsx
├── hooks/
│   ├── useGeolocation.ts
│   ├── useStations.ts
│   ├── useNearbyStations.ts
│   ├── useHistoricalPrices.ts
│   ├── useNationalAverage.ts
│   ├── useLocations.ts
│   ├── useTheme.ts
│   └── useDebounce.ts
├── services/
│   ├── api.ts
│   ├── stationsService.ts
│   ├── listingsService.ts
│   ├── historicalService.ts
│   └── transformers.ts
├── types/
│   └── index.ts
├── utils/
│   ├── geo.ts
│   ├── format.ts
│   └── constants.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## 2. API del MITECO — Endpoints usados

Base: `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes`

| Endpoint | Método | Uso en la app |
|---|---|---|
| `EstacionesTerrestres/FiltroProvincia/{ID}` | GET | Estaciones de una provincia (fuente principal del mapa/listado) |
| `EstacionesTerrestres/FiltroMunicipio/{ID}` | GET | Estaciones de un municipio |
| `EstacionesTerrestresHist/{FECHA}` | GET | Snapshot nacional en una fecha (DD-MM-YYYY) → medias nacionales históricas |
| `Listados/Provincias/` | GET | Catálogo de provincias |
| `Listados/MunicipiosPorProvincia/{ID}` | GET | Municipios de una provincia |
| `Listados/ProductosPetroliferos/` | GET | Catálogo de productos (referencia) |

Productos: **Gasolina 95 E5 = `1`**, **Gasóleo A habitual = `4`**.

### Formato de datos de estación (normalizado)
`C.P.` → postalCode · `Dirección` → address · `Horario` → schedule · `Latitud` → lat (coma→punto) · `Longitud (WGS84)` → lng · `Municipio` → municipality · `Precio Gasolina 95 E5` → priceGasoline95 · `Precio Gasóleo A` → priceDieselA · `Rótulo` → brand · `IDEESS` → id.

### Nota sobre CORS y producción
La API del Ministerio **no envía cabeceras CORS**. En desarrollo se usa el proxy de Vite. Para producción será necesario un proxy serverless/backend (documentado en el README).

---

## 3. Estrategia de datos

1. **Estaciones:** nunca se llama al endpoint completo (>5 MB). Siempre filtrado por provincia (cache en memoria por provincia). Si el usuario navega a otra provincia, se descarga y se cachea.
2. **Histórico nacional:** 52 fechas (una por semana, 1 año). Peticiones con pool de máx. 5 concurrentes (`Promise.allSettled`). Media de precios por snapshot. Cache en `sessionStorage`.
3. **Histórico por estación:** reutiliza los mismos snapshots nacionales cacheados y localiza la estación por `id`; evita peticiones extra.
4. **Distancias:** fórmula de Haversine en `utils/geo.ts`.

---

## 4. Hooks

| Hook | Responsabilidad |
|---|---|
| `useGeolocation` | Posición del usuario vía `navigator.geolocation`; fallback Madrid (40.4168, -3.7038) si deniega. |
| `useStations` | Fetch + transform de estaciones por provincia/producto con cache. |
| `useNearbyStations` | Filtra por radio (Haversine) y ordena por precio ascendente. |
| `useHistoricalPrices` | Serie temporal de una estación (o nacional) con pool concurrente + progreso. |
| `useNationalAverage` | Medias nacionales actuales (Gasolina 95 y Gasóleo A) + serie histórica. |
| `useLocations` | Provincias y municipios encadenados, cacheados. |
| `useTheme` | Toggle dark/light con persistencia. |
| `useDebounce` | Debounce genérico (slider de radio). |

---

## 5. Diseño (directrices Hallmark aplicadas)

### Anti-patterns que se EVITAN (Skill Hallmark de Skills_Section)
- ❌ Gradient púrpura en hero, gradient en titulares, aurora-blobs, orbes flotantes.
- ❌ Tipografía única tipo Inter como display y body → **se emparejan** fuentes (display + body).
- ❌ Grid de 3 columnas con icono/heading/body simétricos.
- ❌ Card-anidada-en-card.
- ❌ Nav tipo "AI nav" (logo izquierda + 4 links + CTA derecha) → se usará un header funcional propio de app (no página marketing).
- ❌ Eyebrows decorativos (`01 /`, `02 /`) en cada sección.
- ❌ `transition-all` y `hover:scale-105` universal → transiciones de propiedades específicas, microinteracción única por elemento.
- ❌ Glassmorphism decorativo → solo como overlay funcional sobre el mapa (panel de controles, tarjetas flotantes).
- ❌ Emojis como iconos → **solo Lucide React** (una librería, un voice).
- ❌ Números sin alinear → `font-variant-numeric: tabular-nums` en precios.
- ❌ `z-index: 9999` → escala de z con niveles nombrados.
- ❌ Re-drawn browser chrome, Lottie innecesario, Three.js para objetos estáticos.
- ❌ Italic en headings → siempre roman; énfasis con peso o color.

### Principios aplicados
- **Tokens nombrados:** colores y fuentes vía variables CSS (`--color-*`, `--font-*`) / tokens de Tailwind. Sin valores inline improvisados.
- **Macroestructura:** la app es una *Workbench* (mapa central + paneles de trabajo), no una landing. La interacción es el contenido.
- **Contraste/accesibilidad:** check contrastes ≥ 4.5:1 texto, estados `:focus-visible` instantáneos (no animados), hover siempre con equivalente táctil.
- **Responsive:** 320/375/414/768 px sin scroll horizontal (`overflow-x: clip`), textos clicables a una línea, grid con `minmax(0,1fr)`.
- **Motion:** easings exponenciales-out, duraciones cortas; una sola entrada orquestada; `prefers-reduced-motion` respetado.
- **Skeletons** en lugar de spinners cuando el layout es conocido (lista de estaciones).

---

## 6. Fases de implementación

| Fase | Tarea | Estado |
|---|---|---|
| **F0** | Investigación de API + Skills_Section (Hallmark, anti-patterns) | ✅ Completado |
| **F1** | Scaffold Vite + React + TS, dependencias app, proxy CORS, Tailwind v4, tokens | ✅ Completado |
| **F2** | Capa `services/` (api.ts, transformers.ts, stationsService, listingsService, historicalService) | ✅ Completado |
| **F3** | Hooks base (useGeolocation, useTheme, useLocations, useDebounce, useStations, useNearbyStations, useHistoricalPrices, useNationalAverage) | ✅ Completado |
| **F4** | Layout (Header, ThemeToggle, App.tsx, tipos, constantes) | ✅ Completado |
| **F5** | MapView con tiles OSM/Carto dark, geolocalización, RadiusCircle, FlyToCenter | ✅ Completado |
| **F6** | LocationSelector + FuelTypeSelector + useStations + auto-selección de provincia | ✅ Completado |
| **F7** | useNearbyStations + StationList + StationCard + enlace Google Maps | ✅ Completado |
| **F8** | RadiusSlider + integración con mapa | ✅ Completado |
| **F9** | MarkerCluster (leaflet.markercluster) | ✅ Completado |
| **F10** | Sidebar + MobileDrawer responsive | ✅ Completado |
| **F11** | historicalService (provincia para estación, mensual para nacional) + hooks | ✅ Completado |
| **F12** | NationalChart + HistoricalChart + ChartPanel (carga bajo demanda por pestaña) | ✅ Completado |
| **F13** | Skeletons, microinteracciones, glassmorphism, polish final | ✅ Completado |
| **F14** | Dark mode completo (tiles oscuros CartoDB, gráficos, componentes) | ✅ Completado |
| **F15** | Build + lint + verificación proxy + optimización bundle (code-splitting) | ✅ Completado |
| **F16** | Documentación (README, PLAN_IMPLEMENTACION) + favicon de marca | ✅ Completado |

---

## 7. Estado actual (punto de retomada)

**TODAS las fases de implementación están completadas.** La aplicación compila (`tsc -b`),
el lint pasa limpio y el proxy de Vite verifica correctamente los tres endpoints usados
(provincias, estaciones por provincia y snapshot histórico por provincia).

### Verificaciones realizadas
1. `npm run build` → OK (code-splitting: mapa 189 KB, gráficos 225 KB cargados bajo demanda).
2. `npm run lint` (oxlint) → sin warnings (Skills_Section excluida del lint).
3. Proxy de Vite:
   - `/api/Listados/Provincias/` → 52 provincias.
   - `/api/EstacionesTerrestres/FiltroProvincia/28` → 893 estaciones de Madrid.
   - `/api/EstacionesTerrestresHist/FiltroProvincia/09-08-2026/28` → 891 estaciones con ambos precios.

### Optimizaciones de rendimiento aplicadas
- **Nunca** se llama al endpoint nacional completo (>5 MB); siempre por provincia + cache en memoria.
- Gráfico nacional con **muestreo mensual** (13 puntos; los snapshots nacionales pesan ~4 MB c/u).
- Histórico por estación con **muestreo semanal** (52 puntos) usando el endpoint ligero por provincia (~0.3 MB).
- Series y listados cacheados en `sessionStorage`.
- Chart.js y Leaflet cargados **bajo demanda** (React.lazy + Suspense) según pestaña activa del panel de gráficos.

### Pendiente para producción (fuera del alcance actual)
- Proxy backend propio (Express / Cloudflare Workers / Vercel Functions) que replique
  el proxy de Vite, porque la API del Ministerio no envía cabeceras CORS.
  Documentado en `README.md`.

---

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Proxy de Vite solo funciona en dev | Documentado en README (proxy serverless para producción). |
| 52 peticiones históricas lentas | Pool concurrente (5) + barra de progreso + carga perezosa del panel de gráficos. |
| API del Ministerio caída/lenta | 1 reintento con delay 2 s + mensajes de error amigables. |
| Datos históricos vacíos para fechas antiguas | Manejo graceful (se omiten puntos sin dato). |
| Endpoint completo >5 MB | Nunca sin filtro; siempre por provincia, cache en memoria. |
| Rendimiento con cientos de marcadores | `leaflet.markercluster` con `maxClusterRadius` y `spiderfyOnMaxZoom`. |