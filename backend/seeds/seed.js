const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const env = require('../src/config/env');

async function seed() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
  });

  try {
    console.log('Seeding database...\n');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const [adminResult] = await connection.execute(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE email = email`,
      ['admin@teleconsulta.com', adminPassword, 'Administrador', 'Sistema', 'ADMIN']
    );
    console.log('Admin user created: admin@teleconsulta.com / Admin123!');

    // Create sample professionals
    const profPassword = await bcrypt.hash('Doctor123!', 10);

    const professionals = [
      {
        email: 'dr.garcia@teleconsulta.com',
        first_name: 'Carlos',
        last_name: 'García',
        specialty: 'Medicina General',
        license_number: 'MG-12345',
      },
      {
        email: 'dra.lopez@teleconsulta.com',
        first_name: 'María',
        last_name: 'López',
        specialty: 'Pediatría',
        license_number: 'PD-67890',
      },
      {
        email: 'dr.martinez@teleconsulta.com',
        first_name: 'Andrés',
        last_name: 'Martínez',
        specialty: 'Dermatología',
        license_number: 'DM-11223',
      },
    ];

    for (const prof of professionals) {
      await connection.execute(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, specialty, license_number)
         VALUES (?, ?, ?, ?, 'PROFESIONAL', ?, ?)
         ON DUPLICATE KEY UPDATE email = email`,
        [prof.email, profPassword, prof.first_name, prof.last_name, prof.specialty, prof.license_number]
      );
      console.log(`Professional created: ${prof.email} / Doctor123!`);
    }

    // Get professional IDs for sample appointments
    const [users] = await connection.execute(
      `SELECT id, first_name, last_name FROM users WHERE role = 'PROFESIONAL' ORDER BY id LIMIT 3`
    );

    if (users.length > 0) {
      const [admins] = await connection.execute(
        `SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1`
      );
      const adminId = admins[0].id;

      // Create sample appointments
      const now = new Date();
      const appointments = [
        {
          professional_id: users[0].id,
          patient_name: 'Juan Pérez',
          patient_document_type: 'CC',
          patient_document: '1234567890',
          patient_phone: '3001234567',
          patient_email: 'juan.perez@email.com',
          scheduled_at: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
          consultation_type: 'General',
        },
        {
          professional_id: users[1].id,
          patient_name: 'Ana Rodríguez',
          patient_document_type: 'CC',
          patient_document: '0987654321',
          patient_phone: '3109876543',
          patient_email: 'ana.rodriguez@email.com',
          scheduled_at: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          consultation_type: 'Pediatría',
        },
        {
          professional_id: users[0].id,
          patient_name: 'Pedro Gómez',
          patient_document_type: 'CE',
          patient_document: 'E-123456',
          patient_phone: '3201112233',
          patient_email: 'pedro.gomez@email.com',
          scheduled_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          consultation_type: 'General',
        },
      ];

      for (const appt of appointments) {
        await connection.execute(
          `INSERT INTO appointments (professional_id, patient_name, patient_document_type, patient_document,
            patient_phone, patient_email, scheduled_at, consultation_type, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            appt.professional_id,
            appt.patient_name,
            appt.patient_document_type,
            appt.patient_document,
            appt.patient_phone,
            appt.patient_email,
            appt.scheduled_at,
            appt.consultation_type,
            adminId,
          ]
        );
        console.log(`Appointment created for: ${appt.patient_name}`);
      }

      // Generate tokens for all appointments
      const [allAppts] = await connection.execute(
        `SELECT id, scheduled_at, duration_minutes FROM appointments`
      );
      for (const appt of allAppts) {
        const token = crypto.randomBytes(48).toString('hex');
        const scheduledAt = new Date(appt.scheduled_at);
        const expiresAt = new Date(scheduledAt.getTime() + (appt.duration_minutes + 30) * 60 * 1000);
        await connection.execute(
          `INSERT INTO appointment_tokens (appointment_id, token, expires_at)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
          [appt.id, token, expiresAt]
        );
        const patientLink = `${env.frontendUrl}/sala/paciente/${token}`;
        console.log(`  Token for appointment #${appt.id}: ${patientLink}`);
      }
    }

    console.log('\nSeed completed successfully!');
    console.log('\nCredentials:');
    console.log('  Admin: admin@teleconsulta.com / Admin123!');
    console.log('  Professionals: dr.garcia@teleconsulta.com / Doctor123!');
    console.log('                 dra.lopez@teleconsulta.com / Doctor123!');
    console.log('                 dr.martinez@teleconsulta.com / Doctor123!');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
