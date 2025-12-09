import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, X, Save, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
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
        fetchVendors();
    }, []);

    const fetchVendors = () => {
        fetch('/api/vendors')
            .then(res => res.json())
            .then(data => {
                // Parse gallery_images from JSON string if needed
                const parsedData = data.map(v => ({
                    ...v,
                    gallery_images: v.gallery_images ? JSON.parse(v.gallery_images) : []
                }));
                setVendors(parsedData);
                setLoading(false);
            })
            .catch(err => console.error(err));
    };

    const handleEditClick = (vendor) => {
        setEditingVendor({
            ...vendor,
            gallery_images: Array.isArray(vendor.gallery_images) ? vendor.gallery_images : []
        });
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...editingVendor,
                gallery_images: JSON.stringify(editingVendor.gallery_images)
            };

            const res = await fetch(`/api/vendors/${editingVendor.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setEditingVendor(null);
                fetchVendors();
            } else {
                alert('Failed to update vendor');
            }
        } catch (err) {
            console.error(err);
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
    const handleUpload = async (files, field) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.paths) {
                setEditingVendor(prev => {
                    if (field === 'image') {
                        return { ...prev, image: data.paths[0] }; // Replace main image
                    } else {
                        return { ...prev, gallery_images: [...prev.gallery_images, ...data.paths] }; // Append to gallery
                    }
                });
            }
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Upload failed');
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
                <h1 className="page-title">업체 관리</h1>
                <div className="page-actions">
                    <button className="btn-primary"><Plus size={16} /> 업체 등록</button>
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
                            <h2>업체 정보 수정</h2>
                            <button className="close-btn" onClick={() => setEditingVendor(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body custom-scrollbar" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label>업체명</label>
                                    <input name="name" value={editingVendor.name} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>카테고리</label>
                                    <input name="category" value={editingVendor.category} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>연락처</label>
                                    <input name="contact" value={editingVendor.contact} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>위치</label>
                                    <input name="location" value={editingVendor.location} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>상태</label>
                                <select name="status" value={editingVendor.status} onChange={handleChange}>
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
