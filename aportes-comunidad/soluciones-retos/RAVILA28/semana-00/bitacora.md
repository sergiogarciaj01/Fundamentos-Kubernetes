# 📔 Bitácora de Aprendizaje — 🐳 Semana 00: Fundamentos de Docker (De Código a Contenedor)

> ⛵ **Tripulante:** [`@RAVILA28`](https://github.com/RAVILA28)  
> 🗓️ **Fecha de registro:** `2026-11-16`  
> 🎓 **Portafolio Principal:** [⬅️ Volver a mi Portafolio Profesional K8s](../README.md)

---

## 1️⃣ 💡 ¿Qué aprendí esta semana?

- Recorde los temas de docker
- Aprendi Harbor para guardar las imagenes de forma privada y evitar dockerhub

---

## 2️⃣ 🧩 ¿Qué fue lo más retador y cómo lo resolví?

- Diagnóstico y resolución de manifiestos en el laboratorio.

---

## 3️⃣ 💻 Comandos y herramientas que practiqué

```bash
# Formato general:
docker login <host-del-registro> -u <usuario> -p <contraseña>

# Ejemplo con Harbor:
docker login harbor.cloudnative.local:8080 -u "admin" -p "Harbor12345"

# O usando el token de una Cuenta Robot (Buena práctica de seguridad):
docker login harbor.cloudnative.local:8080 -u "robot$ci-deployer" -p "tu-token-secreto"
```

---

## 4️⃣ 🚀 Aplicación real y próximos pasos

Investigare mas Harbor y asi eviatr el tema de imagenes publicas

---

<div align="center">
  <sub>🏔️☕ Bitácora registrada en <b><a href="https://github.com/edwinbermudez91/Fundamentos-Kubernetes">De Cero a Capitán en Kubernetes — Cloud Native Medellín (CNCF)</a></b></sub>
</div>
