const nodemailer = require('nodemailer');
const env = require('../config/env');
const { formatDateTime } = require('../utils/helpers');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: env.smtp.user
        ? { user: env.smtp.user, pass: env.smtp.pass }
        : undefined,
    });
  }
  return transporter;
}

const emailService = {
  async sendAppointmentLink(appointment, token) {
    if (!env.smtp.user) {
      console.log('SMTP not configured. Skipping email send.');
      console.log(`Patient link: ${env.frontendUrl}/sala/paciente/${token}`);
      return;
    }

    const dateFormatted = formatDateTime(appointment.scheduled_at);
    const professionalName = `${appointment.professional_first_name} ${appointment.professional_last_name}`;
    const patientLink = `${env.frontendUrl}/sala/paciente/${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1e40af; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Teleconsulta IPS</h1>
        </div>
        <div style="background-color: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b; margin-top: 0;">Su cita de teleconsulta</h2>
          <p style="color: #475569;">Estimado/a <strong>${appointment.patient_name}</strong>,</p>
          <p style="color: #475569;">Se ha programado una cita de teleconsulta con los siguientes detalles:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px 12px; background: #e2e8f0; font-weight: bold; width: 40%;">Profesional</td>
              <td style="padding: 8px 12px; background: #f1f5f9;">${professionalName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #e2e8f0; font-weight: bold;">Fecha y Hora</td>
              <td style="padding: 8px 12px; background: #f1f5f9;">${dateFormatted}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #e2e8f0; font-weight: bold;">Tipo de Consulta</td>
              <td style="padding: 8px 12px; background: #f1f5f9;">${appointment.consultation_type}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #e2e8f0; font-weight: bold;">Duracion</td>
              <td style="padding: 8px 12px; background: #f1f5f9;">${appointment.duration_minutes} minutos</td>
            </tr>
          </table>
          <p style="color: #475569;">Para ingresar a su consulta, haga clic en el siguiente boton:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${patientLink}"
               style="background-color: #1e40af; color: white; padding: 14px 32px; text-decoration: none;
                      border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
              Ingresar a la Consulta
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px;">
            <strong>Instrucciones:</strong>
          </p>
          <ul style="color: #64748b; font-size: 13px;">
            <li>Ingrese al enlace unos minutos antes de la hora programada</li>
            <li>Asegurese de tener una conexion estable a internet</li>
            <li>Permita el acceso a la camara y microfono de su dispositivo</li>
            <li>Busque un lugar tranquilo y bien iluminado</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            Este enlace es personal e intransferible. No lo comparta con otras personas.
          </p>
        </div>
      </div>
    `;

    await getTransporter().sendMail({
      from: env.smtp.from,
      to: appointment.patient_email,
      subject: `Su cita de teleconsulta - ${dateFormatted}`,
      html,
    });
  },
};

module.exports = emailService;
