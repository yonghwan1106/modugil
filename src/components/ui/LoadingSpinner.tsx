interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-4',
};

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div
      className={`${sizeMap[size]} rounded-full animate-spin ${className}`}
      style={{ borderColor: '#0f172a', borderTopColor: '#d4a853' }}
      role="status"
      aria-label="로딩 중"
    />
  );
}
