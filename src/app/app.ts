
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Status = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

interface Schedule {
  id: number;
  area: string;
  date: string;
  time: string;
  wasteType: string;
  team: string;
  status: Status;
}

interface Staff {
  id: number;
  name: string;
  role: string;
  phone: string;
  status: string;
}

interface Concern {
  id: number;
  resident: string;
  area: string;
  subject: string;
  status: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // LOGIN
  isLoggedIn = false;
  loginUsername = '';
  loginPassword = '';
  loginError = '';

  private readonly demoUsername = 'Admin';
  private readonly demoPassword = 'Admin123';

  // DASHBOARD
  activePage = 'Dashboard';
  searchText = '';
  showScheduleForm = false;
  editingId: number | null = null;
  notice = '';
  private nextId = 100;

  scheduleForm: Schedule = this.emptySchedule();

  schedules: Schedule[] = [
    { id: 1, area: 'Poblacion', date: '2026-10-26', time: '07:00', wasteType: 'Residual', team: 'Team Alpha', status: 'Scheduled' },
    { id: 2, area: 'Looc', date: '2026-10-26', time: '08:30', wasteType: 'Biodegradable', team: 'Team Bravo', status: 'Scheduled' },
    { id: 3, area: 'San Martin', date: '2026-10-25', time: '06:00', wasteType: 'Recyclable', team: 'Team Alpha', status: 'In Progress' },
    { id: 4, area: 'Natubo', date: '2026-10-24', time: '07:30', wasteType: 'Residual', team: 'Team Charlie', status: 'Completed' },
    { id: 5, area: 'Poblacion', date: '2026-10-23', time: '09:00', wasteType: 'Biodegradable', team: 'Team Bravo', status: 'Completed' }
  ];

  staff: Staff[] = [
    { id: 1, name: 'Juan Dela Cruz', role: 'Collection Driver', phone: '09171234567', status: 'Active' },
    { id: 2, name: 'Pedro Santos', role: 'Waste Collector', phone: '09181234567', status: 'Active' },
    { id: 3, name: 'Maria Reyes', role: 'Operations Officer', phone: '09191234567', status: 'Active' },
    { id: 4, name: 'Jose Garcia', role: 'Waste Collector', phone: '09201234567', status: 'On Leave' }
  ];

  concerns: Concern[] = [
    { id: 1, resident: 'Resident A', area: 'Poblacion', subject: 'Missed collection', status: 'Pending' },
    { id: 2, resident: 'Resident B', area: 'Looc', subject: 'Request for collection', status: 'In Review' },
    { id: 3, resident: 'Resident C', area: 'San Martin', subject: 'Waste segregation concern', status: 'Resolved' }
  ];

  notifications = [
    { title: 'Collection Schedule Reminder', message: 'Review upcoming collection schedules.', date: '2026-10-25', type: 'Reminder' },
    { title: 'Pending Resident Concern', message: 'A resident concern requires attention.', date: '2026-10-25', type: 'Action Required' },
    { title: 'Waste Operations Update', message: 'Check the latest collection records.', date: '2026-10-24', type: 'Announcement' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    }
  }

  // LOGIN FUNCTION
  login(): void {
    if (
      this.loginUsername.trim() === this.demoUsername &&
      this.loginPassword === this.demoPassword
    ) {
      this.isLoggedIn = true;
      this.loginError = '';
      this.loginPassword = '';
    } else {
      this.loginError = 'Invalid username or password. Please try again.';
    }
  }

  logout(): void {
    this.isLoggedIn = false;
    this.loginUsername = '';
    this.loginPassword = '';
    this.loginError = '';
    this.activePage = 'Dashboard';
    this.searchText = '';
    this.showScheduleForm = false;
    this.notice = '';
  }

  private emptySchedule(): Schedule {
    return {
      id: 0,
      area: '',
      date: '',
      time: '07:00',
      wasteType: 'Residual',
      team: 'Team Alpha',
      status: 'Scheduled'
    };
  }

  private loadData(): void {
    try {
      const schedules = localStorage.getItem('waste-schedules');
      const staff = localStorage.getItem('waste-staff');
      const concerns = localStorage.getItem('waste-concerns');

      if (schedules) this.schedules = JSON.parse(schedules);
      if (staff) this.staff = JSON.parse(staff);
      if (concerns) this.concerns = JSON.parse(concerns);

      this.nextId = Math.max(100, ...this.schedules.map(s => s.id + 1));
    } catch {
      this.notice = 'Could not load saved demo data.';
    }
  }

  private saveData(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.setItem('waste-schedules', JSON.stringify(this.schedules));
      localStorage.setItem('waste-staff', JSON.stringify(this.staff));
      localStorage.setItem('waste-concerns', JSON.stringify(this.concerns));
    } catch {
      this.notice = 'Unable to save data in this browser.';
    }
  }

  navigate(page: string): void {
    this.activePage = page;
    this.searchText = '';
    this.showScheduleForm = false;
    this.notice = '';
  }

  get filteredSchedules(): Schedule[] {
    const q = this.searchText.toLowerCase().trim();
    return this.schedules.filter(s =>
      [s.area, s.date, s.time, s.wasteType, s.team, s.status]
        .some(v => v.toLowerCase().includes(q))
    );
  }

  get filteredStaff(): Staff[] {
    const q = this.searchText.toLowerCase().trim();
    return this.staff.filter(s =>
      [s.name, s.role, s.phone, s.status]
        .some(v => v.toLowerCase().includes(q))
    );
  }

  get filteredConcerns(): Concern[] {
    const q = this.searchText.toLowerCase().trim();
    return this.concerns.filter(c =>
      [c.resident, c.area, c.subject, c.status]
        .some(v => v.toLowerCase().includes(q))
    );
  }

  get completedCount(): number {
    return this.schedules.filter(s => s.status === 'Completed').length;
  }

  get pendingCount(): number {
    return this.schedules.filter(s => s.status === 'Scheduled').length;
  }

  get inProgressCount(): number {
    return this.schedules.filter(s => s.status === 'In Progress').length;
  }

  get resolvedConcerns(): number {
    return this.concerns.filter(c => c.status === 'Resolved').length;
  }

  get pendingConcerns(): number {
    return this.concerns.filter(c => c.status !== 'Resolved').length;
  }

  get todayLabel(): string {
    return new Date().toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  openAddSchedule(): void {
    this.editingId = null;
    this.scheduleForm = this.emptySchedule();
    this.showScheduleForm = true;
    this.notice = '';
  }

  editSchedule(schedule: Schedule): void {
    this.editingId = schedule.id;
    this.scheduleForm = { ...schedule };
    this.showScheduleForm = true;
    this.notice = '';
  }

  saveSchedule(): void {
    const form = this.scheduleForm;

    if (!form.area.trim() || !form.date || !form.time || !form.team.trim()) {
      this.notice = 'Please complete all required fields.';
      return;
    }

    if (this.editingId !== null) {
      this.schedules = this.schedules.map(s =>
        s.id === this.editingId ? { ...form, id: this.editingId! } : s
      );
      this.notice = 'Schedule updated successfully.';
    } else {
      this.schedules = [{ ...form, id: this.nextId++ }, ...this.schedules];
      this.notice = 'New schedule added successfully.';
    }

    this.saveData();
    this.showScheduleForm = false;
    this.editingId = null;
  }

  deleteSchedule(schedule: Schedule): void {
    if (!confirm(`Delete the schedule for ${schedule.area}?`)) return;

    this.schedules = this.schedules.filter(s => s.id !== schedule.id);
    this.saveData();
    this.notice = 'Schedule deleted.';
  }

  changeScheduleStatus(schedule: Schedule, status: Status): void {
    this.schedules = this.schedules.map(s =>
      s.id === schedule.id ? { ...s, status } : s
    );
    this.saveData();
    this.notice = 'Collection status updated.';
  }

  changeConcernStatus(concern: Concern, status: string): void {
    this.concerns = this.concerns.map(c =>
      c.id === concern.id ? { ...c, status } : c
    );
    this.saveData();
    this.notice = 'Resident concern updated.';
  }

  exportSchedules(): void {
    const header = ['Area', 'Date', 'Time', 'Waste Type', 'Team', 'Status'];
    const rows = this.filteredSchedules.map(s =>
      [s.area, s.date, s.time, s.wasteType, s.team, s.status]
    );

    const csv = [header, ...rows]
      .map(row => row.map(v =>
        `"${String(v).replace(/"/g, '""')}"`
      ).join(','))
      .join('\r\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'waste-collection-schedules.csv';
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  resetDemoData(): void {
    if (!confirm('Reset all saved demo records?')) return;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('waste-schedules');
      localStorage.removeItem('waste-staff');
      localStorage.removeItem('waste-concerns');
      window.location.reload();
    }
  }
}
