import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as pdf from 'pdf-parse';
import { marked } from 'marked';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private browser: puppeteer.Browser | null = null;

  async onModuleInit() {
    // Inicializar browser quando o módulo for carregado
    await this.initBrowser();
  }

  async onModuleDestroy() {
    // Fechar browser quando o módulo for destruído
    await this.closeBrowser();
  }

  private async initBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      try {
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
          ],
        });
        this.logger.log('Browser initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize browser:', error);
        throw error;
      }
    }
    return this.browser;
  }

  async generateFromMarkdown(markdownContent: string, options: any = {}): Promise<Buffer> {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      // Converter markdown para HTML
      const htmlContent = this.markdownToHTML(markdownContent);

      // Definir conteúdo HTML com estilos
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Configurações do PDF
      const pdfOptions = {
        format: 'A4' as const,
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        ...options,
      };

      // Gerar PDF
      const pdfBuffer = await page.pdf(pdfOptions);
      await page.close();

      this.logger.log('PDF generated successfully');
      return pdfBuffer;
    } catch (error) {
      this.logger.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  private markdownToHTML(markdownContent: string): string {
    const htmlContent = marked.parse(markdownContent);

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Currículo</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 2.2em;
        }
        
        h2 {
            color: #34495e;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 8px;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 1.5em;
        }
        
        h3 {
            color: #2c3e50;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 1.2em;
        }
        
        p {
            margin-bottom: 12px;
            text-align: justify;
        }
        
        ul, ol {
            margin-bottom: 15px;
            padding-left: 25px;
        }
        
        li {
            margin-bottom: 5px;
        }
        
        strong {
            color: #2c3e50;
            font-weight: 600;
        }
        
        .contact-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #3498db;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 15px;
            }
            
            h1 {
                page-break-after: avoid;
            }
            
            h2, h3 {
                page-break-after: avoid;
                page-break-inside: avoid;
            }
            
            .section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
  }

  async extractText(pdfBuffer: Buffer): Promise<string> {
    try {
      const data = await pdf(pdfBuffer);
      this.logger.log('Text extracted from PDF successfully');
      return data.text;
    } catch (error) {
      this.logger.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  async generateResumeWithTemplate(
    resumeData: any,
    templateType: string = 'modern',
  ): Promise<Buffer> {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      const htmlContent = this.generateResumeHTML(resumeData, templateType);
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm',
        },
      });

      await page.close();
      this.logger.log('Resume PDF generated with template successfully');
      return pdfBuffer;
    } catch (error) {
      this.logger.error('Error generating resume PDF with template:', error);
      throw new Error('Failed to generate resume PDF with template');
    }
  }

  private generateResumeHTML(resumeData: any, templateType: string): string {
    const templates = {
      modern: this.getModernTemplate(resumeData),
      classic: this.getClassicTemplate(resumeData),
      creative: this.getCreativeTemplate(resumeData),
    };

    return templates[templateType] || templates.modern;
  }

  private getModernTemplate(data: any): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Currículo - ${data.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #007acc;
        }
        .name {
            font-size: 2.5em;
            font-weight: 300;
            color: #007acc;
            margin-bottom: 10px;
        }
        .title {
            font-size: 1.3em;
            color: #666;
            margin-bottom: 20px;
        }
        .contact {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            font-size: 0.9em;
            color: #555;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 1.4em;
            color: #007acc;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e0e0e0;
        }
        .content {
            margin-left: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="name">${data.name || 'Nome'}</h1>
            <p class="title">${data.title || 'Título Profissional'}</p>
            <div class="contact">
                <span>${data.email || 'email@exemplo.com'}</span>
                <span>${data.phone || '(11) 99999-9999'}</span>
                <span>${data.location || 'Cidade, Estado'}</span>
            </div>
        </div>
        
        ${data.content || ''}
    </div>
</body>
</html>`;
  }

  private getClassicTemplate(data: any): string {
    // Template clássico simplificado
    return this.getModernTemplate(data);
  }

  private getCreativeTemplate(data: any): string {
    // Template criativo simplificado
    return this.getModernTemplate(data);
  }

  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.logger.log('Browser closed');
    }
  }
}
