# 📔 Bitácora de Aprendizaje — 🌱 Semana 01: Arquitectura de Kubernetes y Pods

> ⛵ **Tripulante:** [`@devdavco`](https://github.com/devdavco)  
> 🗓️ **Fecha de registro:** `2026-11-20`  
> 🎓 **Portafolio Principal:** [⬅️ Volver a mi Portafolio Profesional K8s](../README.md)

---

## 1️⃣ 💡 ¿Qué aprendí esta semana?

Ojo crítico al ver los errores, en el primer ejercicio, revisando la version de la imagen y tambien el puerto donde iba ser desplegada.

---

## 2️⃣ 🧩 ¿Qué fue lo más retador y cómo lo resolví?

En el reto-roto 2.  cambiando echho por echo, interesante el error, pero mas interesante aprender que los pods son ciertamente "inmutables", solo se pueden cambiar campos como la imagen y, los commands no pueden modificar con apply. Para ello hay que eliminar el pod  y volver hacerle apply

---

## 3️⃣ 💻 Comandos y herramientas que practiqué

```bash
k get pods -o wide
k delete pod
k apply
```

---

## 4️⃣ 🚀 Aplicación real y próximos pasos

Seguir practicando en los laboratorios del workshop y aplicando buenas prácticas Cloud Native.

---

<div align="center">
  <sub>🏔️☕ Bitácora registrada en <b><a href="https://github.com/edwinbermudez91/Fundamentos-Kubernetes">De Cero a Capitán en Kubernetes — Cloud Native Medellín (CNCF)</a></b></sub>
</div>
