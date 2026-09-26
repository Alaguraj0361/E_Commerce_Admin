'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  MessageSquareQuote,
  Star,
  Search,
  Trash2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  ThumbsUp,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Review } from '../../types';
import { toast } from 'sonner';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/reviews/admin/all?limit=100');
      if (res.data?.success) {
        setReviews(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load product reviews');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await api.delete(`/reviews/admin/${id}`);
      if (res.data?.success) {
        toast.success('Review removed and product rating recalculated');
        setReviews((prev) => prev.filter((r) => r._id !== id));
        setDeleteConfirmId(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to moderate review');
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const prodName = r.product?.name || '';
      const userName = `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim();
      const comment = r.comment || '';
      const title = r.title || '';
      const q = searchQuery.toLowerCase();

      const matchesSearch =
        prodName.toLowerCase().includes(q) ||
        userName.toLowerCase().includes(q) ||
        comment.toLowerCase().includes(q) ||
        title.toLowerCase().includes(q);

      const matchesRating = ratingFilter === 'all' || r.rating === ratingFilter;

      return matchesSearch && matchesRating;
    });
  }, [reviews, searchQuery, ratingFilter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#18140B] flex items-center gap-3">
            Review Moderation
            <span className="text-xs font-mono font-normal bg-[#F5EFEB] text-[#18140B] border border-[#EAE1D1] text-[#3D342B] px-2 py-0.5 rounded-full">
              {reviews.length} Submissions
            </span>
          </h1>
          <p className="text-xs text-[#6B6055] mt-1">
            Monitor client feedback, combat spam or offensive content, and audit verified buyer ratings.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          className="p-2.5 rounded-xl border border-[#EAE1D1] hover:border-[#EAE1D1] bg-white text-[#6B6055] hover:text-[#18140B] transition-colors self-start sm:self-auto"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Rating Tabs */}
      <div className="bg-white border border-[#EAE1D1] p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#8C7E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reviews by comment, product, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#EAE1D1] text-[#2D2319] text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#B8860B]/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setRatingFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              ratingFilter === 'all'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#18140B] font-bold'
                : 'bg-[#FAF8F5] text-[#6B6055] hover:text-[#18140B] border border-[#EAE1D1]'
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              onClick={() => setRatingFilter(stars)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors ${
                ratingFilter === stars
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#18140B] font-bold'
                  : 'bg-[#FAF8F5] text-[#6B6055] hover:text-[#18140B] border border-[#EAE1D1]'
              }`}
            >
              <span>{stars}</span>
              <Star className="w-3 h-3 fill-current" />
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white border border-[#EAE1D1] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#3D342B]">
            <thead className="bg-[#FAF7F2] text-[#6B6055] font-semibold border-b border-[#EAE1D1] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Reviewer</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Title & Feedback</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE1D1]">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8C7E72]">
                    {isLoading ? 'Loading review submissions...' : 'No matching reviews found.'}
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => {
                  const prodImg =
                    rev.product?.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';

                  return (
                    <tr
                      key={rev._id}
                      className="hover:bg-[#FAF7F2]/60 transition-colors group"
                    >
                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#EAE1D1] relative overflow-hidden flex-shrink-0">
                            <Image
                              src={prodImg}
                              alt={rev.product?.name || 'Product'}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-[#18140B] text-xs line-clamp-1">
                              {rev.product?.name || 'Unknown Product'}
                            </p>
                            {rev.product?.slug && (
                              <a
                                href={`${process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000'}/product/${rev.product.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-[#6B6055] hover:text-[#B8860B] transition-colors"
                              >
                                View page <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Reviewer */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#18140B]">
                          {rev.user?.firstName} {rev.user?.lastName}
                        </p>
                        <p className="text-[10px] text-[#6B6055]">{rev.user?.email}</p>
                        {rev.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 font-semibold mt-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified Buyer
                          </span>
                        )}
                      </td>

                      {/* Star Rating */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating
                                  ? 'text-[#B8860B] fill-amber-400'
                                  : 'text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-[#6B6055] mt-0.5 block">
                          {rev.rating}.0 / 5.0
                        </span>
                      </td>

                      {/* Content */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-bold text-[#18140B] text-xs">{rev.title}</p>
                        <p className="text-[#6B6055] text-xs mt-0.5 line-clamp-2 leading-relaxed">
                          "{rev.comment}"
                        </p>
                        {rev.helpfulVotes > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#8C7E72] font-mono mt-1">
                            <ThumbsUp className="w-2.5 h-2.5" /> {rev.helpfulVotes} helpful votes
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#6B6055] text-xs whitespace-nowrap">
                        {formatDate(rev.createdAt)}
                      </td>

                      {/* Moderation */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setDeleteConfirmId(rev._id)}
                          className="p-1.5 rounded-lg text-[#6B6055] hover:text-rose-400 hover:bg-rose-50 transition-colors"
                          title="Remove Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
              <h3 className="font-bold text-[#18140B] text-sm">Moderate & Delete Review?</h3>
            </div>
            <p className="text-xs text-[#6B6055] leading-relaxed">
              Are you sure you want to purge this review? The product's overall star rating and total
              review count will be automatically recalculated in the database.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#6B6055] hover:text-[#18140B] hover:bg-[#F5EFEB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-[#18140B] transition-all shadow-md"
              >
                Purge Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
