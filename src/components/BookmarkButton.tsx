import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  itemType: 'lesson' | 'example' | 'question' | 'ai_explanation';
  itemId: string;
  title: string;
  snippet?: string;
  language?: string;
  topicId?: string;
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  itemType,
  itemId,
  title,
  snippet,
  language = 'python',
  topicId,
  className = ''
}) => {
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    api.checkBookmarkStatus(itemType, itemId)
      .then(res => {
        if (isMounted && res) {
          setIsBookmarked(!!res.is_bookmarked);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [itemType, itemId]);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    try {
      if (isBookmarked) {
        // Find existing bookmark and delete
        const data = await api.getBookmarks(itemType);
        const existing = (data.bookmarks || []).find((b: any) => b.item_id === itemId);
        if (existing) {
          await api.deleteBookmark(existing.id);
        }
        setIsBookmarked(false);
      } else {
        await api.addBookmark({
          item_type: itemType,
          item_id: itemId,
          title,
          snippet,
          language,
          topic_id: topicId
        });
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleBookmark}
      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this item'}
      className={`p-1.5 rounded-lg transition-all ${
        isBookmarked
          ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
      } ${className}`}
      aria-label={isBookmarked ? 'Remove Bookmark' : 'Bookmark this item'}
    >
      <Bookmark
        className={`w-4 h-4 transition-transform active:scale-90 ${
          isBookmarked ? 'fill-cyan-400 text-cyan-400' : ''
        }`}
      />
    </button>
  );
};
