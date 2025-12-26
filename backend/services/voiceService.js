// services/voiceService.js - Context-Aware Voice Bot
const { GoogleGenerativeAI } = require('@google/generative-ai');
const CropListing = require('../models/CropListing');
const Bid = require('../models/Bid');
const User = require('../models/User');

let genAI = null;

try {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not set; Gemini-based voice features will be disabled.');
  } else {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (error) {
  console.error('Warning: Could not initialize Gemini client. Voice AI will be disabled.', error.message);
  genAI = null;
}

class VoiceService {
  /**
   * Fetch farmer's data from database
   */
  async getFarmerContext(userId) {
    try {
      if (!userId || userId === 'anonymous') {
        return {
          error: 'User not logged in',
          context: 'ದಯವಿಟ್ಟು ಮೊದಲು ಲಾಗಿನ್ ಆಗಿ (Please login first)'
        };
      }

      // Fetch user/organizer details
      const farmer = await User.findById(userId).select('name email');
      
      // Fetch all crops by this farmer
      const crops = await CropListing.find({ farmerId: userId })
        .sort({ createdAt: -1 });
      
      // Fetch all bids on farmer's crops
      const cropIds = crops.map(c => c._id);
      const bids = await Bid.find({ cropListingId: { $in: cropIds } })
        .populate('buyerId', 'name')
        .sort({ bidAmount: -1 });

      // Calculate statistics
      const totalCrops = crops.length;
      const activeCrops = crops.filter(c => c.status === 'active' || c.status === 'bidding').length;
      const soldCrops = crops.filter(c => c.status === 'sold').length;
      const pendingGrading = crops.filter(c => c.status === 'pending_grading').length;
      
      const totalBids = bids.length;
      const wonBids = bids.filter(b => b.bidStatus === 'won').length;
      
      // Revenue calculation (from won bids)
      const totalRevenue = bids
        .filter(b => b.bidStatus === 'won')
        .reduce((sum, bid) => sum + bid.bidAmount, 0);

      // Prepare context for AI
      const context = {
        farmerName: farmer?.name || 'Organizer',
        totalCrops,
        activeCrops,
        soldCrops,
        pendingGrading,
        totalBids,
        wonBids,
        totalRevenue,
        recentCrops: crops.slice(0, 5).map(c => ({
          crop: c.crop,
          quantity: c.quantityKg,
          price: c.pricePerKg,
          status: c.status,
          grade: c.grade,
          qualityScore: c.qualityScore
        })),
        topBids: bids.slice(0, 5).map(b => ({
          cropId: b.cropListingId,
          bidAmount: b.bidAmount,
          status: b.bidStatus,
          buyerName: b.buyerId?.name
        }))
      };

      // Create summary text in Kannada
      const summaryText = `
    Organizer name: ${context.farmerName}
    ಒಟ್ಟು ಬೆಳೆಗಳು: ${totalCrops}
    ಮಾರಾಟಕ್ಕಿರುವ ಬೆಳೆಗಳು: ${activeCrops}
    ಮಾರಾಟವಾದ ಬೆಳೆಗಳು: ${soldCrops}
    ಗ್ರೇಡಿಂಗ್ ಬಾಕಿ ಇರುವ ಬೆಳೆಗಳು: ${pendingGrading}
    ಒಟ್ಟು ಬಿಡ್‌ಗಳು: ${totalBids}
    ಗೆದ್ದ ಬಿಡ್‌ಗಳು: ${wonBids}
    ಒಟ್ಟು ಆದಾಯ: ₹${totalRevenue}

ಇತ್ತೀಚಿನ ಬೆಳೆಗಳು:
${context.recentCrops.map((c, i) => `${i+1}. ${c.crop} - ${c.quantity}kg @ ₹${c.price}/kg (${c.status})`).join('\n')}

ಅತ್ಯುತ್ತಮ ಬಿಡ್‌ಗಳು:
${context.topBids.map((b, i) => `${i+1}. ₹${b.bidAmount} - ${b.status} ${b.buyerName ? `(${b.buyerName})` : ''}`).join('\n')}
`;

      return {
        success: true,
        context: summaryText,
        data: context
      };

    } catch (error) {
      console.error('Error fetching farmer context:', error);
      return {
        error: error.message,
        context: 'ಡೇಟಾ ತರಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ (Could not fetch data)'
      };
    }
  }

  /**
   * Process text with Gemini AI with farmer's context
   */
  async processWithGemini(text, conversationHistory = [], farmerContext = null) {
    try {
      if (!genAI) throw new Error("Gemini client not initialized.");
      
      console.log('Processing with Gemini:', text);
      
      // Build system instruction with context
      let systemInstruction = `You are a helpful AI assistant for EventHub, a platform connecting organizers and attendees in Karnataka, India.

**CRITICAL: You MUST respond ONLY in Kannada language (ಕನ್ನಡ). Never respond in English.**

You help organizers with:
- Event listings and schedules
- Attendee management and registrations
- Ticketing and revenue tracking
- Event logistics and best practices
- Local market and venue trends

`;

      // Add farmer's context if available
      if (farmerContext) {
        systemInstruction += `\n**FARMER'S CURRENT DATA:**\n${farmerContext}\n\n`;
        systemInstruction += `Use this data to answer the farmer's questions accurately. When they ask about "my crops" or "my bids", refer to the data above.\n\n`;
      }

      systemInstruction += `Always respond naturally and helpfully in Kannada. Keep responses concise (2-4 sentences) and practical. Use simple Kannada that farmers can understand.`;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        systemInstruction: systemInstruction
      });

      // Convert history to Gemini format
      const formattedHistory = conversationHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const chat = model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(text);
      const responseText = result.response.text();

      console.log('Gemini response:', responseText);

      return {
        success: true,
        text: responseText
      };
    } catch (error) {
      console.error('Error processing with Gemini:', error);
      return {
        success: false,
        error: error.message,
        text: 'ಕ್ಷಮಿಸಿ, ನಾನು ಈಗ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ.' // Sorry, I cannot process your question right now
      };
    }
  }

  /**
   * Process text query with user context
   */
  async processTextQuery(userText, conversationHistory = [], userId = null) {
    try {
      console.log('Processing text query:', userText);
      console.log('User ID:', userId);

      // Fetch farmer's context from database
      const contextResult = await this.getFarmerContext(userId);
      
      const farmerContext = contextResult.success ? contextResult.context : null;

      // Process with Gemini
      const aiResponse = await this.processWithGemini(
        userText,
        conversationHistory,
        farmerContext
      );

      return {
        success: true,
        userText: userText,
        aiText: aiResponse.text,
      };
    } catch (error) {
      console.error('Error in text query processing:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new VoiceService();