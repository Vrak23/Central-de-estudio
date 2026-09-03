import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase';

export interface DevComando {
  tech: string;
  nombre: string;
  comando: string;
  descripcion: string;
  icono: string;
}

export interface PortalFijo {
  id: string;
  nombre: string;
  url: string;
  icono: string;
  descripcion: string;
  categoria: 'estudio' | 'dev' | 'herramientas';
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

  // Portales y Sitios
  sitios: any[] = [];
  activeTabPortales: 'todos' | 'estudio' | 'dev' | 'herramientas' | 'personal' = 'todos';
  
  // Portales Fijos Base Organizados por Categorías
  portalesFijos: PortalFijo[] = [
    {
      id: 'bb',
      nombre: 'Blackboard SENATI',
      url: 'https://senati.blackboard.com/',
      icono: 'https://cdn-icons-png.flaticon.com/512/2201/2201550.png',
      descripcion: 'Entregables y clases de SENATI.',
      categoria: 'estudio'
    },
    {
      id: 'outlook',
      nombre: 'Outlook SENATI',
      url: 'https://outlook.cloud.microsoft/mail/',
      icono: 'https://cdn-icons-png.flaticon.com/512/732/732200.png',
      descripcion: 'Correo institucional de SENATI.',
      categoria: 'estudio'
    },
    {
      id: 'drive',
      nombre: 'Google Drive',
      url: 'https://drive.google.com',
      icono: 'https://cdn-icons-png.flaticon.com/512/2965/2965327.png',
      descripcion: 'Documentación y archivos en la nube.',
      categoria: 'estudio'
    },
    {
      id: 'github',
      nombre: 'GitHub',
      url: 'https://github.com',
      icono: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
      descripcion: 'Repositorios y control de versiones.',
      categoria: 'dev'
    },
    {
      id: 'vercel',
      nombre: 'Vercel Dashboard',
      url: 'https://vercel.com/dashboard',
      icono: 'https://cdn-icons-png.flaticon.com/512/5968/5968705.png',
      descripcion: 'Despliegues y proyectos en producción.',
      categoria: 'dev'
    },
    {
      id: 'supabase',
      nombre: 'Supabase Cloud',
      url: 'https://supabase.com/dashboard',
      icono: 'https://cdn-icons-png.flaticon.com/512/5968/5968382.png',
      descripcion: 'Base de datos PostgreSQL y Auth.',
      categoria: 'dev'
    },
    {
      id: 'chatgpt',
      nombre: 'ChatGPT',
      url: 'https://chatgpt.com',
      icono: 'https://cdn-icons-png.flaticon.com/512/12222/12222588.png',
      descripcion: 'Asistente de IA y resolución de dudas.',
      categoria: 'herramientas'
    },
    {
      id: 'notion',
      nombre: 'Notion',
      url: 'https://notion.so',
      icono: 'https://cdn-icons-png.flaticon.com/512/5968/5968517.png',
      descripcion: 'Apuntes, gestión y documentación.',
      categoria: 'herramientas'
    }
  ];

  // Chuleta de Comandos de Servidores y Tecnologías
  comandosDev: DevComando[] = [
    {
      tech: 'Angular',
      nombre: 'Iniciar Servidor Angular',
      comando: 'ng serve --port 4200',
      descripcion: 'Levanta servidor de desarrollo en puerto 4200.',
      icono: '🅰️'
    },
    {
      tech: 'Vite / React',
      nombre: 'Iniciar Vite / React',
      comando: 'npm run dev',
      descripcion: 'Inicia servidor ultra rápido de Vite.',
      icono: '⚡'
    },
    {
      tech: 'Node / Express',
      nombre: 'Iniciar Servidor Node',
      comando: 'npx nodemon index.js',
      descripcion: 'Ejecuta servidor Node con reinicio automático.',
      icono: '🟢'
    },
    {
      tech: 'PHP / XAMPP',
      nombre: 'Servidor PHP Integrado',
      comando: 'php -S localhost:8000',
      descripcion: 'Levanta servidor web local rápido de PHP.',
      icono: '🐘'
    },
    {
      tech: 'Python / FastAPI',
      nombre: 'Servidor Uvicorn / FastAPI',
      comando: 'uvicorn main:app --reload',
      descripcion: 'Inicia API FastAPI con recarga en caliente.',
      icono: '🐍'
    },
    {
      tech: 'Git',
      nombre: 'Sincronizar y Subir a Git',
      comando: 'git add . && git commit -m "update" && git push',
      descripcion: 'Agrega cambios, crea commit y empuja al remoto.',
      icono: '🐙'
    }
  ];

  filtroTechComandos = 'todos';

  // Resumen de Tareas SENATI
  tareasSenati: any[] = [];
  loadingTareasSenati = false;

  // Buscador Rápido Global (Spotlight)
  spotlightOpen = false;
  spotlightQuery = '';

  // Notas
  notas: any[] = [];
  gruposNotas: { [key: string]: any[] } = {};
  notasPanelOpen = false;
  modalAddSitioOpen = false;

  newSitio = {
    nombre: '',
    url: '',
    icono: '',
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

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // Listener para atajo global Ctrl+K / Cmd+K y Escape
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
    }
  }

  async ngOnInit() {
    this.updateDateTime();
    this.clockInterval = setInterval(() => {
      this.updateDateTime();
      this.refreshView();
    }, 60000);

    await this.loadUserProfile();
    await this.loadSitios();
    await this.loadNotas();
    await this.loadTareasSenati();
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

    // Portales Fijos
    this.portalesFijos.forEach(p => {
      if (p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q) || p.categoria.includes(q)) {
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

    // Comandos
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
  get comandosFiltrados() {
    if (this.filtroTechComandos === 'todos') {
      return this.comandosDev;
    }
    return this.comandosDev.filter(c => c.tech.toLowerCase() === this.filtroTechComandos.toLowerCase());
  }

  async copiarComando(comando: string) {
    try {
      await navigator.clipboard.writeText(comando);
      this.showToast('¡Comando copiado al portapapeles! 📋');
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
    }, 2800);
  }

  // --- PORTALES & SITIOS ---
  async loadSitios() {
    this.sitios = await this.supabaseService.getSitios();
    this.refreshView();
  }

  get portalesFiltrados(): PortalFijo[] {
    if (this.activeTabPortales === 'todos') {
      return this.portalesFijos;
    }
    if (this.activeTabPortales === 'personal') {
      return [];
    }
    return this.portalesFijos.filter(p => p.categoria === this.activeTabPortales);
  }

  get sitiosPersonales() {
    return this.sitios.filter(s => s.categoria === 'personal');
  }

  isImageUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  abrirModal() {
    this.modalAddSitioOpen = true;
    this.formError = '';
  }

  cerrarModal() {
    this.modalAddSitioOpen = false;
    this.newSitio = { nombre: '', url: '', icono: '', categoria: 'personal' };
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
    let { nombre, url, icono, categoria } = this.newSitio;
    nombre = nombre.trim();
    url = url.trim();

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
      await this.supabaseService.addSitio(nombre, url, iconoFinal, categoria);
      await this.loadSitios();
      this.showToast('¡Sitio agregado con éxito!');
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
