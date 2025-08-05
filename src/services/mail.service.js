import nodemailer from 'nodemailer';
import config from '../config/config.js';

// Classe para gerenciar o serviço de e-mail
export default class MailService {
  constructor() {
    // **CORREÇÃO APLICADA AQUI**
    // Lendo as variáveis diretamente do objeto config, sem o aninhamento "mailing"
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Serviço pode ser fixo ou vir do .env se necessário
      port: 587,
      auth: {
        user: config.MAIL_USER,
        pass: config.MAIL_PASS,
      },
    });
  }

  // Método para enviar e-mails
  async send({ to, subject, html, attachments = [] }) {
    try {
      const result = await this.transporter.sendMail({
        from: `Seu E-commerce <${config.MAIL_USER}>`,
        to,
        subject,
        html,
        attachments,
      });
      console.log(`E-mail enviado para: ${to}`);
      return result;
    } catch (error) {
      console.error(`Erro ao enviar e-mail para ${to}:`, error);
      throw new Error('Falha no envio do e-mail.');
    }
  }

  // Método específico para enviar e-mail de confirmação de compra
  async sendPurchaseConfirmation(userEmail, ticket) {
    const subject = 'Confirmação da sua compra';
    const html = `
      <div>
        <h1>Obrigado pela sua compra, ${ticket.purchaser}!</h1>
        <p>Sua compra foi finalizada com sucesso.</p>
        <p><strong>Código do Pedido:</strong> ${ticket.code}</p>
        <p><strong>Valor Total:</strong> R$ ${ticket.amount.toFixed(2)}</p>
        <p><strong>Data da Compra:</strong> ${new Date(ticket.purchase_datetime).toLocaleString()}</p>
        <p>Agradecemos a sua preferência!</p>
      </div>
    `;

    return this.send({ to: userEmail, subject, html });
  }
}
// O código acima define um serviço de e-mail usando o Nodemailer para enviar e-mails de confirmação de compra.
// Ele inclui um método para enviar e-mails genéricos e um método específico para enviar confirmações de compra, formatando o conteúdo do e-mail com informações relevantes do ticket.