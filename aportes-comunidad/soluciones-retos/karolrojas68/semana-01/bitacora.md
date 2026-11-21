# 📔 Bitácora de Aprendizaje — 🌱 Semana 01: Arquitectura de Kubernetes y Pods

> ⛵ **Tripulante:** [`@karolrojas68`](https://github.com/karolrojas68)  
> 🗓️ **Fecha de registro:** `2026-11-17`  
> 🎓 **Portafolio Principal:** [⬅️ Volver a mi Portafolio Profesional K8s](../README.md)

---

## 1️⃣ 💡 ¿Qué aprendí esta semana?

Aprendí a diagnosticar y solucionar los 4 retos rotos de arquitectura de Pods en Kubernetes. Comprendí el uso de logs y describe para solucionar problemas de imágenes, comandos de contenedor, requests de recursos y sintaxis YAML.

---

## 2️⃣ 🧩 ¿Qué fue lo más retador y cómo lo resolví?

El reto más interesante fue el de recursos (reto-03), donde un Pod se quedaba en estado Pending por solicitar 500Gi de memoria y 64 CPUs. Aprendí a inspeccionar los eventos con `kubectl describe pod` para identificar la falta de recursos en el nodo y corregir las solicitudes a valores realistas.

---

## 3️⃣ 💻 Comandos y herramientas que practiqué

```bash
kubectl apply -f 
kubectl get pods
kubectl describe pod reto-03-exigente
kubectl logs reto-02-crash

<img width="212" height="76" alt="image" src="https://github.com/user-attachments/assets/b611b050-3b6e-4a51-bfb5-44ba9cb39b80" />

<img width="221" height="142" alt="image" src="https://github.com/user-attachments/assets/500681dd-505c-482d-94e5-ec24223f9f6f" />

<img width="328" height="107" alt="image" src="https://github.com/user-attachments/assets/17200cf7-b9af-4596-836e-d7a5b96914d4" />
```

---

## 4️⃣ 🚀 Aplicación real y próximos pasos

Aplicaré este conocimiento para estructurar manifiestos YAML limpios y bien configurados, además de optimizar la asignación de recursos en microservicios para evitar cuellos de botella en despliegues.

---

<div align="center">
  <sub>🏔️☕ Bitácora registrada en <b><a href="https://github.com/edwinbermudez91/Fundamentos-Kubernetes">De Cero a Capitán en Kubernetes — Cloud Native Medellín (CNCF)</a></b></sub>
</div>
