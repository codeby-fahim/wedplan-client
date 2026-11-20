import React from "react";
import Link from "next/link";
import Image from "next/image";
import AuthNav from "./auth-nav";
import ThemeToggle from "./theme-toggle";
import MobileNav, { type NavLink } from "./MobileNav";

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
];

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-(--surface)/85 backdrop-blur-md supports-backdrop-filter:bg-(--surface)/70">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          aria-label="WedPlan home"
          className="group flex shrink-0 items-center gap-2.5"
        >
          <Image
            src="/logo.png"
            alt="WedPlan logo"
            width={44}
            height={44}
            priority
            className="h-11 w-11 rounded-full bg-white object-contain p-1 shadow-sm ring-1 ring-(--brand)/20 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-heading hidden text-xl font-semibold tracking-tight text-(--text-primary) sm:block">
            Wed<span className="text-(--brand)">Plan</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative py-2 text-sm font-medium text-(--text-secondary) transition-colors hover:text-(--brand)"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-(--brand) transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <AuthNav />
          <ThemeToggle />
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
