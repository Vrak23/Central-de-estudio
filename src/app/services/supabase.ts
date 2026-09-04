import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // --- AUTH METHODS ---
  async signUp(email: string, password: string, nombres: string, apellidos: string) {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombres,
          apellidos
        }
      }
    });
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  async getUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('nombres, apellidos')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }

  // --- SITES CRUD ---
  async getSitios() {
    const user = await this.getUser();
    if (!user) return [];

    // Traer los sitios que pertenezcan al usuario
    const { data, error } = await this.supabase
      .from('sitios')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching sites:', error);
      return [];
    }
    return data || [];
  }

  async addSitio(nombre: string, url: string, icono: string, categoria: 'personal' | 'fijo', descripcion: string = '') {
    const user = await this.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await this.supabase
      .from('sitios')
      .insert([
        {
          usuario_id: user.id,
          nombre,
          url,
          icono: icono || '🌐',
          categoria,
          descripcion
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSitio(id: number, nombre: string, url: string, icono: string, categoria: 'personal' | 'fijo', descripcion: string = '') {
    const { data, error } = await this.supabase
      .from('sitios')
      .update({
        nombre,
        url,
        icono: icono || '🌐',
        categoria,
        descripcion
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSitio(id: number) {
    const { error } = await this.supabase
      .from('sitios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // --- NOTES CRUD ---
  async getNotas() {
    const user = await this.getUser();
    if (!user) return [];

    const { data, error } = await this.supabase
      .from('notas')
      .select('*')
      .eq('usuario_id', user.id)
      .order('categoria', { ascending: true })
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
    return data || [];
  }

  async addNota(categoria: string, titulo: string, contenido: string) {
    const user = await this.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await this.supabase
      .from('notas')
      .insert([
        {
          usuario_id: user.id,
          categoria,
          titulo,
          contenido
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateNota(id: number, contenido: string) {
    const { data, error } = await this.supabase
      .from('notas')
      .update({ contenido, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteNota(id: number) {
    const { error } = await this.supabase
      .from('notas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // --- SENATI TAREAS SUMMARY ---
  async getTareasSenatiPendientes() {
    const user = await this.getUser();
    if (!user) return [];

    const { data, error } = await this.supabase
      .from('senati_tareas')
      .select('*, curso:senati_cursos(*)')
      .eq('usuario_id', user.id)
      .neq('estado', 'entregado')
      .order('fecha_limite', { ascending: true })
      .limit(3);

    if (error) {
      console.warn('No se pudieron obtener tareas de senati:', error.message);
      return [];
    }
    return data || [];
  }

  async updateTareaSenatiEstado(tareaId: string, estado: 'pendiente' | 'en_progreso' | 'entregado') {
    const { data, error } = await this.supabase
      .from('senati_tareas')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', tareaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
