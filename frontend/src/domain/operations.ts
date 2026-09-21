export type Notification = {
  id: string;
  title: string;
  body: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
  link?: string;
  isRead: boolean;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  createdAt: string;
};

export type DashboardStats = {
  totalMembers: number;
  activeMembers: number;
  openComplaints: number;
  resolvedComplaints: number;
  upcomingEvents: number;
  totalDonations: number;
  activeLegalCases: number;
  monthlyGrowth: { month: string; members: number; complaints: number }[];
  recentActivity: { id: string; type: string; message: string; at: string }[];
};

export type BranchBreakdown = {
  branchId: string;
  branchName: string;
  members: number;
  complaints: number;
};