# 🏆 Soluciones de Retos y Portafolios de la Comunidad

<div align="center">

[![Llenar Bitácora (+10 XP)](https://img.shields.io/badge/📔_Llenar_Bitácora_y_Generar_Portafolio_(+10_XP)-8B5CF6?style=for-the-badge&logo=github)](https://github.com/edwinbermudez91/Fundamentos-Kubernetes/issues/new?template=bitacora-semanal.yml)
[![Ver Ranking y Portafolios](https://img.shields.io/badge/🏆_Ranking_y_Portafolios_(ASISTENTES.md)-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](../../ASISTENTES.md)
[![Catálogo de Insignias SVG](https://img.shields.io/badge/🎖️_Insignias_KubeCafé-00C7B7?style=for-the-badge&logo=cncf&logoColor=white)](../../recursos/portafolio-y-badges.md)

</div>

¡Bienvenido al espacio donde los asistentes del workshop comparten sus soluciones a los **Retos Rotos** de cada semana, desbloquean su **Portafolio Profesional KubeCafé** con **insignias hexagonales verificadas** y suman experiencia (**+XP**) en [`ASISTENTES.md`](../../ASISTENTES.md)!

👉 **¿Estás dando tus primeros pasos entregando un reto?** Lee el [**🧭 Manual Paso a Paso para la Comunidad (`aportes-comunidad/README.md`)**](../README.md).

---

## 📂 Estructura Oficial de Carpetas

Para que el robot calificador reconozca tus ejercicios automáticamente y te asigne tus puntos (**+10 XP por cada reto resuelto** + **+10 XP Bonus por bitácora semanal**), organiza tu entrega respetando tu usuario de GitHub y los nombres originales de cada reto:

```text
aportes-comunidad/soluciones-retos/
└── <tu-usuario-github>/
    ├── README.md   <-- 🎓 (Generado automáticamente por el bot: ¡Tu Portafolio con Banner e Insignias SVG!)
    ├── semana-00/
    │   ├── bitacora.md   <-- 📔 (+10 XP Bonus: vía Formulario Visual o plantilla)
    │   ├── 01-dockerfile-roto/
    │   │   └── Dockerfile
    │   ├── 02-variable-entorno-faltante/
    │   │   └── Dockerfile
    │   ├── 03-contenedor-como-root/
    │   │   └── Dockerfile
    │   ├── 04-dockerignore-y-archivos-secretos/
    │   │   ├── .dockerignore
    │   │   └── Dockerfile
    │   └── 05-puerto-y-host-desalineado/
    │       ├── Dockerfile
    │       └── app.py
    ├── semana-01/
    │   ├── bitacora.md
    │   ├── 01-pod-con-errores.yaml
    │   ├── 02-pod-crashloop.yaml
    │   ├── 03-pod-pendiente-infinito.yaml
    │   └── 04-pod-yaml-molesto.yaml
    ├── semana-02/
    │   ├── bitacora.md
    │   ├── 01-deployment-selector-roto.yaml
    │   ├── 02-deployment-imagen-caida-rollback.yaml
    │   ├── 03-deployment-estrategia-invalida.yaml
    │   └── 04-deployment-yaml-identacion.yaml
    └── semana-03/
        ├── bitacora.md
        ├── 01-service-selector-roto.yaml
        ├── 02-service-targetport-incorrecto.yaml
        ├── 03-nodeport-fuera-de-rango.yaml
        └── 04-httproute-parentref-roto.yaml
```

---

## 📔 Registra tu Bitácora Semanal y Obtén tu Portafolio + Insignias (+10 XP)

Además de resolver los archivos técnicos, puedes documentar qué aprendiste cada semana de **dos formas súper fáciles**:

1. **🚀 Opción 1 — Formulario Visual en 1 minuto (Recomendado, sin usar Git):**  
   👉 [**Haz clic aquí para abrir el Formulario de Bitácora Semanal**](https://github.com/edwinbermudez91/Fundamentos-Kubernetes/issues/new?template=bitacora-semanal.yml).  
   El bot creará tu archivo `bitacora.md`, sumará **+10 XP**, generará tu **Portafolio Profesional (`README.md`)** con banner SVG, insignias hexagonales (**Bronce / Plata / Oro** y módulos), activará tu enlace directo `🎓 Portafolio` en el **README principal** (y competirás por el **Podio Top 5**), y te dará texto listo para publicar en **LinkedIn** etiquetando a `@Cloud Native Colombia (Armenia, Bogota, Cali, Medellin)`, WhatsApp y Telegram.
2. **🛠️ Opción 2 — Desde tu terminal junto con tu Pull Request:**  
   Copia la [**`PLANTILLA-BITACORA.md`**](./PLANTILLA-BITACORA.md) dentro de tu carpeta semanal como `bitacora.md` y llénala en VS Code.

---

## ⚡ Resumen Rápido en 4 Comandos (Para copiar y pegar)

Reemplaza `TU-USUARIO` por tu usuario de GitHub y `semana-01` por la semana que estés trabajando:

```bash
# 1. Crea tu rama de la semana
git checkout -b TU-USUARIO/semana-01

# 2. Crea tu carpeta personal y copia los retos de la semana (sin tocar los originales)
mkdir -p aportes-comunidad/soluciones-retos/TU-USUARIO/semana-01
cp semana-01-arquitectura/2.reto-roto/*.yaml aportes-comunidad/soluciones-retos/TU-USUARIO/semana-01/

# 3. (Después de investigar, corregir y probar tus archivos en tu carpeta) Guarda tus cambios
git add aportes-comunidad/soluciones-retos/TU-USUARIO/
git commit -m "Solución retos semana 01 - TU-USUARIO"

# 4. Sube tu rama a GitHub y abre el Pull Request en el navegador
git push origin TU-USUARIO/semana-01
```

---

## ✅ Checklist Antes de Enviar tu Pull Request

1. [ ] **No modificaste los archivos originales** dentro de `semana-XX-.../2.reto-roto/` (verifícalo con `git status`).
2. [ ] **Probaste tus soluciones** en tu laboratorio local (`docker run` o `kubectl apply -f ...`) y verificaste que pasen a estado saludable (`Up` o `Running`).
3. [ ] **Agregaste comentarios (`#`)** dentro de tus archivos explicando:
   * ¿Cuál era el fallo original?
   * ¿Con qué comando lo descubriste (`kubectl describe`, `kubectl logs`, `docker logs`, etc.)?
   * ¿Qué ajuste aplicaste para solucionarlo?

---

## 📚 Enlaces a la Documentación Oficial para Resolver Retos

Apóyate siempre en las fuentes oficiales para investigar las causas de error y validar la sintaxis de tus soluciones:

* 🐳 **Docker:**
  * [Referencia Oficial de Dockerfile](https://docs.docker.com/reference/dockerfile/)
  * [Comandos y Opciones de Docker CLI](https://docs.docker.com/reference/cli/docker/)
  * [Mejores Prácticas de Seguridad y Dockerfile](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
* ☸️ **Kubernetes:**
  * [Cheat Sheet Oficial de kubectl](https://kubernetes.io/es/docs/reference/kubectl/cheatsheet/)
  * [Guía Oficial de Depuración y Diagnóstico de Pods](https://kubernetes.io/es/docs/tasks/debug/debug-application/debug-pods/)
  * [Especificación Oficial de Pods](https://kubernetes.io/es/docs/concepts/workloads/pods/)
  * [Guía Oficial de Deployments, Réplicas y Rollouts](https://kubernetes.io/es/docs/concepts/workloads/controllers/deployment/)
  * [Services en Kubernetes (`ClusterIP`, `NodePort`, `LoadBalancer`)](https://kubernetes.io/es/docs/concepts/services-networking/service/)
  * [EndpointSlices y Descubrimiento DNS (`CoreDNS`)](https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/)
  * [Kubernetes Gateway API (`Gateway` y `HTTPRoute`)](https://gateway-api.sigs.k8s.io/)
  * [Cilium Gateway API & LoadBalancer IPAM](https://docs.cilium.io/en/stable/network/servicemesh/gateway-api/gateway-api/)
