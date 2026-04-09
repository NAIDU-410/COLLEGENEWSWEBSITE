import ExamSchedule from '../models/ExamSchedule.js';
import { fileToBase64 } from '../utils/fileUtils.js';

// @desc    Get all exam schedules
// @route   GET /api/exams
// @access  Public
export const getExams = async (req, res) => {
    try {
        const { branch, year, semester, examType } = req.query;
        let query = {};
        
        if (branch) query.branch = { $regex: new RegExp("^" + branch + "$", "i") };
        if (year) query.academicYear = { $regex: new RegExp("^" + year + "$", "i") };
        if (semester) query.semester = { $regex: new RegExp("^" + semester + "$", "i") };
        if (examType) query.examType = { $regex: new RegExp("^" + examType + "$", "i") };

        const exams = await ExamSchedule.find(query).sort({ createdAt: -1 });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single exam schedule
// @route   GET /api/exams/:id
// @access  Public
export const getExamById = async (req, res) => {
    try {
        const exam = await ExamSchedule.findById(req.params.id);
        if (exam) {
            res.json(exam);
        } else {
            res.status(404).json({ message: 'Exam schedule not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new exam schedule
// @route   POST /api/exams
// @access  Private/Admin
export const createExam = async (req, res) => {
    try {
        const { branch, academicYear, semester, examType, mode, subjects } = req.body;
        
        const examData = {
            branch,
            academicYear,
            semester,
            examType,
            mode
        };

        if (mode === 'image') {
            if (req.file) {
                examData.imageUrl = await fileToBase64(req.file.path);
            } else {
                return res.status(400).json({ message: 'Image is required for image mode' });
            }
        } else if (subjects) {
            examData.subjects = typeof subjects === 'string' ? JSON.parse(subjects) : subjects;
        }

        const exam = new ExamSchedule(examData);
        const createdExam = await exam.save();
        res.status(201).json(createdExam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update exam schedule
// @route   PUT /api/exams/:id
// @access  Private/Admin
export const updateExam = async (req, res) => {
    try {
        const exam = await ExamSchedule.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Exam schedule not found' });
        }

        const { branch, academicYear, semester, examType, mode, subjects } = req.body;

        exam.branch = branch || exam.branch;
        exam.academicYear = academicYear || exam.academicYear;
        exam.semester = semester || exam.semester;
        exam.examType = examType || exam.examType;
        exam.mode = mode || exam.mode;

        if (exam.mode === 'image') {
            if (req.file) {
                exam.imageUrl = await fileToBase64(req.file.path);
                exam.subjects = []; // Clear subjects if switched to image mode
            }
        } else if (subjects) {
            const newSubjects = typeof subjects === 'string' ? JSON.parse(subjects) : subjects;
            
            // Strike-through tracking logic for manual mode
            if (exam.subjects && exam.subjects.length > 0) {
                exam.subjects = newSubjects.map(newSub => {
                    // Find matching subject by name to track changes
                    const oldSub = exam.subjects.find(s => s.subjectName === newSub.subjectName);
                    
                    if (oldSub) {
                        const dateChanged = oldSub.date !== newSub.date || oldSub.month !== newSub.month || oldSub.year !== newSub.year;
                        const timeChanged = oldSub.time !== newSub.time;

                        if (dateChanged || timeChanged) {
                            return {
                                ...newSub,
                                oldDate: dateChanged ? `${oldSub.date} ${oldSub.month}` : oldSub.oldDate,
                                oldTime: timeChanged ? oldSub.time : oldSub.oldTime,
                                isUpdated: true
                            };
                        }
                        // Keep mutation history if already updated once
                        return {
                            ...newSub,
                            oldDate: oldSub.oldDate,
                            oldTime: oldSub.oldTime,
                            isUpdated: oldSub.isUpdated
                        };
                    }
                    return newSub;
                });
            } else {
                exam.subjects = newSubjects;
            }
            exam.imageUrl = undefined; // Clear image if switched to manual mode
        }

        const updatedExam = await exam.save();
        res.json(updatedExam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete exam schedule
// @route   DELETE /api/exams/:id
// @access  Private/Admin
export const deleteExam = async (req, res) => {
    try {
        const exam = await ExamSchedule.findById(req.params.id);

        if (exam) {
            await exam.deleteOne();
            res.json({ message: 'Exam schedule removed' });
        } else {
            res.status(404).json({ message: 'Exam schedule not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
