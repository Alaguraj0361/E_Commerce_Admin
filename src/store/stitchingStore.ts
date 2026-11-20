import { create } from 'zustand';
import {
  StitchingCategory,
  StitchingMeasurement,
  StitchingDispatchOrder,
} from '../types';
import { api } from '../lib/api';

const INITIAL_CATEGORIES: StitchingCategory[] = [
  {
    _id: 'scat-1',
    name: 'Saree Blouse Stitching',
    slug: 'saree-blouse-stitching',
    description:
      'Precision-cut saree blouses with pre-washed 100% pure mulmul cotton lining, princess/katori darts, and piping.',
    basePrice: 450,
    estimatedTurnaroundDays: 3,
    iconName: 'Scissors',
    isActive: true,
    fields: [
      { key: 'bust', label: 'Bust / Chest Size', placeholder: 'e.g. 36', hint: 'Around the fullest part of bust' },
      { key: 'length', label: 'Blouse Length', placeholder: 'e.g. 14.5', hint: 'From shoulder seam to bottom hem' },
      { key: 'shoulder', label: 'Shoulder Width', placeholder: 'e.g. 14', hint: 'Tip of one shoulder bone to the other' },
      { key: 'frontNeck', label: 'Front Neck Depth', placeholder: 'e.g. 6.5', hint: 'From shoulder down to front neck depth' },
      { key: 'backNeck', label: 'Back Neck Depth', placeholder: 'e.g. 9.5', hint: 'From shoulder down to back neck depth' },
      { key: 'sleeveLength', label: 'Sleeve Length', placeholder: 'e.g. 10.5', hint: 'Elbow or short sleeve length' },
      { key: 'sleeveRound', label: 'Sleeve Round / Armhole', placeholder: 'e.g. 12', hint: 'Around sleeve opening' },
      { key: 'waist', label: 'Lower Rib / Waist Band', placeholder: 'e.g. 30', hint: 'Around body directly under bust' },
      { key: 'openingStyle', label: 'Opening Style', placeholder: 'Front Hook / Back Hook / Side Zip', hint: 'Preferred opening position' },
    ],
  },
  {
    _id: 'scat-2',
    name: 'Bridal & Designer Blouses (Aari Work)',
    slug: 'bridal-designer-blouses',
    description:
      'Opulent bridal Aari & Zardozi embroidery, temple motifs, Lakshmi kasu coins, and bridal silk tailoring.',
    basePrice: 1800,
    estimatedTurnaroundDays: 7,
    iconName: 'Sparkles',
    isActive: true,
    fields: [
      { key: 'bust', label: 'Bust Around', placeholder: 'e.g. 38', hint: 'Fullest part of bust' },
      { key: 'length', label: 'Blouse Full Length', placeholder: 'e.g. 14.5', hint: 'Shoulder to bottom hem' },
      { key: 'shoulder', label: 'Shoulder Width', placeholder: 'e.g. 14.5', hint: 'Across shoulders' },
      { key: 'armhole', label: 'Armhole Circumference', placeholder: 'e.g. 14', hint: 'Around arm joint' },
      { key: 'sleeveLength', label: 'Sleeve Length', placeholder: 'e.g. 11', hint: 'Elbow length for bridal borders' },
      { key: 'sleeveRound', label: 'Sleeve Round', placeholder: 'e.g. 11.5', hint: 'At sleeve bottom' },
      { key: 'frontNeck', label: 'Front Neck Depth', placeholder: 'e.g. 7', hint: 'Deep or sweet-heart curve' },
      { key: 'backNeck', label: 'Back Neck Depth', placeholder: 'e.g. 10.5', hint: 'Deep pot / square / cutwork' },
      { key: 'lowerBand', label: 'Under Bust Waist Band', placeholder: 'e.g. 32', hint: 'Rib band circumference' },
      { key: 'embroideryNotes', label: 'Aari & Zardozi Pattern', placeholder: 'e.g. Heavy Peacock & Jhumka sleeve', hint: 'Hand embroidery specifications' },
    ],
  },
  {
    _id: 'scat-3',
    name: 'Pavadai Sattai & Pattu Pavadai',
    slug: 'pavadai-sattai-pattu-pavadai',
    description:
      'Traditional South Indian silk pattu pavadai and sattai sets for young girls with breathable cotton lining.',
    basePrice: 650,
    estimatedTurnaroundDays: 3,
    iconName: 'Heart',
    isActive: true,
    fields: [
      { key: 'childAge', label: 'Child Age / Height', placeholder: 'e.g. 5 Years (110 cm)', hint: 'Age & overall height' },
      { key: 'blouseChest', label: 'Sattai / Top Chest Size', placeholder: 'e.g. 26', hint: 'Around chest' },
      { key: 'blouseLength', label: 'Sattai / Top Length', placeholder: 'e.g. 16', hint: 'Shoulder to hip top' },
      { key: 'skirtLength', label: 'Pavadai / Skirt Length', placeholder: 'e.g. 28', hint: 'Navel to ankle bone' },
      { key: 'waist', label: 'Waist Around', placeholder: 'e.g. 24', hint: 'Around skirt waistband' },
      { key: 'shoulder', label: 'Shoulder Width', placeholder: 'e.g. 10.5', hint: 'Across back shoulders' },
      { key: 'sleeveLength', label: 'Sleeve Length', placeholder: 'e.g. 5.5', hint: 'Puff or normal sleeve' },
    ],
  },
  {
    _id: 'scat-4',
    name: "Girls' Frocks & Gowns",
    slug: 'girls-frocks-gowns',
    description:
      'Floor-length organza ball gowns, birthday party dresses, and festive silk frocks with soft can-can bounce.',
    basePrice: 850,
    estimatedTurnaroundDays: 4,
    iconName: 'Crown',
    isActive: true,
    fields: [
      { key: 'childAge', label: 'Child Age / Height', placeholder: 'e.g. 7 Years', hint: 'Approximate age & height' },
      { key: 'chest', label: 'Chest Around', placeholder: 'e.g. 28', hint: 'Around fullest part' },
      { key: 'fullLength', label: 'Full Frock Length', placeholder: 'e.g. 36', hint: 'Shoulder down to floor / knee' },
      { key: 'shoulderToWaist', label: 'Shoulder to Waist Length', placeholder: 'e.g. 11.5', hint: 'Torso length' },
      { key: 'waist', label: 'Waist Around', placeholder: 'e.g. 26', hint: 'Natural waistline' },
      { key: 'shoulder', label: 'Shoulder Width', placeholder: 'e.g. 11', hint: 'Across shoulder seam' },
      { key: 'sleeveLength', label: 'Sleeve Length', placeholder: 'e.g. 6 (or Sleeveless)', hint: 'Sleeve choice' },
    ],
  },
  {
    _id: 'scat-5',
    name: 'Lehenga Choli & Half Saree',
    slug: 'lehenga-choli-half-saree',
    description:
      'Bridal & festive circular flared lehenga skirts, padded choli blouses, and half-saree dhavani styling.',
    basePrice: 1200,
    estimatedTurnaroundDays: 5,
    iconName: 'Sparkle',
    isActive: true,
    fields: [
      { key: 'choliBust', label: 'Choli / Blouse Bust', placeholder: 'e.g. 36', hint: 'Around bust' },
      { key: 'choliLength', label: 'Choli Full Length', placeholder: 'e.g. 14.5', hint: 'Shoulder to midriff' },
      { key: 'lehengaLength', label: 'Lehenga Skirt Length', placeholder: 'e.g. 41', hint: 'Waist to floor with heels' },
      { key: 'waist', label: 'Skirt Waist / Navel', placeholder: 'e.g. 30', hint: 'Where lehenga is tied' },
      { key: 'hip', label: 'Hip Around', placeholder: 'e.g. 38', hint: 'Around fullest hip' },
      { key: 'sleeveLength', label: 'Choli Sleeve Length', placeholder: 'e.g. 10.5', hint: 'Sleeve length' },
      { key: 'canCanPreference', label: 'Can-Can Flare Volume', placeholder: 'Double Can-Can / Single / No Can-Can', hint: 'Bottom flare bounce' },
    ],
  },
  {
    _id: 'scat-6',
    name: 'Kurti & Salwar Stitching',
    slug: 'kurti-salwar-stitching',
    description:
      'Straight-cut & A-line kurtis, pant/palazzo sets, and churidar salwar suits with neat seam allowances.',
    basePrice: 550,
    estimatedTurnaroundDays: 3,
    iconName: 'Shirt',
    isActive: true,
    fields: [
      { key: 'bust', label: 'Kurti Bust Size', placeholder: 'e.g. 38', hint: 'Around bust' },
      { key: 'waist', label: 'Kurti Waist Size', placeholder: 'e.g. 34', hint: 'Natural waist' },
      { key: 'hip', label: 'Kurti Hip Size', placeholder: 'e.g. 42', hint: 'Side slit start area' },
      { key: 'kurtiLength', label: 'Kurti Full Length', placeholder: 'e.g. 42', hint: 'Shoulder to below knee' },
      { key: 'pantLength', label: 'Pant / Salwar Length', placeholder: 'e.g. 38', hint: 'Waist to ankle' },
      { key: 'pantWaist', label: 'Pant Waist / Hip', placeholder: 'e.g. 32-36 Elastic', hint: 'Comfortable waist fit' },
      { key: 'shoulder', label: 'Shoulder Width', placeholder: 'e.g. 14.5', hint: 'Across shoulders' },
      { key: 'sleeveLength', label: 'Sleeve Length', placeholder: 'e.g. 17', hint: '3/4th or full sleeve' },
    ],
  },
];

const INITIAL_MEASUREMENTS: StitchingMeasurement[] = [
  {
    _id: 'meas-1001',
    measurementCode: 'MEAS-1001',
    date: '2026-11-15',
    customerName: 'Kavitha Ramachandran',
    customerPhone: '+91 98421 55678',
    customerEmail: 'kavitha.rc@gmail.com',
    customerCity: 'Thoothukudi',
    categorySlug: 'saree-blouse-stitching',
    categoryName: 'Saree Blouse Stitching',
    measurements: {
      bust: '36.5',
      length: '14.5',
      shoulder: '14.0',
      frontNeck: '6.5',
      backNeck: '9.5',
      sleeveLength: '10.5',
      sleeveRound: '12.0',
      waist: '30.0',
      openingStyle: 'Back Hook with Dori Tassel',
    },
    specialInstructions:
      'Princess seam cut. Anti-slip shoulder taping required. Extra 2-inch side seam margin for future adjustments.',
    fitPreference: 'Comfort Fit',
    unit: 'inches',
    createdAt: '2026-11-15T10:30:00.000Z',
  },
  {
    _id: 'meas-1002',
    measurementCode: 'MEAS-1002',
    date: '2026-11-16',
    customerName: 'Priya Soundararajan',
    customerPhone: '+91 94432 87612',
    customerEmail: 'priya.soundar@yahoo.com',
    customerCity: 'Chennai',
    categorySlug: 'bridal-designer-blouses',
    categoryName: 'Bridal & Designer Blouses (Aari Work)',
    measurements: {
      bust: '38.0',
      length: '15.0',
      shoulder: '14.5',
      armhole: '14.0',
      sleeveLength: '11.0',
      sleeveRound: '11.5',
      frontNeck: '7.0',
      backNeck: '10.5',
      lowerBand: '32.0',
      embroideryNotes: 'Full heavy gold zardozi, kundan stones, and peacock motifs on both sleeves & back neck',
    },
    specialInstructions:
      'Muhurtham wedding blouse. Deep pot back with matching silk latkan tassels. Pre-washed pure cotton lining.',
    fitPreference: 'Snug / Tight Fit',
    unit: 'inches',
    createdAt: '2026-11-16T11:45:00.000Z',
  },
  {
    _id: 'meas-1003',
    measurementCode: 'MEAS-1003',
    date: '2026-11-17',
    customerName: 'Ananya & Mother Meenakshi',
    customerPhone: '+91 78712 07631',
    customerEmail: 'meenakshi.ananya@gmail.com',
    customerCity: 'Madurai',
    categorySlug: 'pavadai-sattai-pattu-pavadai',
    categoryName: 'Pavadai Sattai & Pattu Pavadai',
    measurements: {
      childAge: '6 Years (115 cm)',
      blouseChest: '26.0',
      blouseLength: '16.0',
      skirtLength: '28.5',
      waist: '24.0',
      shoulder: '10.5',
      sleeveLength: '5.5 Puff',
    },
    specialInstructions:
      'Traditional temple golden pattu border at hem. Inside cotton lining must cover all seams so it does not irritate child skin.',
    fitPreference: 'Comfort Fit',
    unit: 'inches',
    createdAt: '2026-11-17T14:20:00.000Z',
  },
  {
    _id: 'meas-1004',
    measurementCode: 'MEAS-1004',
    date: '2026-11-18',
    customerName: 'Deepa Muthukrishnan',
    customerPhone: '+91 97890 23456',
    customerCity: 'Tirunelveli',
    categorySlug: 'kurti-salwar-stitching',
    categoryName: 'Kurti & Salwar Stitching',
    measurements: {
      bust: '40.0',
      waist: '35.0',
      hip: '43.0',
      kurtiLength: '43.0',
      pantLength: '38.5',
      pantWaist: '34 Elastic',
      shoulder: '15.0',
      sleeveLength: '16.5',
    },
    specialInstructions: 'Straight cut side slit kurti with contrast potli buttons on front placket. Cigarette pant with pocket.',
    fitPreference: 'Standard Fit',
    unit: 'inches',
    createdAt: '2026-11-18T09:10:00.000Z',
  },
];

const INITIAL_DISPATCH_ORDERS: StitchingDispatchOrder[] = [
  {
    _id: 'stitch-2001',
    stitchingOrderNumber: 'STITCH-2001',
    date: '2026-11-15',
    customerName: 'Kavitha Ramachandran',
    customerPhone: '+91 98421 55678',
    customerAddress: '42, Beach Road, Millerpuram, Thoothukudi - 628008',
    categorySlug: 'saree-blouse-stitching',
    categoryName: 'Saree Blouse Stitching',
    measurementId: 'meas-1001',
    measurementCode: 'MEAS-1001',
    measurementSummary: 'Bust: 36.5", Length: 14.5", Back: 9.5"',
    estimatedDispatchDate: '2026-11-19',
    actualDispatchDate: undefined,
    additionalInformation:
      'Customer dropped off pink Kanchipuram saree blouse bit with antique zari border. Princess cut requested with contrast gold piping.',
    liningType: 'Pure Mulmul Cotton (Pre-Washed)',
    fabricProvidedBy: 'Customer Provided',
    assignedTailor: 'Master Murugan (Atelier 1)',
    priority: 'Normal',
    status: 'Ready for Dispatch',
    stitchingCharge: 550,
    advancePaid: 300,
    balanceDue: 250,
    courierPartner: 'Local Store Pickup',
    trackingNumber: 'LOCAL-TTN-PICKUP',
    notes: 'Trial fitting approved on 18th Nov. Ironed and placed in royal Nalmara gift box.',
    createdAt: '2026-11-15T11:00:00.000Z',
  },
  {
    _id: 'stitch-2002',
    stitchingOrderNumber: 'STITCH-2002',
    date: '2026-11-16',
    customerName: 'Priya Soundararajan',
    customerPhone: '+91 94432 87612',
    customerAddress: '15, 2nd Main Road, Anna Nagar West, Chennai - 600040',
    categorySlug: 'bridal-designer-blouses',
    categoryName: 'Bridal & Designer Blouses (Aari Work)',
    measurementId: 'meas-1002',
    measurementCode: 'MEAS-1002',
    measurementSummary: 'Bust: 38.0", Length: 15.0", Back: 10.5"',
    estimatedDispatchDate: '2026-11-22',
    actualDispatchDate: undefined,
    additionalInformation:
      'Maroon bridal raw silk blouse. Full elbow sleeve heavy Aari zardozi embroidery with jhumka hangings. Deep pot back.',
    liningType: 'Heavy Pure Silk Crepe & Cotton',
    fabricProvidedBy: 'Purchased with Saree',
    assignedTailor: 'Master Selvam (Aari Embroidery Unit)',
    priority: 'Urgent Wedding VIP',
    status: 'Embroidery / Aari',
    stitchingCharge: 2400,
    advancePaid: 1500,
    balanceDue: 900,
    courierPartner: 'ST Courier Express',
    trackingNumber: 'STC984210982',
    notes: 'Wedding on Nov 28th. Aari tracing complete, zardozi work 60% done. Must dispatch by 22nd Nov.',
    createdAt: '2026-11-16T12:00:00.000Z',
  },
  {
    _id: 'stitch-2003',
    stitchingOrderNumber: 'STITCH-2003',
    date: '2026-11-17',
    customerName: 'Ananya & Mother Meenakshi',
    customerPhone: '+91 78712 07631',
    customerAddress: '88, North Veli Street, Simmakkal, Madurai - 625001',
    categorySlug: 'pavadai-sattai-pattu-pavadai',
    categoryName: 'Pavadai Sattai & Pattu Pavadai',
    measurementId: 'meas-1003',
    measurementCode: 'MEAS-1003',
    measurementSummary: 'Age 6Y, Chest: 26", Skirt: 28.5"',
    estimatedDispatchDate: '2026-11-20',
    actualDispatchDate: undefined,
    additionalInformation:
      'Yellow & magenta traditional pattu pavadai with big peacock border. Soft cotton lining throughout so child is comfortable all day.',
    liningType: 'Soft 100% Breathable Cotton',
    fabricProvidedBy: 'Store Fabric',
    assignedTailor: 'Master Vasanth (Kids Atelier)',
    priority: 'Express (48h)',
    status: 'Stitching In Progress',
    stitchingCharge: 750,
    advancePaid: 750,
    balanceDue: 0,
    courierPartner: 'The Professional Couriers',
    trackingNumber: 'TPC7654321',
    notes: 'Full payment received. Cutting completed. Final hem finishing underway.',
    createdAt: '2026-11-17T15:00:00.000Z',
  },
  {
    _id: 'stitch-2004',
    stitchingOrderNumber: 'STITCH-2004',
    date: '2026-11-18',
    customerName: 'Deepa Muthukrishnan',
    customerPhone: '+91 97890 23456',
    customerAddress: '12, South Car Street, Palayamkottai, Tirunelveli - 627002',
    categorySlug: 'kurti-salwar-stitching',
    categoryName: 'Kurti & Salwar Stitching',
    measurementId: 'meas-1004',
    measurementCode: 'MEAS-1004',
    measurementSummary: 'Bust: 40", Length: 43", Pant: 38.5"',
    estimatedDispatchDate: '2026-11-21',
    actualDispatchDate: undefined,
    additionalInformation:
      'Chanderi silk kurti with santoon cigarette pants. Potli button detail on front neckline and sleeves.',
    liningType: 'Soft Cotton Mulmul',
    fabricProvidedBy: 'Customer Provided',
    assignedTailor: 'Master Murugan (Atelier 1)',
    priority: 'Normal',
    status: 'Pattern Cutting',
    stitchingCharge: 600,
    advancePaid: 300,
    balanceDue: 300,
    courierPartner: 'DTDC Express',
    trackingNumber: '',
    notes: 'Fabric inspected and pre-shrunk. Pattern drafted on cutting table.',
    createdAt: '2026-11-18T10:00:00.000Z',
  },
];

interface StitchingState {
  categories: StitchingCategory[];
  measurements: StitchingMeasurement[];
  dispatchOrders: StitchingDispatchOrder[];
  isLoading: boolean;

  // Live Backend Sync Actions
  fetchCategories: () => Promise<void>;
  fetchMeasurements: () => Promise<void>;
  fetchDispatchOrders: () => Promise<void>;
  fetchAll: () => Promise<void>;

  // Category Actions
  addCategory: (category: Omit<StitchingCategory, '_id'>) => Promise<StitchingCategory>;
  updateCategory: (id: string, updates: Partial<StitchingCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryBySlug: (slug: string) => StitchingCategory | undefined;

  // Measurement Actions
  addMeasurement: (
    measurement: Omit<StitchingMeasurement, '_id' | 'measurementCode' | 'createdAt'>
  ) => Promise<StitchingMeasurement>;
  updateMeasurement: (id: string, updates: Partial<StitchingMeasurement>) => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;
  getMeasurementById: (idOrCode: string) => StitchingMeasurement | undefined;
  getMeasurementsByCustomer: (customerNameOrPhone: string) => StitchingMeasurement[];

  // Dispatch Order Actions
  addDispatchOrder: (
    order: Omit<StitchingDispatchOrder, '_id' | 'stitchingOrderNumber' | 'createdAt'>
  ) => Promise<StitchingDispatchOrder>;
  updateDispatchOrder: (id: string, updates: Partial<StitchingDispatchOrder>) => Promise<void>;
  deleteDispatchOrder: (id: string) => Promise<void>;
  updateDispatchStatus: (
    id: string,
    status: StitchingDispatchOrder['status'],
    trackingNumber?: string,
    courierPartner?: string
  ) => Promise<void>;

  // Reset / Reload
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'nalmara_stitching_atelier_v1';

function loadStoredState() {
  if (typeof window === 'undefined') {
    return {
      categories: INITIAL_CATEGORIES,
      measurements: INITIAL_MEASUREMENTS,
      dispatchOrders: INITIAL_DISPATCH_ORDERS,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        categories:
          Array.isArray(parsed.categories) && parsed.categories.length > 0
            ? parsed.categories
            : INITIAL_CATEGORIES,
        measurements:
          Array.isArray(parsed.measurements) && parsed.measurements.length > 0
            ? parsed.measurements
            : INITIAL_MEASUREMENTS,
        dispatchOrders:
          Array.isArray(parsed.dispatchOrders) && parsed.dispatchOrders.length > 0
            ? parsed.dispatchOrders
            : INITIAL_DISPATCH_ORDERS,
      };
    }
  } catch (err) {
    console.warn('Failed to parse stitching store from localStorage:', err);
  }

  return {
    categories: INITIAL_CATEGORIES,
    measurements: INITIAL_MEASUREMENTS,
    dispatchOrders: INITIAL_DISPATCH_ORDERS,
  };
}

function persistState(state: {
  categories: StitchingCategory[];
  measurements: StitchingMeasurement[];
  dispatchOrders: StitchingDispatchOrder[];
}) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist stitching store to localStorage:', err);
  }
}

export const useStitchingStore = create<StitchingState>((set, get) => {
  const initial = loadStoredState();

  return {
    categories: initial.categories,
    measurements: initial.measurements,
    dispatchOrders: initial.dispatchOrders,
    isLoading: false,

    // -------------------------------------------------------------
    // Live Backend Sync Actions
    // -------------------------------------------------------------
    fetchCategories: async () => {
      try {
        const res = await api.get('/stitching/categories');
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          set((state) => {
            const categories = res.data.data;
            persistState({ ...state, categories });
            return { categories };
          });
        }
      } catch (err) {
        console.warn('Stitching categories API fetch fallback to local:', err);
      }
    },

    fetchMeasurements: async () => {
      set({ isLoading: true });
      try {
        const res = await api.get('/stitching/measurements');
        if (res.data?.success && Array.isArray(res.data.data)) {
          set((state) => {
            const serverMeas: StitchingMeasurement[] = res.data.data;
            const serverCodes = new Set(serverMeas.map((m) => m.measurementCode));
            const merged = [
              ...serverMeas,
              ...state.measurements.filter((m) => !serverCodes.has(m.measurementCode)),
            ];
            persistState({ ...state, measurements: merged });
            return { measurements: merged, isLoading: false };
          });
          return;
        }
      } catch (err) {
        console.warn('Stitching measurements API fetch fallback to local:', err);
      } finally {
        set({ isLoading: false });
      }
    },

    fetchDispatchOrders: async () => {
      set({ isLoading: true });
      try {
        const res = await api.get('/stitching/dispatch-orders');
        if (res.data?.success && Array.isArray(res.data.data)) {
          set((state) => {
            const serverOrders: StitchingDispatchOrder[] = res.data.data;
            const serverOrderNums = new Set(serverOrders.map((o) => o.stitchingOrderNumber));
            const merged = [
              ...serverOrders,
              ...state.dispatchOrders.filter((o) => !serverOrderNums.has(o.stitchingOrderNumber)),
            ];
            persistState({ ...state, dispatchOrders: merged });
            return { dispatchOrders: merged, isLoading: false };
          });
          return;
        }
      } catch (err) {
        console.warn('Stitching dispatch orders API fetch fallback to local:', err);
      } finally {
        set({ isLoading: false });
      }
    },

    fetchAll: async () => {
      await Promise.allSettled([
        get().fetchCategories(),
        get().fetchMeasurements(),
        get().fetchDispatchOrders(),
      ]);
    },

    // -------------------------------------------------------------
    // Category Actions
    // -------------------------------------------------------------
    addCategory: async (newCat) => {
      const id = `scat-${Date.now()}`;
      const created: StitchingCategory = {
        ...newCat,
        _id: id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => {
        const next = { ...state, categories: [created, ...state.categories] };
        persistState(next);
        return { categories: next.categories };
      });

      try {
        const res = await api.post('/stitching/categories', newCat);
        if (res.data?.success && res.data.data?._id) {
          const serverCreated = res.data.data;
          set((state) => {
            const updated = state.categories.map((c) => (c._id === id ? serverCreated : c));
            persistState({ ...state, categories: updated });
            return { categories: updated };
          });
        }
      } catch (err) {
        console.warn('Category created locally; server sync deferred:', err);
      }
      return created;
    },

    updateCategory: async (id, updates) => {
      set((state) => {
        const updated = state.categories.map((c) =>
          c._id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
        );
        persistState({ ...state, categories: updated });
        return { categories: updated };
      });

      try {
        await api.put(`/stitching/categories/${id}`, updates);
      } catch (err) {
        console.warn('Category updated locally; server sync deferred:', err);
      }
    },

    deleteCategory: async (id) => {
      set((state) => {
        const filtered = state.categories.filter((c) => c._id !== id);
        persistState({ ...state, categories: filtered });
        return { categories: filtered };
      });

      try {
        await api.delete(`/stitching/categories/${id}`);
      } catch (err) {
        console.warn('Category deleted locally; server sync deferred:', err);
      }
    },

    getCategoryBySlug: (slug) => {
      return get().categories.find((c) => c.slug === slug);
    },

    // -------------------------------------------------------------
    // Measurement Actions
    // -------------------------------------------------------------
    addMeasurement: async (data) => {
      const count = get().measurements.length + 1001;
      const code = `MEAS-${count}`;
      const id = `meas-${Date.now()}`;

      const created: StitchingMeasurement = {
        ...data,
        _id: id,
        measurementCode: code,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => {
        const next = { ...state, measurements: [created, ...state.measurements] };
        persistState(next);
        return { measurements: next.measurements };
      });

      try {
        const res = await api.post('/stitching/measurements', data);
        if (res.data?.success && res.data.data?._id) {
          const serverCreated = res.data.data;
          set((state) => {
            const updated = state.measurements.map((m) => (m._id === id ? serverCreated : m));
            persistState({ ...state, measurements: updated });
            return { measurements: updated };
          });
        }
      } catch (err) {
        console.warn('Measurement recorded locally; server sync deferred:', err);
      }

      return created;
    },

    updateMeasurement: async (id, updates) => {
      set((state) => {
        const updated = state.measurements.map((m) =>
          m._id === id || m.measurementCode === id
            ? { ...m, ...updates, updatedAt: new Date().toISOString() }
            : m
        );
        persistState({ ...state, measurements: updated });
        return { measurements: updated };
      });

      try {
        await api.put(`/stitching/measurements/${id}`, updates);
      } catch (err) {
        console.warn('Measurement updated locally; server sync deferred:', err);
      }
    },

    deleteMeasurement: async (id) => {
      set((state) => {
        const filtered = state.measurements.filter(
          (m) => m._id !== id && m.measurementCode !== id
        );
        persistState({ ...state, measurements: filtered });
        return { measurements: filtered };
      });

      try {
        await api.delete(`/stitching/measurements/${id}`);
      } catch (err) {
        console.warn('Measurement deleted locally; server sync deferred:', err);
      }
    },

    getMeasurementById: (idOrCode) => {
      if (!idOrCode) return undefined;
      const clean = idOrCode.trim().toLowerCase();
      return get().measurements.find(
        (m) =>
          m._id.toLowerCase() === clean ||
          m.measurementCode.toLowerCase() === clean
      );
    },

    getMeasurementsByCustomer: (query) => {
      if (!query) return [];
      const clean = query.trim().toLowerCase();
      return get().measurements.filter(
        (m) =>
          m.customerName.toLowerCase().includes(clean) ||
          m.customerPhone.replace(/[^0-9]/g, '').includes(clean.replace(/[^0-9]/g, ''))
      );
    },

    // -------------------------------------------------------------
    // Dispatch Order Actions
    // -------------------------------------------------------------
    addDispatchOrder: async (data) => {
      const count = get().dispatchOrders.length + 2001;
      const number = `STITCH-${count}`;
      const id = `stitch-${Date.now()}`;

      const created: StitchingDispatchOrder = {
        ...data,
        _id: id,
        stitchingOrderNumber: number,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => {
        const next = { ...state, dispatchOrders: [created, ...state.dispatchOrders] };
        persistState(next);
        return { dispatchOrders: next.dispatchOrders };
      });

      try {
        const res = await api.post('/stitching/dispatch-orders', data);
        if (res.data?.success && res.data.data?._id) {
          const serverCreated = res.data.data;
          set((state) => {
            const updated = state.dispatchOrders.map((o) => (o._id === id ? serverCreated : o));
            persistState({ ...state, dispatchOrders: updated });
            return { dispatchOrders: updated };
          });
        }
      } catch (err) {
        console.warn('Order recorded locally; server sync deferred:', err);
      }

      return created;
    },

    updateDispatchOrder: async (id, updates) => {
      set((state) => {
        const updated = state.dispatchOrders.map((o) =>
          o._id === id || o.stitchingOrderNumber === id
            ? { ...o, ...updates, updatedAt: new Date().toISOString() }
            : o
        );
        persistState({ ...state, dispatchOrders: updated });
        return { dispatchOrders: updated };
      });

      try {
        await api.put(`/stitching/dispatch-orders/${id}`, updates);
      } catch (err) {
        console.warn('Order updated locally; server sync deferred:', err);
      }
    },

    deleteDispatchOrder: async (id) => {
      set((state) => {
        const filtered = state.dispatchOrders.filter(
          (o) => o._id !== id && o.stitchingOrderNumber !== id
        );
        persistState({ ...state, dispatchOrders: filtered });
        return { dispatchOrders: filtered };
      });

      try {
        await api.delete(`/stitching/dispatch-orders/${id}`);
      } catch (err) {
        console.warn('Order deleted locally; server sync deferred:', err);
      }
    },

    updateDispatchStatus: async (id, status, trackingNumber, courierPartner) => {
      set((state) => {
        const updated = state.dispatchOrders.map((o) => {
          if (o._id === id || o.stitchingOrderNumber === id) {
            return {
              ...o,
              status,
              ...(trackingNumber !== undefined ? { trackingNumber } : {}),
              ...(courierPartner !== undefined ? { courierPartner } : {}),
              ...(status === 'Dispatched' && !o.actualDispatchDate
                ? { actualDispatchDate: new Date().toISOString().split('T')[0] }
                : {}),
              updatedAt: new Date().toISOString(),
            };
          }
          return o;
        });
        persistState({ ...state, dispatchOrders: updated });
        return { dispatchOrders: updated };
      });

      try {
        await api.put(`/stitching/dispatch-orders/${id}`, {
          status,
          ...(trackingNumber !== undefined ? { trackingNumber } : {}),
          ...(courierPartner !== undefined ? { courierPartner } : {}),
        });
      } catch (err) {
        console.warn('Order status updated locally; server sync deferred:', err);
      }
    },

    resetToDefaults: () => {
      const resetState = {
        categories: INITIAL_CATEGORIES,
        measurements: INITIAL_MEASUREMENTS,
        dispatchOrders: INITIAL_DISPATCH_ORDERS,
      };
      persistState(resetState);
      set(resetState);
    },
  };
});

