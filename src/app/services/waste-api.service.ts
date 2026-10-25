
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CollectionSchedule {
  id?: string;
  barangay: string;
  day: string;
  time: string;
  driver: string;
  vehicleId: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed';
}

export interface WasteVehicle {
  id?: string;
  plateNumber: string;
  type: string;
  driver: string;
  status: 'Active' | 'Delayed' | 'Under Maintenance';
  notes: string;
}

export interface WasteNotification {
  id?: string;
  title: string;
  barangay: string;
  message: string;
  date: string;
  type: 'Schedule Change' | 'Delay' | 'General';
}

export interface WasteReadiness {
  id?: string;
  barangay: string;
  street: string;
  household: string;
  ready: boolean;
  updatedAt: string;
}

export interface CollectionPoint {
  id?: string;
  barangay: string;
  location: string;
  scheduleId: string;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class WasteApiService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  list<T>(resource: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${resource}`);
  }

  create<T>(resource: string, value: T): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${resource}`, value);
  }

  update<T extends { id?: string }>(
    resource: string,
    value: T
  ): Observable<T> {
    if (!value.id) {
      throw new Error('Cannot update a record without an id.');
    }

    return this.http.put<T>(
      `${this.baseUrl}/${resource}/${value.id}`,
      value
    );
  }

  remove(resource: string, id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${resource}/${id}`
    );
  }
}
