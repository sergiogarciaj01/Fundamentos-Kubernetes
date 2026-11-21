#!/usr/bin/env node
/**
 * Script generador del Muro de Asistentes (ASISTENTES.md), del Mosaico Visual en README.md
 * y de los Portafolios Profesionales de Aprendizaje (aportes-comunidad/soluciones-retos/<usuario>/README.md)
 * a partir de asistentes.json, las soluciones validadas de 2.reto-roto/ y las bitácoras semanales (bitacora.md).
 *
 * - Excluye al dueño/instructor (edwinbermudez91) y colaboradores de la tabla de puntajes y los muestra como Equipo Organizador.
 * - Valida que cada archivo entregado corresponda realmente al ejercicio de 2.reto-roto/ y tenga la solución aplicada.
 * - Genera automáticamente el Portafolio Profesional KubeCafé (Cloud Native Medellín) con insignias compartibles para cada estudiante activo.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const JSON_PATH = path.join(ROOT, 'asistentes.json');
const MD_PATH = path.join(ROOT, 'ASISTENTES.md');
const README_PATH = path.join(ROOT, 'README.md');
const SOLUCIONES_DIR = path.join(ROOT, 'aportes-comunidad', 'soluciones-retos');
const INSIGNIAS_DIR = path.join(ROOT, 'recursos', 'insignias');
const REPO_URL = 'https://github.com/edwinbermudez91/Fundamentos-Kubernetes';

const INSTRUCTORS = ['edwinbermudez91', 'santiago1023', 'vdevalen', 'andresqb198', 'ka1999'];

const WEEK_METADATA = {
  'semana-00': {
    title: '🐳 Semana 00: Fundamentos de Docker (De Código a Contenedor)',
    shortBadge: '🐳_Docker_&_OCI',
    color: '2496ED',
    logo: 'docker',
    skills: 'Dockerfile, imágenes OCI, seguridad rootless, .dockerignore y redes en contenedores'
  },
  'semana-01': {
    title: '🌱 Semana 01: Arquitectura de Kubernetes y Pods',
    shortBadge: '🌱_K8s_Pods_&_Arquitectura',
    color: '326CE5',
    logo: 'kubernetes',
    skills: 'Control Plane, Worker Nodes, kubectl, diagnóstico de Pods (ImagePullBackOff, CrashLoopBackOff, Pending)'
  },
  'semana-02': {
    title: '🔄 Semana 02: Deployments, Réplicas y Autorreparación',
    shortBadge: '🔄_K8s_Deployments_&_Rollouts',
    color: '10B981',
    logo: 'kubernetes',
    skills: 'ReplicaSets, Deployments, Self-Healing, Rolling Updates con cero caídas y Rollbacks'
  },
  'semana-03': {
    title: '🌐 Semana 03: Redes en Kubernetes (Services y Gateway API)',
    shortBadge: '🌐_K8s_Services_&_Gateway_API',
    color: '06B6D4',
    logo: 'kubernetes',
    skills: 'ClusterIP, NodePort, CoreDNS y enrutamiento HTTP moderno con Gateway API (Gateway y HTTPRoute)'
  },
  'semana-04': {
    title: '💾 Semana 04: Configuración y Datos Persistentes',
    shortBadge: '💾_K8s_Config_&_Storage',
    color: '8B5CF6',
    logo: 'kubernetes',
    skills: 'ConfigMaps, Secrets, PersistentVolumes (PV) y PersistentVolumeClaims (PVC)'
  },
  'semana-05': {
    title: '🛡️ Semana 05: Salud, Límites y Seguridad (RBAC)',
    shortBadge: '🛡️_K8s_Security_&_Probes',
    color: 'F59E0B',
    logo: 'kubernetes',
    skills: 'Liveness/Readiness Probes, Resource Requests/Limits y control de acceso RBAC'
  },
  'semana-06': {
    title: '🎓 Semana 06: Empaquetado con Helm y Proyecto Final KubeCafé',
    shortBadge: '🎓_Helm_&_Arquitectura_K8s',
    color: 'EC4899',
    logo: 'helm',
    skills: 'Helm Charts, plantillas parametrizadas y despliegue multicapa de alta disponibilidad'
  }
};

const BITACORA_DROPDOWN_OPTIONS = {
  'semana-00': 'semana-00 — 🐳 Fundamentos de Docker (De Código a Contenedor)',
  'semana-01': 'semana-01 — 🌱 Arquitectura de Kubernetes y Pods',
  'semana-02': 'semana-02 — 🔄 Deployments, Réplicas y Autorreparación',
  'semana-03': 'semana-03 — 🌐 Redes en K8s: Services y Gateway API',
  'semana-04': 'semana-04 — 💾 Configuración y Datos Persistentes (ConfigMaps, Secrets, PV)',
  'semana-05': 'semana-05 — 🛡️ Salud, Límites y Seguridad (Probes, Quotas, RBAC)',
  'semana-06': 'semana-06 — 🎓 Empaquetado con Helm y Proyecto Final KubeCafé'
};

function buildBitacoraIssueUrl(githubUser = '', weekKey = '') {
  const params = new URLSearchParams({ template: 'bitacora-semanal.yml' });
  const cleanUser = cleanGithubUser(githubUser);
  if (cleanUser) {
    params.set('github_user', cleanUser);
  }
  if (weekKey && BITACORA_DROPDOWN_OPTIONS[weekKey]) {
    params.set('semana', BITACORA_DROPDOWN_OPTIONS[weekKey]);
  }
  return `${REPO_URL}/issues/new?${params.toString()}`;
}

function cleanGithubUser(input, fallbackUser = '') {
  if (!input) return fallbackUser;
  let val = input.trim();
  if (
    !val ||
    val.toLowerCase() === '_no response_' ||
    val.toLowerCase() === 'no response' ||
    val.toLowerCase() === 'tu-usuario' ||
    val.toLowerCase().includes('tu-usuario')
  ) {
    return fallbackUser;
  }
  val = val.replace(/^https?:\/\/(www\.)?github\.com\//i, '');
  val = val.split(/[/?#]/)[0];
  val = val.replace(/\.png$/i, '');
  val = val.replace(/^@/, '').trim();
  return val || fallbackUser;
}

function cleanLinkedin(url) {
  if (!url) return '';
  let trimmed = url.trim();
  if (
    !trimmed ||
    trimmed.toLowerCase() === '_no response_' ||
    trimmed.toLowerCase() === 'no response' ||
    trimmed.toLowerCase() === 'n/a' ||
    trimmed.toLowerCase() === 'ninguno' ||
    trimmed.includes('tu-perfil') ||
    trimmed.includes('tu-usuario')
  ) {
    return '';
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    if (trimmed.startsWith('www.linkedin.com') || trimmed.startsWith('linkedin.com')) {
      trimmed = 'https://' + trimmed;
    } else if (!trimmed.includes('/')) {
      trimmed = `https://www.linkedin.com/in/${trimmed}`;
    } else {
      trimmed = 'https://' + trimmed;
    }
  }
  return trimmed;
}

function parseExtraSocialLinks(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map(s => String(s).trim()).filter(Boolean);
  }
  const str = String(input).trim();
  if (
    !str ||
    str.toLowerCase() === '_no response_' ||
    str.toLowerCase() === 'no response' ||
    str.toLowerCase() === 'n/a' ||
    str.toLowerCase() === 'ninguna' ||
    str.toLowerCase() === 'ninguno'
  ) {
    return [];
  }
  return str
    .split(/[\r\n,;]+|\s+(?=https?:\/\/)/)
    .map(s => s.trim())
    .filter(s => s && !s.includes('tu-usuario') && !s.includes('tu-portafolio'))
    .map(s => (/^https?:\/\//i.test(s) ? s : `https://${s}`));
}

function buildSocialBadge(url) {
  const lower = url.toLowerCase();
  if (lower.includes('x.com/') || lower.includes('twitter.com/')) {
    return `[![X](https://img.shields.io/badge/X-000000?style=flat-square&logo=x&logoColor=white)](${url})`;
  }
  if (lower.includes('instagram.com/')) {
    return `[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=flat-square&logo=instagram&logoColor=white)](${url})`;
  }
  if (lower.includes('youtube.com/') || lower.includes('youtu.be/')) {
    return `[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=flat-square&logo=youtube&logoColor=white)](${url})`;
  }
  if (lower.includes('dev.to/')) {
    return `[![Dev.to](https://img.shields.io/badge/dev.to-0A0A0A?style=flat-square&logo=devdotto&logoColor=white)](${url})`;
  }
  if (lower.includes('medium.com/')) {
    return `[![Medium](https://img.shields.io/badge/Medium-12100E?style=flat-square&logo=medium&logoColor=white)](${url})`;
  }
  if (lower.includes('gitlab.com/')) {
    return `[![GitLab](https://img.shields.io/badge/GitLab-FC6D26?style=flat-square&logo=gitlab&logoColor=white)](${url})`;
  }
  if (lower.includes('twitch.tv/')) {
    return `[![Twitch](https://img.shields.io/badge/Twitch-9146FF?style=flat-square&logo=twitch&logoColor=white)](${url})`;
  }
  if (lower.includes('facebook.com/')) {
    return `[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=flat-square&logo=facebook&logoColor=white)](${url})`;
  }
  if (lower.includes('tiktok.com/')) {
    return `[![TikTok](https://img.shields.io/badge/TikTok-000000?style=flat-square&logo=tiktok&logoColor=white)](${url})`;
  }
  if (lower.includes('bsky.app/')) {
    return `[![Bluesky](https://img.shields.io/badge/Bluesky-0285FF?style=flat-square&logo=bluesky&logoColor=white)](${url})`;
  }
  return `[![Web](https://img.shields.io/badge/Web-4285F4?style=flat-square&logo=google-chrome&logoColor=white)](${url})`;
}

/**
 * Elimina líneas de comentarios (# ...) para validar únicamente las instrucciones reales del Dockerfile o YAML.
 */
function stripComments(text) {
  return text
    .split(/\r?\n/)
    .map(line => line.replace(/#.*$/, '').trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * Reglas de validación de contenido real para cada reto roto del repositorio.
 * Evita que alguien suba un archivo cualquiera o deje el reto sin arreglar.
 */
const CHALLENGE_VALIDATORS = {
  'semana-00': [
    {
      id: '01',
      name: '01-dockerfile-roto',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          return /FROM\s+nginx/i.test(code) && /daemon\s+off/i.test(code);
        })
    },
    {
      id: '02',
      name: '02-variable-entorno-faltante',
      validate: (files, weekPath) => {
        if (files.some(f => /ENV\s+APP_SECRET_TOKEN/i.test(stripComments(f.content)))) {
          return true;
        }
        if (weekPath && fs.existsSync(weekPath)) {
          const reto02Dir = fs
            .readdirSync(weekPath, { withFileTypes: true })
            .find(d => d.isDirectory() && /0?2/.test(d.name));
          if (reto02Dir) {
            const readmePath = path.join(weekPath, reto02Dir.name, 'README.md');
            if (fs.existsSync(readmePath)) {
              const md = fs.readFileSync(readmePath, 'utf8');
              return /APP_SECRET_TOKEN/i.test(md) && /(-e\b|--env\b|--env-file\b|env_file)/i.test(md);
            }
          }
        }
        return false;
      }
    },
    {
      id: '03',
      name: '03-contenedor-como-root',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto03File =
            /0?3/.test(f.relPath) || /RETO\s*3/i.test(f.content) || /root/i.test(f.relPath);
          return (
            isReto03File &&
            /FROM\s+python/i.test(code) &&
            /USER\s+(appuser|10001)/i.test(code)
          );
        })
    },
    {
      id: '04',
      name: '04-dockerignore-y-archivos-secretos',
      validate: files => {
        const hasDockerignore = files.some(
          f =>
            f.relPath.toLowerCase().includes('dockerignore') &&
            /\.env/.test(stripComments(f.content))
        );
        const hasFixedDockerfile = files.some(f => {
          const code = stripComments(f.content);
          const isReto04 = /0?4/.test(f.relPath) || /RETO\s*4/i.test(f.content) || /leak/i.test(f.content);
          return isReto04 && /COPY\s+(--chown=\S+\s+)?app\.py/i.test(code) && !/COPY\s+\.\s+\./i.test(code);
        });
        return hasDockerignore || hasFixedDockerfile;
      }
    },
    {
      id: '05',
      name: '05-puerto-y-host-desalineado',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto05 = /0?5/.test(f.relPath) || /app\.py$/i.test(f.relPath) || /RETO\s*5/i.test(f.content);
          return isReto05 && /0\.0\.0\.0/.test(code) && /8080/.test(code);
        })
    }
  ],
  'semana-01': [
    {
      id: '01',
      name: '01-pod-con-errores',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto01 = /name:\s*reto-01-imagen/.test(code) || /0?1/.test(f.relPath);
          const standardNginx =
            /image:\s*nginx:(latest|alpine|1\.\d+)/.test(code) && /containerPort:\s*80\b/.test(code);
          const unprivilegedNginx =
            /image:\s*nginxinc\/nginx-unprivileged\b/.test(code) && /containerPort:\s*8080\b/.test(code);
          return (
            isReto01 &&
            /kind:\s*Pod/.test(code) &&
            !code.includes('version-fantasma-999') &&
            !code.includes('80809') &&
            (standardNginx || unprivilegedNginx)
          );
        })
    },
    {
      id: '02',
      name: '02-pod-crashloop',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto02 = /name:\s*reto-02-crash/.test(code) || /0?2/.test(f.relPath);
          return (
            isReto02 &&
            /kind:\s*Pod/.test(code) &&
            /\becho\b/.test(code) &&
            !code.includes('echho')
          );
        })
    },
    {
      id: '03',
      name: '03-pod-pendiente-infinito',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto03 = /name:\s*reto-03-exigente/.test(code) || /0?3/.test(f.relPath);
          return (
            isReto03 &&
            /kind:\s*Pod/.test(code) &&
            /memory:/.test(code) &&
            !code.includes('500Gi') &&
            !code.includes('"64"')
          );
        })
    },
    {
      id: '04',
      name: '04-pod-yaml-molesto',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto04 = /name:\s*reto-04-sintaxis/.test(code) || /0?4/.test(f.relPath);
          return (
            isReto04 &&
            /apiVersion:\s*v1\b/.test(code) &&
            !code.includes('apiVersion: v2') &&
            /image:\s*nginx/.test(code) &&
            !code.includes('imaeg:') &&
            /containerPort:\s*80\b/.test(code)
          );
        })
    }
  ],
  'semana-02': [
    {
      id: '01',
      name: '01-deployment-selector-roto',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto01 = /reto-?01|kubecafe-pedidos-api/.test(code) || /0?1/.test(f.relPath);
          return (
            isReto01 &&
            /kind:\s*Deployment/.test(code) &&
            !code.includes('etiqueta-equivocada-web') &&
            /app:\s*cafeteriamovil-api/.test(code)
          );
        })
    },
    {
      id: '02',
      name: '02-deployment-imagen-caida-rollback',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto02 = /reto-?02|kubecafe-checkout-v2/.test(code) || /0?2/.test(f.relPath);
          return (
            isReto02 &&
            /kind:\s*Deployment/.test(code) &&
            !code.includes('version-fantasma-prod-999') &&
            /image:\s*nginx/.test(code)
          );
        })
    },
    {
      id: '03',
      name: '03-deployment-estrategia-invalida',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto03 = /reto-?03|kubecafe-notificaciones/.test(code) || /0?3/.test(f.relPath);
          return (
            isReto03 &&
            /kind:\s*Deployment/.test(code) &&
            !code.includes('Rollingupdates') &&
            /type:\s*RollingUpdate/.test(code) &&
            /rollingUpdate:/.test(code)
          );
        })
    },
    {
      id: '04',
      name: '04-deployment-yaml-identacion',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto04 = /reto-?04|kubecafe-fidelizacion/.test(code) || /0?4/.test(f.relPath);
          return (
            isReto04 &&
            /kind:\s*Deployment/.test(code) &&
            !/apiVersion:\s*v1\b/.test(code) &&
            /apiVersion:\s*apps\/v1/.test(code) &&
            /replicas:\s*2/.test(code)
          );
        })
    }
  ],
  'semana-03': [
    {
      id: '01',
      name: '01-service-selector-roto',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto01 = /reto-?01|barra-svc|kubecafe-barra/.test(code) || /0?1/.test(f.relPath);
          return (
            isReto01 &&
            /kind:\s*Service/.test(code) &&
            !code.includes('barra-equivocada') &&
            /app:\s*kubecafe-barra/.test(code)
          );
        })
    },
    {
      id: '02',
      name: '02-service-targetport-incorrecto',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto02 = /reto-?02|caja-svc|kubecafe-caja/.test(code) || /0?2/.test(f.relPath);
          return (
            isReto02 &&
            /kind:\s*Service/.test(code) &&
            !/targetPort:\s*9090\b/.test(code) &&
            /targetPort:\s*80\b/.test(code)
          );
        })
    },
    {
      id: '03',
      name: '03-nodeport-fuera-de-rango',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto03 = /reto-?03|vitrina-svc/.test(code) || /0?3/.test(f.relPath);
          const match = code.match(/nodePort:\s*(\d+)/);
          const port = match ? parseInt(match[1], 10) : 0;
          return (
            isReto03 &&
            /kind:\s*Service/.test(code) &&
            /type:\s*NodePort/.test(code) &&
            port >= 30000 &&
            port <= 32767
          );
        })
    },
    {
      id: '04',
      name: '04-httproute-parentref-roto',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto04 = /reto-?04|kubecafe-api-route/.test(code) || /0?4/.test(f.relPath);
          return (
            isReto04 &&
            /kind:\s*HTTPRoute/.test(code) &&
            !code.includes('gateway-fantasma') &&
            /kubecafe-gateway/.test(code) &&
            /port:\s*80\b/.test(code)
          );
        })
    }
  ],
  'semana-04': [
    {
      id: '01',
      name: '01-configmap-clave-inexistente',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto01 = /reto-?01|barista-reto-01|menu-precios-cfg/.test(code) || /0?1/.test(f.relPath);
          return (
            isReto01 &&
            /kind:\s*ConfigMap/.test(code) &&
            !code.includes('PRECIO_ESPRESSO') &&
            /key:\s*(PRECIO_TINTO|MONEDA)\b/.test(code)
          );
        })
    },
    {
      id: '02',
      name: '02-secret-base64-roto',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto02 = /reto-?02|caja-reto-02|credenciales-kubecafe/.test(code) || /0?2/.test(f.relPath);
          return (
            isReto02 &&
            /kind:\s*Secret/.test(code) &&
            !code.includes('secreto-inexistente') &&
            !code.includes('TOKEN_SECRETO') &&
            /name:\s*credenciales-kubecafe\b/.test(code) &&
            /key:\s*API_TOKEN\b/.test(code)
          );
        })
    },
    {
      id: '03',
      name: '03-pvc-pendiente-storageclass',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto03 = /reto-?03|bodega-reto-03/.test(code) || /0?3/.test(f.relPath);
          return (
            isReto03 &&
            /kind:\s*PersistentVolumeClaim/.test(code) &&
            !code.includes('ssd-ultra-inexistente') &&
            !code.includes('50Gi') &&
            /storageClassName:\s*manual\b/.test(code)
          );
        })
    },
    {
      id: '04',
      name: '04-volumen-mountpath-roto',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto04 = /reto-?04|pod-volumen-reto-04/.test(code) || /0?4/.test(f.relPath);
          return (
            isReto04 &&
            /kind:\s*Pod/.test(code) &&
            (/volumeMounts:[\s\S]*name:\s*volumen-bodega\b/.test(code) ||
              /volumes:[\s\S]*name:\s*datos-kubecafe\b/.test(code))
          );
        })
    },
    {
      id: '05',
      name: '05-configmap-volumen-roto',
      validate: files =>
        files.some(f => {
          const code = stripComments(f.content);
          const isReto05 = /reto-?05|web-reto-05|menu-html-reto-05/.test(code) || /0?5/.test(f.relPath);
          return (
            isReto05 &&
            /kind:\s*ConfigMap/.test(code) &&
            ((/pagina\.html:/.test(code) && /key:\s*pagina\.html\b/.test(code)) ||
              (/menu\.html:/.test(code) && /key:\s*menu\.html\b/.test(code)))
          );
        })
    }
  ]
};

/**
 * Descubre automáticamente las semanas en el repositorio y combina con los validadores de contenido.
 */
function discoverOfficialChallenges() {
  const weeks = {};
  const entries = fs.readdirSync(ROOT, { withFileTypes: true });
  for (const dir of entries) {
    if (!dir.isDirectory()) continue;
    const match = dir.name.match(/^(semana-\d+)/i);
    if (!match) continue;
    const weekKey = match[1].toLowerCase();
    if (CHALLENGE_VALIDATORS[weekKey]) {
      weeks[weekKey] = CHALLENGE_VALIDATORS[weekKey].map(c => c.id);
      continue;
    }
    const retoDir = path.join(ROOT, dir.name, '2.reto-roto');
    if (!fs.existsSync(retoDir)) continue;
    const items = fs.readdirSync(retoDir);
    const challengeNums = [];
    for (const item of items) {
      const m = item.match(/^(\d{2})-/);
      if (m && !challengeNums.includes(m[1])) {
        challengeNums.push(m[1]);
      }
    }
    challengeNums.sort();
    if (challengeNums.length > 0) {
      weeks[weekKey] = challengeNums;
    }
  }
  return weeks;
}

function listFilesRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  let results = [];
  const list = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of list) {
    if (entry.name === '.git' || entry.name === '.DS_Store') continue;
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(listFilesRecursive(fullPath));
    } else {
      const lower = entry.name.toLowerCase();
      if (lower !== 'readme.md' && lower !== 'bitacora.md') {
        results.push(fullPath);
      }
    }
  }
  return results;
}

/**
 * Evalúa los ejercicios resueltos y las bitácoras de un estudiante en aportes-comunidad/soluciones-retos/<usuario>/
 */
function evaluateUserProgress(githubUser, officialChallenges) {
  const cleanUser = cleanGithubUser(githubUser);
  let points = 10; // 10 XP base por registrarse
  let completedWeeksCount = 0;
  let totalSolvedChallenges = 0;
  let totalBitacoras = 0;
  const weekSummaries = [];
  const detailedReport = [];

  let userSolDir = null;
  let userFolderName = null;
  if (fs.existsSync(SOLUCIONES_DIR)) {
    const dirs = fs.readdirSync(SOLUCIONES_DIR, { withFileTypes: true });
    const found = dirs.find(d => d.isDirectory() && d.name.toLowerCase() === cleanUser.toLowerCase());
    if (found) {
      userSolDir = path.join(SOLUCIONES_DIR, found.name);
      userFolderName = found.name;
    }
  }

  for (const [weekKey, expectedNums] of Object.entries(officialChallenges)) {
    const totalExpected = expectedNums.length;
    let solvedCount = 0;
    let hasBitacora = false;
    let weekDirName = weekKey;
    const missingNums = [];
    const solvedNums = [];

    if (userSolDir) {
      const weekDirs = fs.readdirSync(userSolDir, { withFileTypes: true });
      const matchingWeekDir = weekDirs.find(
        d => d.isDirectory() && d.name.toLowerCase().startsWith(weekKey)
      );
      if (matchingWeekDir) {
        weekDirName = matchingWeekDir.name;
        const weekPath = path.join(userSolDir, matchingWeekDir.name);
        const bitacoraFile = path.join(weekPath, 'bitacora.md');
        if (fs.existsSync(bitacoraFile) && fs.readFileSync(bitacoraFile, 'utf8').trim().length > 40) {
          hasBitacora = true;
          totalBitacoras += 1;
        }

        const filePaths = listFilesRecursive(weekPath);
        const files = filePaths.map(fp => ({
          relPath: path.relative(weekPath, fp),
          content: fs.readFileSync(fp, 'utf8')
        }));

        const validators = CHALLENGE_VALIDATORS[weekKey];
        if (validators) {
          for (const v of validators) {
            if (v.validate(files, weekPath)) {
              solvedNums.push(v.id);
            } else {
              missingNums.push(`${v.id} (${v.name})`);
            }
          }
          solvedCount = solvedNums.length;
        } else {
          for (const num of expectedNums) {
            const numInt = parseInt(num, 10);
            const regex = new RegExp(`(^|[^0-9])(0?${numInt})([^0-9]|$)`);
            if (files.some(f => regex.test(f.relPath) && stripComments(f.content).length > 10)) {
              solvedNums.push(num);
            } else {
              missingNums.push(num);
            }
          }
          solvedCount = solvedNums.length;
        }
      } else {
        missingNums.push(...expectedNums);
      }
    } else {
      missingNums.push(...expectedNums);
    }

    const isComplete = solvedCount === totalExpected && totalExpected > 0;
    const shortLabel = weekKey.replace('semana-', 'Sem ');
    const bitacoraTag = hasBitacora ? ' 📔' : '';

    if (hasBitacora) {
      points += 10; // +10 XP bonus por documentar bitácora semanal
    }

    if (solvedCount > 0) {
      points += solvedCount * 10; // +10 XP por cada reto roto validado
      totalSolvedChallenges += solvedCount;
      if (isComplete) {
        completedWeeksCount += 1;
        weekSummaries.push(`✅ ${shortLabel}: ${solvedCount}/${totalExpected}${bitacoraTag}`);
      } else {
        weekSummaries.push(`⏳ ${shortLabel}: ${solvedCount}/${totalExpected}${bitacoraTag}`);
      }
    } else if (hasBitacora) {
      weekSummaries.push(`📔 ${shortLabel}: Bitácora (+10 XP)`);
    }

    detailedReport.push({
      weekKey,
      weekDirName,
      solvedCount,
      totalExpected,
      isComplete,
      hasBitacora,
      solvedNums,
      missingNums
    });
  }

  // También revisar si hay bitácoras en semanas futuras (ej. semana-03..06) que aún no tengan validadores activos
  if (userSolDir) {
    const weekDirs = fs.readdirSync(userSolDir, { withFileTypes: true });
    for (const d of weekDirs) {
      if (!d.isDirectory()) continue;
      const m = d.name.match(/^(semana-\d+)/i);
      if (!m) continue;
      const wk = m[1].toLowerCase();
      if (officialChallenges[wk]) continue;
      const bFile = path.join(userSolDir, d.name, 'bitacora.md');
      if (fs.existsSync(bFile) && fs.readFileSync(bFile, 'utf8').trim().length > 40) {
        totalBitacoras += 1;
        points += 10; // +10 XP bonus por documentar bitácora semanal
        const shortLabel = wk.replace('semana-', 'Sem ');
        weekSummaries.push(`📔 ${shortLabel}: Bitácora (+10 XP)`);
        detailedReport.push({
          weekKey: wk,
          weekDirName: d.name,
          solvedCount: 0,
          totalExpected: 4,
          isComplete: false,
          hasBitacora: true,
          solvedNums: [],
          missingNums: []
        });
      }
    }
  }

  let rango = '⛵ Marinero';
  if (completedWeeksCount >= 6) {
    rango = '⚓ Capitán K8s';
  } else if (completedWeeksCount >= 2) {
    rango = '🧭 Timonel';
  }

  const summaryText =
    weekSummaries.length > 0
      ? `**${points} XP** (${weekSummaries.join(' • ')})`
      : `**${points} XP** (Registro inicial)`;

  return {
    points,
    completedWeeksCount,
    totalSolvedChallenges,
    totalBitacoras,
    rango,
    summaryText,
    detailedReport,
    hasPortfolioDir: Boolean(userSolDir),
    userFolderName: userFolderName || cleanUser
  };
}

/**
 * Construye enlaces y textos pre-armados para compartir en LinkedIn, Instagram, YouTube, WhatsApp y Telegram.
 */
function buildShareLinks(user, nombre, rango, points, hasPortfolioDir = false, folderName = '') {
  const cleanUser = cleanGithubUser(user);
  const targetFolder = folderName || cleanUser;
  const portfolioUrl = hasPortfolioDir
    ? `${REPO_URL}/tree/main/aportes-comunidad/soluciones-retos/${targetFolder}`
    : `${REPO_URL}/blob/main/ASISTENTES.md`;

  const rankBadgeUrl =
    rango.includes('Capitán')
      ? `https://img.shields.io/badge/KubeCafé_CNCF-⚓_Capitán_K8s_(${points}_XP)-f59e0b?style=for-the-badge&logo=kubernetes&logoColor=white`
      : rango.includes('Timonel')
        ? `https://img.shields.io/badge/KubeCafé_CNCF-🧭_Timonel_K8s_(${points}_XP)-7c3aed?style=for-the-badge&logo=kubernetes&logoColor=white`
        : `https://img.shields.io/badge/KubeCafé_CNCF-⛵_Tripulante_K8s_(${points}_XP)-0284c7?style=for-the-badge&logo=kubernetes&logoColor=white`;

  // U+2800 (Braille blank): Carácter invisible que obliga al editor de LinkedIn a respetar saltos y párrafos sin unirlos
  const B = '⠀';

  const shareMessage = [
    `☸️ ¡Sigo construyendo mi Portafolio Práctico de Docker y Kubernetes en el workshop "De Cero a Capitán en Kubernetes" con la comunidad Cloud Native Medellín (CNCF)! 🏔️☕`,
    B,
    `🎖️ Rango actual: ${rango} (${points} XP)`,
    B,
    `📂 Mi Portafolio de Laboratorios y Bitácora verificada:`,
    `${portfolioUrl}`,
    B,
    `Agradecimientos a @Cloud Native Colombia (Armenia, Bogota, Cali, Medellin) por este espacio de formación abierta:`,
    B,
    `🏢 LinkedIn: https://www.linkedin.com/company/cloud-native-colombia/`,
    B,
    `📸 Instagram: https://www.instagram.com/colombiacloudnative/`,
    B,
    `▶️ YouTube: https://www.youtube.com/@CloudNativeColombia`,
    B,
    `🔗 Capítulo oficial CNCF: https://ocgroups.dev/cncf/group/2majk4r`,
    B,
    `#Kubernetes #Docker #CloudNative #DevOps #KubeCafe #CNCFMedellin #OpenSource`
  ].join('\n');

  const linkedinShareUrl = 'https://www.linkedin.com/feed/?shareActive=true';
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(portfolioUrl)}&text=${encodeURIComponent(
    `☸️ Mi Portafolio Práctico de Docker y Kubernetes en Cloud Native Medellín (${rango} • ${points} XP) 🏔️☕`
  )}`;

  const instagramShareUrl = 'https://www.instagram.com/colombiacloudnative/';
  const youtubeShareUrl = 'https://www.youtube.com/@CloudNativeColombia';
  const linkedinCompanyUrl = 'https://www.linkedin.com/company/cloud-native-colombia/';

  const badgesBar = [
    `[![Publicar en LinkedIn](https://img.shields.io/badge/Publicar_en-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](${linkedinShareUrl})`,
    `[![Instagram @colombiacloudnative](https://img.shields.io/badge/Instagram-@colombiacloudnative-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](${instagramShareUrl})`,
    `[![YouTube @CloudNativeColombia](https://img.shields.io/badge/YouTube-@CloudNativeColombia-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](${youtubeShareUrl})`,
    `[![LinkedIn Comunidad](https://img.shields.io/badge/LinkedIn-Cloud_Native_Colombia-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](${linkedinCompanyUrl})`,
    `[![Compartir en WhatsApp](https://img.shields.io/badge/Compartir_en-WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](${whatsappShareUrl})`,
    `[![Compartir en Telegram](https://img.shields.io/badge/Compartir_en-Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](${telegramShareUrl})`
  ].join(' ');

  const githubProfileSnippet = `[![Portafolio Kubernetes KubeCafé](${rankBadgeUrl})](${portfolioUrl})`;

  return {
    portfolioUrl,
    rankBadgeUrl,
    shareMessage,
    linkedinShareUrl,
    instagramShareUrl,
    youtubeShareUrl,
    linkedinCompanyUrl,
    whatsappShareUrl,
    telegramShareUrl,
    badgesBar,
    githubProfileSnippet
  };
}

/**
 * Genera el archivo README.md del Portafolio Profesional de Aprendizaje dentro de
 * aportes-comunidad/soluciones-retos/<usuario>/README.md
 */
function generateStudentPortfolioReadme(student, evalResult) {
  const user = cleanGithubUser(student.github);
  const folderName = evalResult.userFolderName || user;
  const userDir = path.join(SOLUCIONES_DIR, folderName);
  if (!fs.existsSync(userDir)) return;

  const nombre = (student.nombre || user).trim();
  const rol = (student.rol || 'Tripulante Cloud Native').trim();
  const rango = evalResult.rango;
  const points = evalResult.points;
  const motivacion = (student.motivacion || 'Dominar contenedores y Kubernetes desde la práctica.').trim();
  const share = buildShareLinks(user, nombre, rango, points, true, folderName);
  const moduleStates = Object.entries(WEEK_METADATA).map(([wk, meta]) => {
    const rep = evalResult.detailedReport.find(r => r.weekKey === wk);
    let state = 'bloqueado';
    if (rep && rep.isComplete) {
      state = 'completado';
    } else if (rep && (rep.solvedCount > 0 || rep.hasBitacora)) {
      state = 'progreso';
    }
    return { wk, meta, rep, state };
  });
  const badgesParam = moduleStates.map(m => `${m.wk}:${m.state}`).join(',');
  const linkedin = cleanLinkedin(student.linkedin);
  const extraSocials = parseExtraSocialLinks(student.redes);
  const completedMods = evalResult.detailedReport
    .filter(r => r.isComplete || r.solvedCount > 0)
    .map(r => (WEEK_METADATA[r.weekKey]?.shortBadge || r.weekKey).replace(/_/g, ' '));
  const cardGeneratorUrl = `https://edwinbermudez91.github.io/Fundamentos-Kubernetes/recursos/tarjeta-portafolio.html?user=${encodeURIComponent(user)}&nombre=${encodeURIComponent(nombre)}&rol=${encodeURIComponent(rol)}&rango=${encodeURIComponent(rango)}&xp=${encodeURIComponent(String(points))}&retos=${encodeURIComponent(String(evalResult.totalSolvedChallenges))}&bitacoras=${encodeURIComponent(String(evalResult.totalBitacoras))}&semanas=${encodeURIComponent(completedMods.join(','))}&badges=${encodeURIComponent(badgesParam)}&linkedin=${encodeURIComponent(linkedin || '')}&redes=${encodeURIComponent(extraSocials.join(','))}&portfolio=${encodeURIComponent(`${REPO_URL}/tree/main/aportes-comunidad/soluciones-retos/${folderName}`)}`;

  // Insignias de módulos KubeCafé (SVG)
  const moduleBadges = moduleStates.map(({ wk, meta, rep, state }) => {
    const badgeSrc = `../../../recursos/insignias/${wk}-${state}.svg`;
    const weekFolderExists = rep && fs.existsSync(path.join(userDir, rep.weekDirName));
    const targetHref = weekFolderExists ? `./${rep.weekDirName}` : '#-evidencias-técnicas-y-laboratorios-resueltos-en--kubecafé';
    return `<a href="${targetHref}" title="${meta.title}"><img src="${badgeSrc}" width="175" alt="${meta.title}"/></a>`;
  });

  // Filas de progreso técnico por semana (tabla limpia de 4 columnas)
  const tableRows = Object.entries(WEEK_METADATA).map(([wk, meta]) => {
    const rep = evalResult.detailedReport.find(r => r.weekKey === wk);
    const weekFolderExists = fs.existsSync(path.join(userDir, rep ? rep.weekDirName : wk));
    const folderLink = weekFolderExists ? `[📂 Código](./${rep ? rep.weekDirName : wk})` : '—';

    const solved = rep ? rep.solvedCount : 0;
    const total = rep ? rep.totalExpected : 0;
    const filledBlocks = total > 0 ? Math.round((solved / total) * 5) : 0;
    const emptyBlocks = Math.max(0, 5 - filledBlocks);

    let progressCell = `⬜⬜⬜⬜⬜<br/><sub>⚪ Pendiente</sub>`;
    if (rep && rep.isComplete) {
      progressCell = `${'🟩'.repeat(5)}<br/><sub>✅ <b>${solved}/${total}</b> · <code>+${solved * 10} XP</code></sub>`;
    } else if (solved > 0) {
      progressCell = `${'🟨'.repeat(filledBlocks)}${'⬜'.repeat(emptyBlocks)}<br/><sub>⏳ <b>${solved}/${total}</b> · <code>+${solved * 10} XP</code></sub>`;
    }

    const bitacoraLink =
      rep && rep.hasBitacora
        ? `[📔 Leer](./${rep.weekDirName}/bitacora.md)`
        : `[➕ Crear](${buildBitacoraIssueUrl(user, wk)})`;

    return `| **${meta.title}**<br/><sub>${meta.skills}</sub> | ${progressCell} | ${folderLink} | ${bitacoraLink} |`;
  });

  // Listar bitácoras escritas para mostrarlas destacadas
  const bitacoraItems = evalResult.detailedReport
    .filter(r => r.hasBitacora)
    .map(r => {
      const meta = WEEK_METADATA[r.weekKey] || { title: r.weekKey };
      return `- 📔 **[${meta.title}](./${r.weekDirName}/bitacora.md)** *(+10 XP Bonus)* — *Reflexión técnica, diagnóstico de errores y comandos practicados.*`;
    });

  const nextMissingBitacora = evalResult.detailedReport.find(r => !r.hasBitacora);
  const quickBitacoraUrl = buildBitacoraIssueUrl(user, nextMissingBitacora ? nextMissingBitacora.weekKey : 'semana-01');

  const bitacorasSection =
    bitacoraItems.length > 0
      ? bitacoraItems.join('\n')
      : `> 💡 *¡Suma **+10 XP Bonus** por semana! Haz clic en **[📔 Registrar mi Bitácora de Aprendizaje en 20 segundos](${quickBitacoraUrl})** para documentar lo que aprendiste y obtener un post personalizado para LinkedIn.*`;

  const socialLinksBar = [
    `[![GitHub](https://img.shields.io/badge/GitHub-@${user}-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/${user})`
  ];
  if (linkedin) {
    socialLinksBar.push(
      `[![LinkedIn](https://img.shields.io/badge/LinkedIn-Conectar-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](${linkedin})`
    );
  }

  const content = `<div align="center">

<img src="../../../recursos/insignias/banner-portafolio.svg" width="100%" alt="Portafolio Cloud Native &amp; Kubernetes — CNCF Medellín"/>

<br/>

<img src="https://github.com/${user}.png?size=220" width="110" height="110" alt="${user}"/><br/>

## ${nombre}
**${rol}** • [\`@${user}\`](https://github.com/${user}) • ${rango}

*«${motivacion}»*

${socialLinksBar.join(' ')}

---

### 🎖️ Rango Verificado • Cloud Native Medellín

<table>
  <tr>
    <td align="center" width="165">
      <a href="${REPO_URL}/blob/main/ASISTENTES.md" title="Rango Oficial: ${rango}">
        <img src="../../../recursos/insignias/${rango.includes('Capitán') ? 'rango-capitan.svg' : rango.includes('Timonel') ? 'rango-timonel.svg' : 'rango-marinero.svg'}" width="140" alt="${rango}"/>
      </a>
    </td>
    <td align="center" width="140">
      <sub>⚡ <b>PUNTAJE TOTAL</b></sub><br/>
      <h3><code>${points} XP</code></h3>
      <sub>Verificado • Cloud Native Medellín</sub>
    </td>
    <td align="center" width="140">
      <sub>🛠️ <b>RETOS RESUELTOS</b></sub><br/>
      <h3><code>${evalResult.totalSolvedChallenges}</code></h3>
      <sub>Troubleshooting</sub>
    </td>
    <td align="center" width="140">
      <sub>✍️ <b>BITÁCORAS</b></sub><br/>
      <h3><code>${evalResult.totalBitacoras}</code></h3>
      <sub><a href="#-bitácoras-de-reflexión-e-ingeniería">Ver notas</a></sub>
    </td>
    <td align="center" width="165">
      <a href="https://ocgroups.dev/cncf/group/2majk4r" title="Capítulo Oficial CNCF Medellín">
        <img src="../../../recursos/insignias/cncf-medellin.svg" width="140" alt="CNCF Medellín"/>
      </a>
    </td>
  </tr>
</table>

</div>

---

## 🧩 Mapa de Competencias e Insignias por Módulo

<div align="center">

${moduleBadges.join('\n')}

</div>

---

## 📊 Evidencias Técnicas y Laboratorios Resueltos en ☕ KubeCafé

Cada entrega en este portafolio es validada automáticamente por el motor de integración continua de [**De Cero a Capitán en Kubernetes — Cloud Native Medellín (CNCF)**](${REPO_URL}) frente a escenarios reales de resolución de fallos (*Troubleshooting*):

| Módulo & Habilidades Practicadas | Progreso | Evidencias | Bitácora (+10 XP) |
| :--- | :---: | :---: | :---: |
${tableRows.join('\n')}

---

## 📔 Bitácoras de Reflexión e Ingeniería

<div align="left">

${bitacorasSection}

</div>

<div align="center">

[![Agregar Bitácora Semanal](https://img.shields.io/badge/📔_Registrar_o_Actualizar_Bitácora_Semanal_(Formulario_1_min)-2ea44f?style=for-the-badge&logo=github)](${REPO_URL}/issues/new?template=bitacora-semanal.yml)

</div>

---

## 📣 Comparte tu Portafolio Profesional en Redes Sociales

Publica tus avances prácticos y tu progreso verificado por Cloud Native Medellín ante reclutadores, líderes técnicos y la comunidad Cloud Native.

---

### 🚀 Publicar en LinkedIn (Recomendado para Reclutadores)

> [!TIP]
> **¿Por qué copiar el texto, etiquetarnos y adjuntar imagen en LinkedIn?**  
> 1. **Espaciado protegido:** El bloque de texto ya incluye separadores invisibles (\`U+2800\`) para que el editor de LinkedIn **no comprima ni junte todo el texto** en un solo párrafo al pegar.  
> 2. **Etiqueta oficial (\`@\`):** LinkedIn no activa las menciones al pegar texto plano. Al pegar, **borra y vuelve a escribir \`@Cloud Native Colombia\`** y haz clic en **Cloud Native Colombia (Armenia, Bogota, Cali, Medellin)** en el menú desplegable para que tu post quede etiquetado.  
> 3. **Mayor visibilidad profesional:** Las publicaciones nativas en LinkedIn con **texto + imagen propia (captura de pantalla)** tienen **hasta 10 veces más alcance e interacción** en el feed que compartir un enlace suelto (el cual además arroja *"Cannot display preview"* en carpetas de GitHub).

Sigue estos **3 sencillos pasos**:

1. **Copia el texto pre-armado** (haz clic en el ícono de copiar en la esquina superior derecha del bloque de código):
\`\`\`text
${share.shareMessage}
\`\`\`

2. **Descarga tu Tarjeta PNG en 1 clic** (lista en \`1200×630\` con tu rango **${rango}**, tus **${points} XP** y tus módulos) o toma una captura de tu cabecera.
3. **Pega en LinkedIn, etiqueta a la comunidad y adjunta tu imagen:** Haz clic en el botón de LinkedIn, pega el texto (\`Ctrl+V\` / \`Cmd+V\`), busca **\`@Cloud Native Colombia (Armenia, Bogota, Cali, Medellin)\`** en el desplegable para etiquetarnos y sube tu tarjeta PNG:

<div align="center">

[![Descargar Tarjeta PNG](https://img.shields.io/badge/1._Descargar_Tarjeta_PNG-(1200x630)-10B981?style=for-the-badge&logo=kubernetes&logoColor=white)](${cardGeneratorUrl})
[![Publicar en LinkedIn](https://img.shields.io/badge/2._Abrir_y_Crear_Post_en-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](${share.linkedinShareUrl})

</div>

---

### 🌐 Compartir en otras Redes y Canales Oficiales

**Comparte tu portafolio en 1 clic:**

<div align="center">

[![Tarjeta PNG](https://img.shields.io/badge/🖼️_Tarjeta_PNG-Para_Redes-10B981?style=for-the-badge)](${cardGeneratorUrl})
[![Compartir en WhatsApp](https://img.shields.io/badge/Compartir_en-WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](${share.whatsappShareUrl})
[![Compartir en Telegram](https://img.shields.io/badge/Compartir_en-Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](${share.telegramShareUrl})

</div>

**Canales oficiales de Cloud Native Colombia:**

<div align="center">

[![LinkedIn Comunidad](https://img.shields.io/badge/LinkedIn-Cloud_Native_Colombia-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](${share.linkedinCompanyUrl})
[![Instagram @colombiacloudnative](https://img.shields.io/badge/Instagram-@colombiacloudnative-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](${share.instagramShareUrl})
[![YouTube @CloudNativeColombia](https://img.shields.io/badge/YouTube-@CloudNativeColombia-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](${share.youtubeShareUrl})

</div>

---

<div align="center">
  <sub>🏔️☕ Portafolio generado y verificado automáticamente por <b><a href="${REPO_URL}">Cloud Native Medellín (CNCF) — De Cero a Capitán en Kubernetes</a></b></sub>
</div>
`;

  fs.writeFileSync(path.join(userDir, 'README.md'), content, 'utf8');
}

function buildSocialBadgesString(entry) {
  const user = cleanGithubUser(entry.github);
  const badges = [
    `[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/${user})`
  ];

  const linkedin = cleanLinkedin(entry.linkedin);
  if (linkedin) {
    badges.push(
      `[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](${linkedin})`
    );
  }

  let portfolioBadge = '';
  if (entry.hasPortfolioDir) {
    const folder = entry.userFolderName || user;
    portfolioBadge = `[![Portafolio K8s](https://img.shields.io/badge/🎓_Portafolio_K8s-00C7B7?style=flat-square&logo=kubernetes&logoColor=white)](./aportes-comunidad/soluciones-retos/${folder}/README.md)`;
  }

  const extraLinks = [];
  if (entry.x && entry.x.trim()) {
    extraLinks.push(entry.x.trim());
  }
  if (entry.redes) {
    for (const link of parseExtraSocialLinks(entry.redes)) {
      if (!extraLinks.includes(link)) {
        extraLinks.push(link);
      }
    }
  }

  for (const link of extraLinks) {
    badges.push(buildSocialBadge(link));
  }

  const socialLine = badges.join(' ');
  return portfolioBadge ? `${socialLine}<br>${portfolioBadge}` : socialLine;
}

function buildStudentRow(entry, rankPosition) {
  const user = cleanGithubUser(entry.github);
  const nombre = (entry.nombre || user).replace(/\|/g, '').replace(/\r?\n/g, ' ').trim();
  const rol = (entry.rol || 'Tripulante de la Comunidad').replace(/\|/g, '/').replace(/\r?\n/g, ' ').trim();
  const rango = (entry.rango || '⛵ Marinero').trim();
  const progreso = entry.progresoTexto || `**${entry.puntos || 10} XP** (Registro inicial)`;
  const motivacion = (entry.motivacion || 'Aprender y compartir en la comunidad Cloud Native Medellín.').replace(/\|/g, '').replace(/\r?\n/g, ' ').trim();

  let medal = `#${rankPosition}`;
  if (entry.puntos > 10) {
    if (rankPosition === 1) medal = '🥇 #1';
    else if (rankPosition === 2) medal = '🥈 #2';
    else if (rankPosition === 3) medal = '🥉 #3';
  }

  const avatar = `<img src="https://github.com/${user}.png?size=80" width="42" height="42" alt="${user}"/>`;
  const badgesStr = buildSocialBadgesString(entry);

  return `| ${medal} | ${avatar} | **${nombre}** | ${rol} | ${badgesStr} | ${rango} · **${entry.puntos || 10} XP**<br><sub>${progreso.replace(/^\*\*\d+\s*XP\*\*\s*/, '')}</sub> | ${motivacion} |`;
}

function buildReadmeMosaicSection(students, instructorsList = []) {
  const cols = 6;
  const rowsHtml = [];
  for (let i = 0; i < students.length; i += cols) {
    const chunk = students.slice(i, i + cols);
    const cells = chunk.map((entry, idx) => {
      const pos = i + idx + 1;
      const user = cleanGithubUser(entry.github);
      const fullName = (entry.nombre || user).replace(/<[^>]*>/g, '').trim();
      const parts = fullName.split(/\s+/);
      const shortName = parts.length > 2 ? `${parts[0]} ${parts[1]}` : fullName;
      const rango = (entry.rango || '⛵ Marinero').trim();
      const xp = entry.puntos || 10;
      let medal = '';
      if (xp > 10) {
        if (pos === 1) medal = '🥇 ';
        else if (pos === 2) medal = '🥈 ';
        else if (pos === 3) medal = '🥉 ';
      }
      const profileLink = entry.hasPortfolioDir
        ? `./aportes-comunidad/soluciones-retos/${entry.userFolderName || user}/README.md`
        : cleanLinkedin(entry.linkedin) || `https://github.com/${user}`;
      const portfolioLine = entry.hasPortfolioDir
        ? `<br/>\n      <sub><a href="./aportes-comunidad/soluciones-retos/${entry.userFolderName || user}/README.md">🎓 Portafolio</a></sub>`
        : '';
      return `    <td align="center" width="140">\n      <a href="${profileLink}" title="${fullName} (@${user}) — ${xp} XP">\n        <img src="https://github.com/${user}.png?size=100" width="64" height="64" style="border-radius: 50%;" alt="${user}"/><br/>\n        <sub><b>${medal}${shortName}</b></sub>\n      </a><br/>\n      <sub>${rango} • <b>${xp} XP</b></sub>${portfolioLine}\n    </td>`;
    });
    rowsHtml.push(`  <tr>\n${cells.join('\n')}\n  </tr>`);
  }

  let instructorsBlock = '';
  if (instructorsList && instructorsList.length > 0) {
    const instCells = instructorsList.map(inst => {
      const user = cleanGithubUser(inst.github);
      const fullName = (inst.nombre || user).replace(/<[^>]*>/g, '').trim();
      const parts = fullName.split(/\s+/);
      const shortName = parts.length > 2 ? `${parts[0]} ${parts[1]}` : fullName;
      const isCaptain = user.toLowerCase() === 'edwinbermudez91';
      const isFemale =
        /colaboradora|instructora/i.test(inst.rol || '') ||
        /^(valentina|karen|ana|mar[ií]a|laura|paola|gloria|natalia|nathali|jeraldin|camila|karol|airy|sara|diana|luisa|carolina|andrea|daniela)\b/i.test(fullName);
      const roleTag = isCaptain
        ? '⚓ Capitán • Instructor'
        : isFemale
          ? '🤝 Colaboradora'
          : '🤝 Colaborador';
      const profileLink = cleanLinkedin(inst.linkedin) || `https://github.com/${user}`;
      return `    <td align="center" width="150">\n      <a href="${profileLink}" title="${fullName} (@${user})">\n        <img src="https://github.com/${user}.png?size=100" width="68" height="68" style="border-radius: 50%;" alt="${user}"/><br/>\n        <sub><b>${shortName}</b></sub>\n      </a><br/>\n      <sub>${roleTag}</sub>\n    </td>`;
    });
    instructorsBlock = `### 👨‍🏫 Capitán y Colaboradores de la Nave\n\n<table>\n  <tr>\n${instCells.join('\n')}\n  </tr>\n</table>\n\n### 🏆 Ranking de la Tripulación (${students.length} Tripulantes)\n\n`;
  }

  return `<!-- INICIO_MOSAICO_TRIPULACION -->
## 👥 Tripulación a Bordo y Ranking (${students.length} Tripulantes)

<div align="center">

[![Tripulantes a Bordo](https://img.shields.io/badge/⛵_Tripulantes_a_Bordo-${students.length}-00C7B7?style=for-the-badge)](./ASISTENTES.md)
[![Registrarme en 30 seg](https://img.shields.io/badge/➕_¡Regístrate_Aquí!_(Formulario_Visual)-2ea44f?style=for-the-badge&logo=github)](https://github.com/edwinbermudez91/Fundamentos-Kubernetes/issues/new?template=registro-asistente.yml)
[![Registrar Bitácora Semanal](https://img.shields.io/badge/📔_Bitácora_Semanal_y_Portafolio-8B5CF6?style=for-the-badge&logo=github)](https://github.com/edwinbermudez91/Fundamentos-Kubernetes/issues/new?template=bitacora-semanal.yml)
[![Actualizar mis Datos](https://img.shields.io/badge/✏️_Actualizar_mis_Datos_o_Redes-f57c00?style=for-the-badge&logo=github)](https://github.com/edwinbermudez91/Fundamentos-Kubernetes/issues/new?template=registro-asistente.yml)
[![Ver Ranking Completo](https://img.shields.io/badge/🏆_Ver_Tabla_de_Puntajes_y_Redes-326CE5?style=for-the-badge)](./ASISTENTES.md)

${instructorsBlock}<table>
${rowsHtml.join('\n')}
</table>

<sub>💡 <b>¿Aún no apareces aquí, quieres actualizar tus redes o registrar tu Bitácora Semanal?</b> Haz clic en <a href="https://github.com/edwinbermudez91/Fundamentos-Kubernetes/issues/new?template=registro-asistente.yml"><b>➕ Registrarme / ✏️ Actualizar Datos</b></a> o en <a href="https://github.com/edwinbermudez91/Fundamentos-Kubernetes/issues/new?template=bitacora-semanal.yml"><b>📔 Llenar Bitácora Semanal</b></a> y nuestro bot actualizará tu tarjeta y portafolio automáticamente en 15 segundos.</sub>

</div>
<!-- FIN_MOSAICO_TRIPULACION -->`;
}

function buildReadmePodiumSection(students) {
  const top5 = students.filter(s => s.hasPortfolioDir).slice(0, 5);
  if (top5.length === 0) {
    return `<!-- INICIO_PODIO_PORTAFOLIOS -->\n<!-- FIN_PODIO_PORTAFOLIOS -->`;
  }

  const medals = ['🥇 #1', '🥈 #2', '🥉 #3', '🏅 #4', '🏅 #5'];
  const cells = top5.map((entry, idx) => {
    const user = cleanGithubUser(entry.github);
    const fullName = (entry.nombre || user).replace(/<[^>]*>/g, '').trim();
    const parts = fullName.split(/\s+/);
    const shortName = parts.length > 2 ? `${parts[0]} ${parts[1]}` : fullName;
    const rango = (entry.rango || '⛵ Marinero').trim();
    const xp = entry.puntos || 10;
    const portfolioUrl = `./aportes-comunidad/soluciones-retos/${entry.userFolderName || user}/README.md`;
    return `    <td align="center" width="175">\n      <b>${medals[idx] || `#${idx + 1}`}</b><br/>\n      <a href="${portfolioUrl}" title="Portafolio de ${fullName} (@${user})">\n        <img src="https://github.com/${user}.png?size=120" width="68" height="68" style="border-radius: 50%;" alt="${user}"/><br/>\n        <b>${shortName}</b>\n      </a><br/>\n      <sub>${rango} • <b>${xp} XP</b></sub><br/>\n      <a href="${portfolioUrl}"><b>🎓 Ver Portafolio</b></a>\n    </td>`;
  });

  return `<!-- INICIO_PODIO_PORTAFOLIOS -->
## 🏆 Podio de Portafolios Destacados (Top 5)

<div align="center">

<table>
  <tr>
${cells.join('\n')}
  </tr>
</table>

<sub>🎓 <b>Explora todos los portafolios verificados:</b> <a href="./ASISTENTES.md"><b>🏆 Tabla de Posiciones y Portafolios (ASISTENTES.md)</b></a> • <a href="./aportes-comunidad/soluciones-retos"><b>📂 Carpeta de Portafolios</b></a> • <a href="https://github.com/edwinbermudez91/Fundamentos-Kubernetes/issues/new?template=bitacora-semanal.yml"><b>📔 Sumar +10 XP con mi Bitácora</b></a></sub>

</div>
<!-- FIN_PODIO_PORTAFOLIOS -->`;
}

function updateReadmeWithMosaic(students, readmeContent, instructorsList = []) {
  let updated = readmeContent;

  const podiumBlock = buildReadmePodiumSection(students);
  const podiumStart = '<!-- INICIO_PODIO_PORTAFOLIOS -->';
  const podiumEnd = '<!-- FIN_PODIO_PORTAFOLIOS -->';
  if (updated.includes(podiumStart) && updated.includes(podiumEnd)) {
    const podiumRegex = new RegExp(`${podiumStart}[\\s\\S]*?${podiumEnd}`);
    updated = updated.replace(podiumRegex, podiumBlock);
  }

  const mosaicBlock = buildReadmeMosaicSection(students, instructorsList);
  const startMarker = '<!-- INICIO_MOSAICO_TRIPULACION -->';
  const endMarker = '<!-- FIN_MOSAICO_TRIPULACION -->';

    if (updated.includes(startMarker) && updated.includes(endMarker)) {
      const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
      return updated.replace(regex, mosaicBlock);
    }

    const targetHeading = '## 🏆 Rangos de Navegación (Gamificación)';
      if (updated.includes(targetHeading)) {
        return updated.replace(targetHeading, `${mosaicBlock}\n\n---\n\n${targetHeading}`);
      }
      return updated + '\n\n' + mosaicBlock + '\n';
    }

    function renderAsistentesMarkdown(students, instructorsList, officialChallenges) {
      const rows = students.map((s, idx) => buildStudentRow(s, idx + 1)).join('\n');
      const totalPortfolios = students.filter(s => s.hasPortfolioDir).length;
      const capitanesCount = students.filter(s => (s.rango || '').includes('Capitán')).length;
      const timonelesCount = students.filter(s => (s.rango || '').includes('Timonel')).length;
      const marinerosCount = students.length - capitanesCount - timonelesCount;

      const weekChallengesText = Object.entries(officialChallenges)
        .map(([week, nums]) => `\`${week}\` (${nums.length} retos rotos)`)
        .join(', ');

      let instructorCard = '';
      if (instructorsList && instructorsList.length > 0) {
        const instRows = instructorsList.map(inst => {
          const u = cleanGithubUser(inst.github);
          const nom = (inst.nombre || u).trim();
          const rol = (inst.rol || '🤝 Colaborador').trim();
          const mot = (inst.motivacion || 'Compartir conocimiento y fortalecer la comunidad Cloud Native en Medellín. 🏔️☕').trim();
          const instBadges = buildSocialBadgesString(inst).replace(/<br>/g, ' &nbsp; ');
          return `| <img src="https://github.com/${u}.png?size=80" width="44" height="44" alt="${u}"/> | **${nom}** | ${rol} | ${instBadges} | ${mot} |`;
        }).join('\n');
        instructorCard = `
## 👨‍🏫 Capitán y Colaboradores de la Nave (Equipo Organizador)

| Foto | 👤 Integrante | 💼 Rol / Especialidad | 🌐 Redes Profesionales | 🎯 Misión en la Comunidad |
| :---: | :--- | :--- | :---: | :--- |
${instRows}

---
`;
      }

      return `# 🙌 Muro de Asistentes y Ranking de la Tripulación — Cloud Native Medellín 🏔️☕

¡Te damos la bienvenida a bordo! Este muro es el registro histórico, el **directorio de Portafolios Profesionales KubeCafé** y la **tabla de posiciones (Leaderboard)** de todas las personas que hacen parte de esta travesía de aprendizaje: **De Cero a Capitán en Kubernetes**.

<div align="center">

[![Comunidad Oficial CNCF Medellín](https://img.shields.io/badge/🇨🇴_Únete_al_Capítulo-CNCF_Medellín-00C7B7?style=for-the-badge&logo=cncf&logoColor=white)](https://ocgroups.dev/cncf/group/2majk4r)
[![Registrarme en 30 seg](https://img.shields.io/badge/➕_¡Regístrate_Aquí!_(Nuevos_Tripulantes)-2ea44f?style=for-the-badge&logo=github)](https://github.com/edwinbermudez91/Fundamentos-Kubernetes/issues/new?template=registro-asistente.yml)
[![Registrar Bitácora Semanal](https://img.shields.io/badge/📔_Bitácora_Semanal_y_Portafolio-8B5CF6?style=for-the-badge&logo=github)](https://github.com/edwinbermudez91/Fundamentos-Kubernetes/issues/new?template=bitacora-semanal.yml)
[![Actualizar mis Datos](https://img.shields.io/badge/✏️_Actualizar_mis_Datos_o_Redes_Sociales-f57c00?style=for-the-badge&logo=github)](https://github.com/edwinbermudez91/Fundamentos-Kubernetes/issues/new?template=registro-asistente.yml)
[![Insignias y Portafolio](https://img.shields.io/badge/🎖️_Insignias_para_LinkedIn_y_GitHub-326CE5?style=for-the-badge&logo=linkedin)](./recursos/portafolio-y-badges.md)

<table>
  <tr>
    <td align="center" width="150"><sub>⛵ <b>TRIPULANTES</b></sub><br/><h3><code>${students.length}</code></h3></td>
    <td align="center" width="150"><sub>🎓 <b>PORTAFOLIOS</b></sub><br/><h3><code>${totalPortfolios}</code></h3></td>
    <td align="center" width="150"><sub>🥇 <b>CAPITANES (ORO)</b></sub><br/><h3><code>${capitanesCount}</code></h3></td>
    <td align="center" width="150"><sub>🥈 <b>TIMONELES (PLATA)</b></sub><br/><h3><code>${timonelesCount}</code></h3></td>
    <td align="center" width="150"><sub>🥉 <b>MARINEROS (BRONCE)</b></sub><br/><h3><code>${marinerosCount}</code></h3></td>
  </tr>
</table>

</div>

---

## 🏆 Sistema de Puntaje (XP) y Rangos Oficiales

A medida que avances semana a semana, nuestro bot de GitHub Actions inspeccionará tu carpeta \`aportes-comunidad/soluciones-retos/<tu-usuario>/semana-XX/\`, **validará tus soluciones de \`2.reto-roto/\`**, generará tu **Portafolio Profesional KubeCafé (\`README.md\`)** y actualizará tu puntaje en este muro:

| Acción / Logro | Puntos / Insignia | Regla de Validación Estricta |
| :--- | :---: | :--- |
| **1. Registro en el Muro** | **+10 XP** | Por registrarte en el formulario o vía Pull Request. |
| **2. Reto Roto Resuelto y Validado** | **+10 XP por reto** | Cada ejercicio de \`2.reto-roto/\` (${weekChallengesText}) que resuelvas y pase la validación de contenido suma **+10 XP** en la tabla de posiciones. |
| **3. Bitácora de Navegación y Portafolio KubeCafé** | **+10 XP + 🎓 Portafolio** | Registra lo aprendido en el **[📔 Formulario Visual de Bitácora](https://github.com/edwinbermudez91/Fundamentos-Kubernetes/issues/new?template=bitacora-semanal.yml)** (o incluye \`bitacora.md\` en tu PR) para desbloquear tu **Portafolio Profesional K8s**. |

### 🎖️ Requisitos para subir de Rango:
| Insignia Oficial | Rango | Requisito | Lo que representa en la travesía |
| :---: | :---: | :---: | :--- |
| <img src="./recursos/insignias/rango-marinero.svg" width="84" alt="Marinero Bronce"/> | **⛵ Marinero**<br><sub>🥉 Bronce</sub> | Registro inicial (**10 XP**) | Te registraste en este muro y zarpó tu primer Pod en el clúster. |
| <img src="./recursos/insignias/rango-timonel.svg" width="84" alt="Timonel Plata"/> | **🧭 Timonel K8s**<br><sub>🥈 Plata</sub> | **2+ Semanas al 100%** | Resolviste y validaste **todos** los ejercicios de los _Retos Rotos_ de al menos 2 semanas. |
| <img src="./recursos/insignias/rango-capitan.svg" width="84" alt="Capitán Oro"/> | **⚓ Capitán K8s**<br><sub>🥇 Oro</sub> | **6 Semanas al 100%** | Dominas la navegación del clúster, completaste todos los ejercicios de las 6 semanas y el proyecto final. |

<details>
<summary>📝 <b>¿Cómo registrarte, actualizar tus datos o llenar tu Bitácora Semanal? (Haz clic para ver los 3 pasos)</b></summary>

1. **➕ Registro o Actualización de Perfil (30 segundos):**
   - 👉 **[Abrir Formulario Visual de Registro / Actualización](https://github.com/edwinbermudez91/Fundamentos-Kubernetes/issues/new?template=registro-asistente.yml)**
   - Completa tu nombre, usuario de GitHub, rol y enlaces a LinkedIn/Redes, y haz clic en **\`Create\`**. En 15 segundos aparecerás en la tabla con tu foto oficial.
2. **📔 Bitácora de Aprendizaje Semanal y Portafolio Profesional (1 minuto):**
   - 👉 **[Abrir Formulario Visual de Bitácora Semanal](https://github.com/edwinbermudez91/Fundamentos-Kubernetes/issues/new?template=bitacora-semanal.yml)**
   - Elige la semana, escribe qué aprendiste y qué reto solucionaste, y haz clic en **\`Create\`**. El bot creará tu archivo \`bitacora.md\`, actualizará tu **🎓 Portafolio K8s** y te dará enlaces de 1 clic para compartir tu logro en LinkedIn, Instagram, WhatsApp y Telegram.
3. **🛠️ Vía Pull Request desde tu terminal (Para practicar Git):**
   - También puedes editar tu bloque en [\`asistentes.json\`](./asistentes.json) o copiar la [\`PLANTILLA-BITACORA.md\`](./aportes-comunidad/soluciones-retos/PLANTILLA-BITACORA.md) dentro de tu carpeta semanal.

</details>

---
${instructorCard}
## 👥 Tabla de Posiciones de la Tripulación (${students.length} Tripulantes)

<!-- INICIO_TABLA_ASISTENTES -->
| # | Foto | 👤 Tripulante | 💼 Rol / Especialidad | 🌐 Redes y Portafolio | 🎖️ Rango y Progreso (XP) | 🎯 ¿Qué te motivó a unirte? |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- |
${rows}
<!-- FIN_TABLA_ASISTENTES -->

> [!TIP]
> **Impulsa tu Marca Profesional y Haz Networking:**  
> Haz clic en el botón **\`🎓 Portafolio K8s\`** de los tripulantes para ver sus laboratorios verificados y bitácoras, y visita la [**🎖️ Guía de Portafolio e Insignias para LinkedIn y GitHub (\`recursos/portafolio-y-badges.md\`)**](./recursos/portafolio-y-badges.md) para agregar tu insignia oficial a tu perfil. 🤝🚀
`;
    }

    function processAndSortData(rawData) {
      const officialChallenges = discoverOfficialChallenges();
      const map = new Map();

      for (const item of rawData) {
        const cleanUser = cleanGithubUser(item.github);
        const key = cleanUser.toLowerCase();
        if (!map.has(key)) {
          item.github = cleanUser;
          item.linkedin = cleanLinkedin(item.linkedin);
          item.redes = parseExtraSocialLinks(item.redes);
          if (item.x && !item.redes.includes(item.x)) item.redes.push(item.x);
          delete item.x;
          map.set(key, item);
        } else {
          const existing = map.get(key);
          if (item.linkedin && cleanLinkedin(item.linkedin)) existing.linkedin = cleanLinkedin(item.linkedin);
          if (item.rol && item.rol !== 'Tripulante de la Comunidad') existing.rol = item.rol;
          if (item.motivacion && !item.motivacion.startsWith('Aporte en PR')) existing.motivacion = item.motivacion;
          if (item.redes) {
            for (const r of parseExtraSocialLinks(item.redes)) {
              if (!existing.redes.includes(r)) existing.redes.push(r);
            }
          }
        }
      }

      const instructorsList = [];
      const students = [];

      let orderIndex = 0;
      for (const item of map.values()) {
        const isInstructor = INSTRUCTORS.includes(item.github.toLowerCase());
        if (isInstructor) {
          item.rango = '⚓ Capitán K8s';
          instructorsList.push(item);
        } else {
          const evalResult = evaluateUserProgress(item.github, officialChallenges);
          item.rango = evalResult.rango;
          item.puntos = evalResult.points;
          item.semanasCompletas = evalResult.completedWeeksCount;
          item.progresoTexto = evalResult.summaryText;
          item.hasPortfolioDir = evalResult.hasPortfolioDir;
          item.userFolderName = evalResult.userFolderName;
          item._evalResult = evalResult;
          item._order = orderIndex++;
          students.push(item);
        }
      }

      students.sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        return a._order - b._order;
      });

      const cleanJsonList = [];
      for (const inst of instructorsList) {
        cleanJsonList.push({
          github: inst.github,
          nombre: inst.nombre,
          rol: inst.rol,
          linkedin: inst.linkedin || '',
          redes: inst.redes || [],
          rango: inst.rango,
          motivacion: inst.motivacion
        });
      }
      for (const s of students) {
        cleanJsonList.push({
          github: s.github,
          nombre: s.nombre,
          rol: s.rol,
          linkedin: s.linkedin || '',
          redes: s.redes || [],
          rango: s.rango,
          puntos: s.puntos,
          motivacion: s.motivacion
        });
      }

      return {
        cleanJsonList,
        students,
        instructorsList,
        officialChallenges
      };
    }

    const BADGE_VISUALS = {
      'semana-00': {
        label: 'DOCKER &amp; OCI',
        sub: 'SEMANA 00',
        gradStart: '#38BDF8',
        gradEnd: '#0284C7',
        icon: `<rect x="86" y="70" width="14" height="12" rx="2" fill="currentColor" opacity="0.95"/>
      <rect x="103" y="70" width="14" height="12" rx="2" fill="currentColor" opacity="0.95"/>
      <rect x="120" y="70" width="14" height="12" rx="2" fill="currentColor" opacity="0.85"/>
      <rect x="94" y="55" width="14" height="12" rx="2" fill="currentColor" opacity="0.85"/>
      <rect x="111" y="55" width="14" height="12" rx="2" fill="currentColor" opacity="0.95"/>
      <path d="M80 87 h60 c0 12 -10 21 -30 21 c-20 0 -30 -9 -30 -21 z" fill="currentColor" opacity="0.95"/>`
      },
      'semana-01': {
        label: 'K8S PODS',
        sub: 'SEMANA 01',
        gradStart: '#60A5FA',
        gradEnd: '#2563EB',
        icon: `<circle cx="110" cy="82" r="19" fill="none" stroke="currentColor" stroke-width="4.5"/>
      <circle cx="110" cy="82" r="6" fill="currentColor"/>
      <line x1="110" y1="57" x2="110" y2="107" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="88" y1="70" x2="132" y2="94" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="132" y1="70" x2="88" y2="94" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>`
      },
      'semana-02': {
        label: 'DEPLOYMENTS',
        sub: 'SEMANA 02',
        gradStart: '#34D399',
        gradEnd: '#059669',
        icon: `<path d="M90 76 a22 22 0 0 1 36 -8" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
      <polygon points="129,63 130,75 119,71" fill="currentColor"/>
      <path d="M130 88 a22 22 0 0 1 -36 8" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
      <polygon points="91,101 90,89 101,93" fill="currentColor"/>
      <rect x="103" y="75" width="14" height="14" rx="3" fill="currentColor"/>`
      },
      'semana-03': {
        label: 'GATEWAY API',
        sub: 'SEMANA 03',
        gradStart: '#22D3EE',
        gradEnd: '#0891B2',
        icon: `<circle cx="110" cy="66" r="8" fill="currentColor"/>
      <circle cx="86" cy="96" r="7" fill="currentColor" opacity="0.9"/>
      <circle cx="110" cy="99" r="7" fill="currentColor" opacity="0.9"/>
      <circle cx="134" cy="96" r="7" fill="currentColor" opacity="0.9"/>
      <line x1="110" y1="74" x2="86" y2="90" stroke="currentColor" stroke-width="3.5"/>
      <line x1="110" y1="74" x2="110" y2="92" stroke="currentColor" stroke-width="3.5"/>
      <line x1="110" y1="74" x2="134" y2="90" stroke="currentColor" stroke-width="3.5"/>`
      },
      'semana-04': {
        label: 'CONFIG &amp; PV',
        sub: 'SEMANA 04',
        gradStart: '#A78BFA',
        gradEnd: '#7C3AED',
        icon: `<ellipse cx="110" cy="66" rx="22" ry="7" fill="currentColor" opacity="0.95"/>
      <path d="M88 66 v14 c0 4 10 7 22 7 s22 -3 22 -7 v-14" fill="none" stroke="currentColor" stroke-width="4"/>
      <path d="M88 80 v14 c0 4 10 7 22 7 s22 -3 22 -7 v-14" fill="none" stroke="currentColor" stroke-width="4"/>`
      },
      'semana-05': {
        label: 'SECURITY RBAC',
        sub: 'SEMANA 05',
        gradStart: '#FBBF24',
        gradEnd: '#D97706',
        icon: `<path d="M110 57 L133 66 V83 C133 96 122 104 110 108 C98 104 87 96 87 83 V66 Z" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M101 82 L107 88 L120 74" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`
      },
      'semana-06': {
        label: 'HELM CHART',
        sub: 'SEMANA 06',
        gradStart: '#F472B6',
        gradEnd: '#DB2777',
        icon: `<polygon points="110,56 117,71 134,73 121,84 125,101 110,93 95,101 99,84 86,73 103,71" fill="currentColor" opacity="0.95"/>`
      }
    };

    function buildModuleBadgeSvg(weekKey, state) {
      const vis = BADGE_VISUALS[weekKey] || BADGE_VISUALS['semana-01'];
      const isDone = state === 'completado';
      const isProg = state === 'progreso';

      const borderStart = isDone ? '#FDE047' : isProg ? '#FBBF24' : '#334155';
      const borderEnd = isDone ? vis.gradStart : isProg ? '#D97706' : '#1E293B';
      const bgTop = '#0B1120';
      const bgBottom = isDone ? '#162238' : isProg ? '#1C1917' : '#111827';
      const iconColor = isDone ? vis.gradStart : isProg ? '#FBBF24' : '#64748B';
      const ribbonFill = isDone ? vis.gradEnd : isProg ? '#B45309' : '#1E293B';
      const statusBg = isDone ? '#10B981' : isProg ? '#F59E0B' : '#334155';
      const statusText = isDone ? '✓ VERIFICADO' : isProg ? '⏳ EN PROGRESO' : '🔒 PRÓXIMAMENTE';
      const statusFg = isDone || isProg ? '#FFFFFF' : '#94A3B8';
      const issuerColor = isDone ? '#FDE047' : isProg ? '#FDE68A' : '#94A3B8';
      const subColor = isDone ? '#FDE047' : isProg ? '#FDE68A' : '#94A3B8';
      const opacity = isDone || isProg ? '1' : '0.58';
      const stars = isDone
        ? `<text x="110" y="203" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="10.5" fill="#FDE047" letter-spacing="2.5">★ ★ ★</text>`
        : '';

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 245" width="220" height="245">
  <defs>
    <linearGradient id="b_${weekKey}_${state}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${borderStart}"/>
      <stop offset="100%" stop-color="${borderEnd}"/>
    </linearGradient>
    <linearGradient id="bg_${weekKey}_${state}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${bgTop}"/>
      <stop offset="100%" stop-color="${bgBottom}"/>
    </linearGradient>
  </defs>
  <g opacity="${opacity}">
    <polygon points="110,8 204,62 204,170 110,224 16,170 16,62" fill="url(#b_${weekKey}_${state})"/>
    <polygon points="110,16 196,66 196,166 110,216 24,166 24,66" fill="url(#bg_${weekKey}_${state})"/>
    <polygon points="110,22 190,68 190,164 110,210 30,164 30,68" fill="none" stroke="${isDone ? vis.gradStart : borderStart}" stroke-width="1.5" stroke-opacity="${isDone ? '0.75' : '0.35'}"/>
    <text x="110" y="54" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="7.5" font-weight="800" fill="${issuerColor}" letter-spacing="1.0">CNCF MEDELLÍN</text>
    <g color="${iconColor}" transform="translate(110, 86) scale(0.88) translate(-110, -82)">
      ${vis.icon}
    </g>
    <polygon points="10,118 210,118 202,154 18,154" fill="${ribbonFill}"/>
    <polygon points="10,118 18,154 24,149 16,118" fill="#000000" opacity="0.3"/>
    <polygon points="210,118 202,154 196,149 204,118" fill="#000000" opacity="0.3"/>
    <text x="110" y="131" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="8.5" font-weight="800" fill="${subColor}" letter-spacing="1.8">${vis.sub}</text>
    <text x="110" y="148" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" letter-spacing="0.8">${vis.label}</text>
    <rect x="52" y="159" width="116" height="20" rx="10" fill="${statusBg}"/>
    <text x="110" y="172.5" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="9" font-weight="800" fill="${statusFg}" letter-spacing="0.8">${statusText}</text>
    <text x="110" y="190" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="7" font-weight="700" fill="#CBD5E1" opacity="0.95" letter-spacing="1.0">KUBECAFÉ</text>
    ${stars}
  </g>
</svg>\n`;
    }

    const SPECIAL_HEX_BADGES = {
      'rango-marinero': {
        issuer: 'RANGO BRONCE',
        sub: 'TRIPULACIÓN K8S',
        label: 'MARINERO',
        pill: '⛵ EN TRAVESÍA',
        footer: 'KUBECAFÉ',
        borderTop: '#FDBA74',
        gradStart: '#EA580C',
        gradEnd: '#9A3412',
        pillBg: '#B45309',
        accent: '#FDBA74',
        stars: '★',
        icon: `<path d="M110 56 L110 96 M110 58 L132 88 L110 88 Z M88 94 Q110 106 132 94 L126 104 Q110 110 94 104 Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`
      },
      'rango-timonel': {
        issuer: 'RANGO PLATA',
        sub: 'TRIPULACIÓN K8S',
        label: 'TIMONEL K8S',
        pill: '🧭 NAVEGANTE',
        footer: 'KUBECAFÉ',
        borderTop: '#F8FAFC',
        gradStart: '#CBD5E1',
        gradEnd: '#475569',
        pillBg: '#64748B',
        accent: '#E2E8F0',
        stars: '★ ★',
        icon: `<circle cx="110" cy="82" r="20" fill="none" stroke="currentColor" stroke-width="4"/>
      <polygon points="110,65 115,82 110,99 105,82" fill="currentColor"/>
      <circle cx="110" cy="82" r="4" fill="#0B1120"/>`
      },
      'rango-capitan': {
        issuer: 'RANGO ORO',
        sub: 'MAESTRÍA K8S',
        label: 'CAPITÁN K8S',
        pill: '⚓ COMANDANTE',
        footer: 'KUBECAFÉ',
        borderTop: '#FEF08A',
        gradStart: '#FACC15',
        gradEnd: '#B45309',
        pillBg: '#CA8A04',
        accent: '#FDE047',
        stars: '★ ★ ★',
        icon: `<circle cx="110" cy="63" r="5" fill="none" stroke="currentColor" stroke-width="3.5"/>
      <line x1="110" y1="68" x2="110" y2="103" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <line x1="97" y1="76" x2="123" y2="76" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M90 90 Q110 108 130 90" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`
      },
      'cncf-medellin': {
        issuer: 'CAPÍTULO OFICIAL',
        sub: 'COLOMBIA',
        label: 'CNCF MEDELLÍN',
        pill: '🇨🇴 COMUNIDAD',
        footer: 'CLOUD NATIVE',
        borderTop: '#FDE047',
        gradStart: '#2DD4BF',
        gradEnd: '#0D9488',
        pillBg: '#0D9488',
        accent: '#FDE047',
        stars: '★ ★ ★',
        icon: `<rect x="89" y="64" width="42" height="36" rx="5" fill="none" stroke="currentColor" stroke-width="4"/>
      <path d="M101 82 L107 88 L120 75" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
      }
    };

    function buildSpecialBadgeSvg(key, cfg) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 245" width="220" height="245">
  <defs>
    <linearGradient id="sb_${key}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${cfg.borderTop}"/>
      <stop offset="100%" stop-color="${cfg.gradStart}"/>
    </linearGradient>
    <linearGradient id="sbg_${key}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0B1120"/>
      <stop offset="100%" stop-color="#162238"/>
    </linearGradient>
  </defs>
  <polygon points="110,8 204,62 204,170 110,224 16,170 16,62" fill="url(#sb_${key})"/>
  <polygon points="110,16 196,66 196,166 110,216 24,166 24,66" fill="url(#sbg_${key})"/>
  <polygon points="110,22 190,68 190,164 110,210 30,164 30,68" fill="none" stroke="${cfg.gradStart}" stroke-width="1.5" stroke-opacity="0.75"/>
  <text x="110" y="54" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="7.5" font-weight="800" fill="${cfg.accent}" letter-spacing="1.0">${cfg.issuer}</text>
  <g color="${cfg.accent}" transform="translate(110, 86) scale(0.88) translate(-110, -82)">
    ${cfg.icon}
  </g>
  <polygon points="10,118 210,118 202,154 18,154" fill="${cfg.gradEnd}"/>
  <polygon points="10,118 18,154 24,149 16,118" fill="#000000" opacity="0.3"/>
  <polygon points="210,118 202,154 196,149 204,118" fill="#000000" opacity="0.3"/>
  <text x="110" y="131" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="8.5" font-weight="800" fill="${cfg.accent}" letter-spacing="1.6">${cfg.sub}</text>
  <text x="110" y="148" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" letter-spacing="0.8">${cfg.label}</text>
  <rect x="52" y="159" width="116" height="20" rx="10" fill="${cfg.pillBg}"/>
  <text x="110" y="172.5" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="9" font-weight="800" fill="#FFFFFF" letter-spacing="0.8">${cfg.pill}</text>
  <text x="110" y="190" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="7" font-weight="700" fill="#CBD5E1" opacity="0.95" letter-spacing="1.0">${cfg.footer}</text>
  <text x="110" y="203" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="10.5" fill="${cfg.accent}" letter-spacing="2.5">${cfg.stars}</text>
</svg>\n`;
    }

    function buildPortfolioBannerSvg() {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 135" width="900" height="135">
  <defs>
    <linearGradient id="bannerBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B1120"/>
      <stop offset="50%" stop-color="#172554"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="bannerAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="50%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#2DD4BF"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="896" height="131" rx="16" fill="url(#bannerBg)" stroke="url(#bannerAccent)" stroke-width="2.5"/>
  <g opacity="0.12" transform="translate(80, 67)" color="#38BDF8">
    <circle cx="0" cy="0" r="36" fill="none" stroke="currentColor" stroke-width="6"/>
    <circle cx="0" cy="0" r="11" fill="currentColor"/>
    <line x1="0" y1="-46" x2="0" y2="46" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
    <line x1="-40" y1="-23" x2="40" y2="23" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
    <line x1="40" y1="-23" x2="-40" y2="23" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
  </g>
  <g opacity="0.12" transform="translate(820, 67)" color="#2DD4BF">
    <polygon points="0,-42 36,-21 36,21 0,42 -36,21 -36,-21" fill="none" stroke="currentColor" stroke-width="5"/>
    <polygon points="0,-24 21,-12 21,12 0,24 -21,12 -21,-12" fill="currentColor" opacity="0.5"/>
  </g>
  <text x="450" y="38" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="11" font-weight="800" fill="#FDE047" letter-spacing="3.2">CLOUD NATIVE MEDELLÍN (CNCF) • KUBECAFÉ</text>
  <text x="450" y="74" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="27" font-weight="900" fill="#FFFFFF" letter-spacing="1.2">PORTAFOLIO CLOUD NATIVE &amp; KUBERNETES</text>
  <rect x="260" y="88" width="380" height="2" rx="1" fill="url(#bannerAccent)" opacity="0.85"/>
  <text x="450" y="110" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="12" font-weight="700" fill="#93C5FD" letter-spacing="2.2">DE CERO A CAPITÁN EN KUBERNETES</text>
</svg>\n`;
    }

    function ensureInsigniasSvgs() {
      fs.mkdirSync(INSIGNIAS_DIR, { recursive: true });
      const states = ['completado', 'progreso', 'bloqueado'];
      for (const weekKey of Object.keys(WEEK_METADATA)) {
        for (const state of states) {
          const filePath = path.join(INSIGNIAS_DIR, `${weekKey}-${state}.svg`);
          fs.writeFileSync(filePath, buildModuleBadgeSvg(weekKey, state), 'utf8');
        }
      }
      for (const [key, cfg] of Object.entries(SPECIAL_HEX_BADGES)) {
        const filePath = path.join(INSIGNIAS_DIR, `${key}.svg`);
        fs.writeFileSync(filePath, buildSpecialBadgeSvg(key, cfg), 'utf8');
      }
      fs.writeFileSync(path.join(INSIGNIAS_DIR, 'banner-portafolio.svg'), buildPortfolioBannerSvg(), 'utf8');
    }

    function syncAllFiles(rawData) {
      ensureInsigniasSvgs();
      const { cleanJsonList, students, instructorsList, officialChallenges } = processAndSortData(rawData);
      fs.writeFileSync(JSON_PATH, JSON.stringify(cleanJsonList, null, 2) + '\n', 'utf8');

      // Generar el README.md de Portafolio Profesional para cada estudiante con carpeta en soluciones-retos/
      for (const s of students) {
        if (s.hasPortfolioDir && s._evalResult) {
          generateStudentPortfolioReadme(s, s._evalResult);
        }
      }

      const md = renderAsistentesMarkdown(students, instructorsList, officialChallenges);
      fs.writeFileSync(MD_PATH, md, 'utf8');
      if (fs.existsSync(README_PATH)) {
        const readme = fs.readFileSync(README_PATH, 'utf8');
        fs.writeFileSync(README_PATH, updateReadmeWithMosaic(students, readme, instructorsList), 'utf8');
      }
      return { cleanJsonList, students, instructorsList, officialChallenges };
    }

    if (require.main === module) {
      const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
      const { students } = syncAllFiles(data);
      const withPortfolio = students.filter(s => s.hasPortfolioDir).length;
      console.log(`✅ ASISTENTES.md, README.md y ${withPortfolio} Portafolios Profesionales actualizados (${students.length} estudiantes).`);
    }

    module.exports = {
      INSTRUCTORS,
      WEEK_METADATA,
      BITACORA_DROPDOWN_OPTIONS,
      CHALLENGE_VALIDATORS,
      cleanGithubUser,
      cleanLinkedin,
      parseExtraSocialLinks,
      discoverOfficialChallenges,
      evaluateUserProgress,
      buildShareLinks,
      buildBitacoraIssueUrl,
      generateStudentPortfolioReadme,
      processAndSortData,
      syncAllFiles,
      updateReadmeWithMosaic,
      renderAsistentesMarkdown
    };
