import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Link as LinkIcon, Type, FileText, Upload } from 'lucide-react';
import { getHomeCarousels, createHomeCarousel, updateHomeCarousel, deleteHomeCarousel } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';

const ManageHomeCarousel = () => {
    const [carousels, setCarousels] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const [formData, setFormData] = useState({
        image: '',
        link: '',
        title: '',
        description: '',
        type: 'main'
    });

    useEffect(() => {
        fetchCarousels();
    }, []);

    const fetchCarousels = async () => {
        try {
            const response = await getHomeCarousels();
            setCarousels(response.data);
        } catch (error) {
            toast.error('Failed to fetch carousel items');
        } finally {
            setIsLoading(false);
        }
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setFormData(prev => ({ ...prev, image: file.name })); // Dummy for validation
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openModal = (item = null) => {
        setSelectedFile(null);
        if (item) {
            setEditingItem(item);
            setPreviewUrl(getImageUrl(item.image));
            setFormData({
                image: item.image,
                link: item.link,
                title: item.title || '',
                description: item.description || '',
                type: item.type || 'main'
            });
        } else {
            setEditingItem(null);
            setPreviewUrl('');
            setFormData({
                image: '',
                link: '',
                title: '',
                description: '',
                type: 'main'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedFile && !editingItem) {
            toast.error('Please select an image');
            return;
        }

        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append('link', formData.link);
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('type', formData.type);
            
            if (selectedFile) {
                submitData.append('image', selectedFile);
            } else {
                submitData.append('image', formData.image);
            }

            if (editingItem) {
                await updateHomeCarousel(editingItem._id, submitData);
                toast.success('Carousel item updated successfully!');
            } else {
                await createHomeCarousel(submitData);
                toast.success('Carousel item added successfully!');
            }
            fetchCarousels();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save carousel item');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this carousel item?')) {
            try {
                await deleteHomeCarousel(id);
                toast.success('Carousel item deleted successfully');
                fetchCarousels();
            } catch (error) {
                toast.error('Failed to delete carousel item');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-6 pb-32">
            <div className="max-w-7xl mx-auto flex flex-col gap-10">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-800 tracking-tight flex items-center gap-4">
                            <ImageIcon className="text-primary" size={36} /> 
                            Manage Home Carousel
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Add, edit, and organize dynamic homepage banners.</p>
                    </div>
                    <button 
                        onClick={() => openModal()}
                        className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        <Plus size={20} /> Add Carousel Image
                    </button>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : carousels.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100 flex flex-col items-center gap-4">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-700">No carousel items available</h3>
                        <p className="text-gray-400 max-w-md">You haven't added any images to the home carousel yet. Click the button above to add your first item.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {carousels.map((item, index) => (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                key={item._id} 
                                className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-slate-100 group hover:shadow-2xl transition-all duration-300 flex flex-col"
                            >
                                <div className="h-48 relative overflow-hidden bg-slate-100">
                                    <img 
                                        src={getImageUrl(item.image)} 
                                        alt={item.title || 'Carousel image'} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = 'https://placehold.co/600x400?text=Image+Error';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button 
                                            onClick={() => openModal(item)}
                                            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item._id)}
                                            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-rose-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-6 right-6 text-white">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                                                item.type === 'main' ? 'bg-blue-500/80' : item.type === 'logo' ? 'bg-emerald-500/80' : 'bg-amber-500/80'
                                            }`}>
                                                {item.type || 'Main'}
                                            </span>
                                        </div>
                                        {item.title && <h3 className="font-bold text-lg line-clamp-1">{item.title}</h3>}
                                        <div className="flex items-center gap-2 text-xs font-semibold bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md mt-2 tracking-wide truncate max-w-full">
                                            <LinkIcon size={12} /> {item.link}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 flex-grow flex flex-col">
                                    {item.description ? (
                                        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                                            {item.description}
                                        </p>
                                    ) : (
                                        <p className="text-gray-300 text-sm italic">No description provided</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
                                <h2 className="text-2xl font-black text-gray-800">
                                    {editingItem ? 'Edit Carousel Item' : 'Add New Carousel Item'}
                                </h2>
                                <button onClick={closeModal} className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                             <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                                {/* Image Upload & Preview */}
                                <div className="flex flex-col gap-4">
                                    <label className="font-bold text-gray-700 text-sm uppercase tracking-wide">Image Selection *</label>
                                    <div 
                                        onClick={() => document.getElementById('image-upload').click()}
                                        className="w-full h-56 bg-slate-50 rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 relative group flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                                    >
                                        {previewUrl ? (
                                            <>
                                                <img 
                                                    src={previewUrl} 
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm bg-primary px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                                                        <Upload size={16} /> Change Image
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 text-slate-400">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <Upload size={32} />
                                                </div>
                                                <div className="text-center">
                                                    <span className="font-bold text-gray-700 block">Click to upload image</span>
                                                    <span className="text-xs font-medium">PNG, JPG or JPEG (Max 5MB)</span>
                                                </div>
                                            </div>
                                        )}
                                        <input 
                                            id="image-upload"
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-gray-700 text-sm uppercase tracking-wide">Image Type *</label>
                                    <div className="relative">
                                        <select 
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium appearance-none"
                                        >
                                            <option value="main">Main Hero Carousel</option>
                                            <option value="logo">College Branding Logo</option>
                                            <option value="navbar">Navbar Logo</option>
                                        </select>
                                    </div>
                                    <p className="text-xs text-gray-400 ml-2">Select where this image will be displayed on the platform.</p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-gray-700 text-sm uppercase tracking-wide">Redirect Link *</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="text" 
                                            name="link"
                                            required
                                            value={formData.link}
                                            onChange={handleInputChange}
                                            placeholder="/events/123 or /sports/cricket"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 ml-2">Internal paths preferred, e.g., <code className="bg-slate-100 px-1 py-0.5 rounded text-primary">/achievements/:id</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-primary">/sports/cricket/:id</code></p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-gray-700 text-sm uppercase tracking-wide">Title (Optional)</label>
                                    <div className="relative">
                                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="text" 
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="E.g., Grand Annual Tech Fest"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-gray-700 text-sm uppercase tracking-wide">Description (Optional)</label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-5 text-slate-400" size={18} />
                                        <textarea 
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Write a short subtext to show over the image..."
                                            rows="3"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                                    <button 
                                        type="button" 
                                        onClick={closeModal}
                                        className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="px-8 py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 flex items-center justify-center min-w-[160px]"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : editingItem ? 'Save Changes' : 'Publish'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageHomeCarousel;
