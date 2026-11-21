# 📔 Bitácora de Aprendizaje — 🐳 Semana 00: Fundamentos de Docker (De Código a Contenedor)

> ⛵ **Tripulante:** [`@Arlex0296`](https://github.com/Arlex0296)  
> 🗓️ **Fecha de registro:** `2026-11-19`  
> 🎓 **Portafolio Principal:** [⬅️ Volver a mi Portafolio Profesional K8s](../README.md)

---

## 1️⃣ 💡 ¿Qué aprendí esta semana?

En esta semana aprendí a crear Dockerfiles, construir imágenes y levantar contenedores. Resolví errores comunes: contenedores que se apagan por no correr en primer plano, variables de entorno faltantes, apps corriendo como root, secretos filtrados en la imagen (solucionado con .dockerignore) y problemas de red por usar 127.0.0.1 en lugar de 0.0.0.0. También aprendí a diagnosticar fallas con docker ps -a y docker logs, y a aplicar buenas prácticas de seguridad.

---

## 2️⃣ 🧩 ¿Qué fue lo más retador y cómo lo resolví?

Lo más difícil fue identificar qué le faltaba a cada Dockerfile, porque en varios casos la imagen se construía sin errores y el contenedor parecía funcionar. Aprendí a investigar con docker ps -a y docker logs para encontrar la causa real del problema.

---

## 3️⃣ 💻 Comandos y herramientas que practiqué

```bash
docker logs 
docker ps -a
```

---

## 4️⃣ 🚀 Aplicación real y próximos pasos

Estos conocimientos los estoy aplicando en mi trabajo, en automatizaciones, aplicaciones y proyectos de desarrollo, donde uso Docker para empaquetar y desplegar servicios de forma más segura y consistente, aplicando buenas prácticas como usuarios sin privilegios, .dockerignore y manejo de variables de entorno.

---

<div align="center">
  <sub>🏔️☕ Bitácora registrada en <b><a href="https://github.com/edwinbermudez91/Fundamentos-Kubernetes">De Cero a Capitán en Kubernetes — Cloud Native Medellín (CNCF)</a></b></sub>
</div>
