import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

// Teacher List
const TEACHERS = [
    { id: 1, name: 'Chauhan Sushma' },
    { id: 2, name: 'Dharne Rekha' },
    { id: 3, name: 'Chamedia Aarti' },
    { id: 4, name: 'Nazneen Pathan' },
    { id: 5, name: 'Pankaja Sherkhane' },
    { id: 6, name: 'Sandya S.R.' },
    { id: 7, name: 'Bidarkar Neelam' },
    { id: 8, name: 'Balaji Hude' },
    { id: 9, name: 'Patil Smita' },
    { id: 10, name: 'Udgire Swati' },
    { id: 11, name: 'Gupta Premalata' },
    { id: 12, name: 'Shaikh Naaz' },
    { id: 13, name: 'Gaikwad Satish' },
    { id: 14, name: 'Kadam Sachin' },
    { id: 15, name: 'Gore Sharad' },
    { id: 16, name: 'Raut Monali' },
    { id: 17, name: 'Kondekar Surekha' },
    { id: 18, name: 'Tapade Madhuri' },
    { id: 19, name: 'Ingle Ravindra' }
];

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  
  // ✅ ADD THIS - Get API URL from environment variable
  const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

  const [formData, setFormData] = useState({
    grade: '',
    division: '',
    teacher_guide: '',
    team_name: '',
    project_title: '',
    abstract: '',
    participants: 1,
    students: [
      { name: '', parent_name: '', parent_phone: '', parent_email: '' }
    ]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'participants') {
      const newCount = parseInt(value);
      const currentStudents = [...formData.students];
      
      if (newCount > currentStudents.length) {
        for (let i = currentStudents.length; i < newCount; i++) {
          currentStudents.push({ name: '', parent_name: '', parent_phone: '', parent_email: '' });
        }
      } else {
        currentStudents.length = newCount;
      }
      
      setFormData({
        ...formData,
        participants: newCount,
        students: currentStudents
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleStudentChange = (index, field, value) => {
    const updatedStudents = [...formData.students];
    updatedStudents[index][field] = value;
    setFormData({ ...formData, students: updatedStudents });
  };

  const validateForm = () => {
    if (!formData.grade || !formData.division || !formData.teacher_guide || !formData.team_name || !formData.project_title) {
      toast.error('Please fill all required fields');
      return false;
    }

    for (let i = 0; i < formData.students.length; i++) {
      const student = formData.students[i];
      if (!student.name) {
        toast.error(`Please enter name for Student ${i + 1}`);
        return false;
      }
      if (!student.parent_name) {
        toast.error(`Please enter parent name for ${student.name}`);
        return false;
      }
      if (!student.parent_phone) {
        toast.error(`Please enter parent phone for ${student.name}`);
        return false;
      }
      
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(student.parent_phone)) {
        toast.error(`Invalid phone number for ${student.name}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        grade: formData.grade,
        division: formData.division,
        teacher_guide: formData.teacher_guide,
        team_name: formData.team_name,
        project_title: formData.project_title,
        abstract: formData.abstract,
        participants: formData.participants,
        students: formData.students
      };

      // ✅ FIXED - Use API_URL instead of localhost
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        payload
      );

      if (response.data.success) {
        setRegistrationData(response.data.data);
        toast.success('✅ Registration successful!');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (registrationData) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Registration Successful!
          </h2>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm"><strong>Team Name:</strong></p>
            <p className="text-xl font-bold text-blue-600">{registrationData.team_name}</p>
            <p className="text-sm mt-2"><strong>Group Code:</strong></p>
            <p className="text-xl font-mono font-bold text-blue-600">{registrationData.registration_code}</p>
            <p className="text-sm mt-2"><strong>Password:</strong></p>
            <p className="text-xl font-mono font-bold text-red-600">{registrationData.password}</p>
            <p className="text-sm mt-2"><strong>Teacher Guide:</strong></p>
            <p className="text-lg font-semibold text-purple-600">{registrationData.teacher_guide}</p>
          </div>

          <div className="mb-4 text-left">
            <p className="text-sm font-semibold text-gray-700">Participants:</p>
            {registrationData.students.map((student, idx) => (
              <div key={idx} className="bg-blue-50 p-2 rounded mt-1">
                <p className="text-sm">
                  <strong>{idx + 1}.</strong> {student.name} 
                  <span className="text-gray-500 ml-2">(Parent: {student.parent_name})</span>
                </p>
              </div>
            ))}
          </div>

          {registrationData.qr_code && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Your QR Code:</p>
              <img src={registrationData.qr_code} alt="QR Code" className="mx-auto w-32 h-32 border-2 border-gray-200 rounded-lg" />
            </div>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>

          <p className="mt-4 text-xs text-red-500">⚠️ Save these credentials immediately!</p>
        </div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">
        🏫 Science Fair Registration
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Grade and Division */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Grade *</label>
            <select
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select</option>
              {[3,4,5,6,7,8,9,10].map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Division *</label>
            <select
              name="division"
              value={formData.division}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select</option>
              {['A','B','C','D','E','F','G','H','I','J'].map(d => (
                <option key={d} value={d}>Division {d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Teacher Guide */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Teacher Guide *</label>
          <select
            name="teacher_guide"
            value={formData.teacher_guide}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select Teacher</option>
            {TEACHERS.map(teacher => (
              <option key={teacher.id} value={teacher.name}>
                {teacher.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Select your project guide teacher</p>
        </div>

        {/* Team Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Team/Group Name *</label>
          <input
            type="text"
            name="team_name"
            value={formData.team_name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., The Innovators, Team Solar"
            required
          />
        </div>

        {/* Project Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Title *</label>
          <input
            type="text"
            name="project_title"
            value={formData.project_title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., Solar Powered Water Purifier"
            required
          />
        </div>

        {/* Abstract */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Abstract</label>
          <textarea
            name="abstract"
            rows="3"
            value={formData.abstract}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Brief description of your project..."
          />
        </div>

        {/* Participants */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-blue-600">👨‍👩‍👧‍👦 Participants</h3>
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Number of Students:</label>
              <select
                name="participants"
                value={formData.participants}
                onChange={handleChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {[1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.students.map((student, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-3">Student {index + 1}</h4>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student Name *</label>
                  <input
                    type="text"
                    value={student.name}
                    onChange={(e) => handleStudentChange(index, 'name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Full name of student"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parent/Guardian Name *</label>
                    <input
                      type="text"
                      value={student.parent_name}
                      onChange={(e) => handleStudentChange(index, 'parent_name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Parent's full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">WhatsApp Number *</label>
                    <div className="mt-1 flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">+91</span>
                      <input
                        type="tel"
                        value={student.parent_phone}
                        onChange={(e) => handleStudentChange(index, 'parent_phone', e.target.value)}
                        className="flex-1 block w-full rounded-r-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="9876543210"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">10-digit mobile number</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Parent Email (Optional)</label>
                  <input
                    type="email"
                    value={student.parent_email}
                    onChange={(e) => handleStudentChange(index, 'parent_email', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="parent@email.com"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registering...
            </span>
          ) : (
            `Register & Send WhatsApp (${formData.students.length} parents)`
          )}
        </button>
      </form>
    </div>
  );
};

export default Register;