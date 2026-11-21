# ⌨️ Cheat Sheet de `kubectl` y Diagnóstico Rápido (Guía para Principiantes)

Guía de referencia rápida con los comandos que más usarás en el día a día del workshop **De Cero a Capitán en Kubernetes** (**☕ KubeCafé**).

---

## ⚡ 1. De Imperativo a Declarativo (`--dry-run=client -o yaml`)
El truco más útil del día a día (y de certificaciones como **CKA/CKAD**): usa comandos imperativos para **generar la plantilla YAML al instante** sin escribirla desde cero:

```bash
# 1. Generar YAML de un Pod Nginx con puerto 80:
kubectl run web --image=nginx:alpine --port=80 --dry-run=client -o yaml > pod.yaml

# 2. Generar YAML de un Deployment con 3 réplicas:
kubectl create deployment api --image=nginx:alpine --replicas=3 --dry-run=client -o yaml > deploy.yaml

# 3. Generar YAML de un Service ClusterIP o NodePort exponiendo un Deployment:
kubectl expose deployment api --port=80 --target-port=80 --type=ClusterIP --dry-run=client -o yaml > svc.yaml

# 4. Generar YAML de un ConfigMap (literal o desde archivo):
kubectl create configmap app-cfg --from-literal=MONEDA=COP --from-literal=PRECIO=3500 --dry-run=client -o yaml > cm.yaml

# 5. Generar YAML de un Secret (Opaque):
kubectl create secret generic app-sec --from-literal=DB_PASS=Tinto2026 --dry-run=client -o yaml > secret.yaml
```
> 💡 Luego puedes editar el archivo `.yaml` generado y aplicarlo de forma declarativa con `kubectl apply -f <archivo>.yaml`.

---

## 🔍 2. Inspección, Filtros y Formatos de Salida
```bash
kubectl get nodes -o wide               # Ver nodos, IPs, versión de K8s y runtime
kubectl get pods                        # Ver Pods en el namespace actual
kubectl get pods -A                     # Ver Pods en TODOS los namespaces
kubectl get pods -o wide                # Ver IP del Pod y en qué Nodo corre
kubectl get pods -w                     # Observar cambios de estado en tiempo real (watch)
kubectl get pods -l app=kubecafe        # Filtrar recursos por etiqueta (label)
kubectl get pods --show-labels          # Ver todas las etiquetas de cada Pod
kubectl get all                         # Ver Pods, Services, Deployments y ReplicaSets
kubectl get cm,secrets,pv,pvc           # Ver ConfigMaps, Secrets y almacenamiento
kubectl get pod <pod> -o yaml           # Ver la definición completa en YAML de un Pod vivo
kubectl get svc <svc> -o jsonpath='{.status.loadBalancer.ingress[0].ip}'  # Extraer un campo exacto
```

---

## 🩺 3. Diagnóstico cuando algo falla (Comandos Salvavidas)
Si un Pod dice `Pending`, `CrashLoopBackOff`, `ImagePullBackOff`, `CreateContainerConfigError` o `ContainerCreating`:

```bash
# 1. Ver el porqué exacto en la sección "Events" al final:
kubectl describe pod <nombre-pod>

# 2. Ver los logs de la aplicación dentro del Pod:
kubectl logs <nombre-pod>
kubectl logs -f <nombre-pod>            # Seguir logs en tiempo real
kubectl logs <nombre-pod> -c <cont>     # Ver logs de un contenedor específico (Sidecar/Init)
kubectl logs <nombre-pod> --previous    # Ver logs del intento anterior antes de reiniciar

# 3. Ver todos los eventos recientes del clúster ordenados por hora:
kubectl get events --sort-by=.lastTimestamp

# 4. Entrar a una terminal dentro del contenedor en ejecución:
kubectl exec -it <nombre-pod> -- sh

# 5. Lanzar un Pod temporal de pruebas (curl/DNS) que se borra solo al salir:
kubectl run tester --image=curlimages/curl:8.10.1 --rm -it --restart=Never -- sh
```

---

## 🛠️ 4. Ayuda Integrada y Documentación en Terminal
```bash
kubectl explain pod                     # Explicar qué es un Pod y sus campos principales
kubectl explain pod.spec.containers     # Ver campos exactos de los contenedores
kubectl explain deployment.spec --recursive | head -n 40  # Árbol de campos YAML
kubectl api-resources                   # Listar todos los tipos de recursos disponibles (y sus abreviaturas)
```

---

## 🧭 5. Contextos, Namespaces y Uso Diario
```bash
kubectl config get-contexts             # Ver clústeres configurados en kubeconfig
kubectl config use-context <nombre>     # Cambiar de clúster activo
kubectl config set-context --current --namespace=kubecafe-salon  # Fijar namespace por defecto
kubectl create namespace pruebas        # Crear un nuevo namespace
kubectl top nodes                       # Ver consumo real de CPU/RAM por nodo (requiere metrics-server)
kubectl top pods                        # Ver consumo real de CPU/RAM por Pod
kubectl cp <pod>:/ruta/archivo ./local  # Copiar un archivo desde un Pod hacia tu PC
```

---

## 🚀 6. Aplicar, Comparar, Esperar y Limpiar
```bash
kubectl diff -f archivo.yaml            # Ver qué cambiaría en el clúster antes de aplicar
kubectl apply -f archivo.yaml           # Crear o actualizar recursos desde YAML
kubectl apply -f carpeta/               # Aplicar todos los YAML de una carpeta
kubectl wait --for=condition=ready pod/<pod> --timeout=60s   # Esperar hasta que el Pod esté Ready
kubectl port-forward svc/<svc> 8080:80  # Abrir túnel local http://localhost:8080 hacia un Service
kubectl delete -f archivo.yaml          # Eliminar los recursos creados por ese YAML
kubectl delete pod -l app=test          # Borrar todos los Pods que tengan cierta etiqueta
```

---

## 🔄 7. Deployments, Escalamiento y Rollbacks
```bash
kubectl scale deployment/<nombre> --replicas=4          # Escalar réplicas en vivo
kubectl set image deployment/<nombre> app=nginx:1.27    # Actualizar imagen en vivo
kubectl rollout status deployment/<nombre>              # Ver progreso de actualización
kubectl rollout history deployment/<nombre>             # Ver historial de revisiones
kubectl rollout undo deployment/<nombre>                # Volver a la versión anterior estable
kubectl rollout restart deployment/<nombre>             # Reiniciar Pods (ej. tras editar un ConfigMap)
```

---

## 🌐 8. Redes (`Services`, `Endpoints` y `Gateway API`)
```bash
kubectl get svc,endpoints               # Verificar si el Service encontró las IPs de los Pods
kubectl get endpointslices              # Versión moderna de Endpoints
kubectl get gateway,httproute           # Ver estado de Gateway API (Cilium)
kubectl describe httproute <nombre>     # Ver condiciones Accepted y ResolvedRefs
```
