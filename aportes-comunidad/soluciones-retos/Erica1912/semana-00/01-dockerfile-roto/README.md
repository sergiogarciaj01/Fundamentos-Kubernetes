# 🎯 Reto 1: El contenedor que se apaga solo al instante (PID 1)

* **Dificultad:** 🟢 Principiante
* **Archivos:** [`Dockerfile`](./Dockerfile) e [`index.html`](./index.html)

---

## 🔍 El Escenario

Un compañero intentó empaquetar una página web usando la imagen oficial de Nginx (`nginx:alpine`).

La construcción de la imagen tiene éxito sin errores:
```bash
docker build -t reto-docker-01 semana-00-fundamentos-docker/2.reto-roto/01-dockerfile-roto
```

Sin embargo, cuando intenta correr el contenedor en segundo plano (`-d`):
```bash
docker run -d -p 8080:80 --name mi-prueba reto-docker-01
```

Y luego revisa con:
```bash
docker ps
```
¡El contenedor **NO aparece en la lista**!

---

## 🕵️‍♂️ Herramientas de Investigación

1. Ejecuta:
   ```bash
   docker ps -a
   ```
   Observa la columna `STATUS`: dirá `Exited (0)` hace pocos segundos.
2. Revisa los logs:
   ```bash
   docker logs mi-prueba
   ```

---

## 💡 ¿Por qué ocurre esto?

En Docker, un contenedor vive **únicamente mientras su proceso principal (PID 1) siga en ejecución**.

Por defecto, el binario `nginx` se ejecuta como demonio en segundo plano (fork) y el comando inicial termina inmediatamente, lo que hace que Docker considere que el trabajo terminó y apague el contenedor.

Para que Nginx mantenga vivo el contenedor, debe ejecutarse en **primer plano** (*foreground*).

---

## 🎯 Tu Misión

1. Abre [`Dockerfile`](./Dockerfile).
2. Modifica la instrucción `CMD` para que Nginx corra en primer plano indicando la directiva de configuración:
   ```dockerfile
   CMD ["nginx", "-g", "daemon off;"]
   ```
3. Vuelve a compilar y ejecutar:
   ```bash
   docker build -t reto-docker-01 semana-00-fundamentos-docker/2.reto-roto/01-dockerfile-roto
   docker run -d -p 8080:80 --name mi-prueba-ok reto-docker-01
   ```
4. Comprueba con `docker ps` que esté en estado `Up` y abre en tu navegador **[http://localhost:8080](http://localhost:8080)**. 🎉
5. Limpia los contenedores de prueba:
   ```bash
   docker rm -f mi-prueba mi-prueba-ok
   ```
---

# 🧑‍💻 Mi solución

## 🔍 1. Diagnóstico del problema

El reto consistía en identificar por qué un contenedor basado en Nginx se detenía inmediatamente después de ser iniciado.

El Dockerfile original era:

```dockerfile
FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html

EXPOSE 80

CMD ["nginx"]
```

Al ejecutar el contenedor, este se detenía inesperadamente.

Para verificar su estado, ejecuté:

```bash
docker ps -a
```

Esto permitió identificar que el contenedor no permanecía en ejecución.

---

## 🔎 2. Identificación del problema

El problema estaba en la instrucción:

```dockerfile
CMD ["nginx"]
```

Nginx, por defecto, se ejecuta en segundo plano cuando se inicia de esta manera.

Docker necesita que el proceso principal del contenedor permanezca ejecutándose. Cuando el proceso principal termina, Docker considera que el contenedor ha finalizado.

Por esta razón, el contenedor se detenía inmediatamente.

---

## ✅ 3. Solución implementada

Modifiqué la instrucción `CMD` para ejecutar Nginx en primer plano utilizando los parámetros:

```dockerfile
CMD ["nginx", "-g", "daemon off;"]
```

El parámetro `-g` permite especificar directivas globales de Nginx, mientras que `daemon off;` evita que Nginx se ejecute como un proceso en segundo plano.

### Dockerfile corregido

```dockerfile
FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## 🏗️ 4. Construcción de la imagen

Construí la imagen Docker utilizando:

```bash
docker build -t reto-docker-01 .
```

El parámetro `-t` permite asignar un nombre y una etiqueta a la imagen.

En este caso, la imagen fue identificada como:

```text
reto-docker-01
```

---

## 🚀 5. Ejecución del contenedor

Ejecuté el contenedor utilizando:

```bash
docker run -d -p 8080:80 --name mi-prueba-ok reto-docker-01
```

### Explicación del comando

| Parámetro | Descripción |
|---|---|
| `docker run` | Crea y ejecuta un contenedor |
| `-d` | Ejecuta el contenedor en segundo plano |
| `-p 8080:80` | Mapea el puerto local 8080 al puerto 80 del contenedor |
| `--name mi-prueba-ok` | Asigna un nombre al contenedor |
| `reto-docker-01` | Imagen utilizada para crear el contenedor |

---

## 🧪 6. Validación

Verifiqué que el contenedor permaneciera ejecutándose utilizando:

```bash
docker ps
```

Posteriormente, accedí desde el navegador a:

```text
http://localhost:8080
```

La página se cargó correctamente, confirmando que Nginx estaba funcionando y que el contenedor permanecía activo.

---

## 🧠 7. Aprendizajes

- Docker utiliza el proceso principal del contenedor para determinar si este continúa ejecutándose.
- Si el proceso principal termina, el contenedor se detiene.
- Nginx puede ejecutarse en segundo plano o en primer plano.
- `daemon off;` permite que Nginx permanezca en primer plano.
- `CMD` define el comando que se ejecuta cuando se inicia un contenedor.
- `docker ps` permite verificar los contenedores que están ejecutándose.
- `docker ps -a` permite visualizar también los contenedores detenidos.
- `docker build` permite construir una imagen a partir de un Dockerfile.
- `docker run` permite crear y ejecutar un contenedor a partir de una imagen.
- El mapeo de puertos permite acceder a los servicios que se ejecutan dentro del contenedor desde nuestra máquina local.

---

## 🚀 Conclusión

Se identificó que el contenedor se detenía porque Nginx se estaba ejecutando como un proceso en segundo plano.

La solución consistió en modificar el Dockerfile para ejecutar Nginx en primer plano utilizando:

```dockerfile
CMD ["nginx", "-g", "daemon off;"]
```

Después de reconstruir la imagen y ejecutar un nuevo contenedor, se verificó que Nginx permaneciera activo y que la página web pudiera visualizarse correctamente desde el navegador.

Este reto permitió comprender la importancia del proceso principal de un contenedor y cómo diagnosticar problemas relacionados con su ciclo de vida.
```