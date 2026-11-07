
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WasteApiService } from './services/waste-api.service';

type Status = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

interface Schedule {
  id: string;
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
  editingId: string | null = null;
  notice = '';

  scheduleForm: Schedule = this.emptySchedule();

  // SCHEDULES FROM API
  schedules: Schedule[] = [];
  schedulesLoading = false;

  // STAFF
  staff: Staff[] = [
    { id: 1, name: 'Juan Dela Cruz', role: 'Collection Driver', phone: '09171234567', status: 'Active' },
    { id: 2, name: 'Pedro Santos', role: 'Waste Collector', phone: '09181234567', status: 'Active' },
    { id: 3, name: 'Maria Reyes', role: 'Operations Officer', phone: '09191234567', status: 'Active' },
    { id: 4, name: 'Jose Garcia', role: 'Waste Collector', phone: '09201234567', status: 'On Leave' }
  ];

  // RESIDENT CONCERNS
  concerns: Concern[] = [
    { id: 1, resident: 'Resident A', area: 'Poblacion', subject: 'Missed collection', status: 'Pending' },
    { id: 2, resident: 'Resident B', area: 'Looc', subject: 'Request for collection', status: 'In Review' },
    { id: 3, resident: 'Resident C', area: 'San Martin', subject: 'Waste segregation concern', status: 'Resolved' }
  ];

  notifications = [
    {
      title: 'Collection Schedule Reminder',
      message: 'Review upcoming collection schedules.',
      date: '2026-10-25',
      type: 'Reminder'
    },
    {
      title: 'Pending Resident Concern',
      message: 'A resident concern requires attention.',
      date: '2026-10-25',
      type: 'Action Required'
    },
    {
      title: 'Waste Operations Update',
      message: 'Check the latest collection records.',
      date: '2026-10-24',
      type: 'Announcement'
    }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private wasteApi: WasteApiService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
      this.loadSchedules();
    }
  }

  // LOGIN
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

  // EMPTY SCHEDULE FORM
  private emptySchedule(): Schedule {
    return {
      id: '',
      area: '',
      date: '',
      time: '07:00',
      wasteType: 'Residual',
      team: 'Team Alpha',
      status: 'Scheduled'
    };
  }

  // LOAD LOCAL STAFF AND CONCERNS
  private loadData(): void {
    try {
      const staff = localStorage.getItem('waste-staff');
      const concerns = localStorage.getItem('waste-concerns');

      if (staff) this.staff = JSON.parse(staff);
      if (concerns) this.concerns = JSON.parse(concerns);
    } catch {
      this.notice = 'Could not load saved demo data.';
    }
  }

  // LOAD SCHEDULES FROM JSON SERVER
  loadSchedules(): void {
    this.schedulesLoading = true;

    this.wasteApi.list<Schedule>('schedules').subscribe({
      next: (data) => {
        this.schedules = data;
        this.schedulesLoading = false;
      },
      error: (error) => {
        console.error('Schedule loading error:', error);
        this.schedulesLoading = false;
        this.notice = 'Unable to load schedules. Check if the API is running.';
      }
    });
  }

  // SAVE STAFF AND CONCERNS LOCALLY
  private saveData(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.setItem('waste-staff', JSON.stringify(this.staff));
      localStorage.setItem('waste-concerns', JSON.stringify(this.concerns));
    } catch {
      this.notice = 'Unable to save data in this browser.';
    }
  }

  // NAVIGATION
  navigate(page: string): void {
    this.activePage = page;
    this.searchText = '';
    this.showScheduleForm = false;
    this.notice = '';
  }

  // FILTERS
  get filteredSchedules(): Schedule[] {
    const q = this.searchText.toLowerCase().trim();

    return this.schedules.filter(s =>
      [
        s.area,
        s.date,
        s.time,
        s.wasteType,
        s.team,
        s.status
      ].some(v => String(v).toLowerCase().includes(q))
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

  // DASHBOARD COUNTS
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

  // OPEN ADD SCHEDULE
  openAddSchedule(): void {
    this.editingId = null;
    this.scheduleForm = this.emptySchedule();
    this.showScheduleForm = true;
    this.notice = '';
  }

  // EDIT SCHEDULE
  editSchedule(schedule: Schedule): void {
    this.editingId = schedule.id;
    this.scheduleForm = { ...schedule };
    this.showScheduleForm = true;
    this.notice = '';
  }

  // ADD OR UPDATE SCHEDULE THROUGH API
  saveSchedule(): void {
    const form = this.scheduleForm;

    if (
      !form.area.trim() ||
      !form.date ||
      !form.time ||
      !form.team.trim()
    ) {
      this.notice = 'Please complete all required fields.';
      return;
    }

    if (this.editingId !== null) {
      const updatedSchedule: Schedule = {
        ...form,
        id: this.editingId
      };

      this.wasteApi.update<Schedule>(
        'schedules',
        updatedSchedule
      ).subscribe({
        next: (updated) => {
          this.schedules = this.schedules.map(s =>
            s.id === this.editingId ? updated : s
          );

          this.showScheduleForm = false;
          this.editingId = null;
          this.scheduleForm = this.emptySchedule();
          this.notice = 'Schedule updated successfully.';
        },
        error: (error) => {
          console.error('Update error:', error);
          this.notice = 'Failed to update schedule.';
        }
      });
    } else {
      const newSchedule: Schedule = {
        ...form,
        id: String(Date.now())
      };

      this.wasteApi.create<Schedule>(
        'schedules',
        newSchedule
      ).subscribe({
        next: (created) => {
          this.schedules = [created, ...this.schedules];
          this.showScheduleForm = false;
          this.scheduleForm = this.emptySchedule();
          this.notice = 'New schedule added successfully.';
        },
        error: (error) => {
          console.error('Create error:', error);
          this.notice = 'Failed to add schedule.';
        }
      });
    }
  }

  // DELETE SCHEDULE THROUGH API
  deleteSchedule(schedule: Schedule): void {
    if (!confirm(`Delete the schedule for ${schedule.area}?`)) {
      return;
    }

    this.wasteApi.remove('schedules', schedule.id).subscribe({
      next: () => {
        this.schedules = this.schedules.filter(
          s => s.id !== schedule.id
        );

        this.notice = 'Schedule deleted successfully.';
      },
      error: (error) => {
        console.error('Delete error:', error);
        this.notice = 'Failed to delete schedule.';
      }
    });
  }

  // CHANGE COLLECTION STATUS THROUGH API
  changeScheduleStatus(
    schedule: Schedule,
    status: Status
  ): void {
    const updatedSchedule: Schedule = {
      ...schedule,
      status
    };

    this.wasteApi.update<Schedule>(
      'schedules',
      updatedSchedule
    ).subscribe({
      next: (updated) => {
        this.schedules = this.schedules.map(s =>
          s.id === updated.id ? updated : s
        );

        this.notice = 'Collection status updated.';
      },
      error: (error) => {
        console.error('Status update error:', error);
        this.notice = 'Failed to update collection status.';
      }
    });
  }

  // CHANGE RESIDENT CONCERN STATUS
  changeConcernStatus(
    concern: Concern,
    status: string
  ): void {
    this.concerns = this.concerns.map(c =>
      c.id === concern.id ? { ...c, status } : c
    );

    this.saveData();
    this.notice = 'Resident concern updated.';
  }

  // EXPORT SCHEDULES
  exportSchedules(): void {
    const header = [
      'Area',
      'Date',
      'Time',
      'Waste Type',
      'Team',
      'Status'
    ];

    const rows = this.filteredSchedules.map(s => [
      s.area,
      s.date,
      s.time,
      s.wasteType,
      s.team,
      s.status
    ]);

    const csv = [header, ...rows]
      .map(row =>
        row.map(v =>
          `"${String(v).replace(/"/g, '""')}"`
        ).join(',')
      )
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

  // RESET LOCAL DEMO DATA
  resetDemoData(): void {
    if (!confirm('Reset saved staff and concern demo records?')) {
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('waste-staff');
      localStorage.removeItem('waste-concerns');
      window.location.reload();
    }
  }
}
