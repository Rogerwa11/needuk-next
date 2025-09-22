import Image from 'next/image';
import Link from 'next/link';

export const Logo = () => (
    <div className="flex items-center justify-center mb-8">
        <Link
            href="/"
            className="transition-all duration-300 hover:scale-105 hover:opacity-80 cursor-pointer"
        >
            <Image
                src="/logo.png"
                alt="Needuk"
                width={120}
                height={120}
                className="w-24 h-24 md:w-32 md:h-32 object-contain"
                priority
            />
        </Link>
    </div>
);