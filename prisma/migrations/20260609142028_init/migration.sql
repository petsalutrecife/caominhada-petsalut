-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "pixKey" TEXT,
    "pixReceiverName" TEXT,
    "pixBankName" TEXT,
    "pixQrCodeUrl" TEXT,
    "donationAmount" DECIMAL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tutorName" TEXT NOT NULL,
    "tutorEmail" TEXT NOT NULL,
    "tutorPhone" TEXT NOT NULL,
    "tutorCpf" TEXT NOT NULL,
    "petName" TEXT NOT NULL,
    "petBreed" TEXT,
    "petAge" INTEGER,
    "institutionId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PAGAMENTO_PENDENTE',
    "proofFileUrl" TEXT,
    "proofUploadedAt" DATETIME,
    "confirmedAt" DATETIME,
    "rejectedAt" DATETIME,
    "rejectionReason" TEXT,
    "confirmedByInstitutionId" TEXT,
    "registrationNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Registration_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Registration_confirmedByInstitutionId_fkey" FOREIGN KEY ("confirmedByInstitutionId") REFERENCES "Institution" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Institution_email_key" ON "Institution"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_registrationNumber_key" ON "Registration"("registrationNumber");
