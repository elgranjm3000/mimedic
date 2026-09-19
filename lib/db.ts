import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

let initPromise: Promise<void> | null = null;

export function ensureDb(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await db.batch([
        `CREATE TABLE IF NOT EXISTS organizations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          "isActive" INTEGER NOT NULL DEFAULT 1,
          "createdAt" TEXT NOT NULL,
          "updatedAt" TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          role TEXT NOT NULL,
          "organizationId" TEXT,
          "isActive" INTEGER NOT NULL DEFAULT 1,
          "createdAt" TEXT NOT NULL,
          "updatedAt" TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS patients (
          id TEXT PRIMARY KEY,
          "organizationId" TEXT,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          "dateOfBirth" TEXT NOT NULL,
          address TEXT NOT NULL,
          "emergencyContact" TEXT NOT NULL,
          "emergencyPhone" TEXT NOT NULL,
          "medicalHistory" TEXT,
          "insuranceInfo" TEXT,
          "createdAt" TEXT NOT NULL,
          "updatedAt" TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS appointments (
          id TEXT PRIMARY KEY,
          "organizationId" TEXT,
          "patientId" TEXT NOT NULL,
          "patientName" TEXT NOT NULL,
          "doctorId" TEXT NOT NULL,
          "doctorName" TEXT NOT NULL,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          duration INTEGER NOT NULL,
          type TEXT NOT NULL,
          status TEXT NOT NULL,
          notes TEXT,
          "createdAt" TEXT NOT NULL,
          "updatedAt" TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS prescriptions (
          id TEXT PRIMARY KEY,
          "organizationId" TEXT,
          "patientId" TEXT NOT NULL,
          "patientName" TEXT NOT NULL,
          "doctorId" TEXT NOT NULL,
          "doctorName" TEXT NOT NULL,
          "appointmentId" TEXT,
          medications TEXT NOT NULL,
          diagnosis TEXT NOT NULL,
          instructions TEXT NOT NULL,
          status TEXT NOT NULL,
          "createdAt" TEXT NOT NULL,
          "updatedAt" TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS invoices (
          id TEXT PRIMARY KEY,
          "organizationId" TEXT,
          "patientId" TEXT NOT NULL,
          "patientName" TEXT NOT NULL,
          "appointmentId" TEXT,
          items TEXT NOT NULL,
          subtotal REAL NOT NULL,
          tax REAL NOT NULL,
          total REAL NOT NULL,
          status TEXT NOT NULL,
          "dueDate" TEXT NOT NULL,
          "paidDate" TEXT,
          "paymentMethod" TEXT,
          notes TEXT,
          "createdAt" TEXT NOT NULL,
          "updatedAt" TEXT NOT NULL
        )`,
      ]);

      // Migración: agregar organizationId a tablas creadas antes del modelo multi-tenant
      const tenantTables = ['users', 'patients', 'appointments', 'prescriptions', 'invoices'];
      for (const table of tenantTables) {
        try {
          await db.execute(`ALTER TABLE "${table}" ADD COLUMN "organizationId" TEXT`);
        } catch {
          // la columna ya existe
        }
      }

      // Migración: avatar de perfil (data URL de imagen redimensionada en el cliente)
      try {
        await db.execute(`ALTER TABLE users ADD COLUMN avatar TEXT`);
      } catch {
        // la columna ya existe
      }

      // Migración: firma digital del doctor (data URL, se estampa en recetas)
      try {
        await db.execute(`ALTER TABLE users ADD COLUMN signature TEXT`);
      } catch {
        // la columna ya existe
      }

      // Migración: moneda por organización (código ISO: USD, EUR, MXN, ...)
      try {
        await db.execute(`ALTER TABLE organizations ADD COLUMN currency TEXT`);
      } catch {
        // la columna ya existe
      }
      await db.execute(`UPDATE organizations SET currency = 'USD' WHERE currency IS NULL`);

      // Prueba gratuita de 7 días: fecha de vencimiento; NULL = licencia activa
      try {
        await db.execute(`ALTER TABLE organizations ADD COLUMN "trialEndsAt" TEXT`);
      } catch {
        // la columna ya existe
      }

      // Tasa de cambio BCV (USD→VES) con respaldo local
      await db.execute(`CREATE TABLE IF NOT EXISTS exchange_rates (
        code TEXT PRIMARY KEY,
        rate REAL NOT NULL,
        "updatedAt" TEXT NOT NULL
      )`);

      // Log de auditoría: sesiones y operaciones por usuario
      await db.execute(`CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        ts TEXT NOT NULL,
        "userId" TEXT,
        "userEmail" TEXT,
        "userName" TEXT,
        "organizationId" TEXT,
        action TEXT NOT NULL,
        entity TEXT,
        "entityId" TEXT,
        detail TEXT,
        ip TEXT
      )`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_log ("ts" DESC)`);

      // Migración de datos: org por defecto + roles
      const now = new Date().toISOString();
      const orgResult = await db.execute('SELECT id FROM organizations LIMIT 1');
      let defaultOrgId: string;
      if (orgResult.rows.length === 0) {
        defaultOrgId = crypto.randomUUID();
        await db.execute({
          sql: `INSERT INTO organizations (id, name, type, "isActive", "createdAt", "updatedAt")
                VALUES (?, ?, 'clinic', 1, ?, ?)`,
          args: [defaultOrgId, 'Clínica Central', now, now],
        });
      } else {
        defaultOrgId = orgResult.rows[0].id as string;
      }

      // Usuarios sin organización (creados pre-SaaS) → org por defecto
      await db.execute({
        sql: `UPDATE users SET "organizationId" = ? WHERE "organizationId" IS NULL AND role != 'super_admin'`,
        args: [defaultOrgId],
      });

      // El admin original se convierte en super admin de la plataforma
      await db.execute({
        sql: `UPDATE users SET role = 'super_admin', "organizationId" = NULL, "updatedAt" = ? WHERE email = 'admin@medicontrol.com' AND role = 'admin'`,
        args: [now],
      });

      // Seed inicial: doctor por defecto si no hay usuarios
      const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
      if (Number(userCount.rows[0].count) === 0) {
        const adminHash = await bcrypt.hash('admin123', 10);
        const doctorHash = await bcrypt.hash('doctor123', 10);
        await db.batch([
          {
            sql: `INSERT INTO users (id, email, password_hash, "firstName", "lastName", role, "organizationId", "isActive", "createdAt", "updatedAt")
                  VALUES (?, ?, ?, ?, ?, 'super_admin', NULL, 1, ?, ?)`,
            args: [crypto.randomUUID(), 'admin@medicontrol.com', adminHash, 'Admin', 'Sistema', now, now],
          },
          {
            sql: `INSERT INTO users (id, email, password_hash, "firstName", "lastName", role, "organizationId", "isActive", "createdAt", "updatedAt")
                  VALUES (?, ?, ?, ?, ?, 'doctor', ?, 1, ?, ?)`,
            args: [crypto.randomUUID(), 'doctor@medicontrol.com', doctorHash, 'Dr. Juan', 'Pérez', defaultOrgId, now, now],
          },
        ]);
      }
    })();
  }
  return initPromise;
}
