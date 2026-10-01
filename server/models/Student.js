import mongoose from 'mongoose';

export const COMPANY_NAMES = [
  'Wipro',
  'HCLTech',
  'Accenture',
  'TCS',
  'Infosys',
  'Cognizant',
  'Capgemini',
  'IBM',
  'Deloitte',
  'Tech Mahindra',
];

const departments = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'AI & Data Science',
  'Other',
];

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  studentId: { type: String, required: true, trim: true, uppercase: true, unique: true },
  department: { type: String, required: true, enum: departments },
  year: { type: String, required: true, enum: ['1st year', '2nd year', '3rd year', '4th year'] },
  section: { type: String, required: true, enum: ['A', 'B', 'C', 'D', 'Other'] },
  bloodGroup: { type: String, required: true, enum: ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'] },
  fatherName: { type: String, required: true, trim: true },
  motherName: { type: String, required: true, trim: true },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (phone) => {
        const digits = phone.replace(/\D/g, '');
        return /^[+\d\s().-]+$/.test(phone) && digits.length >= 7 && digits.length <= 15;
      },
      message: 'Enter a valid phone number.',
    },
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'],
  },
  arrears: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: (arrears) => arrears === 0,
      message: 'Students must have zero standing arrears to register.',
    },
  },
  companies: {
    type: [{ type: String, enum: COMPANY_NAMES }],
    required: true,
    validate: {
      validator: (companies) => companies.length === 4 && new Set(companies).size === 4,
      message: 'Choose exactly four different companies.',
    },
  },
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
