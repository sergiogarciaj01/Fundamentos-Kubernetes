# Reto 4: la fuga de secretos por falta de `.dockerignore`

Mi solución del reto, semana 00 (@eandreaja).

Esta carpeta no incluye el archivo `.env` del reto a propósito: es justo el tipo de archivo que no debe viajar en un aporte. Para probar la solución usé una carpeta temporal con un `.env` inventado.

## Síntoma

El `Dockerfile` usa `COPY . .`, y no hay `.dockerignore`. La imagen se construye bien, pero lleva dentro el `.env` con las credenciales:

```bash
docker build -t reto-leak:v1.0 semana-00-fundamentos-docker/2.reto-roto/04-dockerignore-y-archivos-secretos
docker run --rm reto-leak:v1.0 ls -la
docker run --rm reto-leak:v1.0 wc -c .env
```

Resultado: en `/app` aparecen 4 archivos (`.env`, `Dockerfile`, `README.md` y `app.py`), todos con dueño `root` y permisos `-rw-r--r--`. El `.env` pesa 340 bytes. Con `cat .env` se leerían las credenciales en texto plano.

## Cómo lo investigué

1. `docker run --rm reto-leak:v1.0 ls -la` me mostró que dentro de la imagen estaba mucho más de lo que necesita la aplicación, incluido el `.env`.
2. `docker run --rm reto-leak:v1.0 wc -c .env` confirmó que el archivo estaba completo (340 bytes). Usé `wc` y no `cat` para no imprimir los valores.
3. Revisé el `Dockerfile`: la línea `COPY . .` copia todo el directorio de trabajo, y no existía ningún `.dockerignore`.

## Causa raíz

`COPY . .` copia todo lo que haya en la carpeta del build. Sin un `.dockerignore`, eso incluye el `.env`. Una vez dentro de la imagen, cualquiera que pueda ejecutarla o bajarla (por ejemplo, desde un registro) puede leerlo, y como los permisos son `rw-r--r--`, lo puede leer incluso el usuario sin privilegios.

## Solución

Dos cambios:

1. Copiar de forma explícita solo lo que la aplicación necesita, con el dueño correcto:

   ```dockerfile
   COPY --chown=appuser:appgroup app.py .
   ```

2. Crear un archivo `.dockerignore` en la carpeta del build:

   ```
   .env
   *.log
   *.tmp
   .git/
   README.md
   ```

## Cómo lo comprobé

En una carpeta temporal con un `.env` inventado, construí tres variantes y miré qué quedaba dentro de `/app`:

| Variante                                      | `COPY`                      | `.dockerignore` | Archivos en `/app`                      | ¿`.env` dentro? |
| --------------------------------------------- | --------------------------- | --------------- | --------------------------------------- | --------------- |
| A: mi solución                                | `COPY --chown=... app.py .` | sí              | `app.py`                                | no              |
| B: solo el `COPY` explícito                   | `COPY --chown=... app.py .` | no              | `app.py`                                | no              |
| C: el error original, con la red de seguridad | `COPY . .`                  | sí              | `.dockerignore`, `Dockerfile`, `app.py` | no              |

Lo que muestra cada una:

- B demuestra que, con un `COPY` explícito de solo `app.py`, el `.env` ya no entra aunque no exista `.dockerignore`.
- C demuestra para qué sirve igual el `.dockerignore`: aunque alguien vuelva a escribir `COPY . .` por descuido, el `.env` no entra a la imagen.
- En C, el `Dockerfile` y el propio `.dockerignore` sí se copiaron, porque no están en la lista de exclusiones (la lista del reto solo excluye `README.md`, no esos dos).

## `.gitignore` no es lo mismo que `.dockerignore`

| Archivo         | Quién lo lee                     | Para qué sirve                                     |
| --------------- | -------------------------------- | -------------------------------------------------- |
| `.gitignore`    | Git                              | Que `git add` no suba esos archivos al repositorio |
| `.dockerignore` | Docker (al hacer `docker build`) | Que esos archivos no entren a la imagen            |

Un `.env` ignorado por Git puede terminar igual dentro de una imagen si no está en el `.dockerignore`.

## Qué aprendí

- `COPY . .` copia todo, también lo que no debería viajar; conviene copiar solo lo necesario.
- El `.dockerignore` es una red de seguridad: protege aunque el `COPY` se escriba mal en el futuro.
- Un secreto dentro de una imagen se puede leer sin ejecutar la aplicación; si alguna vez se filtra uno de verdad, hay que cambiar las credenciales, no solo reconstruir la imagen.
