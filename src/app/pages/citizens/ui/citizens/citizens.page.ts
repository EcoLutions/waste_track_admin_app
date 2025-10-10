import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitizensStore } from '../../model/store/citizens.store';
import { CitizenEntity, MembershipLevelEnum } from '../../../../../entities';
import { DistrictContextStore } from '../../../../../shared/stores/district-context.store';

@Component({
  selector: 'app-citizens',
  imports: [CommonModule, FormsModule],
  templateUrl: './citizens.page.html',
  styleUrl: './citizens.page.css'
})
export class CitizensPage implements OnInit, OnDestroy {
  readonly store = inject(CitizensStore);
  readonly districtContextStore = inject(DistrictContextStore);

  // Selected citizen for detail panel
  selectedCitizen = signal<CitizenEntity | null>(null);

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

  readonly membershipLevels = Object.values(MembershipLevelEnum);

  // Check if there are active filters
  readonly hasActiveFilters = computed(() => {
    return this.searchTerm() !== '' ||
      this.selectedMembershipLevel() !== null;
  });

  ngOnInit(): void {
    this.initializePage().then(() => {});
  }

  ngOnDestroy(): void {
    this.store.resetState();
  }

  private async initializePage(): Promise<void> {
    if (!this.districtContextStore.isDistrictLoaded()) {
      try {
        await this.districtContextStore.initializeDistrictContext();
      } catch (error) {
        console.error('Error initializing district context:', error);
      }
    }

    if (this.districtContextStore.districtId()) {
      await this.store.loadCitizens();
    }

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

  toggleActiveFilter(): void {
    const newValue = !this.showActiveOnly();
    this.showActiveOnly.set(newValue);
    this.store.setShowActiveOnly(newValue);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedMembershipLevel.set(null);
    this.showActiveOnly.set(true);
    this.store.clearFilters();
  }

  async refreshCitizens(): Promise<void> {
    await this.store.refreshCitizens();
  }

  // Citizen selection for detail panel
  selectCitizen(citizen: CitizenEntity): void {
    if (this.selectedCitizen()?.id === citizen.id) {
      this.selectedCitizen.set(null);
    } else {
      this.selectedCitizen.set(citizen);
    }
  }

  closeCitizenDetail(): void {
    this.selectedCitizen.set(null);
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
      [MembershipLevelEnum.BRONZE]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700',
      [MembershipLevelEnum.SILVER]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700',
      [MembershipLevelEnum.GOLD]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-700'
    };
    return classes[level] || 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700';
  }

  getMembershipIcon(level: MembershipLevelEnum): string {
    const icons = {
      [MembershipLevelEnum.BRONZE]: 'pi pi-circle-fill',
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
    return new Date(citizen.lastActivityDate) >= thirtyDaysAgo;
  }

  getActivityStatusClass(citizen: CitizenEntity): string {
    if (this.isRecentlyActive(citizen)) {
      return 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700';
    }
    return 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500';
  }

  getActivityStatusText(citizen: CitizenEntity): string {
    return this.isRecentlyActive(citizen) ? 'Activo' : 'Inactivo';
  }
}
