import { create } from 'zustand';
import { Transaction, Budget, SavingsGoal, ExpenseCategory } from '@/types';
import { parseISO, isSameMonth, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { isDateLocked } from '@/lib/date-utils';
import { repositoryFactory } from '@/lib/repositories/factory';
import { getCurrentUserId } from '@/lib/firebase/config';

interface FinanceStore {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  isLoading: boolean;
  isLoaded: boolean;
  loadFinances: (userId?: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>, userId?: string) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>, overrideLock?: boolean, userId?: string) => Promise<void>;
  deleteTransaction: (id: string, overrideLock?: boolean, userId?: string) => Promise<void>;
  setBudget: (category: ExpenseCategory, monthlyLimit: number, userId?: string) => Promise<void>;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>, userId?: string) => Promise<void>;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>, userId?: string) => Promise<void>;
  deleteSavingsGoal: (id: string, userId?: string) => Promise<void>;
  depositToSavings: (id: string, amount: number, userId?: string) => Promise<void>;
  withdrawFromSavings: (id: string, amount: number, userId?: string) => Promise<void>;
  getTransactionsByMonth: (date: Date) => Transaction[];
  getTransactionsByRange: (startDate: Date, endDate: Date) => Transaction[];
  getMonthlySummary: (date: Date) => { totalIncome: number; totalExpenses: number; netBalance: number };
  resetStore: () => void;
}

export const useFinanceStore = create<FinanceStore>()((set, get) => ({
  transactions: [],
  budgets: [],
  savingsGoals: [],
  isLoading: false,
  isLoaded: false,

  resetStore: () => set({ transactions: [], budgets: [], savingsGoals: [], isLoading: false, isLoaded: false }),

  loadFinances: async (userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    set({ isLoading: true });
    try {
      const repo = repositoryFactory.getFinanceRepository();
      const [transactions, budgets, savingsGoals] = await Promise.all([
        repo.getTransactions(uid),
        repo.getBudgets(uid),
        repo.getSavingsGoals(uid),
      ]);
      set({ transactions, budgets, savingsGoals, isLoaded: true, isLoading: false });
    } catch (error) {
      console.error('[FinanceStore] Error loading finance data from Firestore:', error);
      set({ isLoading: false });
    }
  },

  addTransaction: async (transactionData, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
    };

    set((state) => ({
      transactions: [newTransaction, ...state.transactions],
    }));

    try {
      await repositoryFactory.getFinanceRepository().saveTransaction(uid, newTransaction);
    } catch (error) {
      console.error('[FinanceStore] Error saving transaction to Firestore:', error);
    }
  },

  updateTransaction: async (id, updates, overrideLock = false, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    const existing = get().transactions.find((tx) => tx.id === id);
    if (existing && isDateLocked(existing.date) && !overrideLock) {
      console.warn(`[Lock Enforcement] Transaction on date ${existing.date} is locked.`);
      return;
    }

    let updatedTx: Transaction | null = null;
    set((state) => ({
      transactions: state.transactions.map((tx) => {
        if (tx.id === id) {
          updatedTx = { ...tx, ...updates };
          return updatedTx;
        }
        return tx;
      }),
    }));

    if (updatedTx) {
      try {
        await repositoryFactory.getFinanceRepository().saveTransaction(uid, updatedTx);
      } catch (error) {
        console.error('[FinanceStore] Error updating transaction in Firestore:', error);
      }
    }
  },

  deleteTransaction: async (id, overrideLock = false, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    const existing = get().transactions.find((tx) => tx.id === id);
    if (existing && isDateLocked(existing.date) && !overrideLock) {
      console.warn(`[Lock Enforcement] Transaction on date ${existing.date} is locked.`);
      return;
    }

    set((state) => ({
      transactions: state.transactions.filter((tx) => tx.id !== id),
    }));

    try {
      await repositoryFactory.getFinanceRepository().deleteTransaction(uid, id);
    } catch (error) {
      console.error('[FinanceStore] Error deleting transaction from Firestore:', error);
    }
  },

  setBudget: async (category, monthlyLimit, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    let updatedBudgets: Budget[] = [];
    set((state) => {
      const existingIndex = state.budgets.findIndex((b) => b.category === category);
      if (existingIndex >= 0) {
        updatedBudgets = [...state.budgets];
        updatedBudgets[existingIndex] = { category, monthlyLimit };
        return { budgets: updatedBudgets };
      }
      updatedBudgets = [...state.budgets, { category, monthlyLimit }];
      return { budgets: updatedBudgets };
    });

    try {
      await repositoryFactory.getFinanceRepository().saveBudgets(uid, updatedBudgets);
    } catch (error) {
      console.error('[FinanceStore] Error saving budgets to Firestore:', error);
    }
  },

  addSavingsGoal: async (goalData, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    const newGoal: SavingsGoal = {
      ...goalData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      savingsGoals: [...(state.savingsGoals || []), newGoal],
    }));

    try {
      await repositoryFactory.getFinanceRepository().saveSavingsGoal(uid, newGoal);
    } catch (error) {
      console.error('[FinanceStore] Error saving savings goal to Firestore:', error);
    }
  },

  updateSavingsGoal: async (id, updates, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    let updatedGoal: SavingsGoal | null = null;
    set((state) => ({
      savingsGoals: (state.savingsGoals || []).map((goal) => {
        if (goal.id === id) {
          updatedGoal = { ...goal, ...updates };
          return updatedGoal;
        }
        return goal;
      }),
    }));

    if (updatedGoal) {
      try {
        await repositoryFactory.getFinanceRepository().saveSavingsGoal(uid, updatedGoal);
      } catch (error) {
        console.error('[FinanceStore] Error updating savings goal in Firestore:', error);
      }
    }
  },

  deleteSavingsGoal: async (id, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    set((state) => ({
      savingsGoals: (state.savingsGoals || []).filter((goal) => goal.id !== id),
    }));

    try {
      await repositoryFactory.getFinanceRepository().deleteSavingsGoal(uid, id);
    } catch (error) {
      console.error('[FinanceStore] Error deleting savings goal from Firestore:', error);
    }
  },

  depositToSavings: async (id, amount, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    let targetGoal: SavingsGoal | null = null;
    set((state) => ({
      savingsGoals: (state.savingsGoals || []).map((goal) => {
        if (goal.id === id) {
          targetGoal = { ...goal, currentAmount: Math.max(0, goal.currentAmount + amount) };
          return targetGoal;
        }
        return goal;
      }),
    }));

    if (targetGoal) {
      try {
        await repositoryFactory.getFinanceRepository().saveSavingsGoal(uid, targetGoal);
      } catch (error) {
        console.error('[FinanceStore] Error depositing to savings in Firestore:', error);
      }
    }
  },

  withdrawFromSavings: async (id, amount, userId) => {
    const uid = userId || getCurrentUserId("demo_user");
    let targetGoal: SavingsGoal | null = null;
    set((state) => ({
      savingsGoals: (state.savingsGoals || []).map((goal) => {
        if (goal.id === id) {
          targetGoal = { ...goal, currentAmount: Math.max(0, goal.currentAmount - amount) };
          return targetGoal;
        }
        return goal;
      }),
    }));

    if (targetGoal) {
      try {
        await repositoryFactory.getFinanceRepository().saveSavingsGoal(uid, targetGoal);
      } catch (error) {
        console.error('[FinanceStore] Error withdrawing from savings in Firestore:', error);
      }
    }
  },

  getTransactionsByMonth: (date) => {
    return get().transactions.filter((tx) =>
      isSameMonth(parseISO(tx.date), date)
    );
  },

  getTransactionsByRange: (startDate, endDate) => {
    return get().transactions.filter((tx) => {
      const txDate = parseISO(tx.date);
      return isWithinInterval(txDate, {
        start: startOfDay(startDate),
        end: endOfDay(endDate),
      });
    });
  },

  getMonthlySummary: (date) => {
    const monthTx = get().getTransactionsByMonth(date);
    let totalIncome = 0;
    let totalExpenses = 0;

    monthTx.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpenses += tx.amount;
      }
    });

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
    };
  },
}));
