import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Match = Database['public']['Tables']['matches']['Row'];

export function useMatches(userId: string | null) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadMatches = async () => {
      const { data } = await supabase
        .from('matches')
        .select(`
          *,
          teacher:teacher_id(email, full_name),
          student:student_id(email, full_name),
          teaching_skill:teaching_skill_id(*),
          learning_skill:learning_skill_id(*)
        `)
        .or(`teacher_id.eq.${userId},student_id.eq.${userId}`);

      setMatches(data ?? []);
      setLoading(false);
    };

    loadMatches();

    // Subscribe to changes
    const subscription = supabase
      .channel('matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `teacher_id=eq.${userId}`,
        },
        loadMatches
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `student_id=eq.${userId}`,
        },
        loadMatches
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const findMatches = async () => {
    if (!userId) return;

    // Get user's teaching and learning skills
    const { data: userSkills } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId);

    if (!userSkills) return;

    const teachingSkills = userSkills
      .filter(s => s.is_teaching)
      .map(s => s.skill_id);
    const learningSkills = userSkills
      .filter(s => !s.is_teaching)
      .map(s => s.skill_id);

    // Find potential matches
    const { data: potentialMatches } = await supabase
      .from('user_skills')
      .select(`
        user_id,
        skill_id,
        is_teaching,
        users!user_skills_user_id_fkey(*)
      `)
      .in('skill_id', [...teachingSkills, ...learningSkills])
      .neq('user_id', userId);

    if (!potentialMatches) return;

    // Create matches
    const matchPromises = potentialMatches.map(async match => {
      if (match.is_teaching) {
        // They're teaching something we want to learn
        if (learningSkills.includes(match.skill_id)) {
          // Find what we can teach them
          const ourTeachingSkill = teachingSkills[0]; // Simplified for demo
          await supabase.from('matches').insert({
            teacher_id: match.user_id,
            student_id: userId,
            teaching_skill_id: match.skill_id,
            learning_skill_id: ourTeachingSkill,
          });
        }
      } else {
        // They want to learn something we can teach
        if (teachingSkills.includes(match.skill_id)) {
          // Find what they can teach us
          const theirTeachingSkill = learningSkills[0]; // Simplified for demo
          await supabase.from('matches').insert({
            teacher_id: userId,
            student_id: match.user_id,
            teaching_skill_id: match.skill_id,
            learning_skill_id: theirTeachingSkill,
          });
        }
      }
    });

    await Promise.all(matchPromises);
  };

  const updateMatchStatus = async (matchId: string, status: string) => {
    await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId);
  };

  return {
    matches,
    loading,
    findMatches,
    updateMatchStatus,
  };
}