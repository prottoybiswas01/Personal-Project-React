import mongoose, { Schema } from 'mongoose';

const ProfileSchema = new Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  bio: { type: String, required: true },
  location: { type: String, required: true },
  avatarUrl: { type: String, required: true },
  email: { type: String, required: true },
  githubUsername: { type: String, required: true },
  githubUrl: { type: String, required: true },
  linkedinUrl: { type: String, required: true },
  focusArea: { type: String, required: true },
  learningGoals: [{ type: String }],
  yearsExperience: { type: Number, default: 2 }
}, { timestamps: true });

const ProjectSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Full Stack', 'Frontend', 'Backend', 'UI/UX', 'Mobile'], default: 'Full Stack' },
  techStack: [{ type: String }],
  githubUrl: { type: String, required: true },
  liveUrl: { type: String },
  imageUrl: { type: String },
  commitsCount: { type: Number, default: 20 },
  buildingColor: { type: String, default: '#38bdf8' },
  featured: { type: Boolean, default: true },
  createdAt: { type: String }
}, { timestamps: true });

const SkillSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: Number, required: true },
  iconName: { type: String },
  color: { type: String }
});

const HobbySchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String },
  category: { type: String }
});

const MovieSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  genre: { type: String, required: true },
  rating: { type: Number, required: true },
  posterUrl: { type: String },
  review: { type: String }
});

const CityConfigSchema = new Schema({
  theme: { type: String, default: 'cyberpunk' },
  showGrid: { type: Boolean, default: true },
  showParticles: { type: Boolean, default: true },
  autoRotate: { type: Boolean, default: true },
  rotationSpeed: { type: Number, default: 0.003 },
  weatherEffect: { type: String, default: 'starfield' },
  skyColor: { type: String, default: '#090d16' },
  gridColor: { type: String, default: '#38bdf8' }
});

const MessageSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  date: { type: String },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export const ProfileModel = mongoose.model('Profile', ProfileSchema);
export const ProjectModel = mongoose.model('Project', ProjectSchema);
export const SkillModel = mongoose.model('Skill', SkillSchema);
export const HobbyModel = mongoose.model('Hobby', HobbySchema);
export const MovieModel = mongoose.model('Movie', MovieSchema);
export const CityConfigModel = mongoose.model('CityConfig', CityConfigSchema);
export const MessageModel = mongoose.model('Message', MessageSchema);
