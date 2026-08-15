# AGENTS.md — Carburantes España

> **Documentación de contexto para agentes de IA sin conocimiento previo del proyecto.**
> Si estás leyendo esto es que un modelo de lenguaje (LLM) va a trabajar sobre este
> repositorio y necesita entender qué hace, cómo funciona y qué falta por hacer.
> Léelo completo antes de tocar código. Los comandos de verificación obligatorios
> están en la sección **Comandos**.

---

## 1. ¿Qué es esta página?

**Carburantes España** es una aplicación web **SPA (React)** que permite a un usuario
español consultar, en un **mapa interactivo**, los **precios en tiempo real de la
gasolina (Gasolina 95 E5) y el gasóleo (Gasóleo A)** en las estaciones de servicio de
España, usando **datos oficiales del Ministerio para la Transición Ecológica (MITECO)**.

El objetivo principal de la UX: *"encuentra la gasolinera más barata cerca de ti lo más
rápido posible"*.

### Funcionalidades implementadas

1. **Mapa interactivo** (Leaflet + OpenStreetMap) centrado automáticamente en la
   **geolocalización del usuario** (con `navigator.geolocation`; fallback a Madrid si
   el usuario deniega el permiso o si no hay soporte).
2. **Agrupación de marcadores** (`leaflet.markercluster`): cuando el radio abarca
   cientos de estaciones, los marcadores se agrupan en clusters con el número de
   estaciones, y se "spiderfizan" al hacer zoom máximo.
3. **Marcadores con precio**: cada marcador muestra el precio en céntimos y un color
   relativo al rango de precios del mercado actual (verde = barato, ámbar = medio,
   rojo = caro, gris = neutro).
4. **Control deslizante de radio** (1–50 km) con un **círculo visual** sobre el mapa
   que delimita el área de búsqueda.
5. **Selector de localidad encadenado**: Provincia → Municipio (datos oficiales del
   MITECO). Al elegir localidad, el mapa "vuela" (flyTo) al centro de esa zona.
6. **Auto-selección de provincia**: al cargar, si la geolocalización responde y aún no
   se ha elegido localidad, se selecciona automáticamente la provincia más cercana al
   usuario (mediante centroides aproximados en `PROVINCE_CENTERS`).
7. **Lista lateral de gasolineras** dentro del radio, **ordenada de más barata a más
   cara** según el combustible seleccionado. Cada tarjeta muestra marca, dirección,
   municipio, distancia al centro, precio con color relativo, badge "Más barata" y un
   **enlace directo a Google Maps** (`https://www.google.com/maps/dir/?api=1&destination=lat,lng`).
8. **Gráfico de evolución histórica por estación**: al expandir una tarjeta (o desde el
   panel de gráficos), se muestra una línea con el precio de Gasolina 95 y Gasóleo A de
   esa estación a lo largo del último año (muestreo semanal).
9. **Gráfico de media nacional (macro)**: panel independiente que muestra el precio
   medio nacional de Gasolina 95 y Gasóleo A en el último año (muestreo mensual), con
   tarjetas de resumen de las medias actuales. Carga **bajo demanda** (solo cuando se
   abre el panel y se pulsa la pestaña "Media nacional").
10. **Modo oscuro**: toggle manual (`Sun`/`Moon`), persistido en `localStorage`. Cambia
    todos los componentes, los gráficos y las **tiles del mapa** (usa CartoDB Dark Matter
    en oscuro y OpenStreetMap estándar en claro).
11. **Diseño responsive**: en móvil (<768px) el sidebar se convierte en un **drawer
    deslizante** (`MobileDrawer`) y el panel de gráficos se apila sobre el mapa.

### Idiomas

Todo el texto visible de la UI está en **español**. Los precios se muestran con coma
decimal (formato español: `1,799 €/L`).

---

## 2. Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | **React 19** + TypeScript | Hooks, componentes funcionales |
| Build | **Vite 8** | Proxy CORS en dev, code-splitting |
| Estilos | **Tailwind CSS v4** | Configuración CSS-first (`@theme` en `src/index.css`), sin `tailwind.config.js` |
| Mapa | **Leaflet 1.9** + **react-leaflet 5** | `react-leaflet` v5 requiere React 19 |
| Clustering | **leaflet.markercluster 1.5** | Integrado con capas Leaflet imperativas |
| Gráficos | **Chart.js 4** + **react-chartjs-2 5** | `chartjs-adapter-date-fns` para ejes temporales |
| Fechas | **date-fns 4** | Locale `es` |
| Iconos | **Lucide React** | Única librería de iconos del proyecto |
| Linter | **oxlint** | Config en `.oxlintrc.json` |
| Fuentes | **Manrope** (body) + **Space Grotesk** (display) | Google Fonts en `index.html` |

**Versiones importantes** (react-leaflet v5 + React 19 + Tailwind v4 + Vite 8 son
combinaciones que NO son las "estándar" que un LLM pueda suponer; verifica siempre
la versión real en `package.json` antes de escribir código de ejemplo).

---

## 3. Puesta en marcha

```bash
npm install        # instala dependencias
npm run dev        # arranca Vite en http://localhost:5173
npm run build      # tsc -b && vite build (typecheck + build de producción)
npm run lint       # oxlint
npm run preview    # sirve el build de producción
```

> El dev server se arrancó como proceso en segundo plano durante el desarrollo
> (log en `dev.log`, ignorado por git). Si quieres reiniciarlo: mata el proceso y vuelve
> a lanzar `npm run dev`.

---

## 4. Estructura del proyecto

```
/
├── AGENTS.md                  # Este archivo
├── PLAN_IMPLEMENTACION.md     # Plan detallado, decisiones y estado de fases
├── README.md                  # README de usuario (puesta en marcha, CORS, endpoints)
├── index.html                 # HTML raíz (fonts, title, meta)
├── vite.config.ts             # Plugin React + Tailwind + PROXY CORS hacia MITECO
├── tsconfig*.json             # TypeScript (project references, ES2023, bundler)
├── .oxlintrc.json             # Config linter (ignora Skills_Section)
├── public/
│   └── favicon.svg            # Icono de surtidor en esmeralda (marca)
├── Skills_Section/            # ⚠️ NO ES PARTE DEL PROYECTO (ver sección 10)
├── dev.log                    # Log del dev server (no commiteado)
└── src/
    ├── main.tsx               # Entry point (createRoot + StrictMode)
    ├── index.css              # Tailwind v4 + @theme tokens + estilos Leaflet/marcadores
    ├── App.tsx                # Componente raíz: estado global y orquestación
    ├── types/index.ts         # Todos los tipos TypeScript del dominio
    ├── utils/
    │   ├── constants.ts       # IDs de producto, centroides de provincias, límites, Z-INDEX
    │   ├── geo.ts             # Haversine, isWithinRadius, nearestProvinceName
    │   └── format.ts          # formatPrice, fechas, URL Google Maps
    ├── services/
    │   ├── api.ts             # fetchJson, retry, pool de concurrencia (mapWithConcurrency)
    │   ├── transformers.ts    # Normaliza JSON del MITECO -> Station
    │   ├── stationsService.ts # Estaciones por provincia/municipio (cache en memoria)
    │   ├── listingsService.ts # Provincias y municipios (cache)
    │   └── historicalService.ts # Snapshots históricos + medias nacionales (cache sessionStorage)
    ├── hooks/
    │   ├── useTheme.ts        # Tema claro/oscuro + persistencia
    │   ├── useGeolocation.ts  # Posición del usuario + fallback
    │   ├── useLocations.ts    # Provincias/municipios + selección
    │   ├── useStations.ts     # Fetch de estaciones por provincia
    │   ├── useNearbyStations.ts # Filtra por radio + ordena por precio
    │   ├── useHistoricalPrices.ts  # Serie temporal de una estación
    │   ├── useNationalAverage.ts    # Serie de medias nacionales
    │   └── useDebounce.ts     # ⚠️ NO UTILIZADO (código muerto, ver sección 9)
    └── components/
        ├── layout/  Header.tsx, Sidebar.tsx, MobileDrawer.tsx
        ├── map/     MapView.tsx, StationCluster.tsx, RadiusCircle.tsx, FlyToCenter.tsx,
        │            stationIcon.ts (factory de divIcon), StationMarker.tsx ⚠️(no usado)
        ├── controls/ RadiusSlider.tsx, FuelTypeSelector.tsx, LocationSelector.tsx
        ├── stations/ StationList.tsx, StationCard.tsx, StationCardSkeleton.tsx
        ├── charts/  ChartPanel.tsx, NationalChart.tsx, HistoricalChart.tsx,
        │            StationHistory.tsx, chartConfig.ts (registro Chart.js)
        └── ui/      ThemeToggle.tsx, Badge.tsx, GlassCard.tsx ⚠️(no usado),
                     LoadingSpinner.tsx ⚠️(no usado)
```

---

## 5. La API del MITECO (datos oficiales)

Base URL (solo en el proxy): la app **nunca** llama directamente al dominio del
Ministerio; siempre usa rutas relativas `/api/...` que Vite reenvía.

| Endpoint | Método | Uso en la app |
|---|---|---|
| `Listados/Provincias/` | GET | Catálogo de 52 provincias |
| `Listados/MunicipiosPorProvincia/{IDProvincia}` | GET | Municipios de una provincia |
| `EstacionesTerrestres/FiltroProvincia/{IDProvincia}` | GET | Todas las estaciones de una provincia con TODOS los precios en una fila |
| `EstacionesTerrestres/FiltroMunicipio/{IDMunicipio}` | GET | Estaciones de un municipio |
| `EstacionesTerrestresHist/FiltroProvincia/{FECHA}/{IDProvincia}` | GET | Snapshot histórico por provincia (`FECHA = DD-MM-YYYY`) |
| `EstacionesTerrestresHist/FiltroProducto/{FECHA}/{IDProducto}` | GET | Snapshot nacional por producto (para medias nacionales) |

**Productos relevantes:** Gasolina 95 E5 = `1`, Gasóleo A habitual = `4`.

### Formato de la respuesta

```json
{
  "Fecha": "15/08/2026 14:02:41",
  "ListaEESSPrecio": [ { "IDEESS": "10943", "C.P.": "28008", ... } ],
  "Nota": "...",
  "ResultadoConsulta": "OK"
}
```

Cada estación (endpoint SIN filtro de producto) usa claves en castellano:
`IDEESS` (id), `C.P.`, `Dirección`, `Horario`, `Latitud`, `Longitud (WGS84)`,
`Municipio`, `IDMunicipio`, `Provincia`, `IDProvincia`, `Rótulo` (marca), y precios en
claves como `Precio Gasolina 95 E5` y `Precio Gasoleo A`.

> **Detalle crítico:** cuando se consulta con filtro por producto
> (`.../FiltroProducto/{date}/{id}` o `.../FiltroMunicipioProducto/...`), el precio llega
> en una sola clave **`PrecioProducto`** (NO en `Precio Gasolina 95 E5`). El transformer
> ya lo maneja (`transformers.ts` prioriza `PrecioProducto`).

**Latitud/longitud y precios usan coma decimal** (`"40,432861"`), y el transformer
los normaliza a punto (`parseFloat` con `replace(',', '.')`).

### CORS: la razón del proxy

La API del Ministerio **NO envía cabeceras `Access-Control-Allow-Origin`**. El
navegador bloquearía cualquier llamada directa desde el frontend. Por eso:

- En **desarrollo**, `vite.config.ts` define `server.proxy`: cualquier petición a
  `/api/*` se reenvía a `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/*`.
- En **producción** (desplegada en un hosting estático) el proxy de Vite NO existe;
  hace falta un proxy propio (Cloudflare Worker, Vercel Function, Express...). Esto
  está documentado en el `README.md` y **es la única pieza pendiente para producción**.

---

## 6. Flujo de datos (cómo encaja todo)

```
1. App.tsx monta:
   - useTheme()         -> tema + toggle
   - useGeolocation()   -> coords del usuario (o Madrid si deniega)
   - useLocations()     -> carga provincias/municipios del MITECO

2. Auto-selección: si no hay provincia elegida y hay geolocalización,
   nearestProvinceName() elige la provincia más cercana (PROVINCE_CENTERS)
   y llama locations.selectProvince(id). → dispara useStations()

3. useStations(provinceId) llama a fetchStationsByProvince()
   (FiltroProvincia/{id}) y cachea en memoria por provincia.
   → stations: Station[]

4. searchCenter = municipio elegido ? (primera estación de ese municipio)
                 : provincia elegida ? PROVINCE_CENTERS[provincia]
                 : geo.coords

5. useNearbyStations(stations, searchCenter, radiusKm, fuelType):
   - Filtra por radio (Haversine) Y exige que la estación tenga precio del
     combustible elegido.
   - Ordena de menor a mayor precio.
   - Devuelve { nearby, sorted, cheapest, mostExpensive, averagePrice, marketRange }.

6. MapView recibe nearby.nearby y los pinta con StationCluster (clusters).
   RadiusCircle pinta el radio. FlyToCenter vuela al cambiar la localidad.

7. Sidebar muestra nearby.sorted (más barata primero). Al hacer clic en una
   tarjeta -> setSelectedStationId -> StationCard se expande y renderiza
   <StationHistory> (que usa useHistoricalPrices -> fetchStationHistory).

8. ChartPanel (panel de gráficos, colapsable):
   - Pestaña "Media nacional": useNationalAverage(chartOpen && tab==='national')
     -> fetchNationalAverages -> EstacionesTerrestresHist/FiltroProducto/{fecha}/{1|4}
   - Pestaña "Estación seleccionada": usa stationHistory del App
     (useHistoricalPrices, también bajo demanda).
```

### Tipos principales (`src/types/index.ts`)

```ts
Station { id, postalCode, address, schedule, lat, lng, municipality,
          municipalityId, province, provinceId, brand,
          priceGasoline95, priceDieselA }              // price* son number | null
FuelType = 'gasoline95' | 'dieselA'
HistoricalStationPoint { date, priceGasoline95, priceDieselA }
NationalAverage { date, avgGasoline95, avgDieselA, stationCount }
Coordinates { lat, lng }
```

---

## 7. Decisiones de rendimiento (IMPORTANTES)

Estas restricciones NO son opinables; son consecuencias medidas de la API real y del
uso del navegador:

1. **Nunca llamar al endpoint nacional completo** (`EstacionesTerrestres/`): pesa
   >5 MB sin comprimir. La app SIEMPRE filtra por provincia.
2. **El gráfico nacional usa muestreo mensual** (13 puntos, cada 4 semanas), NO
   semanal. Motivo: cada snapshot nacional `FiltroProducto/{fecha}/{producto}` pesa
   **~4 MB sin comprimir** (el servidor NO aplica gzip). 52 semanas × 2 productos
   ≈ 420 MB, inviable. Constantes: `NATIONAL_SAMPLES = 13`, `NATIONAL_STEP_WEEKS = 4`.
3. **El histórico por estación usa muestreo semanal** (52 puntos) porque el endpoint
   `EstacionesTerrestresHist/FiltroProvincia/{fecha}/{prov}` pesa **~0,3 MB** y devuelve
   todos los precios de la provincia en una fila por estación.
4. **Cache**:
   - Estaciones por provincia: `Map` en memoria (`stationsService.ts`).
   - Provincias/municipios: cache en memoria (`listingsService.ts`).
   - Series históricas y medias nacionales: `sessionStorage` + `Map` en memoria
     (`historicalService.ts`), clave `gasolineras:<...>`.
5. **Concurrencia acotada**: las peticiones históricas usan
   `mapWithConcurrency` (pool). Límites: 5 para históricos de estación, 3 para
   medias nacionales (que internamente hacen 2 fetch en paralelo). NO saturar el
   servidor del Ministerio.
6. **Code-splitting (React.lazy + Suspense)**: `MapView`, `ChartPanel` y
   `StationHistory` se cargan bajo demanda. Resultado: bundle principal ~225 KB,
   mapa ~189 KB, gráficos ~225 KB (cargados solo si se usan).
7. **Carga bajo demanda de los gráficos**: `useNationalAverage` y
   `useHistoricalPrices` del panel solo se disparan cuando el panel está abierto y
   en la pestaña correspondiente (`chartOpen && chartTab === ...`).

---

## 8. Diseño y sistema visual

El diseño sigue la metodología **Hallmark** (anti-"AI-slop"), consultada en
`Skills_Section/skills/engineering/hallmark-main/`. Principios que aplican:

### Tokens (definidos en `src/index.css` dentro de `@theme`)
- **Paleta**: azul oscuro + verde esmeralda.
  - `canvas` (fondo) = `#f4f6fa` claro / `#0b1220` oscuro.
  - `surface` = blanco / slate-900.
  - `accent` (verde) = `#059669`; `accent-strong` = `#047857`.
  - `danger` = `#dc2626`, `warning` = `#d97706`, `info` = `#2563eb`.
  - `ink` = texto principal, `ink-soft`, `ink-faint`; `line`, `line-strong`.
- **Fuentes**: `--font-sans` (Manrope) para body, `--font-display` (Space Grotesk)
  para títulos/etiquetas. Emparejadas, nunca una sola fuente.
- **Sombras**: `shadow-soft`, `shadow-lift`, `shadow-tight`.
- **Animaciones**: `shimmer`, `fade-up`, `fade-in`, `spin-slow`.
- **Z-index**: escala de 5 niveles (`--z-base` … `--z-toast`).

### Anti-patrones PROHIBIDOS (regla del proyecto)
- ❌ Gradients púrpura/rosa en héroes o titulares.
- ❌ Una sola fuente (tipo Inter) para todo.
- ❌ Grids de 3 columnas simétricos con icono-arriba.
- ❌ Cards anidadas sin razón semántica.
- ❌ Eyebrows decorativos (`01 /`, `02 /`) en secciones.
- ❌ `transition-all` genérico o `hover:scale-105` en todo.
- ❌ Glassmorphism decorativo: SOLO se usa donde comunica profundidad (overlays
  sobre el mapa: `RadiusSlider`, `ChartPanel`).
- ❌ Emojis como iconos: solo **Lucide React**.
- ❌ Italic en headings (siempre roman; énfasis con peso/color).
- ❌ `z-index: 9999` (usar la escala definida).
- ❌ Números sin `tabular-nums` en columnas de precios (utilidad `price-nums`).
- ❌ Textos clicables que salten a dos líneas; scroll horizontal (`overflow-x: clip`).

### Marcadores de estación (`stationIcon.ts` + CSS)
Cada marcador es un `L.divIcon` con forma circular, borde del color según el precio
relativo y el precio dentro. El color se calcula con el `marketRange` actual
(tercil inferior verde / medio ámbar / superior rojo).

---

## 9. Estado: COMPLETADO, pendientes y código muerto

### ✅ Completado y verificado
- Build (`tsc -b && vite build`) OK. Lint (oxlint) limpio.
- Proxy de Vite verificado contra los 3 endpoints críticos (provincias, estaciones
  por provincia, snapshot histórico por provincia).
- Code-splitting, cache, dark mode, responsive, clustering: implementados.

### ⚠️ Código muerto (NO usado, candidato a eliminar o integrar)
| Archivo | Estado | Sugerencia |
|---|---|---|
| `src/hooks/useDebounce.ts` | Definido pero nunca importado | El `RadiusSlider` cambia el estado directamente; si se quiere debounce, usarlo en `App` sobre `radiusKm`. |
| `src/components/map/StationMarker.tsx` | No usado (el renderizado usa `StationCluster` con `L.marker` directo) | Eliminar o reutilizar en popups. |
| `src/components/ui/GlassCard.tsx` | No usado | El glassmorphism se aplica con la utilidad `glass` en CSS. Eliminar. |
| `src/components/ui/LoadingSpinner.tsx` | No usado | Los estados de carga usan skeletons. Eliminar. |
| `src/utils/format.ts` → `formatDateShort`, `formatDateChart`, `toLocaleNumber` | Pueden no usarse | Verificar antes de eliminar. |

> Si un LLM las borra, que confirme con `grep` que no se importan en ningún sitio.

### 🔧 Pendiente para producción (fuera del alcance actual)
1. **Proxy de producción**: la API del MITECO no envía CORS. Necesario un proxy
   propio (Cloudflare Worker / Vercel Function / Express) que replique
   `vite.config.ts` (`/api/*` → `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/*`).
   Documentado en `README.md`.
2. **Optimizaciones opcionales**:
   - Mostrar el *punto del usuario* (marcador azul propio) sobre el mapa.
   - Paginación/virtualización de la lista cuando el radio es muy amplio
     (hoy ya se limita el radio a 50 km y se exige precio).
   - Tests (no hay framework de tests configurado: ni Vitest ni Testing Library).
   - `npm audit` ya reporta 0 vulnerabilidades en las dependencias instaladas.

### 🧹 Limpieza general
- `Skills_Section/` es un repositorio de *skills de referencia* (Matt Pocock) que se
  coló dentro de la carpeta del proyecto. **NO es código de la app**. Ya está excluido
  del lint (`.oxlintrc.json` → `ignorePatterns`). No moverlo sin permiso.
- `dev.log` es el log del dev server; no se commitea (cubierto por `*.log` en
  `.gitignore`).
- El proyecto **no tiene repo git inicializado** (`git init` no se ha ejecutado).

---

## 10. Skills_Section (referencia de diseño — no confundir con la app)

`Skills_Section/` contiene el repositorio de habilidades de **Matt Pocock** y el
sistema de diseño **Hallmark** (`skills/engineering/hallmark-main/`). Se usa como
referencia para directrices de diseño web y buenas prácticas. No forma parte del
bundle ni del lint. La skill relevante para diseño es
`Skills_Section/skills/engineering/hallmark-main/skills/hallmark/SKILL.md` y su
`references/anti-patterns.md`.

---

## 11. Comandos de verificación obligatorios

**Antes de dar una tarea por terminada, ejecuta siempre:**

```bash
npm run build     # typecheck + build. DEBE pasar sin errores de TS.
npm run lint      # oxlint. DEBE quedar limpio (0 warnings/errors).
```

Regla de oro: si tocas código, al final **build + lint limpios** o no está terminado.
