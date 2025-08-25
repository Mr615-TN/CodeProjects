import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { QRCodeData } from '../types';

export class QRService {
  private static readonly QR_VERSION = '1.0';

  // Generate QR data for a container
  static generateQRData(containerId: string): string {
    const qrData: QRCodeData = {
      containerId,
      version: this.QR_VERSION,
      type: 'container',
    };
    return JSON.stringify(qrData);
  }

  // Parse QR data
  static parseQRData(qrString: string): QRCodeData | null {
    try {
      const data = JSON.parse(qrString);
      
      // Validate required fields
      if (!data.containerId || !data.type || data.type !== 'container') {
        return null;
      }

      return {
        containerId: data.containerId,
        version: data.version || '1.0',
        type: 'container',
      };
    } catch (error) {
      console.error('Error parsing QR data:', error);
      return null;
    }
  }

  // Generate printable QR code HTML
  static generatePrintableHTML(qrCodeSVG: string, containerName: string, containerId: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>QR Code - ${containerName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              background: white;
            }
            .qr-container {
              text-align: center;
              page-break-inside: avoid;
              margin-bottom: 40px;
            }
            .qr-code {
              margin: 20px 0;
            }
            .container-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #333;
            }
            .container-id {
              font-size: 12px;
              color: #666;
              margin-top: 10px;
            }
            .instructions {
              font-size: 14px;
              color: #555;
              margin-top: 20px;
              max-width: 400px;
              line-height: 1.4;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="container-name">${containerName}</div>
            <div class="qr-code">
              ${qrCodeSVG}
            </div>
            <div class="container-id">ID: ${containerId}</div>
            <div class="instructions">
              Scan this QR code with the Inventory App to view and manage the contents of this container.
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Print QR code
  static async printQRCode(qrCodeSVG: string, containerName: string, containerId: string): Promise<void> {
    try {
      const html = this.generatePrintableHTML(qrCodeSVG, containerName, containerId);
      await Print.printAsync({ html });
    } catch (error) {
      console.error('Error printing QR code:', error);
      throw new Error('Failed to print QR code');
    }
  }

  // Share QR code
  static async shareQRCode(qrCodeSVG: string, containerName: string, containerId: string): Promise<void> {
    try {
      const html = this.generatePrintableHTML(qrCodeSVG, containerName, containerId);
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share QR Code - ${containerName}`,
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      throw new Error('Failed to share QR code');
    }
  }

  // Validate if a string looks like a QR code from this app
  static isValidQRCode(qrString: string): boolean {
    const data = this.parseQRData(qrString);
    return data !== null;
  }
}