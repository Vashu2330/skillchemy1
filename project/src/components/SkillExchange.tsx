import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useSkills } from '../hooks/useSkills';
import { useMatches } from '../hooks/useMatches';
import { LogOut, Plus, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface Props {
  user: User;
}

export default function SkillExchange({ user }: Props) {
  const { signOut } = useAuth();
  const { teachingSkills, learningSkills, addSkill, loading: skillsLoading } = useSkills(user.id);
  const { matches, findMatches, updateMatchStatus, loading: matchesLoading } = useMatches(user.id);
  const [newSkill, setNewSkill] = useState('');
  const [isTeaching, setIsTeaching] = useState(true);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    try {
      await addSkill(newSkill, isTeaching, 'intermediate');
      toast.success(`Added ${newSkill} to your ${isTeaching ? 'teaching' : 'learning'} skills!`);
      setNewSkill('');
    } catch (error) {
      toast.error('Failed to add skill');
    }
  };

  const handleFindMatches = async () => {
    try {
      await findMatches();
      toast.success('Looking for matches...');
    } catch (error) {
      toast.error('Failed to find matches');
    }
  };

  const handleMatchStatus = async (matchId: string, status: string) => {
    try {
      await updateMatchStatus(matchId, status);
      toast.success(`Match ${status}`);
    } catch (error) {
      toast.error('Failed to update match status');
    }
  };

  if (skillsLoading || matchesLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Skill Exchange</h1>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Add New Skill</h2>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Enter skill name"
                  className="w-full rounded-md border border-gray-300 px-4 py-2"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsTeaching(true)}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    isTeaching
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  I can teach
                </button>
                <button
                  type="button"
                  onClick={() => setIsTeaching(false)}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    !isTeaching
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  I want to learn
                </button>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
              >
                <Plus size={20} />
                Add Skill
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Skills</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Teaching:</h3>
                <ul className="space-y-2">
                  {teachingSkills.map((skill) => (
                    <li
                      key={skill.id}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-md"
                    >
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Learning:</h3>
                <ul className="space-y-2">
                  {learningSkills.map((skill) => (
                    <li
                      key={skill.id}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md"
                    >
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              onClick={handleFindMatches}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
            >
              <Search size={20} />
              Find Matches
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Matches</h2>
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">
                    Match with {match.teacher_id === user.id ? 'Student' : 'Teacher'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Teaching: {match.teaching_skill_id}, Learning:{' '}
                    {match.learning_skill_id}
                  </p>
                </div>
                <div className="flex gap-2">
                  {match.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleMatchStatus(match.id, 'accepted')}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleMatchStatus(match.id, 'rejected')}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {match.status === 'accepted' && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md">
                      Accepted
                    </span>
                  )}
                  {match.status === 'rejected' && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-md">
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}