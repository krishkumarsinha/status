import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  IHabitRepository,
  IHealthRepository,
  IMoodRepository,
  IFinanceRepository,
  IJournalRepository,
  ISettingsRepository,
  IUserProfileRepository,
} from "./interfaces";
import {
  FirestoreHabitRepository,
  FirestoreHealthRepository,
  FirestoreMoodRepository,
  FirestoreFinanceRepository,
  FirestoreJournalRepository,
  FirestoreSettingsRepository,
  FirestoreUserProfileRepository,
} from "./firestore-repository";
import {
  LocalHabitRepository,
  LocalHealthRepository,
  LocalMoodRepository,
  LocalFinanceRepository,
  LocalJournalRepository,
  LocalSettingsRepository,
  LocalUserProfileRepository,
} from "./local-repository";

class RepositoryFactory {
  private habitRepo: IHabitRepository;
  private healthRepo: IHealthRepository;
  private moodRepo: IMoodRepository;
  private financeRepo: IFinanceRepository;
  private journalRepo: IJournalRepository;
  private settingsRepo: ISettingsRepository;
  private profileRepo: IUserProfileRepository;

  constructor() {
    if (isFirebaseConfigured()) {
      this.habitRepo = new FirestoreHabitRepository();
      this.healthRepo = new FirestoreHealthRepository();
      this.moodRepo = new FirestoreMoodRepository();
      this.financeRepo = new FirestoreFinanceRepository();
      this.journalRepo = new FirestoreJournalRepository();
      this.settingsRepo = new FirestoreSettingsRepository();
      this.profileRepo = new FirestoreUserProfileRepository();
    } else {
      this.habitRepo = new LocalHabitRepository();
      this.healthRepo = new LocalHealthRepository();
      this.moodRepo = new LocalMoodRepository();
      this.financeRepo = new LocalFinanceRepository();
      this.journalRepo = new LocalJournalRepository();
      this.settingsRepo = new LocalSettingsRepository();
      this.profileRepo = new LocalUserProfileRepository();
    }
  }

  getHabitRepository(): IHabitRepository {
    return this.habitRepo;
  }
  getHealthRepository(): IHealthRepository {
    return this.healthRepo;
  }
  getMoodRepository(): IMoodRepository {
    return this.moodRepo;
  }
  getFinanceRepository(): IFinanceRepository {
    return this.financeRepo;
  }
  getJournalRepository(): IJournalRepository {
    return this.journalRepo;
  }
  getSettingsRepository(): ISettingsRepository {
    return this.settingsRepo;
  }
  getUserProfileRepository(): IUserProfileRepository {
    return this.profileRepo;
  }
}

export const repositoryFactory = new RepositoryFactory();
