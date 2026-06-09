jest.mock('@prisma/client', () => {
  const mockPrisma = {
    registration: {
      create: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    },
    institution: {
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    PaymentStatus: { PAGAMENTO_PENDENTE: 'PAGAMENTO_PENDENTE' },
  };
});

import * as handler from "../../src/app/api/registrations/route";

describe('POST /api/registrations', () => {
  it('creates a registration and returns id', async () => {
    const payload = {
      tutorName: 'Teste Tutor',
      tutorEmail: 'tutor@example.com',
      tutorPhone: '+55 11 99999-8888',
      tutorCpf: '12345678901',
      petName: 'Doggo',
    };
    const mockRequest = { json: async () => payload } as any;
    // @ts-ignore using exported POST handler
    const response = await handler.POST?.(mockRequest);
    expect(response).toBeDefined();
    // response is a NextResponse
    expect(response.status).toBe(201);
    const jsonBody = await response.json();
    expect(jsonBody).toHaveProperty('id');
    expect(typeof jsonBody.id).toBe('string');
  });
});
