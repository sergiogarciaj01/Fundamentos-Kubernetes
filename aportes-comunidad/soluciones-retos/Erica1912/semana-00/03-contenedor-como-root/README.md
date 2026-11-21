# 🎯 Reto 3: El contenedor vulnerable que corre como root

* **Dificultad:** 🟡 Intermedio
* **Archivo:** [`Dockerfile`](./Dockerfile)

---

## 🔍 El Escenario

La empresa implementó una auditoría estricta de seguridad: **ningún contenedor en producción debe ejecutarse con privilegios de superusuario (`root`)**, ya que si la aplicación sufre una vulnerabilidad de ejecución remota de código, el atacante tendría control absoluto sobre los procesos.

Un compañero empaquetó una API en Python dentro de un contenedor, pero olvidó configurar un usuario sin privilegios.

### 💥 Síntomas

1. Construye la imagen actual:
   ```bash
   docker build -t reto-root:v1.0 semana-00-fundamentos-docker/2.reto-roto/03-contenedor-como-root
   ```
2. Inspecciona qué usuario ejecuta el proceso:
   ```bash
   docker run --rm reto-root:v1.0 whoami
   ```
   *Salida:* `root` ❌ (El proceso corre como UID 0).

3. Al probar con `curl`:
   ```bash
   docker run -d -p 8080:8080 --name test-root reto-root:v1.0
   curl http://localhost:8080
   ```
   *Salida:* `"alerta": "⚠️ ALERTA: Este contenedor está corriendo como superusuario (root)!"`

---

## 🎯 Tu Misión

1. Modifica [`Dockerfile`](./Dockerfile) para aplicar el principio de menor privilegio:
   * Crea un grupo y un usuario no privilegiado en Alpine (por ejemplo `appuser` con UID y GID `10001`):
     ```dockerfile
     RUN addgroup -g 10001 -S appgroup && \
         adduser -u 10001 -S appuser -G appgroup
     ```
   * Asigna la propiedad del archivo copiado al nuevo usuario usando:
     ```dockerfile
     COPY --chown=appuser:appgroup app.py .
     ```
   * Declara la instrucción `USER` antes de `CMD`:
     ```dockerfile
     USER appuser
     ```
2. Vuelve a compilar la imagen:
   ```bash
   docker build -t reto-root:v1.0 semana-00-fundamentos-docker/2.reto-roto/03-contenedor-como-root
   ```
3. Valida que el usuario sea el correcto:
   ```bash
   docker run --rm reto-root:v1.0 whoami
   ```
   *Salida esperada:* `appuser` (o UID 10001) ✅.

4. Corre el contenedor y valida la respuesta HTTP:
   ```bash
   docker run -d -p 8080:8080 --name test-root-ok reto-root:v1.0
   curl http://localhost:8080
   ```
   *Salida esperada:* `"es_root": false` y `"mensaje": "✅ EXCELENTE: El contenedor corre con un usuario sin privilegios."`

5. Limpia los contenedores de prueba:
   ```bash
   docker rm -f test-root test-root-ok
   ```

# 🐳 Reto 3: Contenedor ejecutándose como root

## 📋 Descripción del reto

Este reto consiste en identificar y corregir un problema de seguridad en un contenedor Docker que se ejecuta utilizando el usuario `root` (UID 0).

Ejecutar aplicaciones dentro de contenedores con privilegios de superusuario aumenta los riesgos de seguridad. Por esta razón, se recomienda aplicar el principio de **Least Privilege (mínimo privilegio)**, ejecutando las aplicaciones con un usuario que tenga únicamente los permisos necesarios.

El objetivo es modificar el Dockerfile para crear un usuario no privilegiado y configurar el contenedor para que la aplicación se ejecute con dicho usuario.

---

## 🔍 Diagnóstico del problema

El Dockerfile original del reto era:

```dockerfile
FROM python:3.12-alpine

WORKDIR /app

COPY app.py .

EXPOSE 8080

CMD ["python", "app.py"]
```

El problema se encontraba en que el Dockerfile no definía un usuario específico para ejecutar la aplicación.

Por defecto, los contenedores Docker ejecutan sus procesos como `root` cuando no se especifica un usuario mediante la instrucción `USER`.

### Validación inicial

Construimos la imagen original:

```powershell
docker build -t reto-root:v1.0 .
```

Posteriormente, verificamos el usuario con el que se ejecutaba el contenedor:

```powershell
docker run --rm reto-root:v1.0 whoami
```

Resultado:

```text
root
```

Esto confirmó que el contenedor se estaba ejecutando como superusuario.

---

## ❌ Causa del problema

El Dockerfile original no:

- Creaba un usuario no privilegiado.
- Creaba un grupo para la aplicación.
- Asignaba la propiedad de los archivos de la aplicación a un usuario específico.
- Definía la instrucción `USER` para cambiar el usuario de ejecución.

Como consecuencia, Docker utilizaba `root` como usuario predeterminado.

---

## 🛠️ Solución implementada

Se modificó el Dockerfile para crear un grupo y un usuario no privilegiados, asignar la propiedad del archivo `app.py` y configurar el usuario con el que se ejecutará la aplicación.

### Dockerfile corregido

```dockerfile
FROM python:3.12-alpine

WORKDIR /app

# Crear grupo y usuario no privilegiados
RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup

# Copiar archivos asignando propietario
COPY --chown=appuser:appgroup app.py .

EXPOSE 8080

# Ejecutar como usuario no privilegiado
USER appuser

CMD ["python", "app.py"]
```

### Explicación de los cambios

| Instrucción | Descripción |
|---|---|
| `addgroup -g 10001 -S appgroup` | Crea un grupo con GID 10001. |
| `adduser -u 10001 -S appuser -G appgroup` | Crea un usuario no privilegiado con UID 10001 y lo asigna al grupo `appgroup`. |
| `COPY --chown=appuser:appgroup app.py .` | Copia el archivo `app.py` asignando su propietario al usuario y grupo creados. |
| `USER appuser` | Define que los siguientes procesos del contenedor se ejecutarán con el usuario `appuser`. |
| `CMD ["python", "app.py"]` | Ejecuta la aplicación Python. |

---

## 🧪 Construcción de la imagen corregida

Para garantizar que Docker ejecutara las instrucciones actualizadas del Dockerfile, reconstruimos la imagen sin utilizar la caché:

```powershell
docker build --no-cache -t reto-root:v1.0 .
```

La opción `--no-cache` obliga a Docker a ejecutar nuevamente las instrucciones del Dockerfile, evitando reutilizar las capas de una construcción anterior.

---

## ✅ Validación de la solución

### 1. Verificar el usuario configurado en la imagen

```powershell
docker image inspect reto-root:v1.0 --format "{{.Config.User}}"
```

Resultado esperado:

```text
appuser
```

### 2. Verificar el usuario de ejecución del contenedor

```powershell
docker run --rm reto-root:v1.0 whoami
```

Resultado:

```text
appuser
```

Esta prueba confirmó que el contenedor ya no se ejecutaba como `root`.

### 3. Ejecutar la aplicación

```powershell
docker run -d -p 8084:8080 --name test-root-ok reto-root:v1.0
```

### 4. Validar la respuesta HTTP

```powershell
Invoke-WebRequest -Uri http://localhost:8084
```

Respuesta obtenida:

```json
{
  "estado": "seguro",
  "uid_actual": 10001,
  "es_root": false,
  "mensaje": "✅ EXCELENTE: El contenedor corre con un usuario sin privilegios."
}
```

### Resultados

| Validación | Resultado |
|---|---|
| Usuario de ejecución | `appuser` |
| UID | `10001` |
| Estado | `seguro` |
| `es_root` | `false` |
| Aplicación HTTP | Funcionando correctamente |

---

## 🧹 Limpieza

Una vez finalizadas las pruebas, eliminamos el contenedor de validación:

```powershell
docker rm -f test-root-ok
```

La imagen `reto-root:v1.0` permanece disponible para futuras pruebas.

---

## 📚 Aprendizajes

- Los contenedores Docker utilizan `root` por defecto si no se especifica otro usuario.
- Ejecutar aplicaciones con privilegios elevados aumenta los riesgos de seguridad.
- El principio de mínimo privilegio consiste en proporcionar únicamente los permisos necesarios.
- La instrucción `USER` permite definir el usuario con el que se ejecutarán los procesos del contenedor.
- `COPY --chown` permite asignar la propiedad de los archivos durante la construcción de la imagen.
- Crear un usuario no es suficiente: también es necesario configurar explícitamente el usuario de ejecución.
- Modificar un Dockerfile no actualiza automáticamente una imagen existente. Es necesario reconstruir la imagen para aplicar los cambios.
- La opción `--no-cache` permite realizar una construcción sin reutilizar las capas almacenadas en caché.
- Es importante validar tanto la configuración de seguridad como el funcionamiento de la aplicación después de aplicar los cambios.

---

## 🎯 Conclusión

El problema se solucionó creando un usuario y grupo no privilegiados, asignando la propiedad de los archivos de la aplicación y configurando `USER appuser` en el Dockerfile.

Después de reconstruir la imagen, verificamos que el contenedor se ejecutara con UID 10001, que no fuera `root` y que la aplicación HTTP continuara funcionando correctamente.

De esta manera, se aplicó el principio de mínimo privilegio, mejorando la seguridad del contenedor sin afectar el funcionamiento de la aplicación.

**Reto 3 completado exitosamente.** ✅