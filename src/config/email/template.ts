const header = (): string => `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Email</title>
    <style>
@media only screen and (max-width: 620px) {
  table.body h1 {
    font-size: 28px !important;
    margin-bottom: 10px !important;
  }

  table.body p,
table.body ul,
table.body ol,
table.body td,
table.body span,
table.body a {
    font-size: 16px !important;
  }

  table.body .wrapper,
table.body .article {
    padding: 10px !important;
  }

  table.body .content {
    padding: 0 !important;
  }

  table.body .container {
    padding: 0 !important;
    width: 100% !important;
  }

  table.body .main {
    border-left-width: 0 !important;
    border-radius: 0 !important;
    border-right-width: 0 !important;
  }

  table.body .btn table {
    width: 100% !important;
  }

  table.body .btn a {
    width: 100% !important;
  }

  table.body .img-responsive {
    height: auto !important;
    max-width: 100% !important;
    width: auto !important;
  }
}
@media all {
  .ExternalClass {
    width: 100%;
  }

  .ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
    line-height: 100%;
  }

  .apple-link a {
    color: inherit !important;
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    text-decoration: none !important;
  }

  #MessageViewBody a {
    color: inherit;
    text-decoration: none;
    font-size: inherit;
    font-family: inherit;
    font-weight: inherit;
    line-height: inherit;
  }

  .btn-primary table td:hover {
    background-color: #34495e !important;
  }

  .btn-primary a:hover {
    background-color: #34495e !important;
    border-color: #34495e !important;
  }
}
</style>
  </head>
  <body style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
        <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
          <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">

            <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">
`;

const footer = (): string => `
</table>
<div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
    <tr>
      <td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
        <a href="https://purpletech.com.br" target="_blank" style="color: #999999; font-size: 12px; text-align: center; text-decoration: none;">PurpleTech</a>
      </td>
    </tr>
  </table>
</div>

</div>
</td>
<td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
</tr>
</table>
</body>
</html>`;

export const adminRegisterTemplate = (name: string): string => `
${header()}
<tr>
  <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Olá, ${name}</p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
            Muito obrigado por se cadastrar em nossa plataforma.
            <br/>
            Agora você tem acesso a maior e melhor ferramenta de venda do Brasil.
            <br/><br/>
            Em nosso site, você poderá escolher um plano que cabe no seu bolso e ter acesso a uma plataforma completa e cheia de recursos para impulsionar o seu negócio na web.
          </p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Em caso de dúvidas, entre em contato com o suporte.</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
${footer()}
`;

export const passwordRecovery = (url: string, token: string): string => `
${header()}
<tr>
  <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Olá,</p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
            Você está recebendo este e-mail pois solicitou a redefinição da senha da sua conta.
            <br/>
            Por favor, clique no botão abaixo para completar o processo.
          </p>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;" width="100%">
            <tbody>
              <tr>
                <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                    <tbody>
                      <tr>
                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; border-radius: 5px; text-align: center; background-color: #3498db;" valign="top" align="center" bgcolor="#3498db">
                          <a
                            href="${url}/recuperar-senha/${token}"
                            target="_blank"
                            style="border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; text-transform: capitalize; background-color: #3498db; border-color: #3498db; color: #ffffff;">
                            Redefinir senha
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Se você não solicitou isso, ignore este e-mail e sua senha permanecerá inalterada.</p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Em caso de dúvidas, entre em contato com o suporte.</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
${footer()}
`;

export const alertChangePassword = (url: string): string => `
${header()}
<tr>
  <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Olá,</p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
            Uma alteração de senha acabou de ser feita no site <a href="${url}" target="_blank">${url}</a>.
            <br/>
            Se você não fez essa alteração, por favor entre em contato com o suporte.
          </p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Em caso de dúvidas, entre em contato com o suporte.</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
${footer()}
`;

export const signInPlanTemplate = (name: string, plan: string): string => `
${header()}
<tr>
  <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Olá, ${name}</p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
            Sua assinatura foi ativada com sucesso!
            <br />
            Seu plano atual é o <strong>${plan}</strong>.
          </p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Em caso de dúvidas, entre em contato com o suporte.</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
${footer()}
`;

export const pausedPlanTemplate = (name: string, ecommerce: string): string => `
${header()}
<tr>
  <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Olá, ${name}</p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
            Não conseguimos efetuar a cobrança recorrente do plano do seu site (${ecommerce}).
            <br/>
            Por favor, regularize seu pagamento o quanto antes ou seus dados, como produtos cadastrados, acesssos, usuários, relatórios, etc., poderão ser apagados de forma irreversível.
            <br/>
            Para regularizar seu pagamento, acesse nosso site, navegue até o menu de Configurações e selecione a opção de Gerenciar Assinatura. Nesse menu, você conseguirá adicionar um novo cartão de crédito para efetuar a cobrança pendente.
          </p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Em caso de dúvidas, entre em contato com o suporte.</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
${footer()}
`;

export const removedPlanTemplate = (
  name: string,
  ecommerce: string
): string => `
${header()}
<tr>
  <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Olá, ${name}</p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
            Não conseguimos efetuar a cobrança recorrente do plano do seu site (${ecommerce}).
            <br/>
            Por esse motivo, infelizmente, seu ecommerce foi excluído de nossa plataforma. Todos os dados, como relatórios, produtos, arquivos, usuários, acessos e demais informações foram apagadas de forma irreversível.
            <br/>
            Isso pode não ser um adeus. Caso você tenha interesse em desenvolver um novo site em nossa plataforma, basta acessar sua área de usuários e adqurir um novo plano.
          </p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Em caso de dúvidas, entre em contato com o suporte.</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
${footer()}
`;

export const canceledPlanTemplate = (
  name: string,
  ecommerce: string
): string => `
${header()}
<tr>
  <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Olá, ${name}</p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
            A assinatura do seu site (${ecommerce}) foi cancelada.
            <br/><br/>
            Após o período contratado, seus dados, como produtos cadastrados, acesssos, usuários, relatórios, etc., poderão ser apagados de forma irreversível.
            <br/><br/>
            Para não ter suas informações excluídas, acesse nosso site, navegue até o menu de Configurações e selecione a opção de Gerenciar Assinatura. Nesse menu, você conseguirá reativar sua assinatura e manter suas informações.
          </p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Em caso de dúvidas, entre em contato com o suporte.</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
${footer()}
`;

export const changePlanTemplate = (
  name: string,
  plan: string,
  ecommerce: string
): string => `
${header()}
<tr>
  <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Olá, ${name}</p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
            A assinatura do seu site (${ecommerce}) foi alterado para o plano ${plan}.
          </p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Em caso de dúvidas, entre em contato com o suporte.</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
${footer()}
`;

export const changePlanCardTemplate = (
  name: string,
  ecommerce: string
): string => `
${header()}
<tr>
  <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Olá, ${name}</p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
            O cartão de crédito da sua assinatura em nossa plataforma foi alterado para o site ${ecommerce}.
          </p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Em caso de dúvidas, entre em contato com o suporte.</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
${footer()}
`;

export const testEmailTemplate = (): string => `
${header()}
<tr>
  <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Olá,</p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
            Esse e-mail é um de teste, você pode ignorar. Está tudo certo com o seu e-mail e ele está configurado corretamente.
          </p>
          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Em caso de dúvidas, entre em contato com o suporte.</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
${footer()}
`;
