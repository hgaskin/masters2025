import Image from 'next/image';

interface CountryFlagProps {
  countryCode: string;
  countryName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CountryFlag({
  countryCode,
  countryName,
  className = '',
  size = 'md',
}: CountryFlagProps) {
  const sizeClasses = {
    sm: 'w-6 h-4',
    md: 'w-8 h-6',
    lg: 'w-10 h-7',
  };

  return (
    <div className={`relative overflow-hidden ${sizeClasses[size]} ${className}`}>
      <Image
        src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
        alt={countryName}
        fill
        className="object-cover"
      />
    </div>
  );
} 