# 📔 Bitácora de Aprendizaje — 🔄 Semana 02: Deployments, Réplicas y Autorreparación

> ⛵ **Tripulante:** [`@karolrojas68`](https://github.com/karolrojas68)  
> 🗓️ **Fecha de registro:** `2026-11-19`  
> 🎓 **Portafolio Principal:** [⬅️ Volver a mi Portafolio Profesional K8s](../README.md)

---

## 1️⃣ 💡 ¿Qué aprendí esta semana?

Aprendí a diagnosticar y solucionar fallas comunes en Deployments de Kubernetes, comprendiendo el ciclo de vida de las réplicas, la protección de disponibilidad en actualizaciones y las reglas de sintaxis YAML y grupos de API.
comando del día a día qu eme permiten identificar fácil el error.

---

## 2️⃣ 🧩 ¿Qué fue lo más retador y cómo lo resolví?

Lo más retador fue diagnosticar la falta de coincidencia entre spec.selector.matchLabels y spec.template.metadata.labels en el Reto 1, además de entender cómo la estrategia RollingUpdate bloquea réplicas defectuosas para garantizar la disponibilidad antes de hacer un rollback.

Tambein creo que el tema de identación es algo en lo cual cualquier persona puede fallar y más si apenas esta aprendiendo

---

## 3️⃣ 💻 Comandos y herramientas que practiqué

```bash
ROTO 01-deployment-selector-roto.yaml

Con el archivo erroneo
kubectl apply -f aportes-comunidad/soluciones-retos/karolrojas68/semana-02/2.reto-roto/01-deployment-selector-roto.yaml

<img width="549" height="44" alt="image" src="https://github.com/user-attachments/assets/834b5955-8057-48d2-9821-b041252b042b" />

Con el archivo ya corregido:
kubectl apply -f aportes-comunidad/soluciones-retos/karolrojas68/semana-02/2.reto-roto/01-deployment-selector-roto.yaml

<img width="458" height="41" alt="image" src="https://github.com/user-attachments/assets/80c7bd3c-4beb-4ccd-82a2-7c0142a6d8f3" />

<img width="247" height="29" alt="image" src="https://github.com/user-attachments/assets/9c1bb391-e101-45f0-bb8a-b703deef1be1" />

<img width="266" height="60" alt="image" src="https://github.com/user-attachments/assets/259b6958-9e05-46b9-9113-69964fe66544" />

roto  02-deployment-imagen-caida-rollback.yaml

<img width="464" height="32" alt="image" src="https://github.com/user-attachments/assets/67a7ecae-590c-4515-ac85-5e767f8bf353" />

<img width="405" height="59" alt="image" src="https://github.com/user-attachments/assets/40b07b33-c6ed-43b9-9c66-91b3ca040e1b" />

Para ver el erro a detalle, ejecute: 
kubectl describe pod -l app=tienda-online

<img width="373" height="130" alt="image" src="https://github.com/user-attachments/assets/3d1e3936-5c67-482f-bd59-59e72e27952e" />

Corregido: 

<img width="290" height="104" alt="image" src="https://github.com/user-attachments/assets/ba29aae9-c9c7-4053-bfdb-17b0f78540ac" />

Roto 03-deployment-estrategia-invalida.yaml

No reconoce la estrategia de despliegue:

<img width="503" height="58" alt="image" src="https://github.com/user-attachments/assets/b7c524d6-2a6c-4638-a893-8ed6b3c79300" />

al aplicar la corrección de identación y CamelCase

<img width="458" height="39" alt="image" src="https://github.com/user-attachments/assets/b788ee84-be52-46c2-b72f-dee95fa40877" />

Se validan los deployments:

<img width="233" height="44" alt="image" src="https://github.com/user-attachments/assets/7ff293a8-aabc-4975-8e01-9a9f2bf29834" />

Se validan los pods generados en la ap catalogo

<img width="278" height="52" alt="image" src="https://github.com/user-attachments/assets/841218d9-b399-4895-8c4c-f014eaffaece" />

ROTO 04 

Validar Error:

<img width="490" height="53" alt="image" src="https://github.com/user-attachments/assets/41f8bb67-1b54-4304-96c2-24dfc41a0af2" />


Corregido el yaml resultado

<img width="438" height="38" alt="image" src="https://github.com/user-attachments/assets/51fb1289-c68f-42b5-b156-f723ff1f370a" />

Se valida deployments correctos

<img width="287" height="46" alt="image" src="https://github.com/user-attachments/assets/9ce5bf83-7496-460f-b02a-372ef3e44710" />

Se validan pods de la app de pagos

<img width="376" height="61" alt="image" src="https://github.com/user-attachments/assets/068be5f0-3f81-4666-b29a-c3d72061e156" />
```

---

## 4️⃣ 🚀 Aplicación real y próximos pasos

Aplicaré este conocimiento para estructurar estrategias de despliegue progresivo (RollingUpdates) para disminución de caídas de los servicios

---

<div align="center">
  <sub>🏔️☕ Bitácora registrada en <b><a href="https://github.com/edwinbermudez91/Fundamentos-Kubernetes">De Cero a Capitán en Kubernetes — Cloud Native Medellín (CNCF)</a></b></sub>
</div>
