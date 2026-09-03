import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Registration {
  id: string;
  tutorName: string;
  tutorCpf: string;
  tutorBirthDate: string;
  tutorPhone: string;
  tutorWhatsApp: string;
  tutorEmail: string;
  tutorCity: string;
  tutorState: string;
  petName: string;
  petSpecies: string;
  petBreed: string;
  petSize: 'Pequeno' | 'Médio' | 'Grande';
  petAge: number;
  petPhoto?: string;
  selectedInstitution: string; // institution id
  donationValue: number;
  donationReceipt?: string; // base64 of the receipt image
  donationStatus: 'AGUARDANDO VALIDAÇÃO' | 'EM ANÁLISE' | 'APROVADA' | 'REJEITADA';
  rejectionReason?: string;
  notes?: string;
  regNumber: string;
  statusPayment: 'Pendente' | 'Aprovado';
  statusKit: 'Aguardando' | 'Liberado' | 'Retirado';
  createdAt: string;
  qrCode: string;
}

export interface Institution {
  id: string;
  name: string;
  logo: string; // emoji or char
  description: string;
  mission: string;
  city: string;
  state: string;
  pixKey: string;
  pixType: string;
  pixQrCode?: string;
  responsibleName?: string;
  responsibleEmail?: string;
  responsiblePhone?: string;
  status: 'Ativo' | 'Inativo';
  animalsServed: number;
  castrations: number;
  rescues: number;
  photo: string;
  banner: string;
  email?: string;
  password?: string;
  totalDonations: number;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string; // Base64 or URL
  category: 'Master' | 'Ouro' | 'Prata' | 'Apoio' | 'Premium';
  investedValue: number;
  description: string;
  website: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'Marketing' | 'Estrutura' | 'Brindes' | 'Equipe' | 'Alimentação' | 'Outros';
  value: number;
  date: string;
}

// Helper mapping functions to support camelCase in UI and snake_case in Database

function mapDbToRegistration(db: any): Registration {
  return {
    id: db.id,
    tutorName: db.tutor_name || '',
    tutorCpf: db.tutor_cpf || '',
    tutorBirthDate: db.tutor_birth_date || '',
    tutorPhone: db.tutor_phone || '',
    tutorWhatsApp: db.tutor_whats_app || '',
    tutorEmail: db.tutor_email || '',
    tutorCity: db.tutor_city || '',
    tutorState: db.tutor_state || '',
    petName: db.pet_name || '',
    petSpecies: db.pet_species || '',
    petBreed: db.pet_breed || '',
    petSize: db.pet_size || 'Médio',
    petAge: Number(db.pet_age) || 0,
    petPhoto: db.pet_photo || undefined,
    selectedInstitution: db.selected_institution || '',
    donationValue: Number(db.donation_value) || 0,
    donationReceipt: db.donation_receipt || undefined,
    donationStatus: db.donation_status || 'AGUARDANDO VALIDAÇÃO',
    rejectionReason: db.rejection_reason || undefined,
    notes: db.notes || undefined,
    regNumber: db.reg_number || '',
    statusPayment: db.status_payment || 'Pendente',
    statusKit: db.status_kit || 'Aguardando',
    createdAt: db.created_at || new Date().toISOString(),
    qrCode: db.qr_code || ''
  };
}

function mapRegistrationToDb(reg: Partial<Registration>): any {
  const db: any = {};
  if (reg.id !== undefined) db.id = reg.id;
  if (reg.tutorName !== undefined) db.tutor_name = reg.tutorName;
  if (reg.tutorCpf !== undefined) db.tutor_cpf = reg.tutorCpf;
  if (reg.tutorBirthDate !== undefined) db.tutor_birth_date = reg.tutorBirthDate;
  if (reg.tutorPhone !== undefined) db.tutor_phone = reg.tutorPhone;
  if (reg.tutorWhatsApp !== undefined) db.tutor_whats_app = reg.tutorWhatsApp;
  if (reg.tutorEmail !== undefined) db.tutor_email = reg.tutorEmail;
  if (reg.tutorCity !== undefined) db.tutor_city = reg.tutorCity;
  if (reg.tutorState !== undefined) db.tutor_state = reg.tutorState;
  if (reg.petName !== undefined) db.pet_name = reg.petName;
  if (reg.petSpecies !== undefined) db.pet_species = reg.petSpecies;
  if (reg.petBreed !== undefined) db.pet_breed = reg.petBreed;
  if (reg.petSize !== undefined) db.pet_size = reg.petSize;
  if (reg.petAge !== undefined) db.pet_age = reg.petAge;
  if (reg.petPhoto !== undefined) db.pet_photo = reg.petPhoto;
  if (reg.selectedInstitution !== undefined) db.selected_institution = reg.selectedInstitution;
  if (reg.donationValue !== undefined) db.donation_value = reg.donationValue;
  if (reg.donationReceipt !== undefined) db.donation_receipt = reg.donationReceipt;
  if (reg.donationStatus !== undefined) db.donation_status = reg.donationStatus;
  if (reg.rejectionReason !== undefined) db.rejection_reason = reg.rejectionReason;
  if (reg.notes !== undefined) db.notes = reg.notes;
  if (reg.regNumber !== undefined) db.reg_number = reg.regNumber;
  if (reg.statusPayment !== undefined) db.status_payment = reg.statusPayment;
  if (reg.statusKit !== undefined) db.status_kit = reg.statusKit;
  if (reg.createdAt !== undefined) db.created_at = reg.createdAt;
  if (reg.qrCode !== undefined) db.qr_code = reg.qrCode;
  return db;
}

function mapDbToInstitution(db: any): Institution {
  return {
    id: db.id,
    name: db.name || '',
    logo: db.logo || '🏠',
    description: db.description || '',
    mission: db.mission || '',
    city: db.city || '',
    state: db.state || '',
    pixKey: db.pix_key || '',
    pixType: db.pix_type || 'CNPJ',
    status: db.status || 'Ativo',
    animalsServed: Number(db.animals_served) || 0,
    castrations: Number(db.castrations) || 0,
    rescues: Number(db.rescues) || 0,
    photo: db.photo || '',
    banner: db.banner || '',
    email: db.email || '',
    password: db.password || '',
    totalDonations: Number(db.total_donations) || 0
  };
}

function mapInstitutionToDb(inst: Partial<Institution>): any {
  const db: any = {};
  if (inst.id !== undefined) db.id = inst.id;
  if (inst.name !== undefined) db.name = inst.name;
  if (inst.logo !== undefined) db.logo = inst.logo;
  if (inst.description !== undefined) db.description = inst.description;
  if (inst.mission !== undefined) db.mission = inst.mission;
  if (inst.city !== undefined) db.city = inst.city;
  if (inst.state !== undefined) db.state = inst.state;
  if (inst.pixKey !== undefined) db.pix_key = inst.pixKey;
  if (inst.pixType !== undefined) db.pix_type = inst.pixType;
  if (inst.status !== undefined) db.status = inst.status;
  if (inst.animalsServed !== undefined) db.animals_served = inst.animalsServed;
  if (inst.castrations !== undefined) db.castrations = inst.castrations;
  if (inst.rescues !== undefined) db.rescues = inst.rescues;
  if (inst.photo !== undefined) db.photo = inst.photo;
  if (inst.banner !== undefined) db.banner = inst.banner;
  if (inst.email !== undefined) db.email = inst.email;
  if (inst.password !== undefined) db.password = inst.password;
  if (inst.totalDonations !== undefined) db.total_donations = inst.totalDonations;
  return db;
}

// Initial fallback mock data seed for institutions
const initialInstitutions: Institution[] = [
  {
    id: 'inst-2',
    name: 'Projeto Amor sem Fronteiras',
    logo: '❤️',
    description: 'Projeto voluntário que atua no resgate de animais abandonados e na promoção de campanhas de adoção consciente.',
    mission: 'Amor que não conhece fronteiras: resgatar, cuidar e encontrar um lar para cada animal.',
    city: 'Recife',
    state: 'PE',
    pixKey: '(81) 99524-7931',
    pixType: 'Telefone',
    responsiblePhone: '(81) 99524-7931',
    status: 'Ativo',
    animalsServed: 228,
    castrations: 97,
    rescues: 64,
    photo: '/institutions/inst-2-amor-sem-fronteiras.png',
    banner: '/institutions/inst-2-amor-sem-fronteiras.png',
    totalDonations: 0
  },
  {
    id: 'inst-3',
    name: 'Todos por Guerreiro',
    logo: '🐾',
    description: 'ONG focada no resgate de animais em situação de vulnerabilidade, promovendo saúde, castração e adoção responsável.',
    mission: 'Unidos pelo mesmo propósito: dar voz e abrigo a quem não pode falar por si.',
    city: 'Recife',
    state: 'PE',
    pixKey: 'todosporguerreiro@gmail.com',
    pixType: 'Email',
    responsibleEmail: 'todosporguerreiro@gmail.com',
    status: 'Ativo',
    animalsServed: 185,
    castrations: 72,
    rescues: 53,
    photo: '/institutions/inst-3-todos-por-guerreiro.png',
    banner: '/institutions/inst-3-todos-por-guerreiro.png',
    totalDonations: 0
  },
  {
    id: 'inst-1',
    name: 'Abrigo de Seu Alberto',
    logo: '🐕',
    description: 'Abrigo dedicado ao resgate, cuidado e adoção de animais em situação de rua na região metropolitana do Recife.',
    mission: 'Resgatar e reabilitar animais abandonados, promovendo adoção responsável e bem-estar animal.',
    city: 'Recife',
    state: 'PE',
    pixKey: '(81) 99201-4838',
    pixType: 'Telefone',
    responsiblePhone: '(81) 99201-4838',
    status: 'Ativo',
    animalsServed: 312,
    castrations: 145,
    rescues: 89,
    photo: '/institutions/inst-1-abrigo-seu-alberto.png',
    banner: '/institutions/inst-1-abrigo-seu-alberto.png',
    totalDonations: 0
  }
];

// Initial fallback mock data seed for sponsors & expenses (kept in LocalStorage for simplicity)

const initialSponsors: Sponsor[] = [
  {
    id: 'sp-1',
    name: 'Oh Pet Club',
    logo: '/sponsors/ohpet.png',
    category: 'Premium',
    investedValue: 20000,
    description: 'Clínica veterinária e petshop especializado. Ponto de apoio Zona Norte.',
    website: 'https://ohpet.com.br'
  },
  {
    id: 'sp-2',
    name: 'Amigo Bicho',
    logo: '/sponsors/amigobicho.png',
    category: 'Premium',
    investedValue: 18000,
    description: 'Cuidado, amor e produtos de alta qualidade para o seu pet.',
    website: 'https://amigobicho.com.br'
  },
  {
    id: 'sp-3',
    name: 'Metrópole',
    logo: '/sponsors/metropole.png',
    category: 'Premium',
    investedValue: 18000,
    description: 'Excelência em serviços e grande parceiro da Cãominhada.',
    website: 'https://metropole.com.br'
  },
  {
    id: 'sp-4',
    name: 'Pet Happy',
    logo: '/sponsors/pethappy.png',
    category: 'Premium',
    investedValue: 15000,
    description: 'Centro de estética e cuidados pet. Ponto de apoio Zona Sul.',
    website: 'https://pethappy.com.br'
  },
  {
    id: 'sp-5',
    name: 'Eu Pet',
    logo: '/sponsors/eupet.png',
    category: 'Apoio',
    investedValue: 15000,
    description: 'Plano de Saúde Pet completo para a saúde do seu melhor amigo.',
    website: 'https://eupet.com.br'
  }
];

const initialExpenses: Expense[] = [
  { id: 'ex-1', title: 'Tendas e Palco principal', category: 'Estrutura', value: 4200, date: '2026-06-01' },
  { id: 'ex-2', title: 'Medalhas e Troféus de participação', category: 'Brindes', value: 2500, date: '2026-06-02' },
  { id: 'ex-3', title: 'Camisetas personalizadas Petsalut', category: 'Brindes', value: 3800, date: '2026-06-03' },
  { id: 'ex-4', title: 'Anúncios Instagram & Facebook', category: 'Marketing', value: 1500, date: '2026-06-04' },
  { id: 'ex-5', title: 'Contratação Equipe de Apoio e Vet', category: 'Equipe', value: 2800, date: '2026-06-05' },
  { id: 'ex-6', title: 'Copos de água biodegradáveis', category: 'Alimentação', value: 600, date: '2026-06-06' }
];

class SupabaseMockClient {
  private institutions: Institution[] = [];
  private registrations: Registration[] = [];

  constructor() {
    this.syncFromSupabase();
  }

  private getStorage<T>(key: string, initial: T[]): T[] {
    if (typeof window === 'undefined') return initial;
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(item);
  }

  private setStorage<T>(key: string, data: T[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  // Async server-sync triggered on boot and page queries
  async syncFromSupabase() {
    try {
      const { data: instData } = await supabase.from('institutions').select('*');
      if (instData && instData.length > 0) {
        this.institutions = instData.map(mapDbToInstitution);
        this.setStorage('ps_institutions', this.institutions);
      } else {
        // Supabase empty or unreachable: use seed data
        if (this.institutions.length === 0) {
          this.institutions = initialInstitutions;
          this.setStorage('ps_institutions', initialInstitutions);
        }
      }
      
      const { data: regData } = await supabase.from('registrations').select('*');
      if (regData) {
        this.registrations = regData.map(mapDbToRegistration);
        this.setStorage('ps_registrations', this.registrations);
      }
    } catch (err) {
      console.error('Error syncing with Supabase:', err);
      // Ensure seed data is loaded on error
      if (this.institutions.length === 0) {
        this.institutions = initialInstitutions;
        this.setStorage('ps_institutions', initialInstitutions);
      }
    }
  }

  // --- Institutions API ---

  getInstitutions(): Institution[] {
    if (this.institutions.length > 0) return this.institutions;
    const stored = this.getStorage<Institution>('ps_institutions', []);
    if (stored.length > 0) return stored;
    // Use seed data as ultimate fallback
    this.institutions = initialInstitutions;
    this.setStorage('ps_institutions', initialInstitutions);
    return initialInstitutions;
  }

  saveInstitution(inst: Omit<Institution, 'id'>): Institution {
    const newId = `inst-${Date.now()}`;
    const newInst: Institution = {
      ...inst,
      id: newId,
      totalDonations: inst.totalDonations || 0
    };

    // Synchronous optimistic update
    this.institutions.push(newInst);
    this.setStorage('ps_institutions', this.institutions);

    // Async server insert
    supabase.from('institutions').insert([mapInstitutionToDb(newInst)]).then(({ error }) => {
      if (error) console.error('Error creating institution in Supabase:', error);
    });

    return newInst;
  }

  updateInstitution(id: string, updates: Partial<Institution>): Institution {
    const list = this.getInstitutions();
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Institution not found');
    const updated = { ...list[idx], ...updates };

    // Synchronous optimistic update
    list[idx] = updated;
    this.institutions = list;
    this.setStorage('ps_institutions', this.institutions);

    // Async server update
    supabase.from('institutions').update(mapInstitutionToDb(updates)).eq('id', id).then(({ error }) => {
      if (error) console.error('Error updating institution in Supabase:', error);
    });

    return updated;
  }

  deleteInstitution(id: string): void {
    const list = this.getInstitutions();
    const filtered = list.filter(i => i.id !== id);

    // Synchronous optimistic update
    this.institutions = filtered;
    this.setStorage('ps_institutions', this.institutions);

    // Async server delete
    supabase.from('institutions').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Error deleting institution from Supabase:', error);
    });
  }

  // --- Registrations API ---

  getRegistrations(): Registration[] {
    if (this.registrations.length > 0) return this.registrations;
    return this.getStorage<Registration>('ps_registrations', []);
  }

  saveRegistration(reg: Omit<Registration, 'id' | 'createdAt' | 'regNumber' | 'qrCode'>): Registration {
    const list = this.getRegistrations();
    const count = list.length + 1;
    const formattedCount = String(count).padStart(4, '0');
    const regNumber = `PET-2026-${formattedCount}`;
    
    const newReg: Registration = {
      ...reg,
      id: `reg-${Date.now()}`,
      regNumber,
      createdAt: new Date().toISOString(),
      qrCode: `${regNumber}|${reg.tutorName}|${reg.petName}|${reg.statusPayment}`
    };

    // Synchronous optimistic update
    list.push(newReg);
    this.registrations = list;
    this.setStorage('ps_registrations', this.registrations);

    // Async server insert
    supabase.from('registrations').insert([mapRegistrationToDb(newReg)]).then(({ error }) => {
      if (error) console.error('Error creating registration in Supabase:', error);
    });

    return newReg;
  }

  updateRegistration(id: string, updates: Partial<Registration>): Registration {
    const list = this.getRegistrations();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Registration not found');

    const updated = { ...list[idx], ...updates };
    updated.qrCode = `${updated.regNumber}|${updated.tutorName}|${updated.petName}|${updated.statusPayment}`;
    
    // Synchronous optimistic update
    list[idx] = updated;
    this.registrations = list;
    this.setStorage('ps_registrations', this.registrations);

    // Async server update
    supabase.from('registrations').update(mapRegistrationToDb(updates)).eq('id', id).then(({ error }) => {
      if (error) console.error('Error updating registration in Supabase:', error);
    });

    return updated;
  }

  deleteRegistration(id: string): void {
    const list = this.getRegistrations();
    const filtered = list.filter(r => r.id !== id);

    // Synchronous optimistic update
    this.registrations = filtered;
    this.setStorage('ps_registrations', this.registrations);

    // Async server delete
    supabase.from('registrations').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Error deleting registration from Supabase:', error);
    });
  }

  // --- Sponsors API (LocalStorage) ---

  getSponsors(): Sponsor[] {
    const list = this.getStorage<Sponsor>('ps_sponsors', initialSponsors);
    if (list.some(s => s.name.includes('Royal Canin') || s.name.includes('Petsalut Plano') || s.name.includes('PremieRpet'))) {
      this.setStorage('ps_sponsors', initialSponsors);
      return initialSponsors;
    }
    return list;
  }

  saveSponsor(sponsor: Omit<Sponsor, 'id'>): Sponsor {
    const list = this.getSponsors();
    const newSponsor: Sponsor = {
      ...sponsor,
      id: `sp-${Date.now()}`
    };
    list.push(newSponsor);
    this.setStorage('ps_sponsors', list);
    return newSponsor;
  }

  updateSponsor(id: string, updates: Partial<Sponsor>): Sponsor {
    const list = this.getSponsors();
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Sponsor not found');
    const updated = { ...list[idx], ...updates };
    list[idx] = updated;
    this.setStorage('ps_sponsors', list);
    return updated;
  }

  deleteSponsor(id: string): void {
    const list = this.getSponsors();
    const filtered = list.filter(s => s.id !== id);
    this.setStorage('ps_sponsors', filtered);
  }

  // --- Expenses API (LocalStorage) ---

  getExpenses(): Expense[] {
    return this.getStorage<Expense>('ps_expenses', initialExpenses);
  }

  saveExpense(expense: Omit<Expense, 'id'>): Expense {
    const list = this.getExpenses();
    const newExpense: Expense = {
      ...expense,
      id: `ex-${Date.now()}`
    };
    list.push(newExpense);
    this.setStorage('ps_expenses', list);
    return newExpense;
  }

  deleteExpense(id: string): void {
    const list = this.getExpenses();
    const filtered = list.filter(e => e.id !== id);
    this.setStorage('ps_expenses', filtered);
  }

  // --- Auth & Session API ---

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem('ps_session');
    return session ? JSON.parse(session) : null;
  }

  signIn(email: string, identity: string): { success: boolean; user?: any; error?: string } {
    // Admin check
    if (email === 'admin@petsalut.com.br' && identity === 'admin123') {
      const user = { email, role: 'admin', name: 'Administrador Petsalut' };
      localStorage.setItem('ps_session', JSON.stringify(user));
      return { success: true, user };
    }

    // Institution check
    const institutionsList = this.getInstitutions();
    const instUser = institutionsList.find(i => 
      i.email && i.email.toLowerCase().trim() === email.toLowerCase().trim() && 
      i.password === identity
    );
    if (instUser) {
      const user = { email, role: 'institution', id: instUser.id, name: instUser.name };
      localStorage.setItem('ps_session', JSON.stringify(user));
      return { success: true, user };
    }

    // Participant check: we match by email AND tutorCpf
    const list = this.getRegistrations();
    const formattedCpf = identity.replace(/\D/g, '');
    const userReg = list.find(r => 
      r.tutorEmail.toLowerCase().trim() === email.toLowerCase().trim() && 
      r.tutorCpf.replace(/\D/g, '') === formattedCpf
    );

    if (userReg) {
      const user = { email, role: 'participant', id: userReg.id, name: userReg.tutorName };
      localStorage.setItem('ps_session', JSON.stringify(user));
      return { success: true, user };
    }

    return { success: false, error: 'Credenciais inválidas. Participantes devem usar e-mail e CPF cadastrados.' };
  }

  signOut() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ps_session');
    }
  }
}

export const supabaseMock = new SupabaseMockClient();
export default supabaseMock;
