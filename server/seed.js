const crypto = require('crypto');
global.crypto = crypto;
require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const Service = require('./models/Service');

const seedDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB, seeding...');

        await Doctor.deleteMany({});
        await Service.deleteMany({});

        const doctors = [
            {
                name: 'Dr. Robert Anderson', department: 'Cardiology', title: 'Senior Cardiologist',
                gender: 'male', experience: '15+ Years', qualification: 'MD, FACC',
                rating: 4.9, reviews: 120, location: 'Block A, Floor 3',
                image: '/uploads/doctor-1.jpg',
                tags: ['Heart Failure', 'Arrhythmia', 'Cardiac Surgery'],
                description: 'Expert diagnosis and treatment for heart conditions using advanced cardiac care technology.',
                schedule: { mon: ['09:00','09:30','10:00','10:30','11:00','14:00','14:30','15:00'], wed: ['09:00','09:30','10:00','11:00','11:30','14:00','15:00','15:30'], fri: ['09:00','10:00','10:30','11:00','14:00','14:30'] },
                featured: true
            },
            {
                name: 'Dr. Sarah Mitchell', department: 'Neurology', title: 'Senior Neurologist',
                gender: 'female', experience: '12+ Years', qualification: 'MD, DM Neurology',
                rating: 5.0, reviews: 95, location: 'Block A, Floor 4',
                image: '/uploads/doctor-2.jpg',
                tags: ['Stroke', 'Epilepsy', 'Neuro-rehab'],
                description: 'Specialized in stroke management, epilepsy treatment, and neuro-rehabilitation.',
                schedule: { tue: ['09:00','09:30','10:00','10:30','14:00','14:30','15:00'], thu: ['09:00','10:00','11:00','14:00','15:00','15:30'], sat: ['09:00','09:30','10:00','10:30'] },
                featured: true
            },
            {
                name: 'Dr. James Carter', department: 'Orthopedics', title: 'Orthopedic Surgeon',
                gender: 'male', experience: '18+ Years', qualification: 'MS Ortho, FRCS',
                rating: 4.6, reviews: 88, location: 'Block C, Floor 1',
                image: '/uploads/doctor-3.jpg',
                tags: ['Joint Replacement', 'Sports Injury'],
                description: 'Expert in joint replacement, sports injuries, and minimally invasive surgery.',
                schedule: { mon: ['09:00','09:30','10:00','14:00','14:30'], tue: ['10:00','11:00','14:00','15:00'], wed: ['09:00','09:30','10:00','10:30','14:00'], thu: ['09:00','10:00','14:00','14:30','15:00'] },
                featured: true
            },
            {
                name: 'Dr. Emily Watson', department: 'Pediatric', title: 'Senior Pediatrician',
                gender: 'female', experience: '10+ Years', qualification: 'MD, DCH',
                rating: 4.9, reviews: 142, location: 'Block D, Floor 2',
                image: '/uploads/doctor-4.jpg',
                tags: ['Child Development', 'Vaccination'],
                description: 'Dedicated healthcare for infants, children, and adolescents.',
                schedule: { mon: ['09:00','09:30','10:00','10:30','11:00','14:00','14:30'], wed: ['09:00','09:30','10:00','14:00','14:30','15:00'], sat: ['09:00','09:30','10:00','10:30','11:00'] },
                featured: false
            },
            {
                name: 'Dr. Michael Torres', department: 'Cardiology', title: 'Interventional Cardiologist',
                gender: 'male', experience: '20+ Years', qualification: 'MD, PhD Cardiology',
                rating: 4.9, reviews: 78, location: 'Block A, Floor 3',
                image: '/uploads/doctor-5.jpg',
                tags: ['Vascular Health', 'Interventional Cardiology'],
                description: 'Specialized in interventional cardiology and vascular health.',
                schedule: { tue: ['10:00','10:30','11:00','14:00','14:30','15:00'], thu: ['09:00','09:30','10:00','10:30','14:00','15:00','15:30','16:00'] },
                featured: false
            },
            {
                name: 'Dr. Lisa Chen', department: 'General Medicine', title: 'General Physician',
                gender: 'female', experience: '8+ Years', qualification: 'MD, DNB',
                rating: 4.5, reviews: 200, location: 'Block A, Floor 1',
                image: '/uploads/doctor-6.jpg',
                tags: ['Routine Checkup', 'Preventive Care'],
                description: 'Primary healthcare services including routine checkups and preventive care.',
                schedule: { mon: ['08:00','08:30','09:00','09:30','10:00','14:00','14:30','15:00'], tue: ['08:00','08:30','09:00','14:00','14:30','15:00'], wed: ['08:00','08:30','09:00','09:30','10:00','14:00'], thu: ['08:00','08:30','09:00','14:00','14:30'], fri: ['08:00','08:30','09:00','14:00','14:30'], sat: ['09:00','09:30','10:00'] },
                featured: false
            },
            {
                name: 'Dr. Rachel Green', department: 'Emergency', title: 'Emergency Specialist',
                gender: 'female', experience: '11+ Years', qualification: 'MD, MEM',
                rating: 5.0, reviews: 156, location: 'Emergency Wing',
                image: '/uploads/doctor-8.jpg',
                tags: ['Trauma', 'Critical Care', '24/7 ER'],
                description: '24/7 emergency services with rapid response and critical care expertise.',
                schedule: { mon: ['08:00','12:00','16:00','20:00'], tue: ['08:00','12:00','16:00','20:00'], wed: ['08:00','12:00','16:00','20:00'], thu: ['08:00','12:00','16:00','20:00'], fri: ['08:00','12:00','16:00','20:00'], sat: ['08:00','12:00','16:00','20:00'] },
                featured: false
            },
            {
                name: 'Dr. David Park', department: 'Neurology', title: 'Neurologist',
                gender: 'male', experience: '14+ Years', qualification: 'MD, DM Neuro',
                rating: 4.7, reviews: 64, location: 'Block A, Floor 4',
                image: '/uploads/doctor-7.jpg',
                tags: ['Migraine', 'Brain Tumors'],
                description: 'Specialized in migraine management and brain tumor diagnostics.',
                schedule: { mon: ['10:00','10:30','11:00','14:00','15:00'], wed: ['09:00','09:30','10:00','14:00','14:30','15:00'], fri: ['09:00','10:00','11:00'] },
                featured: false
            }
        ];

        await Doctor.insertMany(doctors);
        console.log('✅ Seeded ' + doctors.length + ' doctors');

        // Seed services
        const services = [
            {
                name: 'Cardiology',
                description: 'Expert diagnosis and treatment for heart conditions using advanced cardiac care technology and interventional procedures.',
                icon: 'fa-solid fa-heart-pulse',
                features: ['Echocardiography & Stress Testing', 'Cardiac Catheterization', 'Heart Failure Management', 'Arrhythmia & Pacemaker Implantation', 'Preventive Cardiac Screening'],
                featured: true
            },
            {
                name: 'Neurology',
                description: 'Specialized neurological care for brain, spine, and nervous system disorders with state-of-the-art diagnostic tools.',
                icon: 'fa-solid fa-brain',
                features: ['Stroke Assessment & Treatment', 'Epilepsy Monitoring', 'EEG & Nerve Conduction Studies', 'Migraine & Headache Management', 'Neuro-rehabilitation Programs'],
                featured: true
            },
            {
                name: 'Emergency Care',
                description: '24/7 emergency services with rapid response teams and fully equipped critical care facilities for all emergencies.',
                icon: 'fa-solid fa-truck-medical',
                features: ['Round-the-clock Emergency Room', 'Trauma & Accident Care', 'ICU & Critical Care Support', 'Ambulance & Transport Services', 'Rapid Triage System'],
                featured: true
            },
            {
                name: 'Orthopedics',
                description: 'Complete treatment for bone, joint, and muscle conditions including minimally invasive surgery and rehabilitation.',
                icon: 'fa-solid fa-bone',
                features: ['Joint Replacement Surgery', 'Sports Injury Treatment', 'Spine Surgery & Correction', 'Fracture Care & Casting', 'Physiotherapy & Rehabilitation'],
                featured: true
            },
            {
                name: 'Pediatric Care',
                description: 'Dedicated healthcare for infants, children, and adolescents in a safe, child-friendly environment.',
                icon: 'fa-solid fa-baby',
                features: ['Newborn & Neonatal Care', 'Childhood Immunization Programs', 'Growth & Development Monitoring', 'Pediatric Surgery', 'Allergy & Asthma Management'],
                featured: false
            },
            {
                name: 'General Medicine',
                description: 'Primary healthcare services including routine checkups, diagnostics, and preventive care for all ages.',
                icon: 'fa-solid fa-stethoscope',
                features: ['Annual Health Checkups', 'Diabetes & Thyroid Management', 'Hypertension Monitoring', 'Lab Diagnostics & Pathology', 'Preventive Health Screenings'],
                featured: false
            },
            {
                name: 'Pulmonology',
                description: 'Diagnosis and treatment of respiratory conditions including asthma, COPD, and sleep-related breathing disorders.',
                icon: 'fa-solid fa-lungs',
                features: ['Pulmonary Function Testing', 'Asthma & Allergy Treatment', 'COPD Management', 'Sleep Study & Apnea Treatment', 'Bronchoscopy Procedures'],
                featured: false
            },
            {
                name: 'Ophthalmology',
                description: 'Comprehensive eye care from routine vision tests to advanced surgical procedures for various eye conditions.',
                icon: 'fa-solid fa-eye',
                features: ['Comprehensive Eye Exams', 'Cataract Surgery', 'Glaucoma Diagnosis & Treatment', 'LASIK & Refractive Surgery', 'Diabetic Eye Care'],
                featured: false
            }
        ];

        await Service.insertMany(services);
        console.log('✅ Seeded ' + services.length + ' services');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
};

seedDoctors();