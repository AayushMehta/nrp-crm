// lib/services/seed-data.ts
// Seeds localStorage with realistic demo data for portfolios, transactions, meetings, documents

import { LocalStorageService } from '@/lib/storage/localStorage';
import type { Portfolio, Holding, AssetClass } from '@/types/portfolio';

const PORTFOLIO_KEY = 'nrp_crm_portfolios';
const TRANSACTIONS_KEY = 'nrp_crm_transactions';
const MEETINGS_KEY = 'nrp_crm_meetings';
const DOCUMENTS_KEY = 'nrp_crm_documents';
const SEED_FLAG = 'nrp_crm_seeded_v2';

interface SeedTransaction {
    id: string;
    family_id: string;
    type: 'buy' | 'sell' | 'dividend' | 'sip';
    security_name: string;
    asset_class: string;
    amount: number;
    units: number;
    nav: number;
    date: string;
    status: 'completed' | 'pending' | 'failed';
    folio_number: string;
}

interface SeedMeeting {
    id: string;
    family_id: string;
    family_name: string;
    title: string;
    date: string;
    time: string;
    duration: string;
    type: 'review' | 'onboarding' | 'planning';
    status: 'scheduled' | 'completed';
    rm_id: string;
    notes: string;
}

interface SeedDocument {
    id: string;
    family_id: string;
    family_name: string;
    name: string;
    type: string;
    status: 'verified' | 'pending' | 'rejected';
    uploaded_at: string;
    size: number;
}

function h(
    id: string, portfolioId: string, name: string, assetClass: AssetClass,
    qty: number, avgCost: number, curPrice: number
): Holding {
    const invested = qty * avgCost;
    const current = qty * curPrice;
    return {
        id,
        portfolio_id: portfolioId,
        security_name: name,
        asset_class: assetClass,
        quantity: qty,
        avg_cost: avgCost,
        current_price: curPrice,
        invested_value: invested,
        current_value: current,
        unrealized_gain: current - invested,
        unrealized_gain_percent: invested > 0 ? ((current - invested) / invested) * 100 : 0,
    };
}

function createSharmaPortfolio(): Portfolio {
    const pid = 'portfolio-001';
    const holdings: Holding[] = [
        h('h-s1', pid, 'HDFC Flexi Cap Fund - Growth', 'equity', 1250, 1420, 1685),
        h('h-s2', pid, 'ICICI Pru Bluechip Fund - Growth', 'equity', 980, 785, 923),
        h('h-s3', pid, 'SBI Magnum Mid Cap Fund', 'equity', 620, 1890, 2345),
        h('h-s4', pid, 'Axis Long Term Equity Fund', 'equity', 850, 720, 812),
        h('h-s5', pid, 'HDFC Corporate Bond Fund', 'debt', 4200, 28.5, 30.2),
        h('h-s6', pid, 'ICICI Pru All Seasons Bond Fund', 'debt', 18000, 32.1, 33.8),
        h('h-s7', pid, 'SBI Gold ETF', 'gold', 150, 4850, 5920),
        h('h-s8', pid, 'Kotak Liquid Fund - Growth', 'cash', 520, 4620, 4780),
        h('h-s9', pid, 'Nippon India Small Cap Fund', 'equity', 3200, 125, 168),
        h('h-s10', pid, 'Parag Parikh Flexi Cap Fund', 'equity', 1100, 580, 712),
    ];

    const totalInvested = holdings.reduce((s, x) => s + x.invested_value, 0);
    const totalValue = holdings.reduce((s, x) => s + x.current_value, 0);

    return {
        id: pid,
        family_id: 'fam-001',
        family_name: 'Sharma Family',
        holdings,
        total_value: totalValue,
        total_invested: totalInvested,
        total_gain: totalValue - totalInvested,
        total_gain_percent: ((totalValue - totalInvested) / totalInvested) * 100,
        asset_allocation: [],
        last_updated: new Date().toISOString(),
    };
}

function createPatelPortfolio(): Portfolio {
    const pid = 'portfolio-002';
    const holdings: Holding[] = [
        h('h-p1', pid, 'Mirae Asset Large Cap Fund', 'equity', 2400, 890, 1045),
        h('h-p2', pid, 'Tata Digital India Fund', 'equity', 1800, 420, 512),
        h('h-p3', pid, 'HDFC Short Term Debt Fund', 'debt', 12000, 26.8, 28.1),
        h('h-p4', pid, 'UTI Nifty 50 Index Fund', 'equity', 3500, 152, 178),
        h('h-p5', pid, 'Nippon India Gold BeES', 'gold', 80, 5100, 5920),
        h('h-p6', pid, 'DSP Tax Saver Fund', 'equity', 1200, 680, 785),
    ];

    const totalInvested = holdings.reduce((s, x) => s + x.invested_value, 0);
    const totalValue = holdings.reduce((s, x) => s + x.current_value, 0);

    return {
        id: pid,
        family_id: 'fam-002',
        family_name: 'Patel Family',
        holdings,
        total_value: totalValue,
        total_invested: totalInvested,
        total_gain: totalValue - totalInvested,
        total_gain_percent: ((totalValue - totalInvested) / totalInvested) * 100,
        asset_allocation: [],
        last_updated: new Date().toISOString(),
    };
}

function createTransactions(): SeedTransaction[] {
    const now = new Date();
    const d = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

    return [
        { id: 'txn-1', family_id: 'fam-001', type: 'sip', security_name: 'HDFC Flexi Cap Fund', asset_class: 'equity', amount: 25000, units: 14.8, nav: 1689, date: d(2), status: 'completed', folio_number: 'FOL-001' },
        { id: 'txn-2', family_id: 'fam-001', type: 'sip', security_name: 'ICICI Pru Bluechip Fund', asset_class: 'equity', amount: 15000, units: 16.25, nav: 923, date: d(2), status: 'completed', folio_number: 'FOL-002' },
        { id: 'txn-3', family_id: 'fam-001', type: 'buy', security_name: 'Nippon India Small Cap Fund', asset_class: 'equity', amount: 50000, units: 297.6, nav: 168, date: d(5), status: 'completed', folio_number: 'FOL-009' },
        { id: 'txn-4', family_id: 'fam-001', type: 'dividend', security_name: 'HDFC Corporate Bond Fund', asset_class: 'debt', amount: 8500, units: 0, nav: 30.2, date: d(8), status: 'completed', folio_number: 'FOL-005' },
        { id: 'txn-5', family_id: 'fam-001', type: 'sell', security_name: 'Kotak Liquid Fund', asset_class: 'cash', amount: 100000, units: 20.9, nav: 4780, date: d(12), status: 'completed', folio_number: 'FOL-008' },
        { id: 'txn-6', family_id: 'fam-002', type: 'sip', security_name: 'Mirae Asset Large Cap Fund', asset_class: 'equity', amount: 20000, units: 19.14, nav: 1045, date: d(3), status: 'completed', folio_number: 'FOL-P01' },
        { id: 'txn-7', family_id: 'fam-002', type: 'buy', security_name: 'UTI Nifty 50 Index Fund', asset_class: 'equity', amount: 30000, units: 168.5, nav: 178, date: d(7), status: 'completed', folio_number: 'FOL-P04' },
        { id: 'txn-8', family_id: 'fam-002', type: 'sip', security_name: 'DSP Tax Saver Fund', asset_class: 'equity', amount: 10000, units: 12.74, nav: 785, date: d(4), status: 'completed', folio_number: 'FOL-P06' },
        { id: 'txn-9', family_id: 'fam-001', type: 'sip', security_name: 'Parag Parikh Flexi Cap Fund', asset_class: 'equity', amount: 20000, units: 28.09, nav: 712, date: d(1), status: 'pending', folio_number: 'FOL-010' },
        { id: 'txn-10', family_id: 'fam-002', type: 'buy', security_name: 'Nippon India Gold BeES', asset_class: 'gold', amount: 25000, units: 4.22, nav: 5920, date: d(6), status: 'completed', folio_number: 'FOL-P05' },
    ];
}

function createMeetings(): SeedMeeting[] {
    const now = new Date();
    const d = (daysOffset: number) => {
        const date = new Date(now.getTime() + daysOffset * 86400000);
        return date.toISOString().split('T')[0];
    };

    return [
        { id: 'meet-1', family_id: 'fam-001', family_name: 'Sharma Family', title: 'Quarterly Portfolio Review', date: d(2), time: '10:00 AM', duration: '1h', type: 'review', status: 'scheduled', rm_id: 'rm-1', notes: 'Review asset allocation and rebalancing strategy' },
        { id: 'meet-2', family_id: 'fam-002', family_name: 'Patel Family', title: 'Tax Planning Discussion', date: d(4), time: '3:00 PM', duration: '45m', type: 'planning', status: 'scheduled', rm_id: 'rm-1', notes: 'Discuss ELSS investments and tax-saving options for FY26' },
        { id: 'meet-3', family_id: 'fam-001', family_name: 'Sharma Family', title: 'SIP Review & Adjustment', date: d(-5), time: '11:00 AM', duration: '30m', type: 'review', status: 'completed', rm_id: 'rm-1', notes: 'Increased SIP in mid-cap fund by ₹10K' },
        { id: 'meet-4', family_id: 'fam-002', family_name: 'Patel Family', title: 'Onboarding Follow-up', date: d(-10), time: '2:00 PM', duration: '1h', type: 'onboarding', status: 'completed', rm_id: 'rm-1', notes: 'KYC verification complete, risk profile discussed' },
    ];
}

function createDocuments(): SeedDocument[] {
    const now = new Date();
    const d = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

    return [
        { id: 'doc-1', family_id: 'fam-001', family_name: 'Sharma Family', name: 'PAN Card - Rajesh Sharma', type: 'pan_card', status: 'verified', uploaded_at: d(30), size: 245000 },
        { id: 'doc-2', family_id: 'fam-001', family_name: 'Sharma Family', name: 'Aadhaar Card - Rajesh Sharma', type: 'aadhaar', status: 'verified', uploaded_at: d(30), size: 312000 },
        { id: 'doc-3', family_id: 'fam-001', family_name: 'Sharma Family', name: 'Bank Statement - Q3 2025', type: 'bank_statement', status: 'verified', uploaded_at: d(15), size: 890000 },
        { id: 'doc-4', family_id: 'fam-001', family_name: 'Sharma Family', name: 'ITR - AY 2025-26', type: 'itr', status: 'pending', uploaded_at: d(3), size: 1240000 },
        { id: 'doc-5', family_id: 'fam-002', family_name: 'Patel Family', name: 'PAN Card - Amit Patel', type: 'pan_card', status: 'verified', uploaded_at: d(45), size: 289000 },
        { id: 'doc-6', family_id: 'fam-002', family_name: 'Patel Family', name: 'Address Proof - Utility Bill', type: 'address_proof', status: 'verified', uploaded_at: d(42), size: 510000 },
        { id: 'doc-7', family_id: 'fam-002', family_name: 'Patel Family', name: 'Cancelled Cheque - HDFC Bank', type: 'cancelled_cheque', status: 'pending', uploaded_at: d(5), size: 180000 },
    ];
}

/**
 * Seed all demo data into localStorage.
 * Only seeds once — checks a flag to avoid overwriting user changes.
 */
export function seedDemoData(): void {
    if (typeof window === 'undefined') return;

    const alreadySeeded = localStorage.getItem(SEED_FLAG);
    if (alreadySeeded) return;

    console.log('🌱 Seeding demo data...');

    // Portfolios
    const existingPortfolios = LocalStorageService.get<Portfolio[]>(PORTFOLIO_KEY, []);
    if (existingPortfolios.length === 0) {
        const portfolios = [createSharmaPortfolio(), createPatelPortfolio()];
        LocalStorageService.set(PORTFOLIO_KEY, portfolios);
        console.log(`  ✅ Seeded ${portfolios.length} portfolios`);
    }

    // Transactions
    const existingTxns = LocalStorageService.get<SeedTransaction[]>(TRANSACTIONS_KEY, []);
    if (existingTxns.length === 0) {
        const transactions = createTransactions();
        LocalStorageService.set(TRANSACTIONS_KEY, transactions);
        console.log(`  ✅ Seeded ${transactions.length} transactions`);
    }

    // Meetings
    const existingMeetings = LocalStorageService.get<SeedMeeting[]>(MEETINGS_KEY, []);
    if (existingMeetings.length === 0) {
        const meetings = createMeetings();
        LocalStorageService.set(MEETINGS_KEY, meetings);
        console.log(`  ✅ Seeded ${meetings.length} meetings`);
    }

    // Documents
    const existingDocs = LocalStorageService.get<SeedDocument[]>(DOCUMENTS_KEY, []);
    if (existingDocs.length === 0) {
        const documents = createDocuments();
        LocalStorageService.set(DOCUMENTS_KEY, documents);
        console.log(`  ✅ Seeded ${documents.length} documents`);
    }

    localStorage.setItem(SEED_FLAG, 'true');
    console.log('🌱 Demo data seeding complete!');
}
