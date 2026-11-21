# Reto 1: el contenedor que se apaga solo al instante (PID 1)

Mi solución del reto, semana 00 (@eandreaja).

## Síntoma

La imagen se construye sin errores, pero al correrla en segundo plano el contenedor no queda corriendo:

```bash
docker build -t reto-docker-01 semana-00-fundamentos-docker/2.reto-roto/01-dockerfile-roto
docker run -d -p 8080:80 --name mi-prueba reto-docker-01
docker ps -a
```

`docker ps -a` mostró `Exited (0)` a los pocos segundos.

## Cómo lo investigué

1. `docker ps -a`: el código de salida fue **0**, es decir, el contenedor terminó sin error.
2. `docker logs mi-prueba`: no había ningún mensaje de error, solo los avisos normales de arranque de Nginx.
3. Me fijé en los números que aparecen antes del `#` en los logs (`PID#hilo`). Los primeros avisos decían `1#1`, pero la línea `start worker processes` decía `30#30`: los procesos de Nginx los estaba manejando el proceso 30, no el proceso 1.

Que el código de salida sea 0 y que no haya errores en los logs me indicó que no era un fallo de la aplicación, sino que el proceso principal terminó "bien" y se fue.

## Causa raíz

El `Dockerfile` terminaba con:

```dockerfile
CMD ["nginx"]
```

Por defecto, `nginx` arranca como daemon: se separa y se va a **segundo plano**, y el proceso original (el que Docker ve como **PID 1**) termina. Docker solo mira el PID 1: cuando el PID 1 termina, da el trabajo por terminado y apaga el contenedor, aunque Nginx siguiera funcionando por detrás.

## Solución

Cambiar el `CMD` para que Nginx se quede en **primer plano** con `daemon off;`:

```dockerfile
CMD ["nginx", "-g", "daemon off;"]
```

Con eso, Nginx es el PID 1 y mientras siga corriendo, el contenedor sigue vivo.

## Cómo lo comprobé

```bash
docker build -t reto-docker-01-ok aportes-comunidad/soluciones-retos/eandreaja/semana-00/01-dockerfile-roto
docker run -d -p 8080:80 --name mi-prueba-ok reto-docker-01-ok
docker ps -a
docker logs mi-prueba-ok
curl -I http://localhost:8080
```

|                                      | Antes (roto)  | Después (corregido)              |
| ------------------------------------ | ------------- | -------------------------------- |
| `CMD`                                | `["nginx"]`   | `["nginx", "-g", "daemon off;"]` |
| Estado                               | `Exited (0)`  | `Up`                             |
| `start worker processes` en los logs | `30#30`       | `1#1`                            |
| `curl http://localhost:8080`         | sin respuesta | `HTTP 200`                       |

## Nota sobre el puerto: publicar no es lo mismo que exponer

En `docker run -d -p 8080:80`, la opción `-p` **publica** el puerto 8080 de mi máquina y lo conecta con el puerto 80 del contenedor. Por eso `curl http://localhost:8080` llega a Nginx.

`EXPOSE 80` en el `Dockerfile` es otra cosa: solo documenta que la aplicación escucha en el 80, pero no abre nada hacia afuera.

Además, `-p 8080:80` publica en todas las interfaces de la máquina (en `docker ps` aparece como `0.0.0.0:8080->80/tcp`). Si se quisiera que solo mi propio equipo pudiera conectarse, se escribiría `-p 127.0.0.1:8080:80`.

## Qué aprendí

- Un contenedor vive mientras viva su proceso principal (PID 1), y Docker solo mira a ese.
- Si un contenedor termina con código 0 y sin errores en los logs, no hay que buscar un bug: hay que sospechar de un proceso que se fue a segundo plano.
- Los números `PID#hilo` de los logs ayudan a ver quién está arrancando cada cosa.
