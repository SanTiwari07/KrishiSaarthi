export interface BusinessSection {
    title: string;
    content: string[];
}

export interface BusinessDetail {
    id: string;
    title: string;
    basicIdea: string[];
    sections: BusinessSection[];
    shortStats?: {
        investment: string;
        profit: string;
    };
}

export const BUSINESS_DETAILS: Record<string, BusinessDetail> = {
    '1': {
        id: '1',
        title: 'FLOWER PLANTATION (GERBERA)',
        basicIdea: [
            'Commercial cultivation of Gerbera flowers inside a controlled greenhouse',
            'Focus on high-quality cut flowers for wholesale markets, decorators, and exporters'
        ],
        sections: [
            { title: 'SOURCE', content: ['Tilekar Family'] },
            { title: 'SOURCE LOCATION', content: ['Dive, Purandar District, Maharashtra'] },
            {
                title: 'LOCATION SUITABILITY',
                content: ['Semi-arid to moderate climate', 'Areas with assured water supply', 'Proximity to Pune flower markets and highways is a major advantage']
            },
            { title: 'LAND REQUIREMENT', content: ['Minimum: 0.5 acre', 'Ideal: 1 acre (economies of scale work better at 1 acre)'] },
            {
                title: 'INVESTMENT BREAKDOWN (REALISTIC)',
                content: [
                    'Greenhouse construction (GI structure + poly film): ₹90 lakh – ₹1 crore',
                    'Raw materials and initial inputs: ₹10–15 lakh',
                    'Total initial investment (before subsidy): ₹1.0 – 1.15 crore',
                    'Government subsidy: Up to 50% (released in phases after completion and inspection)',
                    'Important note: Farmer must arrange full capital upfront'
                ]
            },
            {
                title: 'RAW MATERIALS / INPUTS',
                content: ['Red lateritic soil (preferred for drainage)', 'Tissue cultured Gerbera plantlets', 'Fertilizers (stage-wise): NPK, Calcium Nitrate, Bio-fertilizers', 'Plant protection chemicals']
            },
            {
                title: 'INFRASTRUCTURE & REQUIREMENTS',
                content: ['Greenhouse with GI frame', 'UV-stabilized polyethylene film', 'Drip irrigation system', 'Water requirement: 500–700 ml per plant per day', 'Proper ventilation and humidity control']
            },
            {
                title: 'CONNECTIVITY',
                content: ['Strong local flower market access', 'Good road connectivity to: Pune city, State highways, National highways (for overnight transport)']
            },
            { title: 'LABOUR REQUIREMENT', content: ['1–2 skilled labourers sufficient for 1 acre greenhouse', 'Skilled supervision required, especially during flowering and harvesting'] },
            {
                title: 'OPERATING & MAINTENANCE COST',
                content: ['Fertilizers and plant protection chemicals', 'Electricity for pumps and automation', 'Greenhouse maintenance: GI structure inspection, Polyethylene film replacement (every few years)']
            },
            { title: 'EXPECTED INCOME', content: ['Regular daily flower harvest once plants mature', 'Stable demand from: Florists, Event planners, Wholesale mandis'] },
            { title: 'PROFIT MARGIN & ROI', content: ['Break-even period: Around 6 months after full production', 'Reported ROI: Around 226% (with good management and stable pricing)'] },
            { title: 'TIME COMMITMENT', content: ['Initial phase: Full-time involvement required', 'After stabilization: 4–5 hours per day for monitoring and management'] },
            {
                title: 'RISKS',
                content: ['Pest infestations', 'Disease outbreaks', 'Nematode damage', 'Nutrient deficiencies', 'Climate sensitivity', 'Water management imbalance', 'Soil quality issues', 'Very high initial investment', 'Flower price fluctuations', 'Perishability and logistics challenges', 'Lack of skilled manpower']
            },
            { title: 'RISK LEVEL', content: ['Medium to High'] },
            { title: 'ENVIRONMENTAL IMPACT', content: ['Low', 'Efficient water use through drip irrigation', 'Limited land requirement'] },
            { title: 'HISTORICAL SUCCESS DATA', content: ['Proven high benefit–cost ratio in Maharashtra', '₹2.24 – ₹2.96 return per ₹1 invested under proper management'] },
            {
                title: 'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED',
                content: ['Farmer registration with State Agriculture Department', 'Greenhouse subsidy approval under: MIDH (Mission for Integrated Development of Horticulture)', 'Land ownership or lease documents', 'Bank loan sanction (if financed)', 'Electricity connection approval', 'Local Gram Panchayat NOC (if required)']
            },
            {
                title: 'SUITABILITY FIT (FARMER PROFILE)',
                content: ['Best suited for: Farmer with land and good capital, Farmers ready for high-risk, high-return ventures, Educated youth farmers willing to adopt technology', 'Not suitable for: Farmers with no land, Farmers with low capital and no access to loans']
            },
            {
                title: 'OTHER PRACTICAL INSIGHTS',
                content: ['Cash flow planning is critical because subsidy is delayed', 'Market tie-ups should be secured before first harvest', 'Skilled crop management makes a huge difference in quality and price', 'Insurance for greenhouse structure is highly recommended']
            },
            { title: 'FACT TO KNOW', content: ['Gerbera flowers can be harvested almost daily for 2–3 years from a single planting cycle, making it one of the most intensive and cash-generating floriculture crops when managed correctly.'] }
        ],
        shortStats: {
            investment: '₹1 Cr – ₹1.15 Cr',
            profit: '226% ROI'
        }
    },
    '2': {
        id: '2',
        title: 'PACKAGED DRINKING WATER BUSINESS',
        basicIdea: ['Purification, bottling, and packaging of drinking water', 'Uses RO + UV technology', 'Supplies to retail shops, hotels, offices, events, and bulk buyers'],
        sections: [
            { title: 'SOURCE', content: ['Aria Foods and Beverages'] },
            { title: 'SOURCE LOCATION', content: ['Hadapsar Industrial Area, Pune'] },
            { title: 'LOCATION SUITABILITY', content: ['Industrial or semi-urban area', 'Near hotels, housing complexes, offices, event zones', 'Easy access to city or crowded areas for faster distribution'] },
            { title: 'LAND REQUIREMENT', content: ['Minimum: 0.25–0.5 acre (10–20 guntha)', 'Area breakup: 3 guntha: machinery section; 2–3 guntha: office + lab; 5 guntha: storage, water tanks, generator'] },
            {
                title: 'INVESTMENT BREAKDOWN (REALISTIC)',
                content: ['Basic shed / warehouse / office setup: ₹5–6 lakh', 'Storage tanks + generator / inverter: ₹5 lakh', 'RO + UV water purifier (500–1000 LPH): ₹1.5–2 lakh', 'Higher capacity purifier (4000–5000 LPH): ₹8–9 lakh', 'Packaging options: a) Basic water packaging unit: ₹1.8 lakh; b) Complete unit with bottle manufacturing: ₹6–7 lakh']
            },
            { title: 'RAW MATERIALS / INPUTS', content: ['Borewell water (preferred)', 'Tanker water (if borewell not available)', 'Plastic granules (if bottle manufacturing is done in-house)', 'OR ready-made plastic bottles', 'Labels, caps, sealing material'] },
            { title: 'INFRASTRUCTURE & REQUIREMENTS', content: ['RO + UV purification system', 'Bottling and sealing machines', 'Laboratory space for water testing', 'Electricity requirement: 6–10 kW per hour', 'Three-phase connection required for higher capacity plants'] },
            { title: 'CONNECTIVITY', content: ['Nearby hotels, shops, complexes, offices', 'Easy truck and tempo movement', 'Good road connectivity to city and commercial zones'] },
            { title: 'LABOUR REQUIREMENT', content: ['3–4 labourers for automated units', 'More labour needed if basic manual packaging unit is used', 'One trained supervisor recommended'] },
            { title: 'EXPECTED INCOME', content: ['1 L bottles: Cost ₹40–45/box, Sell ₹80–90', '200 ml bottles: Cost ₹80–90/box, Sell ₹150'] },
            { title: 'PROFIT MARGIN & ROI', content: ['Margin depends on machine utilization', 'Higher utilization = higher profit', 'ROI improves significantly with bulk B2B contracts'] },
            { title: 'TIME COMMITMENT', content: ['Initial phase: 6–7 hours per day', 'After stabilization: 1–3 hours per day'] },
            { title: 'RISKS', content: ['Groundwater depletion concerns', 'Reduced margins if machine capacity is underutilized', 'Labour handling challenges', 'Tough competition from established brands', 'Local brand trust building takes time'] },
            { title: 'RISK LEVEL', content: ['Medium to High'] },
            { title: 'ENVIRONMENTAL IMPACT', content: ['Medium to High', 'Plastic waste generation is a major concern', 'Water resource management is critical'] },
            { title: 'HISTORICAL SUCCESS DATA', content: ['Strong growth over the last decade', 'Consistent demand in urban and semi-urban areas'] },
            { title: 'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', content: ['BIS Certification (IS 14543)', 'FSSAI Registration / License', 'Local Municipal Corporation / Gram Panchayat trade license', 'Groundwater extraction permission', 'Pollution Control Board consent', 'Electricity department approval', 'GST registration'] },
            { title: 'SUITABILITY FIT (FARMER PROFILE)', content: ['Best suited for: Farmer with no land but good capital, Farmer with land and good capital, Entrepreneurs near cities', 'Not suitable for: Farmers with no capital, Remote village farmers without market access'] },
            { title: 'OTHER PRACTICAL INSIGHTS', content: ['BIS approval is time-consuming', 'B2B contracts provide stability', 'Transport cost affects margins', 'Plastic recycling tie-ups improve brand image'] },
            { title: 'FACT TO KNOW', content: ['Profits are not made from purification technology alone but from logistics efficiency, bulk contracts, and consistent repeat customers.'] }
        ],
        shortStats: {
            investment: '₹5L - ₹9L',
            profit: 'Volume Based'
        }
    },
    '3': {
        id: '3',
        title: 'AMUL FRANCHISE BUSINESS',
        basicIdea: ['Retail sale of Amul milk and dairy products', 'Products include milk, curd, butter, cheese, ice-cream', 'Operates under the cooperative model of GCMMF (Amul)'],
        sections: [
            { title: 'SOURCE', content: ['Gujarat Cooperative Milk Marketing Federation (GCMMF) – Amul'] },
            { title: 'LOCATION', content: ['Urban, semi-urban, or high-footfall rural market areas', 'Residential colonies, near schools, offices, hospitals'] },
            { title: 'LOCATION SUITABILITY', content: ['Areas with daily consumer movement', 'High pedestrian traffic', 'Visibility from main road is critical'] },
            { title: 'LAND REQUIREMENT', content: ['100 – 300 sq.ft prebuilt shop or kiosk'] },
            {
                title: 'INVESTMENT BREAKDOWN (REALISTIC)',
                content: ['Total investment: ₹1.5 lakh – ₹6 lakh', 'Shop construction (if land available): ₹1.5 – ₹2 lakh', 'Rented shop option: Rent ₹20k–50k', 'Amul Preferred Outlet: ~₹2 lakh', 'Amul Ice-Cream Scooping Parlour: ~₹6 lakh', 'No franchise fee, No royalty']
            },
            { title: 'RAW MATERIALS / INPUTS', content: ['Milk, curd, butter, cheese, ice-creams', 'Supplied directly by Amul wholesale distributors'] },
            { title: 'INFRASTRUCTURE & REQUIREMENTS', content: ['Prebuilt shop or kiosk', 'Deep freezer and visicooler', 'Display counter and storage racks', 'Electricity connection', 'Basic interiors'] },
            { title: 'CONNECTIVITY', content: ['Good pedestrian movement', 'Easy access for delivery vehicles', 'Proximity to residential areas'] },
            { title: 'LABOUR REQUIREMENT', content: ['1–2 persons sufficient', 'Owner involvement improves margins'] },
            { title: 'EXPECTED INCOME', content: ['Monthly turnover: ₹5 lakh – ₹10 lakh', 'Margins: Milk 2-3%, Products ~10%, Ice-cream ~20%, Scooping up to 50%'] },
            { title: 'PROFIT MARGIN & ROI', content: ['Stable but volume-driven', 'Break-even: 12 – 18 months'] },
            { title: 'TIME COMMITMENT', content: ['Initial months: 5–6 hours per day', 'After stabilization: 1–2 hours per day'] },
            { title: 'RISKS', content: ['Seasonal demand variation', 'Heavy dependence on electricity', 'Competition from local dairies', 'Product perishability'] },
            { title: 'RISK LEVEL', content: ['Low'] },
            { title: 'ENVIRONMENTAL IMPACT', content: ['Low', 'Minimal plastic waste', 'No hazardous by-products'] },
            { title: 'HISTORICAL SUCCESS DATA', content: ['Very high success rate', 'Consistent growth over decades', 'Strong brand trust'] },
            { title: 'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', content: ['FSSAI Registration', 'Shop Act License', 'Local Municipal trade license', 'GST registration'] },
            { title: 'SUITABILITY FIT (FARMER PROFILE)', content: ['Best suited for: First-time entrepreneurs, Small investors seeking low-risk', 'Not suitable for: Remote areas with low footfall'] },
            { title: 'OTHER PRACTICAL INSIGHTS', content: ['Location matters more than shop size', 'Ice-cream scooping gives highest margins', 'Brand trust reduces marketing effort'] },
            { title: 'FACT TO KNOW', content: ['Amul sells products every single day, making it one of the few franchise models where daily repeat customers are guaranteed.'] }
        ],
        shortStats: {
            investment: '₹1.5L - ₹6L',
            profit: '₹5L - ₹10L Rev'
        }
    },
    '4': {
        id: '4',
        title: 'SPIRULINA FARMING (ALGAE)',
        basicIdea: ['Cultivation of Spirulina (blue-green algae) in controlled tanks', 'Harvesting, drying, and processing into powder or tablets', 'End-use in nutraceutical and health food markets'],
        sections: [
            { title: 'SOURCE', content: ['Nutrigen Agrotech'] },
            { title: 'LOCATION', content: ['Mundhwa Industrial Area, Pune'] },
            { title: 'LOCATION SUITABILITY', content: ['Urban, semi-urban, or industrial locations', 'Rooftops, backyards, sheds, polyhouses', 'Good sunlight and clean water availability'] },
            { title: 'LAND REQUIREMENT', content: ['300 – 1000 sq.ft', 'Rooftop or small open plot'] },
            { title: 'INVESTMENT BREAKDOWN (REALISTIC)', content: ['Total: ₹2 lakh – ₹5 lakh', 'Tanks/raceway ponds: ₹50k–1.2L', 'Agitators: ₹20k–40k', 'Drying system: ₹30k–1L', 'Harvesting tools: ₹20k–40k'] },
            { title: 'RAW MATERIALS / INPUTS', content: ['Clean water', 'Spirulina starter culture', 'Nutrients (Sodium bicarbonate, Urea, etc.)', 'Filtration cloth', 'Packaging material'] },
            { title: 'INFRASTRUCTURE & REQUIREMENTS', content: ['Sunlight: 8–10 hours/day', 'Water temp: 25–35°C', 'pH level: 8.5–10', 'Mechanical agitators', 'Drying facility'] },
            { title: 'CONNECTIVITY', content: ['Good road connectivity', 'Access to nutraceutical buyers and pharma companies', 'Courier services for online sales'] },
            { title: 'LABOUR REQUIREMENT', content: ['1 – 2 trained persons sufficient'] },
            { title: 'EXPECTED ROI / PROFIT', content: ['Production: 5–8 kg/month per 300 sq.ft', 'Selling price: ₹800–2000/kg', 'Monthly profit: ₹25k–60k', 'Annual ROI: 40%–80%'] },
            { title: 'MAINTENANCE', content: ['Tank cleaning', 'Nutrient monitoring', 'Agitator servicing', 'Monthly cost: ₹2000–5000'] },
            { title: 'TIME COMMITMENT', content: ['Initial phase: 4–5 hours/day', 'After stabilization: 1–2 hours/day'] },
            { title: 'RISKS', content: ['Water contamination', 'pH imbalance', 'Temp fluctuations', 'Power failure', 'Poor drying quality'] },
            { title: 'RISK PERCENTAGE', content: ['Low to Medium'] },
            { title: 'ENVIRONMENTAL IMPACT', content: ['Low', 'Minimal water usage', 'Sustainable protein production'] },
            { title: 'HISTORICAL SUCCESS DATA', content: ['High growth in demand due to health awareness'] },
            { title: 'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', content: ['MSME (Udyam)', 'FSSAI Registration', 'Local trade license', 'Pollution Board consent (minimal)'] },
            { title: 'SUITABILITY FIT (FARMER PROFILE)', content: ['Farmer with small land or rooftop', 'Women entrepreneurs, SHGs', 'Educated youth'] },
            { title: 'OTHER PRACTICAL INSIGHTS', content: ['Can be started on rooftop', 'Low water consumption', 'High B2B potential'] },
            { title: 'FACT TO KNOW', content: ['Spirulina is one of the most protein-dense foods and yields more protein per square meter than conventional crops.'] }
        ],
        shortStats: {
            investment: '₹2L - ₹5L',
            profit: '₹25k - ₹60k/mo'
        }
    },
    '5': {
        id: '5',
        title: 'DAIRY FARMING (6–8 COW UNIT)',
        basicIdea: ['Rearing milch cows to produce milk daily', 'Selling to cooperatives or bulk buyers', 'Secondary income from manure and calves'],
        sections: [
            { title: 'SOURCE', content: ['Local Milkman'] },
            { title: 'SOURCE LOCATION', content: ['Uruli Devachi, Hadapsar, Pune'] },
            { title: 'LAND REQUIREMENT', content: ['4,000 – 6,000 sq.ft (Shed + open area + feed storage)'] },
            { title: 'INVESTMENT BREAKDOWN (REALISTIC)', content: ['Total: ₹10 lakh – ₹13 lakh', 'Purchase of 6–8 crossbred cows', 'Cattle shed construction', 'Equipment and initial feed'] },
            { title: 'RAW MATERIALS / INPUTS', content: ['Green fodder', 'Dry fodder', 'Cattle concentrate feed', 'Clean water', 'Veterinary medicines'] },
            { title: 'INFRASTRUCTURE & REQUIREMENTS', content: ['Proper cattle shed', 'Continuous water supply', 'Electricity', 'Fodder availability', 'Milking equipment', 'Waste management'] },
            { title: 'CONNECTIVITY', content: ['Daily access to milk collection center', 'Timely transport is critical'] },
            { title: 'LABOUR REQUIREMENT', content: ['1 full-time caretaker', 'Family labor preferred'] },
            { title: 'EXPECTED PROFIT AND ROI', content: ['Net monthly profit: ₹20,000 – ₹40,000', 'Annual ROI: 15% – 30%', 'Break-even: 2.5 – 4 years'] },
            { title: 'MAINTENANCE', content: ['Daily feeding and cleaning', 'Regular health monitoring', 'Monthly cost: ₹60k–80k (mainly feed)'] },
            { title: 'TIME AVAILABILITY', content: ['4 – 6 hours per day', 'Daily physical involvement required'] },
            { title: 'RISKS', content: ['Animal diseases', 'Fodder price fluctuations', 'Low milk yield', 'Milk rejection', 'Rising labor costs'] },
            { title: 'RISK PERCENTAGE', content: ['Low to Medium'] },
            { title: 'ENVIRONMENTAL IMPACT', content: ['Low and positive', 'Cow dung used for manure/biogas'] },
            { title: 'HISTORICAL SUCCESS DATA', content: ['Stable livelihood for decades', 'Cooperative model ensures sustainability'] },
            { title: 'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', content: ['Animal Husbandry registration', 'Local NOC', 'FSSAI (if selling packed milk)', 'Dairy cooperative membership'] },
            { title: 'SUITABILITY FIT (FARMER PROFILE)', content: ['Best for farmers with own fodder land', 'Farmers with land and capital', 'Not for passive investors'] },
            { title: 'OTHER PRACTICAL INSIGHTS', content: ['Feed cost decides profitability', 'Own fodder cultivation improves margins', 'Regular veterinary care prevents losses'] },
            { title: 'FACT TO KNOW', content: ['Feed cost accounts for nearly 65–70% of total expenses, making fodder planning critical.'] }
        ],
        shortStats: {
            investment: '₹10L - ₹13L',
            profit: '₹20k - ₹40k/mo'
        }
    },
    '6': {
        id: '6',
        title: 'GOAT MILK FARMING (20–25 MILCH GOATS UNIT)',
        basicIdea: ['Rearing milch goats for premium milk production', 'Sold to niche markets or direct consumers', 'Income from kid sales'],
        sections: [
            { title: 'SOURCE', content: ['Ahad Goat Farm'] },
            { title: 'SOURCE LOCATION', content: ['Pimpri Chinchwad, Maharashtra'] },
            { title: 'LAND REQUIREMENT', content: ['3,000 – 4,500 sq.ft'] },
            { title: 'INVESTMENT BREAKDOWN (REALISTIC)', content: ['Total: ₹6.5 lakh – ₹9.5 lakh', 'Goats: ₹3.8L–5.5L', 'Shed: ₹1.8L–2.8L', 'Equipment: ₹30k–50k', 'Initial Feed/Meds: ₹40k–70k'] },
            { title: 'RAW MATERIALS / INPUTS', content: ['Green/Dry fodder, Tree leaves, Concentrate feed, Medicines'] },
            { title: 'INFRASTRUCTURE & REQUIREMENTS', content: ['Raised shed (GI roof)', 'Water supply', 'Electricity', 'Kidding space'] },
            { title: 'CONNECTIVITY', content: ['Proximity to premium customers or Ayurvedic buyers'] },
            { title: 'LABOUR REQUIREMENT', content: ['1 full-time caretaker', 'Family labour preferred'] },
            { title: 'EXPECTED PROFIT AND ROI', content: ['Milk yield: 1.5–2 L/day', 'Selling price: ₹80–120/L', 'Monthly profit: ₹30k–60k', 'Annual ROI: 30%–45%'] },
            { title: 'MAINTENANCE', content: ['Daily feeding/cleaning', 'Health monitoring', 'Monthly cost: ₹20k–30k'] },
            { title: 'TIME AVAILABILITY', content: ['3 – 4 hours per day'] },
            { title: 'RISKS', content: ['Diseases (PPR, Mastitis)', 'Inconsistent yield', 'Lack of organized market'] },
            { title: 'RISK PERCENTAGE', content: ['Medium to High'] },
            { title: 'ENVIRONMENTAL IMPACT', content: ['Low', 'Lower water footprint than cows'] },
            { title: 'HISTORICAL SUCCESS DATA', content: ['Growing niche sector', 'Rising demand in health markets'] },
            { title: 'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', content: ['Animal Husbandry registration', 'Local NOC', 'FSSAI (if packaged)', 'Trade license'] },
            { title: 'SUITABILITY FIT (FARMER PROFILE)', content: ['Farmers near cities', 'Farmers comfortable with direct selling'] },
            { title: 'OTHER PRACTICAL INSIGHTS', content: ['Profitability depends on selling price', 'Direct-to-consumer is best'] },
            { title: 'FACT TO KNOW', content: ['Goat milk is easier to digest and commands a premium price from health-conscious buyers.'] }
        ],
        shortStats: {
            investment: '₹6.5L - ₹9.5L',
            profit: '₹30k - ₹60k/mo'
        }
    },
    '7': {
        id: '7',
        title: 'MUSHROOM FARMING (OYSTER)',
        basicIdea: ['Indoor cultivation using agricultural waste', 'Grown in controlled rooms/sheds', 'Sold fresh to local markets/hotels'],
        sections: [
            { title: 'SOURCE', content: ['Krushi Vigyan Kendra (KVK)'] },
            { title: 'SOURCE LOCATION', content: ['Baramati'] },
            { title: 'LAND REQUIREMENT', content: ['500 – 1,000 sq.ft (Closed shed/room)'] },
            { title: 'INVESTMENT BREAKDOWN (REALISTIC)', content: ['Total: ₹1.8 lakh – ₹3.0 lakh', 'Shed/Room: ₹70k–1.2L', 'Racks: ₹30k–50k', 'Spawn/Consumables: ₹25k–40k', 'Humidity equipment: ₹20k–40k'] },
            { title: 'RAW MATERIALS / INPUTS', content: ['Spawn, Wheat/Paddy straw, Lime/Formalin, Polythene bags'] },
            { title: 'INFRASTRUCTURE & REQUIREMENTS', content: ['Clean indoor space', 'Temp: 20–30°C', 'Humidity: 70–85%', 'Ventilation'] },
            { title: 'CONNECTIVITY', content: ['Access to vegetable markets and hotels (short shelf life)'] },
            { title: 'LABOUR REQUIREMENT', content: ['1 person sufficient', 'Family labour preferred'] },
            { title: 'EXPECTED PROFIT AND ROI', content: ['Production: 600–1000 kg/year', 'Selling price: ₹120–200/kg', 'Monthly profit: ₹15k–35k', 'ROI: 30%–50%'] },
            { title: 'MAINTENANCE', content: ['Daily spraying/humidity control', 'Hygiene maintenance', 'Monthly cost: ₹3000–6000'] },
            { title: 'TIME AVAILABILITY', content: ['2 – 3 hours per day'] },
            { title: 'RISKS', content: ['Contamination', 'Temperature fluctuations', 'Short shelf life'] },
            { title: 'RISK PERCENTAGE', content: ['Medium'] },
            { title: 'ENVIRONMENTAL IMPACT', content: ['Very low', 'Uses waste'] },
            { title: 'HISTORICAL SUCCESS DATA', content: ['Steady expansion', 'Popular for low investment'] },
            { title: 'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', content: ['MSME Registration', 'Local trade license', 'FSSAI (if processed)'] },
            { title: 'SUITABILITY FIT (FARMER PROFILE)', content: ['Farmers with limited land', 'SHGs, women entrepreneurs', 'Part-time seekers'] },
            { title: 'OTHER PRACTICAL INSIGHTS', content: ['Hygiene prevents losses', 'Direct selling improves margins'] },
            { title: 'FACT TO KNOW', content: ['Oyster mushrooms complete a cycle in 30–40 days, allowing multiple harvests per year.'] }
        ],
        shortStats: {
            investment: '₹1.8L - ₹3L',
            profit: '₹15k - ₹35k/mo'
        }
    },
    '8': {
        id: '8',
        title: 'POULTRY FARMING (BROILER – 1,000 BIRDS)',
        basicIdea: ['Raising broiler chickens for meat', 'Batch cycles of 35–45 days', 'Sell live birds to traders/integrators'],
        sections: [
            { title: 'SOURCE', content: ['Nature’s Best Poultry Farm'] },
            { title: 'SOURCE LOCATION', content: ['Talegaon Dabhade / Hadapsar, Pune'] },
            { title: 'LAND REQUIREMENT', content: ['3,000 – 4,000 sq.ft'] },
            { title: 'INVESTMENT BREAKDOWN (REALISTIC)', content: ['Total: ₹6.5 lakh – ₹8.5 lakh', 'Shed: ₹3.0L–4.0L', 'Chicks: ₹40k–55k', 'Equipment: ₹60k–90k', 'Feed: ₹1.6L–2.0L'] },
            { title: 'RAW MATERIALS / INPUTS', content: ['Day-old chicks, Feed, Water, Vaccines, Litter material'] },
            { title: 'INFRASTRUCTURE & REQUIREMENTS', content: ['Well-ventilated shed', 'Electricity', 'Temp control (brooding)', 'Biosecurity'] },
            { title: 'CONNECTIVITY', content: ['Access to feed suppliers and markets', 'Integrator routes'] },
            { title: 'LABOUR REQUIREMENT', content: ['1 person sufficient', 'Family labour preferred'] },
            { title: 'EXPECTED PROFIT AND ROI', content: ['Profit/cycle: ₹40k–70k', 'Annual profit: ₹2.0L–3.5L', 'ROI: 30%–45%'] },
            { title: 'MAINTENANCE', content: ['Feeding/Watering', 'Litter management', 'Monthly cost: ₹20k–30k'] },
            { title: 'TIME AVAILABILITY', content: ['3 – 4 hours per day'] },
            { title: 'RISKS', content: ['Disease (CRD, IBD)', 'Heat stress', 'Feed price fluctuations'] },
            { title: 'RISK PERCENTAGE', content: ['Medium to High'] },
            { title: 'ENVIRONMENTAL IMPACT', content: ['Moderate', 'Litter/Odour management needed'] },
            { title: 'HISTORICAL SUCCESS DATA', content: ['Rapid expansion', 'Profit dependent on feed prices'] },
            { title: 'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', content: ['Animal Husbandry reg', 'Local NOC', 'Pollution Board consent (large units)'] },
            { title: 'SUITABILITY FIT (FARMER PROFILE)', content: ['Farmers with land/capital', 'Daily management capability'] },
            { title: 'OTHER PRACTICAL INSIGHTS', content: ['Contract farming reduces risk', 'Summer management is critical'] },
            { title: 'FACT TO KNOW', content: ['Feed cost is 65–70% of total cost, making price the key factor.'] }
        ],
        shortStats: {
            investment: '₹6.5L - ₹8.5L',
            profit: '₹40k - ₹70k/cycle'
        }
    },
    '9': {
        id: '9',
        title: 'VERMICOMPOST PRODUCTION',
        basicIdea: ['Production of organic manure using earthworms', 'Converts cow dung/waste to fertilizer', 'Sold to farmers/nurseries'],
        sections: [
            { title: 'SOURCE', content: ['Agrostar India'] },
            { title: 'SOURCE LOCATION', content: ['Junnar, Maharashtra'] },
            { title: 'LAND REQUIREMENT', content: ['1,000 – 2,000 sq.ft (Shaded area)'] },
            { title: 'INVESTMENT BREAKDOWN (REALISTIC)', content: ['Total: ₹80,000 – ₹1.5 lakh', 'Beds/Pits: ₹30k–60k', 'Worms: ₹10k–20k', 'Tools/Shed: ₹25k–40k'] },
            { title: 'RAW MATERIALS / INPUTS', content: ['Cow dung, Crop waste, Earthworms, Water, Bags'] },
            { title: 'INFRASTRUCTURE & REQUIREMENTS', content: ['Shade, Water supply', 'Moisture maintenance', 'Pest protection'] },
            { title: 'CONNECTIVITY', content: ['Access to farmers and nurseries'] },
            { title: 'LABOUR REQUIREMENT', content: ['Very low (1 person)'] },
            { title: 'EXPECTED PROFIT AND ROI', content: ['Production: 2–3 tons/cycle', 'Profit: ₹8k–20k/month', 'ROI: 25%–40%'] },
            { title: 'MAINTENANCE', content: ['Watering, Bed turning', 'Monthly cost: ₹1000–3000'] },
            { title: 'TIME AVAILABILITY', content: ['1 – 2 hours per day'] },
            { title: 'RISKS', content: ['Heat/Rain damage', 'Poor moisture control', 'Low local demand'] },
            { title: 'RISK PERCENTAGE', content: ['Low to Medium'] },
            { title: 'ENVIRONMENTAL IMPACT', content: ['Very positive', 'Waste to wealth'] },
            { title: 'HISTORICAL SUCCESS DATA', content: ['Successful for 20+ years', 'Driven by organic farming'] },
            { title: 'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', content: ['MSME Registration', 'Local trade license'] },
            { title: 'SUITABILITY FIT (FARMER PROFILE)', content: ['Farmers with cow dung access', 'Small farmers/SHGs'] },
            { title: 'OTHER PRACTICAL INSIGHTS', content: ['Consistent quality builds trust', 'Direct selling improves margins'] },
            { title: 'FACT TO KNOW', content: ['1 ton of vermicompost significantly improves soil structure.'] }
        ],
        shortStats: {
            investment: '₹80k - ₹1.5L',
            profit: '₹8k - ₹20k/mo'
        }
    },
    '10': {
        id: '10',
        title: 'PLANT NURSERY',
        basicIdea: ['Raising saplings from seeds/cuttings', 'Sold to farmers/gardeners', 'Seasonal business'],
        sections: [
            { title: 'SOURCE', content: ['Wagh Nursery'] },
            { title: 'SOURCE LOCATION', content: ['Manjri, Pune'] },
            { title: 'LAND REQUIREMENT', content: ['3,000 – 6,000 sq.ft'] },
            { title: 'INVESTMENT BREAKDOWN (REALISTIC)', content: ['Total: ₹3.5 lakh – ₹6.0 lakh', 'Shade net: ₹1.5L–2.5L', 'Water system: ₹40k–70k', 'Inputs: ₹40k–70k'] },
            { title: 'RAW MATERIALS / INPUTS', content: ['Seeds, Cocopeat, Bags, Trays, Water, Fertilizers'] },
            { title: 'INFRASTRUCTURE & REQUIREMENTS', content: ['Shade-net, Drainage', 'Pest management knowledge'] },
            { title: 'CONNECTIVITY', content: ['Access to farmers/gardeners'] },
            { title: 'LABOUR REQUIREMENT', content: ['1 skilled person full-time'] },
            { title: 'EXPECTED PROFIT AND ROI', content: ['Profit: ₹1.5L–3.0L/year', 'ROI: 25%–40%'] },
            { title: 'MAINTENANCE', content: ['Watering, Weeding', 'Monthly cost: ₹5000–10000'] },
            { title: 'TIME AVAILABILITY', content: ['3 – 4 hours per day'] },
            { title: 'RISKS', content: ['Plant mortality', 'Unsold stock', 'Price competition'] },
            { title: 'RISK PERCENTAGE', content: ['Medium to High'] },
            { title: 'ENVIRONMENTAL IMPACT', content: ['Positive'] },
            { title: 'HISTORICAL SUCCESS DATA', content: ['Successful for decades', 'Success depends on quality'] },
            { title: 'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', content: ['MSME Registration', 'Local trade license', 'Horticulture registration'] },
            { title: 'SUITABILITY FIT (FARMER PROFILE)', content: ['Farmers with land/water', 'Entrepreneurs with horticulture skills'] },
            { title: 'OTHER PRACTICAL INSIGHTS', content: ['Quality decides repeat orders', 'Tie-ups help stability'] },
            { title: 'FACT TO KNOW', content: ['Saplings sold by count give better value per sq.ft than field crops.'] }
        ],
        shortStats: {
            investment: '₹3.5L - ₹6L',
            profit: '₹1.5L - ₹3L/yr'
        }
    },
    '11': {
        id: '11',
        title: 'COW DUNG ORGANIC MANURE & BIO-INPUTS',
        basicIdea: ['Processing cow dung into manure/compost', 'Bio-inputs like Jeevamrut', 'Sold to organic farmers'],
        sections: [
            { title: 'SOURCE', content: ['Greenaria research'] },
            { title: 'SOURCE LOCATION', content: ['Online'] },
            { title: 'LAND REQUIREMENT', content: ['1,500 – 3,000 sq.ft'] },
            { title: 'INVESTMENT BREAKDOWN (REALISTIC)', content: ['Total: ₹1.2 lakh – ₹2.5 lakh', 'Beds/Platforms: ₹30k–60k', 'Shed: ₹30k–60k', 'Tools/Drums: ₹20k–40k'] },
            { title: 'RAW MATERIALS / INPUTS', content: ['Cow dung, Urine, Jaggery, Pulse flour, Water'] },
            { title: 'INFRASTRUCTURE & REQUIREMENTS', content: ['Dung supply, Water, Mixing space'] },
            { title: 'CONNECTIVITY', content: ['Access to organic farmers/stores'] },
            { title: 'LABOUR REQUIREMENT', content: ['1 person sufficient'] },
            { title: 'EXPECTED PROFIT AND ROI', content: ['Profit: ₹15k–35k/month', 'ROI: 30%–45%'] },
            { title: 'MAINTENANCE', content: ['Turning compost, Moisture control', 'Monthly cost: ₹2000–4000'] },
            { title: 'TIME AVAILABILITY', content: ['1 – 2 hours per day'] },
            { title: 'RISKS', content: ['Low local demand', 'Improper fermentation'] },
            { title: 'RISK PERCENTAGE', content: ['Low to Medium'] },
            { title: 'ENVIRONMENTAL IMPACT', content: ['Very positive'] },
            { title: 'HISTORICAL SUCCESS DATA', content: ['Growth due to organic farming'] },
            { title: 'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', content: ['MSME Registration', 'Local trade license'] },
            { title: 'SUITABILITY FIT (FARMER PROFILE)', content: ['Farmers with cows/gaushala access'] },
            { title: 'OTHER PRACTICAL INSIGHTS', content: ['Link with dairy/gaushala for best margins', 'Branding improves price'] },
            { title: 'FACT TO KNOW', content: ['Bio-inputs sell on trust/results.'] }
        ],
        shortStats: {
            investment: '₹1.2L - ₹2.5L',
            profit: '₹15k - ₹35k/mo'
        }
    },
    '12': {
        id: '12',
        title: 'COW DUNG PRODUCTS (DHOOP, DIYAS)',
        basicIdea: ['Manufacturing value-added products (dhoop, diyas, logs)', 'Eco-friendly/Religious use'],
        sections: [
            { title: 'SOURCE', content: ['Greenaria research'] },
            { title: 'SOURCE LOCATION', content: ['Online'] },
            { title: 'LAND REQUIREMENT', content: ['800 – 1,500 sq.ft (Drying/Storage)'] },
            { title: 'INVESTMENT BREAKDOWN (REALISTIC)', content: ['Total: ₹1.5 lakh – ₹3.0 lakh', 'Shed/Drying: ₹40k–80k', 'Moulds/Tools: ₹20k–70k'] },
            { title: 'RAW MATERIALS / INPUTS', content: ['Cow dung, Herbs, Binders, Packaging'] },
            { title: 'INFRASTRUCTURE & REQUIREMENTS', content: ['Drying space, Moulds, Storage'] },
            { title: 'CONNECTIVITY', content: ['Local markets, Temples, Exhibitions'] },
            { title: 'LABOUR REQUIREMENT', content: ['1–2 persons (Women SHGs suitable)'] },
            { title: 'EXPECTED PROFIT AND ROI', content: ['Profit: ₹20k–50k/month', 'ROI: 35%–60%'] },
            { title: 'MAINTENANCE', content: ['Cleaning moulds, Drying supervision', 'Monthly cost: ₹2000–5000'] },
            { title: 'TIME AVAILABILITY', content: ['2 – 3 hours per day'] },
            { title: 'RISKS', content: ['Seasonal demand', 'Moisture damage'] },
            { title: 'RISK PERCENTAGE', content: ['Low to Medium'] },
            { title: 'ENVIRONMENTAL IMPACT', content: ['Highly positive'] },
            { title: 'HISTORICAL SUCCESS DATA', content: ['Rapid growth post-2020'] },
            { title: 'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', content: ['MSME Registration', 'Local trade license'] },
            { title: 'SUITABILITY FIT (FARMER PROFILE)', content: ['Women SHGs, Rural entrepreneurs'] },
            { title: 'OTHER PRACTICAL INSIGHTS', content: ['Marketing/Packaging matters most', 'Festival planning boosts sales'] },
            { title: 'FACT TO KNOW', content: ['Gained popularity due to eco-product campaigns.'] }
        ],
        shortStats: {
            investment: '₹1.5L - ₹3L',
            profit: '₹20k - ₹50k/mo'
        }
    },
    '13': {
        id: '13',
        title: 'LEAF PLATE (DONA–PATTAL) MANUFACTURING',
        basicIdea: ['Making disposable plates from leaves', 'Semi-automatic process', 'Eco-friendly alternative to plastic'],
        sections: [
            { title: 'SOURCE', content: ['Karnataka Govt report'] },
            { title: 'SOURCE LOCATION', content: ['Online'] },
            { title: 'LAND REQUIREMENT', content: ['300 – 500 sq.ft'] },
            { title: 'INVESTMENT BREAKDOWN (REALISTIC)', content: ['Total: ₹2.5 lakh – ₹4.0 lakh', 'Machine: ₹1.6L–2.5L', 'Electrical/Shed: ₹30k–50k', 'Leaves: ₹30k–50k'] },
            { title: 'RAW MATERIALS / INPUTS', content: ['Sal/Areca leaves, Water, Packaging'] },
            { title: 'INFRASTRUCTURE & REQUIREMENTS', content: ['Electricity, Machine, Storage'] },
            { title: 'CONNECTIVITY', content: ['Access to caterers, temples, wholesalers'] },
            { title: 'LABOUR REQUIREMENT', content: ['1–2 persons'] },
            { title: 'EXPECTED PROFIT AND ROI', content: ['Profit: ₹25k–60k/month', 'ROI: 30%–45%'] },
            { title: 'MAINTENANCE', content: ['Machine servicing', 'Monthly cost: ₹2000–4000'] },
            { title: 'TIME AVAILABILITY', content: ['3 – 4 hours per day'] },
            { title: 'RISKS', content: ['Seasonal demand', 'Raw material availability', 'Breakdowns'] },
            { title: 'RISK PERCENTAGE', content: ['Medium'] },
            { title: 'ENVIRONMENTAL IMPACT', content: ['Very positive'] },
            { title: 'HISTORICAL SUCCESS DATA', content: ['Strong growth due to plastic bans'] },
            { title: 'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', content: ['MSME Registration', 'Local trade license'] },
            { title: 'SUITABILITY FIT (FARMER PROFILE)', content: ['Landless farmers, SHGs, Rural entrepreneurs'] },
            { title: 'OTHER PRACTICAL INSIGHTS', content: ['Bulk orders give stability', 'Location near buyers reduces cost'] },
            { title: 'FACT TO KNOW', content: ['One machine can make 6000–8000 plates/day.'] }
        ],
        shortStats: {
            investment: '₹2.5L - ₹4L',
            profit: '₹25k - ₹60k/mo'
        }
    },
    '14': {
        id: '14',
        title: 'AGRI-INPUT TRADING',
        basicIdea: ['Retail shop for seeds, fertilizer, pesticides', 'Serves local farmers'],
        sections: [
            { title: 'SOURCE', content: ['Shree Gurudatta Sheti Bhandar'] },
            { title: 'SOURCE LOCATION', content: ['Wagholi, Pune'] },
            { title: 'LAND REQUIREMENT', content: ['150 – 300 sq.ft (Rented Shop)'] },
            { title: 'INVESTMENT BREAKDOWN (REALISTIC)', content: ['Total: ₹3.0 lakh – ₹6.0 lakh', 'Setup: ₹60k–1.2L', 'Stock: ₹2.0L–4.0L'] },
            { title: 'RAW MATERIALS / INPUTS', content: ['Seeds, Fertilizers, Pesticides'] },
            { title: 'INFRASTRUCTURE & REQUIREMENTS', content: ['License, Racks, Knowledge'] },
            { title: 'CONNECTIVITY', content: ['Strong farmer footfall essential'] },
            { title: 'LABOUR REQUIREMENT', content: ['1 person sufficient'] },
            { title: 'EXPECTED PROFIT AND ROI', content: ['Profit: ₹20k–50k/month', 'ROI: 25%–40%'] },
            { title: 'MAINTENANCE', content: ['Stock rotation', 'Monthly cost: ₹3000–6000'] },
            { title: 'TIME AVAILABILITY', content: ['5 – 6 hours per day'] },
            { title: 'RISKS', content: ['Credit sales', 'Stock expiry', 'Regulations'] },
            { title: 'RISK PERCENTAGE', content: ['Low to Medium'] },
            { title: 'ENVIRONMENTAL IMPACT', content: ['Neutral'] },
            { title: 'HISTORICAL SUCCESS DATA', content: ['Stable demand'] },
            { title: 'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', content: ['Agriculture input dealer license', 'GST', 'Trade license'] },
            { title: 'SUITABILITY FIT (FARMER PROFILE)', content: ['Entrepreneurs with farmer connections'] },
            { title: 'OTHER PRACTICAL INSIGHTS', content: ['Credit control is critical', 'Trust builds customers'] },
            {
                title: 'FACT TO KNOW',
                content: [
                    'Many agri-input shops fail not due to low sales but due to poor credit recovery and expired inventory management.'
                ]
            }
        ],
        shortStats: {
            investment: '₹3L - ₹6L',
            profit: '₹20k - ₹50k/mo'
        }
    },
    '15': {
        id: '15',
        title: 'INLAND FISH FARMING (POND-BASED)',
        basicIdea: ['Raising fish (Carp/Tilapia) in ponds', 'Harvest after 6–8 months', 'Sells fresh fish'],
        sections: [
            { title: 'SOURCE', content: ['NCDC Report'] },
            { title: 'SOURCE LOCATION', content: ['Government website'] },
            { title: 'LAND REQUIREMENT', content: ['0.5 – 1 acre water area'] },
            { title: 'INVESTMENT BREAKDOWN (REALISTIC)', content: ['Total: ₹3.5 lakh – ₹6.0 lakh', 'Pond prep: ₹40k–70k', 'Fingerlings: ₹30k–60k', 'Feed: ₹1.5L–2.5L'] },
            { title: 'RAW MATERIALS / INPUTS', content: ['Fingerlings, Feed, Lime, Medicines'] },
            { title: 'INFRASTRUCTURE & REQUIREMENTS', content: ['Water availability', 'Pond management'] },
            { title: 'CONNECTIVITY', content: ['Access to fish markets/traders'] },
            { title: 'LABOUR REQUIREMENT', content: ['1 person sufficient'] },
            { title: 'EXPECTED PROFIT AND ROI', content: ['Profit/cycle: ₹1.2L–2.5L', 'ROI: 30%–45%'] },
            { title: 'MAINTENANCE', content: ['Feeding, Water monitoring', 'Monthly cost: ₹8000–15000'] },
            { title: 'TIME AVAILABILITY', content: ['2 – 3 hours per day'] },
            { title: 'RISKS', content: ['Mortality', 'Theft', 'Market prices'] },
            { title: 'RISK PERCENTAGE', content: ['Medium'] },
            { title: 'ENVIRONMENTAL IMPACT', content: ['Low'] },
            { title: 'HISTORICAL SUCCESS DATA', content: ['Viable in villages with ponds'] },
            { title: 'GOVERNMENT LICENSES & REGISTRATIONS REQUIRED', content: ['Fisheries Dept registration', 'Pond lease', 'Local NOC'] },
            { title: 'SUITABILITY FIT (FARMER PROFILE)', content: ['Farmers with pond access', 'Willing to wait for returns'] },
            { title: 'OTHER PRACTICAL INSIGHTS', content: ['Group guarding reduces theft', 'Collective selling helps'] },
            { title: 'FACT TO KNOW', content: ['Efficient food production system.'] }
        ],
        shortStats: {
            investment: '₹3.5L - ₹6L',
            profit: '₹1.2L - ₹2.5L/cycle'
        }
    }
};
