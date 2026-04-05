import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { getStreaksByUser } from '../lib/localStore';

export function useStudyStreak() {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const calculateStreak = useCallback(async () => {
    if (!user) return;

    try {
      const data = getStreaksByUser(user.id)
        .map((streak) => ({ study_date: streak.study_date }))
        .sort((a, b) => b.study_date.localeCompare(a.study_date));

      if (!data || data.length === 0) {
        setCurrentStreak(0);
        setLoading(false);
        return;
      }

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < data.length; i++) {
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        expectedDate.setHours(0, 0, 0, 0);

        const studyDate = new Date(data[i].study_date);
        studyDate.setHours(0, 0, 0, 0);

        if (studyDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }

      setCurrentStreak(streak);
    } catch (error) {
      console.error('Error calculating streak:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      void calculateStreak();
      return;
    }

    setCurrentStreak(0);
    setLoading(false);
  }, [user, calculateStreak]);

  return { currentStreak, loading, refreshStreak: calculateStreak };
}
