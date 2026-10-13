import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase';

export interface DevComando {
  tech: string;
  nombre: string;
  comando: string;
  descripcion?: string;
  icono: string;
}

export type GrupoPortal = 'senati' | 'dev' | 'herramientas';
export type VistaDashboard = 'inicio' | 'sitios' | 'github' | 'chuletas';

export interface PortalFijo {
  id: string;
  nombre: string;
  url: string;
  icono: string;
  descripcion: string;
  grupo?: GrupoPortal;
}

/** Item unificado para mostrar portales base y sitios guardados en Supabase. */
export interface ItemPortal {
  nombre: string;
  url: string;
  icono: string;
  descripcion: string;
  tipo: 'base' | 'db';
  ref: any;
}

export interface GrupoPortales {
  id: string;
  titulo: string;
  items: ItemPortal[];
}

/** Genera un ícono SVG como data URL (para apps sin logo propio). */
const svgIcon = (paths: string, color: string): string =>
  'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
  );

const SENATI_PORTAL_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:4201'
  : 'https://senati-portal.vercel.app/';
const BITACORA_URL = 'https://bitacora-senati.vercel.app/';

const DIAS_NOMBRE = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  userName = 'Usuario';
  userLastName = '';
  userInitials = 'U';
  dateTimeString = '';
  saludo = 'Hola';

  // Pestaña activa (persistida en localStorage)
  vistaActiva: VistaDashboard = 'inicio';

  readonly senatiPortalUrl = SENATI_PORTAL_URL;
  readonly bitacoraUrl = BITACORA_URL;

  // Portales y Sitios
  sitios: any[] = [];

  readonly gruposMeta: { id: GrupoPortal; titulo: string }[] = [
    { id: 'senati', titulo: 'SENATI' },
    { id: 'dev', titulo: 'Desarrollo' },
    { id: 'herramientas', titulo: 'Herramientas' }
  ];

  // Portales Fijos Base con Logos Oficiales Locales (agrupados por categoría)
  defaultPortalesFijos: PortalFijo[] = [
    {
      id: 'bb',
      nombre: 'Blackboard',
      url: 'https://senati.blackboard.com/',
      icono: '/img/blackboard.svg',
      descripcion: 'Entregables y clases de SENATI.',
      grupo: 'senati'
    },
    {
      id: 'outlook',
      nombre: 'Outlook',
      url: 'https://outlook.cloud.microsoft/mail/',
      icono: '/img/outlook.svg',
      descripcion: 'Correo institucional de SENATI.',
      grupo: 'senati'
    },
    {
      id: 'senati-portal',
      nombre: 'SENATI Portal',
      url: SENATI_PORTAL_URL,
      icono: svgIcon('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>', '#38bdf8'),
      descripcion: 'Cursos y materias.',
      grupo: 'senati'
    },
    {
      id: 'bitacora',
      nombre: 'Bitácora',
      url: BITACORA_URL,
      icono: svgIcon('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>', '#34d399'),
      descripcion: 'Informes semanales (Dual).',
      grupo: 'senati'
    },
    {
      id: 'github',
      nombre: 'GitHub',
      url: 'https://github.com',
      icono: '/img/github.svg',
      descripcion: 'Repositorios y control de versiones.',
      grupo: 'dev'
    },
    {
      id: 'vercel',
      nombre: 'Vercel',
      url: 'https://vercel.com/dashboard',
      icono: '/img/vercel.svg',
      descripcion: 'Despliegues y proyectos en producción.',
      grupo: 'dev'
    },
    {
      id: 'supabase',
      nombre: 'Supabase',
      url: 'https://supabase.com/dashboard',
      icono: '/img/supabase.svg',
      descripcion: 'Base de datos PostgreSQL y Auth.',
      grupo: 'dev'
    },
    {
      id: 'drive',
      nombre: 'Google Drive',
      url: 'https://drive.google.com',
      icono: '/img/drive.svg',
      descripcion: 'Documentación y archivos en la nube.',
      grupo: 'herramientas'
    },
    {
      id: 'chatgpt',
      nombre: 'ChatGPT',
      url: 'https://chatgpt.com',
      icono: '/img/chatgpt.svg',
      descripcion: 'Asistente de IA y resolución de dudas.',
      grupo: 'herramientas'
    },
    {
      id: 'notion',
      nombre: 'Notion',
      url: 'https://notion.so',
      icono: '/img/notion.svg',
      descripcion: 'Apuntes, gestión y documentación.',
      grupo: 'herramientas'
    }
  ];

  // Portales Fijos activos (con posibles logos personalizados por el usuario)
  portalesFijos: PortalFijo[] = [];

  // Catálogo Completo de Chuletas Dev (Ordenados por Flujo de Trabajo Natural)
  comandosDev: DevComando[] = [
    // Angular (Creación -> Desarrollo -> Pruebas -> Build/Update)
    { tech: 'Angular', nombre: '1. Generar Módulo', comando: 'ng g m nombre-modulo', icono: '' },
    { tech: 'Angular', nombre: '2. Generar Componente', comando: 'ng g c nombre-componente', icono: '' },
    { tech: 'Angular', nombre: '3. Generar Servicio', comando: 'ng g s services/nombre', icono: '' },
    { tech: 'Angular', nombre: '4. Generar Interface / Modelo', comando: 'ng g i models/usuario', icono: '' },
    { tech: 'Angular', nombre: '5. Generar Guard de Autenticación', comando: 'ng g g guards/auth', icono: '' },
    { tech: 'Angular', nombre: '6. Generar Interceptor HTTP', comando: 'ng g interceptor core/jwt', icono: '' },
    { tech: 'Angular', nombre: '7. Generar Pipe Personalizado', comando: 'ng g p pipes/filtro', icono: '' },
    { tech: 'Angular', nombre: '8. Iniciar Servidor Local', comando: 'ng serve --port 4200', icono: '' },
    { tech: 'Angular', nombre: '9. Iniciar con Apertura Automática', comando: 'ng serve -o', icono: '' },
    { tech: 'Angular', nombre: '10. Ejecutar Pruebas Unitarias', comando: 'ng test', icono: '' },
    { tech: 'Angular', nombre: '11. Compilar Producción', comando: 'ng build', icono: '' },
    { tech: 'Angular', nombre: '12. Actualizar Angular CLI y Core', comando: 'ng update @angular/cli @angular/core', icono: '' },
    
    // React / Vite / Next.js (Creación -> Dependencias -> Dev -> Build)
    { tech: 'React / Vite', nombre: '1. Crear Proyecto Vite (TS)', comando: 'npm create vite@latest mi-app -- --template react-ts', icono: '' },
    { tech: 'React / Vite', nombre: '2. Crear Proyecto Vite (JS)', comando: 'npm create vite@latest mi-app -- --template react', icono: '' },
    { tech: 'React / Vite', nombre: '3. Instalar React Router DOM', comando: 'npm i react-router-dom', icono: '' },
    { tech: 'React / Vite', nombre: '4. Instalar Axios HTTP', comando: 'npm i axios', icono: '' },
    { tech: 'React / Vite', nombre: '5. Instalar Zustand (Estado Global)', comando: 'npm i zustand', icono: '' },
    { tech: 'React / Vite', nombre: '6. Instalar Lucide Icons', comando: 'npm i lucide-react', icono: '' },
    { tech: 'React / Vite', nombre: '7. Instalar Tailwind CSS + Config', comando: 'npm i -D tailwindcss postcss autoprefixer && npx tailwindcss init -p', icono: '' },
    { tech: 'React / Vite', nombre: '8. Iniciar Servidor de Desarrollo', comando: 'npm run dev', icono: '' },
    { tech: 'React / Vite', nombre: '9. Compilar Bundle de Producción', comando: 'npm run build', icono: '' },
    { tech: 'React / Vite', nombre: '10. Previsualizar Build Local', comando: 'npm run preview', icono: '' },
    { tech: 'Next.js', nombre: 'Iniciar Servidor Next.js', comando: 'npx next dev', icono: '' },
    
    // Node.js (Init -> Paquetes -> Desarrollo -> Mantenimiento)
    { tech: 'Node.js', nombre: '1. Inicializar Proyecto (package.json)', comando: 'npm init -y', icono: '' },
    { tech: 'Node.js', nombre: '2. Instalar Dependencias de package.json', comando: 'npm install', icono: '' },
    { tech: 'Node.js', nombre: '3. Instalar Express, CORS y Dotenv', comando: 'npm i express cors dotenv', icono: '' },
    { tech: 'Node.js', nombre: '4. Instalar TypeScript & Types (Dev)', comando: 'npm i -D typescript @types/node tsx', icono: '' },
    { tech: 'Node.js', nombre: '5. Ejecutar con Node Nativo (--watch)', comando: 'node --watch server.js', icono: '' },
    { tech: 'Node.js', nombre: '6. Ejecutar con Reinicio Automático', comando: 'npx nodemon index.js', icono: '' },
    { tech: 'Node.js', nombre: '7. Ejecutar TypeScript Directo', comando: 'npx tsx server.ts', icono: '' },
    { tech: 'Node.js', nombre: '8. Verificar Paquetes Desactualizados', comando: 'npm outdated', icono: '' },
    { tech: 'Node.js', nombre: '9. Auditar Vulnerabilidades y Reparar', comando: 'npm audit fix', icono: '' },
    { tech: 'Node.js', nombre: '10. Limpiar Caché de NPM', comando: 'npm cache clean --force', icono: '' },
    
    // PHP / XAMPP / Laravel (Creación -> Config -> BD -> Dev/Servidor -> Cleanup)
    { tech: 'PHP / XAMPP', nombre: 'Servidor PHP Integrado', comando: 'php -S localhost:8000', icono: '' },
    { tech: 'PHP / XAMPP', nombre: 'Servidor PHP con Carpeta Pública', comando: 'php -S localhost:8000 -t public', icono: '' },
    { tech: 'Laravel', nombre: '1. Crear Proyecto Nuevo Laravel', comando: 'composer create-project laravel/laravel mi-app', icono: '' },
    { tech: 'Laravel', nombre: '2. Generar Key de Aplicación', comando: 'php artisan key:generate', icono: '' },
    { tech: 'Laravel', nombre: '3. Crear Modelo + Migración + Control', comando: 'php artisan make:model Producto -mc', icono: '' },
    { tech: 'Laravel', nombre: '4. Crear Control API Resource', comando: 'php artisan make:controller Api/ProductoController --api', icono: '' },
    { tech: 'Laravel', nombre: '5. Ejecutar Migraciones', comando: 'php artisan migrate', icono: '' },
    { tech: 'Laravel', nombre: '6. Revertir Última Migración', comando: 'php artisan migrate:rollback', icono: '' },
    { tech: 'Laravel', nombre: '7. Resetear BD y Ejecutar Seeders', comando: 'php artisan migrate:fresh --seed', icono: '' },
    { tech: 'Laravel', nombre: '8. Listar Todas las Rutas', comando: 'php artisan route:list', icono: '' },
    { tech: 'Laravel', nombre: '9. Iniciar Servidor Artisan', comando: 'php artisan serve', icono: '' },
    { tech: 'Laravel', nombre: '10. Limpiar Cachés Generales', comando: 'php artisan optimize:clear', icono: '' },
    
    // Python / FastAPI / Django (Entorno -> Packages -> Serve)
    { tech: 'Python', nombre: '1. Crear Entorno Virtual', comando: 'python -m venv venv', icono: '' },
    { tech: 'Python', nombre: '2. Activar Entorno (Windows)', comando: '.\\venv\\Scripts\\activate', icono: '' },
    { tech: 'Python', nombre: '3. Instalar Requerimientos', comando: 'pip install -r requirements.txt', icono: '' },
    { tech: 'Python', nombre: '4. Servidor Uvicorn / FastAPI', comando: 'uvicorn main:app --reload --port 8000', icono: '' },
    { tech: 'Django', nombre: 'Iniciar Servidor Django', comando: 'python manage.py runserver', icono: '' },
    
    // Git (Init/Clone -> Branching -> Commits/Push -> Stash -> Merge -> Cleanup)
    { tech: 'Git', nombre: '1. Inicializar Repositorio Local', comando: 'git init', icono: '' },
    { tech: 'Git', nombre: '2. Clonar Repositorio Remoto', comando: 'git clone <url-repositorio>', icono: '' },
    { tech: 'Git', nombre: '3. Ver Estado de Archivos', comando: 'git status', icono: '' },
    { tech: 'Git', nombre: '4. Actualizar desde Remoto', comando: 'git pull origin main', icono: '' },
    { tech: 'Git', nombre: '5. Crear y Cambiar a Nueva Rama', comando: 'git checkout -b feature/nueva-rama', icono: '' },
    { tech: 'Git', nombre: '6. Sincronizar y Subir Cambios', comando: 'git add . && git commit -m "update" && git push', icono: '' },
    { tech: 'Git', nombre: '7. Guardar Cambios Temporalmente', comando: 'git stash', icono: '' },
    { tech: 'Git', nombre: '8. Recuperar Cambios Guardados', comando: 'git stash pop', icono: '' },
    { tech: 'Git', nombre: '9. Ver Historial de Commits', comando: 'git log --oneline -n 10', icono: '' },
    { tech: 'Git', nombre: '10. Fusionar Rama en la Actual', comando: 'git merge feature/nueva-rama', icono: '' },
    { tech: 'Git', nombre: '11. Deshacer Último Commit Local', comando: 'git reset --soft HEAD~1', icono: '' },
    { tech: 'Git', nombre: '12. Eliminar Rama Local', comando: 'git branch -d nombre-rama', icono: '' },
    
    // Docker
    { tech: 'Docker', nombre: '1. Levantar Contenedores en Fondo', comando: 'docker compose up -d', icono: '' },
    { tech: 'Docker', nombre: '2. Ver Contenedores Activos', comando: 'docker ps', icono: '' },
    { tech: 'Docker', nombre: '3. Detener Contenedores', comando: 'docker compose down', icono: '' }
  ];

  filtroTechComandos = 'todos';

  // Buscador Rápido Global (Spotlight)
  spotlightOpen = false;
  spotlightQuery = '';

  // Notas
  notas: any[] = [];
  gruposNotas: { [key: string]: any[] } = {};
  notasPanelOpen = false;
  modalAddSitioOpen = false;

  sitioEnEdicion: any = null;
  portalFijoEnEdicion: PortalFijo | null = null;
  newSitio = {
    nombre: '',
    url: '',
    icono: '',
    descripcion: '',
    categoria: 'personal' as 'personal' | 'fijo'
  };

  newNota = {
    categoria: '',
    titulo: '',
    contenido: ''
  };

  // Nota rápida (widget del inicio)
  notaRapida = {
    categoria: '',
    titulo: '',
    contenido: ''
  };
  guardandoNotaRapida = false;

  formError = '';
  notaError = '';

  // Feedback Toast Visual
  toast = {
    show: false,
    message: ''
  };
  private toastTimeout?: ReturnType<typeof setTimeout>;
  private clockInterval?: ReturnType<typeof setInterval>;

  // --- HORARIO & CLASES ---
  cursosSenati: any[] = [];
  clasesHoy: any[] = [];
  claseActual: any = null;
  proximaClase: any = null;
  loadingCursosSenati = false;

  readonly hoyIndex = new Date().getDay();
  diaSeleccionado = new Date().getDay();
  clasesDiaSeleccionado: any[] = [];
  semana: { index: number; label: string; count: number; esHoy: boolean }[] = [];
  proximaClaseSemana: any = null;

  // Modal para Crear / Editar Clase del Horario
  modalClaseOpen = false;
  claseEnEdicion: any = null;
  guardandoClase = false;
  claseError = '';

  readonly diasSemanaOpciones = [
    { index: 1, nombre: 'Lunes', abbr: 'Lun' },
    { index: 2, nombre: 'Martes', abbr: 'Mar' },
    { index: 3, nombre: 'Miércoles', abbr: 'Mié' },
    { index: 4, nombre: 'Jueves', abbr: 'Jue' },
    { index: 5, nombre: 'Viernes', abbr: 'Vie' },
    { index: 6, nombre: 'Sábado', abbr: 'Sáb' },
    { index: 0, nombre: 'Domingo', abbr: 'Dom' }
  ];

  readonly coloresClase = [
    '#f97316',
    '#38bdf8',
    '#10b981',
    '#a855f7',
    '#f59e0b',
    '#ef4444',
    '#06b6d4'
  ];

  formClase = {
    id: '',
    nombre: '',
    dia: 1,
    horaInicio: '08:00',
    horaFin: '12:00',
    profesor: '',
    linkTeams: '',
    linkBlackboard: '',
    color: '#f97316'
  };

  // --- GITHUB WIDGET DEV ---
  githubUsername = localStorage.getItem('central_github_user') || 'Vrak23';
  githubToken = localStorage.getItem('central_github_token') || '';
  githubRepos: any[] = [];
  githubUser: any = null;
  loadingGithub = false;
  githubError = '';
  editingGithubUser = false;
  githubInput = '';
  githubTokenInput = '';
  reposExpandidos = false;

  get reposVisibles(): any[] {
    return this.githubRepos.slice(0, 3);
  }

  toggleExpandirRepos() {
    this.reposExpandidos = !this.reposExpandidos;
  }

  // --- PWA & RECORDATORIOS DE CLASE ---
  deferredInstallPrompt: any = null;
  puedeInstalarPWA = false;
  notificacionesHabilitadas = false;
  private ultimaClaseNotificadaId: string | null = null;

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: any) {
    event.preventDefault();
    this.deferredInstallPrompt = event;
    this.puedeInstalarPWA = true;
    this.refreshView();
  }

  @HostListener('window:appinstalled')
  onAppInstalled() {
    this.puedeInstalarPWA = false;
    this.deferredInstallPrompt = null;
    this.showToast('¡Central Hub instalado en tu dispositivo! 🎉');
    this.refreshView();
  }

  async instalarPWA() {
    if (!this.deferredInstallPrompt) {
      this.showToast('Para instalar, pulsa "Agregar a pantalla de inicio" o "Instalar app" en tu navegador.');
      return;
    }
    this.deferredInstallPrompt.prompt();
    const choice = await this.deferredInstallPrompt.userChoice;
    if (choice && choice.outcome === 'accepted') {
      this.showToast('Instalando Central Hub...');
    }
    this.deferredInstallPrompt = null;
    this.puedeInstalarPWA = false;
    this.refreshView();
  }

  verificarPermisoNotificaciones() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.notificacionesHabilitadas = Notification.permission === 'granted';
    }
  }

  async solicitarNotificaciones() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      this.showToast('Tu navegador no soporta notificaciones');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      this.notificacionesHabilitadas = permission === 'granted';
      if (this.notificacionesHabilitadas) {
        this.showToast('¡Recordatorios de clase activados! 🔔');
        this.verificarRecordatorioProximaClase(true);
      } else {
        this.showToast('Permiso de notificaciones no habilitado');
      }
    } catch (e) {
      console.warn('Error al solicitar notificaciones:', e);
    }
    this.refreshView();
  }

  verificarRecordatorioProximaClase(forzar = false) {
    if (!this.notificacionesHabilitadas) return;
    const clase = this.claseActual || this.proximaClase;
    if (!clase) return;

    const ahora = new Date();
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
    const difMinutos = clase.inicioMin - minutosAhora;

    if (forzar || (difMinutos > 0 && difMinutos <= 15)) {
      if (this.ultimaClaseNotificadaId !== clase.id || forzar) {
        this.ultimaClaseNotificadaId = clase.id;
        const titulo = this.claseActual ? '🔴 Clase en curso' : '⏰ Próxima clase pronto';
        const cuerpo = forzar
          ? `${clase.nombre} • ${clase.horaFormateada} (${clase.profesor || 'Docente asignado'})`
          : `Tu clase de ${clase.nombre} inicia en ${difMinutos} minutos.`;

        const targetUrl = clase.link_teams || clase.link_blackboard || window.location.origin;

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(titulo, {
              body: cuerpo,
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-192x192.png',
              data: { url: targetUrl }
            });
          }).catch(() => {
            new Notification(titulo, { body: cuerpo, icon: '/icons/icon-192x192.png' });
          });
        } else {
          new Notification(titulo, { body: cuerpo, icon: '/icons/icon-192x192.png' });
        }
      }
    }
  }

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggleSpotlight();
    } else if (event.key === 'Escape') {
      if (this.spotlightOpen) {
        this.spotlightOpen = false;
        this.refreshView();
      }
      if (this.modalAddSitioOpen) {
        this.cerrarModal();
      }
      if (this.modalClaseOpen) {
        this.cerrarModalClase();
      }
      if (this.notasPanelOpen) {
        this.cerrarNotas();
      }
    } else if (event.key === 'Enter' && this.spotlightOpen) {
      if (this.spotlightResults.length > 0) {
        event.preventDefault();
        const first = this.spotlightResults[0];
        first.action();
        this.spotlightOpen = false;
        this.refreshView();
      }
    }
  }

  isImageUrl(icon?: string): boolean {
    if (!icon) return false;
    const clean = icon.trim();
    if (clean.startsWith('/') || clean.startsWith('./') || clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:image/')) {
      return true;
    }
    return /\.(png|jpe?g|svg|webp|ico|gif)$/i.test(clean);
  }

  // Listener global para cerrar cualquier dropdown o modal al dar clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // 1. Cerrar menús details (Apps y Hamburguesa) si el clic es fuera de ellos
    const openDetails = document.querySelectorAll('details.hamburger-menu[open]');
    openDetails.forEach(details => {
      if (!details.contains(target)) {
        details.removeAttribute('open');
      }
    });

    // 2. Cerrar modal de agregar sitio si se hace clic en el fondo exterior
    if (this.modalAddSitioOpen && target && target.id === 'modal-overlay') {
      this.cerrarModal();
    }

    // 3. Cerrar modal de agregar/editar clase si se hace clic en el fondo exterior
    if (this.modalClaseOpen && target && target.id === 'modal-clase-overlay') {
      this.cerrarModalClase();
    }
  }

  cerrarDropdowns() {
    const openDetails = document.querySelectorAll('details.hamburger-menu[open]');
    openDetails.forEach(details => details.removeAttribute('open'));
  }

  loadingApp = true;

  async ngOnInit() {
    this.loadingApp = true;
    this.updateDateTime();
    this.loadPortalesFijos();

    const savedVista = localStorage.getItem('central_vista_activa') as VistaDashboard;
    if (savedVista && ['inicio', 'sitios', 'github', 'chuletas'].includes(savedVista)) {
      this.vistaActiva = savedVista;
    }

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const vistaParam = urlParams.get('vista') as VistaDashboard;
      if (vistaParam && ['inicio', 'sitios', 'github', 'chuletas'].includes(vistaParam)) {
        this.vistaActiva = vistaParam;
      }
      this.verificarPermisoNotificaciones();
    }

    this.clockInterval = setInterval(() => {
      this.updateDateTime();
      this.analizarHorarioSenati();
      this.verificarRecordatorioProximaClase();
      this.refreshView();
    }, 60000);

    try {
      await Promise.allSettled([
        this.loadUserProfile(),
        this.loadSitios(),
        this.loadNotas(),
        this.loadCursosSenati(),
        this.loadGithubData()
      ]);
    } catch (err) {
      console.error('Error al inicializar la aplicación:', err);
    } finally {
      this.loadingApp = false;
      this.refreshView();
    }
  }

  ngOnDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  async loadUserProfile() {
    const user = await this.supabaseService.getUser();
    if (user) {
      const profile = await this.supabaseService.getProfile(user.id);
      let name = '';
      let lastName = '';
      
      if (profile) {
        name = profile.nombres || '';
        lastName = profile.apellidos || '';
      }
      
      if (!name) {
        name = user.user_metadata?.['nombres'] || user.email?.split('@')[0] || 'Usuario';
      }
      if (!lastName) {
        lastName = user.user_metadata?.['apellidos'] || '';
      }

      this.userName = name.trim() || user.email?.split('@')[0] || 'Usuario';
      this.userLastName = lastName.trim() || '';
      
      const firstChar = name ? name.trim().charAt(0) : 'U';
      const secondChar = lastName ? lastName.trim().charAt(0) : '';
      this.userInitials = (firstChar + secondChar).toUpperCase();
    }
  }

  updateDateTime() {
    const now = new Date();
    const hora = now.getHours();

    if (hora >= 5 && hora < 12) {
      this.saludo = 'Buenos días';
    } else if (hora >= 12 && hora < 19) {
      this.saludo = 'Buenas tardes';
    } else {
      this.saludo = 'Buenas noches';
    }

    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false
    };
    
    this.dateTimeString = now.toLocaleDateString('es-ES', options);
  }

  // --- NAVEGACIÓN DE PESTAÑAS ---
  cambiarVista(vista: VistaDashboard) {
    this.cerrarDropdowns();
    this.vistaActiva = vista;
    localStorage.setItem('central_vista_activa', vista);
    this.refreshView();
  }

  irACheatsheet() {
    this.cambiarVista('chuletas');
  }

  irADashboard() {
    this.cambiarVista('inicio');
  }

  formatDateSenati(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  // --- HORARIO & CLASES ---
  async loadCursosSenati() {
    this.loadingCursosSenati = true;
    try {
      const data = await this.supabaseService.getCursosSenati();
      if (data && data.length > 0) {
        this.cursosSenati = data;
        localStorage.setItem('central_cursos_senati', JSON.stringify(data));
      } else {
        const cached = localStorage.getItem('central_cursos_senati');
        if (cached) {
          this.cursosSenati = JSON.parse(cached);
        } else {
          this.cursosSenati = data || [];
        }
      }
      this.analizarHorarioSenati();
    } catch (e) {
      console.warn('Error cargando cursos senati:', e);
      const cached = localStorage.getItem('central_cursos_senati');
      if (cached) {
        this.cursosSenati = JSON.parse(cached);
        this.analizarHorarioSenati();
      }
    } finally {
      this.loadingCursosSenati = false;
      this.refreshView();
    }
  }

  extraerClasesParaDia(diaIndex: number): any[] {
    const mapDias = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
    const mapDiasAlt = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaAbbr = mapDias[diaIndex];
    const diaAlt = mapDiasAlt[diaIndex];

    const clases: any[] = [];
    for (const c of this.cursosSenati) {
      const hStr = (c.horario || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!hStr) continue;

      const coincideDia = hStr.includes(diaAbbr) || hStr.includes(diaAlt) ||
        (!hStr.includes('lun') && !hStr.includes('mar') && !hStr.includes('mie') && !hStr.includes('jue') && !hStr.includes('vie') && !hStr.includes('sab') && !hStr.includes('dom') && diaIndex >= 1 && diaIndex <= 5);

      if (coincideDia) {
        const timeMatches = hStr.match(/([0-1]?[0-9]|2[0-3]):([0-5][0-9])/g);
        let inicioMin = 0;
        let finMin = 24 * 60;
        let horaFormateada = c.horario;

        if (timeMatches && timeMatches.length >= 1) {
          const [hIni, mIni] = timeMatches[0].split(':').map(Number);
          inicioMin = hIni * 60 + mIni;

          if (timeMatches.length >= 2) {
            const [hFin, mFin] = timeMatches[1].split(':').map(Number);
            finMin = hFin * 60 + mFin;
            horaFormateada = `${timeMatches[0]} - ${timeMatches[1]}`;
          } else {
            finMin = inicioMin + 180;
            horaFormateada = `${timeMatches[0]} (Aprox. 3h)`;
          }
        }

        clases.push({
          ...c,
          horaFormateada,
          inicioMin,
          finMin
        });
      }
    }

    clases.sort((a, b) => a.inicioMin - b.inicioMin);
    return clases;
  }

  analizarHorarioSenati() {
    const ahora = new Date();
    const diaIndex = ahora.getDay();
    const horaActualMinutos = ahora.getHours() * 60 + ahora.getMinutes();

    // Construir semana de Lunes a Domingo
    const labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    this.semana = [1, 2, 3, 4, 5, 6, 0].map(idx => {
      const clases = this.extraerClasesParaDia(idx);
      return {
        index: idx,
        label: labels[idx],
        count: clases.length,
        esHoy: idx === diaIndex
      };
    });

    this.clasesHoy = this.extraerClasesParaDia(diaIndex);
    this.claseActual = null;
    this.proximaClase = null;

    for (const c of this.clasesHoy) {
      if (horaActualMinutos >= c.inicioMin && horaActualMinutos <= c.finMin) {
        this.claseActual = c;
      } else if (horaActualMinutos < c.inicioMin) {
        if (!this.proximaClase || c.inicioMin < this.proximaClase.inicioMin) {
          this.proximaClase = c;
        }
      }
    }

    this.actualizarClasesDiaSeleccionado();
    this.buscarProximaClaseSemana(diaIndex, horaActualMinutos);
  }

  seleccionarDia(diaIndex: number) {
    this.diaSeleccionado = diaIndex;
    this.actualizarClasesDiaSeleccionado();
    this.refreshView();
  }

  actualizarClasesDiaSeleccionado() {
    this.clasesDiaSeleccionado = this.extraerClasesParaDia(this.diaSeleccionado);
  }

  get nombreDiaSeleccionado(): string {
    return DIAS_NOMBRE[this.diaSeleccionado] || '';
  }

  buscarProximaClaseSemana(diaActual: number, minutosActual: number) {
    if (this.proximaClase) {
      this.proximaClaseSemana = { ...this.proximaClase, diaNombre: 'Hoy' };
      return;
    }
    for (let offset = 1; offset <= 7; offset++) {
      const targetDia = (diaActual + offset) % 7;
      const clases = this.extraerClasesParaDia(targetDia);
      if (clases.length > 0) {
        this.proximaClaseSemana = {
          ...clases[0],
          diaNombre: offset === 1 ? 'Mañana' : DIAS_NOMBRE[targetDia]
        };
        return;
      }
    }
    this.proximaClaseSemana = null;
  }

  // --- GESTIÓN / MODIFICACIÓN DEL HORARIO ---
  abrirModalAgregarClase() {
    this.claseEnEdicion = null;
    this.claseError = '';
    this.formClase = {
      id: '',
      nombre: '',
      dia: this.diaSeleccionado,
      horaInicio: '08:00',
      horaFin: '12:00',
      profesor: '',
      linkTeams: '',
      linkBlackboard: '',
      color: '#f97316'
    };
    this.modalClaseOpen = true;
    this.refreshView();
  }

  abrirModalEditarClase(c: any, event?: Event) {
    if (event) event.stopPropagation();
    this.claseEnEdicion = c;
    this.claseError = '';

    // Detectar día
    let diaDetectado = this.diaSeleccionado;
    const hStr = (c.horario || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const mapDias = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
    for (let i = 0; i < mapDias.length; i++) {
      if (hStr.includes(mapDias[i])) {
        diaDetectado = i;
        break;
      }
    }

    // Detectar horas
    const timeMatches = (c.horario || '').match(/([0-1]?[0-9]|2[0-3]):([0-5][0-9])/g);
    let horaInicio = '08:00';
    let horaFin = '12:00';
    if (timeMatches && timeMatches.length >= 1) {
      horaInicio = timeMatches[0].padStart(5, '0');
      if (timeMatches.length >= 2) {
        horaFin = timeMatches[1].padStart(5, '0');
      } else {
        const [h, m] = horaInicio.split(':').map(Number);
        const hFinCalc = Math.min(23, h + 3);
        horaFin = `${String(hFinCalc).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
    }

    this.formClase = {
      id: c.id,
      nombre: c.nombre || '',
      dia: diaDetectado,
      horaInicio,
      horaFin,
      profesor: c.profesor || '',
      linkTeams: c.link_teams || '',
      linkBlackboard: c.link_blackboard || '',
      color: c.color || '#f97316'
    };
    this.modalClaseOpen = true;
    this.refreshView();
  }

  cerrarModalClase() {
    this.modalClaseOpen = false;
    this.claseEnEdicion = null;
    this.claseError = '';
    this.refreshView();
  }

  onNombreCursoInput(nombre: string) {
    const cursoExistente = this.cursosSenati.find(
      c => c.nombre?.toLowerCase().trim() === nombre.toLowerCase().trim()
    );
    if (cursoExistente) {
      if (!this.formClase.profesor && cursoExistente.profesor) {
        this.formClase.profesor = cursoExistente.profesor;
      }
      if (!this.formClase.linkTeams && cursoExistente.link_teams) {
        this.formClase.linkTeams = cursoExistente.link_teams;
      }
      if (!this.formClase.linkBlackboard && cursoExistente.link_blackboard) {
        this.formClase.linkBlackboard = cursoExistente.link_blackboard;
      }
      if (cursoExistente.color) {
        this.formClase.color = cursoExistente.color;
      }
    }
  }

  get nombresCursosDisponibles(): string[] {
    const set = new Set<string>();
    this.cursosSenati.forEach(c => {
      if (c.nombre) set.add(c.nombre.trim());
    });
    return Array.from(set);
  }

  async guardarClase() {
    if (!this.formClase.nombre.trim()) {
      this.claseError = 'El nombre de la materia es obligatorio.';
      return;
    }
    if (!this.formClase.horaInicio) {
      this.claseError = 'La hora de inicio es obligatoria.';
      return;
    }

    const diaEncontrado = this.diasSemanaOpciones.find(d => d.index === this.formClase.dia);
    const diaNombre = diaEncontrado ? diaEncontrado.nombre : DIAS_NOMBRE[this.formClase.dia] || 'Lunes';
    const horarioStr = this.formClase.horaFin
      ? `${diaNombre} ${this.formClase.horaInicio} - ${this.formClase.horaFin}`
      : `${diaNombre} ${this.formClase.horaInicio}`;

    this.guardandoClase = true;
    this.claseError = '';

    try {
      if (this.claseEnEdicion && this.formClase.id) {
        await this.supabaseService.updateCursoSenati(this.formClase.id, {
          nombre: this.formClase.nombre.trim(),
          horario: horarioStr,
          profesor: this.formClase.profesor.trim(),
          link_teams: this.formClase.linkTeams.trim(),
          link_blackboard: this.formClase.linkBlackboard.trim(),
          color: this.formClase.color
        });
        this.showToast('¡Clase actualizada correctamente! 📅');
      } else {
        await this.supabaseService.addCursoSenati({
          nombre: this.formClase.nombre.trim(),
          horario: horarioStr,
          profesor: this.formClase.profesor.trim(),
          link_teams: this.formClase.linkTeams.trim(),
          link_blackboard: this.formClase.linkBlackboard.trim(),
          color: this.formClase.color
        });
        this.showToast('¡Clase agregada al horario! 📅');
      }

      this.cerrarModalClase();
      await this.loadCursosSenati();
    } catch (err: any) {
      console.error('Error al guardar clase:', err);
      this.claseError = err.message || 'Error al guardar la clase.';
    } finally {
      this.guardandoClase = false;
      this.refreshView();
    }
  }

  async eliminarClase(clase: any, event?: Event) {
    if (event) event.stopPropagation();
    const nombre = clase?.nombre || 'esta clase';
    const confirmar = confirm(`¿Estás seguro de eliminar "${nombre}" del horario?`);
    if (!confirmar) return;

    try {
      await this.supabaseService.deleteCursoSenati(clase.id);
      this.showToast('Clase eliminada del horario');
      if (this.modalClaseOpen) {
        this.cerrarModalClase();
      }
      await this.loadCursosSenati();
    } catch (err: any) {
      console.error('Error al eliminar clase:', err);
      this.showToast(err.message || 'Error al eliminar la clase');
    } finally {
      this.refreshView();
    }
  }

  // --- PORTALES AGRUPADOS ---
  get portalesPorGrupo(): GrupoPortales[] {
    const grupos: GrupoPortales[] = this.gruposMeta.map(g => ({
      id: g.id,
      titulo: g.titulo,
      items: []
    }));

    this.portalesFijos.forEach(p => {
      const targetId = p.grupo || 'herramientas';
      const g = grupos.find(x => x.id === targetId);
      if (g) {
        g.items.push({
          nombre: p.nombre,
          url: p.url,
          icono: p.icono,
          descripcion: p.descripcion,
          tipo: 'base',
          ref: p
        });
      }
    });

    this.sitiosFijosCustom.forEach(s => {
      const g = grupos.find(x => x.id === 'herramientas') || grupos[grupos.length - 1];
      g.items.push({
        nombre: s.nombre,
        url: s.url,
        icono: s.icono,
        descripcion: s.descripcion,
        tipo: 'db',
        ref: s
      });
    });

    return grupos.filter(g => g.items.length > 0);
  }

  get misSitiosItems(): ItemPortal[] {
    return this.sitiosPersonales.map(s => ({
      nombre: s.nombre,
      url: s.url,
      icono: s.icono,
      descripcion: s.descripcion,
      tipo: 'db',
      ref: s
    }));
  }

  get portalesDestacados(): ItemPortal[] {
    const list: ItemPortal[] = [];
    this.portalesFijos.slice(0, 6).forEach(p => {
      list.push({
        nombre: p.nombre,
        url: p.url,
        icono: p.icono,
        descripcion: p.descripcion,
        tipo: 'base',
        ref: p
      });
    });
    this.sitiosPersonales.slice(0, 2).forEach(s => {
      list.push({
        nombre: s.nombre,
        url: s.url,
        icono: s.icono,
        descripcion: s.descripcion,
        tipo: 'db',
        ref: s
      });
    });
    return list;
  }

  get notasRecientes(): any[] {
    return this.notas.slice(0, 4);
  }

  async agregarNotaRapida() {
    const categoria = this.notaRapida.categoria.trim() || 'General';
    const titulo = this.notaRapida.titulo.trim();
    const contenido = this.notaRapida.contenido.trim();

    if (!titulo) {
      this.showToast('El título de la nota es obligatorio');
      return;
    }

    this.guardandoNotaRapida = true;
    try {
      await this.supabaseService.addNota(categoria, titulo, contenido);
      this.notaRapida = { categoria: '', titulo: '', contenido: '' };
      await this.loadNotas();
      this.showToast('¡Nota guardada! 📝');
    } catch (err: any) {
      console.error(err);
      this.showToast(err.message || 'Error al guardar la nota');
    } finally {
      this.guardandoNotaRapida = false;
      this.refreshView();
    }
  }

  // --- GITHUB WIDGET DEV ---
  async loadGithubData() {
    if (!this.githubUsername) return;
    this.loadingGithub = true;
    this.githubError = '';
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json'
      };
      if (this.githubToken) {
        headers['Authorization'] = `Bearer ${this.githubToken.trim()}`;
      }

      // Si hay token, consultar endpoint autenticado /user, de lo contrario consultar /users/:username
      const userUrl = this.githubToken
        ? 'https://api.github.com/user'
        : `https://api.github.com/users/${encodeURIComponent(this.githubUsername)}`;

      const resUser = await fetch(userUrl, { headers });
      if (resUser.ok) {
        this.githubUser = await resUser.json();
        if (this.githubToken && this.githubUser?.login) {
          this.githubUsername = this.githubUser.login;
          localStorage.setItem('central_github_user', this.githubUser.login);
        }
      } else {
        this.githubUser = null;
        this.githubError = resUser.status === 401
          ? 'Token de GitHub inválido o expirado.'
          : 'Usuario de GitHub no encontrado.';
      }

      // Si hay token, consultar /user/repos para incluir repositorios privados
      const reposUrl = this.githubToken
        ? 'https://api.github.com/user/repos?sort=updated&per_page=50&affiliation=owner,collaborator'
        : `https://api.github.com/users/${encodeURIComponent(this.githubUsername)}/repos?sort=updated&per_page=30`;

      const resRepos = await fetch(reposUrl, { headers });
      if (resRepos.ok) {
        this.githubRepos = await resRepos.json();
      } else {
        this.githubRepos = [];
      }
    } catch (err: any) {
      console.warn('Error consultando GitHub API:', err);
      this.githubError = 'No se pudo conectar con GitHub API.';
    } finally {
      this.loadingGithub = false;
      this.refreshView();
    }
  }

  iniciarEdicionGithub() {
    this.githubInput = this.githubUsername;
    this.githubTokenInput = this.githubToken;
    this.editingGithubUser = true;
  }

  cancelarEdicionGithub() {
    this.editingGithubUser = false;
  }

  guardarGithubUser() {
    const user = this.githubInput.trim();
    const token = this.githubTokenInput.trim();

    if (user) {
      this.githubUsername = user;
      localStorage.setItem('central_github_user', user);
    }

    this.githubToken = token;
    if (token) {
      localStorage.setItem('central_github_token', token);
    } else {
      localStorage.removeItem('central_github_token');
    }

    this.editingGithubUser = false;
    this.loadGithubData();
    this.showToast('Configuración de GitHub guardada');
  }

  getLangColor(lang: string): string {
    const colors: { [key: string]: string } = {
      TypeScript: '#3178c6',
      JavaScript: '#f7df1e',
      HTML: '#e34f26',
      CSS: '#563d7c',
      PHP: '#4F5D95',
      Python: '#3572A5',
      Java: '#b07219',
      'C#': '#178600',
      Shell: '#89e051'
    };
    return colors[lang] || '#94a3b8';
  }

  // --- SPOTLIGHT QUICK SEARCH ---
  toggleSpotlight() {
    this.spotlightOpen = !this.spotlightOpen;
    this.spotlightQuery = '';
    this.refreshView();
    if (this.spotlightOpen) {
      setTimeout(() => {
        const input = document.getElementById('spotlight-input');
        input?.focus();
      }, 50);
    }
  }

  get spotlightResults() {
    const q = this.spotlightQuery.trim().toLowerCase();
    if (!q) return [];

    const results: { type: string; title: string; subtitle: string; icon: string; action: () => void }[] = [];

    // Pestañas / Secciones
    if ('inicio dashboard home'.includes(q)) {
      results.push({
        type: 'Pestaña',
        title: 'Inicio (Dashboard)',
        subtitle: 'Clase de hoy, accesos y notas rápidas',
        icon: '',
        action: () => this.cambiarVista('inicio')
      });
    }

    if ('sitios portales enlaces links'.includes(q)) {
      results.push({
        type: 'Pestaña',
        title: 'Portales & Sitios',
        subtitle: 'Ver todos los accesos agrupados',
        icon: '',
        action: () => this.cambiarVista('sitios')
      });
    }

    if ('github repos repositorios proyectos code'.includes(q)) {
      results.push({
        type: 'Pestaña',
        title: 'GitHub Workspace',
        subtitle: 'Ver tus repositorios y proyectos',
        icon: '',
        action: () => this.cambiarVista('github')
      });
    }

    if ('chuletas comandos servidores dev terminal cheat'.includes(q)) {
      results.push({
        type: 'Pestaña',
        title: 'Chuletas & Comandos Dev',
        subtitle: 'Ver catálogo de comandos de servidores',
        icon: '',
        action: () => this.cambiarVista('chuletas')
      });
    }

    if ('notas apuntes block'.includes(q)) {
      results.push({
        type: 'Herramienta',
        title: 'Notas Rápidas',
        subtitle: 'Abrir panel completo de notas',
        icon: '',
        action: () => this.abrirNotas()
      });
    }

    // Portales Fijos
    this.portalesFijos.forEach(p => {
      if (p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q)) {
        results.push({
          type: 'Portal',
          title: p.nombre,
          subtitle: p.url,
          icon: p.icono,
          action: () => window.open(p.url, '_blank')
        });
      }
    });

    // Sitios Personales
    this.sitios.forEach(s => {
      if (s.nombre.toLowerCase().includes(q) || s.url.toLowerCase().includes(q)) {
        results.push({
          type: 'Mi Sitio',
          title: s.nombre,
          subtitle: s.url,
          icon: s.icono || '',
          action: () => window.open(s.url, '_blank')
        });
      }
    });

    // Comandos Dev
    this.comandosDev.forEach(c => {
      if (c.nombre.toLowerCase().includes(q) || c.tech.toLowerCase().includes(q) || c.comando.toLowerCase().includes(q)) {
        results.push({
          type: 'Comando',
          title: c.nombre,
          subtitle: c.comando,
          icon: c.icono,
          action: () => this.copiarComando(c.comando)
        });
      }
    });

    return results.slice(0, 8);
  }

  // --- CHEAT SHEET COMANDOS ---
  get techsDisponibles(): string[] {
    const list = Array.from(new Set(this.comandosDev.map(c => c.tech)));
    return ['todos', ...list];
  }

  get comandosFiltrados(): DevComando[] {
    if (this.filtroTechComandos === 'todos') {
      return this.comandosDev;
    }
    return this.comandosDev.filter(c => c.tech === this.filtroTechComandos);
  }

  async copiarComando(comando: string) {
    try {
      await navigator.clipboard.writeText(comando);
      this.showToast('¡Comando copiado!');
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  }

  showToast(message: string) {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toast = {
      show: true,
      message
    };
    this.refreshView();
    this.toastTimeout = setTimeout(() => {
      this.toast.show = false;
      this.refreshView();
    }, 2500);
  }

  // --- PORTALES & SITIOS ---
  loadPortalesFijos() {
    try {
      const saved = localStorage.getItem('central_fixed_portals_custom');
      if (saved) {
        const customOverrides = JSON.parse(saved);
        this.portalesFijos = this.defaultPortalesFijos.map(p => {
          if (customOverrides[p.id]) {
            return { ...p, ...customOverrides[p.id] };
          }
          return { ...p };
        });
        return;
      }
    } catch (e) {
      console.warn('Error reading portal overrides', e);
    }
    this.portalesFijos = [...this.defaultPortalesFijos];
  }

  actualizarPortalFijo(id: string, updates: Partial<PortalFijo>) {
    try {
      const saved = localStorage.getItem('central_fixed_portals_custom');
      let customOverrides: Record<string, Partial<PortalFijo>> = saved ? JSON.parse(saved) : {};
      customOverrides[id] = { ...customOverrides[id], ...updates };
      localStorage.setItem('central_fixed_portals_custom', JSON.stringify(customOverrides));
    } catch (e) {
      console.warn('Error saving portal override', e);
    }
    this.loadPortalesFijos();
  }

  restaurarPortalFijo(id: string) {
    try {
      const saved = localStorage.getItem('central_fixed_portals_custom');
      if (saved) {
        const customOverrides = JSON.parse(saved);
        delete customOverrides[id];
        localStorage.setItem('central_fixed_portals_custom', JSON.stringify(customOverrides));
      }
    } catch (e) {}
    this.loadPortalesFijos();
    this.showToast('Portal restaurado a su logo original');
  }

  async loadSitios() {
    this.sitios = await this.supabaseService.getSitios();
    this.refreshView();
  }

  get sitiosPersonales() {
    return this.sitios.filter(s => s.categoria === 'personal' || !s.categoria);
  }

  get sitiosFijosCustom() {
    return this.sitios.filter(s => s.categoria === 'fijo');
  }

  abrirModal() {
    this.sitioEnEdicion = null;
    this.portalFijoEnEdicion = null;
    this.newSitio = { nombre: '', url: '', icono: '', descripcion: '', categoria: 'personal' };
    this.modalAddSitioOpen = true;
    this.formError = '';
  }

  abrirModalEditar(sitio: any, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.portalFijoEnEdicion = null;
    this.sitioEnEdicion = sitio;
    this.newSitio = {
      nombre: sitio.nombre || '',
      url: sitio.url || '',
      icono: sitio.icono || '',
      descripcion: sitio.descripcion || '',
      categoria: sitio.categoria || 'personal'
    };
    this.modalAddSitioOpen = true;
    this.formError = '';
  }

  abrirModalEditarPortal(portal: PortalFijo, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.sitioEnEdicion = null;
    this.portalFijoEnEdicion = portal;
    this.newSitio = {
      nombre: portal.nombre || '',
      url: portal.url || '',
      icono: portal.icono || '',
      descripcion: portal.descripcion || '',
      categoria: 'fijo'
    };
    this.modalAddSitioOpen = true;
    this.formError = '';
  }

  cerrarModal() {
    this.modalAddSitioOpen = false;
    this.sitioEnEdicion = null;
    this.portalFijoEnEdicion = null;
    this.newSitio = { nombre: '', url: '', icono: '', descripcion: '', categoria: 'personal' };
    this.formError = '';
  }

  onLogoFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.formError = 'Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG, WebP, ICO, GIF).';
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.formError = 'La imagen no debe superar los 5MB.';
      input.value = '';
      return;
    }

    this.formError = '';

    // Si es SVG, leer directamente como Data URL
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        this.newSitio.icono = reader.result as string;
        input.value = '';
        this.refreshView();
      };
      reader.readAsDataURL(file);
      return;
    }

    // Imagen raster (PNG, JPG, WebP, etc.): optimizar/redimensionar a 256x256 max para rapidez y ligereza
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          this.newSitio.icono = canvas.toDataURL('image/png');
        } else {
          this.newSitio.icono = e.target.result;
        }
        input.value = '';
        this.refreshView();
      };
      img.onerror = () => {
        this.formError = 'Error al procesar la imagen seleccionada.';
        input.value = '';
        this.refreshView();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  detectarFaviconAuto() {
    let url = this.newSitio.url.trim();
    if (!url) {
      this.formError = 'Ingresa primero la URL del sitio para detectar su logo.';
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    try {
      const parsed = new URL(url);
      const domain = parsed.hostname;
      this.newSitio.icono = `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
      this.formError = '';
      this.showToast('Logo obtenido del dominio');
      this.refreshView();
    } catch {
      this.formError = 'URL no válida para obtener el logo.';
    }
  }

  limpiarLogo() {
    this.newSitio.icono = '';
    this.refreshView();
  }

  restaurarLogoOriginalPortal() {
    if (!this.portalFijoEnEdicion) return;
    const original = this.defaultPortalesFijos.find(p => p.id === this.portalFijoEnEdicion?.id);
    if (original) {
      this.newSitio.icono = original.icono;
      this.refreshView();
    }
  }

  resolverIcono(url: string, iconoIngresado: string): string {
    if (iconoIngresado && iconoIngresado.trim()) return iconoIngresado.trim();

    const dominios = [
      { match: 'youtube.com',       favicon: 'youtube.com' },
      { match: 'github.com',        favicon: 'github.com' },
      { match: 'stackoverflow.com', favicon: 'stackoverflow.com' },
      { match: 'vercel.com',        favicon: 'vercel.com' },
      { match: 'supabase.com',      favicon: 'supabase.com' }
    ];

    for (const d of dominios) {
      if (url.includes(d.match)) {
        return `https://www.google.com/s2/favicons?sz=128&domain=${d.favicon}`;
      }
    }

    try {
      const parsed = new URL(url);
      return `https://www.google.com/s2/favicons?sz=128&domain=${parsed.hostname}`;
    } catch {
      return '';
    }
  }

  async agregarSitio() {
    let { nombre, url, icono, descripcion, categoria } = this.newSitio;
    nombre = nombre.trim();
    url = url.trim();
    descripcion = descripcion.trim();

    if (!nombre || !url) {
      this.formError = 'Nombre y URL son obligatorios.';
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const iconoFinal = this.resolverIcono(url, icono);
    this.formError = '';

    try {
      if (this.portalFijoEnEdicion) {
        this.actualizarPortalFijo(this.portalFijoEnEdicion.id, {
          nombre,
          url,
          icono: iconoFinal,
          descripcion
        });
        this.showToast('¡Portal fijo actualizado!');
        this.portalFijoEnEdicion = null;
      } else if (this.sitioEnEdicion) {
        await this.supabaseService.updateSitio(this.sitioEnEdicion.id, nombre, url, iconoFinal, categoria, descripcion);
        await this.loadSitios();
        this.showToast('¡Sitio actualizado con éxito!');
      } else {
        await this.supabaseService.addSitio(nombre, url, iconoFinal, categoria, descripcion);
        await this.loadSitios();
        this.showToast('¡Sitio agregado con éxito!');
      }
      this.cerrarModal();
      this.refreshView();
    } catch (err: any) {
      console.error(err);
      this.formError = err.message || 'Error al guardar el sitio.';
      this.refreshView();
    }
  }

  async eliminarSitio(id: number) {
    if (!confirm('¿Eliminar este sitio?')) return;

    try {
      await this.supabaseService.deleteSitio(id);
      await this.loadSitios();
      this.showToast('Sitio eliminado');
      this.refreshView();
    } catch (err) {
      console.error('Error al eliminar sitio:', err);
      this.refreshView();
    }
  }

  // --- NOTAS CRUD ---
  async loadNotas() {
    this.notas = await this.supabaseService.getNotas();
    this.groupNotes();
    this.refreshView();
  }

  groupNotes() {
    this.gruposNotas = {};
    this.notas.forEach(nota => {
      const cat = nota.categoria || 'General';
      if (!this.gruposNotas[cat]) {
        this.gruposNotas[cat] = [];
      }
      this.gruposNotas[cat].push(nota);
    });
  }

  get keysGruposNotas() {
    return Object.keys(this.gruposNotas);
  }

  abrirNotas() {
    this.cerrarDropdowns();
    this.notasPanelOpen = true;
    this.loadNotas();
  }

  cerrarNotas() {
    this.notasPanelOpen = false;
  }

  limpiarFormNota() {
    this.newNota = { categoria: '', titulo: '', contenido: '' };
    this.notaError = '';
  }

  async agregarNota() {
    const categoria = this.newNota.categoria.trim();
    const titulo = this.newNota.titulo.trim();
    const contenido = this.newNota.contenido.trim();

    if (!categoria || !titulo) {
      this.notaError = 'Categoría y título son obligatorios.';
      return;
    }

    this.notaError = '';

    try {
      await this.supabaseService.addNota(categoria, titulo, contenido);
      this.limpiarFormNota();
      await this.loadNotas();
      this.showToast('¡Nota guardada!');
    } catch (err: any) {
      console.error(err);
      this.notaError = err.message || 'Error al agregar la nota.';
      this.refreshView();
    }
  }

  async guardarEdicion(id: number, event: any) {
    const el = event.target;
    const contenido = el.innerText.trim();
    
    try {
      await this.supabaseService.updateNota(id, contenido);
      await this.loadNotas();
    } catch (err) {
      console.error('Error al editar nota:', err);
      this.refreshView();
    }
  }

  async eliminarNota(id: number) {
    if (!confirm('¿Eliminar esta nota?')) return;

    try {
      await this.supabaseService.deleteNota(id);
      await this.loadNotas();
      this.showToast('Nota eliminada');
    } catch (err) {
      console.error('Error al eliminar nota:', err);
      this.refreshView();
    }
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  async onLogout() {
    await this.supabaseService.signOut();
    this.router.navigate(['/login']);
  }

  private refreshView() {
    this.cdr.detectChanges();
  }
}
