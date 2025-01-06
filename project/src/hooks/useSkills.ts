import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Skill = Database['public']['Tables']['skills']['Row'];
type UserSkill = Database['public']['Tables']['user_skills']['Row'];

export function useSkills(userId: string | null) {
  const [teachingSkills, setTeachingSkills] = useState<Skill[]>([]);
  const [learningSkills, setLearningSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadSkills = async () => {
      // Load teaching skills
      const { data: teaching } = await supabase
        .from('user_skills')
        .select(`
          skill_id,
          skills (*)
        `)
        .eq('user_id', userId)
        .eq('is_teaching', true);

      // Load learning skills
      const { data: learning } = await supabase
        .from('user_skills')
        .select(`
          skill_id,
          skills (*)
        `)
        .eq('user_id', userId)
        .eq('is_teaching', false);

      setTeachingSkills(teaching?.map(t => t.skills) ?? []);
      setLearningSkills(learning?.map(l => l.skills) ?? []);
      setLoading(false);
    };

    loadSkills();
  }, [userId]);

  const addSkill = async (
    skillName: string,
    isTeaching: boolean,
    proficiencyLevel: string
  ) => {
    // First, check if skill exists
    let { data: skill } = await supabase
      .from('skills')
      .select()
      .eq('name', skillName)
      .single();

    // If not, create it
    if (!skill) {
      const { data: newSkill } = await supabase
        .from('skills')
        .insert({ name: skillName })
        .select()
        .single();
      skill = newSkill;
    }

    if (!skill || !userId) return;

    // Add user skill
    await supabase.from('user_skills').insert({
      user_id: userId,
      skill_id: skill.id,
      is_teaching: isTeaching,
      proficiency_level: proficiencyLevel,
    });

    // Refresh skills
    if (isTeaching) {
      setTeachingSkills([...teachingSkills, skill]);
    } else {
      setLearningSkills([...learningSkills, skill]);
    }
  };

  return {
    teachingSkills,
    learningSkills,
    loading,
    addSkill,
  };
}