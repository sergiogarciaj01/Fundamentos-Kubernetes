# 📔 Bitácora de Aprendizaje — 🌱 Semana 01: Arquitectura de Kubernetes y Pods

> ⛵ **Tripulante:** [`@juanjosegonzalezrosales`](https://github.com/juanjosegonzalezrosales)  
> 🗓️ **Fecha de registro:** `2026-11-16`  
> 🎓 **Portafolio Principal:** [⬅️ Volver a mi Portafolio Profesional K8s](../README.md)

---

## 1️⃣ 💡 ¿Qué aprendí esta semana?

• Aprendí sobre la arquitectura de Kubernetes y cómo interactúan sus componentes al desplegar un Pod con uno o múltiples contenedores a partir de un manifiesto YAML.
• Aprendí a monitorear y garantizar el estado de salud de un Pod mediante readinessProbe, livenessProbe y métricas de observabilidad.

---

## 2️⃣ 🧩 ¿Qué fue lo más retador y cómo lo resolví?

Diagnostiqué y resolví un Pod atascado en estado Pending inspeccionando sus eventos con kubectl describe pod, ajustando posteriormente resources.requests para adecuarlo a la capacidad disponible del nodo.

---

## 3️⃣ 💻 Comandos y herramientas que practiqué

```bash
k get pods -owide
k describe pod 
kubectl logs -f
```

---

## 4️⃣ 🚀 Aplicación real y próximos pasos

Este mismo enfoque de diagnóstico lo puedo aplicar directamente en mi trabajo para monitorear la salud y capacidad de los nodos, identificar saturación de recursos a tiempo y encontrar la causa raíz de los problemas que se presenten en el clúster.

---

<div align="center">
  <sub>🏔️☕ Bitácora registrada en <b><a href="https://github.com/edwinbermudez91/Fundamentos-Kubernetes">De Cero a Capitán en Kubernetes — Cloud Native Medellín (CNCF)</a></b></sub>
</div>
