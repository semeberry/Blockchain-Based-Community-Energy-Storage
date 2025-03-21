import { describe, it, expect } from 'vitest';

// Mock capacity sharing contract
const capacitySharing = {
  allocations: new Map(),
  
  requestAllocation(sender, batteryId, requestedCapacity, startTime, endTime) {
    if (requestedCapacity <= 0) return { error: 1 };
    if (startTime >= endTime) return { error: 2 };
    
    const key = `${sender}-${batteryId}`;
    this.allocations.set(key, {
      allocatedCapacity: requestedCapacity,
      startTime,
      endTime,
      active: true
    });
    
    return { ok: true };
  },
  
  getAllocation(user, batteryId) {
    const key = `${user}-${batteryId}`;
    return this.allocations.get(key) || null;
  },
  
  cancelAllocation(sender, batteryId) {
    const key = `${sender}-${batteryId}`;
    const allocation = this.allocations.get(key);
    
    if (!allocation) return { error: 3 };
    
    allocation.active = false;
    this.allocations.set(key, allocation);
    return { ok: true };
  },
  
  hasActiveAllocation(user, batteryId) {
    const key = `${user}-${batteryId}`;
    const allocation = this.allocations.get(key);
    return allocation ? allocation.active : false;
  }
};

describe('Capacity Sharing Contract', () => {
  it('should request allocation successfully', () => {
    const result = capacitySharing.requestAllocation(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        1, // battery ID
        50, // requested capacity
        1647270000, // start time
        1647356400 // end time
    );
    
    expect(result).toHaveProperty('ok');
    expect(result.ok).toBe(true);
    
    const allocation = capacitySharing.getAllocation(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        1
    );
    
    expect(allocation).not.toBeNull();
    expect(allocation.allocatedCapacity).toBe(50);
    expect(allocation.active).toBe(true);
  });
  
  it('should reject allocation with invalid capacity', () => {
    const result = capacitySharing.requestAllocation(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        2, // battery ID
        0, // invalid capacity
        1647270000,
        1647356400
    );
    
    expect(result).toHaveProperty('error');
    expect(result.error).toBe(1);
  });
  
  it('should reject allocation with invalid time range', () => {
    const result = capacitySharing.requestAllocation(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        3, // battery ID
        50,
        1647356400, // end time before start time
        1647270000 // start time
    );
    
    expect(result).toHaveProperty('error');
    expect(result.error).toBe(2);
  });
  
  it('should cancel allocation', () => {
    // First request an allocation
    capacitySharing.requestAllocation(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        4, // battery ID
        50,
        1647270000,
        1647356400
    );
    
    const result = capacitySharing.cancelAllocation(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        4
    );
    
    expect(result).toHaveProperty('ok');
    expect(result.ok).toBe(true);
    
    const hasActive = capacitySharing.hasActiveAllocation(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        4
    );
    
    expect(hasActive).toBe(false);
  });
});

console.log('Capacity Sharing Contract tests completed');
