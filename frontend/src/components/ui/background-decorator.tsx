import React from 'react';

type Props = {
  children?: React.ReactNode;
  variant?: 'blue' | 'purple' | 'pink';
  className?: string;
};

const gradients = {
  blue: 'from-blue-500 via-indigo-600 to-sky-500',
  purple: 'from-purple-500 via-indigo-600 to-pink-500',
  pink: 'from-pink-500 via-rose-500 to-yellow-400',
};

const BackgroundDecorator: React.FC<Props> = ({ children, variant = 'purple', className = '' }) => {
  const grad = gradients[variant] || gradients.purple;

  return (
    <div className={`relative ${className}`}>
      <div className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${grad} opacity-90 filter blur-2xl`} />
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default BackgroundDecorator;
