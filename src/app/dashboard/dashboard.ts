import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  userName = 'Usuario';
  userLastName = '';
  userInitials = 'U';
  dateTimeString = '';
  saludo = 'Hola';
  activeSection = 'main'; // 'main' | 'senati' | 'local'

  sitios: any[] = [];
  notas: any[] = [];
  gruposNotas: { [key: string]: any[] } = {};
  myProjects: string[] = ['db_central', 'db_tienda', 'db_ventas']; // Proyectos locales de ejemplo
  
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

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 60000); // Actualizar cada minuto

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

    await this.loadSitios();
    await this.loadNotas();
  }

  updateDateTime() {
    const now = new Date();
    const hora = now.getHours();

    // Saludo
    if (hora >= 5 && hora < 12) {
      this.saludo = 'Buenos días';
    } else if (hora >= 12 && hora < 19) {
      this.saludo = 'Buenas tardes';
    } else {
      this.saludo = 'Buenas noches';
    }

    // Fecha
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    // Traducir a formato español
    const localeStr = now.toLocaleDateString('es-ES', options);
    this.dateTimeString = `${localeStr} • Lima, PE`;
  }

  async loadSitios() {
    this.sitios = await this.supabaseService.getSitios();
  }

  async loadNotas() {
    this.notas = await this.supabaseService.getNotas();
    this.groupNotes();
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

  isImageUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  showSection(section: string) {
    this.activeSection = section;
  }

  hideSections() {
    this.activeSection = 'main';
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
      this.cerrarModal();
    } catch (err: any) {
      console.error(err);
      this.formError = err.message || 'Error al guardar el sitio.';
    }
  }

  async eliminarSitio(id: number) {
    if (!confirm('¿Eliminar este sitio?')) return;

    try {
      await this.supabaseService.deleteSitio(id);
      await this.loadSitios();
    } catch (err) {
      console.error('Error al eliminar sitio:', err);
      alert('No se pudo eliminar el sitio.');
    }
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
    } catch (err: any) {
      console.error(err);
      this.notaError = err.message || 'Error al agregar la nota.';
    }
  }

  async guardarEdicion(id: number, event: any) {
    const el = event.target;
    const contenido = el.innerText.trim();
    
    try {
      await this.supabaseService.updateNota(id, contenido);
      // Opcional: recargar notas para actualizar la fecha de modificación
      await this.loadNotas();
    } catch (err) {
      console.error('Error al editar nota:', err);
    }
  }

  async eliminarNota(id: number) {
    if (!confirm('¿Eliminar esta nota?')) return;

    try {
      await this.supabaseService.deleteNota(id);
      await this.loadNotas();
    } catch (err) {
      console.error('Error al eliminar nota:', err);
    }
  }

  getSitiosPorCategoria(cat: 'personal' | 'fijo') {
    return this.sitios.filter(s => s.categoria === cat);
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
}
