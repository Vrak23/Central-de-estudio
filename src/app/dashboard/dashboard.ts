import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase';
import { MicrosoftSenatiService, TeamsClassEvent, M365UserProfile } from '../services/microsoft-senati.service';

export interface DevComando {
  tech: string;
  nombre: string;
  comando: string;
  descripcion?: string;
  icono: string;
}

export interface PortalFijo {
  id: string;
  nombre: string;
  url: string;
  icono: string;
  descripcion: string;
}

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

  // Vista actual: 'dashboard' o 'chuletas'
  vistaActiva: 'dashboard' | 'chuletas' = 'dashboard';

  // Portales y Sitios
  sitios: any[] = [];
  
  // Portales Fijos con Logos Oficiales Locales
  portalesFijos: PortalFijo[] = [
    {
      id: 'bb',
      nombre: 'Blackboard SENATI',
      url: 'https://senati.blackboard.com/',
      icono: '/img/blackboard.svg',
      descripcion: 'Entregables y clases de SENATI.'
    },
    {
      id: 'outlook',
      nombre: 'Outlook SENATI',
      url: 'https://outlook.cloud.microsoft/mail/',
      icono: '/img/outlook.svg',
      descripcion: 'Correo institucional de SENATI.'
    },
    {
      id: 'drive',
      nombre: 'Google Drive',
      url: 'https://drive.google.com',
      icono: '/img/drive.svg',
      descripcion: 'Documentación y archivos en la nube.'
    },
    {
      id: 'github',
      nombre: 'GitHub',
      url: 'https://github.com',
      icono: '/img/github.svg',
      descripcion: 'Repositorios y control de versiones.'
    },
    {
      id: 'vercel',
      nombre: 'Vercel Dashboard',
      url: 'https://vercel.com/dashboard',
      icono: '/img/vercel.svg',
      descripcion: 'Despliegues y proyectos en producción.'
    },
    {
      id: 'supabase',
      nombre: 'Supabase Cloud',
      url: 'https://supabase.com/dashboard',
      icono: '/img/supabase.svg',
      descripcion: 'Base de datos PostgreSQL y Auth.'
    },
    {
      id: 'chatgpt',
      nombre: 'ChatGPT',
      url: 'https://chatgpt.com',
      icono: '/img/chatgpt.svg',
      descripcion: 'Asistente de IA y resolución de dudas.'
    },
    {
      id: 'notion',
      nombre: 'Notion',
      url: 'https://notion.so',
      icono: '/img/notion.svg',
      descripcion: 'Apuntes, gestión y documentación.'
    }
  ];

  // Catálogo Completo de Chuletas Dev (Ordenados por Flujo de Trabajo Natural)
  comandosDev: DevComando[] = [
    // Angular (Creación -> Desarrollo -> Pruebas -> Build/Update)
    { tech: 'Angular', nombre: '1. Generar Módulo', comando: 'ng g m nombre-modulo', icono: '🅰️' },
    { tech: 'Angular', nombre: '2. Generar Componente', comando: 'ng g c nombre-componente', icono: '🅰️' },
    { tech: 'Angular', nombre: '3. Generar Servicio', comando: 'ng g s services/nombre', icono: '🅰️' },
    { tech: 'Angular', nombre: '4. Generar Interface / Modelo', comando: 'ng g i models/usuario', icono: '🅰️' },
    { tech: 'Angular', nombre: '5. Generar Guard de Autenticación', comando: 'ng g g guards/auth', icono: '🅰️' },
    { tech: 'Angular', nombre: '6. Generar Interceptor HTTP', comando: 'ng g interceptor core/jwt', icono: '🅰️' },
    { tech: 'Angular', nombre: '7. Generar Pipe Personalizado', comando: 'ng g p pipes/filtro', icono: '🅰️' },
    { tech: 'Angular', nombre: '8. Iniciar Servidor Local', comando: 'ng serve --port 4200', icono: '🅰️' },
    { tech: 'Angular', nombre: '9. Iniciar con Apertura Automática', comando: 'ng serve -o', icono: '🅰️' },
    { tech: 'Angular', nombre: '10. Ejecutar Pruebas Unitarias', comando: 'ng test', icono: '🅰️' },
    { tech: 'Angular', nombre: '11. Compilar Producción', comando: 'ng build', icono: '🅰️' },
    { tech: 'Angular', nombre: '12. Actualizar Angular CLI y Core', comando: 'ng update @angular/cli @angular/core', icono: '🅰️' },
    
    // React / Vite / Next.js (Creación -> Dependencias -> Dev -> Build)
    { tech: 'React / Vite', nombre: '1. Crear Proyecto Vite (TS)', comando: 'npm create vite@latest mi-app -- --template react-ts', icono: '⚡' },
    { tech: 'React / Vite', nombre: '2. Crear Proyecto Vite (JS)', comando: 'npm create vite@latest mi-app -- --template react', icono: '⚡' },
    { tech: 'React / Vite', nombre: '3. Instalar React Router DOM', comando: 'npm i react-router-dom', icono: '⚡' },
    { tech: 'React / Vite', nombre: '4. Instalar Axios HTTP', comando: 'npm i axios', icono: '⚡' },
    { tech: 'React / Vite', nombre: '5. Instalar Zustand (Estado Global)', comando: 'npm i zustand', icono: '⚡' },
    { tech: 'React / Vite', nombre: '6. Instalar Lucide Icons', comando: 'npm i lucide-react', icono: '⚡' },
    { tech: 'React / Vite', nombre: '7. Instalar Tailwind CSS + Config', comando: 'npm i -D tailwindcss postcss autoprefixer && npx tailwindcss init -p', icono: '⚡' },
    { tech: 'React / Vite', nombre: '8. Iniciar Servidor de Desarrollo', comando: 'npm run dev', icono: '⚡' },
    { tech: 'React / Vite', nombre: '9. Compilar Bundle de Producción', comando: 'npm run build', icono: '⚡' },
    { tech: 'React / Vite', nombre: '10. Previsualizar Build Local', comando: 'npm run preview', icono: '⚡' },
    { tech: 'Next.js', nombre: 'Iniciar Servidor Next.js', comando: 'npx next dev', icono: '▲' },
    
    // Node.js (Init -> Paquetes -> Desarrollo -> Mantenimiento)
    { tech: 'Node.js', nombre: '1. Inicializar Proyecto (package.json)', comando: 'npm init -y', icono: '🟢' },
    { tech: 'Node.js', nombre: '2. Instalar Dependencias de package.json', comando: 'npm install', icono: '🟢' },
    { tech: 'Node.js', nombre: '3. Instalar Express, CORS y Dotenv', comando: 'npm i express cors dotenv', icono: '🟢' },
    { tech: 'Node.js', nombre: '4. Instalar TypeScript & Types (Dev)', comando: 'npm i -D typescript @types/node tsx', icono: '🟢' },
    { tech: 'Node.js', nombre: '5. Ejecutar con Node Nativo (--watch)', comando: 'node --watch server.js', icono: '🟢' },
    { tech: 'Node.js', nombre: '6. Ejecutar con Reinicio Automático', comando: 'npx nodemon index.js', icono: '🟢' },
    { tech: 'Node.js', nombre: '7. Ejecutar TypeScript Directo', comando: 'npx tsx server.ts', icono: '🟢' },
    { tech: 'Node.js', nombre: '8. Verificar Paquetes Desactualizados', comando: 'npm outdated', icono: '🟢' },
    { tech: 'Node.js', nombre: '9. Auditar Vulnerabilidades y Reparar', comando: 'npm audit fix', icono: '🟢' },
    { tech: 'Node.js', nombre: '10. Limpiar Caché de NPM', comando: 'npm cache clean --force', icono: '🟢' },
    
    // PHP / XAMPP / Laravel (Creación -> Config -> BD -> Dev/Servidor -> Cleanup)
    { tech: 'PHP / XAMPP', nombre: 'Servidor PHP Integrado', comando: 'php -S localhost:8000', icono: '🐘' },
    { tech: 'PHP / XAMPP', nombre: 'Servidor PHP con Carpeta Pública', comando: 'php -S localhost:8000 -t public', icono: '🐘' },
    { tech: 'Laravel', nombre: '1. Crear Proyecto Nuevo Laravel', comando: 'composer create-project laravel/laravel mi-app', icono: '🔴' },
    { tech: 'Laravel', nombre: '2. Generar Key de Aplicación', comando: 'php artisan key:generate', icono: '🔴' },
    { tech: 'Laravel', nombre: '3. Crear Modelo + Migración + Control', comando: 'php artisan make:model Producto -mc', icono: '🔴' },
    { tech: 'Laravel', nombre: '4. Crear Control API Resource', comando: 'php artisan make:controller Api/ProductoController --api', icono: '🔴' },
    { tech: 'Laravel', nombre: '5. Ejecutar Migraciones', comando: 'php artisan migrate', icono: '🔴' },
    { tech: 'Laravel', nombre: '6. Revertir Última Migración', comando: 'php artisan migrate:rollback', icono: '🔴' },
    { tech: 'Laravel', nombre: '7. Resetear BD y Ejecutar Seeders', comando: 'php artisan migrate:fresh --seed', icono: '🔴' },
    { tech: 'Laravel', nombre: '8. Listar Todas las Rutas', comando: 'php artisan route:list', icono: '🔴' },
    { tech: 'Laravel', nombre: '9. Iniciar Servidor Artisan', comando: 'php artisan serve', icono: '🔴' },
    { tech: 'Laravel', nombre: '10. Limpiar Cachés Generales', comando: 'php artisan optimize:clear', icono: '🔴' },
    
    // Python / FastAPI / Django (Entorno -> Packages -> Serve)
    { tech: 'Python', nombre: '1. Crear Entorno Virtual', comando: 'python -m venv venv', icono: '🐍' },
    { tech: 'Python', nombre: '2. Activar Entorno (Windows)', comando: '.\\venv\\Scripts\\activate', icono: '🐍' },
    { tech: 'Python', nombre: '3. Instalar Requerimientos', comando: 'pip install -r requirements.txt', icono: '🐍' },
    { tech: 'Python', nombre: '4. Servidor Uvicorn / FastAPI', comando: 'uvicorn main:app --reload --port 8000', icono: '🐍' },
    { tech: 'Django', nombre: 'Iniciar Servidor Django', comando: 'python manage.py runserver', icono: '🟩' },
    
    // Git (Init/Clone -> Branching -> Commits/Push -> Stash -> Merge -> Cleanup)
    { tech: 'Git', nombre: '1. Inicializar Repositorio Local', comando: 'git init', icono: '🐙' },
    { tech: 'Git', nombre: '2. Clonar Repositorio Remoto', comando: 'git clone <url-repositorio>', icono: '🐙' },
    { tech: 'Git', nombre: '3. Ver Estado de Archivos', comando: 'git status', icono: '🐙' },
    { tech: 'Git', nombre: '4. Actualizar desde Remoto', comando: 'git pull origin main', icono: '🐙' },
    { tech: 'Git', nombre: '5. Crear y Cambiar a Nueva Rama', comando: 'git checkout -b feature/nueva-rama', icono: '🐙' },
    { tech: 'Git', nombre: '6. Sincronizar y Subir Cambios', comando: 'git add . && git commit -m "update" && git push', icono: '🐙' },
    { tech: 'Git', nombre: '7. Guardar Cambios Temporalmente', comando: 'git stash', icono: '🐙' },
    { tech: 'Git', nombre: '8. Recuperar Cambios Guardados', comando: 'git stash pop', icono: '🐙' },
    { tech: 'Git', nombre: '9. Ver Historial de Commits', comando: 'git log --oneline -n 10', icono: '🐙' },
    { tech: 'Git', nombre: '10. Fusionar Rama en la Actual', comando: 'git merge feature/nueva-rama', icono: '🐙' },
    { tech: 'Git', nombre: '11. Deshacer Último Commit Local', comando: 'git reset --soft HEAD~1', icono: '🐙' },
    { tech: 'Git', nombre: '12. Eliminar Rama Local', comando: 'git branch -d nombre-rama', icono: '🐙' },
    
    // Docker
    { tech: 'Docker', nombre: '1. Levantar Contenedores en Fondo', comando: 'docker compose up -d', icono: '🐳' },
    { tech: 'Docker', nombre: '2. Ver Contenedores Activos', comando: 'docker ps', icono: '🐳' },
    { tech: 'Docker', nombre: '3. Detener Contenedores', comando: 'docker compose down', icono: '🐳' }
  ];

  filtroTechComandos = 'todos';

  // Resumen de Tareas SENATI
  tareasSenati: any[] = [];
  senatiDrawerOpen = false;
  loadingTareasSenati = false;

  // Buscador Rápido Global (Spotlight)
  spotlightOpen = false;
  spotlightQuery = '';

  // Notas
  notas: any[] = [];
  gruposNotas: { [key: string]: any[] } = {};
  notasPanelOpen = false;
  modalAddSitioOpen = false;

  sitioEnEdicion: any = null;
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

  formError = '';
  notaError = '';

  // Feedback Toast Visual
  toast = {
    show: false,
    message: ''
  };
  private toastTimeout?: ReturnType<typeof setTimeout>;
  private clockInterval?: ReturnType<typeof setInterval>;

  // --- SENATI HORARIO & CLASES ---
  cursosSenati: any[] = [];
  clasesHoy: any[] = [];
  claseActual: any = null;
  proximaClase: any = null;
  loadingCursosSenati = false;

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
  reposExpandidos = false; // Por defecto minimizados (muestra solo 3)

  get reposVisibles(): any[] {
    if (this.reposExpandidos) {
      return this.githubRepos;
    }
    return this.githubRepos.slice(0, 3);
  }

  toggleExpandirRepos() {
    this.reposExpandidos = !this.reposExpandidos;
  }

  // --- ECOSISTEMA URLS (LOCAL & PROD) ---
  senatiPortalUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4201' : 'https://senati-portal.vercel.app/';
  bitacoraUrl = 'https://bitacora-senati.vercel.app/';

  // --- MICROSOFT 365 SENATI ---
  m365Profile: M365UserProfile | null = null;
  m365FeedUrl = '';
  modalM365Open = false;
  isSyncingM365 = false;
  teamsEventsToday: TeamsClassEvent[] = [];
  m365InputName = '';
  m365InputEmail = '';

  constructor(
    private supabaseService: SupabaseService,
    public m365Service: MicrosoftSenatiService,
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
      if (this.notasPanelOpen) {
        this.cerrarNotas();
      }
      if (this.senatiDrawerOpen) {
        this.cerrarSenatiDrawer();
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
  }

  abrirSenatiDrawer() {
    this.cerrarDropdowns();
    this.senatiDrawerOpen = true;
    this.refreshView();
  }

  cerrarSenatiDrawer() {
    this.senatiDrawerOpen = false;
    this.refreshView();
  }

  cerrarDropdowns() {
    const openDetails = document.querySelectorAll('details.hamburger-menu[open]');
    openDetails.forEach(details => details.removeAttribute('open'));
  }

  async ngOnInit() {
    this.updateDateTime();
    this.clockInterval = setInterval(() => {
      this.updateDateTime();
      this.analizarHorarioSenati();
      this.refreshView();
    }, 60000);

    await this.loadUserProfile();
    await this.loadSitios();
    await this.loadNotas();
    await this.loadTareasSenati();
    await this.loadCursosSenati();
    await this.loadGithubData();
    await this.loadM365Events();
    this.refreshView();
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

  // --- NAVEGACIÓN DE VISTAS ---
  irACheatsheet() {
    this.cerrarDropdowns();
    this.vistaActiva = 'chuletas';
    this.refreshView();
  }

  irADashboard() {
    this.cerrarDropdowns();
    this.vistaActiva = 'dashboard';
    this.refreshView();
  }

  // --- SENATI TAREAS SUMMARY ---
  async loadTareasSenati() {
    this.loadingTareasSenati = true;
    try {
      this.tareasSenati = await this.supabaseService.getTareasSenatiPendientes();
    } catch (e) {
      console.warn('Error loading senati tasks summary:', e);
    } finally {
      this.loadingTareasSenati = false;
      this.refreshView();
    }
  }

  async marcarTareaEntregada(tareaId: string) {
    try {
      await this.supabaseService.updateTareaSenatiEstado(tareaId, 'entregado');
      this.tareasSenati = this.tareasSenati.filter(t => t.id !== tareaId);
      this.showToast('¡Tarea completada! 🟢');
      this.refreshView();
    } catch (err) {
      console.error(err);
    }
  }

  formatDateSenati(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  // --- SENATI HORARIO & CLASES ---
  async loadCursosSenati() {
    this.loadingCursosSenati = true;
    try {
      this.cursosSenati = await this.supabaseService.getCursosSenati();
      this.analizarHorarioSenati();
    } catch (e) {
      console.warn('Error cargando cursos senati:', e);
    } finally {
      this.loadingCursosSenati = false;
      this.refreshView();
    }
  }

  analizarHorarioSenati() {
    const ahora = new Date();
    const diaIndex = ahora.getDay(); // 0: Dom, 1: Lun, 2: Mar, 3: Mié, 4: Jue, 5: Vie, 6: Sáb
    const mapDias = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
    const mapDiasAlt = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaHoyAbbr = mapDias[diaIndex];
    const diaHoyAlt = mapDiasAlt[diaIndex];

    const horaActualMinutos = ahora.getHours() * 60 + ahora.getMinutes();

    this.clasesHoy = [];
    this.claseActual = null;
    this.proximaClase = null;

    for (const c of this.cursosSenati) {
      const hStr = (c.horario || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!hStr) continue;

      // Verificar si coincide con el día de hoy
      const coincideDia = hStr.includes(diaHoyAbbr) || hStr.includes(diaHoyAlt) || 
        (!hStr.includes('lun') && !hStr.includes('mar') && !hStr.includes('mie') && !hStr.includes('jue') && !hStr.includes('vie') && !hStr.includes('sab') && diaIndex >= 1 && diaIndex <= 5);

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

        const claseInfo = {
          ...c,
          horaFormateada,
          inicioMin,
          finMin
        };

        this.clasesHoy.push(claseInfo);

        if (horaActualMinutos >= inicioMin && horaActualMinutos <= finMin) {
          this.claseActual = claseInfo;
        } else if (horaActualMinutos < inicioMin) {
          if (!this.proximaClase || inicioMin < this.proximaClase.inicioMin) {
            this.proximaClase = claseInfo;
          }
        }
      }
    }

    // Integración prioritaria con Microsoft Teams en vivo (M365 SENATI)
    if (this.teamsEventsToday.length > 0) {
      for (const tEvent of this.teamsEventsToday) {
        const hIni = tEvent.inicio.getHours() * 60 + tEvent.inicio.getMinutes();
        const hFin = tEvent.fin.getHours() * 60 + tEvent.fin.getMinutes();

        const claseTeams = {
          nombre: tEvent.titulo,
          profesor: tEvent.docente || 'Docente SENATI (Teams)',
          horaFormateada: tEvent.horaFormateada,
          inicioMin: hIni,
          finMin: hFin,
          link_teams: tEvent.joinTeamsUrl,
          link_blackboard: 'https://senati.blackboard.com/',
          esTeamsReal: true
        };

        this.clasesHoy.unshift(claseTeams);

        if (tEvent.isLiveNow) {
          this.claseActual = claseTeams;
        } else if (tEvent.isUpcomingToday) {
          if (!this.proximaClase || hIni < this.proximaClase.inicioMin) {
            this.proximaClase = claseTeams;
          }
        }
      }
    }
  }

  // --- MICROSOFT 365 SENATI METHODS ---
  async loadM365Events() {
    this.m365Profile = this.m365Service.getProfile();
    this.m365FeedUrl = this.m365Service.getCalendarFeedUrl();
    if (this.m365FeedUrl) {
      this.isSyncingM365 = true;
      try {
        this.teamsEventsToday = await this.m365Service.getTodayEventsFromFeed();
        this.analizarHorarioSenati();
      } catch (e) {
        console.warn('Error cargando eventos Teams M365:', e);
      } finally {
        this.isSyncingM365 = false;
        this.refreshView();
      }
    }
  }

  openM365Modal() {
    this.modalM365Open = true;
    this.m365FeedUrl = this.m365Service.getCalendarFeedUrl();
    this.m365Profile = this.m365Service.getProfile();
    this.m365InputName = this.m365Profile?.displayName || `${this.userName} ${this.userLastName}`.trim();
    this.m365InputEmail = this.m365Profile?.email || 'alumno@senati.pe';
    this.refreshView();
  }

  closeM365Modal() {
    this.modalM365Open = false;
    this.refreshView();
  }

  async saveM365Config() {
    if (this.m365FeedUrl.trim()) {
      this.m365Service.saveCalendarFeedUrl(this.m365FeedUrl);
    }
    if (this.m365InputEmail.trim()) {
      this.m365Service.setManualProfile(this.m365InputName, this.m365InputEmail);
    }
    this.showToast('Cuenta Microsoft SENATI vinculada');
    await this.loadM365Events();
    this.closeM365Modal();
  }

  disconnectM365() {
    this.m365Service.disconnect();
    this.m365Profile = null;
    this.m365FeedUrl = '';
    this.teamsEventsToday = [];
    this.analizarHorarioSenati();
    this.showToast('Cuenta Microsoft desvinculada');
    this.closeM365Modal();
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

    // Apps
    if ('senati portal tareas academico'.includes(q)) {
      results.push({
        type: 'App',
        title: 'SENATI Portal',
        subtitle: 'Tareas, entregas y materias',
        icon: '📚',
        action: () => window.open('https://senati-portal.vercel.app/', '_blank')
      });
    }

    // Chuletas
    if ('chuletas comandos servidores dev terminal'.includes(q)) {
      results.push({
        type: 'Sección',
        title: 'Chuletas & Comandos Dev',
        subtitle: 'Ver catálogo de comandos de servidores',
        icon: '⚡',
        action: () => this.irACheatsheet()
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
          icon: s.icono || '🌐',
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

  get comandosFiltrados() {
    if (this.filtroTechComandos === 'todos') {
      return this.comandosDev;
    }
    return this.comandosDev.filter(c => c.tech.toLowerCase() === this.filtroTechComandos.toLowerCase());
  }

  async copiarComando(comando: string) {
    try {
      await navigator.clipboard.writeText(comando);
      this.showToast('¡Comando copiado! 📋');
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
  async loadSitios() {
    this.sitios = await this.supabaseService.getSitios();
    this.refreshView();
  }

  get sitiosPersonales() {
    return this.sitios.filter(s => s.categoria === 'personal');
  }

  abrirModal() {
    this.sitioEnEdicion = null;
    this.newSitio = { nombre: '', url: '', icono: '', descripcion: '', categoria: 'personal' };
    this.modalAddSitioOpen = true;
    this.formError = '';
  }

  abrirModalEditar(sitio: any, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
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

  cerrarModal() {
    this.modalAddSitioOpen = false;
    this.sitioEnEdicion = null;
    this.newSitio = { nombre: '', url: '', icono: '', descripcion: '', categoria: 'personal' };
    this.formError = '';
  }

  resolverIcono(url: string, iconoIngresado: string): string {
    if (iconoIngresado.trim()) return iconoIngresado.trim();

    const dominios = [
      { match: 'youtube.com',       favicon: 'youtube.com' },
      { match: 'github.com',        favicon: 'github.com' },
      { match: 'stackoverflow.com', favicon: 'stackoverflow.com' },
      { match: 'vercel.com',        favicon: 'vercel.com' },
      { match: 'supabase.com',      favicon: 'supabase.com' }
    ];

    for (const d of dominios) {
      if (url.includes(d.match)) {
        return `https://www.google.com/s2/favicons?sz=64&domain=${d.favicon}`;
      }
    }

    return '🌐';
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
      if (this.sitioEnEdicion) {
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
      this.showToast('¡Nota guardada! 📝');
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
