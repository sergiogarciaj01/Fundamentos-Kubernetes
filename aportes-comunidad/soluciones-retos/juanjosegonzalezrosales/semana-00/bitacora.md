# 📔 Bitácora de Aprendizaje — 🐳 Semana 00: Fundamentos de Docker (De Código a Contenedor)

> ⛵ **Tripulante:** [`@juanjosegonzalezrosales`](https://github.com/juanjosegonzalezrosales)  
> 🗓️ **Fecha de registro:** `2026-11-16`  
> 🎓 **Portafolio Principal:** [⬅️ Volver a mi Portafolio Profesional K8s](../README.md)

---

## 1️⃣ 💡 ¿Qué aprendí esta semana?

Aprendí a crear un conjunto de contenedores conectados mediante una red personalizada, manteniendo la persistencia de datos a través de volúmenes y, sobre todo, de forma reproducible a partir de un archivo docker-compose.yml.

---

## 2️⃣ 🧩 ¿Qué fue lo más retador y cómo lo resolví?

Un fallo importante de seguridad que identifiqué fue la ausencia del archivo .dockerignore y la falta de especificación en el Dockerfile sobre qué archivos exactos copiar al contenedor, lo cual es clave para evitar que se filtren archivos sensibles o credenciales dentro de la imagen.

---

## 3️⃣ 💻 Comandos y herramientas que practiqué

```bash
docker container ls
docker image ls
docker rm
docker rmi
docker build -t tag_img .
docker run -d -p host_port:container_port 
docker compose up -d --build
docker compose down
```

---

## 4️⃣ 🚀 Aplicación real y próximos pasos

lo puedo aplicar para realizar pruebas de aplicaciones o para aumentar la cantidad de servicios que presta un servidor.

---

<div align="center">
  <sub>🏔️☕ Bitácora registrada en <b><a href="https://github.com/edwinbermudez91/Fundamentos-Kubernetes">De Cero a Capitán en Kubernetes — Cloud Native Medellín (CNCF)</a></b></sub>
</div>
