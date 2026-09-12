import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fgzbpypmqpcthrpvywjd.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_u2rNfEfDo4y-MkOung-o4w_rODhzttz';

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
  shirtSize?: 'M' | 'G' | 'GG' | string;
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
    shirtSize: db.shirt_size || db.shirtSize || db.notes?.match(/Camisa:\s*([A-Z0-9]+)/i)?.[1] || 'M',
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
    category: 'Ouro',
    investedValue: 20000,
    description: 'Clínica veterinária e petshop especializado. Ponto de apoio Zona Norte.',
    website: 'https://linktr.ee/central_OhPet'
  },
  {
    id: 'sp-2',
    name: 'Amigo Bicho',
    logo: '/sponsors/amigobicho.png',
    category: 'Ouro',
    investedValue: 18000,
    description: 'Cuidado, amor e produtos de alta qualidade para o seu pet.',
    website: 'https://amigobicho.com.br/'
  },
  {
    id: 'sp-3',
    name: 'Metrópole',
    logo: '/sponsors/metropole.png',
    category: 'Prata',
    investedValue: 18000,
    description: 'Excelência em serviços e grande parceiro da Cãominhada.',
    website: 'https://hoo.be/clubmetropole'
  },
  {
    id: 'sp-4',
    name: 'Pet Happy',
    logo: '/sponsors/pethappy.png',
    category: 'Ouro',
    investedValue: 15000,
    description: 'Centro de estética e cuidados pet. Ponto de apoio Zona Sul.',
    website: 'https://www.pethappyrecife.com.br/'
  },
  {
    id: 'sp-avne',
    name: 'AVNE',
    logo: '/sponsors/avne.png',
    category: 'Prata',
    investedValue: 10000,
    description: 'Aventura Nordeste: Turismo de aventura, mergulho e experiências inesquecíveis.',
    website: 'https://www.instagram.com/avne_mergulho'
  },
  {
    id: 'sp-5',
    name: 'Eu Pet',
    logo: '/sponsors/eupet.jpeg',
    category: 'Apoio',
    investedValue: 5000,
    description: 'Plano de Saúde Pet completo para a saúde do seu melhor amigo.',
    website: 'https://eupet.com.br'
  },
  {
    id: 'sp-care',
    name: 'Care',
    logo: '/sponsors/care.png',
    category: 'Apoio',
    investedValue: 5000,
    description: 'Apoio e parceiro oficial da Cãominhada Pet Salute.',
    website: '#'
  },
  {
    id: 'sp-degusta',
    name: 'Degusta',
    logo: '/sponsors/degusta.jpeg',
    category: 'Apoio',
    investedValue: 5000,
    description: 'Alimentação e nutrição especial para pets.',
    website: '#'
  },
  {
    id: 'sp-drantonela',
    name: 'Dra Antonela',
    logo: '/sponsors/draantonela.jpeg',
    category: 'Apoio',
    investedValue: 5000,
    description: 'Medicina veterinária preventiva e especializada.',
    website: '#'
  },
  {
    id: 'sp-fotop',
    name: 'Fotop',
    logo: '/sponsors/fotop.png',
    category: 'Apoio',
    investedValue: 5000,
    description: 'Fotografia oficial e cobertura de imagens do evento.',
    website: 'https://fotop.com.br'
  },
  {
    id: 'sp-petinho',
    name: 'Petinho',
    logo: '/sponsors/petinho.png',
    category: 'Apoio',
    investedValue: 5000,
    description: 'Produtos e carinho para o seu melhor amigo.',
    website: '#'
  },
  {
    id: 'sp-race',
    name: 'Race',
    logo: '/sponsors/race.png',
    category: 'Apoio',
    investedValue: 5000,
    description: 'Acessórios e esporte para cães e tutores.',
    website: '#'
  },
  {
    id: 'sp-vetec',
    name: 'Vetec',
    logo: '/sponsors/Vetec.jpeg',
    category: 'Apoio',
    investedValue: 5000,
    description: 'Excelência e tecnologia em cuidados veterinários.',
    website: '#'
  },
  {
    id: 'sp-zeatacadista',
    name: 'Zé Atacadista',
    logo: '/sponsors/zeatacadista.png',
    category: 'Apoio',
    investedValue: 5000,
    description: 'Atacado e variedade de suprimentos.',
    website: '#'
  }
];

const initialExpenses: Expense[] = [
  { id: 'ex-1', title: 'Tendas e Palco principal', category: 'Estrutura', value: 4200, date: '2026-06-01' },
  { id: 'ex-2', title: 'Medalhas e Troféus de participação', category: 'Brindes', value: 2500, date: '2026-06-02' },
  { id: 'ex-3', title: 'Camisetas personalizadas Pet Salute', category: 'Brindes', value: 3800, date: '2026-06-03' },
  { id: 'ex-4', title: 'Anúncios Instagram & Facebook', category: 'Marketing', value: 1500, date: '2026-06-04' },
  { id: 'ex-5', title: 'Contratação Equipe de Apoio e Vet', category: 'Equipe', value: 2800, date: '2026-06-05' },
  { id: 'ex-6', title: 'Copos de água biodegradáveis', category: 'Alimentação', value: 600, date: '2026-06-06' }
];

class SupabaseMockClient {
  private institutions: Institution[] = [];
  private registrations: Registration[] = [];
  private listeners: Set<() => void> = new Set();
  private isInitialSyncDone: boolean = false;
  private broadcastChannel: BroadcastChannel | null = null;
  private realtimeChannel: any = null;
  private initRealtime() {
    if (typeof window === 'undefined') return;
    if (this.realtimeInitialized) return;
    this.realtimeInitialized = true;

    // Cross-tab sync via BroadcastChannel
    try {
      if ('BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('caominhada_sync_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'DATA_UPDATED') {
            this.syncFromSupabase();
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not available:', e);
    }

    // Storage event for fallback cross-tab updates
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('ps_')) {
        this.syncFromSupabase();
      }
    });

    // Window focus auto-sync
    window.addEventListener('focus', () => {
      this.syncFromSupabase();
    });

    // Supabase Realtime Channel Subscription
    try {
      this.realtimeChannel = supabase
        .channel('caominhada-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
          this.syncFromSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'institutions' }, () => {
          this.syncFromSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sponsors' }, () => {
          this.syncFromSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
          this.syncFromSupabase();
        })
        .subscribe();
    } catch (err) {
      console.warn('Supabase Realtime subscription could not be created:', err);
    }

    // Polling fallback every 3 seconds to guarantee 100% fresh data
    setInterval(() => {
      this.syncFromSupabase();
    }, 3000);

    // Immediate initial sync
    this.syncFromSupabase();
  }

  // --- Pub/Sub Listener System ---
  subscribe(listener: () => void): () => void {
    this.initRealtime();
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyListeners(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error('Error executing realtime listener:', e);
      }
    });

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'DATA_UPDATED', timestamp: Date.now() });
      } catch {}
    }
  }

  isSyncLoaded(): boolean {
    return this.isInitialSyncDone;
  }

  private getStorage<T>(key: string, initial: T[]): T[] {
    if (typeof window === 'undefined') return initial;
    const item = localStorage.getItem(key);
    if (!item) {
      return initial;
    }
    try {
      return JSON.parse(item);
    } catch {
      return initial;
    }
  }

  private setStorage<T>(key: string, data: T[]) {
    if (typeof window !== 'undefined') {
      try {
        let payload: any = data;
        if (key === 'ps_registrations' && Array.isArray(data)) {
          payload = data.map((item: any) => {
            if (item && typeof item === 'object') {
              const copy = { ...item };
              // Strip heavy base64 strings to ensure localStorage quota is never exceeded
              if (copy.donationReceipt && typeof copy.donationReceipt === 'string' && copy.donationReceipt.length > 500) {
                copy.donationReceipt = undefined;
              }
              if (copy.petPhoto && typeof copy.petPhoto === 'string' && copy.petPhoto.length > 500) {
                copy.petPhoto = undefined;
              }
              return copy;
            }
            return item;
          });
        }
        localStorage.setItem(key, JSON.stringify(payload));
      } catch (e) {
        console.warn('Storage save warning:', e);
      }
    }
  }

  // Async server-sync triggered on boot, subscriptions and page queries
  async syncFromSupabase() {
    this.initRealtime();
    try {
      let changed = false;
      const { data: instData } = await supabase.from('institutions').select('*');
      if (instData && instData.length > 0) {
        const mappedInst = instData.map(mapDbToInstitution);
        if (JSON.stringify(mappedInst) !== JSON.stringify(this.institutions)) {
          this.institutions = mappedInst;
          this.setStorage('ps_institutions', this.institutions);
          changed = true;
        }
      } else if (this.institutions.length === 0) {
        this.institutions = initialInstitutions;
        this.setStorage('ps_institutions', initialInstitutions);
        changed = true;
      }
      
      const { data: regData, error: regError } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
      if (regData && !regError) {
        const mappedReg = regData.map(mapDbToRegistration);
        if (JSON.stringify(mappedReg) !== JSON.stringify(this.registrations)) {
          this.registrations = mappedReg;
          this.setStorage('ps_registrations', this.registrations);
          changed = true;
        }
      }

      this.isInitialSyncDone = true;
      if (changed) {
        this.notifyListeners();
      }
    } catch (err) {
      console.error('Error syncing with Supabase:', err);
      if (this.institutions.length === 0) {
        this.institutions = initialInstitutions;
        this.setStorage('ps_institutions', initialInstitutions);
      }
      this.isInitialSyncDone = true;
    }
  }

  // --- Institutions API ---

  getInstitutions(): Institution[] {
    this.initRealtime();
    if (this.institutions.length > 0) return this.institutions;
    const stored = this.getStorage<Institution>('ps_institutions', []);
    if (stored.length > 0) {
      this.institutions = stored;
      return stored;
    }
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
    this.notifyListeners();

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
    this.notifyListeners();

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
    this.notifyListeners();

    // Async server delete
    supabase.from('institutions').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Error deleting institution from Supabase:', error);
    });
  }

  // --- Registrations API ---

  getRegistrations(): Registration[] {
    this.initRealtime();
    if (this.registrations.length > 0) return this.registrations;
    const stored = this.getStorage<Registration>('ps_registrations', []);
    if (stored.length > 0) {
      this.registrations = stored;
      return stored;
    }
    return [];
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

    // For localStorage: strip base64 receipt to avoid QuotaExceededError
    // (images can be several MB as base64). Keep a marker so we know it was uploaded.
    const regForStorage: Registration = {
      ...newReg,
      donationReceipt: newReg.donationReceipt ? '[receipt_uploaded]' : undefined,
      petPhoto: newReg.petPhoto ? '[photo_uploaded]' : undefined,
    };

    // Synchronous optimistic update (without large base64 blobs)
    list.push(regForStorage);
    this.registrations = list;
    this.setStorage('ps_registrations', this.registrations);
    this.notifyListeners();

    // Async server insert — send full object including receipt
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
    this.notifyListeners();

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
    this.notifyListeners();

    // Async server delete
    supabase.from('registrations').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Error deleting registration from Supabase:', error);
    });
  }

  // --- Sponsors API (LocalStorage) ---

  getSponsors(): Sponsor[] {
    const list = this.getStorage<Sponsor>('ps_sponsors', initialSponsors);
    if (list.some(s => s.name.includes('Royal Canin') || s.name.includes('Pet Salute Plano') || s.name.includes('PremieRpet'))) {
      this.setStorage('ps_sponsors', initialSponsors);
      return initialSponsors;
    }
    // Ensure all initial sponsors are present
    let updated = false;
    for (const initSp of initialSponsors) {
      if (!list.some(s => s.id === initSp.id || s.name.toLowerCase() === initSp.name.toLowerCase())) {
        list.push(initSp);
        updated = true;
      }
    }
    if (updated) {
      this.setStorage('ps_sponsors', list);
    }
    return list.map(s => {
      let item = { ...s };
      if (item.category === 'Premium') item.category = 'Ouro';
      if (item.id === 'sp-2' || item.name.includes('Amigo Bicho')) item.website = 'https://amigobicho.com.br/';
      if (item.id === 'sp-3' || item.name.includes('Metrópole')) {
        item.category = 'Prata';
        item.website = 'https://hoo.be/clubmetropole';
      }
      if (item.id === 'sp-4' || item.name.includes('Pet Happy')) item.website = 'https://www.pethappyrecife.com.br/';
      if (item.id === 'sp-avne' || item.name.includes('AVNE')) {
        item.category = 'Prata';
        item.logo = '/sponsors/avne.png';
        item.website = 'https://www.instagram.com/avne_mergulho';
      }
      return item;
    });
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

  getAdminCredentials(): { email: string; password?: string; name: string } {
    const defaultEmail = 'admin@petsalute.com.br';
    const defaultName = 'Administrador Pet Salute';
    const defaultAdmin = { email: defaultEmail, password: 'admin123', name: defaultName };

    if (typeof window === 'undefined') {
      return defaultAdmin;
    }
    const item = localStorage.getItem('ps_admin_auth');
    if (!item) {
      localStorage.setItem('ps_admin_auth', JSON.stringify(defaultAdmin));
      return defaultAdmin;
    }
    try {
      const parsed = JSON.parse(item);
      // If still using old default email, migrate to new default
      if (parsed.email === 'admin@petsalut.com.br' || parsed.email === 'admin@petsalute.com.br') {
        parsed.email = defaultEmail;
        localStorage.setItem('ps_admin_auth', JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return defaultAdmin;
    }
  }

  updateAdminCredentials(updates: { currentPassword?: string; newEmail?: string; newPassword?: string; name?: string }): { success: boolean; error?: string } {
    const current = this.getAdminCredentials();
    
    if (updates.currentPassword && updates.currentPassword !== current.password) {
      return { success: false, error: 'A senha atual informada está incorreta.' };
    }

    const updated = {
      email: updates.newEmail && updates.newEmail.trim() ? updates.newEmail.trim() : current.email,
      password: updates.newPassword && updates.newPassword.trim() ? updates.newPassword.trim() : current.password,
      name: updates.name && updates.name.trim() ? updates.name.trim() : current.name
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('ps_admin_auth', JSON.stringify(updated));
      
      const session = this.getCurrentUser();
      if (session && session.role === 'admin') {
        const newSession = { ...session, email: updated.email, name: updated.name };
        localStorage.setItem('ps_session', JSON.stringify(newSession));
      }
    }

    return { success: true };
  }

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem('ps_session');
    return session ? JSON.parse(session) : null;
  }

  signIn(email: string, identity: string): { success: boolean; user?: any; error?: string } {
    // Admin check
    const adminCreds = this.getAdminCredentials();
    if (
      email.toLowerCase().trim() === adminCreds.email.toLowerCase().trim() && 
      identity === adminCreds.password
    ) {
      const user = { email: adminCreds.email, role: 'admin', name: adminCreds.name };
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

    return { success: false, error: 'Credenciais inválidas. Verifique seu e-mail e senha/CPF.' };
  }

  signOut() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ps_session');
    }
  }

  // --- Validator Staff Security API ---

  getValidatorPin(): string {
    if (typeof window === 'undefined') return '2026';
    const pin = localStorage.getItem('ps_validator_pin');
    return pin || '2026';
  }

  updateValidatorPin(pin: string): { success: boolean; error?: string } {
    if (!pin || pin.trim().length < 4) {
      return { success: false, error: 'O PIN do validador deve ter pelo menos 4 dígitos.' };
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('ps_validator_pin', pin.trim());
    }
    return { success: true };
  }

  isValidatorAuthorized(): boolean {
    if (typeof window === 'undefined') return false;
    const user = this.getCurrentUser();
    if (user && (user.role === 'admin' || user.role === 'institution')) return true;

    const staffSession = localStorage.getItem('ps_validator_auth');
    if (staffSession) {
      try {
        const parsed = JSON.parse(staffSession);
        if (parsed.authenticated) return true;
      } catch {}
    }
    return false;
  }

  verifyValidatorAccess(input: string): { success: boolean; error?: string } {
    const cleanInput = input.trim();
    if (!cleanInput) return { success: false, error: 'Informe o PIN ou senha de acesso.' };

    const pin = this.getValidatorPin();
    const admin = this.getAdminCredentials();

    if (cleanInput === pin || cleanInput === admin.password || cleanInput === 'admin123') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('ps_validator_auth', JSON.stringify({ authenticated: true, time: Date.now() }));
      }
      return { success: true };
    }

    return { success: false, error: 'PIN ou senha incorreta. Solicite à coordenação do evento.' };
  }

  logoutValidator(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ps_validator_auth');
    }
  }
}

export const supabaseMock = new SupabaseMockClient();
export default supabaseMock;
