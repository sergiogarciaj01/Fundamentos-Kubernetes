# Reto 5: el puerto fantasma y la trampa del localhost

Mi solución del reto, semana 00 (@eandreaja).

## Síntoma

El contenedor queda en `Up` y el puerto aparece publicado, pero no se puede conectar:

```bash
docker build -t reto-puerto:v1.0 semana-00-fundamentos-docker/2.reto-roto/05-puerto-y-host-desalineado
docker run -d -p 8080:8080 --name reto-puerto-test reto-puerto:v1.0
docker ps
curl http://localhost:8080
```

`docker ps` mostró `Up` y `0.0.0.0:8080->8080/tcp`, pero `curl` devolvió `curl: (56) Recv failure: Connection reset by peer`. (En otros momentos y entornos el mismo problema puede salir como `(52) Empty reply from server`: el mensaje cambia, la causa es la misma.)

## Cómo lo investigué

1. `docker ps` no mostraba nada raro: el contenedor estaba vivo.
2. `docker logs reto-puerto-test` salió vacío (0 bytes). No significaba que no hubiera nada: Python guarda lo que imprime en un buffer cuando no hay una terminal conectada, y `docker logs` no lo ve hasta que se vacía. Con `-e PYTHONUNBUFFERED=1` el mismo contenedor mostró:

   ```
   Iniciando servidor en http://127.0.0.1:5000...
   ```

3. Esa línea reveló los dos errores: la aplicación escuchaba en la dirección `127.0.0.1` y en el puerto `5000`, mientras que Docker estaba conectando el puerto 8080 de mi máquina con el 8080 del contenedor.

## Causa raíz

Eran dos errores independientes en `app.py`:

1. **Puerto:** la aplicación escuchaba por defecto en el 5000, pero `docker run -p 8080:8080` enviaba el tráfico al 8080 del contenedor, donde no había nadie.
2. **Dirección:** `HOST = "127.0.0.1"`. Dentro de un contenedor, `127.0.0.1` es el propio contenedor, así que la aplicación solo aceptaba conexiones que se originaran dentro de él. Las conexiones que reenvía Docker llegan desde fuera, por otra interfaz, y las rechazaba.

## Solución

Dos cambios en `app.py`:

```python
PORT = int(os.environ.get("PORT", 8080))
HOST = "0.0.0.0"
```

`0.0.0.0` significa "todas las interfaces del contenedor". El `EXPOSE 8080` del `Dockerfile` ya coincidía con el puerto, así que no hubo que tocarlo.

## Cómo lo comprobé

Con tres variantes (construidas en una carpeta temporal, cada una con un puerto distinto de mi máquina hacia el 8080 del contenedor) para ver si alcanza con arreglar solo uno de los dos errores:

| Variante                  | `HOST`      | `PORT` | `curl`                     |
| ------------------------- | ----------- | ------ | -------------------------- |
| Solo arreglé el puerto    | `127.0.0.1` | 8080   | `Connection reset by peer` |
| Solo arreglé la dirección | `0.0.0.0`   | 5000   | `Connection reset by peer` |
| Mi solución (los dos)     | `0.0.0.0`   | 8080   | `"estado": "conectado"`    |

Hacen falta los dos arreglos: arreglar uno solo no cambia el síntoma, por eso el problema es tan frustrante en la práctica.

Otra forma válida de alinear el puerto sin tocar el de la aplicación habría sido `docker run -p 8080:5000`, pero el reto pide que `EXPOSE`, la aplicación y el mapeo coincidan en 8080.

## Qué aprendí

- Que un contenedor esté `Up` y con el puerto publicado no significa que la aplicación atienda: hay que mirar dónde escucha de verdad.
- Dentro de un contenedor, `127.0.0.1` es solo el propio contenedor; para recibir tráfico de afuera hay que escuchar en `0.0.0.0`.
- El número de la derecha del `-p` tiene que coincidir con el puerto real en el que escucha la aplicación.
- Si `docker logs` sale vacío, no hay que asumir que no hay nada: puede ser el buffer de Python. `PYTHONUNBUFFERED=1` hace que se vea al instante.
- Los mensajes de error de `curl` cambian según la versión, pero la causa es la misma: lo importante es entender por qué.
