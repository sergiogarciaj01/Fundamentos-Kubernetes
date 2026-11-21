# 📔 Bitácora de Aprendizaje — 🔄 Semana 02: Deployments, Réplicas y Autorreparación

> ⛵ **Tripulante:** [`@juanjosegonzalezrosales`](https://github.com/juanjosegonzalezrosales)  
> 🗓️ **Fecha de registro:** `2026-11-17`  
> 🎓 **Portafolio Principal:** [⬅️ Volver a mi Portafolio Profesional K8s](../README.md)

---

## 1️⃣ 💡 ¿Qué aprendí esta semana?

- Aprendí a crear Deployments que, a través de un ReplicaSet, mantienen activos los Pods de forma automática para darle mayor resiliencia al sistema.

---

## 2️⃣ 🧩 ¿Qué fue lo más retador y cómo lo resolví?

Lo más retador fue depurar los errores de sintaxis en los manifiestos YAML, ya que exigen mucha atención al detalle.

---

## 3️⃣ 💻 Comandos y herramientas que practiqué

```bash
kubectl get deployments,replicasets,pods
kubectl apply -f 
kubectl describe deployment <nombre>
kubectl scale deployment <nombre> --replicas=5
```

---

## 4️⃣ 🚀 Aplicación real y próximos pasos

el curso esta cada vez mas cerca de los entornos reales laborales ya que nos permite entender como se despliegan conjuntos de nodos que se autoregulan de manera autonoma mediante el manifiesto que se define en el deployment.

---

<div align="center">
  <sub>🏔️☕ Bitácora registrada en <b><a href="https://github.com/edwinbermudez91/Fundamentos-Kubernetes">De Cero a Capitán en Kubernetes — Cloud Native Medellín (CNCF)</a></b></sub>
</div>
