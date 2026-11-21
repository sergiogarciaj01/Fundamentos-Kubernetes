# 🎯 Reto 4: La fuga de secretos y contexto pesado por falta de `.dockerignore`

* **Dificultad:** 🟢 Principiante / 🟡 Intermedio
* **Archivos:** [`Dockerfile`](./Dockerfile) y [`.env`](./.env)

---

## 🔍 El Escenario

Un desarrollador del equipo usó `COPY . .` en el `Dockerfile` pero olvidó crear el archivo `.dockerignore`. En su máquina local tenía un archivo `.env` con credenciales de base de datos y llaves de acceso de prueba.

Al publicar la imagen a un registro público de contenedores, ¡cualquiera con acceso a la imagen puede inspeccionar sus capas y robar las contraseñas!

### 💥 Síntoma

1. Construye la imagen actual:
   ```bash
   docker build -t reto-leak:v1.0 semana-00-fundamentos-docker/2.reto-roto/04-dockerignore-y-archivos-secretos
   ```
2. Inspecciona el interior del contenedor:
   ```bash
   docker run --rm reto-leak:v1.0 cat .env
   ```
   *Salida:* ¡Podrás ver todas las contraseñas en texto plano! 😱

---

## 🎯 Tu Misión

1. Crea el archivo `.dockerignore` en `semana-00-fundamentos-docker/2.reto-roto/04-dockerignore-y-archivos-secretos/` para excluir:
   * `.env`
   * `*.log`
   * `*.tmp`
   * `.git/`
   * `README.md`
2. Modifica el [`Dockerfile`](./Dockerfile) para copiar de manera explícita solo el archivo `app.py` asignando la propiedad con `--chown=appuser:appgroup`.
3. Vuelve a construir la imagen:
   ```bash
   docker build -t reto-leak:v1.0 semana-00-fundamentos-docker/2.reto-roto/04-dockerignore-y-archivos-secretos
   ```
4. Comprueba que el archivo ya no exista dentro de la imagen:
   ```bash
   docker run --rm reto-leak:v1.0 ls -la
   ```
   Y al probar `docker run --rm reto-leak:v1.0 cat .env`, Docker debe responder:
   `cat: can't open '.env': No such file or directory` ✅


# Reto 4: Dockerignore y protección de archivos secretos

## 🎯 Objetivo

Aprender a proteger información sensible durante la construcción de imágenes Docker utilizando `.dockerignore` y buenas prácticas en las instrucciones `COPY` del Dockerfile.

## 🧩 Descripción del problema

El Dockerfile original utilizaba la siguiente instrucción:

```dockerfile
COPY . .
```

Esta instrucción copia todo el contenido del contexto de construcción hacia la imagen Docker, incluyendo archivos que no son necesarios para ejecutar la aplicación.

Entre estos archivos se encontraba `.env`, que contenía información sensible como credenciales de bases de datos, claves de acceso y secretos de aplicación.

Esto representa un riesgo de seguridad, especialmente si la imagen se publica en un registry público o es compartida con otros usuarios.

## 🔎 Diagnóstico

Para reproducir la vulnerabilidad, construimos la imagen Docker utilizando el Dockerfile original:

```powershell
docker build -t reto-leak:v1.0 .
```

Posteriormente, inspeccionamos el contenido de la imagen ejecutando:

```powershell
docker run --rm reto-leak:v1.0 ls -la
```

### Resultado

Se encontró el archivo `.env` dentro de la imagen Docker, confirmando que los archivos sensibles estaban siendo copiados durante el proceso de construcción.

## 🚨 Vulnerabilidad identificada

La instrucción:

```dockerfile
COPY . .
```

copiaba indiscriminadamente todos los archivos del contexto de construcción hacia el directorio `/app` de la imagen.

Esto permitía que archivos sensibles, documentación y archivos locales innecesarios quedaran incluidos en la imagen.

## 🛠️ Solución implementada

### 1. Crear el archivo `.dockerignore`

Se creó un archivo `.dockerignore` para excluir archivos y directorios que no deben formar parte del contexto de construcción.

Contenido:

```dockerignore
.env
*.log
*.tmp
.git/
README.md
```

### 2. Modificar el Dockerfile

Se reemplazó la instrucción:

```dockerfile
COPY . .
```

Por:

```dockerfile
COPY --chown=appuser:appgroup app.py .
```

De esta manera, únicamente se copia el archivo necesario para ejecutar la aplicación.

El parámetro `--chown` permite asignar la propiedad del archivo al usuario y grupo de la aplicación.

## 🐳 Dockerfile final

```dockerfile
FROM python:3.12-alpine

WORKDIR /app

RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup

COPY --chown=appuser:appgroup app.py .

USER appuser

EXPOSE 8080

CMD ["python", "app.py"]
```

## 🔨 Construcción de la imagen

Reconstruimos la imagen utilizando `--no-cache` para evitar reutilizar capas anteriores:

```powershell
docker build --no-cache -t reto-leak:v1.0 .
```

## ✅ Validación

### 1. Inspeccionar el contenido de la imagen

```powershell
docker run --rm reto-leak:v1.0 ls -la
```

### Resultado esperado

Únicamente se encuentra el archivo necesario para ejecutar la aplicación:

```text
app.py
```

### 2. Verificar que el archivo `.env` no existe

```powershell
docker run --rm reto-leak:v1.0 cat .env
```

### Resultado obtenido

```text
cat: can't open '.env': No such file or directory
```

Este resultado confirma que el archivo `.env` no está presente dentro de la imagen Docker.

## 📚 Aprendizajes

- Comprendí la importancia de `.dockerignore` para excluir archivos sensibles y archivos innecesarios del contexto de construcción.
- Aprendí que `COPY . .` puede incluir accidentalmente información sensible dentro de una imagen Docker.
- Comprendí la importancia de copiar únicamente los archivos necesarios para ejecutar una aplicación.
- Aprendí a utilizar `COPY --chown` para asignar correctamente la propiedad de los archivos dentro de una imagen.
- Comprendí que modificar un Dockerfile requiere reconstruir la imagen para que los cambios se apliquen.
- Aprendí a validar el contenido de una imagen utilizando `docker run` y comandos de inspección del sistema de archivos.

## 🏁 Conclusión

La protección de información sensible debe considerarse desde la construcción de las imágenes Docker.

Utilizar `.dockerignore` y copiar únicamente los archivos necesarios permite reducir el contenido de la imagen, evitar la exposición accidental de secretos y mejorar las prácticas de seguridad en los procesos de containerización.

Este reto demuestra que pequeños cambios en el Dockerfile pueden tener un impacto importante en la seguridad de nuestras aplicaciones.