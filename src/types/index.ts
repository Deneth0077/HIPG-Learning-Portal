export interface System {
  id: string;
  name: string;
  fullName: string;
  description: string;
  topicsCount: number;
  videosCount: number;
  manualsCount: number;
  totalDuration: string;
  progressPercent: number;
  completedTopics: number;
  iconType: 'btos' | 'bulk' | 'ctos' | 'vtms' | 'billing' | 'vbs' | 'eam';
  color: string;
}

export interface Lesson {
  id: string;
  systemId: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  duration: string;
  progressPercent: number;
  isCompleted: boolean;
  videoUrl?: string; // YouTube / Google Drive / MP4
  description: string;
  order: string;
}

export interface Module {
  id: string;
  systemId: string;
  moduleNumber: string;
  title: string;
  isCompleted?: boolean;
  lessons: Lesson[];
}

export interface ManualStep {
  stepNumber: number;
  title: string;
  instruction: string;
  highlightText?: string;
  uiMockType?: 'top-menu' | 'submenu-item' | 'form-action' | 'dialog';
}

export interface ManualSection {
  id: string;
  number: string;
  title: string;
  content?: string;
  steps?: ManualStep[];
  notes?: string[];
  expectedResult?: string;
}
