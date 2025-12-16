import QRCode from "qrcode";

/**
 * Generate QR code as data URL (for displaying in img tag)
 */
export async function generateQRCodeDataURL(
  text: string,
  options?: QRCode.QRCodeToDataURLOptions
): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 300,
      errorCorrectionLevel: "M",
      type: "image/png",
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      ...options,
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(
  text: string,
  options?: QRCode.QRCodeToStringOptions
): Promise<string> {
  try {
    return await QRCode.toString(text, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      ...options,
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

/**
 * Generate QR code as Buffer (for saving to file)
 */
export async function generateQRCodeBuffer(
  text: string,
  options?: QRCode.QRCodeToBufferOptions
): Promise<Buffer> {
  try {
    // Use callback-based API to avoid type issues with QRCode.toBuffer overloads.
    return await new Promise<Buffer>((resolve, reject) => {
      QRCode.toBuffer(
        text,
        {
          width: 300,
          errorCorrectionLevel: "M",
          // For Buffer output, QRCode expects the short type 'png'
          type: "png",
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
          ...options,
        },
        (err, buffer) => {
          if (err || !buffer) {
            console.error("Error generating QR code buffer:", err);
            reject(err || new Error("Failed to generate QR code buffer"));
          } else {
            resolve(buffer);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

