import { dbAll } from '../database/db.js';

export const matchController = {
  // GET /api/matches
  async getFarmerBuyerMatches(req, res, next) {
    try {
      const { crop, farmer_id, minScore = 40 } = req.query;

      // 1. Get farmer crops
      let cropQuery = `SELECT c.*, u.name as farmer_name, u.phone as farmer_phone FROM crops c LEFT JOIN users u ON c.farmer_id = u.id WHERE c.status IN ('Growing', 'Harvested', 'Ready to Sell', 'Storage Cured')`;
      const cropParams = [];
      if (farmer_id) {
        cropQuery += ` AND c.farmer_id = ?`;
        cropParams.push(farmer_id);
      }
      if (crop && crop !== 'All') {
        cropQuery += ` AND c.crop_name LIKE ?`;
        cropParams.push(`%${crop}%`);
      }
      const crops = await dbAll(cropQuery, cropParams);

      // 2. Get active buyers
      let buyerQuery = `SELECT b.*, u.email as buyer_email FROM buyers b LEFT JOIN users u ON b.user_id = u.id WHERE b.status = 'Active'`;
      const buyerParams = [];
      if (crop && crop !== 'All') {
        buyerQuery += ` AND b.crop_required LIKE ?`;
        buyerParams.push(`%${crop}%`);
      }
      const buyers = await dbAll(buyerQuery, buyerParams);

      const matches = [];

      for (const fc of crops) {
        for (const byr of buyers) {
          // Normalize names for comparison
          const cName = fc.crop_name.toLowerCase();
          const reqName = byr.crop_required.toLowerCase();

          const isCropMatch = cName.includes(reqName) || reqName.includes(cName) ||
            (cName.includes('cotton') && reqName.includes('cotton')) ||
            (cName.includes('soybean') && reqName.includes('soybean')) ||
            (cName.includes('wheat') && reqName.includes('wheat')) ||
            (cName.includes('onion') && reqName.includes('onion'));

          if (!isCropMatch) continue;

          // Quantity fulfillment percentage
          const qtyRatio = Math.min(fc.quantity / byr.quantity_required, 1.0);
          const quantityScore = Math.round(qtyRatio * 40); // Max 40 pts

          // Location proximity score
          const fLoc = (fc.location || '').toLowerCase();
          const bLoc = (byr.location || '').toLowerCase();
          let locationScore = 15;
          if (fLoc.includes('nagpur') && bLoc.includes('nagpur')) locationScore = 30;
          else if (fLoc.includes('wardha') && bLoc.includes('nagpur')) locationScore = 25;
          else if (fLoc.includes('amravati') && bLoc.includes('nagpur')) locationScore = 20;
          else if (fLoc === bLoc) locationScore = 30;

          // Quality / Readiness score
          const readinessScore = fc.status === 'Ready to Sell' || fc.status === 'Harvested' ? 30 : 20;

          const totalScore = quantityScore + locationScore + readinessScore;

          if (totalScore >= Number(minScore)) {
            const potentialRevenue = Math.round(fc.quantity * byr.price_offered);
            matches.push({
              matchId: `MTC-${fc.id}-${byr.id}`,
              matchScore: Math.min(totalScore, 98),
              cropName: fc.crop_name,
              farmer: {
                id: fc.farmer_id,
                name: fc.farmer_name || 'Ramesh Patel',
                phone: fc.farmer_phone || '+91 98230 11223',
                location: fc.location,
                availableQuantity: fc.quantity,
                unit: fc.unit,
                status: fc.status
              },
              buyer: {
                id: byr.id,
                businessName: byr.business_name,
                location: byr.location,
                quantityRequired: byr.quantity_required,
                priceOffered: byr.price_offered,
                contactPhone: byr.contact_phone
              },
              fulfillmentPercent: Math.round(qtyRatio * 100),
              potentialTotalRevenue: potentialRevenue,
              notes: byr.notes || 'Direct procurement without APMC commission broker fees.'
            });
          }
        }
      }

      matches.sort((a, b) => b.matchScore - a.matchScore);

      res.json({
        success: true,
        count: matches.length,
        data: matches
      });
    } catch (err) {
      next(err);
    }
  }
};
