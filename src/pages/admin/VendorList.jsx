import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, X, Save, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import './AdminTable.css';
import './VendorList.css';

// Simple Drag & Drop Upload Component
const ImageUploader = ({ label, images, onUpload, onDelete, multiple = false }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            onUpload(files);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            onUpload(files);
        }
    };

    // Normalize images to array
    const imageList = Array.isArray(images) ? images : (images ? [images] : []);

    return (
        <div className="form-group">
            <label>{label}</label>

            {/* Upload Area */}
            <div
                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById(`file-input-${label}`).click()}
            >
                <input
                    id={`file-input-${label}`}
                    type="file"
                    multiple={multiple}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <div className="upload-placeholder">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                        Click or Drag & Drop images here
                    </p>
                </div>
            </div>

            {/* Preview Area */}
            {imageList.length > 0 && (
                <div className="image-preview-grid mt-3">
                    {imageList.map((url, index) => (
                        <div key={index} className="image-preview-item">
                            <img src={url} alt="Preview" />
                            <button
                                className="delete-btn"
                                onClick={(e) => { e.stopPropagation(); onDelete(url); }}
                            >
                                <X size={12} color="white" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function VendorList() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingVendor, setEditingVendor] = useState(null);

    useEffect(() => {
        console.log('VendorList Component MOUNTED'); // Global mount log
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            console.log('Fetching vendors...');
            const { data, error } = await supabase.from('vendors').select('*');
            if (error) throw error;
            console.log('Vendors fetched:', data);

            // Parse gallery_images from JSON string if needed (Supabase might return JSON object/array directly if column type is JSON, but SQL schema defined as TEXT, so parse is safer)
            const parsedData = data.map(v => ({
                ...v,
                gallery_images: v.gallery_images && typeof v.gallery_images === 'string' ? JSON.parse(v.gallery_images) : (v.gallery_images || [])
            }));
            setVendors(parsedData);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditClick = (vendor) => {
        console.log('Editing vendor (CLICKED):', vendor); // Debug log
        setEditingVendor({
            ...vendor,
            gallery_images: Array.isArray(vendor.gallery_images) ? vendor.gallery_images : []
        });
    };

    const handleAddClick = () => {
        setEditingVendor({
            name: '',
            category: '',
            contact: '',
            location: '',
            status: 'partner',
            image: '',
            gallery_images: [],
            is_featured: false
        });
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...editingVendor,
                gallery_images: JSON.stringify(editingVendor.gallery_images)
            };

            // Remove properties that shouldn't be updated or cause issues if they don't match exactly (like created_at)
            const { id, created_at, ...updateData } = payload;

            let error;
            if (editingVendor.id) {
                // UPDATE existing vendor
                const result = await supabase
                    .from('vendors')
                    .update(updateData)
                    .eq('id', editingVendor.id);
                error = result.error;
            } else {
                // INSERT new vendor
                const result = await supabase
                    .from('vendors')
                    .insert([updateData]);
                error = result.error;
            }

            if (!error) {
                setEditingVendor(null);
                fetchVendors();
            } else {
                throw error;
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save vendor: ' + err.message);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingVendor(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // File Upload Handler
    // File Upload Handler (Supabase)
    const handleUpload = async (files, field) => {
        try {
            const uploadedUrls = [];

            for (const file of files) {
                // Generate unique filename
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

                // Upload to Supabase 'images' bucket
                const { error } = await supabase.storage
                    .from('images')
                    .upload(fileName, file);

                if (error) throw error;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(fileName);

                uploadedUrls.push(publicUrl);
            }

            setEditingVendor(prev => {
                if (field === 'image') {
                    return { ...prev, image: uploadedUrls[0] }; // Replace main image
                } else {
                    return { ...prev, gallery_images: [...prev.gallery_images, ...uploadedUrls] }; // Append to gallery
                }
            });

        } catch (err) {
            console.error('Supabase Upload Error:', err);
            alert('Upload failed: ' + err.message);
        }
    };

    const handleDeleteImage = (url, field) => {
        setEditingVendor(prev => {
            if (field === 'image') {
                return { ...prev, image: '' };
            } else {
                return { ...prev, gallery_images: prev.gallery_images.filter(img => img !== url) };
            }
        });
    };

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h1 className="page-title">업체 관리 (DEBUG)</h1>
                <div className="page-actions">
                    <button className="btn-primary" onClick={handleAddClick}><Plus size={16} /> 업체 등록</button>
                </div>
            </div>

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>이미지</th>
                            <th>업체명</th>
                            <th>카테고리</th>
                            <th>연락처</th>
                            <th>위치</th>
                            <th>메인 노출</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="9" className="text-center">로딩 중...</td></tr>
                        ) : vendors.map(vendor => (
                            <tr key={vendor.id}>
                                <td>{vendor.id}</td>
                                <td>
                                    {vendor.image ? (
                                        <img src={vendor.image} alt={vendor.name} className="vendor-list-thumb" />
                                    ) : (
                                        <div className="vendor-list-thumb no-img">No Img</div>
                                    )}
                                </td>
                                <td>{vendor.name}</td>
                                <td>{vendor.category}</td>
                                <td>{vendor.contact}</td>
                                <td>{vendor.location}</td>
                                <td>
                                    <input type="checkbox" checked={!!vendor.is_featured} readOnly />
                                </td>
                                <td><span className={`status-badge ${vendor.status === 'active' || vendor.status === 'partner' ? 'active' : ''}`}>{vendor.status}</span></td>
                                <td>
                                    <button className="btn-icon" onClick={() => handleEditClick(vendor)}>
                                        <Edit2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))
                        }
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingVendor && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingVendor.id ? '업체 정보 수정' : '업체 등록'}</h2>
                            <button className="close-btn" onClick={() => setEditingVendor(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body custom-scrollbar" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label>업체명</label>
                                    <input name="name" value={editingVendor.name || ''} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>카테고리</label>
                                    <input name="category" value={editingVendor.category || ''} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>연락처</label>
                                    <input name="contact" value={editingVendor.contact || ''} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>위치</label>
                                    <input name="location" value={editingVendor.location || ''} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>상태</label>
                                <select name="status" value={editingVendor.status || 'partner'} onChange={handleChange}>
                                    <option value="partner">Partner</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="is_featured"
                                        checked={!!editingVendor.is_featured}
                                        onChange={handleChange}
                                    />
                                    메인 페이지 노출 (Premium Brand)
                                </label>
                            </div>

                            <hr className="my-4 border-gray-100" />

                            {/* Image Uploaders */}
                            <ImageUploader
                                label="대표 이미지 (Main Image)"
                                images={editingVendor.image}
                                onUpload={(files) => handleUpload(files, 'image')}
                                onDelete={(url) => handleDeleteImage(url, 'image')}
                            />

                            <ImageUploader
                                label="갤러리 이미지 (Gallery Images)"
                                images={editingVendor.gallery_images}
                                multiple={true}
                                onUpload={(files) => handleUpload(files, 'gallery')}
                                onDelete={(url) => handleDeleteImage(url, 'gallery')}
                            />

                        </div>
                        <div className="modal-footer">
                            <button className="btn-primary w-full" onClick={handleSave}>
                                <Save size={16} /> 저장하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
