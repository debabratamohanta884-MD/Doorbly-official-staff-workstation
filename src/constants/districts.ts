/**
 * 30 Districts of Odisha, India
 * Master targets defined in Section 8 (Combined Daily Target: ₹1,00,000)
 */

import { DistrictMaster } from '../types/doorbly';

export const ODISHA_DISTRICTS_INITIAL: DistrictMaster[] = [
  { id: 'khordha', name: 'Khordha', dailyTarget: 7000, actualCompletedSubtotal: 7350, completedBookingsCount: 12, activeStaffCount: 8, managerName: 'Amit Pattanaik', coordinatorName: 'Priya Das', tier: 1 },
  { id: 'cuttack', name: 'Cuttack', dailyTarget: 6500, actualCompletedSubtotal: 6200, completedBookingsCount: 11, activeStaffCount: 7, managerName: 'Subhashree Nayak', coordinatorName: 'Rakesh Sahoo', tier: 1 },
  { id: 'ganjam', name: 'Ganjam', dailyTarget: 5500, actualCompletedSubtotal: 5100, completedBookingsCount: 9, activeStaffCount: 6, managerName: 'Bikash Mohapatra', coordinatorName: 'Kunal Panda', tier: 1 },
  { id: 'puri', name: 'Puri', dailyTarget: 5000, actualCompletedSubtotal: 5250, completedBookingsCount: 8, activeStaffCount: 5, managerName: 'Sasmita Rout', coordinatorName: 'Anil Mishra', tier: 1 },
  { id: 'sundargarh', name: 'Sundargarh', dailyTarget: 5000, actualCompletedSubtotal: 4800, completedBookingsCount: 7, activeStaffCount: 5, managerName: 'Rajesh Kujur', coordinatorName: 'Manoj Ekka', tier: 1 },
  { id: 'balasore', name: 'Balasore', dailyTarget: 4000, actualCompletedSubtotal: 4100, completedBookingsCount: 6, activeStaffCount: 4, managerName: 'Debabrata Barik', coordinatorName: 'Suman Behera', tier: 2 },
  { id: 'sambalpur', name: 'Sambalpur', dailyTarget: 4000, actualCompletedSubtotal: 3950, completedBookingsCount: 6, activeStaffCount: 4, managerName: 'Swagatika Pradhan', coordinatorName: 'Ashok Bag', tier: 2 },
  { id: 'mayurbhanj', name: 'Mayurbhanj', dailyTarget: 4000, actualCompletedSubtotal: 3800, completedBookingsCount: 5, activeStaffCount: 4, managerName: 'Jitendra Marandi', coordinatorName: 'Deepak Tudu', tier: 2 },
  { id: 'jajpur', name: 'Jajpur', dailyTarget: 4000, actualCompletedSubtotal: 4050, completedBookingsCount: 6, activeStaffCount: 4, managerName: 'Manas Parida', coordinatorName: 'Alok Jena', tier: 2 },
  { id: 'bhadrak', name: 'Bhadrak', dailyTarget: 3500, actualCompletedSubtotal: 3400, completedBookingsCount: 5, activeStaffCount: 3, managerName: 'Ranjit Biswal', coordinatorName: 'Gourav Kar', tier: 2 },
  { id: 'kendrapara', name: 'Kendrapara', dailyTarget: 3500, actualCompletedSubtotal: 3600, completedBookingsCount: 5, activeStaffCount: 3, managerName: 'Santosh Swain', coordinatorName: 'Bibhu Dhal', tier: 2 },
  { id: 'jagatsinghpur', name: 'Jagatsinghpur', dailyTarget: 3000, actualCompletedSubtotal: 2900, completedBookingsCount: 4, activeStaffCount: 3, managerName: 'Lopamudra Das', coordinatorName: 'Soumya Ray', tier: 2 },
  { id: 'angul', name: 'Angul', dailyTarget: 3500, actualCompletedSubtotal: 3300, completedBookingsCount: 5, activeStaffCount: 3, managerName: 'Prabhat Dehury', coordinatorName: 'Tapas Sahu', tier: 2 },
  { id: 'dhenkanal', name: 'Dhenkanal', dailyTarget: 3000, actualCompletedSubtotal: 2800, completedBookingsCount: 4, activeStaffCount: 3, managerName: 'Niranjan Rout', coordinatorName: 'Bikram Bhanja', tier: 2 },
  { id: 'keonjhar', name: 'Keonjhar', dailyTarget: 3000, actualCompletedSubtotal: 3100, completedBookingsCount: 4, activeStaffCount: 3, managerName: 'Chitta Mahanta', coordinatorName: 'Sanjay Giri', tier: 2 },
  { id: 'bargarh', name: 'Bargarh', dailyTarget: 3000, actualCompletedSubtotal: 2950, completedBookingsCount: 4, activeStaffCount: 3, managerName: 'Hemant Meher', coordinatorName: 'Prakash Sahu', tier: 2 },
  { id: 'balangir', name: 'Balangir', dailyTarget: 3000, actualCompletedSubtotal: 2700, completedBookingsCount: 4, activeStaffCount: 3, managerName: 'Biswajit Nag', coordinatorName: 'Dillip Joshi', tier: 2 },
  { id: 'kalahandi', name: 'Kalahandi', dailyTarget: 3000, actualCompletedSubtotal: 2850, completedBookingsCount: 4, activeStaffCount: 3, managerName: 'Sudhanshu Majhi', coordinatorName: 'Ramesh Naik', tier: 2 },
  { id: 'koraput', name: 'Koraput', dailyTarget: 3000, actualCompletedSubtotal: 3050, completedBookingsCount: 4, activeStaffCount: 3, managerName: 'Tarun Khosla', coordinatorName: 'Hari Gouda', tier: 2 },
  { id: 'rayagada', name: 'Rayagada', dailyTarget: 3000, actualCompletedSubtotal: 2750, completedBookingsCount: 3, activeStaffCount: 3, managerName: 'Srinivas Rao', coordinatorName: 'Murali Pidika', tier: 2 },
  { id: 'nayagarh', name: 'Nayagarh', dailyTarget: 2500, actualCompletedSubtotal: 2400, completedBookingsCount: 3, activeStaffCount: 2, managerName: 'Pradeep Tripathy', coordinatorName: 'Satya Sundar', tier: 3 },
  { id: 'gajapati', name: 'Gajapati', dailyTarget: 2000, actualCompletedSubtotal: 1950, completedBookingsCount: 3, activeStaffCount: 2, managerName: 'Kishore Gamang', coordinatorName: 'Surya Gamango', tier: 3 },
  { id: 'kandhamal', name: 'Kandhamal', dailyTarget: 2000, actualCompletedSubtotal: 1800, completedBookingsCount: 2, activeStaffCount: 2, managerName: 'Sunil Mallick', coordinatorName: 'Judhistir Pradhan', tier: 3 },
  { id: 'nuapada', name: 'Nuapada', dailyTarget: 2000, actualCompletedSubtotal: 1900, completedBookingsCount: 2, activeStaffCount: 2, managerName: 'Dharmendra Dandsena', coordinatorName: 'Bhagaban Sahu', tier: 3 },
  { id: 'subarnapur', name: 'Subarnapur', dailyTarget: 2000, actualCompletedSubtotal: 1850, completedBookingsCount: 2, activeStaffCount: 2, managerName: 'Binod Purohit', coordinatorName: 'Girish Barik', tier: 3 },
  { id: 'boudh', name: 'Boudh', dailyTarget: 2000, actualCompletedSubtotal: 2050, completedBookingsCount: 3, activeStaffCount: 2, managerName: 'Dipti Ranjan Kanhar', coordinatorName: 'Abhimanyu Bag', tier: 3 },
  { id: 'deogarh', name: 'Deogarh', dailyTarget: 2000, actualCompletedSubtotal: 1750, completedBookingsCount: 2, activeStaffCount: 2, managerName: 'Saroj Pradhan', coordinatorName: 'Umesh Debata', tier: 3 },
  { id: 'malkangiri', name: 'Malkangiri', dailyTarget: 2000, actualCompletedSubtotal: 1700, completedBookingsCount: 2, activeStaffCount: 2, managerName: 'Naveen Madhi', coordinatorName: 'Kishore Khemundu', tier: 3 },
  { id: 'nabarangpur', name: 'Nabarangpur', dailyTarget: 2000, actualCompletedSubtotal: 1950, completedBookingsCount: 2, activeStaffCount: 2, managerName: 'Trilochan Bhatra', coordinatorName: 'Govind Santa', tier: 3 },
  { id: 'jharsuguda', name: 'Jharsuguda', dailyTarget: 2000, actualCompletedSubtotal: 2200, completedBookingsCount: 3, activeStaffCount: 3, managerName: 'Gopal Agrawal', coordinatorName: 'Vinod Sharma', tier: 3 }
];

export const TOTAL_DAILY_STATEWIDE_TARGET = ODISHA_DISTRICTS_INITIAL.reduce(
  (sum, d) => sum + d.dailyTarget,
  0
);
