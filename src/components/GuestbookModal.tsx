import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  BookOpen,
  Send,
  Heart,
  Sparkles,
  Pin,
  Trash2,
  Smile,
  RefreshCw,
  MessageCircleHeart,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SupabaseGuestbookEntry, supabase } from '../lib/supabase';
import {
  fetchGuestbookEntries,
  addGuestbookEntry,
  deleteGuestbookEntry,
  likeGuestbookEntry
} from '../services/supabaseService';
import { AppLanguage } from '../config/birthdayConfig';

interface GuestbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  isAdminMode?: boolean;
}

const AVATAR_OPTIONS = [
  { id: 'rose', icon: '🌹', label: 'Rose' },
  { id: 'cherry', icon: '🌸', label: 'Cherry' },
  { id: 'hibiscus', icon: '🌺', label: 'Flower' },
  { id: 'bouquet', icon: '💐', label: 'Bouquet' },
  { id: 'heart', icon: '💖', label: 'Heart' },
  { id: 'sparkles', icon: '✨', label: 'Sparkles' },
];

const RELATIONSHIP_TAGS = [
  { id: 'Friend', labelBurmese: 'သူငယ်ချင်း 🌸', labelEnglish: 'Friend 🌸' },
  { id: 'Family', labelBurmese: 'မိသားစု 💖', labelEnglish: 'Family 💖' },
  { id: 'Well-wisher', labelBurmese: 'ဆုမွန်ကောင်းတောင်းသူ ✨', labelEnglish: 'Well-wisher ✨' },
  { id: 'Colleague', labelBurmese: 'လုပ်ဖော်ကိုင်ဖက် 🌼', labelEnglish: 'Colleague 🌼' },
];

export const GuestbookModal: React.FC<GuestbookModalProps> = ({
  isOpen,
  onClose,
  lang,
  isAdminMode = false,
}) => {
  const [entries, setEntries] = useState<SupabaseGuestbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string>('all');

  // Form State
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [relationshipTag, setRelationshipTag] = useState('Friend');
  const [selectedAvatar, setSelectedAvatar] = useState('rose');
  const [formError, setFormError] = useState<string | null>(null);

  // Track liked items in local state for instant feedback
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const listEndRef = useRef<HTMLDivElement>(null);

  // Load entries on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadEntries = async () => {
      setIsLoading(true);
      const data = await fetchGuestbookEntries();
      if (isMounted) {
        setEntries(data);
        setIsLoading(false);
      }
    };

    loadEntries();

    // Supabase Real-time updates subscription
    const channel = supabase
      .channel('realtime_guestbook')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guestbook_entries' },
        async () => {
          const fresh = await fetchGuestbookEntries();
          if (isMounted) setEntries(fresh);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) {
      setFormError(lang === 'my' ? 'ကျေးဇူးပြု၍ သင့်အမည်ကို ထည့်ပေးပါ' : 'Please enter your name');
      return;
    }
    if (!message.trim()) {
      setFormError(lang === 'my' ? 'ကျေးဇူးပြု၍ ဆုတောင်းမေတ္တာ စာသားလေး ရေးပေးပါ' : 'Please write your birthday wish');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    const result = await addGuestbookEntry({
      sender_name: senderName.trim(),
      message: message.trim(),
      relationship_tag: relationshipTag,
      avatar_color: selectedAvatar,
      is_pinned: false,
      likes_count: 1,
    });

    setIsSubmitting(false);

    if (result.success && result.entry) {
      setEntries((prev) => [result.entry!, ...prev]);
      setSenderName('');
      setMessage('');
      setShowForm(false);
      setSuccessToast(
        lang === 'my'
          ? 'မနှင်းလေးအတွက် မွေးနေ့ဆုတောင်း ပေးပို့ပြီးပါပြီ! ကျေးဇူးတင်ပါတယ် 🌸'
          : 'Your birthday wish for Hnin Lae Yee has been shared! Thank you! 🌸'
      );

      // Confetti burst
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f472b6', '#fb7185', '#fbbf24', '#ffffff'],
        });
      } catch {
        // safe
      }

      setTimeout(() => setSuccessToast(null), 4000);
    } else {
      setFormError(result.error || 'Failed to submit wish. Please try again.');
    }
  };

  const handleLike = async (id: string, currentLikes: number = 0) => {
    if (likedMap[id]) return; // already liked in this session
    setLikedMap((prev) => ({ ...prev, [id]: true }));

    // Optimistic UI update
    setEntries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, likes_count: (item.likes_count || currentLikes || 0) + 1 } : item
      )
    );

    await likeGuestbookEntry(id, currentLikes);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === 'my' ? 'ဤဆုတောင်းစာကို ဖျက်ရန် သေချာပါသလား?' : 'Delete this birthday wish?')) {
      return;
    }
    setEntries((prev) => prev.filter((item) => item.id !== id));
    await deleteGuestbookEntry(id);
  };

  const filteredEntries = filterTag === 'all'
    ? entries
    : entries.filter((e) => e.relationship_tag === filterTag);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Birthday Wishes Guestbook"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none animate-fade-in"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
      />

      {/* Main Guestbook Modal Container */}
      <div className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] glass-panel rounded-3xl border-2 border-rose-300/80 shadow-2xl flex flex-col overflow-hidden z-10 animate-scale-up">
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-rose-200/80 bg-white/95 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-bold text-slate-900 leading-tight flex items-center gap-1.5 ${
                lang === 'my' ? 'font-burmese' : 'font-serif-romantic'
              }`}>
                <span>{lang === 'my' ? 'မနှင်းလေးအတွက် ဆုတောင်းလွှာ' : 'Hnin Lae Yee’s Guestbook'}</span>
                <span className="text-rose-500 text-base">🌸</span>
              </h2>
              <p className={`text-xs text-rose-800 font-semibold ${lang === 'my' ? 'font-burmese' : ''}`}>
                {lang === 'my'
                  ? 'ချစ်ရတဲ့ သူငယ်ချင်းမိတ်ဆွေများ၏ မွေးနေ့ဆုမွန်ကောင်းများ'
                  : 'Public Birthday Wishes & Blessings from Visitors'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-rose-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Close Guestbook"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mx-4 mt-3 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center gap-2 animate-fade-in shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Top Action Bar (Filter & Write Wish Button) */}
        <div className="px-5 pt-3 pb-2 flex items-center justify-between gap-2 shrink-0 bg-rose-50/40 border-b border-rose-100">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setFilterTag('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterTag === 'all'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white/80 text-slate-700 hover:bg-white border border-rose-200/60'
              }`}
            >
              {lang === 'my' ? 'အားလုံး' : 'All'} ({entries.length})
            </button>
            {RELATIONSHIP_TAGS.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setFilterTag(tag.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  filterTag === tag.id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white/80 text-slate-700 hover:bg-white border border-rose-200/60'
                }`}
              >
                {lang === 'my' ? tag.labelBurmese : tag.labelEnglish}
              </button>
            ))}
          </div>

          {/* Toggle Write Form Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm ${
              showForm
                ? 'bg-slate-200 text-slate-800'
                : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white active:scale-95'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showForm ? (lang === 'my' ? 'ပိတ်ရန်' : 'Close') : (lang === 'my' ? 'ဆုတောင်းရေးရန်' : 'Leave a Wish')}</span>
          </button>
        </div>

        {/* Collapsible Write Wish Form */}
        {showForm && (
          <div className="p-4 sm:p-5 bg-white/95 border-b border-rose-200 shadow-inner animate-fade-in shrink-0 overflow-y-auto max-h-[50vh]">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Visitor Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'my' ? 'သင့်အမည် *' : 'Your Name *'}
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder={lang === 'my' ? 'ဥပမာ - မေသူ / Su Su' : 'e.g. Su Su / Alex'}
                    maxLength={50}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 border border-rose-200 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/20 transition-all"
                  />
                </div>

                {/* Relationship Tag */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'my' ? 'ဆက်စပ်မှု' : 'Relationship'}
                  </label>
                  <select
                    value={relationshipTag}
                    onChange={(e) => setRelationshipTag(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 border border-rose-200 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/20 transition-all cursor-pointer"
                  >
                    {RELATIONSHIP_TAGS.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {lang === 'my' ? tag.labelBurmese : tag.labelEnglish}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Avatar Icon Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {lang === 'my' ? 'ပန်းတံဆိပ် ရွေးချယ်ပါ' : 'Choose Floral Stamp'}
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedAvatar(opt.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                        selectedAvatar === opt.id
                          ? 'bg-rose-500 text-white ring-2 ring-rose-300 scale-110 shadow-sm'
                          : 'bg-rose-50 hover:bg-rose-100 text-slate-700'
                      }`}
                      title={opt.label}
                    >
                      {opt.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === 'my' ? 'မွေးနေ့ဆုတောင်း မေတ္တာစာလွှာ *' : 'Birthday Wish Message *'}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {message.length}/280
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    lang === 'my'
                      ? 'မနှင်းလေးအတွက် မွေးနေ့ဆုမွန်ကောင်းလေး ရေးသားပေးပါ...'
                      : 'Write a warm, sweet birthday message for Hnin Lae Yee...'
                  }
                  maxLength={280}
                  rows={3}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 border border-rose-200 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/20 transition-all resize-none"
                />
              </div>

              {formError && (
                <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2 font-medium">
                  {formError}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {lang === 'my' ? 'မလုပ်တော့ပါ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSubmitting
                      ? (lang === 'my' ? 'ပို့နေပါသည်...' : 'Sharing...')
                      : (lang === 'my' ? 'ဆုတောင်းတင်မည်' : 'Post Wish')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Scrollable Guestbook Entries Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-rose-600">
              <RefreshCw className="w-6 h-6 animate-spin text-rose-500" />
              <span className="text-xs font-medium text-slate-500">
                {lang === 'my' ? 'ဆုတောင်းလွှာများ ရယူနေပါသည်...' : 'Loading birthday wishes...'}
              </span>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <MessageCircleHeart className="w-10 h-10 text-rose-300 mx-auto" />
              <p className="text-sm font-medium text-slate-700">
                {lang === 'my' ? 'ဆုတောင်းများ မရှိသေးပါ' : 'No wishes in this category yet'}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="text-xs text-rose-600 font-semibold underline hover:text-rose-800 cursor-pointer"
              >
                {lang === 'my' ? 'ပထမဆုံး ဆုတောင်းသူ ဖြစ်လိုက်ပါ 🌸' : 'Be the first to leave a wish 🌸'}
              </button>
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const avatar = AVATAR_OPTIONS.find((a) => a.id === entry.avatar_color) || AVATAR_OPTIONS[0];
              const isLiked = likedMap[entry.id];

              return (
                <div
                  key={entry.id}
                  className={`p-4 rounded-2xl transition-all duration-300 relative ${
                    entry.is_pinned
                      ? 'bg-gradient-to-r from-amber-50/90 to-rose-50/90 border-2 border-amber-300 shadow-md glow-gold'
                      : 'bg-white/90 border border-rose-200/80 shadow-sm hover:border-rose-300 hover:shadow-md'
                  }`}
                >
                  {/* Pinned Tag */}
                  {entry.is_pinned && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full">
                      <Pin className="w-3 h-3 text-amber-600 fill-amber-600" />
                      <span>{lang === 'my' ? 'အထူးဆုတောင်း' : 'Special Wish'}</span>
                    </div>
                  )}

                  {/* Header: Avatar, Name, Tag & Date */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 border border-rose-200 flex items-center justify-center text-xl shrink-0 shadow-sm">
                      {avatar.icon}
                    </div>

                    <div className="flex-1 pr-16 sm:pr-20">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm sm:text-base text-slate-900 leading-snug">
                          {entry.sender_name}
                        </span>
                        {entry.relationship_tag && (
                          <span className="text-[10px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            {entry.relationship_tag}
                          </span>
                        )}
                      </div>

                      {entry.created_at && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(entry.created_at).toLocaleDateString(lang === 'my' ? 'my-MM' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message Body */}
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-900 leading-loose font-burmese font-normal whitespace-pre-wrap">
                    {entry.message}
                  </p>

                  {/* Bottom Actions: Like reaction & Admin Delete */}
                  <div className="mt-3 pt-2 border-t border-rose-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleLike(entry.id, entry.likes_count || 1)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                        isLiked
                          ? 'bg-rose-100 text-rose-700 font-semibold'
                          : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform ${
                          isLiked ? 'fill-rose-500 text-rose-500 scale-125' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-[11px] font-medium">
                        {entry.likes_count || 1}
                      </span>
                    </button>

                    {isAdminMode && (
                      <button
                        onClick={() => handleDelete(entry.id)}
                        title="Delete wish (Admin)"
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={listEndRef} />
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-white/95 border-t border-rose-200/80 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span className="text-[11px] text-rose-800 font-medium font-serif-romantic">
            {lang === 'my' ? 'မနှင်းလေးရဲ့ မွေးနေ့ အမှတ်တရ 🌸' : 'Dedicated to Hnin Lae Yee with Love 🌸'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
          >
            {lang === 'my' ? 'ပိတ်မည်' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
