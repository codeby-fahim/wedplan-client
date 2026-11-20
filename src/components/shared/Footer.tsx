import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

import { Separator } from "@/components/ui/separator";

const footerLinks = {
  explore: [
    { label: "Home", href: "/" },
    { label: "Browse Services", href: "/services" },
    { label: "Sign In", href: "/sign-in" },
    { label: "Sign Up", href: "/sign-up" },
  ],
  account: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile Settings", href: "/profile" },
  ],
};

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.24a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2Zm0 10.88a4.28 4.28 0 1 1 0-8.56 4.28 4.28 0 0 1 0 8.56Zm6.85-11.13a1.54 1.54 0 1 0 0 3.08 1.54 1.54 0 0 0 0-3.08Z",
  },
  {
    label: "X",
    href: "https://x.com",
    path: "M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.4L6.53 22H3.4l7.24-8.28L2.9 2h6.4l4.42 5.84L18.9 2Zm-1.1 18h1.72L7.25 3.89H5.4L17.8 20Z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    path: "M23.5 6.2a3 3 0 0 0-2.12-2.12C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.53A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.12 2.12c1.88.53 9.38.53 9.38.53s7.5 0 9.38-.53a3 3 0 0 0 2.12-2.12A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z",
  },
];

const currentYear = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="border-t border-(--brand)/15 bg-(--surface)">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + description */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link
              href="/"
              aria-label="WedPlan home"
              className="group inline-flex items-center gap-2.5"
            >
              <Image
                src="/logo.png"
                alt="WedPlan logo"
                width={44}
                height={44}
                className="size-11 rounded-full bg-white object-contain p-1 ring-1 ring-(--brand)/20 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-heading text-xl font-semibold tracking-tight text-(--text-primary)">
                Wed<span className="text-(--brand)">Plan</span>
              </span>
            </Link>

            <p className="muted-text mt-4 max-w-sm text-sm leading-relaxed">
              WedPlan helps couples bring their dream wedding to life. Discover
              trusted vendors, explore beautiful services, and plan every
              detail in one calm, elegant place.
            </p>

            <div className="mt-5 flex items-center gap-2.5">
              {socialLinks.map(({ label, href, path }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full border border-(--brand)/20 text-(--brand) transition-colors hover:border-(--brand) hover:bg-(--brand-soft)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4"
                    aria-hidden="true"
                  >
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Important links */}
          <div>
            <h3 className="font-heading text-sm font-semibold text-(--text-primary)">
              Explore
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="muted-text text-sm transition-colors hover:text-(--brand)"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h3 className="font-heading text-sm font-semibold text-(--text-primary)">
              Your Account
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="muted-text text-sm transition-colors hover:text-(--brand)"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-heading text-sm font-semibold text-(--text-primary)">
              Get in Touch
            </h3>
            <ul className="muted-text mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin
                  size={16}
                  className="mt-0.5 shrink-0 text-(--brand)"
                />
                <span>123 Wedding Avenue, Suite 200, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="shrink-0 text-(--brand)" />
                <a href="tel:+8801712345678" className="hover:text-(--brand)">
                  +880 1712 345 678
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="shrink-0 text-(--brand)" />
                <a
                  href="mailto:hello@wedplan.com"
                  className="hover:text-(--brand)"
                >
                  hello@wedplan.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="muted-text text-xs">
            © {currentYear} WedPlan. All rights reserved.
          </p>
          <p className="muted-text text-xs">
            Made with care for your special day.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
