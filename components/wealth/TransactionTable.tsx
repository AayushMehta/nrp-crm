// components/wealth/TransactionTable.tsx
// Transaction history table with filtering

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, ArrowDownLeft, TrendingUp, DollarSign, Wallet, ArrowLeftRight } from "lucide-react";
import type { Transaction, TransactionType, TransactionStatus } from "@/types/transactions";
import { cn } from "@/lib/utils";

interface TransactionTableProps {
  transactions: Transaction[];
  title?: string;
  description?: string;
  showFilter?: boolean;
}

const TRANSACTION_TYPE_CONFIG: Record<TransactionType, { label: string; icon: any; color: string }> = {
  buy: { label: 'Buy', icon: ArrowUpRight, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  sell: { label: 'Sell', icon: ArrowDownLeft, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' },
  dividend: { label: 'Dividend', icon: TrendingUp, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  interest: { label: 'Interest', icon: DollarSign, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  deposit: { label: 'Deposit', icon: Wallet, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
  withdrawal: { label: 'Withdrawal', icon: ArrowLeftRight, color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
};

const STATUS_CONFIG: Record<TransactionStatus, { label: string; color: string }> = {
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
};

export function TransactionTable({
  transactions,
  title = "Transaction History",
  description = "Recent portfolio transactions",
  showFilter = true
}: TransactionTableProps) {
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>('all');

  // Filter transactions
  const filteredTransactions = transactions.filter(txn => {
    if (filterType !== 'all' && txn.type !== filterType) return false;
    if (filterStatus !== 'all' && txn.status !== filterStatus) return false;
    return true;
  });

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            No transactions found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>

          {showFilter && (
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={(value) => setFilterType(value as TransactionType | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="dividend">Dividend</SelectItem>
                  <SelectItem value="interest">Interest</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as TransactionStatus | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-200 dark:border-gray-700">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead className="w-[200px]">Security</TableHead>
                <TableHead className="text-right w-[100px]">Quantity</TableHead>
                <TableHead className="text-right w-[120px]">Amount</TableHead>
                <TableHead className="text-center w-[120px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400 h-32">
                    No transactions match the selected filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((txn) => {
                  const typeConfig = TRANSACTION_TYPE_CONFIG[txn.type];
                  const statusConfig = STATUS_CONFIG[txn.status];
                  const TypeIcon = typeConfig.icon;

                  return (
                    <TableRow key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="text-sm">
                        {formatDate(txn.date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs flex items-center gap-1 w-fit", typeConfig.color)}>
                          <TypeIcon className="h-3 w-3" />
                          {typeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="max-w-[190px] truncate" title={txn.security_name || '-'}>
                          {txn.security_name || '-'}
                        </div>
                        {txn.asset_class && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {txn.asset_class.replace('_', ' ')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {txn.quantity ? txn.quantity.toLocaleString('en-IN') : '-'}
                        {txn.price && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            @ ₹{txn.price.toLocaleString('en-IN')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={cn(
                          txn.type === 'buy' || txn.type === 'withdrawal' ? "text-red-600 dark:text-red-400" :
                          txn.type === 'sell' || txn.type === 'dividend' || txn.type === 'interest' || txn.type === 'deposit' ? "text-green-600 dark:text-green-400" :
                          ""
                        )}>
                          {(txn.type === 'buy' || txn.type === 'withdrawal') && '-'}
                          {(txn.type === 'sell' || txn.type === 'dividend' || txn.type === 'interest' || txn.type === 'deposit') && '+'}
                          ₹{formatAmount(txn.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        {filteredTransactions.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </span>
            <span>
              Total: ₹{formatAmount(calculateTotal(filteredTransactions))}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Format date in readable format
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format amount in Indian format
 */
function formatAmount(amount: number): string {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `${(amount / 100000).toFixed(2)}L`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  } else {
    return amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }
}

/**
 * Calculate net total of transactions
 */
function calculateTotal(transactions: Transaction[]): number {
  return transactions.reduce((sum, txn) => {
    if (txn.type === 'buy' || txn.type === 'withdrawal') {
      return sum - txn.amount;
    } else {
      return sum + txn.amount;
    }
  }, 0);
}
