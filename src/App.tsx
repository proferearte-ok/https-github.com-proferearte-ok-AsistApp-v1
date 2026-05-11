import React, { useState, useEffect } from 'react';
import { 
  Users, 
  School, 
  ChevronRight, 
  Mic, 
  User, 
  Phone, 
  ArrowRight, 
  Menu, 
  UserCircle, 
  Plus, 
  Trash2, 
  Edit2, 
  Library, 
  CheckCircle2, 
  History, 
  Calculator, 
  BookOpen, 
  Microscope,
  Home,
  GraduationCap,
  LayoutDashboard,
  Check,
  X,
  Clock,
  Printer,
  FileText,
  Save,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from './lib/supabase';

// --- Types ---
type Screen = 'welcome' | 'register' | 'course-config' | 'subject-config' | 'student-registration' | 'attendance' | 'reports';

interface Profile {
  first_name: string;
  last_name: string;
  phone: string;
}

interface Course {
  id: string;
  school_name: string;
  level: 'Primaria' | 'Secundaria';
  year_grade: number;
  division: string;
  shift: 'Mañana' | 'Tarde';
}

interface Student {
  id: string;
  full_name: string;
}

interface Subject {
  id: string;
  name: string;
  assigned_courses: string[]; // Course IDs
}

// --- Shared Components ---

const TopAppBar = ({ onMenuClick, onProfileClick, title }: { onMenuClick?: () => void, onProfileClick?: () => void, title?: string }) => (
  <header className="bg-surface border-b border-outline-variant flex justify-between items-center px-4 h-14 w-full sticky top-0 z-50">
    <div className="flex items-center gap-3">
      <button onClick={onMenuClick} className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
        <Menu className="w-5 h-5 text-primary" />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img 
              src="https://lh3.googleusercontent.com/aida/ADBb0uiOqmUCsDM2MsYDEfSvFR29hlceTX2iJgqB6NSdm-yMbcCYNZwwpmFv04LJuQdOnO9RYxLGSim3NZpfphDHB_WCNk1dufJpCyYxl9W028uJrh67295HPq2pWXSvGYPSxf-nKr2A9JLR7EfHeIo1s27ZOPQj0l-03z0H9ohkrA_HbI4XSef4RdRPKvx1aeA8u5j4sob6ydmugHzpvy09Gwg7Y_41CBqKpDTXDWXTTEsrTmcP-pshVvTKrHMh27OrMETtxqrrSkAfj6s" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
        </div>
        <h1 className="font-display font-bold text-lg text-primary">{title || 'AsistApp'}</h1>
      </div>
    </div>
    <button onClick={onProfileClick} className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
      <UserCircle className="w-6 h-6 text-primary" />
    </button>
  </header>
);

const BottomNavBar = ({ currentScreen, setScreen }: { currentScreen: Screen, setScreen: (s: Screen) => void }) => (
  <nav className="fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant flex justify-around items-center px-2 py-2 z-50">
    <button 
      onClick={() => setScreen('attendance')}
      className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentScreen === 'attendance' ? 'bg-primary-container text-on-primary-container scale-105' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
    >
      <Home className="w-5 h-5" />
      <span className="text-[10px] font-medium mt-1">Inicio</span>
    </button>
    <button 
      onClick={() => setScreen('course-config')}
      className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentScreen === 'course-config' ? 'bg-primary-container text-on-primary-container scale-105' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
    >
      <GraduationCap className="w-5 h-5" />
      <span className="text-[10px] font-medium mt-1">Cursos</span>
    </button>
    <button 
      onClick={() => setScreen('reports')}
      className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentScreen === 'reports' ? 'bg-primary-container text-on-primary-container scale-105' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
    >
      <LayoutDashboard className="w-5 h-5" />
      <span className="text-[10px] font-medium mt-1">Reportes</span>
    </button>
    <button 
      onClick={() => setScreen('welcome')}
      className="flex flex-col items-center p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low"
    >
      <User className="w-5 h-5" />
      <span className="text-[10px] font-medium mt-1">Perfil</span>
    </button>
  </nav>
);

// --- Screens ---

const WelcomeScreen = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen flex flex-col md:flex-row bg-surface">
    <div className="hidden md:flex md:w-1/2 bg-primary-container items-center justify-center p-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20" />
      <div className="relative z-10 text-center max-w-md">
        <h1 className="font-display text-5xl font-bold text-on-primary-container mb-6">AsistApp</h1>
        <p className="text-xl text-on-primary-container/90 mb-8 leading-relaxed">
          Diseñado para transformar la gestión del aula en una experiencia fluida.
        </p>
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFW9pgqS3OUINPdatt2CW1AU5n1ZLud4y402-suq1tg-bcYiq4MJc7QnI_ECzrEeFhk5N6hk9_Ns7cCt0lPcA5wsu7nEycdD2DLx81ywemdchXk60PQkQQxb3xO2YuFYtvNtBKY4-nz6-_Uep8v5n8fYO12MBuCoWDnEzoVwVaLBwyzXfo8VhO8Ld4-mIXKImYkiC6KhEitfBLIOxsvQMRMjdMRC3hf0J2myxiR64BiSV4ljRcjyQJBL7sDEvMURwUj54Ds5e7slob" alt="Teacher" className="w-full h-auto aspect-video object-cover" />
        </div>
      </div>
    </div>
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex justify-center">
           <img src="https://lh3.googleusercontent.com/aida/ADBb0uiOqmUCsDM2MsYDEfSvFR29hlceTX2iJgqB6NSdm-yMbcCYNZwwpmFv04LJuQdOnO9RYxLGSim3NZpfphDHB_WCNk1dufJpCyYxl9W028uJrh67295HPq2pWXSvGYPSxf-nKr2A9JLR7EfHeIo1s27ZOPQj0l-03z0H9ohkrA_HbI4XSef4RdRPKvx1aeA8u5j4sob6ydmugHzpvy09Gwg7Y_41CBqKpDTXDWXTTEsrTmcP-pshVvTKrHMh27OrMETtxqrrSkAfj6s" alt="AsistApp Logo" className="w-24 h-24 object-contain rounded-2xl shadow-xl" />
        </div>
        <header className="flex flex-col gap-3 text-center">
          <h2 className="font-display text-3xl font-bold text-on-surface">Bienvenido a AsistApp</h2>
          <p className="text-on-surface-variant text-base">Ingrese para comenzar a gestionar su asistencia.</p>
        </header>
        <button onClick={onLogin} className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-primary-container transition-all">
          Iniciar Sesión / Registrarse
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </main>
  </div>
);

const RegisterScreen = ({ onComplete }: { onComplete: (profile: Profile) => void }) => {
  const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '' });

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <header className="text-center">
          <h2 className="font-display text-3xl font-bold text-primary">Perfil del Docente</h2>
          <p className="text-on-surface-variant mt-2">Sus datos serán usados para el ingreso a la app.</p>
        </header>
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <input 
              placeholder="Nombre" 
              className="w-full px-5 py-4 bg-white border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
            <input 
              placeholder="Apellido" 
              className="w-full px-5 py-4 bg-white border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
            <input 
              placeholder="Número de Teléfono" 
              type="tel"
              className="w-full px-5 py-4 bg-white border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <button 
            disabled={!formData.first_name || !formData.phone}
            onClick={() => onComplete(formData)}
            className="bg-primary text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-primary-container active:scale-95 transition-all disabled:opacity-50"
          >
            Guardar Perfil
          </button>
        </div>
      </div>
    </div>
  );
};

const CourseConfigScreen = ({ onNext }: { onNext: (course: Course) => void }) => {
  const [course, setCourse] = useState<Course>({ 
    id: Math.random().toString(), 
    school_name: '', 
    level: 'Primaria', 
    year_grade: 1, 
    division: 'A', 
    shift: 'Mañana' 
  });

  const years = course.level === 'Primaria' ? [1,2,3,4,5,6,7] : [1,2,3,4,5];

  return (
    <div className="min-h-screen bg-surface pb-24">
      <TopAppBar title="Nuevo Curso" />
      <main className="max-w-2xl mx-auto px-6 pt-12 flex flex-col gap-8">
        <h1 className="font-display text-3xl font-bold text-on-surface">Configuración de curso</h1>
        <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-on-surface-variant">Nombre del Colegio</label>
            <input 
              className="w-full px-5 py-4 bg-surface border border-outline-variant rounded-xl outline-none focus:border-primary"
              value={course.school_name}
              onChange={(e) => setCourse({ ...course, school_name: e.target.value })}
              placeholder="Ej: Instituto San Martín"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant">Nivel</label>
              <select 
                className="w-full px-4 py-4 bg-surface border border-outline-variant rounded-xl outline-none"
                value={course.level}
                onChange={(e) => setCourse({ ...course, level: e.target.value as any, year_grade: 1 })}
              >
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant">Año / Grado</label>
              <select 
                className="w-full px-4 py-4 bg-surface border border-outline-variant rounded-xl outline-none"
                value={course.year_grade}
                onChange={(e) => setCourse({ ...course, year_grade: parseInt(e.target.value) })}
              >
                {years.map(y => <option key={y} value={y}>{y}° Año</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant">División</label>
              <select 
                className="w-full px-4 py-4 bg-surface border border-outline-variant rounded-xl outline-none"
                value={course.division}
                onChange={(e) => setCourse({ ...course, division: e.target.value })}
              >
                <option value="A">Division A</option>
                <option value="B">Division B</option>
                <option value="C">Division C</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant">Turno</label>
              <div className="flex gap-2">
                {['Mañana', 'Tarde'].map(t => (
                  <button 
                    key={t}
                    type="button"
                    onClick={() => setCourse({ ...course, shift: t as any })}
                    className={`flex-1 py-3 rounded-xl border transition-all ${course.shift === t ? 'bg-primary text-white border-primary' : 'bg-white border-outline-variant'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button 
            disabled={!course.school_name}
            onClick={() => onNext(course)}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            Siguiente <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
      <BottomNavBar currentScreen="course-config" setScreen={() => {}} />
    </div>
  );
};

const StudentRegistrationScreen = ({ course, onComplete }: { course: Course, onComplete: (students: Student[]) => void }) => {
  const [isListening, setIsListening] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  const toggleMic = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        const names = ["Alejandro Garcia", "Beatriz Ortiz", "Carlos Ruiz"];
        const newName = names[Math.floor(Math.random() * names.length)];
        setStudents(prev => [...prev, { id: Math.random().toString(), full_name: newName }]);
        setIsListening(false);
      }, 1000);
    }
  };

  const removeStudent = (id: string) => setStudents(prev => prev.filter(s => s.id !== id));

  return (
    <div className="min-h-screen bg-surface pb-24">
      <TopAppBar title="Registro Alumnos" />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <section className="text-center mb-10">
          <h2 className="font-display text-4xl font-bold text-on-surface mb-4">Registro de Estudiantes</h2>
          <p className="text-on-surface-variant">Diga los nombres de sus alumnos para {course.year_grade}° {course.division}.</p>
          <div className="mt-8 flex flex-col items-center">
            <button 
              onClick={toggleMic}
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl relative transition-all ${isListening ? 'bg-error listening-ring' : 'bg-primary'}`}
            >
              <Mic className="w-10 h-10 text-white" />
            </button>
            <p className="mt-4 font-bold text-xs uppercase tracking-widest text-primary">
              {isListening ? 'Escuchando nombres...' : 'Toque para dictar'}
            </p>
          </div>
        </section>

        <div className="space-y-3">
          <AnimatePresence>
            {students.map((s, i) => (
              <motion.div 
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-5 rounded-2xl border border-outline-variant flex justify-between items-center shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-primary">{i+1}</span>
                  <span className="font-medium">{s.full_name}</span>
                </div>
                <button onClick={() => removeStudent(s.id)} className="text-error p-2 hover:bg-error/5 rounded-full">
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-12">
          <button 
            disabled={students.length === 0}
            onClick={() => onComplete(students)}
            className="w-full bg-primary text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
          >
            Finalizar Lista <CheckCircle2 className="w-6 h-6" />
          </button>
        </div>
      </main>
      <BottomNavBar currentScreen="course-config" setScreen={() => {}} />
    </div>
  );
};

const SubjectConfigScreen = ({ courses, onComplete }: { courses: Course[], onComplete: (subjects: Subject[]) => void }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newName, setNewName] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const addSubject = () => {
    if (!newName || selectedCourses.length === 0) return;
    setSubjects([...subjects, { id: Math.random().toString(), name: newName, assigned_courses: [...selectedCourses] }]);
    setNewName('');
    setSelectedCourses([]);
  };

  const toggleCourse = (cid: string) => {
    setSelectedCourses(prev => prev.includes(cid) ? prev.filter(id => id !== cid) : [...prev, cid]);
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <TopAppBar title="Asignaturas" />
      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">
        <header>
          <h1 className="font-display text-4xl font-bold text-primary mb-2">Configuración de Asignaturas</h1>
          <p className="text-on-surface-variant">Defina sus materias y a qué cursos las dicta.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-outline-variant shadow-sm space-y-6">
            <h2 className="font-display text-xl font-bold flex items-center gap-2"><Plus /> Nueva Materia</h2>
            <div className="space-y-4">
              <input 
                placeholder="Nombre de la Materia"
                className="w-full px-5 py-4 bg-surface border border-outline-variant rounded-xl outline-none focus:border-primary"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <div className="space-y-3">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Dictado en los cursos:</p>
                <div className="flex flex-wrap gap-2">
                  {courses.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => toggleCourse(c.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCourses.includes(c.id) ? 'bg-primary text-white border-primary' : 'bg-white border-outline-variant text-on-surface-variant'}`}
                    >
                      {c.year_grade}° {c.division} ({c.level.charAt(0)})
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={addSubject} className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg">Agregar Materia</button>
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
               <div className="px-6 py-4 bg-surface-container border-b border-outline-variant font-bold text-xs text-on-surface-variant uppercase tracking-widest">Materias Registradas ({subjects.length})</div>
               <div className="divide-y divide-outline-variant">
                  {subjects.map(s => (
                    <div key={s.id} className="p-5 flex justify-between items-center group">
                      <div>
                        <p className="font-display font-bold text-on-surface">{s.name}</p>
                        <p className="text-xs text-on-surface-variant">Dictado en {s.assigned_courses.length} cursos</p>
                      </div>
                      <button onClick={() => setSubjects(subjects.filter(sub => sub.id !== s.id))} className="text-error font-bold text-xs uppercase p-2 hover:bg-error/5 rounded-lg">Eliminar</button>
                    </div>
                  ))}
               </div>
            </div>
            <button 
              disabled={subjects.length === 0}
              onClick={() => onComplete(subjects)}
              className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl flex items-center justify-center gap-2"
            >
              Confirmar e Ir al Panel <CheckCircle2 />
            </button>
          </div>
        </div>
      </main>
      <BottomNavBar currentScreen="course-config" setScreen={() => {}} />
    </div>
  );
};

const AttendanceDashboard = ({ profile, courses, subjects, studentsByCourse, onSave }: { profile: Profile, courses: Course[], subjects: Subject[], studentsByCourse: Record<string, Student[]>, onSave: (records: any[]) => void }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0] || null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(subjects[0] || null);
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  const activeStudents = selectedCourse ? studentsByCourse[selectedCourse.id] || [] : [];
  const dateStr = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    const defaultAttendance: Record<string, string> = {};
    activeStudents.forEach(s => { defaultAttendance[s.id] = 'Presente' });
    setAttendance(defaultAttendance);
  }, [selectedCourse, selectedSubject]);

  const handleSave = () => {
    if (!selectedCourse || !selectedSubject) return;
    const records = activeStudents.map(s => ({
      studentId: s.id,
      courseId: selectedCourse.id,
      subjectId: selectedSubject.id,
      date: new Date().toISOString().split('T')[0],
      status: attendance[s.id] || 'Presente'
    }));
    onSave(records);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(22);
    doc.text("AsistApp - Reporte", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Docente: ${profile.first_name} ${profile.last_name}`, 14, 35);
    doc.text(`Colegio: ${selectedCourse?.school_name} | Curso: ${selectedCourse?.year_grade}° ${selectedCourse?.division}`, 14, 42);
    doc.text(`Materia: ${selectedSubject?.name} | Fecha: ${dateStr}`, 14, 49);
    
    autoTable(doc, {
      startY: 60,
      head: [['Estudiante', 'Estado']],
      body: activeStudents.map(s => [s.full_name, attendance[s.id] || 'Presente']),
      theme: 'grid',
      headStyles: { fillColor: [0, 104, 95] },
    });
    doc.save(`Asistencia_${selectedSubject?.name}.pdf`);
  };

  return (
    <div className="min-h-screen bg-surface-container-low pb-24">
      <TopAppBar title="Panel de Asistencia" />
      <div className="bg-white border-b border-outline-variant px-6 py-6 max-w-4xl mx-auto mt-4 rounded-3xl shadow-sm">
        <div className="flex flex-col gap-4">
           <div className="flex flex-wrap gap-2">
              {courses.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => setSelectedCourse(c)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCourse?.id === c.id ? 'bg-primary text-white' : 'bg-surface border border-outline-variant text-on-surface-variant'}`}
                >
                  {c.year_grade}° {c.division}
                </button>
              ))}
           </div>
           <div className="flex flex-wrap gap-2">
              {subjects.filter(s => s.assigned_courses.includes(selectedCourse?.id || '')).map(s => (
                <button 
                  key={s.id} 
                  onClick={() => setSelectedSubject(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedSubject?.id === s.id ? 'bg-secondary text-white' : 'bg-surface border border-outline-variant text-on-surface-variant'}`}
                >
                  {s.name}
                </button>
              ))}
           </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-3xl border border-outline-variant">
           <div>
              <h2 className="font-display font-bold text-xl">{selectedCourse?.year_grade}° "{selectedCourse?.division}"</h2>
              <p className="text-xs text-on-surface-variant">{selectedSubject?.name}</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-bold text-primary uppercase">{dateStr}</p>
           </div>
        </header>

        <div className="space-y-4">
           {activeStudents.map(student => (
              <div key={student.id} className="bg-white rounded-3xl border border-outline-variant overflow-hidden shadow-sm flex flex-col">
                <div className="p-6 flex items-center gap-4">
                   <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center border-2 border-surface"><User className="w-6 h-6 text-on-surface-variant/30" /></div>
                   <h3 className="font-display font-bold text-on-surface flex-grow">{student.full_name}</h3>
                </div>
                <div className="flex border-t border-outline-variant h-14">
                  {[
                    { l: 'Presente', icon: Check, color: 'bg-primary' },
                    { l: 'Justificada', icon: FileText, color: 'bg-secondary' },
                    { l: 'Injustificada', icon: X, color: 'bg-error' },
                  ].map((btn) => (
                    <button 
                      key={btn.l}
                      onClick={() => setAttendance({ ...attendance, [student.id]: btn.l })}
                      className={`flex-1 flex items-center justify-center gap-2 border-r last:border-r-0 border-outline-variant transition-all font-bold text-[10px] uppercase ${attendance[student.id] === btn.l ? `${btn.color} text-white` : 'hover:bg-primary/5 text-on-surface-variant'}`}
                    >
                      <btn.icon className="w-4 h-4" />
                      {btn.l.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
           ))}
        </div>

        <div className="mt-8 flex flex-col gap-4">
           <button onClick={handleSave} className="w-full bg-primary text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl"><Save className="w-6 h-6" /> Guardar Sesión</button>
           <button onClick={exportPDF} className="w-full bg-white text-primary border-2 border-primary py-5 rounded-3xl font-bold flex items-center justify-center gap-3"><Printer className="w-6 h-6" /> Exportar PDF</button>
        </div>
      </main>
      <BottomNavBar currentScreen="attendance" setScreen={() => {}} />
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentScreen, setScreen] = useState<Screen>('welcome');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studentsByCourse, setStudentsByCourse] = useState<Record<string, Student[]>>({});
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentTempCourse, setCurrentTempCourse] = useState<Course | null>(null);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Fetch Profile
          const { data: profData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (profData) setProfile(profData);

          // Fetch Courses
          const { data: coursesData } = await supabase.from('courses').select('*').eq('teacher_id', user.id);
          if (coursesData) setCourses(coursesData);

          // Fetch Students for all courses
          if (coursesData) {
            const stsObj: Record<string, Student[]> = {};
            for (const course of coursesData) {
              const { data: stsData } = await supabase.from('students').select('*').eq('course_id', course.id);
              if (stsData) stsObj[course.id] = stsData;
            }
            setStudentsByCourse(stsObj);
          }

          // Fetch Subjects
          const { data: subsData } = await supabase.from('subjects').select('*').eq('teacher_id', user.id);
          if (subsData) {
            // Also need subject_courses mapping
            const subsWithCourses = [];
            for (const sub of subsData) {
              const { data: scData } = await supabase.from('subject_courses').select('course_id').eq('subject_id', sub.id);
              subsWithCourses.push({
                ...sub,
                assigned_courses: scData?.map(sc => sc.course_id) || []
              });
            }
            setSubjects(subsWithCourses);
          }

          // Fetch Attendance History
          const { data: attData } = await supabase.from('attendance').select('*');
          if (attData) setAttendanceHistory(attData.map(a => ({
            studentId: a.student_id,
            courseId: a.course_id,
            subjectId: a.subject_id,
            date: a.date,
            status: a.status
          })));

          if (profData) setScreen('attendance');
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRegister = async (p: Profile) => {
    try {
      // In a real app we'd use supabase.auth.signUp
      // For this demo, let's upsert profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Debes iniciar sesión con Supabase Auth primero (Simulado: Usa el botón de login)");
        return;
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        first_name: p.first_name,
        last_name: p.last_name,
        phone: p.phone
      });

      if (error) throw error;
      setProfile(p);
      setScreen('course-config');
    } catch (e) {
      alert("Error al registrar perfil");
    }
  };

  const handleSaveCourse = async (students: Student[]) => {
    if (!currentTempCourse) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Insert Course
      const { data: newCourse, error: cErr } = await supabase.from('courses').insert({
        teacher_id: user?.id,
        school_name: currentTempCourse.school_name,
        level: currentTempCourse.level,
        year_grade: currentTempCourse.year_grade,
        division: currentTempCourse.division,
        shift: currentTempCourse.shift
      }).select().single();

      if (cErr) throw cErr;

      // 2. Insert Students
      const stsToInsert = students.map(s => ({
        course_id: newCourse.id,
        full_name: s.full_name
      }));
      const { data: insertedSts, error: sErr } = await supabase.from('students').insert(stsToInsert).select();
      if (sErr) throw sErr;

      setCourses([...courses, newCourse]);
      setStudentsByCourse({ ...studentsByCourse, [newCourse.id]: insertedSts });
      setScreen('subject-config');
    } catch (e) {
      alert("Error al guardar curso y alumnos");
    }
  };

  const handleSaveSubjects = async (subs: Subject[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      for (const sub of subs) {
        // Skip if already in DB (ideally we handle sync better, but for creation flow:)
        if (subjects.find(s => s.name === sub.name)) continue;

        const { data: newSub, error: subErr } = await supabase.from('subjects').insert({
          teacher_id: user?.id,
          name: sub.name
        }).select().single();

        if (subErr) throw subErr;

        // Map to courses
        const mappings = sub.assigned_courses.map(cid => ({
          subject_id: newSub.id,
          course_id: cid
        }));
        await supabase.from('subject_courses').insert(mappings);
      }

      // Re-fetch or update state
      setSubjects(subs);
      setScreen('attendance');
    } catch (e) {
      alert("Error al guardar asignaturas");
    }
  };

  const handleSaveAttendance = async (records: any[]) => {
    try {
      const attToInsert = records.map(r => ({
        student_id: r.studentId,
        course_id: r.courseId,
        subject_id: r.subjectId,
        date: r.date,
        status: r.status
      }));

      const { error } = await supabase.from('attendance').insert(attToInsert);
      if (error) throw error;

      setAttendanceHistory([...attendanceHistory, ...records]);
      alert('¡Asistencia guardada en Supabase!');
    } catch (e) {
      alert("Error al sincronizar asistencia");
    }
  };

  // Helper to get totals for reports
  const getStudentStats = (studentId: string, subjectId?: string) => {
    const records = attendanceHistory.filter(r => 
      r.studentId === studentId && (subjectId ? r.subjectId === subjectId : true)
    );
    return {
      present: records.filter(r => r.status === 'Presente').length,
      justified: records.filter(r => r.status === 'Justificada').length,
      unjustified: records.filter(r => r.status === 'Injustificada').length,
      total: records.length
    };
  };

  const renderScreen = () => {
    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-surface font-display font-bold text-primary">Cargando AsistApp...</div>;

    switch (currentScreen) {
      case 'welcome': 
        return <WelcomeScreen onLogin={async () => {
          // For the sake of the demo, we try to auto-login or prompt
          const { data: { user } } = await supabase.auth.getUser();
          if (user) setScreen('attendance');
          else setScreen('register');
        }} />;
      
      case 'register': 
        return <RegisterScreen onComplete={handleRegister} />;
      
      case 'course-config': 
        return <CourseConfigScreen 
          onNext={(c) => { setCurrentTempCourse(c); setScreen('student-registration'); }} 
        />;
      
      case 'student-registration': 
        return currentTempCourse ? (
          <StudentRegistrationScreen 
            course={currentTempCourse} 
            onComplete={handleSaveCourse} 
          />
        ) : null;
      
      case 'subject-config': 
        return <SubjectConfigScreen 
          courses={courses} 
          onComplete={handleSaveSubjects} 
        />;
      
      case 'attendance': 
        return profile ? (
          <AttendanceDashboard 
            profile={profile} 
            courses={courses} 
            subjects={subjects} 
            studentsByCourse={studentsByCourse} 
            onSave={handleSaveAttendance}
          />
        ) : null;

      case 'reports':
        return profile ? (
          <ReportsScreen 
            profile={profile}
            courses={courses}
            subjects={subjects}
            studentsByCourse={studentsByCourse}
            getStudentStats={getStudentStats}
          />
        ) : null;

      default: 
        return <WelcomeScreen onLogin={() => setScreen('register')} />;
    }
  };

  return (
    <div className="font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- New Components for Reports and Refined Attendance ---

const ReportsScreen = ({ profile, courses, subjects, studentsByCourse, getStudentStats }: any) => {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');

  const selectedCourse = courses.find((c: any) => c.id === selectedCourseId);
  const selectedSubject = subjects.find((s: any) => s.id === selectedSubjectId);
  const students = studentsByCourse[selectedCourseId] || [];

  const exportGeneralPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(18);
    doc.text("REPORTE DE ASISTENCIA - ASISTAPP", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`DOCENTE: ${profile.first_name.toUpperCase()} ${profile.last_name.toUpperCase()}`, 14, 30);
    doc.text(`CURSO: ${selectedCourse?.year_grade}° "${selectedCourse?.division}" (${selectedCourse?.school_name})`, 14, 37);
    doc.text(`ASIGNATURA: ${selectedSubject?.name.toUpperCase()}`, 14, 44);
    
    autoTable(doc, {
      startY: 55,
      head: [['Estudiante', 'Presentes', 'A. Justif.', 'A. Injustif.', 'Total']],
      body: students.map((s: any) => {
        const stats = getStudentStats(s.id, selectedSubjectId);
        return [s.full_name, stats.present, stats.justified, stats.unjustified, stats.total];
      }),
      headStyles: { fillColor: [0, 104, 95] },
      theme: 'striped'
    });

    doc.save(`Reporte_${selectedCourse?.year_grade}_${selectedSubject?.name}.pdf`);
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <TopAppBar title="Reportes" />
      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
        <header>
          <h1 className="font-display text-4xl font-bold text-primary mb-2">Reportes Académicos</h1>
          <p className="text-on-surface-variant">Visualice y exporte la asistencia de sus alumnos.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select 
            className="w-full p-4 rounded-xl border border-outline-variant outline-none"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            {courses.map((c: any) => (
              <option key={c.id} value={c.id}>{c.year_grade}° "{c.division}" - {c.school_name}</option>
            ))}
          </select>
          <select 
            className="w-full p-4 rounded-xl border border-outline-variant outline-none"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            {subjects.filter((s: any) => s.assigned_courses.includes(selectedCourseId)).map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">
                  <th className="pb-4">Estudiante</th>
                  <th className="pb-4 text-center">Pres.</th>
                  <th className="pb-4 text-center">Just.</th>
                  <th className="pb-4 text-center">Injust.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {students.map((s: any) => {
                  const stats = getStudentStats(s.id, selectedSubjectId);
                  return (
                    <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-4 font-medium">{s.full_name}</td>
                      <td className="py-4 text-center font-bold text-primary">{stats.present}</td>
                      <td className="py-4 text-center font-bold text-secondary">{stats.justified}</td>
                      <td className="py-4 text-center font-bold text-error">{stats.unjustified}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <button 
          onClick={exportGeneralPDF}
          className="w-full bg-primary text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-container shadow-lg transition-all"
        >
          <Printer className="w-6 h-6" />
          Imprimir Reporte General (PDF)
        </button>
      </main>
      <BottomNavBar currentScreen="reports" setScreen={() => {}} />
    </div>
  );
};
