# 💥 Retos Rotos de la Semana 04: Configuración y Almacenamiento Persistente

¡Bienvenido al laboratorio de diagnóstico de configuración y almacenamiento de la **Semana 04**! Aquí repararás los **5 fallos más comunes** con `ConfigMaps`, `Secrets`, `Volumes` y `PV/PVC`.

Cada reto resuelto te otorga **+10 XP** (hasta **+50 XP** en total) para subir de rango en [`ASISTENTES.md`](../../ASISTENTES.md).

---

## 📑 Índice de Retos Rotos de la Semana 04

| # | Archivo del Reto | Nivel | Error / Síntoma Principal | En ☕ KubeCafé |
| :-: | :--- | :---: | :--- | :--- |
| **01** | [`01-configmap-clave-inexistente.yaml`](./01-configmap-clave-inexistente.yaml) | 🟢 Principiante | `CreateContainerConfigError`: clave inexistente en `configMapKeyRef` | El barista busca un ingrediente que no está en la despensa. |
| **02** | [`02-secret-base64-roto.yaml`](./02-secret-base64-roto.yaml) | 🟡 Intermedio | `CreateContainerConfigError`: `secretKeyRef` apunta a un Secret y clave inexistentes | La caja pide la llave de una bóveda que no existe. |
| **03** | [`03-pvc-pendiente-storageclass.yaml`](./03-pvc-pendiente-storageclass.yaml) | 🟡 Intermedio | `PVC` atascado en `Pending` por `storageClassName` y tamaño incompatible | Piden 50 bodegas VIP cuando solo hay 1 bodega manual de 1Gi. |
| **04** | [`04-volumen-mountpath-roto.yaml`](./04-volumen-mountpath-roto.yaml) | 🟢 Principiante | Rechazo del API Server: `volumeMounts.name` no coincide con `volumes.name` | Conectan la manguera a una tubería con nombre equivocado. |
| **05** | [`05-configmap-volumen-roto.yaml`](./05-configmap-volumen-roto.yaml) | 🟡 Intermedio | `ContainerCreating` infinito: `items[].key` del volumen no existe en el `ConfigMap` | Intentan colgar un cartel que nadie escribió en el tablero. |

---

## 🎯 Instrucciones para Resolver y Entregar

1. **Reproduce e investiga cada fallo en tu clúster:**
   ```bash
   kubectl apply -f semana-04-configuracion-almacenamiento/2.reto-roto/01-configmap-clave-inexistente.yaml
   ```
2. **Usa tus herramientas de diagnóstico:**
   - `kubectl get pods,cm,secrets,pv,pvc`
   - `kubectl describe pod <nombre-pod>` (revisa `Events` para ver `CreateContainerConfigError`)
   - `kubectl describe pvc <nombre-pvc>` (revisa por qué queda en `Pending`)
3. **Copia los 4 archivos a tu carpeta personal:**
   ```bash
   mkdir -p aportes-comunidad/soluciones-retos/<tu-usuario-github>/semana-04
   cp semana-04-configuracion-almacenamiento/2.reto-roto/*.yaml aportes-comunidad/soluciones-retos/<tu-usuario-github>/semana-04/
   ```
4. **Corrige los archivos dentro de tu carpeta:**
   - Mantén los mismos nombres de archivo (`01-...`, `02-...`, `03-...`, `04-...`).
   - Agrega comentarios `#` explicando cuál era el error y cómo lo solucionaste.
5. **Envía tu Pull Request:**
   Sigue los pasos del [Manual de la Comunidad](../../aportes-comunidad/README.md). ¡El bot evaluará tus archivos y te sumará tus puntos automáticamente!
