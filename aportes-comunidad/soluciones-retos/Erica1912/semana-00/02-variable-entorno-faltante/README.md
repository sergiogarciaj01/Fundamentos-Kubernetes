# 🎯 Reto 2: El contenedor que crashea por falta de variable de entorno (`ENV`)

* **Dificultad:** 🟢 Principiante
* **Archivos:** [`Dockerfile`](./Dockerfile) y [`app.py`](./app.py)

---

## 🔍 El Escenario

Un compañero creó un microservicio que requiere una variable de entorno obligatoria llamada `APP_SECRET_TOKEN` para conectarse a un servicio central y autenticar peticiones.

Construyes la imagen exitosamente:
```bash
docker build -t reto-docker-02 semana-00-fundamentos-docker/2.reto-roto/02-variable-entorno-faltante
```

La ejecutas en segundo plano con:
```bash
docker run -d -p 8080:8080 --name mi-api-02 reto-docker-02
```

Pero al revisar con `docker ps`, **el contenedor no aparece en la lista de activos**.

---

## 🕵️‍♂️ Herramientas de Investigación

1. Revisa los contenedores detenidos:
   ```bash
   docker ps -a
   ```
   Verás que `mi-api-02` terminó con código de salida `Exited (1)`.
2. Lee los logs del contenedor para saber qué falló:
   ```bash
   docker logs mi-api-02
   ```
   *Salida:*  
   `💥 ERROR FATAL: La variable de entorno obligatoria 'APP_SECRET_TOKEN' no fue proporcionada.`

---

## 💡 ¿Por qué ocurre esto?

En Docker, una aplicación empaquetada dentro de una imagen no hereda automáticamente las variables de entorno de tu máquina local. Para que una variable exista dentro del contenedor, debe ser:
1. Definida como valor por defecto dentro del `Dockerfile` usando la instrucción `ENV`.
2. O inyectada en tiempo de ejecución mediante la bandera `-e` de `docker run`.

---

## 🎯 Tu Misión (Tienes 2 formas de resolverlo)

* **Solución 1 (Desde el Dockerfile):**  
  Abre [`Dockerfile`](./Dockerfile) y agrega una variable por defecto:
  ```dockerfile
  ENV APP_SECRET_TOKEN="token-local-dev-12345"
  ```
  Vuelve a construir y ejecutar:
  ```bash
  docker build -t reto-docker-02 semana-00-fundamentos-docker/2.reto-roto/02-variable-entorno-faltante
  docker run -d -p 8080:8080 --name mi-api-02 reto-docker-02
  ```

* **Solución 2 (En tiempo de ejecución con `docker run -e`):**  
  Pasa la variable directamente al arrancar el contenedor sin tocar el `Dockerfile`:
  ```bash
  docker run -d -p 8080:8080 -e APP_SECRET_TOKEN="mi-token-dinamico" --name mi-api-02 reto-docker-02
  ```

### Validación
Verifica con `curl http://localhost:8080` o abre en tu navegador. Recibirás un JSON confirmando:
```json
{
  "estado": "activo",
  "mensaje": "🎉 ¡Excelente! La variable de entorno fue configurada correctamente.",
  "token_configurado": "...",
  "puerto": 8080
}
```

Al terminar, limpia el contenedor:
```bash
docker rm -f mi-api-02
```
---

# 🧑‍💻 Mi solución

## 🔍 1. Diagnóstico del problema

La aplicación Python requiere una variable de entorno obligatoria llamada `APP_SECRET_TOKEN`.

Al ejecutar el contenedor sin proporcionar esta variable, la aplicación termina con un código de error `1`.

Para identificar el problema, ejecuté:

```bash
docker ps -a
```

El contenedor presentó el estado:

```text
Exited (1)
```

Posteriormente, revisé los logs:

```bash
docker logs mi-api-error
```

El error identificado fue:

```text
ERROR FATAL: La variable de entorno obligatoria 'APP_SECRET_TOKEN' no fue proporcionada.
Pista: Puedes definirla en el Dockerfile con 'ENV' o al correr el contenedor con 'docker run -e APP_SECRET_TOKEN=...'
```

Esto ocurre porque la aplicación intenta obtener la variable de entorno mediante:

```python
TOKEN = os.environ.get("APP_SECRET_TOKEN")
```

Si la variable no existe o está vacía, la aplicación termina su ejecución.

---

## ✅ 2. Solución implementada: variable en el Dockerfile

Agregué la variable de entorno al Dockerfile utilizando la instrucción `ENV`.

```dockerfile
ENV APP_SECRET_TOKEN="prueba"
```

Dockerfile completo:

```dockerfile
FROM python:3.12-alpine

WORKDIR /app

RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup

COPY --chown=appuser:appgroup app.py .

ENV APP_SECRET_TOKEN="prueba"

USER appuser

EXPOSE 8080

CMD ["python", "app.py"]
```

### Construcción de la imagen

```bash
docker build -t reto-docker-02 .
```

### Ejecución del contenedor

```bash
docker run -d -p 8081:8080 --name mi-api-02-v2 reto-docker-02
```

---

## ✅ 3. Solución alternativa: variable en tiempo de ejecución

También es posible proporcionar la variable de entorno al crear el contenedor, sin modificar el Dockerfile ni reconstruir la imagen.

```bash
docker run -d -p 8083:8080 -e APP_SECRET_TOKEN="token-dinamico" --name mi-api-02-e reto-docker-02
```

En este caso, el parámetro `-e` permite establecer la variable de entorno directamente durante la creación del contenedor.

---

## 🧪 4. Validación

Validé el funcionamiento de la aplicación mediante una petición HTTP desde PowerShell:

```powershell
Invoke-WebRequest -Uri http://localhost:8083
```

Resultado:

```text
StatusCode        : 200
StatusDescription : OK
```

Respuesta de la aplicación:

```json
{
  "estado": "activo",
  "mensaje": "🎉 ¡Excelente! La variable de entorno fue configurada correctamente.",
  "token_configurado": "token-dinamico",
  "puerto": 8080
}
```

La respuesta HTTP `200 OK` confirma que la aplicación está funcionando correctamente y que la variable de entorno fue recibida.

---

## 🧠 5. Aprendizajes

- Las variables de entorno permiten configurar aplicaciones sin modificar el código fuente.
- `ENV` permite definir variables de entorno dentro de una imagen Docker.
- `docker run -e` permite configurar o sobrescribir variables al crear un contenedor.
- Un contenedor puede crearse correctamente, pero la aplicación que ejecuta puede fallar.
- `docker ps -a` permite revisar contenedores activos y detenidos.
- `docker logs` permite investigar errores de una aplicación.
- El código de salida `1` indica que el proceso terminó con un error.
- El código HTTP `200 OK` confirma que una petición fue procesada exitosamente.
- Los cambios realizados en un Dockerfile requieren reconstruir la imagen para aplicarse a nuevos contenedores.

---

## 🚀 Conclusión

Se identificó y solucionó el problema causado por la ausencia de la variable de entorno `APP_SECRET_TOKEN`.

Se probaron dos alternativas:

1. Definir la variable utilizando `ENV` en el Dockerfile.
2. Proporcionar la variable dinámicamente utilizando `docker run -e`.

Finalmente, se validó que la aplicación respondiera correctamente mediante una petición HTTP con código `200 OK`.