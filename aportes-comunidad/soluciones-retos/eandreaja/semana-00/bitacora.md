# 📔 Bitácora de Aprendizaje — 🐳 Semana 00: Fundamentos de Docker (De Código a Contenedor)

> ⛵ **Tripulante:** [`@eandreaja`](https://github.com/eandreaja)  
> 🗓️ **Fecha de registro:** `2026-11-16`  
> 🎓 **Portafolio Principal:** [⬅️ Volver a mi Portafolio Profesional K8s](../README.md)

---

## 1️⃣ 💡 ¿Qué aprendí esta semana?

Llegué sin ningún conocimiento de Docker ni de Kubernetes, pero sabía que eran una pieza clave para trabajar con Python. Después de los laboratorios, los retos y las clases entendí que no son opcionales: son una forma de "blindar" mi trabajo y la información del cliente (por ejemplo, ejecutando como usuario no-root y dejando los secretos fuera de la imagen), y, con Kubernetes, de asegurar que lo que construyo esté disponible cuando alguien lo necesite.

---

## 2️⃣ 🧩 ¿Qué fue lo más retador y cómo lo resolví?

El reto 05 fue el que más me costó. En `docker run -d -p 8080:8080` yo escribía siempre el `:8080` sin entender qué era cada número. Lo comprendí cuando el contenedor estaba `Up` pero `curl` fallaba: el número de la izquierda es el puerto de mi máquina, y el de la derecha tiene que coincidir con el puerto donde la aplicación escucha dentro del contenedor (además, la app debía escuchar en `0.0.0.0` y no en `127.0.0.1`). En el reto 02 pasé la variable con `-e` en vez de dejarla con `ENV` en el Dockerfile, porque lo que va en `ENV` queda guardado en la imagen y se puede leer con `docker image inspect`.

---

## 3️⃣ 💻 Comandos y herramientas que practiqué

```bash
docker build -t <imagen> .
docker run -d -p 8080:8080 -e VARIABLE=valor --name <nombre> <imagen>
docker ps
docker logs <contenedor>
docker image inspect <imagen>
docker history <imagen>
curl http://localhost:8080
```

---

## 4️⃣ 🚀 Aplicación real y próximos pasos

Quiero aplicar lo aprendido a mis proyectos de Python que ya tengo hechos: empaquetarlos en contenedores para que corran igual en cualquier equipo.

---

<div align="center">
  <sub>🏔️☕ Bitácora registrada en <b><a href="https://github.com/edwinbermudez91/Fundamentos-Kubernetes">De Cero a Capitán en Kubernetes — Cloud Native Medellín (CNCF)</a></b></sub>
</div>
