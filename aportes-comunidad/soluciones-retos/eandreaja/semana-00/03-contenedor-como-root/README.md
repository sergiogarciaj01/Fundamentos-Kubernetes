# Reto 3: el contenedor que corre como root

Mi solución del reto, semana 00 (@eandreaja).

## Síntoma

La imagen funciona, pero la auditoría de seguridad no la deja pasar porque el proceso corre como superusuario:

```bash
docker build -t reto-root:v1.0 semana-00-fundamentos-docker/2.reto-roto/03-contenedor-como-root
docker run --rm reto-root:v1.0 whoami
docker run --rm reto-root:v1.0 id
```

Resultado:

```
root
uid=0(root) gid=0(root) groups=0(root),0(root),1(bin),2(daemon),3(sys),4(adm),6(disk),10(wheel),...
```

Según el enunciado del reto, en Kubernetes con una política de seguridad estricta esta imagen falla con `container has runAsNonRoot and image will run as root`. Eso no lo probé: en mi equipo solo trabajé con Docker.

## Cómo lo investigué

1. `docker run --rm reto-root:v1.0 whoami` respondió `root`.
2. `docker run --rm reto-root:v1.0 id` mostró `uid=0` y, además, grupos del sistema como `disk`, `sys`, `adm` y `wheel`.
3. Revisé el `Dockerfile`: no tenía ninguna instrucción `USER`, y copiaba el archivo sin cambiarle el dueño.

El contenedor funciona sin ningún error ni aviso, y eso es justo el problema: un contenedor como root no falla, así que nadie se entera hasta que alguien aprovecha una vulnerabilidad.

## Causa raíz

Si el `Dockerfile` no dice qué usuario usar, el proceso corre como `root` (UID 0). Si la aplicación tuviera una vulnerabilidad de ejecución remota de código, el atacante tendría control total dentro del contenedor.

## Solución

Tres cambios en el `Dockerfile`, en este orden:

```dockerfile
RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup

COPY --chown=appuser:appgroup app.py .

USER appuser
```

| Línea                           | Para qué sirve                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------- |
| `RUN addgroup ... adduser ...`  | Crea el grupo y el usuario sin privilegios (UID 10001)                            |
| `COPY --chown=appuser:appgroup` | Deja el archivo a nombre del usuario nuevo, para que pueda leerlo                 |
| `USER appuser`                  | A partir de aquí, todo lo que se ejecuta (incluido el `CMD`) corre como `appuser` |

El orden importa. `USER` cambia quién ejecuta lo que viene después, así que va después de crear el usuario. Probé ponerlo antes del `RUN` y el build falla con `unable to find user appuser: no matching entries in passwd file`: Docker intenta cambiar a un usuario que todavía no existe.

También me di cuenta de que crear el usuario no alcanza: sin `USER`, el proceso seguiría corriendo como root aunque `appuser` exista.

## Cómo lo comprobé

```bash
docker build -t reto-root-ok aportes-comunidad/soluciones-retos/eandreaja/semana-00/03-contenedor-como-root
docker run --rm reto-root-ok whoami
docker run --rm reto-root-ok id
docker image inspect reto-root-ok --format '{{.Config.User}}'
docker run -d -p 8080:8080 --name test-root-ok reto-root-ok
curl http://localhost:8080
```

|                              | Antes (roto)                      | Después (corregido)                       |
| ---------------------------- | --------------------------------- | ----------------------------------------- |
| `whoami`                     | `root`                            | `appuser`                                 |
| `id`                         | `uid=0(root)` y grupos de sistema | `uid=10001(appuser) gid=10001(appgroup)`  |
| `USER` guardado en la imagen | vacío                             | `appuser`                                 |
| `curl http://localhost:8080` | alerta de root                    | `"estado": "seguro"` y `"es_root": false` |

## Qué aprendí

- Sin `USER`, un contenedor corre como root, aunque todo funcione y no haya ningún error.
- Crear un usuario no basta: hay que usar `USER` para que el proceso corra con él.
- `USER` va después de crear el usuario y antes del `CMD`, porque cambia quién ejecuta lo que viene después.
- `COPY --chown` evita que el usuario sin privilegios no pueda leer sus propios archivos.
