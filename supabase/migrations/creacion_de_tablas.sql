
-- Creación de tablas
CREATE TABLE carreras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  codigo text UNIQUE,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE materias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  codigo text,
  semestre integer NOT NULL CHECK (semestre > 0),
  carrera_id uuid REFERENCES carreras(id) ON DELETE CASCADE,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE estudiantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_control text UNIQUE NOT NULL,
  nombre text NOT NULL,
  apellido_paterno text NOT NULL,
  apellido_materno text NOT NULL,
  carrera_id uuid REFERENCES carreras(id) ON DELETE SET NULL,
  semestre_actual integer NOT NULL CHECK (semestre_actual > 0),
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);


CREATE TABLE registros_estudiante_materia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id uuid NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  materia_id uuid NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
  semestre integer NOT NULL CHECK (semestre > 0),
  calificacion_unidad1 numeric(5,2) CHECK (calificacion_unidad1 >= 0 AND calificacion_unidad1 <= 100),
  calificacion_unidad2 numeric(5,2) CHECK (calificacion_unidad2 >= 0 AND calificacion_unidad2 <= 100),
  calificacion_unidad3 numeric(5,2) CHECK (calificacion_unidad3 >= 0 AND calificacion_unidad3 <= 100),
  calificacion_final numeric(5,2) CHECK (calificacion_final >= 0 AND calificacion_final <= 100),
  porcentaje_asistencia numeric(5,2) CHECK (porcentaje_asistencia >= 0 AND porcentaje_asistencia <= 100),
  estado text DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'aprobado', 'reprobado', 'baja')),
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

-- Creación de tabla de categorías de factores de riesgo
CREATE TABLE categorias_factores_riesgo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  descripcion text,
  creado_en timestamptz DEFAULT now()
);

-- Creación de tabla de factores de riesgo
CREATE TABLE factores_riesgo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id uuid NOT NULL REFERENCES categorias_factores_riesgo(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  creado_en timestamptz DEFAULT now()
);

-- Creación de tabla de relación entre estudiantes y factores de riesgo
CREATE TABLE factores_riesgo_estudiante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_estudiante_materia_id uuid NOT NULL REFERENCES registros_estudiante_materia(id) ON DELETE CASCADE,
  factor_riesgo_id uuid NOT NULL REFERENCES factores_riesgo(id) ON DELETE CASCADE,
  severidad text DEFAULT 'media' CHECK (severidad IN ('baja', 'media', 'alta')),
  observaciones text,
  creado_en timestamptz DEFAULT now()
);

-- Creación de tabla de reportes de análisis
CREATE reportes_analisis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  tipo_analisis text NOT NULL CHECK (tipo_analisis IN ('pareto', 'histograma', 'dispersión', 'gráfico_control', 'estratificación')),
  filtros jsonb DEFAULT '{}'::jsonb,
  resultados jsonb DEFAULT '{}'::jsonb,
  creado_por uuid,
  creado_en timestamptz DEFAULT now()
);

-- Activar Seguridad a Nivel de Fila (RLS)
ALTER TABLE carreras ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_estudiante_materia ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_factores_riesgo ENABLE ROW LEVEL SECURITY;
ALTER TABLE factores_riesgo ENABLE ROW LEVEL SECURITY;
ALTER TABLE factores_riesgo_estudiante ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_analisis ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios autenticados (acceso completo para el sistema interno)
CREATE POLICY "Usuarios autenticados pueden ver carreras"
  ON carreras FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar carreras"
  ON carreras FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar carreras"
  ON carreras FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar carreras"
  ON carreras FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden ver materias"
  ON materias FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar materias"
  ON materias FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar materias"
  ON materias FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar materias"
  ON materias FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden ver estudiantes"
  ON estudiantes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar estudiantes"
  ON estudiantes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar estudiantes"
  ON estudiantes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar estudiantes"
  ON estudiantes FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden ver registros académicos"
  ON registros_estudiante_materia FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar registros académicos"
  ON registros_estudiante_materia FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar registros académicos"
  ON registros_estudiante_materia FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar registros académicos"
  ON registros_estudiante_materia FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden ver categorías de factores de riesgo"
  ON categorias_factores_riesgo FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar categorías de factores de riesgo"
  ON categorias_factores_riesgo FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar categorías de factores de riesgo"
  ON categorias_factores_riesgo FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar categorías de factores de riesgo"
  ON categorias_factores_riesgo FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden ver factores de riesgo"
  ON factores_riesgo FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar factores de riesgo"
  ON factores_riesgo FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar factores de riesgo"
  ON factores_riesgo FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar factores de riesgo"
  ON factores_riesgo FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden ver factores de riesgo por estudiante"
  ON factores_riesgo_estudiante FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar factores de riesgo por estudiante"
  ON factores_riesgo_estudiante FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar factores de riesgo por estudiante"
  ON factores_riesgo_estudiante FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar factores de riesgo por estudiante"
  ON factores_riesgo_estudiante FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden ver reportes"
  ON reportes_analisis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar reportes"
  ON reportes_analisis FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar reportes"
  ON reportes_analisis FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar reportes"
  ON reportes_analisis FOR DELETE
  TO authenticated
  USING (true);

-- Inserción de categorías de factores de riesgo por defecto
INSERT INTO categorias_factores_riesgo (nombre, descripcion) VALUES
  ('Académico', 'Factores relacionados con el rendimiento académico y hábitos de estudio'),
  ('Psicosocial', 'Factores psicológicos y sociales que afectan el bienestar del estudiante'),
  ('Económico', 'Factores financieros que impactan la continuidad de los estudios'),
  ('Institucional', 'Factores relacionados con el apoyo y recursos institucionales'),
  ('Tecnológico', 'Acceso a tecnología y habilidades digitales'),
  ('Contextual', 'Factores externos del entorno familiar y social')
ON CONFLICT (nombre) DO NOTHING;
