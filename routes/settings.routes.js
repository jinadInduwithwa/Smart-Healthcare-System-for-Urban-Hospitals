// import express from 'express';
// import QRCode from 'qrcode';
// import authMiddleware from '../middleware/authMiddleware.js';

// const router = express.Router();

// // Generate QR Code
// router.post('/generate-qr', authMiddleware, async (req, res) => {
//   try {
//     const { type, data } = req.body;
//     const userId = req.user.id;

//     if (!type || !data) {
//       return res.status(400).json({ 
//         message: 'Type and data are required' 
//       });
//     }

//     // Generate QR code as base64
//     const qrCodeDataURL = await QRCode.toDataURL(data, {
//       width: 300,
//       margin: 2,
//       color: {
//         dark: '#000000',
//         light: '#FFFFFF'
//       }
//     });

//     // Extract base64 data
//     const base64Data = qrCodeDataURL.split(',')[1];

//     // Save to database (you would implement this)
//     const qrCodeRecord = {
//       id: `QR-${Date.now()}`,
//       userId,
//       type,
//       data,
//       qrCode: base64Data,
//       createdAt: new Date().toISOString()
//     };

//     res.json({
//       success: true,
//       message: 'QR code generated successfully',
//       data: qrCodeRecord
//     });

//   } catch (error) {
//     console.error('QR generation error:', error);
//     res.status(500).json({ 
//       message: 'Failed to generate QR code',
//       error: error.message 
//     });
//   }
// });

// // Get user's generated QR codes
// router.get('/qr-codes', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     // This would fetch from your database
//     const userQRCodes = []; // Implement database query
    
//     res.json({
//       success: true,
//       data: userQRCodes
//     });
//   } catch (error) {
//     console.error('Get QR codes error:', error);
//     res.status(500).json({ 
//       message: 'Failed to fetch QR codes',
//       error: error.message 
//     });
//   }
// });

// // Download QR code
// router.get('/download-qr/:qrId', authMiddleware, async (req, res) => {
//   try {
//     const { qrId } = req.params;
//     const userId = req.user.id;

//     // Fetch QR code from database
//     // const qrCode = await QRCodeModel.findOne({ id: qrId, userId });
    
//     // if (!qrCode) {
//     //   return res.status(404).json({ message: 'QR code not found' });
//     // }

//     // For demo purposes
//     res.setHeader('Content-Type', 'image/png');
//     res.setHeader('Content-Disposition', `attachment; filename="qrcode-${qrId}.png"`);
    
//     // You would send the actual QR code image buffer
//     res.send();
//   } catch (error) {
//     console.error('Download QR error:', error);
//     res.status(500).json({ 
//       message: 'Failed to download QR code',
//       error: error.message 
//     });
//   }
// });

// export default router;

// auth-service/src/routes/settings.routes.js
import express from 'express';
import QRCode from 'qrcode';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Generate QR Code
router.post('/generate-qr', auth, async (req, res) => {
  try {
    const { type, data } = req.body;
    const userId = req.user.id;

    if (!type || !data) {
      return res.status(400).json({ 
        success: false,
        message: 'Type and data are required' 
      });
    }

    // Validate QR code type
    const validTypes = ['PROFILE', 'APPOINTMENT', 'MEDICAL_RECORD'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code type. Must be PROFILE, APPOINTMENT, or MEDICAL_RECORD'
      });
    }

    console.log(`Generating QR code for user ${userId}, type: ${type}, data: ${data}`);

    // Generate QR code as base64
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Extract base64 data
    const base64Data = qrCodeDataURL.split(',')[1];

    // Create QR code record
    const qrCodeRecord = {
      id: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      data,
      qrCode: base64Data,
      createdAt: new Date().toISOString()
    };

    console.log('QR code generated successfully');

    res.json({
      success: true,
      message: 'QR code generated successfully',
      data: qrCodeRecord
    });

  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate QR code',
      error: error.message 
    });
  }
});

// Get user's generated QR codes
router.get('/qr-codes', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // For demo purposes, return empty array
    // You can implement database storage later
    const userQRCodes = [];
    
    res.json({
      success: true,
      data: userQRCodes
    });
  } catch (error) {
    console.error('Get QR codes error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch QR codes',
      error: error.message 
    });
  }
});

export default router;