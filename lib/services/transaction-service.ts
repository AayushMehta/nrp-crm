// lib/services/transaction-service.ts
// Transaction management service

import { LocalStorageService } from '@/lib/storage/localStorage';
import type { Transaction, TransactionSummary, TransactionType, TransactionStatus } from '@/types/transactions';

const STORAGE_KEY = 'nrp_crm_transactions';

export class TransactionService {

  /**
   * Get all transactions for a family
   */
  static getTransactionsByFamily(familyId: string): Transaction[] {
    const allTransactions = this.getAllTransactions();
    return allTransactions
      .filter(t => t.family_id === familyId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Get recent N transactions for a family
   */
  static getRecentTransactions(familyId: string, limit: number = 10): Transaction[] {
    const transactions = this.getTransactionsByFamily(familyId);
    return transactions.slice(0, limit);
  }

  /**
   * Get all transactions (Admin/RM)
   */
  static getAllTransactions(): Transaction[] {
    return LocalStorageService.get<Transaction[]>(STORAGE_KEY, []);
  }

  /**
   * Get transactions by portfolio
   */
  static getTransactionsByPortfolio(portfolioId: string): Transaction[] {
    const allTransactions = this.getAllTransactions();
    return allTransactions
      .filter(t => t.portfolio_id === portfolioId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Get transactions by type
   */
  static getTransactionsByType(familyId: string, type: TransactionType): Transaction[] {
    const transactions = this.getTransactionsByFamily(familyId);
    return transactions.filter(t => t.type === type);
  }

  /**
   * Get transactions by status
   */
  static getTransactionsByStatus(familyId: string, status: TransactionStatus): Transaction[] {
    const transactions = this.getTransactionsByFamily(familyId);
    return transactions.filter(t => t.status === status);
  }

  /**
   * Create new transaction
   */
  static createTransaction(data: Omit<Transaction, 'id' | 'created_at'>): Transaction {
    const transaction: Transaction = {
      ...data,
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };

    const transactions = this.getAllTransactions();
    transactions.push(transaction);
    LocalStorageService.set(STORAGE_KEY, transactions);

    return transaction;
  }

  /**
   * Get transaction summary for a family
   */
  static getTransactionSummary(familyId: string): TransactionSummary {
    const transactions = this.getTransactionsByFamily(familyId)
      .filter(t => t.status === 'completed');

    const totalInvested = transactions
      .filter(t => t.type === 'buy' || t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawn = transactions
      .filter(t => t.type === 'sell' || t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
      .filter(t => t.type === 'dividend' || t.type === 'interest')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      total_transactions: transactions.length,
      total_invested: totalInvested,
      total_withdrawn: totalWithdrawn,
      total_income: totalIncome,
      net_cashflow: totalInvested - totalWithdrawn,
    };
  }

  /**
   * Update transaction status
   */
  static updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus
  ): Transaction | null {
    const transactions = this.getAllTransactions();
    const index = transactions.findIndex(t => t.id === transactionId);

    if (index >= 0) {
      transactions[index].status = status;
      LocalStorageService.set(STORAGE_KEY, transactions);
      return transactions[index];
    }

    return null;
  }

  /**
   * Update transaction
   */
  static updateTransaction(
    transactionId: string,
    updates: Partial<Transaction>
  ): Transaction | null {
    const transactions = this.getAllTransactions();
    const index = transactions.findIndex(t => t.id === transactionId);

    if (index >= 0) {
      transactions[index] = { ...transactions[index], ...updates };
      LocalStorageService.set(STORAGE_KEY, transactions);
      return transactions[index];
    }

    return null;
  }

  /**
   * Delete transaction
   */
  static deleteTransaction(transactionId: string): boolean {
    const transactions = this.getAllTransactions();
    const filtered = transactions.filter(t => t.id !== transactionId);

    if (filtered.length < transactions.length) {
      LocalStorageService.set(STORAGE_KEY, filtered);
      return true;
    }

    return false;
  }

  /**
   * Get transactions within date range
   */
  static getTransactionsByDateRange(
    familyId: string,
    startDate: string,
    endDate: string
  ): Transaction[] {
    const transactions = this.getTransactionsByFamily(familyId);
    return transactions.filter(t => {
      const txnDate = new Date(t.date);
      return txnDate >= new Date(startDate) && txnDate <= new Date(endDate);
    });
  }

  /**
   * Get pending transactions count
   */
  static getPendingTransactionsCount(familyId: string): number {
    const transactions = this.getTransactionsByFamily(familyId);
    return transactions.filter(t => t.status === 'pending').length;
  }

  /**
   * Get cashflow analysis data for charts (monthly grouped)
   * Returns invested, withdrawn, and net cashflow per month
   */
  static getCashflowAnalysis(familyId: string, months: number = 6): Array<{
    month: string;
    invested: number;
    withdrawn: number;
    net: number;
  }> {
    const transactions = this.getTransactionsByFamily(familyId).filter(t => t.status === 'completed');
    const data: Record<string, { invested: number; withdrawn: number }> = {};
    const now = new Date();

    // Initialize months
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      data[monthKey] = { invested: 0, withdrawn: 0 };
    }

    // Group transactions by month
    transactions.forEach(txn => {
      const date = new Date(txn.date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (data[monthKey]) {
        const isInflow = ['buy', 'deposit', 'dividend', 'interest'].includes(txn.type);
        if (isInflow) {
          data[monthKey].invested += txn.amount;
        } else {
          data[monthKey].withdrawn += txn.amount;
        }
      }
    });

    // Convert to array with net calculation
    return Object.entries(data).map(([month, values]) => ({
      month,
      invested: Math.round(values.invested),
      withdrawn: Math.round(values.withdrawn),
      net: Math.round(values.invested - values.withdrawn),
    }));
  }
}
