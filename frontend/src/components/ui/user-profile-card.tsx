import React from 'react';
import { Mail, Phone, Edit, Trash2 } from 'lucide-react';
import BackgroundDecorator from './background-decorator';

type Props = {
  name?: string;
  role?: string;
  rating?: number | string;
  email?: string;
  phone?: string;
  skills?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
};

const UserProfileCard: React.FC<Props> = ({
  name = 'chamodya',
  role = 'Owner',
  rating = 5,
  email = 'chamodya@example.com',
  phone = '+1 555 123 4567',
  skills = ['fsdfsdf', 'bvb adbc'],
  onEdit,
  onDelete,
}) => {
  return (
    <BackgroundDecorator variant="purple" className="min-h-[360px] flex items-center justify-center p-6">
      <div className="relative w-full max-w-sm">
        <div className="relative rounded-lg overflow-hidden">
          {/* Frosted glass panel */}
          <div className="relative z-10 bg-white/10 backdrop-blur-[20px] border border-white/20 rounded-lg shadow-lg p-6 font-sans">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-white text-xl font-bold mr-4">
                  {/* Avatar initials */}
                  {name.split(' ').map(n => n[0]).slice(0,2).join('')}
                </div>
                <div>
                  <div className="flex items-baseline space-x-2">
                    <h3 className="text-white text-lg font-semibold">{name}</h3>
                    <span className="text-white/60 text-sm">{rating}</span>
                  </div>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-medium ring-1 ring-emerald-200/20">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm mr-2 block" />
                      available
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onEdit}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-blue-700 transition"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>

                <button
                  onClick={onDelete}
                  aria-label="Delete"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/10 text-red-500 hover:bg-red-500/20 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center text-sm text-white/90 space-x-3">
                <Mail className="h-4 w-4 text-white/80" />
                <span className="text-sm text-white/80">{email}</span>
              </div>
              <div className="flex items-center text-sm text-white/90 space-x-3">
                <Phone className="h-4 w-4 text-white/80" />
                <span className="text-sm text-white/80">{phone}</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-white/90 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-white/6 text-white/85 text-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-white/12 text-white rounded-md text-sm font-medium hover:bg-white/20 transition mr-2"
              >
                Edit Profile
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-2 bg-white/6 text-red-400 rounded-md text-sm hover:bg-white/12 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* subtle decorative glow */}
          <div className="absolute inset-0 rounded-lg ring-1 ring-white/5 pointer-events-none" />
        </div>
      </div>
    </BackgroundDecorator>
  );
};

export default UserProfileCard;
