import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitizensStore } from '../../model/store/citizens.store';
import {CitizenEntity, MembershipLevelEnum} from '../../../../../entities';
import {DistrictContextStore} from '../../../../../shared/stores/district-context.store';

@Component({
  selector: 'app-citizens',
  imports: [CommonModule, FormsModule],
  templateUrl: './citizens.page.html',
  styleUrl: './citizens.page.css'
})
export class CitizensPage implements OnInit, OnDestroy {
  readonly store = inject(CitizensStore);
  readonly districtContextStore = inject(DistrictContextStore);

  // Search and filter signals
  searchTerm = signal('');
  selectedMembershipLevel = signal<MembershipLevelEnum | null>(null);
  showActiveOnly = signal(true);

  // Computed signals for template
  readonly citizens = computed(() => this.store.filteredCitizens());
  readonly isLoading = computed(() => this.store.isLoading());
  readonly error = computed(() => this.store.error());
  readonly totalCitizens = computed(() => this.store.totalCitizens());
  readonly bronzeMembers = computed(() => this.store.bronzeMembers());
  readonly silverMembers = computed(() => this.store.silverMembers());
  readonly goldMembers = computed(() => this.store.goldMembers());
  readonly citizensByMembership = computed(() => this.store.citizensByMembership());
  readonly totalPoints = computed(() => this.store.totalPoints());
  readonly averagePointsPerCitizen = computed(() => this.store.averagePointsPerCitizen());
  readonly totalReportsSubmitted = computed(() => this.store.totalReportsSubmitted());
  readonly mostActiveCitizens = computed(() => this.store.mostActiveCitizens());
  readonly districtName = computed(() => this.store.districtName());

  // Membership level options
  readonly membershipLevels = Object.values(MembershipLevelEnum);

  ngOnInit(): void {
    this.initializePage().then(() => {});
  }

  ngOnDestroy(): void {
    // Reset store state when leaving the page
    this.store.resetState();
  }

  private async initializePage(): Promise<void> {
    // Wait for district context to be available
    if (!this.districtContextStore.isDistrictLoaded()) {
      // If district is not loaded, try to initialize it
      try {
        await this.districtContextStore.initializeDistrictContext();
      } catch (error) {
        console.error('Error initializing district context:', error);
      }
    }

    // Load citizens once district context is available
    if (this.districtContextStore.districtId()) {
      await this.store.loadCitizens();
    }

    // Initialize filter signals from store
    this.searchTerm.set(this.store.searchTerm());
    this.selectedMembershipLevel.set(this.store.selectedMembershipLevel());
    this.showActiveOnly.set(this.store.showActiveOnly());
  }

  // Search and filter methods
  onSearchTermChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.store.setSearchTerm(searchTerm);
  }

  onMembershipFilterChange(membershipLevel: string): void {
    const level = membershipLevel === 'all' ? null : membershipLevel as MembershipLevelEnum;
    this.selectedMembershipLevel.set(level);
    this.store.setMembershipFilter(level);
  }

  onActiveFilterChange(showActiveOnly: boolean): void {
    this.showActiveOnly.set(showActiveOnly);
    this.store.setShowActiveOnly(showActiveOnly);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedMembershipLevel.set(null);
    this.showActiveOnly.set(true);
    this.store.clearFilters();
  }

  // Citizen management methods
  async refreshCitizens(): Promise<void> {
    await this.store.refreshCitizens();
  }

  // Helper methods for template
  getMembershipLabel(level: MembershipLevelEnum): string {
    const labels = {
      [MembershipLevelEnum.BRONZE]: 'Bronce',
      [MembershipLevelEnum.SILVER]: 'Plata',
      [MembershipLevelEnum.GOLD]: 'Oro'
    };
    return labels[level] || level;
  }

  getMembershipClass(level: MembershipLevelEnum): string {
    const classes = {
      [MembershipLevelEnum.BRONZE]: 'membership-bronze',
      [MembershipLevelEnum.SILVER]: 'membership-silver',
      [MembershipLevelEnum.GOLD]: 'membership-gold'
    };
    return classes[level] || 'membership-default';
  }

  getMembershipIcon(level: MembershipLevelEnum): string {
    const icons = {
      [MembershipLevelEnum.BRONZE]: 'pi pi-star',
      [MembershipLevelEnum.SILVER]: 'pi pi-star',
      [MembershipLevelEnum.GOLD]: 'pi pi-crown'
    };
    return icons[level] || 'pi pi-user';
  }

  formatDate(date: Date): string {
    if (!date) return 'No disponible';
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-PE').format(value);
  }

  isRecentlyActive(citizen: CitizenEntity): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return citizen.lastActivityDate >= thirtyDaysAgo;
  }

  getActivityStatusClass(citizen: CitizenEntity): string {
    return this.isRecentlyActive(citizen) ? 'activity-active' : 'activity-inactive';
  }

  getActivityStatusText(citizen: CitizenEntity): string {
    return this.isRecentlyActive(citizen) ? 'Activo' : 'Inactivo';
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm() || this.selectedMembershipLevel());
  }
}
