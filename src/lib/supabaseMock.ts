// Mock Supabase Client for local interactive demonstration

export interface Registration {
  id: string;
  tutorName: string;
  tutorCpf: string;
  tutorPhone: string;
  tutorEmail: string;
  petName: string;
  petBreed: string;
  petSize: 'Pequeno' | 'Médio' | 'Grande';
  petAge: number;
  regNumber: string;
  statusPayment: 'Pendente' | 'Aprovado';
  statusKit: 'Aguardando' | 'Liberado' | 'Retirado';
  createdAt: string;
  qrCode: string;
  petPhoto?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string; // Base64 or URL
  category: 'Master' | 'Ouro' | 'Prata' | 'Apoio';
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

// Initial mock data seed
const initialSponsors: Sponsor[] = [
  {
    id: 'sp-1',
    name: 'Petsalut Plano de Saúde',
    logo: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=150&h=150&fit=crop&q=80',
    category: 'Master',
    investedValue: 15000,
    description: 'O melhor plano de saúde para o seu melhor amigo.',
    website: 'https://petsalut.com.br'
  },
  {
    id: 'sp-2',
    name: 'Royal Canin',
    logo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&h=150&fit=crop&q=80',
    category: 'Ouro',
    investedValue: 8000,
    description: 'Nutrição para cães de todas as raças.',
    website: 'https://royalcanin.com'
  },
  {
    id: 'sp-3',
    name: 'PremieRpet',
    logo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=150&h=150&fit=crop&q=80',
    category: 'Ouro',
    investedValue: 7500,
    description: 'Alimentos Super Premium de alta qualidade.',
    website: 'https://premierpet.com.br'
  },
  {
    id: 'sp-4',
    name: 'Zee.Dog',
    logo: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=150&h=150&fit=crop&q=80',
    category: 'Prata',
    investedValue: 4000,
    description: 'Acessórios modernos e cheios de estilo.',
    website: 'https://zeedog.com.br'
  },
  {
    id: 'sp-5',
    name: 'Cobasi',
    logo: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=150&h=150&fit=crop&q=80',
    category: 'Prata',
    investedValue: 3500,
    description: 'Shopping oficial de animais domésticos.',
    website: 'https://cobasi.com.br'
  },
  {
    id: 'sp-6',
    name: 'Dog Vibe',
    logo: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=150&h=150&fit=crop&q=80',
    category: 'Apoio',
    investedValue: 1500,
    description: 'Produtos de estilo de vida pet.',
    website: 'https://dogvibe.com.br'
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

const initialRegistrations: Registration[] = [
  {
    id: 'reg-1',
    tutorName: 'Mariana Silva',
    tutorCpf: '123.456.789-00',
    tutorPhone: '(11) 98765-4321',
    tutorEmail: 'mariana.silva@email.com',
    petName: 'Mel',
    petBreed: 'Golden Retriever',
    petSize: 'Grande',
    petAge: 3,
    regNumber: 'PET-2026-0001',
    statusPayment: 'Aprovado',
    statusKit: 'Retirado',
    createdAt: '2026-06-01T10:30:00Z',
    qrCode: 'PET-2026-0001|Mariana Silva|Mel|Aprovado',
    petPhoto: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop&q=80'
  },
  {
    id: 'reg-2',
    tutorName: 'Thiago Oliveira',
    tutorCpf: '234.567.890-12',
    tutorPhone: '(21) 99888-7766',
    tutorEmail: 'thiago.oliveira@email.com',
    petName: 'Rocky',
    petBreed: 'Bulldog Francês',
    petSize: 'Pequeno',
    petAge: 2,
    regNumber: 'PET-2026-0002',
    statusPayment: 'Aprovado',
    statusKit: 'Liberado',
    createdAt: '2026-06-02T14:15:00Z',
    qrCode: 'PET-2026-0002|Thiago Oliveira|Rocky|Aprovado',
    petPhoto: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&h=150&fit=crop&q=80'
  },
  {
    id: 'reg-3',
    tutorName: 'Ana Clara Souza',
    tutorCpf: '345.678.901-23',
    tutorPhone: '(31) 98555-4433',
    tutorEmail: 'ana.clara@email.com',
    petName: 'Pipoca',
    petBreed: 'Vira-lata (SDR)',
    petSize: 'Médio',
    petAge: 5,
    regNumber: 'PET-2026-0003',
    statusPayment: 'Pendente',
    statusKit: 'Aguardando',
    createdAt: '2026-06-03T09:00:00Z',
    qrCode: 'PET-2026-0003|Ana Clara Souza|Pipoca|Pendente',
    petPhoto: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&h=150&fit=crop&q=80'
  },
  {
    id: 'reg-4',
    tutorName: 'Roberto Alves',
    tutorCpf: '456.789.012-34',
    tutorPhone: '(11) 97666-5544',
    tutorEmail: 'roberto.alves@email.com',
    petName: 'Thor',
    petBreed: 'Rottweiler',
    petSize: 'Grande',
    petAge: 4,
    regNumber: 'PET-2026-0004',
    statusPayment: 'Aprovado',
    statusKit: 'Aguardando',
    createdAt: '2026-06-04T16:45:00Z',
    qrCode: 'PET-2026-0004|Roberto Alves|Thor|Aprovado',
    petPhoto: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=150&h=150&fit=crop&q=80'
  },
  {
    id: 'reg-5',
    tutorName: 'Juliana Costa',
    tutorCpf: '567.890.123-45',
    tutorPhone: '(19) 99333-2211',
    tutorEmail: 'juliana.costa@email.com',
    petName: 'Luna',
    petBreed: 'Shih Tzu',
    petSize: 'Pequeno',
    petAge: 1,
    regNumber: 'PET-2026-0005',
    statusPayment: 'Pendente',
    statusKit: 'Aguardando',
    createdAt: '2026-06-05T11:20:00Z',
    qrCode: 'PET-2026-0005|Juliana Costa|Luna|Pendente',
    petPhoto: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=150&h=150&fit=crop&q=80'
  },
  {
    id: 'reg-6',
    tutorName: 'Pedro Santos',
    tutorCpf: '678.901.234-56',
    tutorPhone: '(11) 98111-2233',
    tutorEmail: 'pedro.santos@email.com',
    petName: 'Fred',
    petBreed: 'Beagle',
    petSize: 'Médio',
    petAge: 6,
    regNumber: 'PET-2026-0006',
    statusPayment: 'Aprovado',
    statusKit: 'Retirado',
    createdAt: '2026-06-06T15:10:00Z',
    qrCode: 'PET-2026-0006|Pedro Santos|Fred|Aprovado',
    petPhoto: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=150&h=150&fit=crop&q=80'
  },
  {
    id: 'reg-7',
    tutorName: 'Beatriz Lima',
    tutorCpf: '789.012-345-67',
    tutorPhone: '(21) 97222-3344',
    tutorEmail: 'beatriz.lima@email.com',
    petName: 'Bela',
    petBreed: 'Poodle',
    petSize: 'Pequeno',
    petAge: 7,
    regNumber: 'PET-2026-0007',
    statusPayment: 'Aprovado',
    statusKit: 'Liberado',
    createdAt: '2026-06-07T08:30:00Z',
    qrCode: 'PET-2026-0007|Beatriz Lima|Bela|Aprovado',
    petPhoto: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150&h=150&fit=crop&q=80'
  }
];

class SupabaseMockClient {
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

  // --- Database CRUD ---

  getRegistrations(): Registration[] {
    return this.getStorage<Registration>('ps_registrations', initialRegistrations);
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

    list.push(newReg);
    this.setStorage('ps_registrations', list);
    return newReg;
  }

  updateRegistration(id: string, updates: Partial<Registration>): Registration {
    const list = this.getRegistrations();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Registration not found');

    const updated = { ...list[idx], ...updates };
    // update qrCode value dynamically if payment or tutor name changes
    updated.qrCode = `${updated.regNumber}|${updated.tutorName}|${updated.petName}|${updated.statusPayment}`;
    
    list[idx] = updated;
    this.setStorage('ps_registrations', list);
    return updated;
  }

  deleteRegistration(id: string): void {
    const list = this.getRegistrations();
    const filtered = list.filter(r => r.id !== id);
    this.setStorage('ps_registrations', filtered);
  }

  // --- Sponsors API ---

  getSponsors(): Sponsor[] {
    return this.getStorage<Sponsor>('ps_sponsors', initialSponsors);
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

  // --- Expenses API ---

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

  // Simple session storage
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

    // Participant check: we match by email AND tutorCpf (standardizing input)
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
