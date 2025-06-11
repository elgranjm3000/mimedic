import { Patient, Appointment, User, Prescription, Invoice } from './types';

const PATIENTS_KEY = 'medical_patients';
const APPOINTMENTS_KEY = 'medical_appointments';
const USERS_KEY = 'medical_users';
const PRESCRIPTIONS_KEY = 'medical_prescriptions';
const INVOICES_KEY = 'medical_invoices';
const CURRENT_USER_KEY = 'medical_current_user';

// Initialize default admin user
const initializeDefaultUsers = () => {
  const users = storageUtils.getUsers();
  if (users.length === 0) {
    const defaultAdmin: User = {
      id: crypto.randomUUID(),
      email: 'admin@medicontrol.com',
      password: 'admin123', // In production, this would be hashed
      firstName: 'Admin',
      lastName: 'Sistema',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const defaultDoctor: User = {
      id: crypto.randomUUID(),
      email: 'doctor@medicontrol.com',
      password: 'doctor123',
      firstName: 'Dr. Juan',
      lastName: 'Pérez',
      role: 'doctor',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageUtils.saveUsers([defaultAdmin, defaultDoctor]);
  }
};

export const storageUtils = {
  // Initialize
  initialize: () => {
    if (typeof window !== 'undefined') {
      initializeDefaultUsers();
    }
  },

  // Auth
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null): void => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  // Users
  getUsers: (): User[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUsers: (users: User[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
    const users = storageUtils.getUsers();
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    storageUtils.saveUsers(users);
    return newUser;
  },

  updateUser: (id: string, updates: Partial<User>): User | null => {
    const users = storageUtils.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storageUtils.saveUsers(users);
    return users[index];
  },

  deleteUser: (id: string): boolean => {
    const users = storageUtils.getUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    storageUtils.saveUsers(filtered);
    return true;
  },

  // Patients
  getPatients: (): Patient[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(PATIENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  savePatients: (patients: Patient[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
  },

  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient => {
    const patients = storageUtils.getPatients();
    const newPatient: Patient = {
      ...patient,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    patients.push(newPatient);
    storageUtils.savePatients(patients);
    return newPatient;
  },

  updatePatient: (id: string, updates: Partial<Patient>): Patient | null => {
    const patients = storageUtils.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    patients[index] = {
      ...patients[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storageUtils.savePatients(patients);
    return patients[index];
  },

  deletePatient: (id: string): boolean => {
    const patients = storageUtils.getPatients();
    const filtered = patients.filter(p => p.id !== id);
    if (filtered.length === patients.length) return false;
    storageUtils.savePatients(filtered);
    return true;
  },

  // Appointments
  getAppointments: (): Appointment[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(APPOINTMENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveAppointments: (appointments: Appointment[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  },

  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment => {
    const appointments = storageUtils.getAppointments();
    const newAppointment: Appointment = {
      ...appointment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    appointments.push(newAppointment);
    storageUtils.saveAppointments(appointments);
    return newAppointment;
  },

  updateAppointment: (id: string, updates: Partial<Appointment>): Appointment | null => {
    const appointments = storageUtils.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    appointments[index] = {
      ...appointments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storageUtils.saveAppointments(appointments);
    return appointments[index];
  },

  deleteAppointment: (id: string): boolean => {
    const appointments = storageUtils.getAppointments();
    const filtered = appointments.filter(a => a.id !== id);
    if (filtered.length === appointments.length) return false;
    storageUtils.saveAppointments(filtered);
    return true;
  },

  // Prescriptions
  getPrescriptions: (): Prescription[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(PRESCRIPTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  savePrescriptions: (prescriptions: Prescription[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(prescriptions));
  },

  addPrescription: (prescription: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Prescription => {
    const prescriptions = storageUtils.getPrescriptions();
    const newPrescription: Prescription = {
      ...prescription,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    prescriptions.push(newPrescription);
    storageUtils.savePrescriptions(prescriptions);
    return newPrescription;
  },

  updatePrescription: (id: string, updates: Partial<Prescription>): Prescription | null => {
    const prescriptions = storageUtils.getPrescriptions();
    const index = prescriptions.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    prescriptions[index] = {
      ...prescriptions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storageUtils.savePrescriptions(prescriptions);
    return prescriptions[index];
  },

  deletePrescription: (id: string): boolean => {
    const prescriptions = storageUtils.getPrescriptions();
    const filtered = prescriptions.filter(p => p.id !== id);
    if (filtered.length === prescriptions.length) return false;
    storageUtils.savePrescriptions(filtered);
    return true;
  },

  // Invoices
  getInvoices: (): Invoice[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(INVOICES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveInvoices: (invoices: Invoice[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  },

  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice => {
    const invoices = storageUtils.getInvoices();
    const newInvoice: Invoice = {
      ...invoice,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    invoices.push(newInvoice);
    storageUtils.saveInvoices(invoices);
    return newInvoice;
  },

  updateInvoice: (id: string, updates: Partial<Invoice>): Invoice | null => {
    const invoices = storageUtils.getInvoices();
    const index = invoices.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    invoices[index] = {
      ...invoices[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storageUtils.saveInvoices(invoices);
    return invoices[index];
  },

  deleteInvoice: (id: string): boolean => {
    const invoices = storageUtils.getInvoices();
    const filtered = invoices.filter(i => i.id !== id);
    if (filtered.length === invoices.length) return false;
    storageUtils.saveInvoices(filtered);
    return true;
  },
};