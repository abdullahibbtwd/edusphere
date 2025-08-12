'use client';
import { useState } from 'react';
import { FiMenu, FiX, FiHome, FiInfo, FiGrid, FiTag, FiMail } from 'react-icons/fi';
import ThemeButton from './ThemeButton';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter()
    const navLinks = [
        { name: 'Home', icon: <FiHome />, href: '/' },
        { name: 'About', icon: <FiInfo />, href: '/about' },
        { name: 'Features', icon: <FiGrid />, href: '/features' },
        { name: 'Pricing', icon: <FiTag />, href: '/pricing' },
        { name: 'Contact', icon: <FiMail />, href: '/contact' },
    ];

    return (
        <nav className="bg-surface text-text font-poppins shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <span
                            onClick={() => router.push("/")}
                            className="text-primary cursor-pointer font-poppins tracking-widest text-2xl font-bold">EduSphere</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                className="flex items-center space-x-1 hover:text-primary transition-all hover:scale-105 ease-in-out duration-500 hover:text-primary font-roboto-mono"
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </a>
                        ))}
                        <ThemeButton />
                    </div>

                    <div className='hidden md:flex gap-4'>
                        <button className='px-4 py-2 rounded-md bg-primary text-white cursor-pointer hover:scale-105 duration-500 ease-in-out transition-all'>
                            Get Started
                        </button>

                    </div>
                    {/* Mobile menu button */}
                    <div className="md:hidden gap-4 flex items-center">
                        <button className='px-3 py-1.5  text-sm rounded-md bg-primary text-white cursor-pointer hover:scale-105 duration-500 ease-in-out transition-all'>
                            Get Started
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-primary focus:outline-none"
                        >
                            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-surface shadow-lg">
                    <div className="px-4 py-3 space-y-3">
                        {navLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                className="flex items-center space-x-2 hover:text-primary transition-colors font-roboto-mono"
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </a>
                        ))}
                        <ThemeButton />
                    </div>
                </div>
            )}
        </nav>
    );
}
