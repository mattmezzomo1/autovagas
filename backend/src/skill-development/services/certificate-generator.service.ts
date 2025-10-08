import { Injectable } from '@nestjs/common';
import { Certificate } from '../entities/certificate.entity';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';

@Injectable()
export class CertificateGeneratorService {
  async generateCertificatePDF(certificate: Certificate): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Certificate design
        this.drawCertificateDesign(doc, certificate);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private drawCertificateDesign(doc: PDFKit.PDFDocument, certificate: Certificate): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const centerX = pageWidth / 2;

    // Background and border
    doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
       .stroke('#2563eb')
       .lineWidth(3);

    doc.rect(40, 40, pageWidth - 80, pageHeight - 80)
       .stroke('#3b82f6')
       .lineWidth(1);

    // Header
    doc.fontSize(36)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('CERTIFICADO', centerX - 120, 80);

    doc.fontSize(18)
       .font('Helvetica')
       .fillColor('#374151')
       .text('DE CONCLUSÃO', centerX - 70, 125);

    // Main content
    doc.fontSize(16)
       .fillColor('#6b7280')
       .text('Certificamos que', centerX - 60, 180);

    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fillColor('#111827')
       .text(certificate.user?.fullName || 'Nome do Usuário', centerX - 150, 210, {
         width: 300,
         align: 'center',
       });

    doc.fontSize(16)
       .font('Helvetica')
       .fillColor('#6b7280')
       .text('concluiu com êxito o', centerX - 80, 260);

    doc.fontSize(22)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text(certificate.title, centerX - 200, 290, {
         width: 400,
         align: 'center',
       });

    // Description
    if (certificate.description) {
      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#4b5563')
         .text(certificate.description, centerX - 250, 340, {
           width: 500,
           align: 'center',
         });
    }

    // Skills validated
    if (certificate.skillsValidated && certificate.skillsValidated.length > 0) {
      doc.fontSize(12)
         .fillColor('#6b7280')
         .text('Habilidades validadas:', centerX - 200, 390);

      const skillsText = certificate.skillsValidated.join(' • ');
      doc.fontSize(11)
         .fillColor('#374151')
         .text(skillsText, centerX - 200, 410, {
           width: 400,
           align: 'center',
         });
    }

    // Score (if applicable)
    if (certificate.score && certificate.maxScore) {
      const scorePercentage = Math.round((certificate.score / certificate.maxScore) * 100);
      doc.fontSize(12)
         .fillColor('#059669')
         .text(`Pontuação: ${certificate.score}/${certificate.maxScore} (${scorePercentage}%)`, 
               centerX - 80, 450);
    }

    // Footer information
    const issuedDate = certificate.issuedAt?.toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR');
    
    doc.fontSize(12)
       .fillColor('#6b7280')
       .text(`Emitido em: ${issuedDate}`, 60, pageHeight - 120);

    doc.text(`Certificado Nº: ${certificate.certificateNumber}`, 60, pageHeight - 100);

    doc.text(`Emissor: ${certificate.issuer}`, 60, pageHeight - 80);

    // Verification URL
    const verificationUrl = `${process.env.FRONTEND_URL || 'https://autovagas.com'}/verify-certificate?number=${certificate.certificateNumber}`;
    doc.fontSize(10)
       .fillColor('#3b82f6')
       .text(`Verificar autenticidade: ${verificationUrl}`, 60, pageHeight - 60);

    // Digital signature indicator
    doc.fontSize(8)
       .fillColor('#9ca3af')
       .text('Este certificado possui assinatura digital para verificação de autenticidade.', 
             pageWidth - 300, pageHeight - 60);

    // Decorative elements
    this.drawDecorativeElements(doc, pageWidth, pageHeight);
  }

  private drawDecorativeElements(doc: PDFKit.PDFDocument, pageWidth: number, pageHeight: number): void {
    // Top left corner decoration
    doc.save()
       .translate(80, 80)
       .rotate(-45)
       .rect(-20, -2, 40, 4)
       .fill('#fbbf24');

    doc.restore()
       .save()
       .translate(80, 80)
       .rotate(45)
       .rect(-20, -2, 40, 4)
       .fill('#fbbf24');

    // Top right corner decoration
    doc.restore()
       .save()
       .translate(pageWidth - 80, 80)
       .rotate(-45)
       .rect(-20, -2, 40, 4)
       .fill('#fbbf24');

    doc.restore()
       .save()
       .translate(pageWidth - 80, 80)
       .rotate(45)
       .rect(-20, -2, 40, 4)
       .fill('#fbbf24');

    // Bottom decorative line
    doc.restore()
       .moveTo(pageWidth * 0.2, pageHeight - 150)
       .lineTo(pageWidth * 0.8, pageHeight - 150)
       .stroke('#e5e7eb')
       .lineWidth(2);

    // Seal/stamp area (placeholder)
    doc.circle(pageWidth - 150, pageHeight - 150, 40)
       .stroke('#d1d5db')
       .lineWidth(2);

    doc.fontSize(8)
       .fillColor('#9ca3af')
       .text('SELO', pageWidth - 160, pageHeight - 155);
    
    doc.text('DIGITAL', pageWidth - 170, pageHeight - 145);
  }

  async generateCertificateImage(certificate: Certificate): Promise<Buffer> {
    // This would generate a PNG/JPEG version of the certificate
    // For now, we'll return the PDF buffer
    return this.generateCertificatePDF(certificate);
  }

  generateVerificationQRCode(certificateNumber: string): string {
    // This would generate a QR code for certificate verification
    // For now, return a placeholder URL
    return `${process.env.FRONTEND_URL || 'https://autovagas.com'}/verify-certificate?number=${certificateNumber}`;
  }
}
