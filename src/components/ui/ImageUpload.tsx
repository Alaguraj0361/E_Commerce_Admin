'use client';

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  Star, 
  Link as LinkIcon, 
  Loader2, 
  RefreshCw, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadSingleImage, uploadMultipleImages } from '@/lib/api';
import { ProductImage } from '@/types';

// ==========================================
// SINGLE IMAGE UPLOAD (e.g. Category Cover)
// ==========================================
interface SingleImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  className?: string;
}

export const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  value,
  onChange,
  label = 'Cover Image',
  helperText = 'Upload a high-resolution JPG, PNG, or WebP image (max 10MB)',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPEG, PNG, WebP, SVG, GIF)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size exceeds 10MB limit');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading image to server...');
    try {
      const url = await uploadSingleImage(file);
      onChange(url);
      toast.success('Image uploaded successfully', { id: toastId });
      setShowUrlInput(false);
    } catch (err: any) {
      toast.error(err.customMessage || 'Failed to upload image. Please try again.', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput('');
    setShowUrlInput(false);
    toast.success('Image URL applied');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-semibold text-[#6B6055] tracking-wide">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[10px] font-medium text-[#B8860B] hover:text-[#906908] flex items-center gap-1 transition-colors"
          >
            <LinkIcon className="w-2.5 h-2.5" />
            {showUrlInput ? 'Hide URL input' : 'Enter image URL instead'}
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files)}
        disabled={isUploading}
      />

      {/* Optional direct URL input bar */}
      {showUrlInput && (
        <div className="flex gap-2 p-2 bg-[#F5EFEB] rounded-xl border border-[#EAE1D1]">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 bg-white border border-[#EAE1D1] rounded-lg px-3 py-1.5 text-xs text-[#18140B] focus:outline-none focus:border-[#B8860B]"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-3 py-1.5 bg-[#B8860B] text-white rounded-lg text-xs font-semibold hover:bg-[#906908] transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      {/* Main Upload Dropzone or Active Preview */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-[#EAE1D1] bg-[#FAF8F5] shadow-inner">
          <div className="relative h-44 w-full bg-[#F5EFEB] flex items-center justify-center overflow-hidden">
            {/* Fallback & Next Image compatible display */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Category cover"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37] mb-2" />
                <span className="text-xs font-medium">Uploading replacement...</span>
              </div>
            )}
          </div>

          {/* Action Overlay */}
          <div className="p-3 bg-white border-t border-[#EAE1D1] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <p className="text-[11px] text-[#6B6055] font-mono truncate max-w-[200px]" title={value}>
                {value}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-[#F5EFEB] border border-[#EAE1D1] rounded-lg text-[11px] font-semibold text-[#18140B] flex items-center gap-1 transition-colors"
                title="Replace with local file"
              >
                <RefreshCw className="w-3 h-3 text-[#B8860B]" />
                Change
              </button>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-[#FAF8F5] hover:bg-[#F5EFEB] border border-[#EAE1D1] rounded-lg text-[#6B6055] transition-colors"
                title="Open image in new tab"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={isUploading}
                className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg transition-colors"
                title="Remove image"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[140px] ${
            isDragging
              ? 'border-[#B8860B] bg-[#F7F2E9] scale-[0.99]'
              : 'border-[#D4AF37]/40 hover:border-[#B8860B] bg-[#FAF8F5] hover:bg-[#F7F2E9]/70'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-2">
              <Loader2 className="w-8 h-8 text-[#B8860B] animate-spin mb-2" />
              <p className="text-xs font-semibold text-[#18140B]">Uploading image...</p>
              <p className="text-[10px] text-[#8C7E72] mt-0.5">Storing on secure server</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-[#F5EFEB] border border-[#EAE1D1] flex items-center justify-center mb-3 text-[#B8860B] group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-[#B8860B]" />
              </div>
              <h4 className="text-xs font-bold text-[#18140B] mb-1">
                Click to upload or drag & drop
              </h4>
              <p className="text-[11px] text-[#8C7E72] max-w-xs">{helperText}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#EAE1D1] rounded-full text-[10px] font-semibold text-[#B8860B] shadow-sm">
                <ImageIcon className="w-3 h-3" /> Browse Local Computer
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// MULTI IMAGE UPLOAD (e.g. Product Gallery)
// ==========================================
interface MultiImageUploadProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  productName?: string;
  maxImages?: number;
  label?: string;
  className?: string;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images,
  onChange,
  productName = 'Product',
  maxImages = 10,
  label = 'Visual Gallery & Assets',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      toast.error('Please select valid image files');
      return;
    }

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      toast.error(`Maximum of ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = fileArray.slice(0, availableSlots);
    if (fileArray.length > availableSlots) {
      toast.info(`Uploading first ${availableSlots} files to respect the ${maxImages} photo limit`);
    }

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${filesToUpload.length} image(s)...`);
    try {
      let urls: string[] = [];
      if (filesToUpload.length === 1) {
        const singleUrl = await uploadSingleImage(filesToUpload[0]);
        urls = [singleUrl];
      } else {
        urls = await uploadMultipleImages(filesToUpload);
      }

      const isFirst = images.length === 0;
      const newItems: ProductImage[] = urls.map((url, idx) => ({
        url,
        alt: `${productName} view ${images.length + idx + 1}`,
        isMain: isFirst && idx === 0,
      }));

      onChange([...images, ...newItems]);
      toast.success(`Successfully uploaded ${urls.length} photo(s)`, { id: toastId });
    } catch (err: any) {
      toast.error(err.customMessage || 'Failed to upload images. Please try again.', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    if (images.length >= maxImages) {
      toast.error(`Maximum of ${maxImages} images allowed`);
      return;
    }

    const isFirst = images.length === 0;
    onChange([
      ...images,
      {
        url: urlInput.trim(),
        alt: `${productName} view ${images.length + 1}`,
        isMain: isFirst,
      },
    ]);
    setUrlInput('');
    toast.success('Image URL added to gallery');
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isMain)) {
      updated[0].isMain = true;
    }
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    onChange(updated);
    toast.success('Primary cover image updated');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Counter and Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#B8860B]" />
          <h3 className="text-xs font-bold text-[#B8860B] uppercase tracking-wider">
            {label}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-medium text-[#B8860B] hover:text-[#906908] flex items-center gap-1 transition-colors"
          >
            <LinkIcon className="w-3 h-3" />
            {showUrlInput ? 'Hide URL paste' : 'Paste Image URL'}
          </button>
          <span className="text-[11px] font-semibold text-[#8C7E72] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#EAE1D1]">
            {images.length} / {maxImages} Photos
          </span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={isUploading}
      />

      {/* Optional URL Entry */}
      {showUrlInput && (
        <div className="flex gap-2 p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EAE1D1]">
          <input
            type="url"
            placeholder="Paste high-res image URL (e.g. Unsplash, CDN, WebP)..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 bg-white border border-[#EAE1D1] rounded-xl px-3.5 py-2 text-xs text-[#18140B] focus:outline-none focus:border-[#B8860B]"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-4 py-2 bg-[#B8860B] text-white rounded-xl text-xs font-semibold hover:bg-[#906908] transition-colors"
          >
            Add to Gallery
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
            isDragging
              ? 'border-[#B8860B] bg-[#F7F2E9] scale-[0.99]'
              : 'border-[#D4AF37]/40 hover:border-[#B8860B] bg-[#FAF8F5] hover:bg-[#F7F2E9]/70'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-2">
              <Loader2 className="w-7 h-7 text-[#B8860B] animate-spin mb-2" />
              <p className="text-xs font-semibold text-[#18140B]">Uploading photos...</p>
              <p className="text-[10px] text-[#8C7E72]">Optimizing & storing files on server</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F5EFEB] border border-[#EAE1D1] flex items-center justify-center text-[#B8860B]">
                <UploadCloud className="w-5 h-5 text-[#B8860B]" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold text-[#18140B]">
                  Upload Product Photos from Computer
                </p>
                <p className="text-[11px] text-[#8C7E72]">
                  Drag and drop multiple images or click to select files (JPG, PNG, WebP)
                </p>
              </div>
              <button
                type="button"
                className="mt-1 sm:mt-0 sm:ml-auto px-3.5 py-1.5 bg-white border border-[#EAE1D1] rounded-xl text-xs font-semibold text-[#B8860B] hover:bg-[#FAF8F5] shadow-sm transition-all"
              >
                Browse Files
              </button>
            </div>
          )}
        </div>
      )}

      {/* Thumbnails Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-[#6B6055]">
            Uploaded Photos (hover to set primary cover or delete):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`relative group rounded-xl overflow-hidden border aspect-square bg-[#FAF8F5] transition-all shadow-sm ${
                  img.isMain
                    ? 'border-[#B8860B] ring-2 ring-[#B8860B]/30'
                    : 'border-[#EAE1D1] hover:border-[#B8860B]/60'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt || `Product photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Primary Cover Badge */}
                {img.isMain && (
                  <div className="absolute top-1.5 left-1.5 bg-[#B8860B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                    <Star className="w-2.5 h-2.5 fill-current" /> Cover
                  </div>
                )}

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end gap-1">
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 bg-white/90 hover:bg-white text-zinc-800 rounded text-[10px]"
                      title="View full image"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px]"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {!img.isMain && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="w-full py-1 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:brightness-105 text-white rounded text-[10px] font-bold shadow flex items-center justify-center gap-1"
                    >
                      <Star className="w-3 h-3 fill-current" /> Set as Cover
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Quick Add Card */}
            {images.length < maxImages && (
              <button
                type="button"
                onClick={() => !isUploading && fileInputRef.current?.click()}
                disabled={isUploading}
                className="aspect-square rounded-xl border-2 border-dashed border-[#EAE1D1] hover:border-[#B8860B] bg-[#FAF8F5] hover:bg-[#F7F2E9] flex flex-col items-center justify-center p-3 text-center transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-[#EAE1D1] flex items-center justify-center text-[#B8860B] group-hover:scale-110 transition-transform mb-1.5 shadow-sm">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-[#18140B]">Add Photo</span>
                <span className="text-[9px] text-[#8C7E72]">Click or Drop</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
