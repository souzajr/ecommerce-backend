import nodemailer from 'nodemailer';
import { TransporterProps } from '../utils/types';

import {
  adminRegisterTemplate,
  passwordRecovery,
  alertChangePassword,
  signInPlanTemplate,
  pausedPlanTemplate,
  canceledPlanTemplate,
  changePlanTemplate,
  changePlanCardTemplate,
  testEmailTemplate,
  removedPlanTemplate,
} from './template';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_AUTH_USER,
    pass: process.env.MAIL_AUTH_PASS,
  },
});

class EmailHandler {
  adminRegister(email: string, name: string) {
    const html = adminRegisterTemplate(name);

    const mailOptions = {
      from: `PurpleTech <${process.env.MAIL_AUTH_USER}>`,
      to: email,
      subject: 'Obrigado por se cadastrar! 💜💜💜',
      html,
    };

    transporter.sendMail(mailOptions);
  }

  recoveryMail(email: string, token: string) {
    const html = passwordRecovery(process.env.ADMIN_URL, token);

    const mailOptions = {
      from: `PurpleTech <${process.env.MAIL_AUTH_USER}>`,
      to: email,
      subject: 'Recuperação de senha 🔐',
      html,
    };

    transporter.sendMail(mailOptions);
  }

  alertOfChange(email: string) {
    const html = alertChangePassword(process.env.ADMIN_URL);

    const mailOptions = {
      from: `PurpleTech <${process.env.MAIL_AUTH_USER}>`,
      to: email,
      subject: 'Alteração de senha 🔐',
      html,
    };

    transporter.sendMail(mailOptions);
  }

  signInPlan(email: string, name: string, plan: string) {
    const html = signInPlanTemplate(name, plan);

    const mailOptions = {
      from: `PurpleTech <${process.env.MAIL_AUTH_USER}>`,
      to: email,
      subject: 'Plano ativado com sucesso! 🥰💜',
      html,
    };

    transporter.sendMail(mailOptions);
  }

  planPaused(email: string, name: string, ecommerce: string) {
    const html = pausedPlanTemplate(name, ecommerce);

    const mailOptions = {
      from: `PurpleTech <${process.env.MAIL_AUTH_USER}>`,
      to: email,
      subject: `Não recebemos seu pagamento. Seu site ${ecommerce} pode ser excluído 😟😟`,
      html,
    };

    transporter.sendMail(mailOptions);
  }

  planRemoved(email: string, name: string, ecommerce: string) {
    const html = removedPlanTemplate(name, ecommerce);

    const mailOptions = {
      from: `PurpleTech <${process.env.MAIL_AUTH_USER}>`,
      to: email,
      subject: `Seu site ${ecommerce} foi excluído 😔💔`,
      html,
    };

    transporter.sendMail(mailOptions);
  }

  planCanceled(email: string, name: string, ecommerce: string) {
    const html = canceledPlanTemplate(name, ecommerce);

    const mailOptions = {
      from: `PurpleTech <${process.env.MAIL_AUTH_USER}>`,
      to: email,
      subject: 'Seu plano foi cancelado 😞',
      html,
    };

    transporter.sendMail(mailOptions);
  }

  changePlan(email: string, name: string, plan: string, ecommerce: string) {
    const html = changePlanTemplate(name, plan, ecommerce);

    const mailOptions = {
      from: `PurpleTech <${process.env.MAIL_AUTH_USER}>`,
      to: email,
      subject: 'Seu plano foi alterado 😁😁',
      html,
    };

    transporter.sendMail(mailOptions);
  }

  changePlanCard(email: string, name: string, ecommerce: string) {
    const html = changePlanCardTemplate(name, ecommerce);

    const mailOptions = {
      from: `PurpleTech <${process.env.MAIL_AUTH_USER}>`,
      to: email,
      subject: 'Seu cartão de crédito foi alterado 😎',
      html,
    };

    transporter.sendMail(mailOptions);
  }

  testEmail(config: TransporterProps, name: string) {
    const clientTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.secret,
      },
    });

    const html = testEmailTemplate();

    const mailOptions = {
      from: `${name} <${config.user}>`,
      to: config.user,
      subject: 'E-mail de teste ✉️',
      html,
    };

    clientTransporter.sendMail(mailOptions);
  }
}

export default new EmailHandler();
