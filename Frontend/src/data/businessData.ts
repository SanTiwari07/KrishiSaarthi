
import { BUSINESS_DETAILS as ORIG_DETAILS } from './businessData_backup'; // Hypothetical, content is inline.

export type Language = 'en' | 'hi' | 'mr';

export interface BusinessSection {
    title: Record<Language, string>;
    content: Record<Language, string[]>;
}

export interface BusinessDetail {
    id: string;
    title: string;
    basicIdea: Record<Language, string[]>;
    sections: BusinessSection[];
    shortStats?: {
        investment: string;
        profit: string;
    };
}

// Helper to create simple section with translations for common titles
const createSection = (titleEn: string, contentEn: string[], titleHi?: string, titleMr?: string, contentHi?: string[], contentMr?: string[]): BusinessSection => {
    // Map common titles if specific ones aren't provided
    const commonTitles: Record<string, { hi: string, mr: string }> = {
        'SOURCE': { hi: 'स्रोत', mr: 'स्त्रोत' },
        'SOURCE LOCATION': { hi: 'स्रोत स्थान', mr: 'स्त्रोत स्थान' },
        'LOCATION': { hi: 'स्थान', mr: 'ठिकाण' },
        'LOCATION SUITABILITY': { hi: 'स्थान उपयुक्तता', mr: 'स्थान उपयुक्तता' },
        'LAND REQUIREMENT': { hi: 'भूमि की आवश्यकता', mr: 'जमीन आवश्यकता' },
        'INVESTMENT BREAKDOWN (REALISTIC)': { hi: 'निवेश विवरण (यथार्थवादी)', mr: 'गुंतवणूक तपशील (वास्तवावादी)' },
        'RAW MATERIALS / INPUTS': { hi: 'कच्चा माल / इनपुट', mr: 'कच्चा माल / इनपुट' },
        'INFRASTRUCTURE & REQUIREMENTS': { hi: 'बुनियादी ढांचा और आवश्यकताएं', mr: 'पायाभूत सुविधा आणि आवश्यकता' },
        'CONNECTIVITY': { hi: 'कनेक्टिविटी', mr: 'कनेक्टिव्हिटी' },
        'LABOUR REQUIREMENT': { hi: 'श्रम आवश्यकता', mr: 'कामगार आवश्यकता' },
        'OPERATING & MAINTENANCE COST': { hi: 'परिचालन और रखरखाव लागत', mr: 'ऑपरेटिंग आणि देखभाल खर्च' },
        'EXPECTED INCOME': { hi: 'अपेक्षित आय', mr: 'अपेक्षित उत्पन्न' },
        'PROFIT MARGIN & ROI': { hi: 'लाभ मार्जिन और आरओआई', mr: 'नफा मार्जिन आणि आरओआय' },
        'EXPECTED PROFIT AND ROI': { hi: 'अपेक्षित लाभ और आरओआई', mr: 'अपेक्षित नफा आणि आरओआय' },
        'TIME COMMITMENT': { hi: 'समय प्रतिबद्धता', mr: 'वेळ वचनबद्धता' },
        'TIME AVAILABILITY': { hi: 'समय उपलब्धता', mr: 'वेळ उपलब्धता' },
        'RISKS': { hi: 'जोखिम', mr: 'जोखीम' },
        'RISK LEVEL': { hi: 'जोखिम स्तर', mr: 'जोखीम स्तर' },
        'RISK PERCENTAGE': { hi: 'जोखिम प्रतिशत', mr: 'जोखीम टक्केवारी' },
        'ENVIRONMENTAL IMPACT': { hi: 'पर्यावरण प्रभाव', mr: 'पर्यावरण प्रभाव' },
        'HISTORICAL SUCCESS DATA': { hi: 'ऐतिहासिक सफलता डेटा', mr: 'ऐतिहासिक यश डेटा' },
        'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED': { hi: 'सरकारी लाइसेंस और पंजीकरण', mr: 'सरकारी परवाने आणि नोंदणी' },
        'SUITABILITY FIT (FARMER PROFILE)': { hi: 'उपयुक्तता (किसान प्रोफाइल)', mr: 'उपयुक्तता (शेतकरी प्रोफाइल)' },
        'OTHER PRACTICAL INSIGHTS': { hi: 'अन्य व्यावहारिक अंतर्दृष्टि', mr: 'इतर व्यावहारिक अंतर्दृष्टी' },
        'FACT TO KNOW': { hi: 'जानने योग्य तथ्य', mr: 'जाणून घेण्यासारखे तथ्य' },
        'MAINTENANCE': { hi: 'रखरखाव', mr: 'देखभाल' },
        'EXPECTED ROI / PROFIT': { hi: 'अपेक्षित आरओआई / लाभ', mr: 'अपेक्षित आरओआय / नफा' }
    };

    const translatedTitle = commonTitles[titleEn];

    return {
        title: {
            en: titleEn,
            hi: titleHi || translatedTitle?.hi || titleEn,
            mr: titleMr || translatedTitle?.mr || titleEn
        },
        content: {
            en: contentEn,
            hi: contentHi || [],
            mr: contentMr || []
        }
    };
};

export const BUSINESS_DETAILS: Record<string, BusinessDetail> = {
    '1': {
        id: '1',
        title: 'FLOWER PLANTATION (GERBERA)',
        basicIdea: {
            en: [
                'Commercial cultivation of Gerbera flowers inside a controlled greenhouse',
                'Focus on high-quality cut flowers for wholesale markets, decorators, and exporters'
            ],
            hi: [
                'नियंत्रित ग्रीनहाउस के भीतर जरबेरा फूलों की व्यावसायिक खेती',
                'थोक बाजारों, सजावट करने वालों और निर्यातकों के लिए उच्च गुणवत्ता वाले कटे फूलों पर ध्यान केंद्रित करना'
            ],
            mr: [
                'नियंत्रित ग्रीनहाऊसमध्ये जरबेरा फुलांची व्यावसायिक लागवड',
                'घाऊक बाजार, सजावट करणारे आणि निर्यातदारांसाठी उच्च दर्जाच्या फुलांवर लक्ष केंद्रित करणे'
            ]
        },
        sections: [
            createSection('SOURCE', ['Tilekar Family']),
            createSection('SOURCE LOCATION', ['Dive, Purandar District, Maharashtra']),
            createSection('LOCATION SUITABILITY', ['Semi-arid to moderate climate', 'Areas with assured water supply', 'Proximity to Pune flower markets and highways is a major advantage']),
            createSection('LAND REQUIREMENT', ['Minimum: 0.5 acre', 'Ideal: 1 acre (economies of scale work better at 1 acre)']),
            createSection('INVESTMENT BREAKDOWN (REALISTIC)', [
                'Greenhouse construction (GI structure + poly film): ₹90 lakh – ₹1 crore',
                'Raw materials and initial inputs: ₹10–15 lakh',
                'Total initial investment (before subsidy): ₹1.0 – 1.15 crore',
                'Government subsidy: Up to 50% (released in phases after completion and inspection)',
                'Important note: Farmer must arrange full capital upfront'
            ]),
            createSection('RAW MATERIALS / INPUTS', ['Red lateritic soil (preferred for drainage)', 'Tissue cultured Gerbera plantlets', 'Fertilizers (stage-wise): NPK, Calcium Nitrate, Bio-fertilizers', 'Plant protection chemicals']),
            createSection('INFRASTRUCTURE & REQUIREMENTS', ['Greenhouse with GI frame', 'UV-stabilized polyethylene film', 'Drip irrigation system', 'Water requirement: 500–700 ml per plant per day', 'Proper ventilation and humidity control']),
            createSection('CONNECTIVITY', ['Strong local flower market access', 'Good road connectivity to: Pune city, State highways, National highways (for overnight transport)']),
            createSection('LABOUR REQUIREMENT', ['1–2 skilled labourers sufficient for 1 acre greenhouse', 'Skilled supervision required, especially during flowering and harvesting']),
            createSection('OPERATING & MAINTENANCE COST', ['Fertilizers and plant protection chemicals', 'Electricity for pumps and automation', 'Greenhouse maintenance: GI structure inspection, Polyethylene film replacement (every few years)']),
            createSection('EXPECTED INCOME', ['Regular daily flower harvest once plants mature', 'Stable demand from: Florists, Event planners, Wholesale mandis']),
            createSection('PROFIT MARGIN & ROI', ['Break-even period: Around 6 months after full production', 'Reported ROI: Around 226% (with good management and stable pricing)']),
            createSection('TIME COMMITMENT', ['Initial phase: Full-time involvement required', 'After stabilization: 4–5 hours per day for monitoring and management']),
            createSection('RISKS', ['Pest infestations', 'Disease outbreaks', 'Nematode damage', 'Nutrient deficiencies', 'Climate sensitivity', 'Water management imbalance', 'Soil quality issues', 'Very high initial investment', 'Flower price fluctuations', 'Perishability and logistics challenges', 'Lack of skilled manpower']),
            createSection('RISK LEVEL', ['Medium to High']),
            createSection('ENVIRONMENTAL IMPACT', ['Low', 'Efficient water use through drip irrigation', 'Limited land requirement']),
            createSection('HISTORICAL SUCCESS DATA', ['Proven high benefit–cost ratio in Maharashtra', '₹2.24 – ₹2.96 return per ₹1 invested under proper management']),
            createSection('GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', ['Farmer registration with State Agriculture Department', 'Greenhouse subsidy approval under: MIDH (Mission for Integrated Development of Horticulture)', 'Land ownership or lease documents', 'Bank loan sanction (if financed)', 'Electricity connection approval', 'Local Gram Panchayat NOC (if required)']),
            createSection('SUITABILITY FIT (FARMER PROFILE)', ['Best suited for: Farmer with land and good capital, Farmers ready for high-risk, high-return ventures, Educated youth farmers willing to adopt technology', 'Not suitable for: Farmers with no land, Farmers with low capital and no access to loans']),
            createSection('OTHER PRACTICAL INSIGHTS', ['Cash flow planning is critical because subsidy is delayed', 'Market tie-ups should be secured before first harvest', 'Skilled crop management makes a huge difference in quality and price', 'Insurance for greenhouse structure is highly recommended']),
            createSection('FACT TO KNOW', ['Gerbera flowers can be harvested almost daily for 2–3 years from a single planting cycle, making it one of the most intensive and cash-generating floriculture crops when managed correctly.'])
        ],
        shortStats: {
            investment: '₹1 Cr – ₹1.15 Cr',
            profit: '226% ROI'
        }
    },
    '2': {
        id: '2',
        title: 'PACKAGED DRINKING WATER BUSINESS',
        basicIdea: {
            en: ['Purification, bottling, and packaging of drinking water', 'Uses RO + UV technology', 'Supplies to retail shops, hotels, offices, events, and bulk buyers'],
            hi: ['पीने के पानी का शुद्धिकरण, बॉटलिंग और पैकेजिंग', 'RO + UV तकनीक का उपयोग करता है', 'खुदरा दुकानों, होटलों, कार्यालयों, कार्यक्रमों और थोक खरीदारों को आपूर्ति'],
            mr: ['पिण्याच्या पाण्याचे शुद्धीकरण, बाटलीबंद करणे आणि पॅकेजिंग', 'RO + UV तंत्रज्ञानाचा वापर', 'किरकोळ दुकाने, हॉटेल्स, कार्यालये, कार्यक्रम आणि घाऊक खरेदीदारांना पुरवठा']
        },
        sections: [
            createSection('SOURCE', ['Aria Foods and Beverages']),
            createSection('SOURCE LOCATION', ['Hadapsar Industrial Area, Pune']),
            createSection('LOCATION SUITABILITY', ['Industrial or semi-urban area', 'Near hotels, housing complexes, offices, event zones', 'Easy access to city or crowded areas for faster distribution']),
            createSection('LAND REQUIREMENT', ['Minimum: 0.25–0.5 acre (10–20 guntha)', 'Area breakup: 3 guntha: machinery section; 2–3 guntha: office + lab; 5 guntha: storage, water tanks, generator']),
            createSection('INVESTMENT BREAKDOWN (REALISTIC)', ['Basic shed / warehouse / office setup: ₹5–6 lakh', 'Storage tanks + generator / inverter: ₹5 lakh', 'RO + UV water purifier (500–1000 LPH): ₹1.5–2 lakh', 'Higher capacity purifier (4000–5000 LPH): ₹8–9 lakh', 'Packaging options: a) Basic water packaging unit: ₹1.8 lakh; b) Complete unit with bottle manufacturing: ₹6–7 lakh']),
            createSection('RAW MATERIALS / INPUTS', ['Borewell water (preferred)', 'Tanker water (if borewell not available)', 'Plastic granules (if bottle manufacturing is done in-house)', 'OR ready-made plastic bottles', 'Labels, caps, sealing material']),
            createSection('INFRASTRUCTURE & REQUIREMENTS', ['RO + UV purification system', 'Bottling and sealing machines', 'Laboratory space for water testing', 'Electricity requirement: 6–10 kW per hour', 'Three-phase connection required for higher capacity plants']),
            createSection('CONNECTIVITY', ['Nearby hotels, shops, complexes, offices', 'Easy truck and tempo movement', 'Good road connectivity to city and commercial zones']),
            createSection('LABOUR REQUIREMENT', ['3–4 labourers for automated units', 'More labour needed if basic manual packaging unit is used', 'One trained supervisor recommended']),
            createSection('EXPECTED INCOME', ['1 L bottles: Cost ₹40–45/box, Sell ₹80–90', '200 ml bottles: Cost ₹80–90/box, Sell ₹150']),
            createSection('PROFIT MARGIN & ROI', ['Margin depends on machine utilization', 'Higher utilization = higher profit', 'ROI improves significantly with bulk B2B contracts']),
            createSection('TIME COMMITMENT', ['Initial phase: 6–7 hours per day', 'After stabilization: 1–3 hours per day']),
            createSection('RISKS', ['Groundwater depletion concerns', 'Reduced margins if machine capacity is underutilized', 'Labour handling challenges', 'Tough competition from established brands', 'Local brand trust building takes time']),
            createSection('RISK LEVEL', ['Medium to High']),
            createSection('ENVIRONMENTAL IMPACT', ['Medium to High', 'Plastic waste generation is a major concern', 'Water resource management is critical']),
            createSection('HISTORICAL SUCCESS DATA', ['Strong growth over the last decade', 'Consistent demand in urban and semi-urban areas']),
            createSection('GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', ['BIS Certification (IS 14543)', 'FSSAI Registration / License', 'Local Municipal Corporation / Gram Panchayat trade license', 'Groundwater extraction permission', 'Pollution Control Board consent', 'Electricity department approval', 'GST registration']),
            createSection('SUITABILITY FIT (FARMER PROFILE)', ['Best suited for: Farmer with no land but good capital, Farmer with land and good capital, Entrepreneurs near cities', 'Not suitable for: Farmers with no capital, Remote village farmers without market access']),
            createSection('OTHER PRACTICAL INSIGHTS', ['BIS approval is time-consuming', 'B2B contracts provide stability', 'Transport cost affects margins', 'Plastic recycling tie-ups improve brand image']),
            createSection('FACT TO KNOW', ['Profits are not made from purification technology alone but from logistics efficiency, bulk contracts, and consistent repeat customers.'])
        ],
        shortStats: {
            investment: '₹5L - ₹9L',
            profit: 'Volume Based'
        }
    },
    '3': {
        id: '3',
        title: 'AMUL FRANCHISE BUSINESS',
        basicIdea: {
            en: ['Retail sale of Amul milk and dairy products', 'Products include milk, curd, butter, cheese, ice-cream', 'Operates under the cooperative model of GCMMF (Amul)'],
            hi: ['अमूल दूध और डेयरी उत्पादों की खुदरा बिक्री', 'उत्पादों में दूध, दही, मक्खन, पनीर, आइसक्रीम शामिल हैं', 'GCMMF (अमूल) के सहकारी मॉडल के तहत संचालित'],
            mr: ['अमूल दूध आणि दुग्धजन्य पदार्थांची किरकोळ विक्री', 'उत्पादनांमध्ये दूध, दही, लोणी, चीज, आईस्क्रीम समाविष्ट आहेत', 'GCMMF (अमूल) च्या सहकारी मॉडेल अंतर्गत चालते']
        },
        sections: [
            createSection('SOURCE', ['Gujarat Cooperative Milk Marketing Federation (GCMMF) – Amul']),
            createSection('LOCATION', ['Urban, semi-urban, or high-footfall rural market areas', 'Residential colonies, near schools, offices, hospitals']),
            createSection('LOCATION SUITABILITY', ['Areas with daily consumer movement', 'High pedestrian traffic', 'Visibility from main road is critical']),
            createSection('LAND REQUIREMENT', ['100 – 300 sq.ft prebuilt shop or kiosk']),
            createSection('INVESTMENT BREAKDOWN (REALISTIC)', ['Total investment: ₹1.5 lakh – ₹6 lakh', 'Shop construction (if land available): ₹1.5 – ₹2 lakh', 'Rented shop option: Rent ₹20k–50k', 'Amul Preferred Outlet: ~₹2 lakh', 'Amul Ice-Cream Scooping Parlour: ~₹6 lakh', 'No franchise fee, No royalty']),
            createSection('RAW MATERIALS / INPUTS', ['Milk, curd, butter, cheese, ice-creams', 'Supplied directly by Amul wholesale distributors']),
            createSection('INFRASTRUCTURE & REQUIREMENTS', ['Prebuilt shop or kiosk', 'Deep freezer and visicooler', 'Display counter and storage racks', 'Electricity connection', 'Basic interiors']),
            createSection('CONNECTIVITY', ['Good pedestrian movement', 'Easy access for delivery vehicles', 'Proximity to residential areas']),
            createSection('LABOUR REQUIREMENT', ['1–2 persons sufficient', 'Owner involvement improves margins']),
            createSection('EXPECTED INCOME', ['Monthly turnover: ₹5 lakh – ₹10 lakh', 'Margins: Milk 2-3%, Products ~10%, Ice-cream ~20%, Scooping up to 50%']),
            createSection('PROFIT MARGIN & ROI', ['Stable but volume-driven', 'Break-even: 12 – 18 months']),
            createSection('TIME COMMITMENT', ['Initial months: 5–6 hours per day', 'After stabilization: 1–2 hours per day']),
            createSection('RISKS', ['Seasonal demand variation', 'Heavy dependence on electricity', 'Competition from local dairies', 'Product perishability']),
            createSection('RISK LEVEL', ['Low']),
            createSection('ENVIRONMENTAL IMPACT', ['Low', 'Minimal plastic waste', 'No hazardous by-products']),
            createSection('HISTORICAL SUCCESS DATA', ['Very high success rate', 'Consistent growth over decades', 'Strong brand trust']),
            createSection('GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', ['FSSAI Registration', 'Shop Act License', 'Local Municipal trade license', 'GST registration']),
            createSection('SUITABILITY FIT (FARMER PROFILE)', ['Best suited for: First-time entrepreneurs, Small investors seeking low-risk', 'Not suitable for: Remote areas with low footfall']),
            createSection('OTHER PRACTICAL INSIGHTS', ['Location matters more than shop size', 'Ice-cream scooping gives highest margins', 'Brand trust reduces marketing effort']),
            createSection('FACT TO KNOW', ['Amul sells products every single day, making it one of the few franchise models where daily repeat customers are guaranteed.'])
        ],
        shortStats: {
            investment: '₹1.5L - ₹6L',
            profit: '₹5L - ₹10L Rev'
        }
    },
    '4': {
        id: '4',
        title: 'SPIRULINA FARMING (ALGAE)',
        basicIdea: {
            en: ['Cultivation of Spirulina (blue-green algae) in controlled tanks', 'Harvesting, drying, and processing into powder or tablets', 'End-use in nutraceutical and health food markets'],
            hi: ['नियंत्रित टैंकों में स्पिरुलिना (नीले-हरे शैवाल) की खेती', 'फसल काटना, सुखाना और पाउडर या गोलियों में प्रसंस्करण', 'न्यूट्रास्यूटिकल और स्वास्थ्य खाद्य बाजारों में अंतिम उपयोग'],
            mr: ['नियंत्रित टाक्यांमध्ये स्पिरुलिना (निळ्या-हिरव्या शैवाल) ची लागवड', 'काढणी, वाळवणे आणि पावडर किंवा गोळ्यांमध्ये प्रक्रिया करणे', 'न्यूट्रास्युटिकल आणि आरोग्य अन्न बाजारपेठेत अंतिम वापर']
        },
        sections: [
            createSection('SOURCE', ['Nutrigen Agrotech']),
            createSection('LOCATION', ['Mundhwa Industrial Area, Pune']),
            createSection('LOCATION SUITABILITY', ['Urban, semi-urban, or industrial locations', 'Rooftops, backyards, sheds, polyhouses', 'Good sunlight and clean water availability']),
            createSection('LAND REQUIREMENT', ['300 – 1000 sq.ft', 'Rooftop or small open plot']),
            createSection('INVESTMENT BREAKDOWN (REALISTIC)', ['Total: ₹2 lakh – ₹5 lakh', 'Tanks/raceway ponds: ₹50k–1.2L', 'Agitators: ₹20k–40k', 'Drying system: ₹30k–1L', 'Harvesting tools: ₹20k–40k']),
            createSection('RAW MATERIALS / INPUTS', ['Clean water', 'Spirulina starter culture', 'Nutrients (Sodium bicarbonate, Urea, etc.)', 'Filtration cloth', 'Packaging material']),
            createSection('INFRASTRUCTURE & REQUIREMENTS', ['Sunlight: 8–10 hours/day', 'Water temp: 25–35°C', 'pH level: 8.5–10', 'Mechanical agitators', 'Drying facility']),
            createSection('CONNECTIVITY', ['Good road connectivity', 'Access to nutraceutical buyers and pharma companies', 'Courier services for online sales']),
            createSection('LABOUR REQUIREMENT', ['1 – 2 trained persons sufficient']),
            createSection('EXPECTED ROI / PROFIT', ['Production: 5–8 kg/month per 300 sq.ft', 'Selling price: ₹800–2000/kg', 'Monthly profit: ₹25k–60k', 'Annual ROI: 40%–80%']),
            createSection('MAINTENANCE', ['Tank cleaning', 'Nutrient monitoring', 'Agitator servicing', 'Monthly cost: ₹2000–5000']),
            createSection('TIME COMMITMENT', ['Initial phase: 4–5 hours/day', 'After stabilization: 1–2 hours/day']),
            createSection('RISKS', ['Water contamination', 'pH imbalance', 'Temp fluctuations', 'Power failure', 'Poor drying quality']),
            createSection('RISK PERCENTAGE', ['Low to Medium']),
            createSection('ENVIRONMENTAL IMPACT', ['Low', 'Minimal water usage', 'Sustainable protein production']),
            createSection('HISTORICAL SUCCESS DATA', ['High growth in demand due to health awareness']),
            createSection('GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', ['MSME (Udyam)', 'FSSAI Registration', 'Local trade license', 'Pollution Board consent (minimal)']),
            createSection('SUITABILITY FIT (FARMER PROFILE)', ['Farmer with small land or rooftop', 'Women entrepreneurs, SHGs', 'Educated youth']),
            createSection('OTHER PRACTICAL INSIGHTS', ['Can be started on rooftop', 'Low water consumption', 'High B2B potential']),
            createSection('FACT TO KNOW', ['Spirulina is one of the most protein-dense foods and yields more protein per square meter than conventional crops.'])
        ],
        shortStats: {
            investment: '₹2L - ₹5L',
            profit: '₹25k - ₹60k/mo'
        }
    },
    '5': {
        id: '5',
        title: 'DAIRY FARMING (6–8 COW UNIT)',
        basicIdea: {
            en: ['Rearing milch cows to produce milk daily', 'Selling to cooperatives or bulk buyers', 'Secondary income from manure and calves'],
            hi: ['दैनिक दूध उत्पादन के लिए दुधारू गायों का पालन', 'सहकारी समितियों या थोक खरीदारों को बेचना', 'खाद और बछड़ों से माध्यमिक आय'],
            mr: ['दैनिक दूध उत्पादनासाठी दुभत्या गायींचे पालन', 'सहकारी संस्था किंवा मोठ्या खरेदीदारांना विक्री', 'खत आणि वासरांपासून दुय्यम उत्पन्न']
        },
        sections: [
            createSection('SOURCE', ['Local Milkman']),
            createSection('SOURCE LOCATION', ['Uruli Devachi, Hadapsar, Pune']),
            createSection('LAND REQUIREMENT', ['4,000 – 6,000 sq.ft (Shed + open area + feed storage)']),
            createSection('INVESTMENT BREAKDOWN (REALISTIC)', ['Total: ₹10 lakh – ₹13 lakh', 'Purchase of 6–8 crossbred cows', 'Cattle shed construction', 'Equipment and initial feed']),
            createSection('RAW MATERIALS / INPUTS', ['Green fodder', 'Dry fodder', 'Cattle concentrate feed', 'Clean water', 'Veterinary medicines']),
            createSection('INFRASTRUCTURE & REQUIREMENTS', ['Proper cattle shed', 'Continuous water supply', 'Electricity', 'Fodder availability', 'Milking equipment', 'Waste management']),
            createSection('CONNECTIVITY', ['Daily access to milk collection center', 'Timely transport is critical']),
            createSection('LABOUR REQUIREMENT', ['1 full-time caretaker', 'Family labour preferred']),
            createSection('EXPECTED PROFIT AND ROI', ['Net monthly profit: ₹20,000 – ₹40,000', 'Annual ROI: 15% – 30%', 'Break-even: 2.5 – 4 years']),
            createSection('MAINTENANCE', ['Daily feeding and cleaning', 'Regular health monitoring', 'Monthly cost: ₹60k–80k (mainly feed)']),
            createSection('TIME AVAILABILITY', ['4 – 6 hours per day', 'Daily physical involvement required']),
            createSection('RISKS', ['Animal diseases', 'Fodder price fluctuations', 'Low milk yield', 'Milk rejection', 'Rising labor costs']),
            createSection('RISK PERCENTAGE', ['Low to Medium']),
            createSection('ENVIRONMENTAL IMPACT', ['Low and positive', 'Cow dung used for manure/biogas']),
            createSection('HISTORICAL SUCCESS DATA', ['Stable livelihood for decades', 'Cooperative model ensures sustainability']),
            createSection('GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', ['Animal Husbandry registration', 'Local NOC', 'FSSAI (if selling packed milk)', 'Dairy cooperative membership']),
            createSection('SUITABILITY FIT (FARMER PROFILE)', ['Best for farmers with own fodder land', 'Farmers with land and capital', 'Not for passive investors']),
            createSection('OTHER PRACTICAL INSIGHTS', ['Feed cost decides profitability', 'Own fodder cultivation improves margins', 'Regular veterinary care prevents losses']),
            createSection('FACT TO KNOW', ['Feed cost accounts for nearly 65–70% of total expenses, making fodder planning critical.'])
        ],
        shortStats: {
            investment: '₹10L - ₹13L',
            profit: '₹20k - ₹40k/mo'
        }
    },
    '6': {
        id: '6',
        title: 'GOAT MILK FARMING (20–25 MILCH GOATS UNIT)',
        basicIdea: {
            en: ['Rearing milch goats for premium milk production', 'Sold to niche markets or direct consumers', 'Income from kid sales'],
            hi: ['प्रीमियम दूध उत्पादन के लिए दुधारू बकरियों का पालन', 'विशेष बाजारों या सीधे उपभोक्ताओं को बिक्री', 'मेमनों की बिक्री से आय'],
            mr: ['प्रीमियम दूध उत्पादनासाठी दुभत्या शेळ्यांचे पालन', 'विशिष्ट बाजारपेठा किंवा थेट ग्राहकांना विक्री', 'करडांच्या विक्रीतून उत्पन्न']
        },
        sections: [
            createSection('SOURCE', ['Ahad Goat Farm']),
            createSection('SOURCE LOCATION', ['Pimpri Chinchwad, Maharashtra']),
            createSection('LAND REQUIREMENT', ['3,000 – 4,500 sq.ft']),
            createSection('INVESTMENT BREAKDOWN (REALISTIC)', ['Total: ₹6.5 lakh – ₹9.5 lakh', 'Goats: ₹3.8L–5.5L', 'Shed: ₹1.8L–2.8L', 'Equipment: ₹30k–50k', 'Initial Feed/Meds: ₹40k–70k']),
            createSection('RAW MATERIALS / INPUTS', ['Green/Dry fodder, Tree leaves, Concentrate feed, Medicines']),
            createSection('INFRASTRUCTURE & REQUIREMENTS', ['Raised shed (GI roof)', 'Water supply', 'Electricity', 'Kidding space']),
            createSection('CONNECTIVITY', ['Proximity to premium customers or Ayurvedic buyers']),
            createSection('LABOUR REQUIREMENT', ['1 full-time caretaker', 'Family labour preferred']),
            createSection('EXPECTED PROFIT AND ROI', ['Milk yield: 1.5–2 L/day', 'Selling price: ₹80–120/L', 'Monthly profit: ₹30k–60k', 'Annual ROI: 30%–45%']),
            createSection('MAINTENANCE', ['Daily feeding/cleaning', 'Health monitoring', 'Monthly cost: ₹20k–30k']),
            createSection('TIME AVAILABILITY', ['3 – 4 hours per day']),
            createSection('RISKS', ['Diseases (PPR, Mastitis)', 'Inconsistent yield', 'Lack of organized market']),
            createSection('RISK PERCENTAGE', ['Medium to High']),
            createSection('ENVIRONMENTAL IMPACT', ['Low', 'Lower water footprint than cows']),
            createSection('HISTORICAL SUCCESS DATA', ['Growing niche sector', 'Rising demand in health markets']),
            createSection('GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', ['Animal Husbandry registration', 'Local NOC', 'FSSAI (if packaged)', 'Trade license']),
            createSection('SUITABILITY FIT (FARMER PROFILE)', ['Farmers near cities', 'Farmers comfortable with direct selling']),
            createSection('OTHER PRACTICAL INSIGHTS', ['Profitability depends on selling price', 'Direct-to-consumer is best']),
            createSection('FACT TO KNOW', ['Goat milk is easier to digest and commands a premium price from health-conscious buyers.'])
        ],
        shortStats: {
            investment: '₹6.5L - ₹9.5L',
            profit: '₹30k - ₹60k/mo'
        }
    },
    '7': {
        id: '7',
        title: 'MUSHROOM FARMING (OYSTER)',
        basicIdea: {
            en: ['Indoor cultivation using agricultural waste', 'Grown in controlled rooms/sheds', 'Sold fresh to local markets/hotels'],
            hi: ['कृषि कचरे का उपयोग करके इनडोर खेती', 'नियंत्रित कमरों/शेड में उगाया जाता है', 'स्थानीय बाजारों/होटलों में ताजा बेचा जाता है'],
            mr: ['शेती कचऱ्याचा वापर करून इनडोअर लागवड', 'नियंत्रित खोल्या/शेडमध्ये वाढवले जाते', 'स्थानिक बाजारपेठा/हॉटेल्समध्ये ताजे विकले जाते']
        },
        sections: [
            createSection('SOURCE', ['Krushi Vigyan Kendra (KVK)']),
            createSection('SOURCE LOCATION', ['Baramati']),
            createSection('LAND REQUIREMENT', ['500 – 1,000 sq.ft (Closed shed/room)']),
            createSection('INVESTMENT BREAKDOWN (REALISTIC)', ['Total: ₹1.8 lakh – ₹3.0 lakh', 'Shed/Room: ₹70k–1.2L', 'Racks: ₹30k–50k', 'Spawn/Consumables: ₹25k–40k', 'Humidity equipment: ₹20k–40k']),
            createSection('RAW MATERIALS / INPUTS', ['Spawn, Wheat/Paddy straw, Lime/Formalin, Polythene bags']),
            createSection('INFRASTRUCTURE & REQUIREMENTS', ['Clean indoor space', 'Temp: 20–30°C', 'Humidity: 70–85%', 'Ventilation']),
            createSection('CONNECTIVITY', ['Access to vegetable markets and hotels (short shelf life)']),
            createSection('LABOUR REQUIREMENT', ['1 person sufficient', 'Family labour preferred']),
            createSection('EXPECTED PROFIT AND ROI', ['Production: 600–1000 kg/year', 'Selling price: ₹120–200/kg', 'Monthly profit: ₹15k–35k', 'ROI: 30%–50%']),
            createSection('MAINTENANCE', ['Daily spraying/humidity control', 'Hygiene maintenance', 'Monthly cost: ₹3000–6000']),
            createSection('TIME AVAILABILITY', ['2 – 3 hours per day']),
            createSection('RISKS', ['Contamination', 'Temperature fluctuations', 'Short shelf life']),
            createSection('RISK PERCENTAGE', ['Medium']),
            createSection('ENVIRONMENTAL IMPACT', ['Very low', 'Uses waste']),
            createSection('HISTORICAL SUCCESS DATA', ['Steady expansion', 'Popular for low investment']),
            createSection('GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', ['MSME Registration', 'Local trade license', 'FSSAI (if processed)']),
            createSection('SUITABILITY FIT (FARMER PROFILE)', ['Farmers with limited land', 'SHGs, women entrepreneurs', 'Part-time seekers']),
            createSection('OTHER PRACTICAL INSIGHTS', ['Hygiene prevents losses', 'Direct selling improves margins']),
            createSection('FACT TO KNOW', ['Oyster mushrooms complete a cycle in 30–40 days, allowing multiple harvests per year.'])
        ],
        shortStats: {
            investment: '₹1.8L - ₹3L',
            profit: '₹15k - ₹35k/mo'
        }
    },
    '8': {
        id: '8',
        title: 'POULTRY FARMING (BROILER – 1,000 BIRDS)',
        basicIdea: {
            en: ['Raising broiler chickens for meat', 'Batch cycles of 35–45 days', 'Sell live birds to traders/integrators'],
            hi: ['मांस के लिए ब्रॉयलर मुर्गियां पालना', '35-45 दिनों का बैच चक्र', 'व्यापारियों/एकीकृतकर्ताओं को जीवित पक्षी बेचना'],
            mr: ['मांसासाठी ब्रॉयलर कोंबड्या पाळणे', '35-45 दिवसांचे बॅच चक्र', 'व्यापारी/इंटिग्रेटर्सना जिवंत पक्षी विकणे']
        },
        sections: [
            createSection('SOURCE', ['Nature’s Best Poultry Farm']),
            createSection('SOURCE LOCATION', ['Talegaon Dabhade / Hadapsar, Pune']),
            createSection('LAND REQUIREMENT', ['3,000 – 4,000 sq.ft']),
            createSection('INVESTMENT BREAKDOWN (REALISTIC)', ['Total: ₹6.5 lakh – ₹8.5 lakh', 'Shed: ₹3.0L–4.0L', 'Chicks: ₹40k–55k', 'Equipment: ₹60k–90k', 'Feed: ₹1.6L–2.0L']),
            createSection('RAW MATERIALS / INPUTS', ['Day-old chicks, Feed, Water, Vaccines, Litter material']),
            createSection('INFRASTRUCTURE & REQUIREMENTS', ['Well-ventilated shed', 'Electricity', 'Temp control (brooding)', 'Biosecurity']),
            createSection('CONNECTIVITY', ['Access to feed suppliers and markets', 'Integrator routes']),
            createSection('LABOUR REQUIREMENT', ['1 person sufficient', 'Family labour preferred']),
            createSection('EXPECTED PROFIT AND ROI', ['Profit/cycle: ₹40k–70k', 'Annual profit: ₹2.0L–3.5L', 'ROI: 30%–45%']),
            createSection('MAINTENANCE', ['Feeding/Watering', 'Litter management', 'Monthly cost: ₹20k–30k']),
            createSection('TIME AVAILABILITY', ['3 – 4 hours per day']),
            createSection('RISKS', ['Disease (CRD, IBD)', 'Heat stress', 'Feed price fluctuations']),
            createSection('RISK PERCENTAGE', ['Medium to High']),
            createSection('ENVIRONMENTAL IMPACT', ['Moderate', 'Litter/Odour management needed']),
            createSection('HISTORICAL SUCCESS DATA', ['Rapid expansion', 'Profit dependent on feed prices']),
            createSection('GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', ['Animal Husbandry reg', 'Local NOC', 'Pollution Board consent (large units)']),
            createSection('SUITABILITY FIT (FARMER PROFILE)', ['Farmers with land/capital', 'Daily management capability']),
            createSection('OTHER PRACTICAL INSIGHTS', ['Contract farming reduces risk', 'Summer management is critical']),
            createSection('FACT TO KNOW', ['Feed cost is 65–70% of total cost, making price the key factor.'])
        ],
        shortStats: {
            investment: '₹6.5L - ₹8.5L',
            profit: '₹40k - ₹70k/cycle'
        }
    },
    '9': {
        id: '9',
        title: 'VERMICOMPOST PRODUCTION',
        basicIdea: {
            en: ['Production of organic manure using earthworms', 'Converts cow dung/waste to fertilizer', 'Sold to farmers/nurseries'],
            hi: ['केंचुओं का उपयोग करके जैविक खाद का उत्पादन', 'गाय के गोबर/कचरे को खाद में बदलता है', 'किसानों/नर्सरी को बेचा जाता है'],
            mr: ['गांडुळांचा वापर करून सेंद्रिय खताचे उत्पादन', 'शेण/कचऱ्याचे खतात रूपांतर', 'शेतकरी/नर्सरींना विक्री']
        },
        sections: [
            createSection('SOURCE', ['Agrostar India']),
            createSection('SOURCE LOCATION', ['Junnar, Maharashtra']),
            createSection('LAND REQUIREMENT', ['1,000 – 2,000 sq.ft (Shaded area)']),
            createSection('INVESTMENT BREAKDOWN (REALISTIC)', ['Total: ₹80,000 – ₹1.5 lakh', 'Beds/Pits: ₹30k–60k', 'Worms: ₹10k–20k', 'Tools/Shed: ₹25k–40k']),
            createSection('RAW MATERIALS / INPUTS', ['Cow dung, Crop waste, Earthworms, Water, Bags']),
            createSection('INFRASTRUCTURE & REQUIREMENTS', ['Shade, Water supply', 'Moisture maintenance', 'Pest protection']),
            createSection('CONNECTIVITY', ['Access to farmers and nurseries']),
            createSection('LABOUR REQUIREMENT', ['Very low (1 person)']),
            createSection('EXPECTED PROFIT AND ROI', ['Production: 2–3 tons/cycle', 'Profit: ₹8k–20k/month', 'ROI: 25%–40%']),
            createSection('MAINTENANCE', ['Watering, Bed turning', 'Monthly cost: ₹1000–3000']),
            createSection('TIME AVAILABILITY', ['1 – 2 hours per day']),
            createSection('RISKS', ['Heat/Rain damage', 'Poor moisture control', 'Low local demand']),
            createSection('RISK PERCENTAGE', ['Low to Medium']),
            createSection('ENVIRONMENTAL IMPACT', ['Very positive', 'Waste to wealth']),
            createSection('HISTORICAL SUCCESS DATA', ['Successful for 20+ years', 'Driven by organic farming']),
            createSection('GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', ['MSME Registration', 'Local trade license']),
            createSection('SUITABILITY FIT (FARMER PROFILE)', ['Farmers with cow dung access', 'Small farmers/SHGs']),
            createSection('OTHER PRACTICAL INSIGHTS', ['Consistent quality builds trust', 'Direct selling improves margins']),
            createSection('FACT TO KNOW', ['1 ton of vermicompost significantly improves soil structure.'])
        ],
        shortStats: {
            investment: '₹80k - ₹1.5L',
            profit: '₹8k - ₹20k/mo'
        }
    },
    '10': {
        id: '10',
        title: 'PLANT NURSERY',
        basicIdea: {
            en: ['Raising saplings from seeds/cuttings', 'Sold to farmers/gardeners', 'Seasonal business'],
            hi: ['बीज/कलमों से पौधे तैयार करना', 'किसानों/बागवानों को बेचना', 'मौसमी व्यवसाय'],
            mr: ['बियाणे/कलमांपासून रोपे तयार करणे', 'शेतकरी/बागकाम करणाऱ्यांना विक्री', 'हंगामी व्यवसाय']
        },
        sections: [
            createSection('SOURCE', ['Wagh Nursery']),
            createSection('SOURCE LOCATION', ['Manjri, Pune']),
            createSection('LAND REQUIREMENT', ['3,000 – 6,000 sq.ft']),
            createSection('INVESTMENT BREAKDOWN (REALISTIC)', ['Total: ₹3.5 lakh – ₹6.0 lakh', 'Shade net: ₹1.5L–2.5L', 'Water system: ₹40k–70k', 'Inputs: ₹40k–70k']),
            createSection('RAW MATERIALS / INPUTS', ['Seeds, Cocopeat, Bags, Trays, Water, Fertilizers']),
            createSection('INFRASTRUCTURE & REQUIREMENTS', ['Shade-net, Drainage', 'Pest management knowledge']),
            createSection('CONNECTIVITY', ['Access to farmers/gardeners']),
            createSection('LABOUR REQUIREMENT', ['1 skilled person full-time']),
            createSection('EXPECTED PROFIT AND ROI', ['Profit: ₹1.5L–3.0L/year', 'ROI: 25%–40%']),
            createSection('MAINTENANCE', ['Watering, Weeding', 'Monthly cost: ₹5000–10000']),
            createSection('TIME AVAILABILITY', ['3 – 4 hours per day']),
            createSection('RISKS', ['Plant mortality', 'Unsold stock', 'Price competition']),
            createSection('RISK PERCENTAGE', ['Medium to High']),
            createSection('ENVIRONMENTAL IMPACT', ['Positive']),
            createSection('HISTORICAL SUCCESS DATA', ['Successful for decades', 'Success depends on quality']),
            createSection('GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', ['MSME Registration', 'Local trade license', 'Horticulture registration']),
            createSection('SUITABILITY FIT (FARMER PROFILE)', ['Farmers with land/water', 'Entrepreneurs with horticulture skills']),
            createSection('OTHER PRACTICAL INSIGHTS', ['Quality decides repeat orders', 'Tie-ups help stability']),
            createSection('FACT TO KNOW', ['Saplings sold by count give better value per sq.ft than field crops.'])
        ],
        shortStats: {
            investment: '₹3.5L - ₹6L',
            profit: '₹1.5L - ₹3L/yr'
        }
    },
    '11': {
        id: '11',
        title: 'COW DUNG ORGANIC MANURE & BIO-INPUTS',
        basicIdea: {
            en: ['Processing cow dung into manure/compost', 'Bio-inputs like Jeevamrut', 'Sold to organic farmers'],
            hi: ['गाय के गोबर को खाद/कम्पोस्ट में संसाधित करना', 'जीवामृत जैसे जैव-इनपुट', 'जैविक किसानों को बेचना'],
            mr: ['शेणाचे खत/कंपोस्टमध्ये प्रक्रिया करणे', 'जीवामृत सारखे जैव-इनपुट्स', 'सेंद्रिय शेतकऱ्यांना विक्री']
        },
        sections: [
            createSection('SOURCE', ['Greenaria research']),
            createSection('SOURCE LOCATION', ['Online']),
            createSection('LAND REQUIREMENT', ['1,500 – 3,000 sq.ft']),
            createSection('INVESTMENT BREAKDOWN (REALISTIC)', ['Total: ₹1.2 lakh – ₹2.5 lakh', 'Beds/Platforms: ₹30k–60k', 'Shed: ₹30k–60k', 'Tools/Drums: ₹20k–40k']),
            createSection('RAW MATERIALS / INPUTS', ['Cow dung, Urine, Jaggery, Pulse flour, Water']),
            createSection('INFRASTRUCTURE & REQUIREMENTS', ['Dung supply, Water, Mixing space']),
            createSection('CONNECTIVITY', ['Access to organic farmers/stores']),
            createSection('LABOUR REQUIREMENT', ['1 person sufficient']),
            createSection('EXPECTED PROFIT AND ROI', ['Profit: ₹15k–35k/month', 'ROI: 30%–45%']),
            createSection('MAINTENANCE', ['Turning compost, Moisture control', 'Monthly cost: ₹2000–4000']),
            createSection('TIME AVAILABILITY', ['1 – 2 hours per day']),
            createSection('RISKS', ['Low local demand', 'Improper fermentation']),
            createSection('RISK PERCENTAGE', ['Low to Medium']),
            createSection('ENVIRONMENTAL IMPACT', ['Very positive']),
            createSection('HISTORICAL SUCCESS DATA', ['Growth due to organic farming']),
            createSection('GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', ['MSME Registration', 'Local trade license']),
            createSection('SUITABILITY FIT (FARMER PROFILE)', ['Farmers with cows/gaushala access']),
            createSection('OTHER PRACTICAL INSIGHTS', ['Link with dairy/gaushala for best margins', 'Branding improves price']),
            createSection('FACT TO KNOW', ['Bio-inputs sell on trust/results.'])
        ],
        shortStats: {
            investment: '₹1.2L - ₹2.5L',
            profit: '₹15k - ₹35k/mo'
        }
    },
    '12': {
        id: '12',
        title: 'COW DUNG PRODUCTS (DHOOP, DIYAS)',
        basicIdea: {
            en: ['Manufacturing value-added products (dhoop, diyas, logs)', 'Eco-friendly/Religious use'],
            hi: ['मूल्य वर्धित उत्पादों (धूप, दीया, लकड़ी) का निर्माण', 'पर्यावरण के अनुकूल/धार्मिक उपयोग'],
            mr: ['मूल्यवर्धित उत्पादनांचे (धूप, दिवे, लाकडे) उत्पादन', 'पर्यावरणपूरक/धार्मिक वापर']
        },
        sections: [
            createSection('SOURCE', ['Greenaria research']),
            createSection('SOURCE LOCATION', ['Online']),
            createSection('LAND REQUIREMENT', ['800 – 1,500 sq.ft (Drying/Storage)']),
            createSection('INVESTMENT BREAKDOWN (REALISTIC)', ['Total: ₹1.5 lakh – ₹3.0 lakh', 'Shed/Drying: ₹40k–80k', 'Moulds/Tools: ₹20k–70k']),
            createSection('RAW MATERIALS / INPUTS', ['Cow dung, Herbs, Binders, Packaging']),
            createSection('INFRASTRUCTURE & REQUIREMENTS', ['Drying space, Moulds, Storage']),
            createSection('CONNECTIVITY', ['Local markets, Temples, Exhibitions']),
            createSection('LABOUR REQUIREMENT', ['1–2 persons (Women SHGs suitable)']),
            createSection('EXPECTED PROFIT AND ROI', ['Profit: ₹20k–50k/month', 'ROI: 35%–60%']),
            createSection('MAINTENANCE', ['Cleaning moulds, Drying supervision', 'Monthly cost: ₹2000–5000']),
            createSection('TIME AVAILABILITY', ['2 – 3 hours per day']),
            createSection('RISKS', ['Seasonal demand', 'Moisture damage']),
            createSection('RISK PERCENTAGE', ['Low to Medium']),
            createSection('ENVIRONMENTAL IMPACT', ['Highly positive']),
            createSection('HISTORICAL SUCCESS DATA', ['Rapid growth post-2020']),
            createSection('GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', ['MSME Registration', 'Local trade license']),
            createSection('SUITABILITY FIT (FARMER PROFILE)', ['Women SHGs, Rural entrepreneurs']),
            createSection('OTHER PRACTICAL INSIGHTS', ['Marketing/Packaging matters most', 'Festival planning boosts sales']),
            createSection('FACT TO KNOW', ['Gained popularity due to eco-product campaigns.'])
        ],
        shortStats: {
            investment: '₹1.5L - ₹3L',
            profit: '₹20k - ₹50k/mo'
        }
    },
    '13': {
        id: '13',
        title: 'LEAF PLATE (DONA–PATTAL) MANUFACTURING',
        basicIdea: {
            en: ['Making disposable plates from leaves', 'Semi-automatic process', 'Eco-friendly alternative to plastic'],
            hi: ['पत्तों से डिस्पोजेबल प्लेट बनाना', 'अर्ध-स्वचालित प्रक्रिया', 'प्लास्टिक का पर्यावरण के अनुकूल विकल्प'],
            mr: ['पानांपासून डिस्पोजेबल प्लेट्स बनवणे', 'अर्ध-स्वयंचलित प्रक्रिया', 'प्लास्टिकला पर्यावरणपूरक पर्याय']
        },
        sections: [
            createSection('SOURCE', ['Karnataka Govt report']),
            createSection('SOURCE LOCATION', ['Online']),
            createSection('LAND REQUIREMENT', ['300 – 500 sq.ft']),
            createSection('INVESTMENT BREAKDOWN (REALISTIC)', ['Total: ₹2.5 lakh – ₹4.0 lakh', 'Machine: ₹1.6L–2.5L', 'Electrical/Shed: ₹30k–50k', 'Leaves: ₹30k–50k']),
            createSection('RAW MATERIALS / INPUTS', ['Sal/Areca leaves, Water, Packaging']),
            createSection('INFRASTRUCTURE & REQUIREMENTS', ['Electricity, Machine, Storage']),
            createSection('CONNECTIVITY', ['Access to caterers, temples, wholesalers']),
            createSection('LABOUR REQUIREMENT', ['1–2 persons']),
            createSection('EXPECTED PROFIT AND ROI', ['Profit: ₹25k–60k/month', 'ROI: 30%–45%']),
            createSection('MAINTENANCE', ['Machine servicing', 'Monthly cost: ₹2000–4000']),
            createSection('TIME AVAILABILITY', ['3 – 4 hours per day']),
            createSection('RISKS', ['Seasonal demand', 'Raw material availability', 'Breakdowns']),
            createSection('RISK PERCENTAGE', ['Medium']),
            createSection('ENVIRONMENTAL IMPACT', ['Very positive']),
            createSection('HISTORICAL SUCCESS DATA', ['Strong growth due to plastic bans']),
            createSection('GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', ['MSME Registration', 'Local trade license']),
            createSection('SUITABILITY FIT (FARMER PROFILE)', ['Landless farmers, SHGs, Rural entrepreneurs']),
            createSection('OTHER PRACTICAL INSIGHTS', ['Bulk orders give stability', 'Location near buyers reduces cost']),
            createSection('FACT TO KNOW', ['One machine can make 6000–8000 plates/day.'])
        ],
        shortStats: {
            investment: '₹2.5L - ₹4L',
            profit: '₹25k - ₹60k/mo'
        }
    },
    '14': {
        id: '14',
        title: 'AGRI-INPUT TRADING',
        basicIdea: {
            en: ['Retail shop for seeds, fertilizer, pesticides', 'Serves local farmers'],
            hi: ['बीज, खाद, कीटनाशकों की खुदरा दुकान', 'स्थानीय किसानों की सेवा'],
            mr: ['बियाणे, खते, कीटकनाशकांचे किरकोळ दुकान', 'स्थानिक शेतकऱ्यांची सेवा']
        },
        sections: [
            createSection('SOURCE', ['Shree Gurudatta Sheti Bhandar']),
            createSection('SOURCE LOCATION', ['Wagholi, Pune']),
            createSection('LAND REQUIREMENT', ['150 – 300 sq.ft (Rented Shop)']),
            createSection('INVESTMENT BREAKDOWN (REALISTIC)', ['Total: ₹3.0 lakh – ₹6.0 lakh', 'Setup: ₹60k–1.2L', 'Stock: ₹2.0L–4.0L']),
            createSection('RAW MATERIALS / INPUTS', ['Seeds, Fertilizers, Pesticides']),
            createSection('INFRASTRUCTURE & REQUIREMENTS', ['License, Racks, Knowledge']),
            createSection('CONNECTIVITY', ['Strong farmer footfall essential']),
            createSection('LABOUR REQUIREMENT', ['1 person sufficient']),
            createSection('EXPECTED PROFIT AND ROI', ['Profit: ₹20k–50k/month', 'ROI: 25%–40%']),
            createSection('MAINTENANCE', ['Stock rotation', 'Monthly cost: ₹3000–6000']),
            createSection('TIME AVAILABILITY', ['5 – 6 hours per day']),
            createSection('RISKS', ['Credit sales', 'Stock expiry', 'Regulations']),
            createSection('RISK PERCENTAGE', ['Low to Medium']),
            createSection('ENVIRONMENTAL IMPACT', ['Neutral']),
            createSection('HISTORICAL SUCCESS DATA', ['Stable demand']),
            createSection('GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', ['Agriculture input dealer license', 'GST', 'Trade license']),
            createSection('SUITABILITY FIT (FARMER PROFILE)', ['Entrepreneurs with farmer connections']),
            createSection('OTHER PRACTICAL INSIGHTS', ['Credit control is critical', 'Trust builds customers']),
            createSection('FACT TO KNOW', ['Many agri-input shops fail not due to low sales but due to poor credit recovery and expired inventory management.'])
        ],
        shortStats: {
            investment: '₹3L - ₹6L',
            profit: '₹20k - ₹50k/mo'
        }
    },
    '15': {
        id: '15',
        title: 'INLAND FISH FARMING (POND-BASED)',
        basicIdea: {
            en: ['Raising fish (Carp/Tilapia) in ponds', 'Harvest after 6–8 months', 'Sells fresh fish'],
            hi: ['तालाबों में मछली (कार्प/तिलापिया) पालन', '6-8 महीने बाद कटाई', 'ताजी मछली बेचना'],
            mr: ['तलावांमध्ये मासे (कार्प/तिलापिया) पाळणे', '6-8 महिन्यांनंतर काढणी', 'ताजे मासे विकणे']
        },
        sections: [
            createSection('SOURCE', ['NCDC Report']),
            createSection('SOURCE LOCATION', ['Government website']),
            createSection('LAND REQUIREMENT', ['0.5 – 1 acre water area']),
            createSection('INVESTMENT BREAKDOWN (REALISTIC)', ['Total: ₹3.5 lakh – ₹6.0 lakh', 'Pond prep: ₹40k–70k', 'Fingerlings: ₹30k–60k', 'Feed: ₹1.5L–2.5L']),
            createSection('RAW MATERIALS / INPUTS', ['Fingerlings, Feed, Lime, Medicines']),
            createSection('INFRASTRUCTURE & REQUIREMENTS', ['Water availability', 'Pond management']),
            createSection('CONNECTIVITY', ['Access to fish markets/traders']),
            createSection('LABOUR REQUIREMENT', ['1 person sufficient']),
            createSection('EXPECTED PROFIT AND ROI', ['Profit/cycle: ₹1.2L–2.5L', 'ROI: 30%–45%']),
            createSection('MAINTENANCE', ['Feeding, Water monitoring', 'Monthly cost: ₹8000–15000']),
            createSection('TIME AVAILABILITY', ['2 – 3 hours per day']),
            createSection('RISKS', ['Mortality', 'Theft', 'Market prices']),
            createSection('RISK PERCENTAGE', ['Medium']),
            createSection('ENVIRONMENTAL IMPACT', ['Low']),
            createSection('HISTORICAL SUCCESS DATA', ['Viable in villages with ponds']),
            createSection('GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', ['Fisheries Dept registration', 'Pond lease', 'Local NOC']),
            createSection('SUITABILITY FIT (FARMER PROFILE)', ['Farmers with pond access', 'Willing to wait for returns']),
            createSection('OTHER PRACTICAL INSIGHTS', ['Group guarding reduces theft', 'Collective selling helps']),
            createSection('FACT TO KNOW', ['Efficient food production system.'])
        ],
        shortStats: {
            investment: '₹3.5L - ₹6L',
            profit: '₹1.2L - ₹2.5L/cycle'
        }
    }
};
