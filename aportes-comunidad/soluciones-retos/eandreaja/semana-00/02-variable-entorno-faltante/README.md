# Reto 2: el contenedor que se cae por falta de una variable de entorno

Mi solución del reto, semana 00 (@eandreaja).

## Síntoma

La imagen se construye bien, pero el contenedor se apaga al instante:

```bash
docker build -t reto-docker-02 semana-00-fundamentos-docker/2.reto-roto/02-variable-entorno-faltante
docker run -d -p 8080:8080 --name mi-api-02 reto-docker-02
docker ps -a
```

`docker ps -a` mostró `Exited (1)`.

## Cómo lo investigué

1. `docker ps -a`: el código de salida fue **1** (error general de la aplicación). A diferencia del reto 1, donde fue 0, aquí sí hay un error escrito en algún lado.
2. `docker logs mi-api-02`: la aplicación lo dice con claridad:

   ```
   ERROR FATAL: La variable de entorno obligatoria 'APP_SECRET_TOKEN' no fue proporcionada.
   ```

## Causa raíz

`app.py` exige la variable de entorno `APP_SECRET_TOKEN` y, si no existe, se cierra con error a propósito. Un contenedor no hereda las variables de entorno de mi máquina: arranca con un entorno limpio, y lo que no se le da, no lo tiene.

## Solución

Pasar la variable al arrancar el contenedor, con `-e`, sin tocar el `Dockerfile`:

```bash
docker run -d -p 8080:8080 -e APP_SECRET_TOKEN="mi-token-dinamico" --name mi-api-02 reto-docker-02
curl http://localhost:8080
```

El `Dockerfile` y `app.py` de esta carpeta son idénticos a los originales: no hizo falta cambiarlos.

## Por qué elegí `-e` y no `ENV` en el Dockerfile

El reto permite dos caminos, y comprobé la diferencia con un token falso:

|                               | `ENV` dentro del Dockerfile                         | `-e` al arrancar                              |
| ----------------------------- | --------------------------------------------------- | --------------------------------------------- |
| ¿El valor queda en la imagen? | Sí: aparece en `docker image inspect` (campo `Env`) | No: el `Env` de la imagen no lo tiene         |
| ¿Aparece en `docker history`? | Sí: `ENV APP_SECRET_TOKEN=...`                      | No: ninguna línea lo menciona                 |
| ¿Dónde vive el valor?         | Dentro de la imagen, para siempre                   | Solo en el entorno del contenedor que ejecuto |

Con `ENV`, cualquiera que pueda bajar la imagen (por ejemplo, desde un registro) puede leer el secreto sin ejecutar nada, y las imágenes viejas que ya circulan lo conservan aunque después se cambie el Dockerfile. Con `-e`, el secreto no viaja con la imagen.

Límites que conviene tener claros:

- `-e` tampoco es perfecto: `docker inspect` del contenedor en ejecución muestra el valor a quien tenga acceso a Docker en esa máquina. En producción se usan mecanismos pensados para secretos (por ejemplo, un `Secret` de Kubernetes o un gestor de secretos).
- La aplicación del reto devuelve el valor del token en su respuesta (`token_configurado`). Sirve para comprobar que funcionó en el laboratorio, pero una aplicación real no debería devolver un secreto por HTTP.

`ENV` sigue siendo válido para configuración que no es secreta (por ejemplo, un puerto o un mensaje por defecto).

## Qué aprendí

- Un código de salida 1 significa que hay un error escrito en los logs; un 0 sin errores es otra cosa (como en el reto 1).
- Un contenedor no hereda las variables de entorno de la máquina: hay que dárselas explícitamente.
- Lo que se escribe con `ENV` en un Dockerfile queda dentro de la imagen y se puede leer sin ejecutarla; un secreto no debe ir ahí.
