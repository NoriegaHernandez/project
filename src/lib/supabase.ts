import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// export interface Major {
//   id: string;
//   name: string;
//   code: string | null;
//   created_at: string;
// }

// export interface Subject {
//   id: string;
//   name: string;
//   code: string | null;
//   semester: number;
//   major_id: string | null;
//   created_at: string;
// }

// export interface Student {
//   id: string;
//   control_number: string;
//   first_name: string;
//   paternal_surname: string;
//   maternal_surname: string;
//   major_id: string | null;
//   current_semester: number;
//   created_at: string;
//   updated_at: string;
// }

// export interface StudentSubjectRecord {
//   id: string;
//   student_id: string;
//   subject_id: string;
//   semester: number;
//   unit1_grade: number | null;
//   unit2_grade: number | null;
//   unit3_grade: number | null;
//   final_grade: number | null;
//   attendance_percentage: number | null;
//   status: 'in_progress' | 'approved' | 'failed' | 'dropout';
//   created_at: string;
//   updated_at: string;
// }

// export interface RiskFactorCategory {
//   id: string;
//   name: string;
//   description: string | null;
//   created_at: string;
// }

// export interface RiskFactor {
//   id: string;
//   category_id: string;
//   name: string;
//   description: string | null;
//   created_at: string;
// }

// export interface StudentRiskFactor {
//   id: string;
//   student_subject_record_id: string;
//   risk_factor_id: string;
//   severity: 'low' | 'medium' | 'high';
//   notes: string | null;
//   created_at: string;
// }

// export interface AnalysisReport {
//   id: string;
//   title: string;
//   analysis_type: 'pareto' | 'histogram' | 'scatter' | 'control_chart' | 'stratification';
//   filters: Record<string, any>;
//   results: Record<string, any>;
//   created_by: string | null;
//   created_at: string;
// }


export interface Carrera {
  id: string;
  nombre: string;
  codigo: string | null;
  creado_en: string;
}

export interface Materia {
  id: string;
  nombre: string;
  codigo: string | null;
  semestre: number;
  carrera_id: string | null;
  creado_en: string;
}

export interface Estudiante {
  id: string;
  numero_control: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  carrera_id: string | null;
  semestre_actual: number;
  creado_en: string;
  actualizado_en: string;
}

export interface RegistroEstudianteMateria {
  id: string;
  estudiante_id: string;
  materia_id: string;
  semestre: number;
  calificacion_unidad1: number | null;
  calificacion_unidad2: number | null;
  calificacion_unidad3: number | null;
  calificacion_final: number | null;
  porcentaje_asistencia: number | null;
  estado: 'en_progreso' | 'aprobado' | 'reprobado' | 'baja';
  creado_en: string;
  actualizado_en: string;
}

export interface CategoriaFactorRiesgo {
  id: string;
  nombre: string;
  descripcion: string | null;
  creado_en: string;
}

export interface FactorRiesgo {
  id: string;
  categoria_id: string;
  nombre: string;
  descripcion: string | null;
  creado_en: string;
}

export interface FactorRiesgoEstudiante {
  id: string;
  registro_estudiante_materia_id: string;
  factor_riesgo_id: string;
  severidad: 'baja' | 'media' | 'alta';
  observaciones: string | null;
  creado_en: string;
}

export interface ReporteAnalisis {
  id: string;
  titulo: string;
  tipo_analisis: 'pareto' | 'histograma' | 'dispersión' | 'grafico_control' | 'estratificación';
  filtros: Record<string, any>;
  resultados: Record<string, any>;
  creado_por: string | null;
  creado_en: string;
}
