# 🎯 Reto 5: El puerto fantasma y la trampa del localhost (`127.0.0.1` vs `0.0.0.0`)

* **Dificultad:** 🟢 Principiante / 🟡 Intermedio
* **Archivos:** [`Dockerfile`](./Dockerfile) y [`app.py`](./app.py)

---

## 🔍 El Escenario

Un compañero creó un microservicio en Python y lo empaquetó con Docker. Al ejecutarlo con `docker run -d -p 8080:8080`, el comando tiene éxito y `docker ps` muestra que el contenedor está en estado `Up` (corriendo).

Sin embargo, cuando intenta abrir **`http://localhost:8080`** en el navegador o ejecutar `curl http://localhost:8080`:
```text
curl: (52) Empty reply from server
# o bien:
curl: (7) Failed to connect to localhost port 8080: Connection refused
```

### 💥 ¿Por qué ocurre esto? (Las 2 causas más comunes)

1. **La trampa de `127.0.0.1` vs `0.0.0.0`:**  
   Dentro de un contenedor, `127.0.0.1` representa la interfaz de *loopback* interna de ese contenedor aislado. Si la aplicación se enlaza solo a `127.0.0.1`, **rechazará cualquier conexión que venga desde fuera del contenedor**. Para aceptar conexiones externas reenviadas por Docker, la aplicación debe escuchar en `0.0.0.0` (todas las interfaces de red del contenedor).
2. **Desalineación de puertos:**  
   Si la aplicación escucha en un puerto (ej. `5000`) pero Docker mapea otro (ej. `8080:8080`), el tráfico nunca llegará al proceso.

---

## 🎯 Tu Misión

1. Abre [`app.py`](./app.py) e investiga los valores de `HOST` y `PORT`.
2. Corrige `app.py` para que:
   * Escuche en `0.0.0.0`.
   * El puerto coincida con el puerto expuesto y mapeado (`8080`).
3. Revisa [`Dockerfile`](./Dockerfile) para asegurarte de que `EXPOSE` documente el puerto correcto.
4. Construye y corre la imagen:
   ```bash
   docker build -t reto-puerto:v1.0 semana-00-fundamentos-docker/2.reto-roto/05-puerto-y-host-desalineado
   docker run -d -p 8080:8080 --name reto-puerto-test reto-puerto:v1.0
   ```
5. Prueba con `curl http://localhost:8080`.  
   ¡Debes recibir el JSON de éxito con `"estado": "conectado"`! 🎉
6. Al finalizar, limpia el contenedor:
   ```bash
   docker stop reto-puerto-test && docker rm reto-puerto-test
   ```


# 🐳 Reto 5: El puerto fantasma y la trampa del localhost

## 📋 Descripción del reto

El objetivo de este reto es identificar y solucionar problemas de conectividad en una aplicación desplegada dentro de un contenedor Docker.

El contenedor se ejecutaba correctamente y aparecía en estado `Up`, pero al intentar acceder a la aplicación desde el host mediante el puerto publicado, la conexión terminaba inesperadamente.

Este reto aborda dos errores comunes en aplicaciones Dockerizadas:

- Una aplicación que escucha en `127.0.0.1` en lugar de `0.0.0.0`.
- Una desalineación entre el puerto donde escucha la aplicación y el puerto publicado por Docker.

---

## 🔍 Diagnóstico

### 1. Inspección de `app.py`

Se identificaron las siguientes configuraciones iniciales:

```python
PORT = int(os.environ.get("PORT", 5000))
HOST = "127.0.0.1"
```

Esto generaba dos problemas:

**Desalineación de puertos:**

La aplicación escuchaba en el puerto `5000`, mientras que Docker estaba configurado para publicar el puerto `8080`.

**Host incorrecto:**

La aplicación escuchaba únicamente en `127.0.0.1`, es decir, en la interfaz loopback interna del contenedor.

Esto impedía que las conexiones provenientes de fuera del contenedor llegaran correctamente a la aplicación.

### 2. Inspección del `Dockerfile`

El Dockerfile ya documentaba el puerto esperado:

```dockerfile
EXPOSE 8080
```

Sin embargo, `EXPOSE` no configura automáticamente el puerto en el que escucha la aplicación. Es necesario que la aplicación y la configuración de Docker estén alineadas.

---

## ❌ Configuración inicial

| Componente | Configuración |
|---|---|
| HOST de la aplicación | `127.0.0.1` |
| PORT de la aplicación | `5000` |
| Docker EXPOSE | `8080` |
| Docker port mapping | `8080:8080` |

### Resultado

El contenedor se encontraba en estado `Up`, pero la aplicación no respondía correctamente desde el host.

Se realizó la siguiente prueba:

```powershell
Invoke-WebRequest http://localhost:8080
```

Resultado:

```text
Se ha terminado la conexión:
La conexión ha terminado de forma inesperada.
```

---

## 🛠️ Solución implementada

Se modificó la configuración de `app.py`:

```python
PORT = int(os.environ.get("PORT", 8080))
HOST = "0.0.0.0"
```

### ¿Por qué estos cambios?

#### `HOST = "0.0.0.0"`

Permite que el servidor escuche en todas las interfaces de red disponibles dentro del contenedor, haciendo posible recibir conexiones provenientes de Docker.

#### `PORT = 8080`

Se alineó el puerto de la aplicación con el puerto documentado en el Dockerfile y publicado por Docker.

---

## ⚙️ Configuración final

| Componente | Configuración |
|---|---|
| HOST de la aplicación | `0.0.0.0` |
| PORT de la aplicación | `8080` |
| Docker EXPOSE | `8080` |
| Puerto del host | `8080` |
| Puerto del contenedor | `8080` |

---

## 🚀 Construcción de la imagen

Desde la carpeta del reto:

```powershell
docker build --no-cache -t reto-puerto:v1.0 .
```

Se utilizó `--no-cache` para garantizar que Docker reconstruyera la imagen utilizando el código actualizado.

---

## ▶️ Ejecución del contenedor

```powershell
docker run -d -p 8080:8080 --name reto-puerto-test reto-puerto:v1.0
```

### Explicación

- `-d`: ejecuta el contenedor en segundo plano.
- `-p 8080:8080`: publica el puerto 8080 del host y lo conecta con el puerto 8080 del contenedor.
- `--name reto-puerto-test`: asigna un nombre al contenedor.
- `reto-puerto:v1.0`: utiliza la imagen construida.

---

## 🔎 Validación

### 1. Verificar el estado del contenedor

```powershell
docker ps
```

Se verificó que el contenedor se encontraba en estado `Up` y que el puerto estaba publicado correctamente:

```text
0.0.0.0:8080->8080/tcp
```

### 2. Verificar el proceso dentro del contenedor

```powershell
docker exec reto-puerto-test ps
```

Resultado:

```text
PID   USER     TIME  COMMAND
1     appuser  0:00  python app.py
7     appuser  0:00  ps
```

Esto permitió confirmar que el proceso Python seguía ejecutándose.

### 3. Probar la aplicación desde el host

```powershell
Invoke-WebRequest http://localhost:8080
```

### Resultado exitoso

La aplicación respondió correctamente con el siguiente JSON:

```json
{
    "estado": "conectado",
    "mensaje": "🎉 ¡Felicidades! Lograste alinear el Host y el Puerto en Docker.",
    "host": "0.0.0.0",
    "puerto": 8080
}
```

La respuesta HTTP confirmó que la aplicación estaba accesible desde el host.

---

## 🧠 Aprendizajes

### 1. `127.0.0.1` vs `0.0.0.0`

- `127.0.0.1`: permite escuchar únicamente en la interfaz loopback local.
- `0.0.0.0`: permite escuchar en todas las interfaces de red disponibles.

Cuando una aplicación dentro de Docker necesita recibir conexiones externas al contenedor, normalmente debe escuchar en `0.0.0.0`.

### 2. Alineación de puertos

Es importante que el puerto de escucha de la aplicación coincida con el puerto interno al que Docker redirige el tráfico.

En este reto:

```text
Aplicación Python: 8080
        ↓
Puerto interno del contenedor: 8080
        ↓
Puerto publicado en el host: 8080
```

### 3. Un contenedor `Up` no garantiza que la aplicación sea accesible

Docker verifica principalmente que el proceso principal del contenedor siga ejecutándose.

Un contenedor puede estar en estado `Up` y, aun así:

- Tener una aplicación que no responde.
- Escuchar en un puerto incorrecto.
- Escuchar únicamente en `127.0.0.1`.
- Tener problemas de conectividad.

Por eso es importante validar la aplicación desde el punto de vista del usuario o cliente.

---

## 🧹 Limpieza

Detener el contenedor:

```powershell
docker stop reto-puerto-test
```

Eliminar el contenedor:

```powershell
docker rm reto-puerto-test
```

La imagen `reto-puerto:v1.0` se conserva para futuras pruebas.

---

## ✅ Conclusión

El problema no estaba en Docker ni en la construcción de la imagen, sino en la configuración de red de la aplicación.

Al corregir el host de escucha a `0.0.0.0` y alinear el puerto de la aplicación con el puerto publicado por Docker, se logró establecer correctamente la comunicación entre el host y el contenedor.

Este reto demuestra la importancia de comprender cómo interactúan las aplicaciones, los puertos y las interfaces de red dentro de un entorno Docker.

**Reto completado: aplicación accesible correctamente desde el host. 🎉🐳**