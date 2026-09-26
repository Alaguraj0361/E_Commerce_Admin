'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  Tag,
  IndianRupee,
  Package,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Product, Category, ProductVariant, ProductImage } from '../../types';
import { toast } from 'sonner';
import { MultiImageUpload } from '@/components/ui/ImageUpload';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const initialFormState = {
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    category: '',
    price: 0,
    compareAtPrice: 0,
    costPrice: 0,
    sku: '',
    stock: 10,
    lowStockThreshold: 3,
    images: [] as ProductImage[],
    variants: [] as ProductVariant[],
    tags: [] as string[],
    featured: false,
    bestSeller: false,
    newArrival: false,
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Variant Builder Temporary State
  const [variantSize, setVariantSize] = useState('M');
  const [variantColor, setVariantColor] = useState('Noir Black');
  const [variantColorHex, setVariantColorHex] = useState('#18181b');
  const [variantSku, setVariantSku] = useState('');
  const [variantPrice, setVariantPrice] = useState(0);
  const [variantStock, setVariantStock] = useState(10);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?all=true');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/products?limit=100&isActive=all');
      if (res.data?.success) {
        setProducts(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      ...initialFormState,
      category: categories[0]?._id || '',
      images: [],
    });
    setTagsInput('luxury, modern, bestseller');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    const catId = typeof product.category === 'object' ? product.category._id : product.category;
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription || '',
      category: catId || '',
      price: product.price,
      compareAtPrice: product.compareAtPrice || 0,
      costPrice: product.costPrice || 0,
      sku: product.sku,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold || 3,
      images: product.images || [],
      variants: product.variants || [],
      tags: product.tags || [],
      featured: product.featured || false,
      bestSeller: product.bestSeller || false,
      newArrival: product.newArrival || false,
      isActive: product.isActive,
    });
    setTagsInput((product.tags || []).join(', '));
    setIsModalOpen(true);
  };

  // Image helpers
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const isFirst = formData.images.length === 0;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { url: newImageUrl.trim(), alt: prev.name, isMain: isFirst }],
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.isMain)) {
        updated[0].isMain = true;
      }
      return { ...prev, images: updated };
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isMain: i === index,
      })),
    }));
  };

  // Variant Helpers
  const handleAddVariant = () => {
    const sku = variantSku.trim() || `${formData.sku || 'SKU'}-${variantSize}-${variantColor.slice(0, 3).toUpperCase()}`;
    const newVariant: ProductVariant = {
      sku,
      price: variantPrice > 0 ? variantPrice : formData.price,
      stock: variantStock,
      attributes: {
        size: variantSize,
        color: variantColor,
        colorHex: variantColorHex,
      },
    };

    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));

    setVariantSku('');
    toast.success(`Variant ${variantSize} / ${variantColor} added`);
  };

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.category) {
      toast.error('Please assign a category');
      return;
    }
    if (formData.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        tags: parsedTags,
        sku: formData.sku || `EFF-${Date.now().toString().slice(-6)}`,
      };

      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}`, payload);
        if (res.data?.success) {
          toast.success('Product updated successfully');
          setIsModalOpen(false);
          fetchProducts();
        }
      } else {
        const res = await api.post('/products', payload);
        if (res.data?.success) {
          toast.success('Product created successfully');
          setIsModalOpen(false);
          fetchProducts();
        }
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error saving product';
      toast.error(msg);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data?.success) {
        toast.success('Product deleted successfully');
        setProducts((prev) => prev.filter((p) => p._id !== id));
        setDeleteConfirmId(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase());

      const catId = typeof p.category === 'object' ? p.category._id : p.category;
      const matchesCat = selectedCategory === 'all' || catId === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#18140B] flex items-center gap-3">
            Products Catalog
            <span className="text-xs font-mono font-normal bg-[#F5EFEB] text-[#18140B] border border-[#EAE1D1] text-[#3D342B] px-2 py-0.5 rounded-full">
              {products.length} Items
            </span>
          </h1>
          <p className="text-xs text-[#6B6055] mt-1">
            Create, edit, manage product inventory, visual galleries, and multi-SKU variants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-xl border border-[#EAE1D1] hover:border-[#EAE1D1] bg-white text-[#6B6055] hover:text-[#18140B] transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:brightness-105 text-[#18140B] shadow-sm font-bold text-xs tracking-wide transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EAE1D1] p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#8C7E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, SKU, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#EAE1D1] text-[#2D2319] text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#B8860B]/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#FAF8F5] border border-[#EAE1D1] text-[#3D342B] text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#B8860B]/50 transition-colors"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#EAE1D1] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#3D342B]">
            <thead className="bg-[#FAF7F2] text-[#6B6055] font-semibold border-b border-[#EAE1D1] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Pricing</th>
                <th className="py-3.5 px-4">Inventory</th>
                <th className="py-3.5 px-4">Variants</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE1D1]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C7E72]">
                    {isLoading ? 'Loading catalog products...' : 'No products found matching criteria.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const mainImg =
                    product.images?.find((img) => img.isMain)?.url ||
                    product.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                  const catName =
                    typeof product.category === 'object' ? product.category?.name : 'Unassigned';

                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-[#FAF7F2]/60 transition-colors group"
                    >
                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#EAE1D1] relative overflow-hidden flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={mainImg}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-[#18140B] text-xs hover:text-[#B8860B] transition-colors line-clamp-1">
                              {product.name}
                            </p>
                            <span className="text-[10px] font-mono text-[#8C7E72]">
                              SKU: {product.sku}
                            </span>
                            <div className="flex gap-1.5 mt-0.5">
                              {product.featured && (
                                <span className="text-[9px] bg-amber-950/80 text-[#B8860B] border border-amber-800/50 px-1 rounded">
                                  Featured
                                </span>
                              )}
                              {product.bestSeller && (
                                <span className="text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 px-1 rounded">
                                  Best Seller
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="bg-[#F5EFEB] border border-[#EAE1D1] text-[#3D342B] px-2.5 py-1 rounded-lg text-[11px] font-medium border border-[#EAE1D1]">
                          {catName}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-4 font-mono font-semibold">
                        <div className="text-[#18140B] text-xs">{formatCurrency(product.price)}</div>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <div className="text-[10px] text-[#8C7E72] line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </div>
                        )}
                      </td>

                      {/* Inventory */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              product.stock === 0
                                ? 'bg-rose-500'
                                : product.stock <= 5
                                ? 'bg-amber-400 animate-pulse'
                                : 'bg-emerald-400'
                            }`}
                          />
                          <span
                            className={`font-mono text-xs font-semibold ${
                              product.stock === 0
                                ? 'text-rose-400'
                                : product.stock <= 5
                                ? 'text-[#B8860B]'
                                : 'text-[#2D2319]'
                            }`}
                          >
                            {product.stock} units
                          </span>
                        </div>
                      </td>

                      {/* Variants Count */}
                      <td className="py-3 px-4">
                        {product.variants && product.variants.length > 0 ? (
                          <span className="flex items-center gap-1.5 text-[#6B6055] text-[11px]">
                            <Layers className="w-3.5 h-3.5 text-[#B8860B]" />
                            {product.variants.length} SKUs
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-[11px]">Single SKU</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            product.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-[#F5EFEB] text-[#18140B] border border-[#EAE1D1] text-[#8C7E72] border border-[#EAE1D1]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.isActive ? 'bg-emerald-400' : 'bg-zinc-500'
                            }`}
                          />
                          {product.isActive ? 'Active' : 'Draft'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`${process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000'}/product/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-[#6B6055] hover:text-[#18140B] hover:bg-[#F5EFEB] transition-colors"
                            title="Preview on Store"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-1.5 rounded-lg text-[#6B6055] hover:text-[#B8860B] hover:bg-[#F5EFEB] transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(product._id)}
                            className="p-1.5 rounded-lg text-[#6B6055] hover:text-rose-400 hover:bg-rose-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE1D1] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-[#18140B] text-sm">Delete Product?</h3>
            </div>
            <p className="text-xs text-[#6B6055] leading-relaxed">
              Are you sure you want to permanently remove this product and all associated variants from
              the database? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#6B6055] hover:text-[#18140B] hover:bg-[#F5EFEB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-[#18140B] transition-all shadow-md"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EAE1D1] rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EAE1D1] pb-4">
              <div>
                <h2 className="text-lg font-black text-[#18140B]">
                  {editingProduct ? 'Edit Product Specifications' : 'Create New Product'}
                </h2>
                <p className="text-xs text-[#6B6055]">
                  Fill in product details, variants, inventory, and visual assets.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg text-[#6B6055] hover:text-[#18140B] hover:bg-[#F5EFEB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Core Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#B8860B] uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" /> 1. Core Identification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Master Chronograph Automatic Watch"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3.5 py-2.5 text-xs text-[#18140B] focus:outline-none focus:border-[#B8860B]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3.5 py-2.5 text-xs text-[#18140B] focus:outline-none focus:border-[#B8860B]/50"
                    >
                      <option value="">Select Category...</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                      Base SKU
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. EF-WATCH-001"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#18140B] focus:outline-none focus:border-[#B8860B]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                      Short Tagline / Overview
                    </label>
                    <input
                      type="text"
                      placeholder="Brief one-liner summary"
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3.5 py-2.5 text-xs text-[#18140B] focus:outline-none focus:border-[#B8860B]/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                    Full Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Full product editorial story, materials, craft, care instructions..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl p-3 text-xs text-[#18140B] focus:outline-none focus:border-[#B8860B]/50 leading-relaxed"
                  />
                </div>
              </div>

              {/* Section 2: Pricing & Stock */}
              <div className="space-y-4 pt-4 border-t border-[#EAE1D1]">
                <h3 className="text-xs font-bold text-[#B8860B] uppercase tracking-wider flex items-center gap-2">
                  <IndianRupee className="w-3.5 h-3.5" /> 2. Pricing & Base Inventory
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#18140B] focus:outline-none focus:border-[#B8860B]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                      Compare at Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.compareAtPrice}
                      onChange={(e) => setFormData({ ...formData, compareAtPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#18140B] focus:outline-none focus:border-[#B8860B]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                      Base Stock (Units) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#18140B] focus:outline-none focus:border-[#B8860B]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                      Low Stock Alert
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value, 10) || 3 })}
                      className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#18140B] focus:outline-none focus:border-[#B8860B]/50"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Gallery Management */}
              <div className="pt-4 border-t border-[#EAE1D1]">
                <MultiImageUpload
                  images={formData.images}
                  onChange={(images) => setFormData((prev) => ({ ...prev, images }))}
                  productName={formData.name || 'Product'}
                  label="3. Visual Gallery & Product Media"
                  maxImages={12}
                />
              </div>

              {/* Section 4: Variant Builder */}
              <div className="space-y-4 pt-4 border-t border-[#EAE1D1]">
                <h3 className="text-xs font-bold text-[#B8860B] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" /> 4. Multi-SKU Variant Builder
                </h3>

                {/* Inline adder */}
                <div className="p-4 bg-[#FAF7F2] border border-[#EAE1D1] rounded-xl space-y-3">
                  <p className="text-[11px] text-[#6B6055] font-medium">Add Size, Color & Stock Variant:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                    <div>
                      <label className="text-[10px] text-[#8C7E72] block mb-1">Size</label>
                      <input
                        type="text"
                        placeholder="S, M, L, 42mm..."
                        value={variantSize}
                        onChange={(e) => setVariantSize(e.target.value)}
                        className="w-full bg-white border border-[#EAE1D1] text-xs text-[#18140B] rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8C7E72] block mb-1">Color Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Noir"
                        value={variantColor}
                        onChange={(e) => setVariantColor(e.target.value)}
                        className="w-full bg-white border border-[#EAE1D1] text-xs text-[#18140B] rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8C7E72] block mb-1">Color Swatch</label>
                      <input
                        type="color"
                        value={variantColorHex}
                        onChange={(e) => setVariantColorHex(e.target.value)}
                        className="w-full h-8 bg-white border border-[#EAE1D1] rounded-lg cursor-pointer p-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8C7E72] block mb-1">Variant Price (₹)</label>
                      <input
                        type="number"
                        placeholder="0 = default"
                        value={variantPrice || ''}
                        onChange={(e) => setVariantPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-[#EAE1D1] text-xs font-mono text-[#18140B] rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8C7E72] block mb-1">Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={variantStock}
                        onChange={(e) => setVariantStock(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-[#EAE1D1] text-xs font-mono text-[#18140B] rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="w-full bg-[#F5EFEB] text-[#18140B] border border-[#EAE1D1] hover:bg-zinc-700 text-[#B8860B] font-bold text-xs py-2 rounded-lg transition-colors"
                      >
                        + Add Variant
                      </button>
                    </div>
                  </div>
                </div>

                {/* Existing variants chips */}
                {formData.variants.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-[#6B6055]">Active Variants ({formData.variants.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.variants.map((v, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-[#FAF8F5] border border-[#EAE1D1] px-3 py-1.5 rounded-xl text-xs"
                        >
                          <div
                            className="w-3 h-3 rounded-full border border-[#EAE1D1]"
                            style={{ backgroundColor: v.attributes?.colorHex || '#555' }}
                          />
                          <span className="text-[#18140B] font-semibold">{v.attributes?.size}</span>
                          <span className="text-[#8C7E72]">/</span>
                          <span className="text-[#3D342B]">{v.attributes?.color}</span>
                          <span className="font-mono text-[#B8860B] text-[11px]">
                            {formatCurrency(v.price || formData.price)}
                          </span>
                          <span className="text-[10px] text-[#8C7E72]">({v.stock} pcs)</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(i)}
                            className="text-[#8C7E72] hover:text-rose-400 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 5: Flags & Tags */}
              <div className="space-y-4 pt-4 border-t border-[#EAE1D1]">
                <h3 className="text-xs font-bold text-[#B8860B] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> 5. Discovery Badges & Tags
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <label className="flex items-center gap-2.5 bg-[#FAF8F5] border border-[#EAE1D1] p-3 rounded-xl cursor-pointer hover:border-[#EAE1D1]">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded accent-[#B8860B] w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-[#18140B]">Live in Catalog</span>
                  </label>

                  <label className="flex items-center gap-2.5 bg-[#FAF8F5] border border-[#EAE1D1] p-3 rounded-xl cursor-pointer hover:border-[#EAE1D1]">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded accent-[#B8860B] w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-[#18140B]">Featured Home</span>
                  </label>

                  <label className="flex items-center gap-2.5 bg-[#FAF8F5] border border-[#EAE1D1] p-3 rounded-xl cursor-pointer hover:border-[#EAE1D1]">
                    <input
                      type="checkbox"
                      checked={formData.bestSeller}
                      onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })}
                      className="rounded accent-[#B8860B] w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-[#18140B]">Best Seller</span>
                  </label>

                  <label className="flex items-center gap-2.5 bg-[#FAF8F5] border border-[#EAE1D1] p-3 rounded-xl cursor-pointer hover:border-[#EAE1D1]">
                    <input
                      type="checkbox"
                      checked={formData.newArrival}
                      onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })}
                      className="rounded accent-[#B8860B] w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-[#18140B]">New Arrival</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                    Search Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="leather, mechanical, gold, luxury, minimalist"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3.5 py-2.5 text-xs text-[#18140B] focus:outline-none focus:border-[#B8860B]/50"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#EAE1D1]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#6B6055] hover:text-[#18140B] hover:bg-[#F5EFEB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:brightness-105 text-[#18140B] shadow-sm font-bold text-xs transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to Database...' : editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
