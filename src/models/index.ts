import mongoose, { Schema, Document, Model } from 'mongoose';

// ==========================================
// 1. USER MODEL
// ==========================================
export interface IUser extends Document {
  fullName: string;
  username: string;
  passwordHash: string;
  role: 'ADMIN' | 'EMPLOYEE';
  employeeId?: string;
  department?: string;
  designation?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'EMPLOYEE'], default: 'EMPLOYEE', required: true, index: true },
    employeeId: { type: String, trim: true },
    department: { type: String, trim: true },
    designation: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// ==========================================
// 2. SYSTEM MODEL
// ==========================================
export interface ISystem extends Document {
  name: string;
  slug: string;
  fullName: string;
  description: string;
  iconType: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  topicsCount: number;
  videosCount: number;
  manualsCount: number;
  totalDuration: string;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSchema = new Schema<ISystem>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    fullName: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    iconType: { type: String, default: 'btos' },
    imageUrl: { type: String },
    displayOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    topicsCount: { type: Number, default: 0 },
    videosCount: { type: Number, default: 0 },
    manualsCount: { type: Number, default: 1 },
    totalDuration: { type: String, default: '0 hrs' },
  },
  { timestamps: true }
);

// ==========================================
// 3. MODULE MODEL
// ==========================================
export interface IModule extends Document {
  systemId: string;
  moduleNumber: string;
  title: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>(
  {
    systemId: { type: String, required: true, index: true },
    moduleNumber: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, index: true },
    description: { type: String },
    displayOrder: { type: Number, default: 0, index: true },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// ==========================================
// 4. LESSON MODEL
// ==========================================
export interface ILessonStep {
  stepNumber: number;
  title: string;
  instruction: string;
  highlightText?: string;
  imageUrl?: string;
  imageDriveId?: string;
  uiMockType?: string;
}

export interface ILessonSection {
  id: string;
  number: string;
  title: string;
  content?: string;
  steps?: ILessonStep[];
}

export interface ILesson extends Document {
  systemId: string;
  moduleId: string;
  title: string;
  slug: string;
  description: string;
  duration: string;
  order: string;
  displayOrder: number;
  isPublished: boolean;
  videoDriveId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  manualContent?: string;
  manualSteps?: ILessonStep[];
  sections?: ILessonSection[];
  learningObjectives?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    systemId: { type: String, required: true, index: true },
    moduleId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    duration: { type: String, default: '10:00' },
    order: { type: String, default: '1.1' },
    displayOrder: { type: Number, default: 0, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    videoDriveId: { type: String },
    videoUrl: { type: String },
    thumbnailUrl: { type: String },
    imageUrl: { type: String },
    manualContent: { type: String, default: '' },
    manualSteps: { type: Array, default: [] },
    sections: { type: Array, default: [] },
    learningObjectives: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ==========================================
// 5. VIDEO MODEL
// ==========================================
export interface IVideo extends Document {
  title: string;
  description?: string;
  driveFileId: string;
  driveFolderId?: string;
  mimeType: string;
  duration?: string;
  thumbnailUrl?: string;
  systemId?: string;
  moduleId?: string;
  lessonId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    driveFileId: { type: String, required: true, unique: true, index: true },
    driveFolderId: { type: String },
    mimeType: { type: String, default: 'video/mp4' },
    duration: { type: String, default: '00:00' },
    thumbnailUrl: { type: String },
    systemId: { type: String, index: true },
    moduleId: { type: String, index: true },
    lessonId: { type: String, index: true },
  },
  { timestamps: true }
);

// ==========================================
// 6. MEDIA MODEL (Cloudinary)
// ==========================================
export interface IMedia extends Document {
  title: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  format?: string;
  width?: number;
  height?: number;
  altText?: string;
  systemId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    title: { type: String, required: true, trim: true },
    cloudinaryPublicId: { type: String, required: true, unique: true },
    secureUrl: { type: String, required: true },
    format: { type: String },
    width: { type: Number },
    height: { type: Number },
    altText: { type: String },
    systemId: { type: String, index: true },
  },
  { timestamps: true }
);

// ==========================================
// 7. LEARNING PROGRESS MODEL
// ==========================================
export interface ILearningProgress extends Document {
  userId: string;
  lessonId: string;
  systemId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercentage: number;
  lastWatchedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LearningProgressSchema = new Schema<ILearningProgress>(
  {
    userId: { type: String, required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    systemId: { type: String, required: true, index: true },
    status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], default: 'IN_PROGRESS', index: true },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    lastWatchedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);
LearningProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

// ==========================================
// 8. BOOKMARK MODEL
// ==========================================
export interface IBookmark extends Document {
  userId: string;
  lessonId: string;
  systemId: string;
  title: string;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: String, required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    systemId: { type: String, required: true },
    title: { type: String, required: true },
  },
  { timestamps: true }
);
BookmarkSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

// ==========================================
// 9. AUDIT LOG MODEL
// ==========================================
export interface IAuditLog extends Document {
  adminId: string;
  adminUsername: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: String, required: true, index: true },
    adminUsername: { type: String, required: true },
    action: { type: String, required: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: String },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Model exports ensuring hot-reload safety in Next.js
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const SystemModel: Model<ISystem> = mongoose.models.System || mongoose.model<ISystem>('System', SystemSchema);
export const ModuleModel: Model<IModule> = mongoose.models.Module || mongoose.model<IModule>('Module', ModuleSchema);
export const LessonModel: Model<ILesson> = mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
export const VideoModel: Model<IVideo> = mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);
export const MediaModel: Model<IMedia> = mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);
export const LearningProgressModel: Model<ILearningProgress> = mongoose.models.LearningProgress || mongoose.model<ILearningProgress>('LearningProgress', LearningProgressSchema);
export const BookmarkModel: Model<IBookmark> = mongoose.models.Bookmark || mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
export const AuditLogModel: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
