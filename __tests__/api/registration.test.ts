jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => ({
      from: jest.fn(() => ({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
        insert: jest.fn().mockResolvedValue({ data: [], error: null }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      })),
    })),
  };
});

import { supabaseMock } from '../../src/lib/supabaseMock';

describe('SupabaseMock Client Operations', () => {
  beforeEach(() => {
    // Reset localstorage mock or client in-memory list
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('saves a registration and generates regNumber', async () => {
    const payload = {
      tutorName: 'Teste Tutor',
      tutorCpf: '12345678901',
      tutorBirthDate: '1990-01-01',
      tutorPhone: '+55 11 99999-8888',
      tutorWhatsApp: '+55 11 99999-8888',
      tutorEmail: 'tutor@example.com',
      tutorCity: 'Recife',
      tutorState: 'PE',
      petName: 'Doggo',
      petSpecies: 'Cão',
      petBreed: 'Labrador',
      petSize: 'Grande' as const,
      petAge: 3,
      selectedInstitution: 'inst-123',
      donationValue: 50.00,
      donationStatus: 'AGUARDANDO VALIDAÇÃO' as const,
      statusPayment: 'Pendente' as const,
      statusKit: 'Aguardando' as const,
    };

    const saved = supabaseMock.saveRegistration(payload);
    expect(saved).toBeDefined();
    expect(saved.id).toBeDefined();
    expect(saved.regNumber).toMatch(/PET-2026-\d{4}/);
    expect(saved.tutorName).toBe('Teste Tutor');
  });

  it('updates a registration', async () => {
    const list = supabaseMock.getRegistrations();
    if (list.length === 0) {
      supabaseMock.saveRegistration({
        tutorName: 'Teste Tutor',
        tutorCpf: '12345678901',
        tutorBirthDate: '1990-01-01',
        tutorPhone: '+55 11 99999-8888',
        tutorWhatsApp: '+55 11 99999-8888',
        tutorEmail: 'tutor@example.com',
        tutorCity: 'Recife',
        tutorState: 'PE',
        petName: 'Doggo',
        petSpecies: 'Cão',
        petBreed: 'Labrador',
        petSize: 'Grande',
        petAge: 3,
        selectedInstitution: 'inst-123',
        donationValue: 50.00,
        donationStatus: 'AGUARDANDO VALIDAÇÃO',
        statusPayment: 'Pendente',
        statusKit: 'Aguardando',
      });
    }

    const reg = supabaseMock.getRegistrations()[0];
    const updated = supabaseMock.updateRegistration(reg.id, {
      donationStatus: 'APROVADA',
      statusPayment: 'Aprovado',
    });

    expect(updated.donationStatus).toBe('APROVADA');
    expect(updated.statusPayment).toBe('Aprovado');
  });
});
