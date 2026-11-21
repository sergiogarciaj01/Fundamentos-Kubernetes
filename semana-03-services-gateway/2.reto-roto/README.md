# 💥 Retos Rotos de la Semana 03: Redes, Services y Gateway API

¡Bienvenido al laboratorio de investigación de incidentes de red de la **Semana 03**! Aquí aprenderás a diagnosticar y reparar los **4 fallos de conectividad más comunes** en Kubernetes.

Cada reto resuelto te otorga **+10 XP** (hasta **+40 XP** en total) para subir de rango en [`ASISTENTES.md`](../../ASISTENTES.md).

---

## 📑 Índice de Retos Rotos de la Semana 03

| # | Archivo del Reto | Nivel | Error / Síntoma Principal | En ☕ KubeCafé |
| :-: | :--- | :---: | :--- | :--- |
| **01** | [`01-service-selector-roto.yaml`](./01-service-selector-roto.yaml) | 🟢 Principiante | `Endpoints: <none>` porque el selector del Service no coincide con los Pods | El mesero busca en la mesa equivocada y no encuentra baristas. |
| **02** | [`02-service-targetport-incorrecto.yaml`](./02-service-targetport-incorrecto.yaml) | 🟡 Intermedio | `Connection refused`: el `targetPort` no coincide con el `containerPort` | El mesero toca la puerta trasera (`9090`) en vez de la barra (`80`). |
| **03** | [`03-nodeport-fuera-de-rango.yaml`](./03-nodeport-fuera-de-rango.yaml) | 🟡 Intermedio | Error del API Server al crear `NodePort` fuera de `30000-32767` | Quieren abrir una ventanilla en una dirección que no existe. |
| **04** | [`04-httproute-parentref-roto.yaml`](./04-httproute-parentref-roto.yaml) | 🔴 Ninja | `HTTPRoute` apunta a un `Gateway` inexistente y puerto erróneo | La recepcionista envía clientes a una puerta fantasma. |

---

## 🎯 Instrucciones para Resolver y Entregar

1. **Reproduce e investiga el error en tu clúster:**
   ```bash
   kubectl apply -f semana-03-services-gateway/2.reto-roto/01-service-selector-roto.yaml
   ```
2. **Usa tus herramientas de diagnóstico de red:**
   - `kubectl get svc,endpoints` (¿Tiene IPs en `ENDPOINTS` o dice `<none>`?)
   - `kubectl get endpointslices -l kubernetes.io/service-name=<nombre-svc>` (Inspección moderna de los destinos del Service)
   - `kubectl describe svc <nombre>` (Revisa `Selector`, `Port` y `TargetPort`)
   - `kubectl get pods --show-labels` (Compara las etiquetas reales de los Pods)
   - `kubectl describe httproute <nombre>` (Revisa condiciones `Accepted` y `ResolvedRefs`)
3. **Copia los 4 archivos a tu carpeta personal:**
   ```bash
   mkdir -p aportes-comunidad/soluciones-retos/<tu-usuario-github>/semana-03
   cp semana-03-services-gateway/2.reto-roto/*.yaml aportes-comunidad/soluciones-retos/<tu-usuario-github>/semana-03/
   ```
4. **Corrige los archivos dentro de tu carpeta:**
   - Mantén los mismos nombres de archivo (`01-service-selector-roto.yaml`, `02-...`, `03-...`, `04-...`).
   - Agrega comentarios `#` explicando cuál era el error y cómo lo solucionaste.
5. **Envía tu Pull Request:**
   Sigue los pasos del [Manual de la Comunidad](../../aportes-comunidad/README.md). ¡El bot evaluará tus archivos y te sumará tus puntos automáticamente!
