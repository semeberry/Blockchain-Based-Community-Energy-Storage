import { describe, it, expect } from 'vitest';

// Mock maintenance fund contract
const maintenanceFund = {
  admin: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  fundBalance: 0,
  contributions: new Map(),
  expenses: new Map(),
  nextExpenseId: 1,
  
  contribute(sender, amount) {
    if (amount <= 0) return { error: 1 };
    
    this.fundBalance += amount;
    
    const prevContribution = this.contributions.get(sender) || { totalContributed: 0 };
    this.contributions.set(sender, {
      totalContributed: prevContribution.totalContributed + amount
    });
    
    return { ok: true };
  },
  
  getFundBalance() {
    return this.fundBalance;
  },
  
  getUserContributions(user) {
    return this.contributions.get(user) || { totalContributed: 0 };
  },
  
  proposeExpense(sender, amount, description) {
    if (amount <= 0) return { error: 2 };
    if (!description || description.length === 0) return { error: 3 };
    
    const expenseId = this.nextExpenseId;
    this.expenses.set(expenseId, {
      amount,
      description,
      timestamp: Date.now(),
      approved: false
    });
    
    this.nextExpenseId++;
    return { ok: expenseId };
  },
  
  approveExpense(sender, expenseId) {
    const expense = this.expenses.get(expenseId);
    
    if (!expense) return { error: 4 };
    if (sender !== this.admin) return { error: 5 };
    if (expense.approved) return { error: 6 };
    if (expense.amount > this.fundBalance) return { error: 7 };
    
    this.fundBalance -= expense.amount;
    expense.approved = true;
    this.expenses.set(expenseId, expense);
    
    return { ok: true };
  },
  
  getExpense(expenseId) {
    return this.expenses.get(expenseId) || null;
  }
};

describe('Maintenance Fund Contract', () => {
  it('should allow contributions', () => {
    const result = maintenanceFund.contribute(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        100 // amount
    );
    
    expect(result).toHaveProperty('ok');
    expect(result.ok).toBe(true);
    
    expect(maintenanceFund.getFundBalance()).toBe(100);
    
    const userContributions = maintenanceFund.getUserContributions(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    );
    
    expect(userContributions.totalContributed).toBe(100);
  });
  
  it('should reject invalid contribution amounts', () => {
    const result = maintenanceFund.contribute(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        0 // invalid amount
    );
    
    expect(result).toHaveProperty('error');
    expect(result.error).toBe(1);
  });
  
  it('should propose expenses', () => {
    const result = maintenanceFund.proposeExpense(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        50, // amount
        'Battery maintenance' // description
    );
    
    expect(result).toHaveProperty('ok');
    expect(result.ok).toBe(1); // First expense ID
    
    const expense = maintenanceFund.getExpense(1);
    expect(expense).not.toBeNull();
    expect(expense.amount).toBe(50);
    expect(expense.description).toBe('Battery maintenance');
    expect(expense.approved).toBe(false);
  });
  
  it('should approve expenses', () => {
    // First contribute to the fund
    maintenanceFund.contribute(
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        200
    );
    
    // Then propose an expense
    maintenanceFund.proposeExpense(
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        75,
        'System upgrade'
    );
    
    const expenseId = 2; // Second expense
    
    const result = maintenanceFund.approveExpense(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // admin
        expenseId
    );
    
    expect(result).toHaveProperty('ok');
    expect(result.ok).toBe(true);
    
    const expense = maintenanceFund.getExpense(expenseId);
    expect(expense.approved).toBe(true);
    
    // Fund balance should be reduced
    expect(maintenanceFund.getFundBalance()).toBe(225); // 100 + 200 - 75
  });
  
  it('should reject expense approval if not admin', () => {
    // Propose an expense
    maintenanceFund.proposeExpense(
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        50,
        'Routine check'
    );
    
    const expenseId = 3; // Third expense
    
    const result = maintenanceFund.approveExpense(
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG', // not admin
        expenseId
    );
    
    expect(result).toHaveProperty('error');
    expect(result.error).toBe(5);
  });
});

console.log('Maintenance Fund Contract tests completed');
