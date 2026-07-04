import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const ProjectSubmit = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        aim: '',
        materials: '',
        procedure: '',
        conclusion: '',
        abstract: '',
        video_link: ''
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        
        // Create previews
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
        
        const newPreviews = [...imagePreviews];
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.aim || !formData.materials || !formData.procedure || !formData.conclusion) {
            toast.error('Please fill all required fields');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            
            // Add all fields
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    formDataToSend.append(key, formData[key]);
                }
            });
            
            // Add images
            images.forEach(image => {
                formDataToSend.append('images', image);
            });

            const response = await axios.post(
                'http://localhost:5000/api/projects/submit',
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                toast.success('Project submitted successfully! 🎉');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Submit Error:', error);
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">📝 Submit Your Project</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Project Aim */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">🎯 Aim / Objective *</label>
                    <textarea
                        name="aim"
                        rows="3"
                        value={formData.aim}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="What is the main goal of your project?"
                        required
                    />
                </div>

                {/* Materials Required */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">🧪 Materials Required *</label>
                    <textarea
                        name="materials"
                        rows="4"
                        value={formData.materials}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="List all materials and equipment used..."
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate items with commas or list each on a new line</p>
                </div>

                {/* Procedure */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">📋 Procedure / Methodology *</label>
                    <textarea
                        name="procedure"
                        rows="6"
                        value={formData.procedure}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Step by step procedure of your project..."
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Number each step clearly</p>
                </div>

                {/* Conclusion */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">✅ Conclusion / Results *</label>
                    <textarea
                        name="conclusion"
                        rows="4"
                        value={formData.conclusion}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="What did you learn? What were the results?"
                        required
                    />
                </div>

                {/* Abstract (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">📄 Abstract (Optional)</label>
                    <textarea
                        name="abstract"
                        rows="3"
                        value={formData.abstract}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Brief summary of your project..."
                    />
                </div>

                {/* Images */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">🖼️ Upload Images</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mt-1 block w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload photos of your project, experiments, or models (Max 5 images)</p>
                    
                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-3">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                    <img 
                                        src={preview} 
                                        alt={`Project ${index + 1}`} 
                                        className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Video Link */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">🎥 Video Link (Optional)</label>
                    <input
                        type="url"
                        name="video_link"
                        value={formData.video_link}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="https://youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-gray-500 mt-1">YouTube or Google Drive link to project demo video</p>
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
                            Submitting...
                        </span>
                    ) : (
                        'Submit Project'
                    )}
                </button>
            </form>
        </div>
    );
};

export default ProjectSubmit;