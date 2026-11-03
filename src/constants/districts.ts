/**
 * 30 Districts of Odisha, India
 * Official district master targets defined in Section 8 (Combined Daily Target: ₹1,00,000)
 * Real-time operational baseline with 0 fake/mock completions.
 */

import { DistrictMaster } from '../types/doorbly';

export const ODISHA_DISTRICTS_INITIAL: DistrictMaster[] = [
  { id: 'khordha', name: 'Khordha', dailyTarget: 7000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 1 },
  { id: 'cuttack', name: 'Cuttack', dailyTarget: 6500, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 1 },
  { id: 'ganjam', name: 'Ganjam', dailyTarget: 5500, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 1 },
  { id: 'puri', name: 'Puri', dailyTarget: 5000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 1 },
  { id: 'sundargarh', name: 'Sundargarh', dailyTarget: 5000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 1 },
  { id: 'balasore', name: 'Balasore', dailyTarget: 4000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 2 },
  { id: 'sambalpur', name: 'Sambalpur', dailyTarget: 4000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 2 },
  { id: 'mayurbhanj', name: 'Mayurbhanj', dailyTarget: 4000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 2 },
  { id: 'jajpur', name: 'Jajpur', dailyTarget: 4000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 2 },
  { id: 'bhadrak', name: 'Bhadrak', dailyTarget: 3500, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 2 },
  { id: 'kendrapara', name: 'Kendrapara', dailyTarget: 3500, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 2 },
  { id: 'jagatsinghpur', name: 'Jagatsinghpur', dailyTarget: 3000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 2 },
  { id: 'angul', name: 'Angul', dailyTarget: 3500, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 2 },
  { id: 'dhenkanal', name: 'Dhenkanal', dailyTarget: 3000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 2 },
  { id: 'keonjhar', name: 'Keonjhar', dailyTarget: 3000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 2 },
  { id: 'bargarh', name: 'Bargarh', dailyTarget: 3000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 2 },
  { id: 'balangir', name: 'Balangir', dailyTarget: 3000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 2 },
  { id: 'kalahandi', name: 'Kalahandi', dailyTarget: 3000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 2 },
  { id: 'koraput', name: 'Koraput', dailyTarget: 3000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 2 },
  { id: 'rayagada', name: 'Rayagada', dailyTarget: 3000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 2 },
  { id: 'nayagarh', name: 'Nayagarh', dailyTarget: 2500, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 3 },
  { id: 'gajapati', name: 'Gajapati', dailyTarget: 2000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 3 },
  { id: 'kandhamal', name: 'Kandhamal', dailyTarget: 2000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 3 },
  { id: 'nuapada', name: 'Nuapada', dailyTarget: 2000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 3 },
  { id: 'subarnapur', name: 'Subarnapur', dailyTarget: 2000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 3 },
  { id: 'boudh', name: 'Boudh', dailyTarget: 2000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 3 },
  { id: 'deogarh', name: 'Deogarh', dailyTarget: 2000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 3 },
  { id: 'malkangiri', name: 'Malkangiri', dailyTarget: 2000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 3 },
  { id: 'nabarangpur', name: 'Nabarangpur', dailyTarget: 2000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 3 },
  { id: 'jharsuguda', name: 'Jharsuguda', dailyTarget: 2000, actualCompletedSubtotal: 0, completedBookingsCount: 0, activeStaffCount: 0, tier: 3 }
];

export const TOTAL_DAILY_STATEWIDE_TARGET = ODISHA_DISTRICTS_INITIAL.reduce(
  (sum, d) => sum + d.dailyTarget,
  0
);
