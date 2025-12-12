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
    return await QRCode.toBuffer(text, {
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

