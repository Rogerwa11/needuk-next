import Image from 'next/image';
import Link from 'next/link';

// adicione uma prop opcional
export const Logo = ({ compact = false }: { compact?: boolean } = {}) => (
    <div className={`flex items-center justify-center ${compact ? 'mb-0' : 'mb-8'}`}>
      <Link href="/" className="transition-all duration-300 hover:scale-105 hover:opacity-80 cursor-pointer">
        <Image
          src="/logo.png"
          alt="Needuk"
          width={compact ? 132 : 160}
          height={compact ? 132 : 160}
          className={`${compact ? 'w-24 h-24' : 'w-40 h-40 md:w-40 md:h-40'} object-contain`}
          priority
        />
      </Link>
    </div>
  );
