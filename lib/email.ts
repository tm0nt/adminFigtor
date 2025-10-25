// lib/email.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

interface SendResetPasswordEmailParams {
  to: string
  token: string
  userName?: string
}

export async function sendResetPasswordEmail({ 
  to, 
  token, 
  userName 
}: SendResetPasswordEmailParams) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  const mailOptions = {
    from: `"Figtor" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'Redefinir sua senha - Figtor',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - Figtor</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%); padding: 60px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background: #0f0f0f; border-radius: 24px; border: 1px solid #1a1a1a; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); overflow: hidden;">
          
          <!-- Logo Header with Green Glow -->
          <tr>
            <td align="center" style="padding: 50px 40px 30px 40px; background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%); position: relative;">
              <div style="background: radial-gradient(circle at center, rgba(144, 242, 9, 0.1) 0%, transparent 70%); width: 200px; height: 100px; position: absolute; top: 0; left: 50%; transform: translateX(-50%);"></div>
              <img src="https://app.figtor.com.br/logo.png" alt="Figtor" style="height: 40px; width: auto; display: block; margin: 0 auto; position: relative; z-index: 1;">
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Title -->
              <h1 style="color: #ffffff; font-size: 32px; font-weight: 600; margin: 0 0 20px 0; text-align: center; letter-spacing: -0.5px;">
                Redefinir sua senha
              </h1>
              
              <!-- Greeting -->
              ${userName ? `
              <p style="color: #90f209; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">
                Olá, ${userName}! 👋
              </p>
              ` : ''}
              
              <!-- Main Text -->
              <p style="color: #999999; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; text-align: center;">
                Recebemos uma solicitação para redefinir a senha da sua conta Figtor.
              </p>
              
              <p style="color: #999999; font-size: 16px; line-height: 1.6; margin: 0 0 35px 0; text-align: center;">
                Clique no botão abaixo para criar uma nova senha:
              </p>
              
              <!-- CTA Button with Gradient -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center" style="padding: 0 0 35px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #90f209 0%, #a0ff20 100%); color: #000000; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 10px 30px rgba(144, 242, 9, 0.3); transition: all 0.3s ease;">
                      REDEFINIR SENHA
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 35px 0;">
                <tr>
                  <td style="border-top: 1px solid #1a1a1a;"></td>
                </tr>
              </table>
              
              <!-- Alternative Link -->
              <p style="color: #666666; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0; text-align: center;">
                Ou copie e cole este link no seu navegador:
              </p>
              
              <div style="background: #1a1a1a; border: 1px solid #262626; border-radius: 8px; padding: 16px; margin: 0 0 30px 0;">
                <p style="color: #90f209; font-size: 12px; line-height: 1.6; margin: 0; word-break: break-all; text-align: center; font-family: 'Courier New', monospace;">
                  ${resetUrl}
                </p>
              </div>
              
              <!-- Warning Box -->
              <div style="background: linear-gradient(135deg, rgba(255, 68, 68, 0.1) 0%, rgba(139, 0, 0, 0.1) 100%); border: 1px solid rgba(255, 68, 68, 0.2); border-radius: 12px; padding: 20px; margin: 0 0 25px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td width="40" valign="top">
                      <span style="font-size: 24px;">⚠️</span>
                    </td>
                    <td>
                      <p style="color: #ff4444; font-size: 14px; line-height: 1.5; margin: 0; font-weight: 600;">
                        Importante:
                      </p>
                      <p style="color: #ff8888; font-size: 13px; line-height: 1.5; margin: 5px 0 0 0;">
                        Este link expira em 1 hora e só pode ser usado uma vez.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Security Note -->
              <div style="background: #1a1a1a; border: 1px solid #262626; border-radius: 12px; padding: 20px;">
                <p style="color: #666666; font-size: 13px; line-height: 1.6; margin: 0; text-align: center;">
                  🔒 Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá a mesma e sua conta está segura.
                </p>
              </div>

            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 40px; background: #0a0a0a; border-top: 1px solid #1a1a1a;">
              
              <!-- Social Links (opcional) -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <p style="color: #666666; font-size: 12px; margin: 0 0 15px 0;">
                      Siga-nos nas redes sociais
                    </p>
                    <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                      <tr>
                        <td style="padding: 0 8px;">
                          <a href="#" style="color: #90f209; text-decoration: none; font-size: 20px;">𝕏</a>
                        </td>
                        <td style="padding: 0 8px;">
                          <a href="#" style="color: #90f209; text-decoration: none; font-size: 20px;">in</a>
                        </td>
                        <td style="padding: 0 8px;">
                          <a href="#" style="color: #90f209; text-decoration: none; font-size: 20px;">ig</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Copyright -->
              <p style="color: #666666; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                © ${new Date().getFullYear()} <span style="color: #90f209; font-weight: 600;">Figtor</span>. Todos os direitos reservados.
              </p>
              
              <!-- Unsubscribe -->
              <p style="color: #444444; font-size: 11px; line-height: 1.5; margin: 15px 0 0 0; text-align: center;">
                Este é um email automático, por favor não responda.<br>
                <a href="#" style="color: #666666; text-decoration: underline;">Gerenciar preferências de email</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Powered by Badge -->
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 20px;">
          <tr>
            <td align="center">
              <p style="color: #333333; font-size: 11px; margin: 0;">
                Convertendo designs em realidade ✨
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    FIGTOR - Redefinir Senha
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${userName ? `Olá, ${userName}! 👋\n\n` : 'Olá!\n\n'}Recebemos uma solicitação para redefinir a senha da sua conta Figtor.

🔗 Clique no link abaixo para criar uma nova senha:
${resetUrl}

⚠️ IMPORTANTE: 
Este link expira em 1 hora e só pode ser usado uma vez.

🔒 SEGURANÇA:
Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá a mesma e sua conta está segura.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

© ${new Date().getFullYear()} Figtor. Todos os direitos reservados.
Convertendo designs em realidade ✨

Este é um email automático, por favor não responda.
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email enviado:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error)
    throw new Error('Falha ao enviar email')
  }
}

export async function sendWelcomeEmail({ to, userName }: { to: string; userName: string }) {
  const mailOptions = {
    from: `"Figtor" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'Bem-vindo ao Figtor! 🎉',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Figtor</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%); padding: 60px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background: #0f0f0f; border-radius: 24px; border: 1px solid #1a1a1a; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); overflow: hidden;">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding: 50px 40px 30px 40px; background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);">
              <div style="background: radial-gradient(circle at center, rgba(144, 242, 9, 0.15) 0%, transparent 70%); width: 300px; height: 150px; position: absolute; top: 0; left: 50%; transform: translateX(-50%);"></div>
              <img src="https://app.figtor.com.br/logo.png" alt="Figtor" style="height: 45px; width: auto; display: block; margin: 0 auto; position: relative; z-index: 1;">
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Celebration Icon -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <div style="font-size: 80px; line-height: 1; margin: 0;">🎉</div>
                  </td>
                </tr>
              </table>

              <!-- Title -->
              <h1 style="color: #ffffff; font-size: 36px; font-weight: 700; margin: 0 0 15px 0; text-align: center; letter-spacing: -1px;">
                Bem-vindo ao Figtor!
              </h1>
              
              <!-- Subtitle -->
              <p style="color: #90f209; font-size: 20px; font-weight: 600; margin: 0 0 30px 0; text-align: center;">
                Olá, ${userName}! 👋
              </p>
              
              <!-- Description -->
              <p style="color: #999999; font-size: 16px; line-height: 1.7; margin: 0 0 15px 0; text-align: center;">
                Estamos <span style="color: #ffffff; font-weight: 600;">muito felizes</span> em ter você conosco!
              </p>
              
              <p style="color: #999999; font-size: 16px; line-height: 1.7; margin: 0 0 40px 0; text-align: center;">
                Agora você pode converter seus designs do Figma em código de forma rápida, fácil e profissional.
              </p>
              
              <!-- Features Cards -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 40px;">
                <tr>
                  <td style="padding: 15px; background: #1a1a1a; border-radius: 12px; border: 1px solid #262626; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 10px;">⚡</div>
                    <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 5px 0;">Conversão Rápida</p>
                    <p style="color: #666666; font-size: 12px; margin: 0;">Em poucos segundos</p>
                  </td>
                  <td style="width: 15px;"></td>
                  <td style="padding: 15px; background: #1a1a1a; border-radius: 12px; border: 1px solid #262626; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 10px;">🎨</div>
                    <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 5px 0;">Design Perfeito</p>
                    <p style="color: #666666; font-size: 12px; margin: 0;">Fiel ao original</p>
                  </td>
                  <td style="width: 15px;"></td>
                  <td style="padding: 15px; background: #1a1a1a; border-radius: 12px; border: 1px solid #262626; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 10px;">💻</div>
                    <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 5px 0;">Código Limpo</p>
                    <p style="color: #666666; font-size: 12px; margin: 0;">Pronto para usar</p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #90f209 0%, #a0ff20 100%); color: #000000; text-decoration: none; padding: 20px 60px; border-radius: 12px; font-weight: 700; font-size: 18px; letter-spacing: 0.5px; box-shadow: 0 10px 30px rgba(144, 242, 9, 0.4);">
                      COMEÇAR AGORA →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Help Section -->
              <div style="background: linear-gradient(135deg, rgba(144, 242, 9, 0.05) 0%, rgba(144, 242, 9, 0.01) 100%); border: 1px solid rgba(144, 242, 9, 0.1); border-radius: 12px; padding: 25px; margin-top: 30px;">
                <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0 0 10px 0; text-align: center;">
                  💡 Precisa de ajuda?
                </p>
                <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 0; text-align: center;">
                  Nossa equipe está pronta para ajudar! Entre em contato através do suporte ou visite nossa <a href="#" style="color: #90f209; text-decoration: underline;">documentação</a>.
                </p>
              </div>

            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 40px; background: #0a0a0a; border-top: 1px solid #1a1a1a; text-align: center;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 10px 0;">
                © ${new Date().getFullYear()} <span style="color: #90f209; font-weight: 600;">Figtor</span>. Todos os direitos reservados.
              </p>
              <p style="color: #444444; font-size: 11px; margin: 0;">
                Convertendo designs em realidade ✨
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('✅ Email de boas-vindas enviado')
  } catch (error) {
    console.error('❌ Erro ao enviar email de boas-vindas:', error)
  }
}
